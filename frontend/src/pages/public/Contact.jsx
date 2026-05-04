import React, { useState } from "react";
import { ArrowRight, Send, MapPin, Phone, Mail, Clock } from "lucide-react";
import { waLink } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

export default function Contact({ settings = {} }) {
  const [form, setForm] = useState({
    nome: "", whatsapp: "", email: "", tipo: "", finalidade: "", orcamento: "", mensagem: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k, v) => setForm({ ...form, [k]: v });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.whatsapp) return toast.error("Preencha nome e WhatsApp.");
    setSending(true);
    try {
      const { error } = await supabase.from("leads").insert({
        nome: form.nome,
        whatsapp: form.whatsapp,
        email: form.email,
        tipo_imovel: form.tipo,
        finalidade: form.finalidade || "comprar",
        orcamento: Number(form.orcamento) || 0,
        mensagem: form.mensagem,
        origem: "site",
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      setSent(true);
      toast.success("Mensagem enviada! Entrarei em contato em breve.");
    } catch {
      toast.error("Não foi possível enviar. Tente novamente.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      {/* HERO */}
      <section className="bg-[#071d34] text-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-20">
          <div className="text-xs tracking-[0.25em] uppercase text-[#c9a66b] mb-5">Fale comigo</div>
          <h1 className="font-serif text-5xl md:text-6xl leading-tight max-w-2xl">
            Me conte o que você está procurando
          </h1>
          <p className="text-[#a8b8cc] mt-6 max-w-xl leading-relaxed">
            Preencha o formulário e entrarei em contato com opções compatíveis com o seu perfil e momento de vida.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-10 py-16 grid lg:grid-cols-5 gap-10">
        {/* FORM */}
        <div className="lg:col-span-3">
          {sent ? (
            <div className="bg-white border border-[#d1dde8] rounded-sm p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-[#c9a66b]/15 flex items-center justify-center mx-auto mb-6">
                <Send className="w-7 h-7 text-[#c9a66b]" />
              </div>
              <h2 className="font-serif text-3xl text-[#071d34] mb-3">Mensagem recebida!</h2>
              <p className="text-[#5C5C5C] mb-6">
                Analisarei seu perfil e entrarei em contato pelo WhatsApp com as melhores opções para você.
              </p>
              <a
                href={waLink(settings.whatsapp, "Olá Larissa! Acabei de preencher o formulário de contato no seu site.")}
                target="_blank"
                rel="noreferrer"
                className="lm-btn-gold inline-flex"
              >
                Falar agora no WhatsApp <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <form onSubmit={submit} data-testid="contact-form" className="bg-white border border-[#d1dde8] rounded-sm p-8 space-y-5">
              <div className="font-serif text-2xl text-[#071d34]">Seus dados</div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="lm-label">Nome completo *</label>
                  <input
                    required
                    className="lm-input"
                    value={form.nome}
                    onChange={(e) => set("nome", e.target.value)}
                    data-testid="contact-nome"
                  />
                </div>
                <div>
                  <label className="lm-label">WhatsApp *</label>
                  <input
                    required
                    className="lm-input"
                    placeholder="(14) 99999-9999"
                    value={form.whatsapp}
                    onChange={(e) => set("whatsapp", e.target.value)}
                    data-testid="contact-whatsapp"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="lm-label">E-mail</label>
                  <input
                    type="email"
                    className="lm-input"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </div>
              </div>

              <div className="border-t border-[#d1dde8] pt-5">
                <div className="font-serif text-lg text-[#071d34] mb-3">O que você procura</div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="lm-label">Tipo de imóvel</label>
                    <select className="lm-input" value={form.tipo} onChange={(e) => set("tipo", e.target.value)} data-testid="contact-tipo">
                      <option value="">Todos os tipos</option>
                      <option value="casa">Casa</option>
                      <option value="apartamento">Apartamento</option>
                      <option value="condominio">Condomínio</option>
                      <option value="terreno">Terreno</option>
                      <option value="comercial">Comercial</option>
                      <option value="chacara">Chácara</option>
                    </select>
                  </div>
                  <div>
                    <label className="lm-label">Finalidade</label>
                    <select className="lm-input" value={form.finalidade} onChange={(e) => set("finalidade", e.target.value)} data-testid="contact-finalidade">
                      <option value="">Comprar ou Alugar</option>
                      <option value="comprar">Comprar</option>
                      <option value="alugar">Alugar</option>
                      <option value="financiar">Financiar</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="lm-label">Faixa de orçamento (R$)</label>
                    <input
                      type="number"
                      className="lm-input"
                      placeholder="Ex: 350000"
                      value={form.orcamento}
                      onChange={(e) => set("orcamento", e.target.value)}
                      data-testid="contact-orcamento"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="lm-label">Mensagem (opcional)</label>
                <textarea
                  rows={4}
                  className="lm-input"
                  placeholder="Descreva o imóvel que você busca: bairro preferido, número de quartos, características importantes..."
                  value={form.mensagem}
                  onChange={(e) => set("mensagem", e.target.value)}
                  data-testid="contact-mensagem"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                data-testid="contact-submit"
                className="lm-btn-primary w-full justify-center disabled:opacity-60"
              >
                <Send className="w-4 h-4" /> {sending ? "Enviando…" : "Enviar mensagem"}
              </button>
              <p className="text-xs text-[#5C5C5C] text-center">Seus dados estão protegidos. Entrarei em contato pelo WhatsApp.</p>
            </form>
          )}
        </div>

        {/* SIDEBAR INFO */}
        <aside className="lg:col-span-2 space-y-6">
          <div className="bg-[#071d34] text-[#f8fafc] rounded-sm p-8">
            <div className="lm-overline !text-[#c9a66b] mb-4">Informações de contato</div>
            <ul className="space-y-5 text-sm">
              {settings.telefone && (
                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#c9a66b]/15 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-[#c9a66b]" />
                  </div>
                  <div>
                    <div className="text-[#a8b8cc] text-xs mb-0.5">Telefone / WhatsApp</div>
                    <a href={`tel:${(settings.telefone || "").replace(/\D/g, "")}`} className="hover:text-[#c9a66b]">{settings.telefone}</a>
                  </div>
                </li>
              )}
              {settings.email && (
                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#c9a66b]/15 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-[#c9a66b]" />
                  </div>
                  <div>
                    <div className="text-[#a8b8cc] text-xs mb-0.5">E-mail</div>
                    <a href={`mailto:${settings.email}`} className="hover:text-[#c9a66b] break-all">{settings.email}</a>
                  </div>
                </li>
              )}
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#c9a66b]/15 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-[#c9a66b]" />
                </div>
                <div>
                  <div className="text-[#a8b8cc] text-xs mb-0.5">Área de atuação</div>
                  <span>{settings.cidade || "Bauru"} e região</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#c9a66b]/15 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-[#c9a66b]" />
                </div>
                <div>
                  <div className="text-[#a8b8cc] text-xs mb-0.5">Atendimento</div>
                  <span>Horários flexíveis · Seg–Sab</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white border border-[#d1dde8] rounded-sm p-8">
            <div className="lm-overline mb-3">Prefere o WhatsApp?</div>
            <p className="text-sm text-[#5C5C5C] mb-5">Mande uma mensagem direta e responderei o mais rápido possível.</p>
            <a
              href={waLink(settings.whatsapp)}
              target="_blank"
              rel="noreferrer"
              className="lm-btn-gold w-full justify-center"
            >
              Abrir WhatsApp <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </aside>
      </section>
    </div>
  );
}
