import React, { useMemo, useState } from "react";
import { api, formatMoney, waLink } from "../../lib/api";
import { Calculator, Check, Info, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

// SAC simulation
function simulateSAC(valorFinanciado, prazoMeses, taxaAnual) {
  const taxaMensal = Math.pow(1 + taxaAnual / 100, 1 / 12) - 1;
  const amortizacao = valorFinanciado / prazoMeses;
  const primeiraParcela = amortizacao + valorFinanciado * taxaMensal;
  const ultimaParcela = amortizacao + amortizacao * taxaMensal;
  let saldo = valorFinanciado;
  let totalPago = 0;
  for (let i = 0; i < prazoMeses; i++) {
    const juros = saldo * taxaMensal;
    totalPago += amortizacao + juros;
    saldo -= amortizacao;
  }
  return { primeiraParcela, ultimaParcela, totalPago, juros: totalPago - valorFinanciado };
}

const prazoOptions = [120, 180, 240, 300, 360, 420];

export default function Financing({ settings = {} }) {
  const [form, setForm] = useState({
    nome: "", telefone: "", email: "",
    renda_bruta: "", data_nascimento: "",
    tem_dependentes: false, tem_fgts: false, valor_fgts: "",
    tem_entrada: false, valor_entrada: "",
    parcela_desejada: "", valor_imovel: "",
    prazo: 360, observacoes: "",
  });
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const taxa = Number(settings.finance_rate_annual) || 10.49;

  const sim = useMemo(() => {
    const valor = Number(form.valor_imovel) || 0;
    const entrada = form.tem_entrada ? Number(form.valor_entrada) || 0 : 0;
    const fgts = form.tem_fgts ? Number(form.valor_fgts) || 0 : 0;
    const financiado = Math.max(0, valor - entrada - fgts);
    if (!financiado || !form.prazo) return null;
    const r = simulateSAC(financiado, Number(form.prazo), taxa);
    const renda = Number(form.renda_bruta) || 0;
    const comprometimento = renda > 0 ? (r.primeiraParcela / renda) * 100 : 0;
    return { ...r, financiado, entradaTotal: entrada + fgts, comprometimento };
  }, [form, taxa]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.telefone || !form.renda_bruta || !form.valor_imovel) {
      return toast.error("Preencha os campos obrigatórios");
    }
    setSending(true);
    try {
      await api.post("/public/financing", {
        nome: form.nome,
        telefone: form.telefone,
        email: form.email,
        renda_bruta: Number(form.renda_bruta),
        data_nascimento: form.data_nascimento,
        tem_dependentes: form.tem_dependentes,
        tem_fgts: form.tem_fgts,
        valor_fgts: Number(form.valor_fgts) || 0,
        tem_entrada: form.tem_entrada,
        valor_entrada: Number(form.valor_entrada) || 0,
        parcela_desejada: Number(form.parcela_desejada) || 0,
        valor_imovel: Number(form.valor_imovel),
        observacoes: form.observacoes,
      });
      setSubmitted(true);
      toast.success("Solicitação recebida! Larissa vai entrar em contato em breve.");
    } catch { toast.error("Não foi possível enviar."); } finally { setSending(false); }
  };

  const set = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div>
      {/* HERO */}
      <section className="bg-[#2B3A2F] text-[#F4F1EB]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-xs tracking-[0.25em] uppercase text-[#C5A059] mb-5">Simulação de Financiamento</div>
            <h1 className="font-serif text-5xl md:text-6xl leading-tight">
              Realize o sonho da casa própria com clareza
            </h1>
            <p className="text-[#C9C3B4] mt-6 max-w-md leading-relaxed">
              Em menos de 1 minuto, simule sua parcela considerando FGTS, entrada e prazo. A Larissa analisa seu perfil e entra em contato com as melhores condições reais do mercado.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 max-w-md text-sm">
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C5A059]" /> 100% gratuito</div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C5A059]" /> Sem compromisso</div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C5A059]" /> Atendimento humano</div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-[#C5A059]" /> Orientação completa</div>
            </div>
          </div>
          <div className="bg-[#3D5142]/50 border border-[#3D5142] rounded-sm p-8">
            <div className="lm-overline !text-[#C5A059] mb-4">Como funciona o financiamento</div>
            <ol className="space-y-4 text-sm leading-relaxed text-[#E8E2D6]">
              <li><span className="font-serif text-[#C5A059] text-lg mr-2">1.</span> Você simula com seus dados de renda, FGTS e entrada.</li>
              <li><span className="font-serif text-[#C5A059] text-lg mr-2">2.</span> A Larissa recebe sua solicitação e analisa seu perfil.</li>
              <li><span className="font-serif text-[#C5A059] text-lg mr-2">3.</span> Apresentamos imóveis compatíveis e bancos com melhor condição.</li>
              <li><span className="font-serif text-[#C5A059] text-lg mr-2">4.</span> Acompanhamos você até a assinatura e entrega das chaves.</li>
            </ol>
          </div>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pt-10">
        <div className="bg-[#C5A059]/10 border border-[#C5A059]/40 rounded-sm px-5 py-4 flex items-start gap-3 text-sm text-[#5C5C5C]">
          <Info className="w-4 h-4 text-[#C5A059] mt-0.5 flex-shrink-0" />
          <div>
            <strong className="text-[#2B3A2F]">Importante:</strong> os valores exibidos são apenas simulações orientativas (Sistema SAC a {taxa.toFixed(2)}% a.a.). As condições reais dependem da análise do banco, comprovação de renda e avaliação do imóvel. <strong>A Larissa entrará em contato com as melhores alternativas reais para o seu caso.</strong>
          </div>
        </div>
      </section>

      {/* FORMULÁRIO + SIMULAÇÃO */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-14 grid lg:grid-cols-5 gap-8">
        <form onSubmit={submit} data-testid="financing-form" className="lg:col-span-3 bg-white border border-[#E5E0D8] rounded-sm p-8 space-y-5">
          <div>
            <div className="font-serif text-2xl text-[#2B3A2F]">Seus dados</div>
            <p className="text-xs text-[#5C5C5C] mt-1">* Campos obrigatórios</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="lm-label">Nome completo *</label><input required className="lm-input" value={form.nome} onChange={(e) => set("nome", e.target.value)} data-testid="fin-nome" /></div>
            <div><label className="lm-label">Telefone / WhatsApp *</label><input required className="lm-input" value={form.telefone} onChange={(e) => set("telefone", e.target.value)} data-testid="fin-telefone" /></div>
            <div><label className="lm-label">E-mail</label><input type="email" className="lm-input" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
            <div><label className="lm-label">Data de nascimento</label><input type="date" className="lm-input" value={form.data_nascimento} onChange={(e) => set("data_nascimento", e.target.value)} data-testid="fin-nascimento" /></div>
            <div><label className="lm-label">Renda bruta familiar (R$) *</label><input required type="number" className="lm-input" value={form.renda_bruta} onChange={(e) => set("renda_bruta", e.target.value)} data-testid="fin-renda" /></div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="accent-[#2B3A2F]" checked={form.tem_dependentes} onChange={(e) => set("tem_dependentes", e.target.checked)} data-testid="fin-dep" /> Tem dependentes?</label>
            </div>
          </div>

          <div className="border-t border-[#E5E0D8] pt-5">
            <div className="font-serif text-lg text-[#2B3A2F] mb-3">FGTS e entrada</div>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="accent-[#2B3A2F]" checked={form.tem_fgts} onChange={(e) => set("tem_fgts", e.target.checked)} data-testid="fin-tem-fgts" /> Tem FGTS disponível?</label>
              {form.tem_fgts && <div><label className="lm-label">Valor do FGTS (R$)</label><input type="number" className="lm-input" value={form.valor_fgts} onChange={(e) => set("valor_fgts", e.target.value)} data-testid="fin-val-fgts" /></div>}
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" className="accent-[#2B3A2F]" checked={form.tem_entrada} onChange={(e) => set("tem_entrada", e.target.checked)} data-testid="fin-tem-entrada" /> Tem entrada?</label>
              {form.tem_entrada && <div><label className="lm-label">Valor da entrada (R$)</label><input type="number" className="lm-input" value={form.valor_entrada} onChange={(e) => set("valor_entrada", e.target.value)} data-testid="fin-val-entrada" /></div>}
            </div>
          </div>

          <div className="border-t border-[#E5E0D8] pt-5">
            <div className="font-serif text-lg text-[#2B3A2F] mb-3">Expectativa</div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><label className="lm-label">Parcela que gostaria de pagar (R$)</label><input type="number" className="lm-input" value={form.parcela_desejada} onChange={(e) => set("parcela_desejada", e.target.value)} data-testid="fin-parcela" /></div>
              <div><label className="lm-label">Valor do imóvel pretendido (R$) *</label><input required type="number" className="lm-input" value={form.valor_imovel} onChange={(e) => set("valor_imovel", e.target.value)} data-testid="fin-valor-imovel" /></div>
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
            <div className="border border-[#C5A059] bg-[#C5A059]/10 rounded-sm p-4 flex items-start gap-3 text-sm">
              <ShieldCheck className="w-5 h-5 text-[#C5A059] mt-0.5" />
              <div>
                <strong className="text-[#2B3A2F]">Pronto!</strong> A Larissa recebeu sua solicitação e entrará em contato no seu WhatsApp com as melhores opções reais para o seu perfil.
                <a href={waLink(settings.whatsapp, `Olá Larissa! Acabei de preencher a simulação de financiamento em seu site.`)} target="_blank" rel="noreferrer" className="ml-2 font-medium underline">Falar agora <ArrowRight className="w-3 h-3 inline" /></a>
              </div>
            </div>
          )}
        </form>

        {/* Resultado ao vivo */}
        <aside className="lg:col-span-2">
          <div className="sticky top-28 bg-[#2B3A2F] text-[#F4F1EB] rounded-sm p-8" data-testid="financing-result">
            <div className="lm-overline !text-[#C5A059] mb-2">Sua simulação ao vivo</div>
            <div className="font-serif text-2xl mb-6">Sistema SAC · {taxa.toFixed(2)}% a.a.</div>
            {!sim ? (
              <p className="text-[#C9C3B4] text-sm">Preencha o valor do imóvel e o prazo para ver a simulação.</p>
            ) : (
              <div className="space-y-4">
                <ResultRow label="Valor financiado" value={formatMoney(sim.financiado)} />
                <ResultRow label="Entrada + FGTS" value={formatMoney(sim.entradaTotal)} />
                <div className="bg-[#C5A059] text-[#2B3A2F] rounded-sm p-5">
                  <div className="lm-overline !text-[#2B3A2F]/70">Primeira parcela</div>
                  <div className="font-serif text-3xl mt-1">{formatMoney(sim.primeiraParcela)}</div>
                </div>
                <ResultRow label="Última parcela" value={formatMoney(sim.ultimaParcela)} />
                <ResultRow label="Total pago" value={formatMoney(sim.totalPago)} />
                <ResultRow label="Total de juros" value={formatMoney(sim.juros)} />
                {sim.comprometimento > 0 && (
                  <div className={`text-xs rounded-sm px-3 py-2 ${sim.comprometimento > 30 ? "bg-red-900/30 text-red-200" : "bg-[#3D5142] text-[#C9C3B4]"}`}>
                    Comprometimento da renda: <strong>{sim.comprometimento.toFixed(1)}%</strong> {sim.comprometimento > 30 && "(bancos costumam exigir até 30%)"}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}

function ResultRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between border-b border-[#3D5142] pb-2">
      <span className="text-sm text-[#C9C3B4]">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
