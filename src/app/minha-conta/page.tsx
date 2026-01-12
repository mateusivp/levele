"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ShoppingBag, 
  User, 
  Package, 
  RefreshCcw, 
  Heart, 
  Gift, 
  MessageSquare, 
  ChevronRight, 
  Star, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  LogOut,
  Wallet,
  Tag,
  ThumbsUp,
  MapPin,
  Bell,
  ShoppingCart,
  Phone,
  Lock,
  Loader2,
  AlertCircle,
  Key,
  LayoutDashboard,
  X,
  Zap,
  TrendingUp,
  Flame,
  Truck,
  CreditCard,
  CheckCircle
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useRouter } from "next/navigation";

// Componente de Modal de Confirmação para Compra Rápida
function QuickBuyModal({ 
  isOpen, 
  onClose, 
  product, 
  onConfirm, 
  addresses,
  selectedAddressId,
  onSelectAddress,
  onEditAddress 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  product: any, 
  onConfirm: (address: any) => void,
  addresses: any[],
  selectedAddressId: string | null,
  onSelectAddress: (id: string) => void,
  onEditAddress: () => void
}) {
  if (!isOpen || !product) return null;

  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];
  const isAddressComplete = selectedAddress && selectedAddress.cep && selectedAddress.street && selectedAddress.number;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white max-w-md w-full rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="relative h-48 bg-muted/50">
          {product.image ? (
            <Image src={product.image} alt={product.name} fill className="object-contain p-6" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Package className="h-16 w-16 text-muted-foreground/20" />
            </div>
          )}
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full transition-all shadow-sm">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-8 text-center">
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-4">
            Confirmação de Pedido
          </div>
          <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Finalizar Pedido Agora?</h3>
          
          <div className="bg-muted/30 p-4 rounded-2xl mb-6 text-left border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-muted-foreground font-bold uppercase">Endereço de Entrega</p>
              <button 
                onClick={onEditAddress}
                className="text-[10px] font-black text-primary uppercase hover:underline"
              >
                Gerenciar
              </button>
            </div>

            {addresses.length > 0 ? (
              <div className="space-y-3">
                <div className="relative">
                  <select 
                    value={selectedAddressId || ""} 
                    onChange={(e) => onSelectAddress(e.target.value)}
                    className="w-full bg-white border rounded-xl px-4 py-3 text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {addresses.map(addr => (
                      <option key={addr.id} value={addr.id}>
                        {addr.label || 'Endereço'} - {addr.street}, {addr.number}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rotate-90 pointer-events-none" />
                </div>

                {selectedAddress && (
                  <div className="flex gap-3 px-1">
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold leading-tight">{selectedAddress.street}, {selectedAddress.number}</p>
                      <p className="text-[10px] text-muted-foreground">{selectedAddress.neighborhood} - {selectedAddress.city}/{selectedAddress.state}</p>
                      <p className="text-[10px] text-muted-foreground">CEP: {selectedAddress.cep}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center py-2 gap-2">
                <p className="text-xs font-bold text-red-500">Nenhum endereço cadastrado!</p>
                <button 
                  onClick={onEditAddress}
                  className="text-xs bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold hover:bg-primary/20 transition-all"
                >
                  CADASTRAR ENDEREÇO
                </button>
              </div>
            )}
          </div>
          
          <div className="bg-muted/30 p-4 rounded-2xl mb-8 flex justify-between items-center border">
            <div className="text-left">
              <p className="text-[10px] text-muted-foreground font-bold uppercase">Total do Pedido</p>
              <p className="text-xl font-black text-primary">{formatPrice(product.price)}</p>
              <p className="text-[10px] text-green-600 font-bold uppercase">Frete Grátis</p>
            </div>
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-primary/20 flex items-center justify-center"><ShieldCheck className="h-4 w-4 text-primary" /></div>
              <div className="w-8 h-8 rounded-full bg-white border-2 border-primary/20 flex items-center justify-center"><Truck className="h-4 w-4 text-primary" /></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={onClose}
              className="h-12 rounded-xl font-bold text-muted-foreground hover:bg-muted transition-all"
            >
              CANCELAR
            </button>
            <button 
              onClick={() => onConfirm(selectedAddress)}
              disabled={!isAddressComplete}
              className={`h-12 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                isAddressComplete 
                ? "bg-primary text-primary-foreground hover:scale-105 shadow-primary/20" 
                : "bg-muted text-muted-foreground cursor-not-allowed shadow-none"
              }`}
            >
              CONFIRMAR
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de Modal de Sucesso para Compra Direta
function DirectPurchaseSuccessModal({ 
  isOpen, 
  onClose, 
  product,
  address 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  product: any,
  address: any 
}) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white max-w-md w-full rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 text-center">
        <div className="p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-black mb-2 uppercase italic tracking-tight text-primary">Pedido Realizado!</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Sua compra do item <strong>{product.name}</strong> foi processada com sucesso.
          </p>
          
          <div className="bg-muted/30 p-4 rounded-2xl mb-8 border text-left space-y-3">
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Entregar em:</p>
              <p className="text-xs font-bold">{address?.street}, {address?.number}</p>
              <p className="text-[10px] text-muted-foreground">{address?.neighborhood} - {address?.city}/{address?.state}</p>
            </div>
            <div className="pt-2 border-t border-muted-foreground/10">
              <div className="flex items-center gap-3">
                <Package className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider">Status: Preparando Envio</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Você receberá atualizações via WhatsApp em breve.</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-primary/20"
          >
            ENTENDI
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente de Modal para Adicionar/Editar Endereço
function AddressModal({ 
  isOpen, 
  onClose, 
  address, 
  onSave 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  address: any, 
  onSave: (address: any) => void 
}) {
  const [formData, setFormData] = useState({
    id: address?.id || "",
    label: address?.label || "",
    cep: address?.cep || "",
    street: address?.street || "",
    number: address?.number || "",
    complement: address?.complement || "",
    neighborhood: address?.neighborhood || "",
    city: address?.city || "",
    state: address?.state || ""
  });

  useEffect(() => {
    if (address) {
      setFormData({
        id: address.id || "",
        label: address.label || "",
        cep: address.cep || "",
        street: address.street || "",
        number: address.number || "",
        complement: address.complement || "",
        neighborhood: address.neighborhood || "",
        city: address.city || "",
        state: address.state || ""
      });
    } else {
      setFormData({
        id: "",
        label: "",
        cep: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: ""
      });
    }
  }, [address, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cep") {
      formattedValue = value.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d{3})/, "$1-$2");
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleCepBlur = async () => {
    const cep = formData.cep.replace(/\D/g, "");
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b flex items-center justify-between bg-muted/20">
          <h2 className="text-xl font-black uppercase tracking-tight italic">
            {address ? "Editar Endereço" : "Novo Endereço"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-all">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Apelido do Endereço (ex: Casa, Trabalho)</label>
            <input 
              name="label"
              value={formData.label}
              onChange={handleChange}
              className="w-full h-12 px-4 rounded-xl border bg-muted/30 focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
              placeholder="Ex: Minha Casa"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">CEP</label>
              <input 
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                onBlur={handleCepBlur}
                className="w-full h-12 px-4 rounded-xl border bg-muted/30 focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                placeholder="00000-000"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Número</label>
              <input 
                name="number"
                value={formData.number}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-xl border bg-muted/30 focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                placeholder="123"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Rua / Logradouro</label>
            <input 
              name="street"
              value={formData.street}
              onChange={handleChange}
              className="w-full h-12 px-4 rounded-xl border bg-muted/30 focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
              placeholder="Nome da rua"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Complemento</label>
            <input 
              name="complement"
              value={formData.complement}
              onChange={handleChange}
              className="w-full h-12 px-4 rounded-xl border bg-muted/30 focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
              placeholder="Apt, Bloco, etc. (Opcional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Bairro</label>
              <input 
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-xl border bg-muted/30 focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                placeholder="Seu bairro"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Cidade</label>
                <input 
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-xl border bg-muted/30 focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                  placeholder="Cidade"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">UF</label>
                <input 
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-xl border bg-muted/30 focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                  placeholder="SP"
                  required
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl font-bold text-muted-foreground hover:bg-muted transition-all"
            >
              CANCELAR
            </button>
            <button 
              type="submit"
              className="flex-1 h-12 bg-primary text-primary-foreground rounded-xl font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              SALVAR ENDEREÇO
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componente de Modal de Detalhes do Pedido
function OrderDetailModal({ isOpen, onClose, order }: { isOpen: boolean, onClose: () => void, order: any }) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b flex items-center justify-between bg-muted/20">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight italic">Detalhes do Pedido</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">ID: {order.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-all">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Status do Pedido */}
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Status Atual</p>
                <p className="text-lg font-black text-primary uppercase">{order.status}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Realizado em</p>
              <p className="font-bold">
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR') : 'Data indisponível'}
              </p>
            </div>
          </div>

          {/* Itens do Pedido */}
          <div className="space-y-4">
            <h3 className="font-black uppercase italic tracking-tight flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Itens Comprados
            </h3>
            <div className="space-y-3">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl border bg-muted/10">
                  <div className="relative w-16 h-16 rounded-xl border overflow-hidden bg-white flex-shrink-0">
                    {item.image && item.image !== "" ? (
                      <Image src={item.image} alt={item.name || "Produto"} fill className="object-contain p-2" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Package className="h-8 w-8 text-muted-foreground/20" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm leading-tight">{item.name || "Produto sem nome"}</p>
                    <p className="text-xs text-muted-foreground">Qtd: {item.quantity || 1} x {formatPrice(item.price || 0)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-primary">{formatPrice((item.price || 0) * (item.quantity || 1))}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pagamento */}
            <div className="space-y-4">
              <h3 className="font-black uppercase italic tracking-tight flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Pagamento
              </h3>
              <div className="bg-muted/20 p-4 rounded-2xl border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-bold">{formatPrice(order.total - (order.deliveryFee || 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frete:</span>
                  <span className="font-bold text-green-600">{order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : 'Grátis'}</span>
                </div>
                <div className="pt-2 border-t flex justify-between">
                  <span className="font-black uppercase text-sm">Total:</span>
                  <span className="font-black text-lg text-primary">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Entrega */}
            <div className="space-y-4">
              <h3 className="font-black uppercase italic tracking-tight flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Entrega
              </h3>
              <div className="bg-muted/20 p-4 rounded-2xl border">
                <p className="text-sm font-bold">{order.address?.street}, {order.address?.number}</p>
                <p className="text-xs text-muted-foreground">{order.address?.neighborhood} - {order.address?.city}/{order.address?.state}</p>
                <p className="text-xs text-muted-foreground mt-1">CEP: {order.address?.cep}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-muted/20">
          <button 
            onClick={onClose}
            className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-black uppercase tracking-widest hover:opacity-90 transition-all"
          >
            FECHAR DETALHES
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MinhaContaPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"geral" | "pedidos" | "trocas" | "fidelidade" | "ofertas" | "dados">("geral");
  
  // Persistir aba ativa no localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem("active_tab_minha_conta");
    if (savedTab) {
      setActiveTab(savedTab as any);
    }
  }, []);

  useEffect(() => {
    if (activeTab) {
      localStorage.setItem("active_tab_minha_conta", activeTab);
    }
  }, [activeTab]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSavingData, setIsSavingData] = useState(false);
  const [authStep, setAuthStep] = useState<"phone" | "password" | "set_password">("phone");
  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [selectedQuickProduct, setSelectedQuickProduct] = useState<any>(null);
  const [isQuickBuyOpen, setIsQuickBuyOpen] = useState(false);
  const [isDirectPurchaseSuccess, setIsDirectPurchaseSuccess] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);
  const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState(false);
  
  // Form states
  const [phoneInput, setPhoneInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [customerName, setCustomerName] = useState("");

  // Meus Dados Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const [addresses, setAddresses] = useState<any[]>([]);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  useEffect(() => {
    // Buscar produtos para a vitrine
    fetch("/api/products")
      .then(res => res.ok ? res.json() : [])
      .then(data => setAllProducts(data))
      .catch(() => setAllProducts([]));

    // Verificar se já está logado
    const savedCustomer = localStorage.getItem("customer_auth");
    if (savedCustomer) {
      const parsed = JSON.parse(savedCustomer);
      setCustomer(parsed);
      fetchOrders(parsed.phone);

      // Preencher formData com dados básicos
      setFormData({
        name: parsed.name || "",
        email: parsed.email || "",
        phone: parsed.phone || ""
      });

      // Carregar múltiplos endereços
      const savedAddresses = localStorage.getItem("customer_addresses");
      if (savedAddresses) {
        try {
          const parsedAddresses = JSON.parse(savedAddresses);
          setAddresses(parsedAddresses);
          if (parsedAddresses.length > 0) {
            setSelectedAddressId(parsedAddresses[0].id);
          }
        } catch (e) {
          console.error("Erro ao carregar endereços", e);
        }
      } else {
        // Fallback: tentar carregar o endereço antigo único e converter para o novo formato
        const savedAddress = localStorage.getItem("last_delivery_address");
        if (savedAddress) {
          try {
            const address = JSON.parse(savedAddress);
            const initialAddress = { ...address, id: 'addr_' + Date.now(), label: 'Principal' };
            setAddresses([initialAddress]);
            setSelectedAddressId(initialAddress.id);
            localStorage.setItem("customer_addresses", JSON.stringify([initialAddress]));
          } catch (e) {}
        }
      }
    }
    
    setIsLoading(false);
  }, []);

  const handleQuickBuy = (product: any) => {
    setSelectedQuickProduct(product);
    setIsQuickBuyOpen(true);
  };

  const confirmQuickBuy = async (address: any) => {
    if (selectedQuickProduct && address) {
      // Processar pedido direto
      setIsQuickBuyOpen(false);
      setIsLoading(true);
      setError(""); // Limpar erros anteriores
      
      try {
        // Criar o novo pedido com a estrutura correta para a API
        const newOrderData = {
          customer: {
            name: formData.name,
            email: formData.email || "",
            phone: formData.phone,
            cpf: "" 
          },
          address: {
            street: address.street,
            number: address.number,
            complement: address.complement || "",
            neighborhood: address.neighborhood,
            city: address.city,
            state: address.state,
            cep: address.cep
          },
          items: [
            {
              name: selectedQuickProduct.name,
              price: selectedQuickProduct.price,
              image: selectedQuickProduct.image,
              quantity: 1
            }
          ],
          total: selectedQuickProduct.price,
          status: "Preparando Envio",
          deliveryFee: 0,
          paymentMethod: "Cartão de Crédito (Compra Rápida)"
        };

        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newOrderData)
        });

        if (response.ok) {
          const createdOrder = await response.json();
          // Atualizar lista local de pedidos
          setOrders(prev => [createdOrder, ...prev]);
          setIsDirectPurchaseSuccess(true);
        } else {
          setError("Erro ao processar pedido. Tente novamente.");
        }
      } catch (err) {
        console.error("Erro no checkout rápido:", err);
        setError("Erro de conexão. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleViewOrderDetails = (order: any) => {
    setSelectedOrderDetails(order);
    setIsOrderDetailModalOpen(true);
  };

  const handleSaveAddress = (addressData: any) => {
    let newAddresses;
    if (addressData.id) {
      // Editar existente
      newAddresses = addresses.map(addr => addr.id === addressData.id ? addressData : addr);
    } else {
      // Novo endereço
      const newAddress = { ...addressData, id: 'addr_' + Date.now() };
      newAddresses = [...addresses, newAddress];
      if (newAddresses.length === 1) {
        setSelectedAddressId(newAddress.id);
      }
    }
    
    setAddresses(newAddresses);
    localStorage.setItem("customer_addresses", JSON.stringify(newAddresses));
    setIsAddressModalOpen(false);
    setEditingAddress(null);
    setSuccessMessage("Endereço salvo com sucesso!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleDeleteAddress = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este endereço?")) {
      const newAddresses = addresses.filter(addr => addr.id !== id);
      setAddresses(newAddresses);
      localStorage.setItem("customer_addresses", JSON.stringify(newAddresses));
      if (selectedAddressId === id) {
        setSelectedAddressId(newAddresses.length > 0 ? newAddresses[0].id : null);
      }
      setSuccessMessage("Endereço removido.");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "phone") {
      newValue = formatPhone(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSaveData = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingData(true);
    setError("");
    setSuccessMessage("");

    // Validação de E-mail (se preenchido)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Por favor, insira um e-mail válido.");
      setIsSavingData(false);
      return;
    }

    // Validação de Telefone
    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      setError("Por favor, insira um telefone válido com DDD.");
      setIsSavingData(false);
      return;
    }

    try {
      // Atualizar dados do cliente
      const updatedCustomer = {
        ...customer,
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      };
      setCustomer(updatedCustomer);
      localStorage.setItem("customer_auth", JSON.stringify(updatedCustomer));

      setSuccessMessage("Dados pessoais salvos com sucesso!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Erro ao salvar dados.");
    } finally {
      setIsSavingData(false);
    }
  };

  const fetchOrders = async (phone: string) => {
    try {
      const res = await fetch(`/api/orders?phone=${encodeURIComponent(phone)}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
    }
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    let formatted = digits;
    
    if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)} ${digits.slice(2)}`;
    }
    if (digits.length > 3) {
      formatted = `${digits.slice(0, 2)} ${digits.slice(2, 3)} ${digits.slice(3)}`;
    }
    if (digits.length > 7) {
      formatted = `${digits.slice(0, 2)} ${digits.slice(2, 3)} ${digits.slice(3, 7)}-${digits.slice(7)}`;
    }
    
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneInput(formatPhone(e.target.value));
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneInput.length < 10) {
      setError("Por favor, insira um telefone válido");
      return;
    }

    setIsLoggingIn(true);
    setError("");

    try {
      const res = await fetch("/api/customers/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneInput })
      });

      const data = await res.json();

      if (data.status === "not_found") {
        setError("Telefone não encontrado. Você precisa finalizar um pedido primeiro para criar uma conta.");
      } else if (data.status === "set_password") {
        setCustomerName(data.name);
        setAuthStep("set_password");
      } else if (data.status === "enter_password") {
        setCustomerName(data.name);
        setAuthStep("password");
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor. Tente novamente.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) {
      setError("Senha é obrigatória");
      return;
    }

    if (authStep === "set_password" && passwordInput !== confirmPasswordInput) {
      setError("As senhas não coincidem");
      return;
    }

    setIsLoggingIn(true);
    setError("");

    try {
      const res = await fetch("/api/customers/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phone: phoneInput, 
          password: passwordInput,
          action: authStep === "set_password" ? "set_password" : "login"
        })
      });

      const data = await res.json();

      if (data.status === "authenticated") {
        setCustomer(data.customer);
        localStorage.setItem("customer_auth", JSON.stringify(data.customer));
        fetchOrders(data.customer.phone);
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      setError("Erro ao realizar autenticação.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("customer_auth");
    setCustomer(null);
    setAuthStep("phone");
    setPhoneInput("");
    setPasswordInput("");
    setConfirmPasswordInput("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Carregando seu painel...</p>
        </div>
      </div>
    );
  }

  // Se não estiver logado, mostrar tela de login
  if (!customer) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border shadow-xl p-8 space-y-8">
          <div className="text-center space-y-2">
            <Link href="/" className="text-3xl font-black text-primary italic tracking-tighter">LEVELE</Link>
            <h1 className="text-xl font-bold uppercase tracking-tight">Acesse sua conta</h1>
            <p className="text-sm text-muted-foreground">Acompanhe seus pedidos, cashback e pontos.</p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-xl border border-destructive/20 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {authStep === "phone" && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Telefone Celular</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                  <input 
                    type="tel"
                    placeholder="43 9 9824-5853"
                    className="w-full h-12 pl-12 pr-4 rounded-xl border bg-muted/30 focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                    value={phoneInput}
                    onChange={handlePhoneChange}
                    required
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-primary text-primary-foreground h-12 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {isLoggingIn ? <Loader2 className="h-5 w-5 animate-spin" /> : "CONTINUAR"}
                {!isLoggingIn && <ArrowRight className="h-5 w-5" />}
              </button>
              <p className="text-[10px] text-center text-muted-foreground italic">
                * Caso não tenha conta, ela será criada após seu primeiro pedido.
              </p>
            </form>
          )}

          {(authStep === "password" || authStep === "set_password") && (
            <form onSubmit={handleAuthAction} className="space-y-4">
              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 mb-6">
                <p className="text-xs font-medium text-muted-foreground">Olá, <span className="font-bold text-primary">{customerName}</span>!</p>
                <p className="text-[10px] text-muted-foreground">{authStep === "set_password" ? "Defina uma senha para seu primeiro acesso." : "Digite sua senha para acessar seu painel."}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                  <input 
                    type="password"
                    placeholder="••••••••"
                    className="w-full h-12 pl-12 pr-4 rounded-xl border bg-muted/30 focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {authStep === "set_password" && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Confirmar Senha</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                    <input 
                      type="password"
                      placeholder="••••••••"
                      className="w-full h-12 pl-12 pr-4 rounded-xl border bg-muted/30 focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-primary text-primary-foreground h-12 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {isLoggingIn ? <Loader2 className="h-5 w-5 animate-spin" /> : (authStep === "set_password" ? "DEFINIR SENHA E ACESSAR" : "ENTRAR NO PAINEL")}
              </button>
              
              <button 
                type="button"
                onClick={() => setAuthStep("phone")}
                className="w-full text-xs font-bold text-muted-foreground hover:text-primary transition-colors py-2"
              >
                USAR OUTRO TELEFONE
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <QuickBuyModal 
        isOpen={isQuickBuyOpen} 
        onClose={() => setIsQuickBuyOpen(false)} 
        product={selectedQuickProduct} 
        onConfirm={confirmQuickBuy}
        address={formData}
        onEditAddress={() => {
          setIsQuickBuyOpen(false);
          setActiveTab("dados");
        }}
      />
      <DirectPurchaseSuccessModal 
        isOpen={isDirectPurchaseSuccess} 
        onClose={() => setIsDirectPurchaseSuccess(false)} 
        product={selectedQuickProduct}
        address={formData}
      />
      <OrderDetailModal 
        isOpen={isOrderDetailModalOpen} 
        onClose={() => setIsOrderDetailModalOpen(false)} 
        order={selectedOrderDetails} 
      />
      {/* Header do Painel */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-black text-primary italic tracking-tighter">LEVELE</Link>
            <div className="h-6 w-[1px] bg-border hidden md:block"></div>
            <h1 className="text-sm font-bold text-muted-foreground hidden md:block uppercase tracking-widest">Área do Cliente</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold leading-tight">{customer.name}</p>
                <p className="text-[10px] text-primary font-bold uppercase tracking-tighter">{customer.level || "Bronze"}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <User className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar de Navegação */}
          <aside className="lg:col-span-3 space-y-6">
            <nav className="bg-white rounded-2xl border p-2 space-y-1 shadow-sm">
              <button 
                onClick={() => setActiveTab("geral")}
                className={`flex w-full items-center gap-3 p-3 rounded-xl transition-all ${activeTab === "geral" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted text-muted-foreground"}`}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span className="font-bold text-sm">Visão Geral</span>
              </button>
              <button 
                onClick={() => setActiveTab("pedidos")}
                className={`flex w-full items-center gap-3 p-3 rounded-xl transition-all ${activeTab === "pedidos" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted text-muted-foreground"}`}
              >
                <Package className="h-5 w-5" />
                <span className="font-bold text-sm">Meus Pedidos</span>
              </button>
              <button 
                onClick={() => setActiveTab("fidelidade")}
                className={`flex w-full items-center gap-3 p-3 rounded-xl transition-all ${activeTab === "fidelidade" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted text-muted-foreground"}`}
              >
                <Gift className="h-5 w-5" />
                <span className="font-bold text-sm">Cashback e Pontos</span>
              </button>
              <button 
                onClick={() => setActiveTab("trocas")}
                className={`flex w-full items-center gap-3 p-3 rounded-xl transition-all ${activeTab === "trocas" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted text-muted-foreground"}`}
              >
                <RefreshCcw className="h-5 w-5" />
                <span className="font-bold text-sm">Trocas e Suporte</span>
              </button>
              <button 
                onClick={() => setActiveTab("ofertas")}
                className={`flex w-full items-center gap-3 p-3 rounded-xl transition-all ${activeTab === "ofertas" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted text-muted-foreground"}`}
              >
                <Tag className="h-5 w-5" />
                <span className="font-bold text-sm">Ofertas VIP</span>
              </button>
              <button 
                onClick={() => setActiveTab("dados")}
                className={`flex w-full items-center gap-3 p-3 rounded-xl transition-all ${activeTab === "dados" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "hover:bg-muted text-muted-foreground"}`}
              >
                <User className="h-5 w-5" />
                <span className="font-bold text-sm">Meus Dados</span>
              </button>
              <div className="pt-2 mt-2 border-t">
                <button 
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm"
                >
                  <LogOut className="h-5 w-5" />
                  Sair da Conta
                </button>
              </div>
            </nav>

            {/* Card de Ajuda Rápida */}
            <div className="bg-primary/5 rounded-2xl border border-primary/10 p-5 space-y-4">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Precisa de ajuda?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Nosso suporte está disponível de Seg. a Sex. das 09h às 18h.
              </p>
              <button className="w-full bg-white text-primary border border-primary/20 h-10 rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-all">
                FALAR COM ATENDENTE
              </button>
            </div>
          </aside>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-9 space-y-8">
            
            {activeTab === "geral" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Boas vindas e Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3 bg-white p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black tracking-tight">OLÁ, {customer.name.split(' ')[0].toUpperCase()}! 👋</h2>
                      <p className="text-muted-foreground text-sm">Que bom ter você de volta. Veja o que preparamos para você hoje.</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Nível Atual</p>
                        <p className="text-primary font-black">{customer.level || "Bronze"}</p>
                      </div>
                      <div className="bg-green-50 px-4 py-2 rounded-xl border border-green-100 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Último Pedido</p>
                        <p className="text-green-600 font-black">{orders.length > 0 ? orders[0].status : "Nenhum"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Widgets Financeiros */}
                  <div className="bg-gradient-to-br from-primary to-primary/80 p-6 rounded-2xl text-primary-foreground shadow-lg shadow-primary/20">
                    <div className="flex justify-between items-start mb-4">
                      <Wallet className="h-8 w-8 opacity-50" />
                      <span className="bg-white/20 px-2 py-1 rounded-lg text-[10px] font-bold uppercase">Disponível</span>
                    </div>
                    <p className="text-xs font-medium opacity-80 mb-1">Seu Cashback</p>
                    <h3 className="text-3xl font-black">{formatPrice(customer.cashback || 0)}</h3>
                    <button className="mt-4 w-full bg-white text-primary h-9 rounded-lg text-xs font-bold hover:bg-white/90 transition-colors">
                      USAR NA PRÓXIMA COMPRA
                    </button>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <Star className="h-8 w-8 text-amber-500" />
                      <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-[10px] font-bold uppercase">Nível {customer.level || "Bronze"}</span>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Seus Pontos</p>
                    <h3 className="text-3xl font-black">{(customer.points || 0).toLocaleString()}</h3>
                    <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <ShoppingBag className="h-8 w-8 text-blue-500" />
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-[10px] font-bold uppercase">Total</span>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Pedidos Realizados</p>
                    <h3 className="text-3xl font-black">{orders.length}</h3>
                    <button onClick={() => setActiveTab("pedidos")} className="mt-4 w-full border h-9 rounded-lg text-xs font-bold hover:bg-muted transition-colors">
                      VER HISTÓRICO COMPLETO
                    </button>
                  </div>
                </div>

                {/* Pedidos Recentes */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-lg flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      ACOMPANHE SEUS PEDIDOS
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {orders.length > 0 ? orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="bg-white p-4 rounded-2xl border shadow-sm hover:border-primary/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-xl border overflow-hidden bg-muted flex-shrink-0">
                            {order.items[0]?.image && order.items[0].image !== "" ? (
                              <Image 
                                src={order.items[0].image} 
                                alt={order.items[0].name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted">
                                <Package className="h-8 w-8 text-muted-foreground/20" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded uppercase">{order.id}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                order.status === 'Entregue' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <h4 className="font-bold text-sm line-clamp-1">{order.items[0]?.name || "Pedido Levele"}</h4>
                            <p className="text-xs text-muted-foreground">
                              Comprado em {order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR') : 'Data n/a'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0">
                          <div className="text-right">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Valor Total</p>
                            <p className="font-black text-primary">{formatPrice(order.total)}</p>
                          </div>
                          <button 
                            onClick={() => handleViewOrderDetails(order)}
                            className="bg-muted hover:bg-primary hover:text-white p-2 rounded-lg transition-all group-hover:scale-110"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )) : (
                      <div className="bg-white p-12 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center gap-4">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-bold">Você ainda não tem pedidos.</p>
                          <p className="text-sm text-muted-foreground">Que tal começar sua primeira compra agora?</p>
                        </div>
                        <Link href="/" className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-bold text-sm">
                          VER PRODUTOS
                        </Link>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}

            {activeTab === "pedidos" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-2xl font-black tracking-tight uppercase">Histórico de Pedidos</h2>
                  <div className="flex gap-2">
                    <select className="bg-white border rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-primary transition-all">
                      <option>Todos os Pedidos</option>
                      <option>Últimos 30 dias</option>
                      <option>Últimos 6 meses</option>
                      <option>2025</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                      <div className="bg-muted/30 p-4 border-b flex flex-wrap items-center justify-between gap-4">
                        <div className="flex gap-6">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Data do Pedido</p>
                            <p className="text-sm font-bold">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Total</p>
                            <p className="text-sm font-bold text-primary">{formatPrice(order.total)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">ID</p>
                            <p className="text-sm font-bold uppercase">{order.id}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleViewOrderDetails(order)}
                          className="text-xs font-bold text-primary hover:underline uppercase tracking-tight"
                        >
                          Ver Detalhes
                        </button>
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-bold uppercase tracking-widest">{order.status}</span>
                        </div>
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-4">
                            <div className="relative w-20 h-20 rounded-xl border overflow-hidden bg-muted flex-shrink-0">
                              {item.image && item.image !== "" ? (
                                <Image 
                                  src={item.image} 
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                  <Package className="h-10 w-10 text-muted-foreground/20" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-sm mb-1">{item.name}</h4>
                              <p className="text-xs text-muted-foreground mb-2">Qtd: {item.quantity}</p>
                          <div className="flex gap-2">
                                <button 
                                  onClick={() => handleQuickBuy(item)}
                                  className="bg-primary text-primary-foreground px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase hover:opacity-90 transition-all flex items-center gap-1"
                                >
                                  <Zap className="h-3 w-3" />
                                  Pedir Novamente
                                </button>
                                <button className="bg-muted px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase hover:bg-muted/80 transition-all">Avaliar Produto</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "fidelidade" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-gradient-to-br from-primary to-primary/80 p-8 rounded-3xl text-primary-foreground relative overflow-hidden shadow-xl">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="h-6 w-6" />
                      <span className="text-xs font-bold uppercase tracking-widest opacity-80">Programa de Fidelidade</span>
                    </div>
                    <h2 className="text-4xl font-black mb-6 italic tracking-tighter uppercase">Clube VIP Levele</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <p className="text-sm font-medium opacity-80 uppercase tracking-widest">Saldo de Cashback</p>
                        <p className="text-5xl font-black tracking-tighter">{formatPrice(customer.cashback || 0)}</p>
                        <p className="text-xs opacity-70 italic">* Válido para usar em qualquer produto da loja.</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium opacity-80 uppercase tracking-widest">Seus Pontos</p>
                        <p className="text-5xl font-black tracking-tighter">{(customer.points || 0).toLocaleString()}</p>
                        <p className="text-xs opacity-70 italic">* Falta pouco para o próximo nível!</p>
                      </div>
                    </div>
                  </div>
                  {/* Círculos decorativos */}
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <h3 className="font-black text-lg mb-4 uppercase italic tracking-tight flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      Benefícios do seu Nível ({customer.level || "Bronze"})
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <ChevronRight className="h-3 w-3 text-green-600" />
                        </div>
                        <span><strong>5% de Cashback</strong> em todas as compras.</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <ChevronRight className="h-3 w-3 text-green-600" />
                        </div>
                        <span><strong>Frete Grátis</strong> em compras acima de R$ 199.</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm opacity-50">
                        <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Lock className="h-3 w-3" />
                        </div>
                        <span>Acesso antecipado a lançamentos (Nível Ouro).</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <h3 className="font-black text-lg mb-4 uppercase italic tracking-tight flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Histórico de Pontos
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="text-xs font-bold">Compra Realizada</p>
                          <p className="text-[10px] text-muted-foreground">08 Jan 2026</p>
                        </div>
                        <p className="text-sm font-black text-green-600">+ 159 pts</p>
                      </div>
                      <div className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="text-xs font-bold">Avaliação de Produto</p>
                          <p className="text-[10px] text-muted-foreground">06 Jan 2026</p>
                        </div>
                        <p className="text-sm font-black text-green-600">+ 50 pts</p>
                      </div>
                      <div className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="text-xs font-bold">Compra Realizada</p>
                          <p className="text-[10px] text-muted-foreground">05 Jan 2026</p>
                        </div>
                        <p className="text-sm font-black text-green-600">+ 289 pts</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "trocas" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white p-8 rounded-3xl border shadow-sm text-center space-y-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <RefreshCcw className="h-10 w-10 text-primary" />
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter">Central de Trocas e Devoluções</h2>
                    <p className="text-sm text-muted-foreground">
                      Você tem até 7 dias após o recebimento para solicitar uma troca ou devolução de forma simples e rápida.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto pt-4">
                    <div className="p-4 rounded-2xl bg-muted/30 border space-y-2">
                      <div className="font-black text-xl text-primary">01</div>
                      <p className="text-xs font-bold uppercase">Selecione o Pedido</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-muted/30 border space-y-2">
                      <div className="font-black text-xl text-primary">02</div>
                      <p className="text-xs font-bold uppercase">Escolha o Motivo</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-muted/30 border space-y-2">
                      <div className="font-black text-xl text-primary">03</div>
                      <p className="text-xs font-bold uppercase">Envie o Produto</p>
                    </div>
                  </div>
                  <button className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20">
                    INICIAR NOVA SOLICITAÇÃO
                  </button>
                </div>
              </div>
            )}

            {activeTab === "ofertas" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 p-8 rounded-3xl text-white relative overflow-hidden shadow-xl mb-8">
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        <Flame className="h-6 w-6 fill-white" />
                        <span className="text-xs font-black uppercase tracking-widest opacity-90">Seleção Exclusiva</span>
                      </div>
                      <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none mb-2">Vitrine VIP</h2>
                      <p className="text-white/80 font-medium">Os produtos mais desejados com compra em 1 clique.</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/30 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Seu Cashback Disponível</p>
                      <p className="text-3xl font-black">{formatPrice(customer.cashback || 0)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allProducts.length > 0 ? allProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-3xl border overflow-hidden shadow-sm group hover:shadow-xl transition-all border-transparent hover:border-primary/20 flex flex-col">
                      <div className="relative aspect-square bg-muted/30 overflow-hidden">
                        {product.image && product.image !== "" ? (
                          <Image 
                            src={product.image} 
                            alt={product.name}
                            fill
                            className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <Package className="h-16 w-16 text-muted-foreground/20" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                          OFERTA VIP
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="h-3 w-3 fill-amber-400 text-amber-400" />
                          ))}
                          <span className="text-[10px] text-muted-foreground font-bold ml-1">(4.9)</span>
                        </div>
                        <h3 className="font-bold text-lg mb-2 line-clamp-1 uppercase tracking-tight group-hover:text-primary transition-colors">{product.name}</h3>
                        <div className="mt-auto pt-4 border-t space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[10px] text-muted-foreground uppercase font-bold">Preço VIP</p>
                              <p className="text-2xl font-black text-primary">{formatPrice(product.price)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-green-600 font-bold uppercase">+ Cashback</p>
                              <p className="text-sm font-black text-green-600">+{formatPrice(product.price * 0.05)}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleQuickBuy(product)}
                            className="w-full bg-primary text-primary-foreground h-12 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-lg shadow-primary/20"
                          >
                            <Zap className="h-4 w-4 fill-current" />
                            COMPRA RÁPIDA
                          </button>
                        </div>
                      </div>
                    </div>
                  )) : (                    <div className="col-span-full py-12 text-center text-muted-foreground">
                      Carregando ofertas exclusivas...
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "dados" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-2xl font-black tracking-tight uppercase">Meus Dados</h2>
                  <p className="text-sm text-muted-foreground italic">* Mantenha seus dados atualizados para compras em 1 clique.</p>
                </div>

                {successMessage && (
                  <div className="bg-green-100 text-green-700 p-4 rounded-xl border border-green-200 flex items-center gap-2 animate-in slide-in-from-top-2">
                    <ThumbsUp className="h-5 w-5" />
                    <p className="text-sm font-bold">{successMessage}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Formulário de Dados Pessoais */}
                  <form onSubmit={handleSaveData} className="bg-white rounded-3xl border shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="p-8 space-y-6 flex-1">
                      <h3 className="text-lg font-black uppercase italic tracking-tight flex items-center gap-2 text-primary">
                        <User className="h-5 w-5" />
                        Informações Pessoais
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Nome Completo</label>
                          <input 
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
                            className="w-full h-12 px-4 rounded-xl border bg-muted/30 focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                            placeholder="Seu nome"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-muted-foreground uppercase ml-1">WhatsApp / Telefone</label>
                          <input 
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleFormChange}
                            className="w-full h-12 px-4 rounded-xl border bg-muted/30 focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                            placeholder="(11) 9 9999-9999"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-muted-foreground uppercase ml-1">E-mail (Opcional)</label>
                          <input 
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleFormChange}
                            className="w-full h-12 px-4 rounded-xl border bg-muted/30 focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                            placeholder="seu@email.com"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-muted/30 border-t">
                      <button 
                        type="submit"
                        disabled={isSavingData}
                        className="w-full bg-primary text-primary-foreground h-12 rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSavingData ? <Loader2 className="h-5 w-5 animate-spin" /> : "SALVAR DADOS"}
                      </button>
                    </div>
                  </form>

                  {/* Gerenciamento de Endereços */}
                  <div className="bg-white rounded-3xl border shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="p-8 space-y-6 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black uppercase italic tracking-tight flex items-center gap-2 text-primary">
                          <MapPin className="h-5 w-5" />
                          Meus Endereços
                        </h3>
                        <button 
                          onClick={() => { setEditingAddress(null); setIsAddressModalOpen(true); }}
                          className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-primary/20 transition-all"
                        >
                          ADICIONAR NOVO
                        </button>
                      </div>

                      <div className="space-y-3">
                        {addresses.length > 0 ? addresses.map((addr) => (
                          <div key={addr.id} className="p-4 rounded-2xl border bg-muted/10 group hover:border-primary/30 transition-all">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <span className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                                  {addr.label || "Endereço"}
                                </span>
                                {selectedAddressId === addr.id && (
                                  <span className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                                    Principal
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => { setEditingAddress(addr); setIsAddressModalOpen(true); }}
                                  className="p-1.5 hover:bg-primary/10 rounded-lg text-primary transition-all"
                                >
                                  <Star className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteAddress(addr.id)}
                                  className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 transition-all"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm font-bold">{addr.street}, {addr.number}</p>
                            <p className="text-[10px] text-muted-foreground">{addr.neighborhood} - {addr.city}/{addr.state}</p>
                            <p className="text-[10px] text-muted-foreground">CEP: {addr.cep}</p>
                            
                            {selectedAddressId !== addr.id && (
                              <button 
                                onClick={() => setSelectedAddressId(addr.id)}
                                className="mt-3 text-[10px] font-black text-primary uppercase hover:underline"
                              >
                                Tornar Principal
                              </button>
                            )}
                          </div>
                        )) : (
                          <div className="py-8 text-center space-y-3">
                            <MapPin className="h-10 w-10 text-muted-foreground/20 mx-auto" />
                            <p className="text-xs text-muted-foreground font-medium">Nenhum endereço cadastrado.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Modais */}
      <QuickBuyModal 
        isOpen={isQuickBuyOpen} 
        onClose={() => setIsQuickBuyOpen(false)} 
        product={selectedQuickProduct}
        onConfirm={confirmQuickBuy}
        addresses={addresses}
        selectedAddressId={selectedAddressId}
        onSelectAddress={setSelectedAddressId}
        onEditAddress={() => { setActiveTab("dados"); setIsQuickBuyOpen(false); }}
      />

      <DirectPurchaseSuccessModal 
        isOpen={isDirectPurchaseSuccess} 
        onClose={() => setIsDirectPurchaseSuccess(false)} 
        product={selectedQuickProduct}
        address={addresses.find(a => a.id === selectedAddressId) || addresses[0]}
      />

      <OrderDetailModal 
        isOpen={isOrderDetailModalOpen} 
        onClose={() => setIsOrderDetailModalOpen(false)} 
        order={selectedOrderDetails} 
      />

      <AddressModal 
        isOpen={isAddressModalOpen}
        onClose={() => { setIsAddressModalOpen(false); setEditingAddress(null); }}
        address={editingAddress}
        onSave={handleSaveAddress}
      />

      {/* Footer Simples */}
      <footer className="mt-12 py-8 bg-white border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground font-medium">© 2026 LEVELE STORE. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
