import React from "react";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";

export default function Footer({ settings }) {
  const s = settings || {};
  return (
    <footer className="bg-[#2B3A2F] text-[#E8E2D6] mt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="font-serif text-3xl text-[#F4F1EB] mb-2">Larissa Magesi</div>
          <div className="lm-overline !text-[#C5A059] mb-5">Corretora de Imóveis</div>
          <p className="text-sm leading-relaxed max-w-md text-[#C9C3B4]">
            {s.bio || "Atendimento personalizado e consultivo para compra, venda, locação, permuta, financiamento e consórcio de imóveis."}
          </p>
          <div className="mt-4 text-xs tracking-[0.2em] uppercase text-[#C5A059]">{s.creci}</div>
        </div>

        <div>
          <div className="lm-overline !text-[#C5A059] mb-4">Contato</div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2"><Phone className="w-4 h-4 mt-0.5" /> {s.telefone}</li>
            <li className="flex items-start gap-2"><Mail className="w-4 h-4 mt-0.5" /> {s.email}</li>
            <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5" /> {s.cidade}</li>
          </ul>
        </div>

        <div>
          <div className="lm-overline !text-[#C5A059] mb-4">Social</div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2"><Instagram className="w-4 h-4" /> {s.instagram}</li>
            <li className="flex items-center gap-2"><Facebook className="w-4 h-4" /> {s.facebook}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#3D5142]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#C9C3B4]">
          <span>© {new Date().getFullYear()} Larissa Magesi Corretora de Imóveis. Todos os direitos reservados.</span>
          <span className="tracking-[0.22em] uppercase text-[#C5A059]">Bauru / SP · Brasil</span>
        </div>
      </div>
    </footer>
  );
}
