import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { api, formatMoney, TYPE_LABELS, PURPOSE_LABELS, waLink } from "../../lib/api";
import { Plus, Pencil, Trash2, MessageCircle, Star, X } from "lucide-react";
import { toast } from "sonner";

const empty = {
  titulo: "", tipo: "casa", finalidade: "venda", cidade: "Bauru", bairro: "", endereco: "",
  valor: 0, condominio: 0, iptu: 0, metragem: 0, quartos: 0, banheiros: 0, vagas: 0,
  aceita_financiamento: false, aceita_consorcio: false, aceita_permuta: false,
  descricao: "", fotos: [""], status: "disponivel", proprietario: "", destaque: false,
};

export default function ImoveisAdmin() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState({ tipo: "", status: "", cidade: "" });

  const load = () => api.get("/admin/properties").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    const payload = {
      ...editing,
      valor: Number(editing.valor) || 0,
      condominio: Number(editing.condominio) || 0,
      iptu: Number(editing.iptu) || 0,
      metragem: Number(editing.metragem) || 0,
      quartos: Number(editing.quartos) || 0,
      banheiros: Number(editing.banheiros) || 0,
      vagas: Number(editing.vagas) || 0,
      fotos: (editing.fotos || []).filter(Boolean),
    };
    try {
      if (editing.id) await api.put(`/admin/properties/${editing.id}`, payload);
      else await api.post("/admin/properties", payload);
      toast.success(editing.id ? "Imóvel atualizado" : "Imóvel cadastrado");
      setEditing(null);
      load();
    } catch (e) {
      toast.error("Falha ao salvar");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Excluir imóvel?")) return;
    await api.delete(`/admin/properties/${id}`);
    toast.success("Imóvel excluído");
    load();
  };

  const filtered = items.filter((p) =>
    (!filter.tipo || p.tipo === filter.tipo) &&
    (!filter.status || p.status === filter.status) &&
    (!filter.cidade || p.cidade.toLowerCase().includes(filter.cidade.toLowerCase()))
  );

  return (
    <AdminLayout
      title="Imóveis"
      subtitle={`${items.length} imóveis cadastrados`}
      actions={<button onClick={() => setEditing({ ...empty })} data-testid="add-property-btn" className="lm-btn-primary"><Plus className="w-4 h-4" /> Novo imóvel</button>}
    >
      <div className="flex flex-wrap gap-3 mb-5">
        <select className="lm-input max-w-xs" value={filter.tipo} onChange={(e) => setFilter({ ...filter, tipo: e.target.value })} data-testid="filter-prop-tipo">
          <option value="">Todos os tipos</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="lm-input max-w-xs" value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} data-testid="filter-prop-status">
          <option value="">Todos os status</option>
          <option value="disponivel">Disponível</option><option value="reservado">Reservado</option>
          <option value="vendido">Vendido</option><option value="alugado">Alugado</option><option value="inativo">Inativo</option>
        </select>
        <input className="lm-input max-w-xs" placeholder="Filtrar por cidade" value={filter.cidade} onChange={(e) => setFilter({ ...filter, cidade: e.target.value })} data-testid="filter-prop-cidade" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <article key={p.id} data-testid={`admin-prop-${p.id}`} className="bg-white border border-[#E5E0D8] rounded-sm overflow-hidden">
            <div className="relative">
              <img src={p.fotos?.[0]} alt="" className="w-full h-40 object-cover" />
              {p.destaque && <span className="absolute top-2 left-2 bg-[#C5A059] text-[#2B3A2F] text-[10px] px-2 py-1 rounded-full flex items-center gap-1"><Star className="w-3 h-3 fill-current" /> Destaque</span>}
              <span className="absolute top-2 right-2 bg-white/95 text-[#2B3A2F] text-[10px] px-2 py-1 rounded-full capitalize">{p.status}</span>
            </div>
            <div className="p-4">
              <div className="text-xs text-[#5C5C5C]">{p.codigo} · {TYPE_LABELS[p.tipo]} · {PURPOSE_LABELS[p.finalidade]}</div>
              <div className="font-serif text-lg text-[#2B3A2F] mt-1 leading-tight line-clamp-2">{p.titulo}</div>
              <div className="text-xs text-[#5C5C5C]">{p.bairro}, {p.cidade}</div>
              <div className="font-serif text-xl text-[#2B3A2F] mt-2">{formatMoney(p.valor, p.finalidade)}</div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E5E0D8]">
                <div className="flex gap-1">
                  <button onClick={() => setEditing(p)} className="p-1.5 rounded-full border border-[#E5E0D8] text-[#2B3A2F] hover:bg-[#F4F1EB]" data-testid={`edit-prop-${p.id}`}><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => remove(p.id)} className="p-1.5 rounded-full border border-[#E5E0D8] text-red-700 hover:bg-red-50" data-testid={`delete-prop-${p.id}`}><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <a href={waLink(null, `Olá! Confira este imóvel: ${window.location.origin}/imoveis/${p.id}`)} target="_blank" rel="noreferrer" className="text-xs text-[#2B3A2F] flex items-center gap-1 hover:text-[#C5A059]" data-testid={`share-prop-${p.id}`}><MessageCircle className="w-3.5 h-3.5" /> Compartilhar</a>
              </div>
            </div>
          </article>
        ))}
        {filtered.length === 0 && <div className="col-span-full text-center py-10 text-[#5C5C5C]">Nenhum imóvel encontrado.</div>}
      </div>

      {editing && <PropertyModal data={editing} setData={setEditing} onSave={save} />}
    </AdminLayout>
  );
}

