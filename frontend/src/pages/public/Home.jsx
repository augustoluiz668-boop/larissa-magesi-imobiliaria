import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, ArrowRight, Check, Calculator,
} from "lucide-react";
import { api, waLink } from "../../lib/api";
import PropertyCard from "../../components/PropertyCard";
import { toast } from "sonner";

export default function HomePage({ settings = {} }) {
  const navigate = useNavigate();
  const [destaques, setDestaques] = useState([]);
  const [search, setSearch] = useState({ tipo: "", finalidade: "", valor_max: "" });
  const [form, setForm] = useState({
    nome: "", whatsapp: "", email: "", cidade_interesse: "Bauru",
    bairro_interesse: "", tipo_imovel: "casa", finalidade: "comprar",
    orcamento: "", prazo_decisao: "", mensagem: "", origem: "site",
  });
  const [simForm, setSimForm] = useState({ nome: "", whatsapp: "", renda: "", valor_imovel: "", fgts: "" });
  const [sending, setSending] = useState(false);
  const [propForm, setPropForm] = useState({ nome: "", whatsapp: "", cidade_interesse: "", mensagem: "" });

  useEffect(() => {
    api.get("/public/properties?destaque=true").then((r) => setDestaques(r.data.slice(0, 6))).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.tipo) params.set("tipo", search.tipo);
    if (search.finalidade) params.set("finalidade", search.finalidade);
    if (search.valor_max) params.set("valor_max", search.valor_max);
    navigate(`/imoveis?${params.toString()}`);
  };

  const submitSim = async (e) => {
    e.preventDefault();
    if (!simForm.nome || !simForm.whatsapp) return toast.error("Preencha nome e WhatsApp");
    setSending(true);
    const mensagem = `Simulação de financiamento — Renda: R$${simForm.renda || "não informada"} | Valor do imóvel: R$${simForm.valor_imovel || "não informado"} | FGTS: R$${simForm.fgts || "não informado"}`;
    try {
      await api.post("/public/leads", {
        nome: simForm.nome, whatsapp: simForm.whatsapp, finalidade: "financiar",
        origem: "site", orcamento: Number(simForm.valor_imovel) || 0, mensagem,
      });
      toast.success("Recebemos seu pedido! Larissa entrará em contato com sua simulação.");
      setSimForm({ nome: "", whatsapp: "", renda: "", valor_imovel: "", fgts: "" });
    } catch { toast.error("Não foi possível enviar."); } finally { setSending(false); }
  };

  const submitLead = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.whatsapp) return toast.error("Preencha nome e WhatsApp");
    setSending(true);
    try {
      await api.post("/public/leads", { ...form, orcamento: Number(form.orcamento) || 0 });
      toast.success("Recebemos seu contato! Larissa entrará em contato em breve.");
      setForm({ ...form, nome: "", whatsapp: "", email: "", mensagem: "", bairro_interesse: "", orcamento: "" });
    } catch { toast.error("Não foi possível enviar."); } finally { setSending(false); }
  };

  const submitProp = async (e) => {
    e.preventDefault();
    if (!propForm.nome || !propForm.whatsapp) return toast.error("Preencha nome e WhatsApp");
    setSending(true);
    try {
      await api.post("/public/leads", { ...propForm, origem: "site", finalidade: "vender", tipo_imovel: "casa" });
      toast.success("Perfeito! Larissa entrará em contato.");
      setPropForm({ nome: "", whatsapp: "", cidade_interesse: "", mensagem: "" });
    } catch { toast.error("Falha ao enviar."); } finally { setSending(false); }
  };

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-5 gap-10 px-6 md:px-10 pt-16 md:pt-24 pb-20 items-center">
          <div className="md:col-span-3 lm-fade-up">
            <div className="lm-overline mb-5">Corretora de Imóveis · Bauru/SP</div>
            <h1 className="font-serif text-[2.75rem] leading-[1.02] sm:text-5xl lg:text-6xl text-[#2B3A2F] tracking-tight">
              Encontre o imóvel ideal com uma corretora que entende o seu momento.
            </h1>
            <p className="mt-7 text-[#5C5C5C] text-base md:text-lg leading-relaxed max-w-xl">
              Atendimento personalizado para compra, venda, locação, permuta, financiamento e consórcio de imóveis,
              com segurança, clareza e acompanhamento em cada etapa.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 flex-wrap">
              <a href={waLink(settings.whatsapp)} target="_blank" rel="noreferrer" data-testid="hero-whatsapp-btn" className="lm-btn-primary">
                Falar com Larissa no WhatsApp <ArrowRight className="w-4 h-4" />
              </a>
              <Link to="/imoveis" data-testid="hero-properties-btn" className="lm-btn-outline">
                Ver imóveis disponíveis
              </Link>
            </div>

            <div className="mt-14 grid grid-cols-3 gap-6 max-w-lg">
              {[{ n: "150+", l: "Negociações" }, { n: "98%", l: "Clientes satisfeitos" }, { n: "10+", l: "Cidades atendidas" }].map((s, i) => (
                <div key={i}>
                  <div className="font-serif text-3xl text-[#2B3A2F]">{s.n}</div>
                  <div className="text-xs tracking-wider uppercase text-[#5C5C5C] mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 relative lm-fade-up lm-fade-delay-2">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85"
              alt="Imóvel elegante"
              className="rounded-sm w-full h-[460px] object-cover shadow-xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-[#2B3A2F] text-[#F4F1EB] p-5 hidden md:block">
              <div className="text-[10px] tracking-[0.25em] uppercase text-[#C5A059] mb-1">CRECI</div>
              <div className="font-serif text-xl">{settings.creci || "290524-F"}</div>
            </div>
          </div>
        </div>
      </section>

      {/* BUSCA */}
      <section className="bg-[#F4F1EB] border-y border-[#E5E0D8]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-14">
          <div className="text-center mb-8">
            <div className="lm-overline mb-3">Encontre seu imóvel</div>
            <h2 className="font-serif text-4xl md:text-5xl text-[#2B3A2F]">Buscar imóveis em Bauru e Região</h2>
          </div>
          <form onSubmit={handleSearch} className="bg-white border border-[#E5E0D8] rounded-sm p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="lm-label">Tipo de imóvel</label>
              <select className="lm-input" value={search.tipo} onChange={(e) => setSearch({ ...search, tipo: e.target.value })}>
                <option value="">Todos</option>
                <option value="casa">Casa</option>
                <option value="apartamento">Apartamento</option>
                <option value="condominio">Condomínio</option>
              </select>
            </div>
            <div>
              <label className="lm-label">Finalidade</label>
              <select className="lm-input" value={search.finalidade} onChange={(e) => setSearch({ ...search, finalidade: e.target.value })}>
                <option value="">Comprar ou Alugar</option>
                <option value="comprar">Comprar</option>
                <option value="alugar">Alugar</option>
              </select>
            </div>
            <div>
              <label className="lm-label">Valor máximo (R$)</label>
              <input type="number" className="lm-input" placeholder="Ex: 500000" value={search.valor_max} onChange={(e) => setSearch({ ...search, valor_max: e.target.value })} />
            </div>
            <button type="submit" className="lm-btn-primary w-full justify-center">
              <Search className="w-4 h-4" /> Buscar imóveis
            </button>
          </form>
        </div>
      </section>

      {/* DESTAQUES */}
      <section id="destaques" className="max-w-7xl mx-auto px-6 md:px-10 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="lm-overline mb-3">Seleção da Larissa</div>
            <h2 className="font-serif text-4xl md:text-5xl text-[#2B3A2F]">Imóveis em destaque</h2>
          </div>
          <Link to="/imoveis" className="text-sm tracking-wider uppercase text-[#2B3A2F] hover:text-[#C5A059] flex items-center gap-1">
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destaques.map((p) => <PropertyCard key={p.id} prop={p} />)}
        </div>
      </section>

      {/* SIMULAÇÃO FINANCIAMENTO */}
      <section className="bg-[#2B3A2F] text-[#F4F1EB]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <div className="text-xs tracking-[0.25em] uppercase text-[#C5A059] mb-4">Simulação gratuita</div>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight">
              Descubra o financiamento ideal para o seu perfil
            </h2>
            <p className="text-[#C9C3B4] mt-5 max-w-md">
              Preencha seus dados e Larissa entra em contato já com uma simulação personalizada para você — considerando FGTS, entrada e parcela ideal.
            </p>
            <div className="mt-8 space-y-3 text-sm text-[#C9C3B4]">
              {["Cálculo com FGTS e entrada", "Análise pelo seu perfil de renda", "Orientação em cada etapa do financiamento", "Parcela e prazo adequados ao seu momento"].map((f) => (
                <div key={f} className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#C5A059]" /> {f}</div>
              ))}
            </div>
          </div>
          <form onSubmit={submitSim} className="bg-white text-[#2C2C2C] p-8 rounded-sm space-y-4">
            <div className="font-serif text-2xl text-[#2B3A2F] mb-2">Quero minha simulação</div>
            <div>
              <label className="lm-label">Nome completo *</label>
              <input className="lm-input" value={simForm.nome} onChange={(e) => setSimForm({ ...simForm, nome: e.target.value })} />
            </div>
            <div>
              <label className="lm-label">WhatsApp *</label>
              <input className="lm-input" value={simForm.whatsapp} onChange={(e) => setSimForm({ ...simForm, whatsapp: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="lm-label">Renda familiar (R$)</label>
                <input type="number" className="lm-input" placeholder="Ex: 5000" value={simForm.renda} onChange={(e) => setSimForm({ ...simForm, renda: e.target.value })} />
              </div>
              <div>
                <label className="lm-label">Valor do imóvel (R$)</label>
                <input type="number" className="lm-input" placeholder="Ex: 350000" value={simForm.valor_imovel} onChange={(e) => setSimForm({ ...simForm, valor_imovel: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="lm-label">FGTS disponível (R$)</label>
              <input type="number" className="lm-input" placeholder="Ex: 20000" value={simForm.fgts} onChange={(e) => setSimForm({ ...simForm, fgts: e.target.value })} />
            </div>
            <button type="submit" disabled={sending} className="lm-btn-gold w-full justify-center disabled:opacity-60">
              <Calculator className="w-4 h-4" /> {sending ? "Enviando…" : "Quero minha simulação"}
            </button>
            <p className="text-xs text-[#5C5C5C] text-center">Seus dados estão protegidos. Larissa entrará em contato pelo WhatsApp.</p>
          </form>
        </div>
      </section>

      {/* FORMULÁRIO DE LEAD */}
      <section id="contato" className="max-w-7xl mx-auto px-6 md:px-10 py-24 grid md:grid-cols-5 gap-10">
        <div className="md:col-span-2">
          <div className="lm-overline mb-3">Fale com Larissa</div>
          <h2 className="font-serif text-4xl md:text-5xl text-[#2B3A2F] leading-tight">Conte o que você procura</h2>
          <p className="text-[#5C5C5C] mt-5 leading-relaxed">
            Preencha os campos e receba opções compatíveis com o seu perfil. O retorno é rápido e direto no seu WhatsApp.
          </p>
          <div className="mt-8 space-y-2 text-sm text-[#2C2C2C]">
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C5A059]" /> Atendimento humanizado</div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C5A059]" /> Imóveis conforme seu orçamento</div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C5A059]" /> Orientação em financiamento e consórcio</div>
          </div>
        </div>
        <form data-testid="lead-form" onSubmit={submitLead} className="md:col-span-3 bg-white p-8 rounded-sm border border-[#E5E0D8] grid sm:grid-cols-2 gap-5">
          {[
            ["nome", "Nome completo *", "text"],
            ["whatsapp", "WhatsApp *", "text"],
            ["email", "E-mail", "email"],
            ["cidade_interesse", "Cidade de interesse", "text"],
            ["bairro_interesse", "Bairro de interesse", "text"],
            ["orcamento", "Faixa de orçamento (R$)", "number"],
            ["prazo_decisao", "Prazo para decisão", "text"],
          ].map(([k, label, type]) => (
            <div key={k}>
              <label className="lm-label">{label}</label>
              <input data-testid={`lead-field-${k}`} type={type} className="lm-input" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
            </div>
          ))}
          <div>
            <label className="lm-label">Tipo de imóvel</label>
            <select className="lm-input" value={form.tipo_imovel} onChange={(e) => setForm({ ...form, tipo_imovel: e.target.value })} data-testid="lead-field-tipo">
              <option value="casa">Casa</option><option value="apartamento">Apartamento</option><option value="condominio">Condomínio</option>
              <option value="comercial">Comercial</option><option value="kitnet">Kitnet</option><option value="terreno">Terreno</option>
            </select>
          </div>
          <div>
            <label className="lm-label">Finalidade</label>
            <select className="lm-input" value={form.finalidade} onChange={(e) => setForm({ ...form, finalidade: e.target.value })} data-testid="lead-field-finalidade">
              <option value="comprar">Comprar</option><option value="alugar">Alugar</option><option value="vender">Vender</option>
              <option value="permutar">Permutar</option><option value="financiar">Financiar</option><option value="consorcio">Consórcio</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="lm-label">Mensagem</label>
            <textarea rows={3} className="lm-input" value={form.mensagem} onChange={(e) => setForm({ ...form, mensagem: e.target.value })} data-testid="lead-field-mensagem" />
          </div>
          <div className="sm:col-span-2 flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs text-[#5C5C5C]">Seus dados estão protegidos. Não compartilhamos com terceiros.</span>
            <button type="submit" disabled={sending} data-testid="lead-submit" className="lm-btn-primary disabled:opacity-60">
              {sending ? "Enviando…" : "Enviar meu contato"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </section>

      {/* PROPRIETÁRIOS */}
      <section id="proprietarios" className="bg-[#EEE8DB] border-y border-[#E5E0D8]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="lm-overline mb-3">Para proprietários</div>
            <h2 className="font-serif text-4xl md:text-5xl text-[#2B3A2F] leading-tight">
              Quer vender ou alugar seu imóvel com mais segurança e visibilidade?
            </h2>
            <p className="text-[#5C5C5C] mt-5 leading-relaxed max-w-xl">
              Posso ajudar você a divulgar o imóvel, atrair interessados qualificados, organizar visitas e conduzir a negociação com profissionalismo — do anúncio à assinatura da escritura.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={waLink(settings.whatsapp, "Olá Larissa! Quero cadastrar meu imóvel.")} target="_blank" rel="noreferrer" className="lm-btn-primary">Falar com Larissa</a>
            </div>
          </div>
          <form onSubmit={submitProp} data-testid="owner-form" className="bg-white rounded-sm p-8 border border-[#E5E0D8] space-y-4">
            <div className="font-serif text-2xl text-[#2B3A2F]">Cadastrar meu imóvel</div>
            <div><label className="lm-label">Seu nome *</label><input className="lm-input" value={propForm.nome} onChange={(e) => setPropForm({ ...propForm, nome: e.target.value })} data-testid="owner-nome" /></div>
            <div><label className="lm-label">WhatsApp *</label><input className="lm-input" value={propForm.whatsapp} onChange={(e) => setPropForm({ ...propForm, whatsapp: e.target.value })} data-testid="owner-whatsapp" /></div>
            <div><label className="lm-label">Cidade do imóvel</label><input className="lm-input" value={propForm.cidade_interesse} onChange={(e) => setPropForm({ ...propForm, cidade_interesse: e.target.value })} data-testid="owner-cidade" /></div>
            <div><label className="lm-label">Sobre o imóvel</label><textarea rows={3} className="lm-input" value={propForm.mensagem} onChange={(e) => setPropForm({ ...propForm, mensagem: e.target.value })} data-testid="owner-mensagem" /></div>
            <button type="submit" disabled={sending} data-testid="owner-submit" className="lm-btn-primary w-full justify-center disabled:opacity-60">Cadastrar meu imóvel</button>
          </form>
        </div>
      </section>
    </>
  );
}
