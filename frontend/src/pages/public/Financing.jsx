import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { waLink, maskPhone, maskCurrency, parseCurrency } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { Calculator, Check, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const prazoOptions = [120, 180, 240, 300, 360, 420];

export default function Financing({ settings = {} }) {
  const { search } = useLocation();
  const p = new URLSearchParams(search);
  const [form, setForm] = useState({
    nome: p.get("nome") || "",
    telefone: p.get("telefone") || "",
    email: "",
    renda_bruta: p.get("renda_bruta") || "",
    data_nascimento: "",
    tem_dependentes: false,
    tem_fgts: !!p.get("valor_fgts"),
    valor_fgts: p.get("valor_fgts") || "",
    tem_entrada: false, valor_entrada: "",
    parcela_desejada: "",
    valor_imovel: p.get("valor_imovel") || "",
    prazo: 360, observacoes: "",
  });
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.telefone || !form.renda_bruta || !form.valor_imovel) {
      return toast.error("Preencha os campos obrigatórios");
    }
    setSending(true);
    try {
      const mensagem = `Simulação — Renda: R$${form.renda_bruta} | Valor imóvel: R$${form.valor_imovel} | Prazo: ${form.prazo}m | FGTS: ${form.tem_fgts ? `R$${form.valor_fgts}` : "não"} | Entrada: ${form.tem_entrada ? `R$${form.valor_entrada}` : "não"} | Obs: ${form.observacoes}`;
      const { error } = await supabase.from("leads").insert({
        nome: form.nome,
        whatsapp: form.telefone,
        email: form.email,
        finalidade: "financiar",
        origem: "site",
        orcamento: parseCurrency(form.valor_imovel),
        mensagem,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Solicitação recebida! Larissa vai entrar em contato em breve.");
    } catch { toast.error("Não foi possível enviar."); } finally { setSending(false); }
  };

  const set = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div>
      {/* HERO */}
      <section className="bg-[#071d34] text-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-xs tracking-[0.25em] uppercase text-[#c9a66b] mb-5">Simulação de Financiamento</div>
            <h1 className="font-serif text-5xl md:text-6xl leading-tight">
              Realize o sonho da casa própria com clareza
            </h1>
            <p className="text-[#a8b8cc] mt-6 max-w-md leading-relaxed">
              Em menos de 1 minuto, simule sua parcela considerando FGTS, entrada e prazo. Analisarei seu perfil e entrarei em contato com as melhores condições reais do mercado para você.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 max-w-md text-sm">
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#c9a66b]" /> Análise personalizada</div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#c9a66b]" /> Atendimento humano</div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#c9a66b]" /> Orientação completa</div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#c9a66b]" /> Acompanhamento até as chaves</div>
            </div>
          </div>
          <div className="bg-[#0d2d4c]/50 border border-[#0d2d4c] rounded-sm p-8">
            <div className="lm-overline !text-[#c9a66b] mb-4">Como funciona o financiamento</div>
            <ol className="space-y-4 text-sm leading-relaxed text-[#E8E2D6]">
              <li><span className="font-serif text-[#c9a66b] text-lg mr-2">1.</span> Você simula com seus dados de renda, FGTS e entrada.</li>
              <li><span className="font-serif text-[#c9a66b] text-lg mr-2">2.</span> Recebo sua solicitação e analiso seu perfil com atenção.</li>
              <li><span className="font-serif text-[#c9a66b] text-lg mr-2">3.</span> Apresento imóveis compatíveis e os bancos com melhor condição.</li>
              <li><span className="font-serif text-[#c9a66b] text-lg mr-2">4.</span> Acompanho você até a assinatura e entrega das chaves.</li>
            </ol>
          </div>
        </div>
      </section>

      {/* FORMULÁRIO */}
      <section className="max-w-3xl mx-auto px-6 md:px-10 py-14">
        <form onSubmit={submit} data-testid="financing-form" className="bg-white border border-[#d1dde8] rounded-sm p-8 space-y-5">
          <div>
            <div className="font-serif text-2xl text-[#071d34]">Seus dados</div>
            <p className="text-xs text-[#5C5C5C] mt-1">* Campos obrigatórios</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="lm-label">Nome completo *</label><input required className="lm-input" value={form.nome} onChange={(e) => set("nome", e.target.value)} data-testid="fin-nome" /></div>
            <div><label className="lm-label">Telefone / WhatsApp *</label><input required className="lm-input" placeholder="(14) 99999-9999" value={form.telefone} onChange={(e) => set("telefone", maskPhone(e.target.value))} data-testid="fin-telefone" /></div>
            <div><label className="lm-label">E-mail</label><input type="email" className="lm-input" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
            <div><label className="lm-label">Data de nascimento</label><input type="date" className="lm-input" value={form.data_nascimento} onChange={(e) => set("data_nascimento", e.target.value)} data-testid="fin-nascimento" /></div>
            <div><label className="lm-label">Renda bruta familiar (R$) *</label><input required className="lm-input" placeholder="R$ 0,00" value={form.renda_bruta} onChange={(e) => set("renda_bruta", maskCurrency(e.target.value))} data-testid="fin-renda" /></div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="accent-[#071d34]" checked={form.tem_dependentes} onChange={(e) => set("tem_dependentes", e.target.checked)} data-testid="fin-dep" /> Tem dependentes?</label>
            </div>
          </div>

          <div className="border-t border-[#d1dde8] pt-5">
            <div className="font-serif text-lg text-[#071d34] mb-3">FGTS e entrada</div>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="accent-[#071d34]" checked={form.tem_fgts} onChange={(e) => set("tem_fgts", e.target.checked)} data-testid="fin-tem-fgts" /> Tem FGTS disponível?</label>
              {form.tem_fgts && <div><label className="lm-label">Valor do FGTS (R$)</label><input className="lm-input" placeholder="R$ 0,00" value={form.valor_fgts} onChange={(e) => set("valor_fgts", maskCurrency(e.target.value))} data-testid="fin-val-fgts" /></div>}
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="accent-[#071d34]" checked={form.tem_entrada} onChange={(e) => set("tem_entrada", e.target.checked)} data-testid="fin-tem-entrada" /> Tem entrada?</label>
              {form.tem_entrada && <div><label className="lm-label">Valor da entrada (R$)</label><input className="lm-input" placeholder="R$ 0,00" value={form.valor_entrada} onChange={(e) => set("valor_entrada", maskCurrency(e.target.value))} data-testid="fin-val-entrada" /></div>}
            </div>
          </div>

          <div className="border-t border-[#d1dde8] pt-5">
            <div className="font-serif text-lg text-[#071d34] mb-3">Expectativa</div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><label className="lm-label">Parcela que gostaria de pagar (R$)</label><input className="lm-input" placeholder="R$ 0,00" value={form.parcela_desejada} onChange={(e) => set("parcela_desejada", maskCurrency(e.target.value))} data-testid="fin-parcela" /></div>
              <div><label className="lm-label">Valor do imóvel pretendido (R$) *</label><input required className="lm-input" placeholder="R$ 0,00" value={form.valor_imovel} onChange={(e) => set("valor_imovel", maskCurrency(e.target.value))} data-testid="fin-valor-imovel" /></div>
              <div><label className="lm-label">Prazo (meses)</label>
                <select className="lm-input" value={form.prazo} onChange={(e) => set("prazo", Number(e.target.value))} data-testid="fin-prazo">
                  {prazoOptions.map((p) => <option key={p} value={p}>{p} meses ({Math.round(p / 12)} anos)</option>)}
                </select>
              </div>
            </div>
          </div>

          <div><label className="lm-label">Observações</label><textarea rows={2} className="lm-input" value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} /></div>

          <button disabled={sending || submitted} type="submit" data-testid="fin-submit" className="lm-btn-primary w-full justify-center disabled:opacity-60">
            <Calculator className="w-4 h-4" /> {submitted ? "Solicitação enviada" : sending ? "Enviando…" : "Solicitar simulação detalhada"}
          </button>

          {submitted && (
            <div className="border border-[#c9a66b] bg-[#c9a66b]/10 rounded-sm p-4 flex items-start gap-3 text-sm">
              <ShieldCheck className="w-5 h-5 text-[#c9a66b] mt-0.5" />
              <div>
                <strong className="text-[#071d34]">Pronto!</strong> Recebi sua solicitação e entrarei em contato no seu WhatsApp com as melhores opções reais para o seu perfil.
                <a href={waLink(settings.whatsapp, `Olá Larissa! Acabei de preencher a simulação de financiamento em seu site.`)} target="_blank" rel="noreferrer" className="ml-2 font-medium underline">Falar agora <ArrowRight className="w-3 h-3 inline" /></a>
              </div>
            </div>
          )}
        </form>
      </section>
    </div>
  );
}

function ResultRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between border-b border-[#0d2d4c] pb-2">
      <span className="text-sm text-[#a8b8cc]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
