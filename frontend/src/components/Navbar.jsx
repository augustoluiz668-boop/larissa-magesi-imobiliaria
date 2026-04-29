import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const nav = [
  { to: "/", label: "Início" },
  { to: "/imoveis", label: "Imóveis" },
  { to: "/#sobre", label: "Sobre Larissa" },
  { to: "/#proprietarios", label: "Proprietários" },
  { to: "/#contato", label: "Contato" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-[#F4F1EB]/90 backdrop-blur-md border-b border-[#E5E0D8]">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-5 md:px-10 h-20">
        <Link to="/" data-testid="navbar-logo" className="flex flex-col leading-tight">
          <span className="font-serif text-2xl text-[#2B3A2F] tracking-tight">Larissa Magesi</span>
          <span className="lm-overline">Corretora de Imóveis</span>
        </Link>

        <nav className="hidden md:flex items-center gap-9">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              data-testid={`nav-${n.label.toLowerCase().replace(/\s/g, "-")}`}
              className={`text-sm tracking-wide transition-colors ${
                pathname === n.to ? "text-[#2B3A2F]" : "text-[#5C5C5C] hover:text-[#2B3A2F]"
              }`}
            >
              {n.label}
            </Link>
          ))}
          <Link to="/admin/login" data-testid="nav-admin" className="text-xs tracking-[0.2em] uppercase text-[#C5A059] hover:text-[#2B3A2F]">
            Área da Corretora
          </Link>
        </nav>

        <button
          data-testid="navbar-mobile-toggle"
          className="md:hidden p-2 text-[#2B3A2F]"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#E5E0D8] bg-[#F4F1EB] px-6 py-4 flex flex-col gap-3">
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
          <Link to="/admin/login" onClick={() => setOpen(false)} className="py-2 text-[#C5A059] tracking-widest uppercase text-xs">
            Área da Corretora
          </Link>
        </div>
      )}
    </header>
  );
}
