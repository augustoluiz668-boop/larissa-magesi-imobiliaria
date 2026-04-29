import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";

const nav = [
  { to: "/", label: "Início" },
  { to: "/imoveis", label: "Imóveis" },
  { to: "/financiamento", label: "Simulação" },
  { to: "/sobre", label: "Sobre Larissa" },
  { to: "/#contato", label: "Contato" },
];

export default function Navbar({ settings = {} }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-[#F4F1EB]/95 backdrop-blur-md border-b border-[#E5E0D8]">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-5 md:px-10 h-24">
        <Link to="/" data-testid="navbar-logo" className="flex items-center gap-3">
          {settings.logo_url ? (
            <img src={settings.logo_url} alt="Larissa Magesi" className="h-14 w-auto" />
          ) : (
            <div className="flex flex-col leading-tight">
              <span className="font-serif text-2xl text-[#2B3A2F]">Larissa Magesi</span>
              <span className="lm-overline">Corretora de Imóveis</span>
            </div>
          )}
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              data-testid={`nav-${n.label.toLowerCase().replace(/\s/g, "-")}`}
              className={`text-sm tracking-wide transition-colors ${
                pathname === n.to ? "text-[#2B3A2F] font-medium" : "text-[#5C5C5C] hover:text-[#2B3A2F]"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {settings.telefone && (
            <a href={`tel:${(settings.telefone || "").replace(/\D/g, "")}`} className="flex items-center gap-2 text-sm text-[#2B3A2F] hover:text-[#C5A059]" data-testid="nav-phone">
              <Phone className="w-4 h-4" strokeWidth={1.6} />
              <span className="font-medium tracking-wide">{settings.telefone}</span>
            </a>
          )}
          <Link to="/admin/login" data-testid="nav-admin" className="text-[10px] tracking-[0.22em] uppercase text-[#C5A059] hover:text-[#2B3A2F] border-l border-[#E5E0D8] pl-4">
            Área da Corretora
          </Link>
        </div>

        <button
          data-testid="navbar-mobile-toggle"
          className="lg:hidden p-2 text-[#2B3A2F]"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-[#E5E0D8] bg-[#F4F1EB] px-6 py-4 flex flex-col gap-3">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="py-2 text-[#2B3A2F] border-b border-[#E5E0D8]"
              data-testid={`mobile-nav-${n.label.toLowerCase().replace(/\s/g, "-")}`}
            >
              {n.label}
            </Link>
          ))}
          {settings.telefone && (
            <a href={`tel:${(settings.telefone || "").replace(/\D/g, "")}`} className="py-2 flex items-center gap-2 text-[#2B3A2F]">
              <Phone className="w-4 h-4" /> {settings.telefone}
            </a>
          )}
          <Link to="/admin/login" onClick={() => setOpen(false)} className="py-2 text-[#C5A059] tracking-widest uppercase text-xs">
            Área da Corretora
          </Link>
        </div>
      )}
    </header>
  );
}
