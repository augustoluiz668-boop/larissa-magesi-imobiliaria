import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, formatMoney, waLink, TYPE_LABELS, PURPOSE_LABELS } from "../../lib/api";
import { Bed, Bath, Car, Ruler, MapPin, MessageCircle, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";

export default function ImovelDetail({ settings = {} }) {
  const { id } = useParams();
  const [prop, setProp] = useState(null);
  const [photo, setPhoto] = useState(0);
  const [form, setForm] = useState({ nome: "", whatsapp: "", mensagem: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get(`/public/properties/${id}`).then((r) => setProp(r.data)).catch(() => setProp(null));
  }, [id]);

  if (!prop) {
    return <div className="max-w-7xl mx-auto px-6 py-24 text-center text-[#5C5C5C]">Carregando imóvel…</div>;
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.whatsapp) return toast.error("Preencha nome e WhatsApp");
    setSending(true);
    try {
      await api.post("/public/leads", {
        ...form, cidade_interesse: prop.cidade, bairro_interesse: prop.bairro,
        tipo_imovel: prop.tipo, finalidade: "comprar", origem: "site",
        mensagem: `[${prop.codigo}] ${prop.titulo} — ${form.mensagem}`,
      });
      toast.success("Interesse enviado! Larissa entrará em contato.");
      setForm({ nome: "", whatsapp: "", mensagem: "" });
    } catch {
      toast.error("Falha ao enviar.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
      <Link to="/imoveis" className="inline-flex items-center gap-1 text-sm text-[#2B3A2F] mb-6 hover:text-[#C5A059]" data-testid="back-to-list">
        <ArrowLeft className="w-4 h-4" /> Voltar aos imóveis
      </Link>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <img src={prop.fotos?.[photo]} alt={prop.titulo} className="w-full h-[440px] object-cover rounded-sm" />
          <div className="flex gap-2 mt-3 overflow-x-auto lm-scroll">
            {(prop.fotos || []).map((f, i) => (
              <button key={i} onClick={() => setPhoto(i)} className={`flex-shrink-0 w-24 h-20 rounded-sm overflow-hidden border-2 ${photo === i ? "border-[#C5A059]" : "border-transparent"}`}>
                <img src={f} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          <div className="mt-8">
            <div className="flex items-center gap-2 text-xs text-[#5C5C5C]"><MapPin className="w-3 h-3" /> {prop.bairro}, {prop.cidade}</div>
            <h1 className="font-serif text-4xl text-[#2B3A2F] mt-2 leading-tight">{prop.titulo}</h1>
            <div className="flex items-center gap-3 mt-3 text-xs">
              <span className="lm-pill-filled lm-pill" style={{ borderColor: "#2B3A2F" }}>{PURPOSE_LABELS[prop.finalidade]}</span>
              <span className="text-[#5C5C5C]">Cód. {prop.codigo}</span>
              <span className="text-[#5C5C5C]">{TYPE_LABELS[prop.tipo]}</span>
            </div>

            <div className="mt-6 text-3xl font-serif text-[#2B3A2F]">{formatMoney(prop.valor, prop.finalidade)}</div>
            {prop.condominio > 0 && <div className="text-sm text-[#5C5C5C]">Condomínio: {formatMoney(prop.condominio)}/mês</div>}
            {prop.iptu > 0 && <div className="text-sm text-[#5C5C5C]">IPTU: {formatMoney(prop.iptu)}/ano</div>}

            <div className="grid grid-cols-4 gap-3 mt-8 max-w-lg">
              <div className="text-center bg-white border border-[#E5E0D8] p-4 rounded-sm">
                <Ruler className="w-5 h-5 mx-auto text-[#2B3A2F]" />
                <div className="text-sm mt-1 font-medium">{prop.metragem}m²</div>
              </div>
              {prop.quartos > 0 && <div className="text-center bg-white border border-[#E5E0D8] p-4 rounded-sm">
                <Bed className="w-5 h-5 mx-auto text-[#2B3A2F]" />
                <div className="text-sm mt-1 font-medium">{prop.quartos} quartos</div>
              </div>}
              {prop.banheiros > 0 && <div className="text-center bg-white border border-[#E5E0D8] p-4 rounded-sm">
                <Bath className="w-5 h-5 mx-auto text-[#2B3A2F]" />
                <div className="text-sm mt-1 font-medium">{prop.banheiros} banh.</div>
              </div>}
              {prop.vagas > 0 && <div className="text-center bg-white border border-[#E5E0D8] p-4 rounded-sm">
                <Car className="w-5 h-5 mx-auto text-[#2B3A2F]" />
                <div className="text-sm mt-1 font-medium">{prop.vagas} vagas</div>
              </div>}
            </div>

            <div className="mt-8">
              <div className="lm-overline mb-2">Descrição</div>
              <p className="text-[#5C5C5C] leading-relaxed">{prop.descricao}</p>
              {prop.endereco && <p className="text-sm text-[#5C5C5C] mt-3"><MapPin className="inline w-3 h-3 mr-1" />{prop.endereco}</p>}
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {prop.aceita_financiamento && <span className="lm-pill">Aceita financiamento</span>}
              {prop.aceita_consorcio && <span className="lm-pill">Aceita consórcio</span>}
              {prop.aceita_permuta && <span className="lm-pill">Aceita permuta</span>}
            </div>
          </div>
        </div>

        <aside className="md:col-span-1">
          <div className="sticky top-28 space-y-4">
            <a href={waLink(settings.whatsapp, `Olá Larissa! Tenho interesse no imóvel ${prop.codigo} — ${prop.titulo}.`)}
              target="_blank" rel="noreferrer" data-testid="detail-wa-btn"
              className="lm-btn-primary w-full justify-center">
              <MessageCircle className="w-4 h-4" /> Chamar no WhatsApp
            </a>
            <form onSubmit={submit} className="bg-white border border-[#E5E0D8] p-6 rounded-sm space-y-3">
              <div className="font-serif text-xl text-[#2B3A2F]">Tenho interesse</div>
              <input data-testid="detail-form-nome" placeholder="Seu nome" className="lm-input" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              <input data-testid="detail-form-whatsapp" placeholder="WhatsApp" className="lm-input" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
              <textarea data-testid="detail-form-msg" rows={3} placeholder="Mensagem" className="lm-input" value={form.mensagem} onChange={(e) => setForm({ ...form, mensagem: e.target.value })} />
              <button disabled={sending} data-testid="detail-form-submit" className="lm-btn-primary w-full justify-center disabled:opacity-60">
                {sending ? "Enviando…" : "Enviar interesse"}
              </button>
              <div className="text-[11px] text-[#5C5C5C] flex items-center gap-1"><Check className="w-3 h-3 text-[#C5A059]" /> Resposta em até 24h</div>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
