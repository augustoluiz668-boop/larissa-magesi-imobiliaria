import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import PropertyCard from "../../components/PropertyCard";
import { api, formatMoney, TYPE_LABELS, PURPOSE_LABELS } from "../../lib/api";
import { Search, X, Map as MapIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const oliveIcon = L.divIcon({
  className: "lm-marker",
  html: `<div style="width:36px;height:36px;border-radius:50% 50% 50% 0;background:#071d34;border:3px solid #c9a66b;transform:rotate(-45deg);box-shadow:0 4px 10px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center"><div style="color:#c9a66b;transform:rotate(45deg);font-family:serif;font-weight:700;font-size:14px">LM</div></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

const initial = {
  cidade: "", bairro: "", tipo: "", finalidade: "",
  quartos_min: "", vagas_min: "", valor_min: "", valor_max: "",
  aceita_financiamento: false, aceita_consorcio: false, aceita_permuta: false,
  piscina: false, edicula: false, elevador: false, varanda: false, quintal: false,
};

const PAGE_SIZE = 9;

export default function ImoveisList() {
  const location = useLocation();
  const [filters, setFilters] = useState(() => {
    const p = new URLSearchParams(location.search);
    return {
      ...initial,
      tipo: p.get("tipo") || "",
      finalidade: p.get("finalidade") || "",
      valor_max: p.get("valor_max") || "",
    };
  });
  const [props, setProps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // City → neighborhoods map from API
  const [citiesMap, setCitiesMap] = useState({});
  useEffect(() => {
    api.get("/public/cities").then((r) => setCitiesMap(r.data)).catch(() => {});
  }, []);

  const cities = Object.keys(citiesMap).sort();
  const neighborhoods = filters.cidade ? (citiesMap[filters.cidade] || []) : [];

  const load = async (f) => {
    setLoading(true);
    setPage(1);
    const params = Object.fromEntries(Object.entries(f).filter(([_, v]) => v !== "" && v !== false));
    try {
      const r = await api.get("/public/properties", { params });
      setProps(r.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(filters); /* eslint-disable-next-line */ }, []);

  const reset = () => { setFilters(initial); load(initial); };
  const set = (k, v) => {
    const next = { ...filters, [k]: v };
    // Clear neighborhood when city changes
    if (k === "cidade") next.bairro = "";
    setFilters(next);
  };

  // Pagination
  const totalPages = Math.ceil(props.length / PAGE_SIZE);
  const paginated = props.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const center = useMemo(() => {
    const withCoords = props.filter((p) => p.lat && p.lng);
    if (!withCoords.length) return [-22.3148, -49.0620];
    const lat = withCoords.reduce((a, p) => a + p.lat, 0) / withCoords.length;
    const lng = withCoords.reduce((a, p) => a + p.lng, 0) / withCoords.length;
    return [lat, lng];
  }, [props]);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-14">
      <div className="mb-8">
        <div className="lm-overline mb-3">Buscar imóveis</div>
        <h1 className="font-serif text-4xl md:text-5xl text-[#071d34] leading-tight">Todos os imóveis disponíveis</h1>
        <p className="text-[#5C5C5C] mt-2">Use os filtros para refinar e visualize no mapa ao lado.</p>
      </div>

      {/* Filtros + Mapa */}
      <div className="grid lg:grid-cols-5 gap-5 mb-10">
        <div className="lg:col-span-2 bg-white border border-[#d1dde8] rounded-sm p-5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Search className="w-4 h-4 text-[#071d34]" />
            <span className="font-serif text-lg text-[#071d34]">Filtros</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Cidade — dropdown */}
            <div>
              <label className="lm-label">Cidade</label>
              <select data-testid="filter-cidade" className="lm-input" value={filters.cidade} onChange={(e) => set("cidade", e.target.value)}>
                <option value="">Todas</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {/* Bairro — select filtrado por cidade */}
            <div>
              <label className="lm-label">Bairro</label>
              {filters.cidade && neighborhoods.length > 0 ? (
                <select data-testid="filter-bairro" className="lm-input" value={filters.bairro} onChange={(e) => set("bairro", e.target.value)}>
                  <option value="">Todos</option>
                  {neighborhoods.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              ) : (
                <input data-testid="filter-bairro" className="lm-input" value={filters.bairro} onChange={(e) => set("bairro", e.target.value)} placeholder="Bairro" />
              )}
            </div>
            <div><label className="lm-label">Tipo</label>
              <select data-testid="filter-tipo" className="lm-input" value={filters.tipo} onChange={(e) => set("tipo", e.target.value)}>
                <option value="">Todos</option>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div><label className="lm-label">Finalidade</label>
              <select data-testid="filter-finalidade" className="lm-input" value={filters.finalidade} onChange={(e) => set("finalidade", e.target.value)}>
                <option value="">Todas</option>
                {Object.entries(PURPOSE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div><label className="lm-label">Valor mín. (R$)</label><input type="number" data-testid="filter-valor-min" className="lm-input" value={filters.valor_min} onChange={(e) => set("valor_min", e.target.value)} /></div>
            <div><label className="lm-label">Valor máx. (R$)</label><input type="number" data-testid="filter-valor-max" className="lm-input" value={filters.valor_max} onChange={(e) => set("valor_max", e.target.value)} /></div>
            <div><label className="lm-label">Quartos mín.</label><input type="number" data-testid="filter-quartos" className="lm-input" value={filters.quartos_min} onChange={(e) => set("quartos_min", e.target.value)} /></div>
            <div><label className="lm-label">Vagas mín.</label><input type="number" data-testid="filter-vagas" className="lm-input" value={filters.vagas_min} onChange={(e) => set("vagas_min", e.target.value)} /></div>
          </div>
          <div className="flex flex-wrap gap-3 pt-2 border-t border-[#d1dde8]">
            {[
              ["aceita_financiamento", "Financia"],
              ["aceita_consorcio", "Consórcio"],
              ["aceita_permuta", "Permuta"],
              ["piscina", "Piscina"],
              ["edicula", "Edícula"],
              ["elevador", "Elevador"],
              ["varanda", "Varanda"],
              ["quintal", "Quintal"],
            ].map(([k, l]) => (
              <label key={k} className="flex items-center gap-1.5 text-xs text-[#2C2C2C] cursor-pointer">
                <input type="checkbox" data-testid={`filter-${k}`} checked={filters[k]} onChange={(e) => set(k, e.target.checked)} className="accent-[#071d34]" /> {l}
              </label>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={reset} data-testid="filter-reset" className="text-sm px-4 py-2 border border-[#d1dde8] rounded-full text-[#5C5C5C] hover:bg-[#f8fafc] flex items-center gap-1 flex-1 justify-center"><X className="w-3.5 h-3.5" /> Limpar</button>
            <button onClick={() => load(filters)} data-testid="filter-search" className="lm-btn-primary flex-1 justify-center"><Search className="w-4 h-4" /> Buscar</button>
          </div>
        </div>

        <div className="lg:col-span-3 rounded-sm overflow-hidden border border-[#d1dde8] bg-white" style={{ minHeight: 500 }}>
          <div className="px-5 py-3 border-b border-[#d1dde8] bg-white flex items-center gap-2">
            <MapIcon className="w-4 h-4 text-[#071d34]" />
            <span className="font-serif text-lg text-[#071d34]">Mapa de imóveis</span>
            <span className="text-xs text-[#5C5C5C] ml-auto">Localizações aproximadas — preserva a privacidade do imóvel</span>
          </div>
          <div style={{ height: 500 }} data-testid="properties-map">
            <MapContainer center={center} zoom={12} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {props.filter((p) => p.lat && p.lng).map((p) => (
                <Marker key={p.id} position={[p.lat, p.lng]} icon={oliveIcon}>
                  <Popup>
                    <div style={{ minWidth: 200 }}>
                      <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 18, color: "#071d34", lineHeight: 1.1 }}>{p.titulo}</div>
                      <div style={{ fontSize: 12, color: "#5C5C5C", marginTop: 4 }}>{p.bairro}, {p.cidade}</div>
                      <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 20, color: "#071d34", marginTop: 6 }}>
                        {formatMoney(p.valor, p.finalidade)}
                      </div>
                      <a href={`/imoveis/${p.id}`} style={{ display: "inline-block", marginTop: 8, padding: "4px 12px", background: "#071d34", color: "#f8fafc", borderRadius: 999, fontSize: 12, textDecoration: "none" }}>Ver imóvel</a>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
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
            {paginated.map((p) => <PropertyCard key={p.id} prop={p} />)}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-9 h-9 rounded-full border border-[#d1dde8] flex items-center justify-center text-[#071d34] hover:bg-[#f8fafc] disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-9 h-9 rounded-full border text-sm font-medium transition-colors ${
                    n === page
                      ? "bg-[#071d34] text-[#f8fafc] border-[#071d34]"
                      : "border-[#d1dde8] text-[#071d34] hover:bg-[#f8fafc]"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-9 h-9 rounded-full border border-[#d1dde8] flex items-center justify-center text-[#071d34] hover:bg-[#f8fafc] disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
