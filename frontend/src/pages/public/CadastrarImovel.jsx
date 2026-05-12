import React, { useState } from "react";
import { ArrowRight, Home, Check } from "lucide-react";
import { waLink, maskPhone, maskCurrency, parseCurrency } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

export default function CadastrarImovel({ settings = {} }) {
  const [form, setForm] = useState({
    nome: "", whatsapp: "", email: "",
    tipo: "", finalidade: "venda_locacao", endereco: "", bairro: "", cidade: "",
    valor: "", descricao: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k, v) => setForm({ ...form, [k]: v });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.whatsapp) return toast.error("Preencha nome e WhatsApp.");
    setSending(true);
    try {
      const msg = `Quero cadastrar meu imóvel — Tipo: ${form.tipo || "não informado"} | Finalidade: ${form.finalidade} | Endereço: ${form.endereco || "não informado"}, ${form.bairro || ""}, ${form.cidade || ""} | Valor: ${form.valor || "não informado"} | ${form.descricao}`;
      const { error } = await supabase.from("leads").insert({
        nome: form.nome,
        whatsapp: form.whatsapp,
        email: form.email,
        tipo_imovel: form.tipo,
        finalidade: form.finalidade,
        orcamento: parseCurrency(form.valor),
        mensagem: msg,
        origem: "site",
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      setSent(true);
      toast.success("Cadastro recebido! Entrarei em contato em breve.");
    } catch {
      toast.error("Não foi possível enviar. Tente novamente.");
    } finally {
      setSending(false);
    }
  };

  const beneficios = [
    "Avaliação profissional do seu imóvel",
    "Divulgação nos principais portais e redes sociais",
    "Atendimento de compradores/locatários qualificados",
    "Acompanhamento jurídico e documental completo",
    "Negociação profissional para melhores condições",
    "Suporte até o pós-venda",
  ];

  return (
    <div>
      {/* HERO */}
      <section className="bg-[#071d34] text-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-xs tracking-[0.25em] uppercase text-[#c9a66b] mb-5">Proprietários</div>
            <h1 className="font-serif text-5xl md:text-6xl leading-tight">
              Quero cadastrar meu imóvel
            </h1>
            <p className="text-[#a8b8cc] mt-6 max-w-md leading-relaxed">
              Com um trabalho de marketing irei prospectar interessados qualificados e conduzir a negociação com profissionalismo — do anúncio ao pós-venda.
            </p>
          </div>
          <div className="bg-[#0d2d4c]/50 border border-[#0d2d4c] rounded-sm p-8">
            <div className="lm-overline !text-[#c9a66b] mb-5">Por que trabalhar comigo</div>
            <ul className="space-y-3">
              {beneficios.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-[#E8E2D6]">
                  <Check className="w-4 h-4 text-[#c9a66b] mt-0.5 flex-shrink-0" /> {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-10 py-16 grid lg:grid-cols-3 gap-10">
        {/* FORM */}
        <div className="lg:col-span-2">
          {sent ? (
            <div className="bg-white border border-[#d1dde8] rounded-sm p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-[#c9a66b]/15 flex items-center justify-center mx-auto mb-6">
                <Home className="w-7 h-7 text-[#c9a66b]" />
              </div>
              <h2 className="font-serif text-3xl text-[#071d34] mb-3">Cadastro recebido!</h2>
              <p className="text-[#5C5C5C] mb-6">
                Analisarei as informações do seu imóvel e entrarei em contato para agendar uma visita e avaliação.
              </p>
              <a
                href={waLink(settings.whatsapp, "Olá Larissa! Acabei de cadastrar meu imóvel no seu site e gostaria de mais informações.")}
                target="_blank"
                rel="noreferrer"
                className="lm-btn-gold inline-flex"
              >
                Falar agora no WhatsApp <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <form onSubmit={submit} data-testid="cadastrar-form" className="bg-white border border-[#d1dde8] rounded-sm p-8 space-y-5">
              <div className="font-serif text-2xl text-[#071d34]">Dados do proprietário</div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="lm-label">Nome completo *</label>
                  <input required className="lm-input" value={form.nome} onChange={(e) => set("nome", e.target.value)} data-testid="cad-nome" />
                </div>
                <div>
                  <label className="lm-label">WhatsApp *</label>
                  <input required className="lm-input" placeholder="(14) 99999-9999" value={form.whatsapp} onChange={(e) => set("whatsapp", maskPhone(e.target.value))} data-testid="cad-whatsapp" />
                </div>
                <div className="sm:col-span-2">
                  <label className="lm-label">E-mail</label>
                  <input type="email" className="lm-input" value={form.email} onChange={(e) => set("email", e.target.value)} />
                </div>
              </div>

              <div className="border-t border-[#d1dde8] pt-5">
                <div className="font-serif text-lg text-[#071d34] mb-3">Informações do imóvel</div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="lm-label">Tipo do imóvel</label>
                    <select className="lm-input" value={form.tipo} onChange={(e) => set("tipo", e.target.value)} data-testid="cad-tipo">
                      <option value="">Selecione...</option>
                      <option value="casa">Casa</option>
                      <option value="apartamento">Apartamento</option>
                      <option value="condominio">Condomínio</option>
                      <option value="terreno">Terreno</option>
                      <option value="comercial">Comercial</option>
                      <option value="chacara">Chácara</option>
                    </select>
                  </div>
                  <div>
                    <label className="lm-label">Pretendo</label>
                    <select className="lm-input" value={form.finalidade} onChange={(e) => set("finalidade", e.target.value)} data-testid="cad-finalidade">
                      <option value="venda">Venda</option>
                      <option value="locacao">Locação</option>
                      <option value="venda_locacao">Locação e Venda</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="lm-label">Endereço / Referência</label>
                    <input className="lm-input" placeholder="Rua, número ou referência" value={form.endereco} onChange={(e) => set("endereco", e.target.value)} />
                  </div>
                  <div>
                    <label className="lm-label">Bairro</label>
                    <input className="lm-input" value={form.bairro} onChange={(e) => set("bairro", e.target.value)} />
                  </div>
                  <div>
                    <label className="lm-label">Cidade</label>
                    <input className="lm-input" value={form.cidade} onChange={(e) => set("cidade", e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="lm-label">Valor pretendido (R$)</label>
                    <input className="lm-input" placeholder="R$ 0,00" value={form.valor} onChange={(e) => set("valor", maskCurrency(e.target.value))} />
                  </div>
                </div>
              </div>

              <div>
                <label className="lm-label">Descreva o imóvel</label>
                <textarea
                  rows={4}
                  className="lm-input"
                  placeholder="Número de quartos, banheiros, vagas, área (m²), características especiais, estado de conservação..."
                  value={form.descricao}
                  onChange={(e) => set("descricao", e.target.value)}
                  data-testid="cad-descricao"
                />
              </div>

              <button type="submit" disabled={sending} data-testid="cad-submit" className="lm-btn-gold w-full justify-center disabled:opacity-60">
                <Home className="w-4 h-4" /> {sending ? "Enviando…" : "Cadastrar meu imóvel"}
              </button>
              <p className="text-xs text-[#5C5C5C] text-center">Seus dados estão protegidos. Entrarei em contato pelo WhatsApp para agendar uma visita.</p>
            </form>
          )}
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-5">
          <div className="bg-[#071d34] text-[#f8fafc] rounded-sm p-7">
            <div className="lm-overline !text-[#c9a66b] mb-3">Como funciona</div>
            <ol className="space-y-4 text-sm leading-relaxed text-[#E8E2D6]">
              <li><span className="font-serif text-[#c9a66b] text-lg mr-2">1.</span> Você preenche o formulário com os dados do imóvel.</li>
              <li><span className="font-serif text-[#c9a66b] text-lg mr-2">2.</span> Entro em contato para agendar uma visita e avaliação do imóvel.</li>
              <li><span className="font-serif text-[#c9a66b] text-lg mr-2">3.</span> Crio um anúncio profissional com fotos e divulgação.</li>
              <li><span className="font-serif text-[#c9a66b] text-lg mr-2">4.</span> Apresento compradores qualificados e conduzo a negociação.</li>
              <li><span className="font-serif text-[#c9a66b] text-lg mr-2">5.</span> Acompanho toda a documentação até o pós-venda.</li>
            </ol>
          </div>

          <div className="bg-white border border-[#d1dde8] rounded-sm p-7">
            <div className="lm-overline mb-3">Prefere conversar primeiro?</div>
            <p className="text-sm text-[#5C5C5C] mb-5">Mande uma mensagem direto no WhatsApp e conversamos sobre o seu imóvel.</p>
            <a href={waLink(settings.whatsapp)} target="_blank" rel="noreferrer" className="lm-btn-primary w-full justify-center">
              WhatsApp <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </aside>
      </section>
    </div>
  );
}