function PropertyModal({ data, setData, onSave }) {
  const s = (k, v) => setData({ ...data, [k]: v });
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-sm w-full max-w-4xl my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E0D8]">
          <h2 className="font-serif text-2xl text-[#2B3A2F]">{data.id ? "Editar imóvel" : "Novo imóvel"}</h2>
          <button onClick={() => setData(null)} className="p-2 hover:bg-[#F4F1EB] rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={onSave} data-testid="property-form" className="p-6 grid md:grid-cols-3 gap-4">
          <div className="md:col-span-3"><label className="lm-label">Título *</label><input className="lm-input" required value={data.titulo} onChange={(e) => s("titulo", e.target.value)} data-testid="pf-titulo" /></div>
          <div><label className="lm-label">Tipo</label>
            <select className="lm-input" value={data.tipo} onChange={(e) => s("tipo", e.target.value)}>
              {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div><label className="lm-label">Finalidade</label>
            <select className="lm-input" value={data.finalidade} onChange={(e) => s("finalidade", e.target.value)}>
              {Object.entries(PURPOSE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div><label className="lm-label">Status</label>
            <select className="lm-input" value={data.status} onChange={(e) => s("status", e.target.value)}>
              <option value="disponivel">Disponível</option><option value="reservado">Reservado</option>
              <option value="vendido">Vendido</option><option value="alugado">Alugado</option><option value="inativo">Inativo</option>
            </select>
          </div>

          <div><label className="lm-label">Cidade *</label><input className="lm-input" required value={data.cidade} onChange={(e) => s("cidade", e.target.value)} /></div>
          <div><label className="lm-label">Bairro</label><input className="lm-input" value={data.bairro} onChange={(e) => s("bairro", e.target.value)} /></div>
          <div><label className="lm-label">Endereço</label><input className="lm-input" value={data.endereco} onChange={(e) => s("endereco", e.target.value)} /></div>

          <div><label className="lm-label">Valor (R$)</label><input type="number" className="lm-input" value={data.valor} onChange={(e) => s("valor", e.target.value)} data-testid="pf-valor" /></div>
          <div><label className="lm-label">Condomínio</label><input type="number" className="lm-input" value={data.condominio} onChange={(e) => s("condominio", e.target.value)} /></div>
          <div><label className="lm-label">IPTU</label><input type="number" className="lm-input" value={data.iptu} onChange={(e) => s("iptu", e.target.value)} /></div>

          <div><label className="lm-label">Metragem (m²)</label><input type="number" className="lm-input" value={data.metragem} onChange={(e) => s("metragem", e.target.value)} /></div>
          <div><label className="lm-label">Quartos</label><input type="number" className="lm-input" value={data.quartos} onChange={(e) => s("quartos", e.target.value)} /></div>
          <div><label className="lm-label">Banheiros</label><input type="number" className="lm-input" value={data.banheiros} onChange={(e) => s("banheiros", e.target.value)} /></div>
          <div><label className="lm-label">Vagas</label><input type="number" className="lm-input" value={data.vagas} onChange={(e) => s("vagas", e.target.value)} /></div>

          <div className="md:col-span-3">
            <label className="lm-label">Fotos (URLs, uma por linha)</label>
            <textarea rows={3} className="lm-input" value={(data.fotos || []).join("\n")} onChange={(e) => s("fotos", e.target.value.split("\n"))} />
          </div>

          <div className="md:col-span-3"><label className="lm-label">Descrição</label>
            <textarea rows={3} className="lm-input" value={data.descricao} onChange={(e) => s("descricao", e.target.value)} />
          </div>

          <div className="md:col-span-3 flex flex-wrap gap-4 text-sm">
            {[["aceita_financiamento", "Aceita financiamento"], ["aceita_consorcio", "Aceita consórcio"], ["aceita_permuta", "Aceita permuta"], ["destaque", "Imóvel em destaque"]].map(([k, l]) => (
              <label key={k} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!data[k]} onChange={(e) => s(k, e.target.checked)} className="accent-[#2B3A2F]" data-testid={`pf-${k}`} />
                {l}
              </label>
            ))}
          </div>

          <div className="md:col-span-3 flex justify-end gap-2 border-t border-[#E5E0D8] pt-4">
            <button type="button" onClick={() => setData(null)} className="lm-btn-outline">Cancelar</button>
            <button type="submit" className="lm-btn-primary" data-testid="pf-submit">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
