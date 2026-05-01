import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowRight, Check, Calculator, Clock, MapPin, Star, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { api, waLink } from "../../lib/api";
import PropertyCard from "../../components/PropertyCard";
import { toast } from "sonner";

export default function HomePage({ settings = {} }) {
  const navigate = useNavigate();
  const [destaques, setDestaques] = useState([]);
  const [search, setSearch] = useState({ tipo: "", finalidade: "", valor_max: "", codigo: "", nome_condominio: "" });
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
    if (search.codigo) params.set("codigo", search.codigo);
    if (search.nome_condominio) params.set("nome_condominio", search.nome_condominio);
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
      <section
        className="text-[#f8fafc] overflow-hidden relative"
        style={{ background: "linear-gradient(135deg, #040f1d 0%, #071d34 55%, #0d2d4c 100%)" }}
      >
        {/* Gold radial glow — top-left of photo area */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-15%", right: "25%",
            width: "700px", height: "700px",
            background: "radial-gradient(circle, rgba(201,166,107,0.07) 0%, transparent 65%)",
          }}
        />
        <div className="max-w-7xl mx-auto grid md:grid-cols-[1fr_420px] lg:grid-cols-[1fr_480px] items-center min-h-[640px] px-6 md:px-10 py-16 md:py-20 gap-10 lg:gap-16">
          {/* COPY — esquerda */}
          <div className="flex flex-col justify-center">
            {/* Logo em caixa com borda dourada — sem padding, imagem preenche o frame */}
            <div className="mb-8">
              <div
                className="inline-block overflow-hidden"
                style={{ border: "1.5px solid rgba(201,166,107,0.7)", borderRadius: "6px", lineHeight: 0 }}
              >
                <img
                  src="/lmm.png"
                  alt="Larissa Magesi"
                  style={{ width: "clamp(140px, 18vw, 200px)", height: "auto", display: "block" }}
                  fetchpriority="high"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div style={{ width: "32px", height: "1.5px", background: "#c9a66b", flexShrink: 0 }} />
              <div className="lm-overline" style={{ marginBottom: 0 }}>Bauru e região</div>
            </div>
            <h1
              className="font-serif font-bold tracking-tight leading-[1.04]"
              style={{ fontSize: "clamp(2.4rem, 5.4vw, 4.8rem)" }}
            >
              Seu próximo{" "}
              <em style={{ fontStyle: "italic", color: "#c9a66b" }}>endereço</em>
              <br className="hidden sm:block" /> começa aqui.
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
              <Link
                to="/imoveis"
                data-testid="hero-properties-btn"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-medium tracking-[0.04em] transition-colors"
                style={{ border: "1px solid rgba(168,184,204,0.7)", color: "#f8fafc", background: "transparent" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                Ver imóveis disponíveis
              </Link>
            </div>

            {/* STATS — proof-items com borda e fundo semi-transparente (igual protótipo) */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map((s, i) => (
                <div
                  key={i}
                  className="rounded px-4 py-3"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <div className="font-serif text-2xl text-[#f8fafc] leading-none">{s.value}</div>
                  <div className="text-[11px] text-[#a8b8cc] mt-1 leading-snug">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RETRATO — direita, com linha dourada atrás e badge branco */}
          <div className="hidden md:flex flex-col items-stretch">
            {/* wrapper com offset para linha decorativa */}
            <div className="relative" style={{ paddingRight: "14px", paddingBottom: "14px" }}>
              {/* Linha dourada decorativa — atrás da foto, offset inferior-direito */}
              <div
                className="absolute"
                style={{
                  top: "14px", left: "14px", right: "0", bottom: "0",
                  borderRadius: "14px",
                  border: "2px solid rgba(201,166,107,0.55)",
                }}
              />
              {/* Foto */}
              <div className="relative" style={{ zIndex: 1 }}>
                {settings.photo_url ? (
                  <img
                    src={settings.photo_url}
                    alt="Larissa Magesi — Corretora de Imóveis"
                    className="w-full"
                    style={{ height: "580px", borderRadius: "14px", objectFit: "contain", background: "#071d34" }}
                    fetchpriority="high"
                    loading="eager"
                  />
                ) : (
                  <div
                    className="w-full flex items-center justify-center"
                    style={{ height: "580px", borderRadius: "14px", background: "#0d2d4c" }}
                  >
                    <span className="font-serif text-[10rem] text-[#c9a66b]/20 select-none leading-none">LM</span>
                  </div>
                )}
                {/* Badge — cartão branco/creme, sem CRECI (logo já tem) */}
                <div
                  className="absolute bottom-5 right-5 px-5 py-3 shadow-2xl"
                  style={{
                    background: "linear-gradient(135deg, #ffffff 0%, #f2ece0 100%)",
                    borderRadius: "10px",
                  }}
                >
                  <div className="font-serif text-sm text-[#071d34] leading-tight font-semibold">Larissa Magesi</div>
                  <div className="text-[10px] tracking-[0.2em] uppercase mt-0.5" style={{ color: "#c9a66b" }}>
                    Corretora de Imóveis
                  </div>
                </div>
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
          <form onSubmit={handleSearch} className="bg-white border border-[#d1dde8] rounded-sm p-6 space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <option value="venda">Comprar</option>
                  <option value="locacao">Alugar</option>
                </select>
              </div>
              <div>
                <label className="lm-label">Valor máximo</label>
                <div className="flex items-center w-full" style={{ background: "#fff", border: "1px solid #d1dde8", borderRadius: "4px", padding: "0.75rem 0.9rem", gap: "4px" }}>
                  <span className="text-sm shrink-0" style={{ color: "#5C5C5C" }}>R$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="flex-1 bg-transparent outline-none"
                    style={{ fontSize: "0.92rem", color: "#2C2C2C", minWidth: 0 }}
                    placeholder=""
                    value={search.valor_max ? new Intl.NumberFormat("pt-BR").format(Number(search.valor_max)) : ""}
                    onChange={(e) => setSearch({ ...search, valor_max: e.target.value.replace(/\D/g, "") })}
                  />
                </div>
              </div>
              <div>
                <label className="lm-label">Código do imóvel</label>
                <input className="lm-input" placeholder="Ex: LM-001" value={search.codigo} onChange={(e) => setSearch({ ...search, codigo: e.target.value })} />
              </div>
              <div>
                <label className="lm-label">Nome do condomínio</label>
                <input className="lm-input" placeholder="Ex: Villaggio 3" value={search.nome_condominio} onChange={(e) => setSearch({ ...search, nome_condominio: e.target.value })} />
              </div>
              <button type="submit" className="lm-btn-primary w-full justify-center self-end">
                <Search className="w-4 h-4" /> Buscar imóveis
              </button>
            </div>
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
          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-6">
                {destaques.map((p) => (
                  <div key={p.id} className="flex-none w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                    <PropertyCard prop={p} />
                  </div>
                ))}
              </div>
            </div>
            {/* Setas prev/next */}
            <button
              onClick={() => emblaApi?.scrollPrev()}
              aria-label="Anterior"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-white border border-[#d1dde8] shadow-md flex items-center justify-center text-[#071d34] hover:bg-[#c9a66b] hover:text-white hover:border-[#c9a66b] transition-colors z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext()}
              aria-label="Próximo"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-white border border-[#d1dde8] shadow-md flex items-center justify-center text-[#071d34] hover:bg-[#c9a66b] hover:text-white hover:border-[#c9a66b] transition-colors z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          {/* Dots */}
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
            <div className="text-xs tracking-[0.25em] uppercase text-[#c9a66b] mb-4">Simulação de financiamento</div>
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
