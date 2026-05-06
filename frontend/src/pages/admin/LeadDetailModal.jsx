import React, { useState } from "react";
import { STAGES, STAGE_LABELS, ORIGIN_LABELS, formatMoney, waLink } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { X, MessageCircle, CheckCircle2, XCircle, Save } from "lucide-react";
import { toast } from "sonner";

export default function LeadDetailModal({ lead, onClose }) {
  const [l, setL] = useState(lead);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [followupDate, setFollowupDate] = useState(lead.proximo_followup || "");

  const patch = async (updates) => {
    setSaving(true);
    try {
      const { data, error } = await supabase.from("leads").update(updates).eq("id", l.id).select().single();
      if (error) throw error;
      setL(data);
      toast.success("Lead atualizado");
    } catch {
      toast.error("Falha ao atualizar");
    } finally { setSaving(false); }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    const notas = [...(l.notas || []), { texto: note, created_at: new Date().toISOString() }];
    const { data, error } = await supabase.from("leads").update({ notas }).eq("id", l.id).select().single();
    if (!error && data) { setL(data); setNote(""); toast.success("Observacao adicionada"); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto" data-testid="lead-detail-modal">
      <div className="bg-white rounded-sm w-full max-w-3xl my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d1dde8]">
          <div>
            <div className="lm-overline">Detalhes do lead</div>
            <h2 className="font-serif text-2xl text-[#071d34]">{l.nome}</h2>
          </div>
          <button onClick={onClose} data-testid="modal-close" className="p-2 hover:bg-[#f8fafc] rounded"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-3 gap-3 text-sm">
            <Info label="WhatsApp" value={l.whatsapp} />
            <Info label="E-mail" value={l.email || "--"} />
            <Info label="Origem" value={ORIGIN_LABELS[l.origem] || l.origem} />
            <Info label="Cidade" value={l.cidade_interesse || "--"} />
            <Info label="Bairro" value={l.bairro_interesse || "--"} />
            <Info label="Tipo" value={l.tipo_imovel || "--"} />
            <Info label="Finalidade" value={l.finalidade || "--"} />
            <Info label="Orcamento" value={formatMoney(l.orcamento) || "--"} />
            <Info label="Urgencia" value={l.urgencia || "--"} />
            <Info label="Forma pagamento" value={l.forma_pagamento || "--"} />
            <Info label="Prazo decisao" value={l.prazo_decisao || "--"} />
            <Info label="Cadastrado" value={new Date(l.created_at).toLocaleDateString("pt-BR")} />
          </div>

          {l.mensagem && (() => {
            let msg = l.mensagem;
            try {
              const parsed = JSON.parse(msg);
              if (typeof parsed === "object") {
                msg = Object.entries(parsed).map(([k, v]) => `${k}: ${v}`).join(" | ");
              }
            } catch (err) {}
            return (
              <div className="bg-[#f8fafc] border border-[#d1dde8] rounded-sm p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#5C5C5C] mb-2">Mensagem</div>
                <p className="text-sm text-[#071d34] leading-relaxed font-medium">{msg}</p>
              </div>
            );
          })()}

          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="lm-label">Etapa do funil</label>
              <select data-testid="modal-stage" className="lm-input" value={l.stage} onChange={(e) => patch({ stage: e.target.value })}>
                {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="lm-label">Temperatura</label>
              <select data-testid="modal-temp" className="lm-input" value={l.temperatura} onChange={(e) => patch({ temperatura: e.target.value })}>
                <option value="quente">Quente</option><option value="morno">Morno</option><option value="frio">Frio</option>
              </select>
            </div>
            <div>
              <label className="lm-label">Proximo follow-up</label>
              <input data-testid="modal-followup" type="date" className="lm-input" value={followupDate} onChange={(e) => setFollowupDate(e.target.value)} onBlur={(e) => patch({ proximo_followup: e.target.value || null })} />
            </div>
          </div>

          <div>
            <label className="lm-label">Adicionar observacao / historico</label>
            <div className="flex gap-2">
              <input data-testid="modal-note-input" className="lm-input flex-1" placeholder="Ex: Cliente pediu para retornar na terca" value={note} onChange={(e) => setNote(e.target.value)} />
              <button onClick={addNote} data-testid="modal-note-add" className="lm-btn-primary"><Save className="w-4 h-4" /> Salvar</button>
            </div>
          </div>

          <div>
            <div className="lm-overline mb-2">Historico de interacoes</div>
            <div className="space-y-2 max-h-52 overflow-y-auto lm-scroll pr-2">
              {(l.historico || []).slice().reverse().map((h, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="text-xs text-[#5C5C5C] flex-shrink-0 w-28">{new Date(h.data).toLocaleString("pt-BR")}</span>
                  <span className="text-[#2C2C2C]">{h.texto}</span>
                </div>
              ))}
              {(!l.historico || l.historico.length === 0) && <div className="text-sm text-[#5C5C5C]">Sem historico ainda.</div>}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t border-[#d1dde8]">
            <a href={waLink(l.whatsapp, "Ola " + l.nome + "!")} target="_blank" rel="noreferrer" data-testid="modal-wa" className="lm-btn-primary"><MessageCircle className="w-4 h-4" /> Chamar no WhatsApp</a>
            <button onClick={() => patch({ stage: "fechado" })} disabled={saving} data-testid="modal-mark-closed" className="lm-btn-gold"><CheckCircle2 className="w-4 h-4" /> Marcar como fechado</button>
            <button onClick={() => patch({ stage: "perdido" })} disabled={saving} data-testid="modal-mark-lost" className="lm-btn-outline"><XCircle className="w-4 h-4" /> Marcar como perdido</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="lm-overline">{label}</div>
      <div className="text-[#2C2C2C]">{value}</div>
    </div>
  );
}
