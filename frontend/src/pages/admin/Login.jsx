import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogIn, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("larissa@magesi.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Bem-vinda, Larissa!");
      nav("/admin");
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "E-mail ou senha inválidos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-[#f8fafc]">
      <div className="hidden md:block relative">
        <img src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=85"
          alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#071d34]/65" />
        <div className="relative h-full flex flex-col justify-between p-12 text-[#f8fafc]">
          <Link to="/" className="flex items-center gap-2 text-sm text-[#c9a66b]"><ArrowLeft className="w-4 h-4" /> Voltar ao site</Link>
          <div>
            <div className="lm-overline !text-[#c9a66b] mb-3">Central da Corretora</div>
            <h1 className="font-serif text-5xl leading-tight">Leads, imóveis e oportunidades<br/>em um só lugar.</h1>
            <p className="text-[#a8b8cc] mt-4 max-w-md">Acompanhe todo o funil comercial, organize atendimentos e transforme contatos em negócios fechados.</p>
          </div>
          <div className="text-xs tracking-[0.25em] uppercase text-[#c9a66b]">Larissa Magesi · CRECI 290524-F</div>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} data-testid="login-form" className="w-full max-w-md bg-white border border-[#d1dde8] rounded-sm p-10">
          <div className="font-serif text-3xl text-[#071d34]">Entrar</div>
          <p className="text-sm text-[#5C5C5C] mt-1">Acesse sua central de leads, imóveis e oportunidades imobiliárias.</p>

          <div className="mt-8 space-y-4">
            <div>
              <label className="lm-label">E-mail</label>
              <input data-testid="login-email" type="email" className="lm-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="lm-label">Senha</label>
              <input data-testid="login-password" type="password" className="lm-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {error && <div data-testid="login-error" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}

            <button disabled={loading} data-testid="login-submit" className="lm-btn-primary w-full justify-center disabled:opacity-60">
              <LogIn className="w-4 h-4" /> {loading ? "Entrando…" : "Entrar"}
            </button>
          </div>

          <div className="text-xs text-[#5C5C5C] mt-6 p-3 bg-[#f8fafc] rounded-sm">
            <div className="lm-overline mb-1">Acesso demo</div>
            <div>larissa@magesi.com · Larissa@2026</div>
          </div>
        </form>
      </div>
    </div>
  );
}
