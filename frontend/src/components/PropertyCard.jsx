import React from "react";
import { Link } from "react-router-dom";
import { Bed, Bath, Car, Ruler, MessageCircle, MapPin } from "lucide-react";
import { formatMoney, waLink, addWatermark, TYPE_LABELS, PURPOSE_LABELS } from "../lib/api";

export default function PropertyCard({ prop }) {
  return (
    <article data-testid={`property-card-${prop.id}`} className="lm-card flex flex-col">
      <Link to={`/imoveis/${prop.codigo}`} className="block relative">
        <img
          src={addWatermark(prop.fotos?.[prop.featured_photo || 0] || prop.fotos?.[0])}
          alt={prop.titulo}
          className="w-full h-64 object-cover"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 lm-pill-filled lm-pill" style={{ borderColor: "#071d34" }}>
          {PURPOSE_LABELS[prop.finalidade]}
        </span>
        <span className="absolute top-3 right-3 bg-[#f8fafc]/95 text-[#071d34] text-xs px-3 py-1 rounded-full font-medium">
          {TYPE_LABELS[prop.tipo]}
        </span>
      </Link>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-1 text-xs text-[#5C5C5C]">
          <MapPin className="w-3 h-3" /> {prop.bairro}, {prop.cidade}
        </div>
        <Link to={`/imoveis/${prop.codigo}`} className="font-serif text-xl text-[#071d34] mt-2 leading-tight hover:text-[#0d2d4c]">
          {prop.titulo}
        </Link>

        <div className="mt-3 text-2xl font-serif text-[#071d34]">
          {formatMoney(prop.valor, prop.finalidade)}
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#5C5C5C]">
          <span className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5" /> {prop.metragem}m²</span>
          {prop.quartos > 0 && <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {prop.quartos}</span>}
          {prop.banheiros > 0 && <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {prop.banheiros}</span>}
          {prop.vagas > 0 && <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5" /> {prop.vagas}</span>}
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {prop.aceita_financiamento && <span className="lm-pill">Financia</span>}
          {prop.aceita_consorcio && <span className="lm-pill">Consórcio</span>}
          {prop.aceita_permuta && <span className="lm-pill">Permuta</span>}
        </div>

        <div className="mt-5 flex gap-2">
          <Link
            to={`/imoveis/${prop.codigo}`}
            data-testid={`property-interest-${prop.id}`}
            className="flex-1 text-center text-sm py-2.5 border border-[#071d34] text-[#071d34] rounded-full hover:bg-[#071d34] hover:text-[#f8fafc] transition-colors"
          >
            Tenho interesse
          </Link>
          <a
            href={waLink(null, `Olá Larissa! Tenho interesse no imóvel ${prop.codigo} — ${prop.titulo}. https://larissamagesi.com.br/imoveis/${prop.codigo}`)}
            target="_blank"
            rel="noreferrer"
            data-testid={`property-wa-${prop.id}`}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#071d34] text-[#f8fafc] hover:bg-[#040f1d]"
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>
      </div>
    </article>
  );
}
