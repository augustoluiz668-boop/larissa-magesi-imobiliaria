import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const nav = [
  { to: "/", label: "Início" },
  { to: "/imoveis", label: "Imóveis" },
  { to: "/financiamento", label: "Simulação" },
  { to: "/sobre", label: "Sobre Mim" },
  { to: "/contato", label: "Contato" },
  { to: "/cadastrar-imovel", label: "Cadastrar Imóvel" },
];

export default function Navbar({ settings = {} }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-[#f8fafc]/95 backdrop-blur-md border-b border-[#d1dde8]">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-5 md:px-10 h-24">
        <Link to="/" data-testid="navbar-logo" className="flex items-center gap-3">
          <img src="/lmmm.png" alt="Larissa Magesi" className="h-20 w-auto" />
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              data-testid={`nav-${n.label.toLowerCase().replace(/\s/g, "-")}`}
              className={`text-sm tracking-wide transition-colors ${
                pathname === n.to ? "text-[#071d34] font-medium" : "text-[#5C5C5C] hover:text-[#071d34]"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/admin/login" data-testid="nav-admin" className="text-[10px] tracking-[0.22em] uppercase text-[#c9a66b] hover:text-[#071d34]">
            Área da Corretora
          </Link>
        </div>

        <div className="lg:hidden flex items-center gap-2">
          {settings.photo_url && (
            <img
              src={settings.photo_url}
              alt="Larissa Magesi"
              className="w-10 h-10 rounded-full object-cover object-top border-2 border-[#c9a66b]"
            />
          )}
          <button
            data-testid="navbar-mobile-toggle"
            className="p-2 text-[#071d34]"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-[#d1dde8] bg-[#f8fafc] px-6 py-4 flex flex-col gap-3">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="py-2 text-[#071d34] border-b border-[#d1dde8]"
              data-testid={`mobile-nav-${n.label.toLowerCase().replace(/\s/g, "-")}`}
            >
              {n.label}
            </Link>
          ))}
          <Link to="/admin/login" onClick={() => setOpen(false)} className="py-2 text-[#c9a66b] tracking-widest uppercase text-xs">
            Área da Corretora
          </Link>
        </div>
      )}
    </header>
  );
}
