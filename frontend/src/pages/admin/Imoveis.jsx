import React, { useEffect, useRef, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { formatMoney, TYPE_LABELS, PURPOSE_LABELS, waLink, maskPhone, maskCurrency, parseCurrency } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { Plus, Pencil, Trash2, MessageCircle, Star, X, Upload, Image as ImageIcon, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

const empty = {
  codigo: "", titulo: "", tipo: "casa", finalidade: "venda", cidade: "Bauru", bairro: "", endereco: "", complemento: "",
  valor: 0, condominio: 0, iptu: 0, metragem: 0, terreno_m2: 0, quartos: 0, suites: 0, banheiros: 0, vagas: 0,
  aceita_financiamento: false, aceita_consorcio: false, aceita_permuta: false,
  piscina: false, edicula: false, elevador: false, varanda: false, quintal: false,
  com_placa: false, exclusivo: false,
  descricao: "", fotos: [], status: "disponivel",
  proprietario: "", proprietario_contato: "", comissao: 0, observacao_interna: "",
  destaque: false, featured_photo: 0,
};

export default function ImoveisAdmin() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState({ tipo: "", status: "", cidade: "" });

  const load = () => supabase.from("properties").select("*").order("created_at", { ascending: false }).then(({ data }) => setItems(data || []));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    const { id, ...rest } = editing;
    const payload = {
      ...rest,
      valor: parseCurrency(editing.valor),
      condominio: parseCurrency(editing.condominio),
      iptu: parseCurrency(editing.iptu),
      metragem: Number(editing.metragem) || 0,
      terreno_m2: Number(editing.terreno_m2) || 0,
      quartos: Number(editing.quartos) || 0,
      suites: Number(editing.suites) || 0,
      banheiros: Number(editing.banheiros) || 0,
      vagas: Number(editing.vagas) || 0,
      featured_photo: Number(editing.featured_photo) || 0,
      comissao: Number(editing.comissao) || 0,
      fotos: (editing.fotos || []).filter(Boolean),
    };
    try {
      let error;
      if (id) {
        ({ error } = await supabase.from("properties").update(payload).eq("id", id));
      } else {
        ({ error } = await supabase.from("properties").insert(payload));
      }
      if (error) throw error;
      toast.success(id ? "Imóvel atualizado" : "Imóvel cadastrado");
      setEditing(null);
      load();
    } catch { toast.error("Falha ao salvar"); }
  };

  const remove = async (id) => {
    if (!window.confirm("Excluir imóvel?")) return;
    await supabase.from("properties").delete().eq("id", id);
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
      actions={<button onClick={async () => {
  const { data } = await supabase.from("properties").select("codigo");
  const nums = (data || []).map(p => parseInt(p.codigo, 10)).filter(n => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  const next = String(max + 1).padStart(5, "0");
  setEditing({ ...empty, codigo: next });
}} data-testid="add-property-btn" className="lm-btn-primary"><Plus className="w-4 h-4" /> Novo imóvel</button>}
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
        {filtered.map((p) => {
          const featuredPhoto = p.fotos?.[p.featured_photo || 0] || p.fotos?.[0];
          return (
            <article key={p.id} data-testid={`admin-prop-${p.id}`} className="bg-white border border-[#d1dde8] rounded-sm overflow-hidden">
              <div className="relative">
                {featuredPhoto ? (
                  <img src={featuredPhoto} alt="" className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-[#f8fafc] flex items-center justify-center text-[#5C5C5C]"><ImageIcon className="w-8 h-8" /></div>
                )}
                {p.destaque && <span className="absolute top-2 left-2 bg-[#c9a66b] text-[#071d34] text-[10px] px-2 py-1 rounded-full flex items-center gap-1"><Star className="w-3 h-3 fill-current" /> Destaque</span>}
                <span className="absolute top-2 right-2 bg-white/95 text-[#071d34] text-[10px] px-2 py-1 rounded-full capitalize">{p.status}</span>
              </div>
              <div className="p-4">
                <div className="text-xs text-[#5C5C5C]">{p.codigo} · {TYPE_LABELS[p.tipo]} · {PURPOSE_LABELS[p.finalidade]}</div>
                <div className="font-serif text-lg text-[#071d34] mt-1 leading-tight line-clamp-2">{p.titulo}</div>
                <div className="text-xs text-[#5C5C5C]">{p.bairro}, {p.cidade} · {(p.fotos || []).length} foto(s)</div>
                <div className="font-serif text-xl text-[#071d34] mt-2">{formatMoney(p.valor, p.finalidade)}</div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#d1dde8]">
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(p)} className="p-1.5 rounded-full border border-[#d1dde8] text-[#071d34] hover:bg-[#f8fafc]" data-testid={`edit-prop-${p.id}`}><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => remove(p.id)} className="p-1.5 rounded-full border border-[#d1dde8] text-red-700 hover:bg-red-50" data-testid={`delete-prop-${p.id}`}><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <a href={waLink(null, `Olá! Confira este imóvel: ${window.location.origin}/imoveis/${p.id}`)} target="_blank" rel="noreferrer" className="text-xs text-[#071d34] flex items-center gap-1 hover:text-[#c9a66b]" data-testid={`share-prop-${p.id}`}><MessageCircle className="w-3.5 h-3.5" /> Compartilhar</a>
                </div>
              </div>
            </article>
          );
        })}
        {filtered.length === 0 && <div className="col-span-full text-center py-10 text-[#5C5C5C]">Nenhum imóvel encontrado.</div>}
      </div>

      {editing && <PropertyModal data={editing} setData={setEditing} onSave={save} />}
    </AdminLayout>
  );
}

