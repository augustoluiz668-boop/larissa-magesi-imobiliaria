import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { api, STAGES, STAGE_LABELS, ORIGIN_LABELS, formatMoney, waLink } from "../../lib/api";
import { MessageCircle, Eye, Thermometer } from "lucide-react";
import LeadDetailModal from "./LeadDetailModal";
import { toast } from "sonner";

const stageTint = {
  novo: "bg-sky-50 border-sky-200",
  primeiro_contato: "bg-orange-50 border-orange-200",
  qualificacao: "bg-purple-50 border-purple-200",
  imoveis_enviados: "bg-emerald-50 border-emerald-200",
  visita_agendada: "bg-amber-50 border-amber-200",
  proposta: "bg-rose-50 border-rose-200",
  negociacao: "bg-cyan-50 border-cyan-200",
  fechado: "bg-green-100 border-green-300",
  perdido: "bg-red-50 border-red-200",
};

export default function FunilPage() {
  const [leads, setLeads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [over, setOver] = useState(null);

  const load = () => api.get("/admin/leads").then((r) => setLeads(r.data));
  useEffect(() => { load(); }, []);

  const onDragStart = (e, id) => { setDraggingId(id); e.dataTransfer.effectAllowed = "move"; };
  const onDragOver = (e, s) => { e.preventDefault(); setOver(s); };
  const onDrop = async (e, targetStage) => {
    e.preventDefault();
    setOver(null);
    const id = draggingId;
    if (!id) return;
    const lead = leads.find((l) => l.id === id);
    if (!lead || lead.stage === targetStage) { setDraggingId(null); return; }
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, stage: targetStage } : l)));
    setDraggingId(null);
    try {
      await api.patch(`/admin/leads/${id}`, { stage: targetStage });
      toast.success(`Lead movido para "${STAGE_LABELS[targetStage]}"`);
    } catch {
      toast.error("Falha ao mover. Recarregando…");
      load();
    }
  };

  return (
    <AdminLayout
      title="Funil de Leads"
      subtitle="Arraste os cards entre as etapas para atualizar o status"
    >
      <div className="overflow-x-auto lm-scroll pb-4" data-testid="kanban-board">
        <div className="flex gap-4 min-w-max">
          {STAGES.map((stage) => {
            const items = leads.filter((l) => l.stage === stage);
            return (
              <div
                key={stage}
                onDragOver={(e) => onDragOver(e, stage)}
                onDragLeave={() => setOver(null)}
                onDrop={(e) => onDrop(e, stage)}
                className={`kanban-col w-80 flex-shrink-0 rounded-sm border ${stageTint[stage]} ${over === stage ? "dragover ring-2 ring-[#c9a66b]" : ""}`}
                data-testid={`kanban-col-${stage}`}
              >
                <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                  <div>
                    <div className="font-serif text-lg text-[#071d34] leading-tight">{STAGE_LABELS[stage]}</div>
                    <div className="text-xs text-[#5C5C5C]">{items.length} lead{items.length === 1 ? "" : "s"}</div>
                  </div>
                </div>
                <div className="p-3 space-y-3 min-h-[200px]">
                  {items.map((l) => (
                    <div
                      key={l.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, l.id)}
                      data-testid={`kanban-card-${l.id}`}
                      className={`kanban-card bg-white border border-[#d1dde8] rounded-sm p-4 shadow-sm ${draggingId === l.id ? "dragging" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium text-[#2C2C2C] leading-tight">{l.nome}</div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize flex items-center gap-1 ${
                          l.temperatura === "quente" ? "bg-red-100 text-red-700" : l.temperatura === "morno" ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"
                        }`}><Thermometer className="w-3 h-3" /> {l.temperatura}</span>
                      </div>
                      <div className="text-xs text-[#5C5C5C] mt-1">{l.whatsapp}</div>
                      <div className="text-xs mt-2 text-[#2C2C2C]">{l.cidade_interesse} · {l.tipo_imovel}</div>
                      <div className="text-xs mt-1 text-[#5C5C5C]">{l.finalidade} · {formatMoney(l.orcamento)}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="lm-pill text-[10px]">{ORIGIN_LABELS[l.origem]}</span>
                        <div className="flex gap-1">
                          <a href={waLink(l.whatsapp, `Olá ${l.nome}!`)} target="_blank" rel="noreferrer" className="p-1.5 rounded-full bg-[#071d34] text-[#f8fafc] hover:bg-[#040f1d]" data-testid={`kanban-wa-${l.id}`}><MessageCircle className="w-3 h-3" /></a>
                          <button onClick={() => setSelected(l)} className="p-1.5 rounded-full border border-[#d1dde8] hover:bg-[#f8fafc]" data-testid={`kanban-view-${l.id}`}><Eye className="w-3 h-3" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && <div className="text-xs text-[#5C5C5C]/60 text-center py-4">Solte aqui</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selected && <LeadDetailModal lead={selected} onClose={() => { setSelected(null); load(); }} />}
    </AdminLayout>
  );
}
