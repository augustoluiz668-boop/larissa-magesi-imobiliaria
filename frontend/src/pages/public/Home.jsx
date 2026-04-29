import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Home, Building2, Building, Store, DoorOpen, TreePine,
  Handshake, KeyRound, Landmark, PiggyBank, HandCoins, Search, Star,
  ArrowRight, MapPin, Check,
} from "lucide-react";
import { api, waLink } from "../../lib/api";
import PropertyCard from "../../components/PropertyCard";
import { toast } from "sonner";

const tipos = [
  { icon: Home, titulo: "Casas", descricao: "Lares para novas histórias de família." },
  { icon: Building2, titulo: "Apartamentos", descricao: "Modernos, práticos e em regiões valorizadas." },
  { icon: Building, titulo: "Condomínios", descricao: "Lazer completo e segurança elevada." },
  { icon: Store, titulo: "Imóveis Comerciais", descricao: "Oportunidades para seu negócio crescer." },
  { icon: DoorOpen, titulo: "Kitnets", descricao: "Compactas e funcionais, ideais para estudantes e solteiros." },
  { icon: TreePine, titulo: "Terrenos", descricao: "Construa exatamente o que você sonha." },
  { icon: KeyRound, titulo: "Para Locação", descricao: "Imóveis prontos para morar, já." },
  { icon: Handshake, titulo: "Permuta", descricao: "Troque seu imóvel com segurança jurídica." },
  { icon: Landmark, titulo: "Financiamento", descricao: "Aceitamos financiamento bancário e FGTS." },
  { icon: PiggyBank, titulo: "Consórcio", descricao: "Use sua carta contemplada com orientação completa." },
  { icon: HandCoins, titulo: "Para Venda", descricao: "As melhores oportunidades do mercado regional." },
];

const cidades = [
  { nome: "Bauru", regiao: "Cidade principal de atuação", destaque: true },
  { nome: "Agudos", regiao: "Região metropolitana" },
  { nome: "Piratininga", regiao: "Cidades próximas" },
  { nome: "Pederneiras", regiao: "Cidades próximas" },
  { nome: "Arealva", regiao: "Cidades próximas" },
  { nome: "Lençóis Paulista", regiao: "Região de negócios" },
];

