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
    <footer className="bg-[#071d34] text-[#E8E2D6] mt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          {s.logo_url ? (
            <img src={s.logo_url} alt="Larissa Magesi" className="h-20 w-auto mb-4 brightness-0 invert opacity-90" />
          ) : (
            <>
              <div className="font-serif text-3xl text-[#f8fafc] mb-2">Larissa Magesi</div>
              <div className="lm-overline !text-[#c9a66b] mb-5">Corretora de Imóveis</div>
            </>
          )}
          <p className="text-sm leading-relaxed max-w-md text-[#a8b8cc]">{s.bio}</p>
          <div className="mt-4 text-xs tracking-[0.2em] uppercase text-[#c9a66b]">{s.creci}</div>

          {socials.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {socials.map(({ key, icon: Icon, url, label }) => (
                <a key={key} href={url} target="_blank" rel="noreferrer" aria-label={label} data-testid={`footer-${key}`}
                  className="w-10 h-10 rounded-full border border-[#0d2d4c] hover:border-[#c9a66b] hover:bg-[#c9a66b]/10 text-[#E8E2D6] hover:text-[#c9a66b] flex items-center justify-center transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="lm-overline !text-[#c9a66b] mb-4">Contato</div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#c9a66b]" />
              <a href={`tel:${(s.telefone || "14991136895").replace(/\D/g, "")}`} className="hover:text-[#c9a66b]" data-testid="footer-phone">
                {s.telefone || "(14) 99113-6895"}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#c9a66b]" />
              <a href={`mailto:${s.email || "larissa@magesi.com"}`} className="hover:text-[#c9a66b] break-all">
                {s.email || "larissa@magesi.com"}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#c9a66b]" />
              {s.cidade || "Bauru/SP"}
            </li>
          </ul>
        </div>

        <div>
          <div className="lm-overline !text-[#c9a66b] mb-4">Navegação</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-[#c9a66b]">Início</Link></li>
            <li><Link to="/imoveis" className="hover:text-[#c9a66b]">Imóveis</Link></li>
            <li><Link to="/financiamento" className="hover:text-[#c9a66b]">Simulação de Financiamento</Link></li>
            <li><Link to="/sobre" className="hover:text-[#c9a66b]">Sobre Mim</Link></li>
            <li><Link to="/contato" className="hover:text-[#c9a66b]">Contato</Link></li>
            <li><Link to="/cadastrar-imovel" className="hover:text-[#c9a66b]">Cadastrar Imóvel</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#0d2d4c]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#a8b8cc]">
          <span>© {new Date().getFullYear()} Larissa Magesi Corretora de Imóveis. Todos os direitos reservados.</span>
          <span className="tracking-[0.22em] uppercase text-[#c9a66b]">Bauru / SP · Brasil</span>
        </div>
      </div>
    </footer>
  );
}
