import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { api } from "../../lib/api";
import { Plus, Pencil, Trash2, X, Star, Save } from "lucide-react";
import { toast } from "sonner";

const empty = { nome: "", cidade: "", texto: "", rating: 5 };

export default function Depoimentos() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = () => api.get("/public/testimonials").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing.id) await api.put(`/admin/testimonials/${editing.id}`, editing);
      else await api.post("/admin/testimonials", editing);
      toast.success("Depoimento salvo");
      setEditing(null);
      load();
    } catch { toast.error("Falha ao salvar"); }
  };

  const remove = async (id) => {
    if (!window.confirm("Excluir depoimento?")) return;
    await api.delete(`/admin/testimonials/${id}`);
    toast.success("Depoimento excluído");
    load();
  };

  return (
    <AdminLayout
      title="Depoimentos"
      subtitle={`${items.length} depoimentos publicados na página Sobre`}
      actions={<button onClick={() => setEditing({ ...empty })} data-testid="add-testimonial-btn" className="lm-btn-primary"><Plus className="w-4 h-4" /> Novo depoimento</button>}
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((t) => (
          <article key={t.id} data-testid={`testimonial-${t.id}`} className="bg-white border border-[#d1dde8] rounded-sm p-6">
            <div className="flex items-center gap-1 text-[#c9a66b] mb-3">
              {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
            </div>
            <blockquote className="font-serif text-lg text-[#071d34] leading-snug">“{t.texto}”</blockquote>
            <div className="mt-4 text-sm text-[#2C2C2C] font-medium">{t.nome}</div>
            <div className="text-xs text-[#5C5C5C]">{t.cidade}</div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-[#d1dde8]">
              <button onClick={() => setEditing(t)} className="p-1.5 rounded-full border border-[#d1dde8] text-[#071d34] hover:bg-[#f8fafc]" data-testid={`edit-test-${t.id}`}><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => remove(t.id)} className="p-1.5 rounded-full border border-[#d1dde8] text-red-700 hover:bg-red-50" data-testid={`delete-test-${t.id}`}><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </article>
        ))}
        {items.length === 0 && <div className="col-span-full text-center py-10 text-[#5C5C5C]">Nenhum depoimento. Clique em "Novo depoimento" para criar o primeiro.</div>}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={save} className="bg-white rounded-sm w-full max-w-xl p-6 space-y-4" data-testid="testimonial-form">
            <div className="flex items-center justify-between">
              <div className="font-serif text-2xl text-[#071d34]">{editing.id ? "Editar depoimento" : "Novo depoimento"}</div>
              <button type="button" onClick={() => setEditing(null)} className="p-2 hover:bg-[#f8fafc] rounded"><X className="w-5 h-5" /></button>
            </div>
            <div><label className="lm-label">Nome *</label><input required className="lm-input" value={editing.nome} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} data-testid="test-nome" /></div>
            <div><label className="lm-label">Cidade</label><input className="lm-input" value={editing.cidade} onChange={(e) => setEditing({ ...editing, cidade: e.target.value })} data-testid="test-cidade" /></div>
            <div><label className="lm-label">Depoimento *</label><textarea rows={5} required className="lm-input" value={editing.texto} onChange={(e) => setEditing({ ...editing, texto: e.target.value })} data-testid="test-texto" /></div>
            <div><label className="lm-label">Avaliação (1-5 estrelas)</label>
              <select className="lm-input max-w-[160px]" value={editing.rating} onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })} data-testid="test-rating">
                {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} estrelas</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#d1dde8]">
              <button type="button" onClick={() => setEditing(null)} className="lm-btn-outline">Cancelar</button>
              <button type="submit" className="lm-btn-primary" data-testid="test-save"><Save className="w-4 h-4" /> Salvar</button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