function PropertyModal({ data, setData, onSave }) {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const s = (k, v) => setData({ ...data, [k]: v });

  const uploadFiles = async (files) => {
    setUploading(true);
    const urls = [];
    for (const file of files) {
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", "lm_imoveis");
        const res = await fetch("https://api.cloudinary.com/v1_1/dwrblaqet/image/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (json.error) throw new Error(json.error.message);
        urls.push(json.secure_url);
      } catch (err) {
        toast.error(`Erro no upload: ${err.message}`);
      }
    }
    if (urls.length) {
      setData((d) => ({ ...d, fotos: [...(d.fotos || []), ...urls] }));
      toast.success(`${urls.length} foto(s) enviada(s)`);
    }
    setUploading(false);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) uploadFiles(files);
    e.target.value = "";
  };

  const removePhoto = (idx) => {
    const newFotos = (data.fotos || []).filter((_, i) => i !== idx);
    const newFeatured = data.featured_photo >= idx && data.featured_photo > 0 ? data.featured_photo - 1 : data.featured_photo;
    setData({ ...data, fotos: newFotos, featured_photo: Math.min(newFeatured, newFotos.length - 1) });
  };

  const setFeatured = (idx) => setData({ ...data, featured_photo: idx });

  const move = (from, to) => {
    if (to < 0 || to >= (data.fotos || []).length) return;
    const arr = [...(data.fotos || [])];
    const [m] = arr.splice(from, 1);
    arr.splice(to, 0, m);
    let feat = data.featured_photo || 0;
    if (feat === from) feat = to;
    else if (from < feat && to >= feat) feat -= 1;
    else if (from > feat && to <= feat) feat += 1;
    setData({ ...data, fotos: arr, featured_photo: feat });
  };

  const onDragStart = (i) => setDragIdx(i);
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (e, i) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    move(dragIdx, i);
    setDragIdx(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-sm w-full max-w-4xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d1dde8] flex-shrink-0">
          <h2 className="font-serif text-2xl text-[#071d34]">{data.id ? "Editar imóvel" : "Novo imóvel"}</h2>
          <button onClick={() => setData(null)} className="p-2 hover:bg-[#f8fafc] rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={onSave} data-testid="property-form" className="p-6 space-y-6 overflow-y-auto flex-1">
          <section className="grid md:grid-cols-3 gap-4">
            <div><label className="lm-label">Código (ID)</label><input className="lm-input bg-[#f8fafc]" placeholder="Ex: RN-131" value={data.codigo || ""} onChange={(e) => s("codigo", e.target.value)} readOnly data-testid="pf-codigo" /></div>
            <div className="md:col-span-2"><label className="lm-label">Título *</label><input className="lm-input" required value={data.titulo} onChange={(e) => s("titulo", e.target.value)} data-testid="pf-titulo" /></div>
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
            <div className="md:col-span-2"><label className="lm-label">Complemento</label><input className="lm-input" placeholder="Apto, bloco, casa..." value={data.complemento || ""} onChange={(e) => s("complemento", e.target.value)} /></div>

            <div><label className="lm-label">Valor (R$)</label><input className="lm-input" placeholder="R$ 0,00" value={data.valor} onChange={(e) => s("valor", maskCurrency(e.target.value))} data-testid="pf-valor" /></div>
            <div><label className="lm-label">Condomínio</label><input className="lm-input" placeholder="R$ 0,00" value={data.condominio} onChange={(e) => s("condominio", maskCurrency(e.target.value))} /></div>
            <div><label className="lm-label">IPTU</label><input className="lm-input" placeholder="R$ 0,00" value={data.iptu} onChange={(e) => s("iptu", maskCurrency(e.target.value))} /></div>

            <div><label className="lm-label">Metragem (m²)</label><input type="number" className="lm-input" value={data.metragem} onChange={(e) => s("metragem", e.target.value)} /></div>
            <div><label className="lm-label">Terreno (m²)</label><input type="number" className="lm-input" placeholder="0" value={data.terreno_m2 || ""} onChange={(e) => s("terreno_m2", e.target.value)} /></div>
            <div><label className="lm-label">Quartos</label><input type="number" className="lm-input" value={data.quartos} onChange={(e) => s("quartos", e.target.value)} /></div>
            <div><label className="lm-label">Suítes</label><input type="number" className="lm-input" placeholder="0" value={data.suites || ""} onChange={(e) => s("suites", e.target.value)} /></div>
            <div><label className="lm-label">Banheiros</label><input type="number" className="lm-input" value={data.banheiros} onChange={(e) => s("banheiros", e.target.value)} /></div>
            <div><label className="lm-label">Vagas</label><input type="number" className="lm-input" value={data.vagas} onChange={(e) => s("vagas", e.target.value)} /></div>
          </section>

          {/* Fotos */}
          <section className="border-t border-[#d1dde8] pt-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-serif text-lg text-[#071d34]">Fotos do imóvel</div>
                <p className="text-xs text-[#5C5C5C]">Arraste para reordenar · clique na estrela para escolher a foto de destaque · JPG, PNG ou WEBP, até 10MB</p>
              </div>
              <button type="button" onClick={() => fileRef.current.click()} disabled={uploading} className="lm-btn-outline text-sm py-2 px-4" data-testid="upload-photos-btn">
                {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando…</> : <><Upload className="w-4 h-4" /> Enviar fotos</>}
              </button>
              <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" data-testid="photo-file-input" />
            </div>

            {(data.fotos || []).length === 0 ? (
              <div
                onClick={() => fileRef.current.click()}
                className="border-2 border-dashed border-[#d1dde8] rounded-sm p-12 text-center text-[#5C5C5C] cursor-pointer hover:bg-[#f8fafc] hover:border-[#c9a66b] transition-colors"
              >
                <ImageIcon className="w-10 h-10 mx-auto mb-2 text-[#c9a66b]" />
                <div className="text-sm">Nenhuma foto ainda. Clique para enviar.</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {(data.fotos || []).map((f, i) => (
                  <div
                    key={i}
                    draggable
                    onDragStart={() => onDragStart(i)}
                    onDragOver={onDragOver}
                    onDrop={(e) => onDrop(e, i)}
                    className="relative group border border-[#d1dde8] rounded-sm overflow-hidden bg-[#f8fafc]"
                    data-testid={`photo-thumb-${i}`}
                  >
                    <img src={f} alt="" className="w-full h-28 object-cover cursor-move" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                      <button type="button" onClick={() => move(i, i - 1)} className="w-7 h-7 rounded-full bg-white text-[#071d34] flex items-center justify-center" title="Mover para trás"><ChevronLeft className="w-4 h-4" /></button>
                      <button type="button" onClick={() => move(i, i + 1)} className="w-7 h-7 rounded-full bg-white text-[#071d34] flex items-center justify-center" title="Mover para frente"><ChevronRight className="w-4 h-4" /></button>
                      <button type="button" onClick={() => removePhoto(i)} className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center" title="Remover" data-testid={`photo-remove-${i}`}><X className="w-4 h-4" /></button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFeatured(i)}
                      title="Definir como foto de destaque"
                      className={`absolute top-1.5 left-1.5 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${(data.featured_photo || 0) === i ? "bg-[#c9a66b] text-[#071d34]" : "bg-white/90 text-[#071d34] hover:bg-[#c9a66b]"}`}
                      data-testid={`photo-featured-${i}`}
                    >
                      <Star className={`w-3.5 h-3.5 ${(data.featured_photo || 0) === i ? "fill-current" : ""}`} />
                    </button>
                    <div className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">{i + 1}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="border-t border-[#d1dde8] pt-5 grid md:grid-cols-3 gap-4">
            <div className="md:col-span-3"><label className="lm-label">Descrição</label>
              <textarea rows={3} className="lm-input" value={data.descricao} onChange={(e) => s("descricao", e.target.value)} />
            </div>
            <div className="md:col-span-3 flex flex-wrap gap-4 text-sm">
              {[
                ["aceita_financiamento", "Aceita financiamento"],
                ["aceita_consorcio", "Aceita consórcio"],
                ["aceita_permuta", "Aceita permuta"],
                ["destaque", "Imóvel em destaque"],
                ["com_placa", "Com placa"],
                ["exclusivo", "Exclusivo"],
              ].map(([k, l]) => (
                <label key={k} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!data[k]} onChange={(e) => s(k, e.target.checked)} className="accent-[#071d34]" data-testid={`pf-${k}`} />
                  {l}
                </label>
              ))}
            </div>
            <div className="md:col-span-3">
              <div className="text-xs font-medium text-[#5C5C5C] uppercase tracking-wider mb-2">Características / Amenidades</div>
              <div className="flex flex-wrap gap-4 text-sm">
                {[["piscina", "Piscina"], ["edicula", "Edícula"], ["elevador", "Elevador"], ["varanda", "Varanda"], ["quintal", "Quintal"]].map(([k, l]) => (
                  <label key={k} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!data[k]} onChange={(e) => s(k, e.target.checked)} className="accent-[#071d34]" data-testid={`pf-${k}`} />
                    {l}
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Informações internas */}
          <section className="border-t border-[#d1dde8] pt-5">
            <div className="font-serif text-lg text-[#071d34] mb-3">Informações internas <span className="text-xs font-sans text-[#5C5C5C] ml-1">(não aparecem no site)</span></div>
            <div className="grid md:grid-cols-3 gap-4">
              <div><label className="lm-label">Nome do proprietário</label><input className="lm-input" value={data.proprietario || ""} onChange={(e) => s("proprietario", e.target.value)} /></div>
              <div><label className="lm-label">Contato do proprietário</label><input className="lm-input" placeholder="(14) 99999-9999" value={data.proprietario_contato || ""} onChange={(e) => s("proprietario_contato", maskPhone(e.target.value))} /></div>
              <div><label className="lm-label">Comissão (%)</label><input type="number" step="0.1" className="lm-input" placeholder="Ex: 6" value={data.comissao || ""} onChange={(e) => s("comissao", e.target.value)} /></div>
              <div className="md:col-span-3"><label className="lm-label">Observação interna</label><textarea rows={2} className="lm-input" placeholder="Anotações internas sobre o imóvel (não aparecem no site)" value={data.observacao_interna || ""} onChange={(e) => s("observacao_interna", e.target.value)} /></div>
            </div>
          </section>

          <div className="flex justify-end gap-2 border-t border-[#d1dde8] pt-4">
            <button type="button" onClick={() => setData(null)} className="lm-btn-outline">Cancelar</button>
            <button type="submit" className="lm-btn-primary" data-testid="pf-submit">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
