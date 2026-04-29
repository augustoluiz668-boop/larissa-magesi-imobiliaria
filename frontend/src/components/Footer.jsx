import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, Linkedin, Mail, Phone, MapPin, Globe } from "lucide-react";

// TikTok + Google Business icons inline (lucide doesn't ship them)
const TiktokIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M16.5 4.5c.4 1.4 1.2 2.6 2.3 3.5 1 .8 2.3 1.3 3.7 1.3v3.7c-2 0-3.9-.6-5.5-1.7v6.4c0 3.5-2.8 6.3-6.3 6.3S4.4 21.2 4.4 17.7s2.8-6.3 6.3-6.3c.4 0 .9 0 1.3.1v3.8c-.4-.2-.9-.3-1.3-.3-1.5 0-2.7 1.2-2.7 2.7s1.2 2.7 2.7 2.7 2.7-1.2 2.7-2.7V2.5h3.1z"/></svg>
);

export default function Footer({ settings = {} }) {
  const s = settings || {};
  const socials = [
    { key: "instagram", icon: Instagram, url: s.instagram && (s.instagram.startsWith("http") ? s.instagram : `https://instagram.com/${s.instagram.replace("@", "")}`), label: "Instagram" },
    { key: "facebook", icon: Facebook, url: s.facebook && (s.facebook.startsWith("http") ? s.facebook : `https://facebook.com/${s.facebook.replace("@", "")}`), label: "Facebook" },
    { key: "youtube", icon: Youtube, url: s.youtube, label: "YouTube" },
    { key: "tiktok", icon: TiktokIcon, url: s.tiktok, label: "TikTok" },
    { key: "linkedin", icon: Linkedin, url: s.linkedin, label: "LinkedIn" },
    { key: "google_business", icon: Globe, url: s.google_business, label: "Google Meu Negócio" },
  ].filter((x) => x.url);

  return (
    <footer className="bg-[#2B3A2F] text-[#E8E2D6] mt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          {s.logo_url ? (
            <img src={s.logo_url} alt="Larissa Magesi" className="h-20 w-auto mb-4 brightness-0 invert opacity-90" />
          ) : (
            <>
              <div className="font-serif text-3xl text-[#F4F1EB] mb-2">Larissa Magesi</div>
              <div className="lm-overline !text-[#C5A059] mb-5">Corretora de Imóveis</div>
            </>
          )}
          <p className="text-sm leading-relaxed max-w-md text-[#C9C3B4]">{s.bio}</p>
          <div className="mt-4 text-xs tracking-[0.2em] uppercase text-[#C5A059]">{s.creci}</div>

          {socials.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {socials.map(({ key, icon: Icon, url, label }) => (
                <a key={key} href={url} target="_blank" rel="noreferrer" aria-label={label} data-testid={`footer-${key}`}
                  className="w-10 h-10 rounded-full border border-[#3D5142] hover:border-[#C5A059] hover:bg-[#C5A059]/10 text-[#E8E2D6] hover:text-[#C5A059] flex items-center justify-center transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="lm-overline !text-[#C5A059] mb-4">Contato</div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <a href={`tel:${(s.telefone || "").replace(/\D/g, "")}`} className="hover:text-[#C5A059]" data-testid="footer-phone">{s.telefone}</a>
            </li>
            <li className="flex items-start gap-2"><Mail className="w-4 h-4 mt-0.5 flex-shrink-0" /> <a href={`mailto:${s.email}`} className="hover:text-[#C5A059] break-all">{s.email}</a></li>
            <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" /> {s.cidade}</li>
          </ul>
        </div>

        <div>
          <div className="lm-overline !text-[#C5A059] mb-4">Navegação</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-[#C5A059]">Início</Link></li>
            <li><Link to="/imoveis" className="hover:text-[#C5A059]">Imóveis</Link></li>
            <li><Link to="/financiamento" className="hover:text-[#C5A059]">Simulação de Financiamento</Link></li>
            <li><Link to="/sobre" className="hover:text-[#C5A059]">Sobre Larissa</Link></li>
            <li><Link to="/#contato" className="hover:text-[#C5A059]">Contato</Link></li>
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
