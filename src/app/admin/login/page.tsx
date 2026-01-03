"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    // Simulação de autenticação
    if (email === "admin@levele.com.br" && password === "admin123") {
      // Em uma aplicação real, você usaria cookies ou tokens (NextAuth)
      localStorage.setItem("admin_auth", "true");
      router.push("/admin");
    } else {
      setError("Credenciais inválidas. Tente admin@levele.com.br / admin123");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-2xl border shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Levele Admin</h1>
          <p className="text-muted-foreground mt-2">Acesse o painel de gerenciamento</p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6 border border-destructive/20 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">E-mail</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <input
                name="email"
                type="email"
                required
                className="w-full h-11 pl-10 pr-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="admin@levele.com.br"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <input
                name="password"
                type="password"
                required
                className="w-full h-11 pl-10 pr-4 rounded-lg border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground h-12 rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "ENTRAR NO PAINEL"}
          </button>
        </form>
        
        <p className="text-center text-xs text-muted-foreground mt-8">
          Apenas pessoal autorizado.
        </p>
      </div>
    </div>
  );
}
