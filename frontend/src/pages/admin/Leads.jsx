import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { api, STAGE_LABELS, ORIGIN_LABELS, STAGES, formatMoney, waLink } from "../../lib/api";
import { MessageCircle, Eye, Search } from "lucide-react";
import LeadDetailModal from "./LeadDetailModal";

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [q, setQ] = useState("");
  const [stage, setStage] = useState("");
  const [origem, setOrigem] = useState("");
  const [selected, setSelected] = useState(null);

  const load = async () => {
    const params = {};
    if (stage) params.stage = stage;
    if (origem) params.origem = origem;
    const r = await api.get("/admin/leads", { params });
    setLeads(r.data);
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
        <div className="flex gap-2 items-center bg-white border border-[#E5E0D8] rounded-full px-3">
          <Search className="w-4 h-4 text-[#5C5C5C]" />
          <input data-testid="leads-search" className="bg-transparent py-2 outline-none text-sm w-52" placeholder="Buscar por nome, WhatsApp…" value={q} onChange={(e) => setQ(e.target.value)} />
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

      <div className="bg-white border border-[#E5E0D8] rounded-sm overflow-hidden">
        <div className="overflow-x-auto lm-scroll">
          <table className="min-w-full text-sm">
            <thead className="bg-[#F4F1EB] text-left text-xs uppercase tracking-wider text-[#5C5C5C]">
              <tr>
                <th className="px-5 py-3">Nome</th>
                <th className="px-5 py-3">Cidade / Tipo</th>
                <th className="px-5 py-3">Orçamento</th>
                <th className="px-5 py-3">Origem</th>
                <th className="px-5 py-3">Etapa</th>
                <th className="px-5 py-3">Temp.</th>
                <th className="px-5 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} data-testid={`lead-row-${l.id}`} className="border-t border-[#E5E0D8] hover:bg-[#FAFAFA]">
                  <td className="px-5 py-3">
                    <div className="font-medium text-[#2C2C2C]">{l.nome}</div>
                    <div className="text-xs text-[#5C5C5C]">{l.whatsapp}</div>
                  </td>
                  <td className="px-5 py-3 text-[#5C5C5C]">
                    <div>{l.cidade_interesse || "—"}</div>
                    <div className="text-xs">{l.tipo_imovel} · {l.finalidade}</div>
                  </td>
                  <td className="px-5 py-3 text-[#2C2C2C]">{formatMoney(l.orcamento)}</td>
                  <td className="px-5 py-3"><span className="lm-pill">{ORIGIN_LABELS[l.origem]}</span></td>
                  <td className="px-5 py-3 text-xs"><span className="px-2 py-1 rounded-full bg-[#F4F1EB] border border-[#E5E0D8]">{STAGE_LABELS[l.stage]}</span></td>
                  <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded-full text-xs capitalize ${tempColor(l.temperatura)}`}>{l.temperatura}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <a href={waLink(l.whatsapp, `Olá ${l.nome}!`)} target="_blank" rel="noreferrer" className="p-1.5 rounded-full bg-[#2B3A2F] text-[#F4F1EB] hover:bg-[#1F2A22]" data-testid={`lead-wa-${l.id}`}><MessageCircle className="w-3.5 h-3.5" /></a>
                      <button onClick={() => setSelected(l)} data-testid={`lead-view-${l.id}`} className="p-1.5 rounded-full border border-[#E5E0D8] text-[#2B3A2F] hover:bg-[#F4F1EB]"><Eye className="w-3.5 h-3.5" /></button>
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
    </AdminLayout>
  );
}