export default function HomePage({ settings = {} }) {
  const [destaques, setDestaques] = useState([]);
  const [depo, setDepo] = useState([]);
  const [form, setForm] = useState({
    nome: "", whatsapp: "", email: "", cidade_interesse: "Bauru",
    bairro_interesse: "", tipo_imovel: "casa", finalidade: "comprar",
    orcamento: "", prazo_decisao: "", mensagem: "", origem: "site",
  });
  const [sending, setSending] = useState(false);
  const [propForm, setPropForm] = useState({ nome: "", whatsapp: "", cidade_interesse: "", mensagem: "" });

  useEffect(() => {
    api.get("/public/properties?destaque=true").then((r) => setDestaques(r.data.slice(0, 6))).catch(() => {});
    api.get("/public/testimonials").then((r) => setDepo(r.data)).catch(() => {});
  }, []);

  const submitLead = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.whatsapp) {
      toast.error("Preencha nome e WhatsApp");
      return;
    }
    setSending(true);
    try {
      await api.post("/public/leads", { ...form, orcamento: Number(form.orcamento) || 0 });
      toast.success("Recebemos seu contato! Larissa entrará em contato em breve.");
      setForm({ ...form, nome: "", whatsapp: "", email: "", mensagem: "", bairro_interesse: "", orcamento: "" });
    } catch (e) {
      toast.error("Não foi possível enviar. Tente novamente.");
    } finally {
      setSending(false);
    }
  };

  const submitProp = async (e) => {
    e.preventDefault();
    if (!propForm.nome || !propForm.whatsapp) return toast.error("Preencha nome e WhatsApp");
    setSending(true);
    try {
      await api.post("/public/leads", {
        ...propForm, origem: "site", finalidade: "vender", tipo_imovel: "casa",
      });
      toast.success("Perfeito! Larissa entrará em contato para avaliar seu imóvel.");
      setPropForm({ nome: "", whatsapp: "", cidade_interesse: "", mensagem: "" });
    } catch {
      toast.error("Falha ao enviar. Tente novamente.");
    } finally {
      setSending(false);
    }
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
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <a href={waLink(settings.whatsapp)} target="_blank" rel="noreferrer" data-testid="hero-whatsapp-btn" className="lm-btn-primary">
                Falar com Larissa no WhatsApp <ArrowRight className="w-4 h-4" />
              </a>
              <Link to="/imoveis" data-testid="hero-properties-btn" className="lm-btn-outline">
                Ver imóveis disponíveis
              </Link>
            </div>

            <div className="mt-14 grid grid-cols-3 gap-6 max-w-lg">
              {[
                { n: "150+", l: "Negociações" },
                { n: "98%", l: "Clientes satisfeitos" },
                { n: "10+", l: "Cidades atendidas" },
              ].map((s, i) => (
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

      {/* SOBRE */}
      <section id="sobre" className="bg-white border-y border-[#E5E0D8]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-24 grid md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-5">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=85"
              alt="Larissa Magesi — Corretora"
              className="w-full h-[540px] object-cover rounded-sm"
            />
          </div>
          <div className="md:col-span-7 md:pl-6">
            <div className="lm-overline mb-4">Sobre Larissa Magesi</div>
            <h2 className="font-serif text-4xl md:text-5xl text-[#2B3A2F] leading-[1.05]">
              Uma corretora preparada para orientar decisões importantes.
            </h2>
            <div className="lm-divider mt-6 mb-8"></div>
            <p className="text-[#5C5C5C] leading-relaxed mb-5">
              Com atuação em Bauru e região, ofereço atendimento próximo, consultivo e humanizado. Meu papel é acompanhar você
              desde a primeira conversa até o momento da assinatura das chaves — com informação clara, segurança jurídica e visão de mercado.
            </p>
            <p className="text-[#5C5C5C] leading-relaxed mb-8">
              Atuo com compra, venda, locação, permuta, financiamento bancário e consórcio imobiliário, ajudando famílias,
              investidores e empreendedores a encontrar o imóvel ideal para cada momento da vida.
            </p>

            <ul className="grid sm:grid-cols-2 gap-3 text-sm text-[#2C2C2C]">
              {["Atendimento próximo e consultivo", "Conhecimento do mercado de Bauru", "Segurança em cada negociação",
                "Apoio em financiamento e consórcio", "Acompanhamento completo", "Suporte em permutas e avaliações"].map((x) => (
                <li key={x} className="flex items-start gap-2"><Check className="w-4 h-4 text-[#C5A059] mt-0.5" /> {x}</li>
              ))}
            </ul>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-5 border-t border-[#E5E0D8] pt-8 text-sm">
              <div><div className="lm-overline mb-1">CRECI</div><div>{settings.creci || "—"}</div></div>
              <div><div className="lm-overline mb-1">Cidade</div><div>{settings.cidade || "—"}</div></div>
              <div><div className="lm-overline mb-1">Instagram</div><div>{settings.instagram || "—"}</div></div>
              <div><div className="lm-overline mb-1">WhatsApp</div><div>{settings.telefone || "—"}</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* TIPOS */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-24">
        <div className="max-w-2xl">
          <div className="lm-overline mb-4">O que atendemos</div>
          <h2 className="font-serif text-4xl md:text-5xl text-[#2B3A2F] leading-tight">Tipos de imóveis e negociações</h2>
          <div className="lm-divider mt-6"></div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          {tipos.map((t) => (
            <div key={t.titulo} data-testid={`tipo-${t.titulo}`} className="lm-card p-7 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#F4F1EB] border border-[#E5E0D8] flex items-center justify-center text-[#2B3A2F] flex-shrink-0">
                <t.icon className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <div className="font-serif text-xl text-[#2B3A2F]">{t.titulo}</div>
                <p className="text-sm text-[#5C5C5C] mt-1 leading-relaxed">{t.descricao}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CIDADES */}
      <section className="bg-[#EEE8DB] border-y border-[#E5E0D8]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <div className="lm-overline mb-3">Região de atuação</div>
              <h2 className="font-serif text-4xl md:text-5xl text-[#2B3A2F] leading-tight max-w-xl">
                Bauru e cidades vizinhas com mercado valorizado
              </h2>
            </div>
            <p className="text-[#5C5C5C] max-w-md">
              Atuo em Bauru e região, com foco em bairros estratégicos, condomínios valorizados e cidades
              próximas com forte demanda imobiliária.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cidades.map((c) => (
              <div key={c.nome} className={`p-6 rounded-sm flex items-start gap-3 ${c.destaque ? "bg-[#2B3A2F] text-[#F4F1EB]" : "bg-white border border-[#E5E0D8]"}`}>
                <MapPin className={`w-5 h-5 mt-0.5 ${c.destaque ? "text-[#C5A059]" : "text-[#2B3A2F]"}`} />
                <div>
                  <div className="font-serif text-xl">{c.nome}</div>
                  <div className={`text-xs mt-1 ${c.destaque ? "text-[#C9C3B4]" : "text-[#5C5C5C]"}`}>{c.regiao}</div>
                </div>
              </div>
            ))}
          </div>
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

      {/* BUSCA CTA */}
      <section id="busca" className="bg-[#2B3A2F] text-[#F4F1EB]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-xs tracking-[0.25em] uppercase text-[#C5A059] mb-4">Busca de imóveis</div>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight text-[#F4F1EB]">
              Filtre pelo que você realmente quer
            </h2>
            <p className="text-[#C9C3B4] mt-5 max-w-md">
              Cidade, bairro, faixa de preço, quartos, vagas e negociações aceitas — encontre em segundos o imóvel que encaixa no seu perfil.
            </p>
          </div>
          <div className="bg-white text-[#2C2C2C] p-8 rounded-sm">
            <Link to="/imoveis" data-testid="search-cta" className="flex items-center gap-3 text-[#2B3A2F] font-serif text-lg border-b border-[#E5E0D8] pb-4">
              <Search className="w-5 h-5" /> Buscar imóveis com filtros avançados
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Link>
            <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
              {["Cidade", "Bairro", "Tipo de imóvel", "Finalidade", "Faixa de preço", "Quartos", "Vagas", "Financiamento", "Consórcio", "Permuta"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-[#5C5C5C]"><Check className="w-3.5 h-3.5 text-[#C5A059]" /> {f}</div>
              ))}
            </div>
          </div>
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
            <div key={k} className={k === "mensagem" ? "sm:col-span-2" : ""}>
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
              Posso ajudar você a divulgar o imóvel, atrair interessados qualificados, organizar visitas e conduzir a
              negociação com profissionalismo — do anúncio à assinatura da escritura.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={waLink(settings.whatsapp, "Olá Larissa! Quero cadastrar meu imóvel.")} target="_blank" rel="noreferrer" className="lm-btn-primary">Falar com Larissa</a>
            </div>
          </div>
          <form onSubmit={submitProp} data-testid="owner-form" className="bg-white rounded-sm p-8 border border-[#E5E0D8] space-y-4">
            <div className="font-serif text-2xl text-[#2B3A2F]">Cadastrar meu imóvel</div>
            <div><label className="lm-label">Seu nome *</label>
              <input className="lm-input" value={propForm.nome} onChange={(e) => setPropForm({ ...propForm, nome: e.target.value })} data-testid="owner-nome" />
            </div>
            <div><label className="lm-label">WhatsApp *</label>
              <input className="lm-input" value={propForm.whatsapp} onChange={(e) => setPropForm({ ...propForm, whatsapp: e.target.value })} data-testid="owner-whatsapp" />
            </div>
            <div><label className="lm-label">Cidade do imóvel</label>
              <input className="lm-input" value={propForm.cidade_interesse} onChange={(e) => setPropForm({ ...propForm, cidade_interesse: e.target.value })} data-testid="owner-cidade" />
            </div>
            <div><label className="lm-label">Sobre o imóvel</label>
              <textarea rows={3} className="lm-input" value={propForm.mensagem} onChange={(e) => setPropForm({ ...propForm, mensagem: e.target.value })} data-testid="owner-mensagem" />
            </div>
            <button type="submit" disabled={sending} data-testid="owner-submit" className="lm-btn-primary w-full justify-center disabled:opacity-60">
              Cadastrar meu imóvel
            </button>
          </form>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-24">
        <div className="lm-overline mb-3">Depoimentos</div>
        <h2 className="font-serif text-4xl md:text-5xl text-[#2B3A2F] mb-12 max-w-2xl">
          Clientes que confiaram em cada etapa
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          {depo.map((d) => (
            <figure key={d.id} className="bg-white border border-[#E5E0D8] p-8 rounded-sm">
              <div className="flex items-center gap-1 text-[#C5A059]">
                {Array.from({ length: d.rating }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <blockquote className="font-serif text-xl text-[#2B3A2F] leading-snug mt-5">“{d.texto}”</blockquote>
              <figcaption className="mt-6">
                <div className="font-medium text-[#2C2C2C]">{d.nome}</div>
                <div className="text-xs tracking-wider uppercase text-[#5C5C5C] mt-0.5">{d.cidade}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
