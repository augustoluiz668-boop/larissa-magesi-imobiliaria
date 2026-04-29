import React, { useEffect, useState } from "react";
import PropertyCard from "../../components/PropertyCard";
import { api } from "../../lib/api";
import { Search, X } from "lucide-react";

const initial = {
  cidade: "", bairro: "", tipo: "", finalidade: "",
  quartos_min: "", vagas_min: "", valor_min: "", valor_max: "",
  aceita_financiamento: false, aceita_consorcio: false, aceita_permuta: false,
};

export default function ImoveisList() {
  const [filters, setFilters] = useState(initial);
  const [props, setProps] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async (f) => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(f).filter(([_, v]) => v !== "" && v !== false));
    try {
      const r = await api.get("/public/properties", { params });
      setProps(r.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(filters); /* eslint-disable-next-line */ }, []);

  const reset = () => { setFilters(initial); load(initial); };
  const set = (k, v) => setFilters({ ...filters, [k]: v });

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-14">
      <div className="mb-8">
        <div className="lm-overline mb-3">Buscar imóveis</div>
        <h1 className="font-serif text-4xl md:text-5xl text-[#2B3A2F] leading-tight">Todos os imóveis disponíveis</h1>
        <p className="text-[#5C5C5C] mt-2">Refine os filtros para encontrar o imóvel ideal.</p>
      </div>

      <div className="bg-white border border-[#E5E0D8] rounded-sm p-6 grid md:grid-cols-4 gap-4 mb-10">
        <div><label className="lm-label">Cidade</label>
          <input data-testid="filter-cidade" className="lm-input" value={filters.cidade} onChange={(e) => set("cidade", e.target.value)} />
        </div>
        <div><label className="lm-label">Bairro</label>
          <input data-testid="filter-bairro" className="lm-input" value={filters.bairro} onChange={(e) => set("bairro", e.target.value)} />
        </div>
        <div><label className="lm-label">Tipo</label>
          <select data-testid="filter-tipo" className="lm-input" value={filters.tipo} onChange={(e) => set("tipo", e.target.value)}>
            <option value="">Todos</option><option value="casa">Casa</option><option value="apartamento">Apartamento</option>
            <option value="condominio">Condomínio</option><option value="comercial">Comercial</option>
            <option value="kitnet">Kitnet</option><option value="terreno">Terreno</option>
          </select>
        </div>
        <div><label className="lm-label">Finalidade</label>
          <select data-testid="filter-finalidade" className="lm-input" value={filters.finalidade} onChange={(e) => set("finalidade", e.target.value)}>
            <option value="">Todas</option><option value="venda">Venda</option><option value="locacao">Locação</option><option value="permuta">Permuta</option>
          </select>
        </div>
        <div><label className="lm-label">Valor mín.</label>
          <input type="number" data-testid="filter-valor-min" className="lm-input" value={filters.valor_min} onChange={(e) => set("valor_min", e.target.value)} />
        </div>
        <div><label className="lm-label">Valor máx.</label>
          <input type="number" data-testid="filter-valor-max" className="lm-input" value={filters.valor_max} onChange={(e) => set("valor_max", e.target.value)} />
        </div>
        <div><label className="lm-label">Quartos mín.</label>
          <input type="number" data-testid="filter-quartos" className="lm-input" value={filters.quartos_min} onChange={(e) => set("quartos_min", e.target.value)} />
        </div>
        <div><label className="lm-label">Vagas mín.</label>
          <input type="number" data-testid="filter-vagas" className="lm-input" value={filters.vagas_min} onChange={(e) => set("vagas_min", e.target.value)} />
        </div>

        <div className="md:col-span-4 flex flex-wrap gap-4 pt-2 border-t border-[#E5E0D8]">
          {[
            ["aceita_financiamento", "Aceita financiamento"],
            ["aceita_consorcio", "Aceita consórcio"],
            ["aceita_permuta", "Aceita permuta"],
          ].map(([k, l]) => (
            <label key={k} className="flex items-center gap-2 text-sm text-[#2C2C2C] cursor-pointer">
              <input type="checkbox" data-testid={`filter-${k}`} checked={filters[k]} onChange={(e) => set(k, e.target.checked)} className="accent-[#2B3A2F]" />
              {l}
            </label>
          ))}
          <div className="ml-auto flex gap-2">
            <button onClick={reset} data-testid="filter-reset" className="text-sm px-4 py-2 border border-[#E5E0D8] rounded-full text-[#5C5C5C] hover:bg-[#F4F1EB] flex items-center gap-1"><X className="w-3.5 h-3.5" /> Limpar</button>
            <button onClick={() => load(filters)} data-testid="filter-search" className="lm-btn-primary"><Search className="w-4 h-4" /> Buscar</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-[#5C5C5C] py-24">Carregando imóveis…</div>
      ) : props.length === 0 ? (
        <div className="text-center text-[#5C5C5C] py-24 font-serif text-2xl">Nenhum imóvel encontrado com esses filtros.</div>
      ) : (
        <>
          <div className="text-sm text-[#5C5C5C] mb-5">{props.length} imóvel{props.length > 1 ? "is" : ""} encontrado{props.length > 1 ? "s" : ""}</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {props.map((p) => <PropertyCard key={p.id} prop={p} />)}
          </div>
        </>
      )}
    </div>
  );
}
