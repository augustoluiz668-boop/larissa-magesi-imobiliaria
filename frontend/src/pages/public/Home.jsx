import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowRight, Check, Calculator, Clock, MapPin, Star } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { api, waLink } from "../../lib/api";
import PropertyCard from "../../components/PropertyCard";
import { toast } from "sonner";

export default function HomePage({ settings = {} }) {
  const navigate = useNavigate();
  const [destaques, setDestaques] = useState([]);
  const [search, setSearch] = useState({ tipo: "", finalidade: "", valor_max: "" });
  const [simForm, setSimForm] = useState({ nome: "", whatsapp: "", renda: "", valor_imovel: "", fgts: "" });
  const [sending, setSending] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  useEffect(() => {
    api.get("/public/properties?destaque=true").then((r) => setDestaques(r.data.slice(0, 9))).catch(() => {});
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
      toast.success("Recebi seu pedido! Entrarei em contato com sua simulação em breve.");
      setSimForm({ nome: "", whatsapp: "", renda: "", valor_imovel: "", fgts: "" });
    } catch { toast.error("Não foi possível enviar."); } finally { setSending(false); }
  };

  const stats = [
    { icon: Star, value: "10+", label: "Anos no mercado imobiliário" },
    { icon: Check, value: "100%", label: "Atendimento personalizado" },
    { icon: MapPin, value: "Bauru/SP", label: "e Região" },
    { icon: Clock, value: "24h", label: "Atendimento rápido · horários flexíveis" },
  ];

  return (
    <>
      {/* HERO */}
      <section className="bg-[#071d34] text-[#f8fafc] overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-[1fr_400px] lg:grid-cols-[1fr_460px] items-stretch min-h-[580px]">
          {/* COPY — esquerda */}
          <div className="px-6 md:pl-10 md:pr-12 py-16 md:py-24 flex flex-col justify-center">
            {settings.logo_url && (
              <img src={settings.logo_url} alt="Larissa Magesi" className="h-12 w-auto mb-8 opacity-90" />
            )}
            <div className="lm-overline mb-5">Bauru e região</div>
            <h1 className="font-serif text-[2.75rem] leading-[1.05] sm:text-5xl lg:text-[3.25rem] tracking-tight">
              Seu próximo <em>endereço</em><br className="hidden sm:block" /> começa aqui.
            </h1>
            <p className="mt-6 text-[#a8b8cc] text-base md:text-lg leading-relaxed max-w-lg">
              Atendimento personalizado para compra, venda, locação, avaliação, regularização, financiamento e consórcio de imóveis em Bauru e região.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 flex-wrap">
              <a
                href={waLink(settings.whatsapp)}
                target="_blank"
                rel="noreferrer"
                data-testid="hero-whatsapp-btn"
                className="lm-btn-gold"
              >
                Converse comigo no WhatsApp <ArrowRight className="w-4 h-4" />
              </a>
              <Link to="/imoveis" data-testid="hero-properties-btn" className="lm-btn-outline border-[#a8b8cc] text-[#f8fafc] hover:bg-white/10 hover:text-[#f8fafc]">
                Ver imóveis disponíveis
              </Link>
            </div>

            {/* STATS — proof items dentro da coluna, igual protótipo */}
            <div className="mt-10 pt-8 border-t border-[#0d2d4c] grid grid-cols-2 sm:grid-cols-4 gap-5">
              {stats.map((s, i) => (
                <div key={i}>
                  <div className="font-serif text-2xl text-[#f8fafc] leading-none">{s.value}</div>
                  <div className="text-xs text-[#a8b8cc] mt-1 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RETRATO — direita, retangular, full height */}
          <div className="hidden md:block relative">
            {settings.photo_url ? (
              <img
                src={settings.photo_url}
                alt="Larissa Magesi — Corretora de Imóveis"
                className="absolute inset-0 w-full h-full object-cover object-top"
                fetchpriority="high"
                loading="eager"
              />
            ) : (
              <div className="absolute inset-0 bg-[#0d2d4c] flex items-center justify-center">
                <span className="font-serif text-[10rem] text-[#c9a66b]/20 select-none leading-none">LM</span>
              </div>
            )}
            {/* gradiente na base */}
            <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#071d34] to-transparent pointer-events-none" />
            {/* badge nome */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-5 py-2 text-center">
                <div className="font-serif text-sm text-[#f8fafc] leading-tight">Larissa Magesi</div>
                <div className="text-[10px] tracking-[0.2em] uppercase text-[#c9a66b]">CRECI {settings.creci || "290524-F"}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BUSCA */}
      <section className="bg-[#eef2f7] border-b border-[#d1dde8]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">
          <div className="text-center mb-8">
            <div className="lm-overline mb-3">Encontre seu imóvel</div>
            <h2 className="font-serif text-3xl md:text-4xl text-[#071d34]">Buscar imóveis em Bauru e Região</h2>
          </div>
          <form onSubmit={handleSearch} className="bg-white border border-[#d1dde8] rounded-sm p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
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

      {/* IMÓVEIS EM DESTAQUE — CARROSSEL */}
      {destaques.length > 0 && (
        <section id="destaques" className="max-w-7xl mx-auto px-6 md:px-10 py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <div className="lm-overline mb-3">Seleção especial</div>
              <h2 className="font-serif text-4xl md:text-5xl text-[#071d34]">Imóveis em destaque</h2>
            </div>
            <Link to="/imoveis" className="text-sm tracking-wider uppercase text-[#071d34] hover:text-[#c9a66b] flex items-center gap-1">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {destaques.map((p) => (
                <div key={p.id} className="flex-none w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                  <PropertyCard prop={p} />
                </div>
              ))}
            </div>
          </div>
          {destaques.length > 3 && (
            <div className="flex justify-center gap-2 mt-6">
              {destaques.map((_, i) => (
                <button key={i} onClick={() => emblaApi?.scrollTo(i)} className="w-2 h-2 rounded-full bg-[#d1dde8] hover:bg-[#c9a66b] transition-colors" />
              ))}
            </div>
          )}
        </section>
      )}

      {/* SIMULAÇÃO FINANCIAMENTO */}
      <section className="bg-[#071d34] text-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <div className="text-xs tracking-[0.25em] uppercase text-[#c9a66b] mb-4">Simulação gratuita</div>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight">
              Descubra o financiamento ideal para o seu perfil
            </h2>
            <p className="text-[#a8b8cc] mt-5 max-w-md">
              Preencha seus dados e analisarei seu perfil, entrando em contato com as melhores opções reais para você — considerando FGTS, entrada e parcela ideal.
            </p>
            <div className="mt-8 space-y-3 text-sm text-[#a8b8cc]">
              {["Cálculo com FGTS e entrada", "Análise pelo seu perfil de renda", "Orientação em cada etapa do financiamento", "Parcela e prazo adequados ao seu momento"].map((f) => (
                <div key={f} className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#c9a66b]" /> {f}</div>
              ))}
            </div>
            <Link to="/financiamento" className="lm-btn-gold mt-8 inline-flex">
              <Calculator className="w-4 h-4" /> Fazer simulação completa
            </Link>
          </div>
          <form onSubmit={submitSim} className="bg-white text-[#2C2C2C] p-8 rounded-sm space-y-4">
            <div className="font-serif text-2xl text-[#071d34] mb-2">Quero minha simulação</div>
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
            <p className="text-xs text-[#5C5C5C] text-center">Seus dados estão protegidos. Entrarei em contato pelo WhatsApp.</p>
          </form>
        </div>
      </section>

      {/* CTA — Contato e Cadastrar Imóvel */}
      <section className="bg-[#eef2f7] border-y border-[#d1dde8]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 grid md:grid-cols-2 gap-8">
          <div className="bg-white border border-[#d1dde8] rounded-sm p-8 flex flex-col justify-between">
            <div>
              <div className="lm-overline mb-3">Procurando imóvel</div>
              <h3 className="font-serif text-3xl text-[#071d34] leading-tight mb-3">Me conte o que você procura</h3>
              <p className="text-[#5C5C5C] text-sm leading-relaxed">Preencha um breve formulário e entrarei em contato com opções compatíveis com o seu perfil.</p>
            </div>
            <Link to="/contato" className="lm-btn-primary mt-6 self-start">
              Me conte o que procuro <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-[#071d34] text-[#f8fafc] rounded-sm p-8 flex flex-col justify-between">
            <div>
              <div className="lm-overline !text-[#c9a66b] mb-3">Tem imóvel para vender ou alugar?</div>
              <h3 className="font-serif text-3xl leading-tight mb-3">Quero cadastrar meu imóvel</h3>
              <p className="text-[#a8b8cc] text-sm leading-relaxed">Posso ajudar você a divulgar, atrair interessados qualificados e conduzir a negociação com profissionalismo.</p>
            </div>
            <Link to="/cadastrar-imovel" className="lm-btn-gold mt-6 self-start">
              Cadastrar meu imóvel <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
