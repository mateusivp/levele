"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { Order, Coupon, Product, Category, Customer } from "@/types";
import { formatPrice, slugify } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2, LayoutDashboard, Package, LogOut, ShoppingBag, TrendingUp, Users, Clock, Eye, Menu, X, Copy, Check, Search, RefreshCw, ArrowLeft, Settings, Edit2, MapPin, Phone, User, Calendar, CreditCard, History, Tag, Percent, Star, MessageSquare, ThumbsUp, ThumbsDown, ShoppingCart, FolderTree, Loader2, Coins } from "lucide-react";

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') as 'dashboard' | 'produtos' | 'pedidos' | 'cupons' | 'avaliacoes' | 'clientes' || 'dashboard';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [variations, setVariations] = useState<{ id: string; name: string; price: number; image?: string }[]>([]);
  const [newVariation, setNewVariation] = useState({ name: '', price: 0 });
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<any[]>([]);
  const [visits, setVisits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'produtos' | 'pedidos' | 'cupons' | 'avaliacoes' | 'abandonados' | 'categorias' | 'clientes'>(initialTab as any || 'dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<{id: string, message: string, time: string}[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean, message: string, tablesReady?: boolean } | null>(null);
  const [isInitializingDb, setIsInitializingDb] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const addNotification = (message: string) => {
    const newNotif = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 5));
  };

  // Estados para novo cupom
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [newCoupon, setNewCoupon] = useState<any>({
    code: "",
    discountType: "percentage",
    value: 0,
  });

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, type: 'category' | 'product' | 'coupon', id: string, name: string }>({
    isOpen: false,
    type: 'category',
    id: '',
    name: ''
  });
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: ""
  });

  const handleSaveCategory = async () => {
    if (!newCategory.name) {
      alert("O nome da categoria é obrigatório");
      return;
    }
    
    try {
      const categoryToSave = {
        id: editingCategory?.id || Math.random().toString(36).substr(2, 9),
        name: newCategory.name,
        slug: slugify(newCategory.name),
        description: newCategory.description
      };

      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryToSave)
      });

      if (res.ok) {
        addNotification(editingCategory ? "Categoria atualizada!" : "Categoria criada!");
        setIsAddingCategory(false);
        setEditingCategory(null);
        setNewCategory({ name: "", description: "" });
        
        // Pequeno atraso para garantir que o backend processou tudo
        setTimeout(() => {
          fetchData();
        }, 500);
      }
    } catch (error) {
      console.error("Erro ao salvar categoria", error);
    }
  };

  const handleInitializeDb = async () => {
    if (!confirm("Isso irá criar as tabelas necessárias no seu banco de dados Vercel Postgres. Deseja continuar?")) return;
    
    setIsInitializingDb(true);
    try {
      const res = await fetch("/api/init-db");
      const data = await res.json();
      
      if (data.success) {
        alert("Banco de dados inicializado com sucesso!");
        fetchData(); // Recarrega status
      } else {
        alert("Erro: " + data.error);
      }
    } catch (error) {
      alert("Falha ao inicializar banco de dados.");
    } finally {
      setIsInitializingDb(false);
    }
  };

  const handleDeleteCategory = (id: string, name: string) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'category',
      id,
      name
    });
  };

  const executeDelete = async () => {
    const { type, id } = deleteConfirm;
    
    try {
      if (type === 'category') {
        const res = await fetch(`/api/categories?id=${id}`, {
          method: "DELETE"
        });
        if (res.ok) {
          addNotification("Categoria excluída!");
          fetchData();
        }
      } else if (type === 'product') {
        const res = await fetch(`/api/products?id=${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          addNotification("Produto excluído!");
          setProducts(products.filter(p => p.id !== id));
        }
      } else if (type === 'coupon') {
        const res = await fetch("/api/coupons", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: id }),
        });
        if (res.ok) {
          addNotification("Cupom excluído!");
          setCoupons(coupons.filter(c => c.code !== id));
        }
      }
    } catch (error) {
      console.error(`Erro ao deletar ${type}`, error);
      addNotification(`Erro ao excluir ${type === 'coupon' ? 'cupom' : type === 'category' ? 'categoria' : 'produto'}`);
    } finally {
      setDeleteConfirm({ ...deleteConfirm, isOpen: false });
    }
  };

  const handleOpenOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (!auth) {
      router.push("/admin/login");
      return;
    }

    const tab = searchParams.get('tab');
    if (tab && (tab === 'dashboard' || tab === 'produtos' || tab === 'pedidos' || tab === 'cupons' || tab === 'avaliacoes' || tab === 'abandonados' || tab === 'categorias' || tab === 'clientes')) {
      setActiveTab(tab as any);
    }
    
    fetchData();
  }, [searchParams, router]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleTabChange = (tab: 'dashboard' | 'produtos' | 'pedidos' | 'cupons' | 'avaliacoes' | 'abandonados' | 'categorias') => {
    if (tab === activeTab) return;
    
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`/admin?${params.toString()}`, { scroll: false });
  };

  const fetchData = async () => {
    // Cancelar requisições anteriores se houver
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    setIsLoading(true);
    try {
      // Verificar status do banco de dados primeiro
      const dbRes = await fetch("/api/db-status", { cache: 'no-store' });
      if (dbRes.ok) {
        const dbData = await dbRes.json();
        setDbStatus(dbData);
      }

      const res = await fetch(`/api/admin/data?t=${Date.now()}`, { 
        cache: 'no-store', 
        signal: controller.signal 
      });
      
      if (!res.ok) throw new Error("Erro ao carregar dados");
      
      const data = await res.json();
      console.log("Dados recebidos do admin:", data.categories);
      
      setProducts(data.products || []);
      setOrders(data.orders || []);
      setCoupons(data.coupons || []);
      setCustomers(data.customers || []);
      setAbandonedCarts(data.abandonedCarts || []);
      setVisits(data.visits || 0);
      setCategories(data.categories || []);
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Silencioso para abortos
      } else {
        console.error("Erro ao buscar dados", error);
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCoupon),
      });
      if (res.ok) {
        addNotification(editingCoupon ? "Cupom atualizado!" : "Cupom criado!");
        fetchData();
        setIsAddingCoupon(false);
        setEditingCoupon(null);
        setNewCoupon({ code: "", discountType: "percentage", value: 0 });
      } else {
        const error = await res.json();
        addNotification(error.error || "Erro ao salvar cupom");
      }
    } catch (error) {
      console.error("Erro ao salvar cupom", error);
      addNotification("Erro ao conectar com o servidor");
    }
  };

  const handleDeleteCoupon = (code: string) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'coupon',
      id: code,
      name: code
    });
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(updatedOrder);
        }
        addNotification(`Pedido #${orderId.slice(-4)} atualizado para ${newStatus}`);
      }
    } catch (error) {
      console.error("Erro ao atualizar status", error);
    }
  };

  const handleUpdateReviewStatus = async (productId: string, reviewId: string, newStatus: 'aprovada' | 'rejeitada') => {
    try {
      const res = await fetch("/api/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, reviewId, status: newStatus }),
      });
      if (res.ok) {
        setProducts(products.map(p => {
          if (p.id === productId) {
            return {
              ...p,
              reviews: p.reviews?.map(r => r.id === reviewId ? { ...r, status: newStatus } : r)
            };
          }
          return p;
        }));
        addNotification(`Avaliação ${newStatus === 'aprovada' ? 'aprovada' : 'rejeitada'} com sucesso!`);
      }
    } catch (error) {
      console.error("Erro ao atualizar status da avaliação", error);
    }
  };

  const handleDeleteReview = async (productId: string, reviewId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta avaliação?")) return;
    
    try {
      const res = await fetch(`/api/reviews?productId=${productId}&reviewId=${reviewId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProducts(products.map(p => {
          if (p.id === productId) {
            return {
              ...p,
              reviews: p.reviews?.filter(r => r.id !== reviewId)
            };
          }
          return p;
        }));
        addNotification(`Avaliação excluída com sucesso!`);
      }
    } catch (error) {
      console.error("Erro ao excluir avaliação", error);
    }
  };

  const handleDeleteAbandoned = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este carrinho?")) return;
    
    try {
      const res = await fetch(`/api/abandoned?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAbandonedCarts(abandonedCarts.filter(c => c.id !== id));
        addNotification(`Carrinho excluído com sucesso!`);
      }
    } catch (error) {
      console.error("Erro ao excluir carrinho", error);
    }
  };

  const allReviews = products.flatMap(p => 
    (p.reviews || []).map(r => ({ ...r, productName: p.name, productId: p.id }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const metrics = {
    totalSales: orders.filter(o => o.status === 'Entregue').reduce((acc, o) => acc + o.total, 0),
    pendingOrders: orders.filter(o => o.status === 'Novo').length,
    totalProducts: products.length,
    expeditionOrders: orders.filter(o => o.status === 'Expedição').length,
    abandonedCarts: abandonedCarts.length,
    visits: visits,
    totalCustomers: customers.length,
    totalCashback: customers.reduce((acc, c) => acc + (c.cashback || 0), 0),
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    router.push("/admin/login");
  };

  const handleCopyLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/produto/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'product',
      id,
      name
    });
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Modal de Confirmação de Exclusão */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-background border rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-xl font-bold mb-2">Confirmar Exclusão</h3>
              <p className="text-muted-foreground mb-6">
                Tem certeza que deseja excluir {deleteConfirm.type === 'category' ? 'a categoria' : deleteConfirm.type === 'coupon' ? 'o cupom' : 'o produto'} <strong>"{deleteConfirm.name}"</strong>? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
                  className="flex-1 px-4 py-2 border rounded-xl hover:bg-muted transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={executeDelete}
                  className="flex-1 px-4 py-2 bg-destructive text-white rounded-xl hover:bg-destructive/90 transition-colors font-medium"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Pedido */}
      {isOrderModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-background border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  Pedido <span className="text-primary">#{selectedOrder.id}</span>
                </h2>
                <p className="text-muted-foreground text-sm">
                  Realizado em {new Date(selectedOrder.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
              <button 
                onClick={() => setIsOrderModalOpen(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Coluna Esquerda: Itens e Totais */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    Produtos
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-4 bg-muted/30 rounded-xl border border-border/50">
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {item.productName}
                            {(item as any).variationName && (
                              <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                {(item as any).variationName}
                              </span>
                            )}
                            {item.isBump && (
                              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                Order Bump
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity}x R$ {item.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-bold">R$ {(item.quantity * item.price).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/20 p-6 rounded-2xl border border-dashed space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>R$ {selectedOrder.total.toFixed(2)}</span>
                  </div>
                  {selectedOrder.discount && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span>Cupom ({selectedOrder.discount.code})</span>
                      <span>- R$ {selectedOrder.discount.amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-black pt-2 border-t border-border/50">
                    <span>Total</span>
                    <span className="text-primary">R$ {(selectedOrder.total - (selectedOrder.discount?.amount || 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Coluna Direita: Cliente, Endereço e Status */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Dados do Cliente
                  </h3>
                  <div className="space-y-4 bg-muted/30 p-5 rounded-xl border border-border/50">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Nome Completo</p>
                        <p className="font-medium">{selectedOrder.customer.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Telefone</p>
                        <p className="font-medium">{selectedOrder.customer.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Endereço de Entrega
                  </h3>
                  <div className="bg-muted/30 p-5 rounded-xl border border-border/50">
                    <p className="font-medium">{selectedOrder.customer.address?.street}, {selectedOrder.customer.address?.number}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.customer.address?.neighborhood} - {selectedOrder.customer.address?.city}/{selectedOrder.customer.address?.state}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">CEP: {selectedOrder.customer.address?.cep}</p>
                    {selectedOrder.customer.address?.complement && (
                      <p className="text-sm text-primary mt-2 italic">Ref: {selectedOrder.customer.address.complement}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Histórico de Status
                  </h3>
                  <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                    {selectedOrder.statusHistory?.slice().reverse().map((h, idx) => (
                      <div key={idx} className="relative">
                        <div className={`absolute -left-[19px] top-1.5 w-3 h-3 rounded-full border-2 border-background ${idx === 0 ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`} />
                        <div>
                          <p className={`font-bold text-sm ${idx === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                            {h.status}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(h.date).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="text-sm font-bold text-muted-foreground">Alterar Status:</p>
                <select 
                  className="bg-muted border rounded-lg px-4 py-2 font-medium focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value as any)}
                >
                  <option value="Novo">Novo</option>
                  <option value="Expedição">Expedição</option>
                  <option value="Enviado">Enviado</option>
                  <option value="Entregue">Entregue</option>
                </select>
              </div>
              <button 
                onClick={() => setIsOrderModalOpen(false)}
                className="bg-primary text-primary-foreground px-8 py-2 rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Sidebar Admin (Desktop) */}
      <aside className="w-64 bg-card border-r hidden md:block flex-shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-bold text-primary">Levele Admin</h2>
        </div>
        <nav className="px-4 space-y-2">
          <button 
            onClick={() => handleTabChange('dashboard')}
            className={`flex w-full items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </button>
          <button 
            onClick={() => handleTabChange('pedidos')}
            className={`flex w-full items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'pedidos' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
          >
            <ShoppingBag className="h-5 w-5" />
            Pedidos
          </button>
          <button 
            onClick={() => handleTabChange('clientes')}
            className={`flex w-full items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'clientes' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
          >
            <Users className="h-5 w-5" />
            Clientes
          </button>
          <button 
                onClick={() => handleTabChange('produtos')}
                className={`flex w-full items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'produtos' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <Package className="h-5 w-5" />
                Produtos
              </button>
              <button 
                onClick={() => handleTabChange('categorias')}
                className={`flex w-full items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'categorias' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <FolderTree className="h-5 w-5" />
                Categorias
              </button>
              <button 
                onClick={() => handleTabChange('cupons')}
                className={`flex w-full items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'cupons' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <Tag className="h-5 w-5" />
                Cupons
              </button>
              <button 
                onClick={() => handleTabChange('avaliacoes')}
                className={`flex w-full items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'avaliacoes' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <MessageSquare className="h-5 w-5" />
                Avaliações
              </button>
              <button 
                onClick={() => handleTabChange('abandonados')}
                className={`flex w-full items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'abandonados' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <ShoppingCart className="h-5 w-5" />
                Abandonados
              </button>
          
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors mt-8 text-destructive"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-card border-b z-50 flex items-center justify-between p-4">
        <h2 className="text-lg font-bold text-primary">Levele Admin</h2>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-64 h-full bg-card p-6 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="mb-8">
              <h2 className="text-xl font-bold text-primary">Levele Admin</h2>
            </div>
            <nav className="space-y-2">
              <button 
                onClick={() => { handleTabChange('dashboard'); setIsMobileMenuOpen(false); }}
                className={`flex w-full items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </button>
              <button 
                onClick={() => { handleTabChange('pedidos'); setIsMobileMenuOpen(false); }}
                className={`flex w-full items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'pedidos' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <ShoppingBag className="h-5 w-5" />
                Pedidos
              </button>
              <button 
                onClick={() => { handleTabChange('clientes'); setIsMobileMenuOpen(false); }}
                className={`flex w-full items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'clientes' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <Users className="h-5 w-5" />
                Clientes
              </button>
              <button 
                onClick={() => { handleTabChange('produtos'); setIsMobileMenuOpen(false); }}
                className={`flex w-full items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'produtos' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <Package className="h-5 w-5" />
                Produtos
              </button>
              <button 
                onClick={() => { handleTabChange('categorias'); setIsMobileMenuOpen(false); }}
                className={`flex w-full items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'categorias' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <FolderTree className="h-5 w-5" />
                Categorias
              </button>
              <button 
                onClick={() => { handleTabChange('cupons'); setIsMobileMenuOpen(false); }}
                className={`flex w-full items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'cupons' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <Tag className="h-5 w-5" />
                Cupons
              </button>
              <button 
                onClick={() => { handleTabChange('avaliacoes'); setIsMobileMenuOpen(false); }}
                className={`flex w-full items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'avaliacoes' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <MessageSquare className="h-5 w-5" />
                Avaliações
              </button>
              <button 
                onClick={() => { handleTabChange('abandonados'); setIsMobileMenuOpen(false); }}
                className={`flex w-full items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'abandonados' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <ShoppingCart className="h-5 w-5" />
                Abandonados
              </button>
              
              <button 
                onClick={handleLogout}
                className="flex w-full items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors mt-8 text-destructive"
              >
                <LogOut className="h-5 w-5" />
                Sair
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-8 pt-20 md:pt-8 overflow-auto">
        <div className="flex justify-end mb-4 gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-muted rounded-lg transition-colors relative"
              title="Notificações"
            >
              <Clock className="h-5 w-5 text-muted-foreground" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-card border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-3 border-b bg-muted/30">
                  <h3 className="font-bold text-sm">Notificações Recentes</h3>
                </div>
                <div className="max-h-80 overflow-auto">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div key={n.id} className="p-3 border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <p className="text-xs font-medium">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <p className="text-xs">Nenhuma notificação</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
            title="Recarregar Dados"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Atualizando...' : 'Sincronizar Dados'}
          </button>
        </div>
        {activeTab === 'cupons' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Cupons de Desconto</h1>
                <p className="text-muted-foreground">Gerencie seus códigos promocionais.</p>
              </div>
              <button 
                onClick={() => {
                  setEditingCoupon(null);
                  setNewCoupon({ code: "", discountType: "percentage", value: 0 });
                  setIsAddingCoupon(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Plus className="h-5 w-5" />
                Novo Cupom
              </button>
            </div>

            {isAddingCoupon && (
              <div className="bg-card p-6 rounded-xl border animate-in fade-in slide-in-from-top-4 duration-300">
                <form onSubmit={handleSaveCoupon} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium mb-1">Código</label>
                    <input 
                      type="text" 
                      required
                      placeholder="EX: VERÃO20"
                      className="w-full bg-background border rounded-lg px-4 py-2 uppercase disabled:opacity-50"
                      value={newCoupon.code}
                      onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                      disabled={!!editingCoupon}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo de Desconto</label>
                    <select 
                      className="w-full bg-background border rounded-lg px-4 py-2"
                      value={newCoupon.discountType}
                      onChange={e => setNewCoupon({...newCoupon, discountType: e.target.value as any})}
                    >
                      <option value="percentage">Porcentagem (%)</option>
                      <option value="fixed">Valor Fixo (R$)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Valor</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      className="w-full bg-background border rounded-lg px-4 py-2"
                      value={newCoupon.value}
                      onChange={e => setNewCoupon({...newCoupon, value: Number(e.target.value)})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="submit"
                      className="flex-1 bg-primary text-primary-foreground h-10 rounded-lg font-bold hover:opacity-90 transition-opacity"
                    >
                      {editingCoupon ? 'Atualizar' : 'Salvar'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setIsAddingCoupon(false);
                        setEditingCoupon(null);
                        setNewCoupon({ code: "", discountType: "percentage", value: 0 });
                      }}
                      className="flex-1 bg-muted h-10 rounded-lg font-bold hover:bg-muted/80 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-card rounded-xl border overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="p-4 font-bold text-sm">Código</th>
                    <th className="p-4 font-bold text-sm">Tipo</th>
                    <th className="p-4 font-bold text-sm">Valor</th>
                    <th className="p-4 font-bold text-sm text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {coupons.map((coupon) => (
                    <tr key={coupon.code} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        {coupon.discountType === 'percentage' ? 'Porcentagem' : 'Valor Fixo'}
                      </td>
                      <td className="p-4 font-bold">
                        {coupon.discountType === 'percentage' ? `${coupon.value}%` : formatPrice(coupon.value)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => {
                              setEditingCoupon(coupon);
                              setNewCoupon({ 
                                code: coupon.code, 
                                discountType: coupon.discountType, 
                                value: coupon.value 
                              });
                              setIsAddingCoupon(true);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Editar Cupom"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCoupon(coupon.code)}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            title="Excluir Cupom"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {coupons.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground italic">
                        Nenhum cupom cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'categorias' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Categorias</h1>
                <p className="text-muted-foreground">Gerencie as categorias de produtos da sua loja.</p>
              </div>
              <button 
                onClick={() => {
                  setEditingCategory(null);
                  setNewCategory({ name: "", description: "" });
                  setIsAddingCategory(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
              >
                <Plus className="h-5 w-5" />
                NOVA CATEGORIA
              </button>
            </div>

            {isAddingCategory && (
              <div className="bg-card p-6 rounded-2xl border-2 border-primary/20 shadow-xl animate-in slide-in-from-top duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FolderTree className="h-5 w-5 text-primary" />
                    {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                  </h2>
                  <button onClick={() => setIsAddingCategory(false)} className="p-2 hover:bg-muted rounded-full">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-2">Nome da Categoria</label>
                    <input 
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                      className="w-full h-12 px-4 rounded-xl border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                      placeholder="Ex: Eletrônicos, Casa e Jardim..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Descrição (Opcional)</label>
                    <input 
                      type="text"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                      className="w-full h-12 px-4 rounded-xl border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                      placeholder="Breve descrição da categoria"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-8">
                  <button 
                    onClick={() => setIsAddingCategory(false)}
                    className="px-6 py-2 rounded-xl font-bold hover:bg-muted transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSaveCategory}
                    disabled={!newCategory.name}
                    className="bg-primary text-primary-foreground px-8 py-2 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {editingCategory ? 'SALVAR ALTERAÇÕES' : 'CRIAR CATEGORIA'}
                  </button>
                </div>
              </div>
            )}

            <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="p-4 font-bold text-sm uppercase tracking-wider">Nome</th>
                      <th className="p-4 font-bold text-sm uppercase tracking-wider">Slug</th>
                      <th className="p-4 font-bold text-sm uppercase tracking-wider">Produtos</th>
                      <th className="p-4 font-bold text-sm uppercase tracking-wider text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <div className="font-bold">{cat.name}</div>
                            {cat.description && <div className="text-xs text-muted-foreground">{cat.description}</div>}
                          </td>
                          <td className="p-4">
                            <code className="text-xs bg-muted px-2 py-1 rounded">/{cat.slug}</code>
                          </td>
                          <td className="p-4 text-sm font-medium">
                            {products.filter(p => p.category === cat.name).length} itens
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => {
                                  setEditingCategory(cat);
                                  setNewCategory({ name: cat.name, description: cat.description || "" });
                                  setIsAddingCategory(true);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteCategory(cat.id, cat.name);
                                }}
                                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-muted-foreground">
                          <FolderTree className="h-12 w-12 mx-auto mb-4 opacity-20" />
                          <p>Nenhuma categoria cadastrada.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'avaliacoes' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Avaliações</h1>
                <p className="text-muted-foreground">Gerencie as avaliações dos seus produtos.</p>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={fetchData}
                  className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground flex items-center gap-2 text-sm border bg-card"
                  title="Atualizar Dados"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </button>
                <div className="bg-card px-4 py-2 rounded-lg border flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-yellow-400 rounded-full" />
                    <span className="text-sm font-medium">{allReviews.filter(r => r.status === 'pendente').length} Pendentes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium">{allReviews.filter(r => r.status === 'aprovada').length} Aprovadas</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {allReviews.length > 0 ? (
                allReviews.map((review) => (
                  <div key={`${review.productId}-${review.id}`} className="bg-card p-6 rounded-xl border flex flex-col md:flex-row gap-6 items-start md:items-center">
                    {review.image && (
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 border">
                        <Image src={review.image} alt={review.userName} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-bold truncate">{review.userName}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          review.status === 'pendente' ? 'bg-yellow-400/10 text-yellow-600' :
                          review.status === 'aprovada' ? 'bg-green-500/10 text-green-600' :
                          'bg-red-500/10 text-red-600'
                        }`}>
                          {review.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Package className="h-3 w-3" /> {review.productName}
                      </p>
                      <div className="flex text-yellow-400 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-muted'}`} />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground italic line-clamp-2">"{review.comment}"</p>
                    </div>
                    
                    <div className="flex gap-2 shrink-0">
                      {review.status === 'pendente' && (
                        <>
                          <button 
                            onClick={() => handleUpdateReviewStatus(review.productId, review.id, 'aprovada')}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-600 transition-colors text-sm"
                          >
                            <ThumbsUp className="h-4 w-4" /> Aprovar
                          </button>
                          <button 
                            onClick={() => handleUpdateReviewStatus(review.productId, review.id, 'rejeitada')}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-600 transition-colors text-sm"
                          >
                            <ThumbsDown className="h-4 w-4" /> Rejeitar
                          </button>
                        </>
                      )}
                      {review.status !== 'pendente' && (
                        <button 
                          onClick={() => handleUpdateReviewStatus(review.productId, review.id, review.status === 'aprovada' ? 'rejeitada' : 'aprovada')}
                          className="bg-muted text-muted-foreground px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-muted/80 transition-colors text-sm"
                        >
                          Alterar para {review.status === 'aprovada' ? 'Rejeitada' : 'Aprovada'}
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteReview(review.productId, review.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Excluir Avaliação"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-card p-12 rounded-xl border text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Nenhuma avaliação encontrada.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'clientes' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Clientes</h1>
                <p className="text-muted-foreground">Gerencie sua base de clientes e programa de fidelidade.</p>
              </div>
            </div>

            <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="p-4 font-bold text-sm">Cliente</th>
                    <th className="p-4 font-bold text-sm">Contato</th>
                    <th className="p-4 font-bold text-sm">Fidelidade</th>
                    <th className="p-4 font-bold text-sm">Desde</th>
                    <th className="p-4 font-bold text-sm text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{customer.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{customer.level}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="text-sm flex items-center gap-2">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {customer.phone}
                          </p>
                          {customer.email && (
                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                              <Search className="h-3 w-3" />
                              {customer.email}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Cashback</p>
                            <p className="text-green-600 font-black text-sm">{formatPrice(customer.cashback)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Pontos</p>
                            <p className="text-primary font-black text-sm">{customer.points.toLocaleString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {new Date(customer.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={async () => {
                            if (confirm(`Deseja excluir o cliente ${customer.name}?`)) {
                              const res = await fetch(`/api/admin/customers?id=${customer.id}`, { method: 'DELETE' });
                              if (res.ok) {
                                addNotification("Cliente excluído!");
                                fetchData();
                              }
                            }
                          }}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Excluir Cliente"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="h-12 w-12 opacity-20" />
                          <p className="italic">Nenhum cliente cadastrado ainda.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'abandonados' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Carrinhos Abandonados</h1>
                <p className="text-muted-foreground">Clientes que iniciaram o checkout mas não finalizaram.</p>
              </div>
              <button 
                onClick={fetchData}
                className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground flex items-center gap-2 text-sm border bg-card"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>

            <div className="bg-card rounded-xl border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="p-4 font-bold text-sm uppercase tracking-wider">Cliente</th>
                      <th className="p-4 font-bold text-sm uppercase tracking-wider">Produto / Total</th>
                      <th className="p-4 font-bold text-sm uppercase tracking-wider">Data / Hora</th>
                      <th className="p-4 font-bold text-sm uppercase tracking-wider text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {abandonedCarts.length > 0 ? (
                      abandonedCarts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((cart) => (
                        <tr key={cart.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">{cart.customer.name}</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {cart.customer.phone}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium truncate max-w-[200px]" title={cart.productName}>
                                {cart.productName}
                              </span>
                              {cart.variationName && (
                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase font-bold w-fit mt-1">
                                  {cart.variationName}
                                </span>
                              )}
                              <span className="text-sm font-bold text-primary mt-1">{formatPrice(cart.total)}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col text-xs text-muted-foreground">
                              <span>{new Date(cart.createdAt).toLocaleDateString('pt-BR')}</span>
                              <span>{new Date(cart.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <a 
                                href={`https://api.whatsapp.com/send?phone=55${cart.customer.phone.replace(/\D/g, '')}&text=Olá ${cart.customer.name.split(' ')[0]}, vi que você se interessou pelo ${cart.productName} em nossa loja! Posso te ajudar a finalizar seu pedido?`}
                                target="_blank"
                                className="bg-[#25D366] text-white p-2 rounded-lg hover:opacity-90 transition-opacity"
                                title="Recuperar via WhatsApp"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </a>
                              <button 
                                onClick={() => handleDeleteAbandoned(cart.id)}
                                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-muted-foreground">
                          <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-20" />
                          <p>Nenhum carrinho abandonado encontrado.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Visão geral do seu negócio.</p>
              </div>

              {/* Status do Banco de Dados */}
              <div className={`p-4 rounded-xl border flex flex-col gap-2 min-w-[300px] ${
                dbStatus?.connected 
                  ? 'bg-green-500/5 border-green-500/20' 
                  : 'bg-destructive/5 border-destructive/20'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${dbStatus?.connected ? 'bg-green-500' : 'bg-destructive'}`} />
                    <span className="text-sm font-bold">
                      {dbStatus?.connected ? 'Banco de Dados Conectado' : 'Banco de Dados Desconectado'}
                    </span>
                  </div>
                  {!dbStatus?.connected && (
                    <button 
                      onClick={handleInitializeDb}
                      disabled={isInitializingDb}
                      className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                      {isInitializingDb ? 'Inicializando...' : 'Configurar Agora'}
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dbStatus?.message || "Verificando conexão com o banco de dados..."}
                </p>
                {dbStatus?.connected && !dbStatus.tablesReady && (
                  <button 
                    onClick={handleInitializeDb}
                    disabled={isInitializingDb}
                    className="w-full mt-1 text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg font-bold hover:bg-primary/20 transition-all"
                  >
                    {isInitializingDb ? 'Criando tabelas...' : 'Criar Tabelas Faltantes'}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-xl border">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vendas (Entregues)</p>
                    <h3 className="text-2xl font-bold">{formatPrice(metrics.totalSales)}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <ShoppingBag className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pedidos Novos</p>
                    <h3 className="text-2xl font-bold">{metrics.pendingOrders}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-primary/20 bg-primary/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Visitas na Página</p>
                    <h3 className="text-2xl font-bold">{metrics.visits}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Em Expedição</p>
                    <h3 className="text-2xl font-bold">{metrics.expeditionOrders}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-orange-500/20 bg-orange-500/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Carrinhos Abandonados</p>
                    <h3 className="text-2xl font-bold">{metrics.abandonedCarts}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-purple-500/20 bg-purple-500/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Users className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Clientes</p>
                    <h3 className="text-2xl font-bold">{metrics.totalCustomers}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-green-500/20 bg-green-500/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Coins className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cashback Distribuído</p>
                    <h3 className="text-2xl font-bold">{formatPrice(metrics.totalCashback)}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <Package className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Produtos Ativos</p>
                    <h3 className="text-2xl font-bold">{metrics.totalProducts}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-primary/20 bg-primary/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Clientes</p>
                    <h3 className="text-2xl font-bold">{metrics.totalCustomers}</h3>
                  </div>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Star className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cashback Acumulado</p>
                    <h3 className="text-2xl font-bold">{formatPrice(metrics.totalCashback)}</h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-card rounded-xl border p-6">
                <h2 className="text-xl font-bold mb-4">Últimos Pedidos</h2>
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{order.customer.name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatPrice(order.total)}</p>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          order.status === 'Novo' ? 'bg-blue-500/10 text-blue-500' :
                          order.status === 'Enviado' ? 'bg-orange-500/10 text-orange-500' :
                          order.status === 'Entregue' ? 'bg-green-500/10 text-green-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && <p className="text-center text-muted-foreground py-4">Sem pedidos recentes.</p>}
                </div>
              </div>

              <div className="bg-card rounded-xl border p-6">
                <h2 className="text-xl font-bold mb-4">Status de Pedidos</h2>
                <div className="space-y-6">
                  {['Novo', 'Enviado', 'Entregue', 'Expedição'].map((status) => {
                    const count = orders.filter(o => o.status === status).length;
                    const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium">{status}</span>
                          <span className="text-muted-foreground">{count} pedidos</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              status === 'Novo' ? 'bg-blue-500' :
                              status === 'Enviado' ? 'bg-orange-500' :
                              status === 'Entregue' ? 'bg-green-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pedidos' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold">Gerenciar Pedidos</h1>
                <p className="text-muted-foreground">Acompanhe e atualize o status das suas vendas.</p>
              </div>
            </div>

            <div className="bg-card rounded-xl border overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="p-4 font-bold text-sm uppercase tracking-wider">ID / Data</th>
                    <th className="p-4 font-bold text-sm uppercase tracking-wider">Cliente / Tel</th>
                    <th className="p-4 font-bold text-sm uppercase tracking-wider">Endereço</th>
                    <th className="p-4 font-bold text-sm uppercase tracking-wider">Valor / Entrega</th>
                    <th className="p-4 font-bold text-sm uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">Carregando pedidos...</td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">Nenhum pedido recebido ainda.</td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr 
                        key={order.id} 
                        className="hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => handleOpenOrderDetails(order)}
                      >
                        <td className="p-4">
                          <div className="text-sm font-bold">{order.id}</div>
                          <div className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{order.customer.name}</div>
                          <div className="text-xs text-muted-foreground">{order.customer.phone}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-xs max-w-[200px] truncate" title={`${order.customer.address?.street || ''}, ${order.customer.address?.number || ''}`}>
                            {order.customer.address?.street || 'Endereço não informado'}, {order.customer.address?.number || ''}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {order.customer.address?.neighborhood || ''} - {order.customer.address?.city || ''}/{order.customer.address?.state || ''}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-primary">{formatPrice(order.total)}</div>
                          <div className="text-[10px] flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(order.deliveryDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          <select 
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                            className={`text-xs font-bold px-2 py-1 rounded-lg border bg-background outline-none ${
                              order.status === 'Novo' ? 'text-blue-500 border-blue-500/20' :
                              order.status === 'Enviado' ? 'text-orange-500 border-orange-500/20' :
                              order.status === 'Entregue' ? 'text-green-500 border-green-500/20' :
                              'text-red-500 border-red-500/20'
                            }`}
                          >
                            <option value="Novo">Novo</option>
                            <option value="Enviado">Enviado</option>
                            <option value="Entregue">Entregue</option>
                            <option value="Expedição">Expedição</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'produtos' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold">Gerenciar Produtos</h1>
                <p className="text-muted-foreground">Adicione, edite ou remova produtos da sua loja.</p>
              </div>
              <Link 
                href="/admin/produtos/novo" 
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Novo Produto
              </Link>
            </div>

            <div className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Buscar produtos por nome ou categoria..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border bg-card focus:ring-2 focus:ring-primary outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="bg-card rounded-xl border overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="p-4 font-bold text-sm uppercase tracking-wider">Produto</th>
                    <th className="p-4 font-bold text-sm uppercase tracking-wider">Categoria</th>
                    <th className="p-4 font-bold text-sm uppercase tracking-wider">Preço</th>
                    <th className="p-4 font-bold text-sm uppercase tracking-wider">Status</th>
                    <th className="p-4 font-bold text-sm uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">Carregando produtos...</td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">Nenhum produto encontrado.</td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 rounded border overflow-hidden bg-white">
                              <img src={product.image} alt={product.name} className="object-cover h-full w-full" />
                            </div>
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-semibold bg-muted px-2 py-1 rounded">{product.category}</span>
                        </td>
                        <td className="p-4 font-bold text-primary">{formatPrice(product.price)}</td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${product.active ? 'bg-green-100 text-green-700' : 'bg-destructive/10 text-destructive'}`}>
                            {product.active ? 'ATIVO' : 'DESATIVADO'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleCopyLink(product.slug, product.id)}
                              className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary transition-colors"
                              title="Copiar Link do Produto"
                            >
                              {copiedId === product.id ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                            </button>
                            <Link 
                              href={`/produto/${product.slug}`}
                              target="_blank"
                              className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-blue-500 transition-colors"
                              title="Visualizar Produto"
                            >
                              <Eye className="h-5 w-5" />
                            </Link>
                            <Link 
                              href={`/admin/produtos/editar/${product.id}`}
                              className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Edit className="h-5 w-5" />
                            </Link>
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDelete(product.id, product.name);
                              }}
                              className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}
