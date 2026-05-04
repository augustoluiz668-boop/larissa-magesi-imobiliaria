import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { STAGE_LABELS, ORIGIN_LABELS, STAGES, formatMoney, waLink } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { MessageCircle, Eye, Search, Plus, X } from "lucide-react";
import LeadDetailModal from "./LeadDetailModal";
import { toast } from "sonner";

function followupBadge(proximo_followup) {
  if (!proximo_followup) return null;
  const today = new Date().toISOString().slice(0, 10);
  const due = proximo_followup.slice(0, 10);
  if (due < today) return <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium whitespace-nowrap">Follow-up vencido</span>;
  if (due === today) return <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium whitespace-nowrap">Follow-up hoje</span>;
  return null;
}

const emptyNew = {
  nome: "", whatsapp: "", email: "", origem: "indicacao",
  tipo_imovel: "", finalidade: "comprar", orcamento: "", mensagem: "",
};

function NewLeadModal({ onClose, onSaved }) {
  const [form, setForm] = useState(emptyNew);
  const [saving, setSaving] = useState(false);
  const s = (k, v) => setForm({ ...form, [k]: v });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.whatsapp) return toast.error("Nome e WhatsApp obrigatórios");
    setSaving(true);
    try {
      const { error } = await supabase.from("leads").insert({
        ...form,
        orcamento: Number(form.orcamento) || 0,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast.success("Lead criado com sucesso");
      onSaved();
      onClose();
    } catch { toast.error("Erro ao criar lead"); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-sm w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d1dde8]">
          <h2 className="font-serif text-xl text-[#071d34]">Novo lead manual</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#f8fafc] rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="lm-label">Nome *</label><input required className="lm-input" value={form.nome} onChange={(e) => s("nome", e.target.value)} /></div>
            <div><label className="lm-label">WhatsApp *</label><input required className="lm-input" placeholder="(14) 99999-9999" value={form.whatsapp} onChange={(e) => s("whatsapp", e.target.value)} /></div>
            <div><label className="lm-label">E-mail</label><input type="email" className="lm-input" value={form.email} onChange={(e) => s("email", e.target.value)} /></div>
            <div><label className="lm-label">Origem</label>
              <select className="lm-input" value={form.origem} onChange={(e) => s("origem", e.target.value)}>
                {Object.entries(ORIGIN_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div><label className="lm-label">Tipo de imóvel</label><input className="lm-input" placeholder="Casa, apartamento..." value={form.tipo_imovel} onChange={(e) => s("tipo_imovel", e.target.value)} /></div>
            <div><label className="lm-label">Finalidade</label>
              <select className="lm-input" value={form.finalidade} onChange={(e) => s("finalidade", e.target.value)}>
                <option value="comprar">Comprar</option>
                <option value="alugar">Alugar</option>
                <option value="vender">Vender</option>
                <option value="financiar">Financiar</option>
                <option value="consorcio">Consórcio</option>
                <option value="permutar">Permutar</option>
              </select>
            </div>
            <div className="sm:col-span-2"><label className="lm-label">Orçamento / Entrada (R$)</label><input type="number" className="lm-input" placeholder="Ex: 350000" value={form.orcamento} onChange={(e) => s("orcamento", e.target.value)} /></div>
            <div className="sm:col-span-2"><label className="lm-label">Mensagem / Observação</label><textarea rows={2} className="lm-input" value={form.mensagem} onChange={(e) => s("mensagem", e.target.value)} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="lm-btn-outline">Cancelar</button>
            <button type="submit" disabled={saving} className="lm-btn-primary disabled:opacity-60">
              <Plus className="w-4 h-4" /> {saving ? "Salvando…" : "Criar lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [q, setQ] = useState("");
  const [stage, setStage] = useState("");
  const [origem, setOrigem] = useState("");
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const load = async () => {
    let q2 = supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (stage) q2 = q2.eq("stage", stage);
    if (origem) q2 = q2.eq("origem", origem);
    const { data } = await q2;
    setLeads(data || []);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [stage, origem]);

  const filtered = leads.filter((l) =>
    !q ||
    l.nome.toLowerCase().includes(q.toLowerCase()) ||
    (l.whatsapp || "").includes(q) ||
    (l.cidade_interesse || "").toLowerCase().includes(q.toLowerCase())
  );

  const tempColor = (t) => ({ quente: "bg-red-100 text-red-800", morno: "bg-amber-100 text-amber-800", frio: "bg-sky-100 text-sky-800" }[t] || "bg-gray-100");

  return (
    <AdminLayout
      title="Leads"
      subtitle={`${leads.length} leads cadastrados`}
      actions={
        <div className="flex gap-2 items-center">
          <div className="flex gap-2 items-center bg-white border border-[#d1dde8] rounded-full px-3">
            <Search className="w-4 h-4 text-[#5C5C5C]" />
            <input data-testid="leads-search" className="bg-transparent py-2 outline-none text-sm w-52" placeholder="Buscar por nome, WhatsApp…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <button onClick={() => setShowNew(true)} data-testid="new-lead-btn" className="lm-btn-primary">
            <Plus className="w-4 h-4" /> Novo lead
          </button>
        </div>
      }
    >
      <div className="flex flex-wrap gap-3 mb-5">
        <select data-testid="leads-filter-stage" className="lm-input max-w-xs" value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="">Todas as etapas</option>
          {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
        </select>
        <select data-testid="leads-filter-origem" className="lm-input max-w-xs" value={origem} onChange={(e) => setOrigem(e.target.value)}>
          <option value="">Todas origens</option>
          {Object.entries(ORIGIN_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="bg-white border border-[#d1dde8] rounded-sm overflow-hidden">
        <div className="overflow-x-auto lm-scroll">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f8fafc] text-left text-xs uppercase tracking-wider text-[#5C5C5C]">
              <tr>
                <th className="px-5 py-3">Nome</th>
                <th className="px-5 py-3">Cidade / Tipo</th>
                <th className="px-5 py-3">Orçamento / Entrada</th>
                <th className="px-5 py-3">Origem</th>
                <th className="px-5 py-3">Etapa</th>
                <th className="px-5 py-3">Temp.</th>
                <th className="px-5 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} data-testid={`lead-row-${l.id}`} className="border-t border-[#d1dde8] hover:bg-[#FAFAFA]">
                  <td className="px-5 py-3">
                    <div className="font-medium text-[#2C2C2C] flex items-center flex-wrap gap-1">
                      {l.nome}
                      {followupBadge(l.proximo_followup)}
                    </div>
                    <div className="text-xs text-[#5C5C5C]">{l.whatsapp}</div>
                  </td>
                  <td className="px-5 py-3 text-[#5C5C5C]">
                    <div>{l.cidade_interesse || "—"}</div>
                    <div className="text-xs">{l.tipo_imovel} · {l.finalidade}</div>
                  </td>
                  <td className="px-5 py-3 text-[#2C2C2C]">{formatMoney(l.orcamento)}</td>
                  <td className="px-5 py-3"><span className="lm-pill">{ORIGIN_LABELS[l.origem]}</span></td>
                  <td className="px-5 py-3 text-xs"><span className="px-2 py-1 rounded-full bg-[#f8fafc] border border-[#d1dde8]">{STAGE_LABELS[l.stage]}</span></td>
                  <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded-full text-xs capitalize ${tempColor(l.temperatura)}`}>{l.temperatura}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <a href={waLink(l.whatsapp, `Olá ${l.nome}!`)} target="_blank" rel="noreferrer" className="p-1.5 rounded-full bg-[#071d34] text-[#f8fafc] hover:bg-[#040f1d]" data-testid={`lead-wa-${l.id}`}><MessageCircle className="w-3.5 h-3.5" /></a>
                      <button onClick={() => setSelected(l)} data-testid={`lead-view-${l.id}`} className="p-1.5 rounded-full border border-[#d1dde8] text-[#071d34] hover:bg-[#f8fafc]"><Eye className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-[#5C5C5C]">Nenhum lead encontrado</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <LeadDetailModal lead={selected} onClose={() => { setSelected(null); load(); }} />}
      {showNew && <NewLeadModal onClose={() => setShowNew(false)} onSaved={load} />}
    </AdminLayout>
  );
}
