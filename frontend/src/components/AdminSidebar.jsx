import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Kanban, Home, BarChart3, Radar, Settings, LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/leads", label: "Leads", icon: Users },
  { to: "/admin/funil", label: "Funil", icon: Kanban },
  { to: "/admin/imoveis", label: "Imóveis", icon: Home },
  { to: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/admin/origem", label: "Origem dos Leads", icon: Radar },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const handleLogout = () => {
    logout();
    nav("/admin/login");
  };
  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#2B3A2F] text-[#E8E2D6] min-h-screen sticky top-0">
      <div className="px-6 py-7 border-b border-[#3D5142]">
        <Link to="/" className="block">
          <div className="font-serif text-2xl text-[#F4F1EB]">Larissa Magesi</div>
          <div className="text-[10px] tracking-[0.22em] uppercase text-[#C5A059] mt-1">Painel Administrativo</div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.exact}
            data-testid={`sidebar-${it.label.toLowerCase().replace(/\s/g, "-")}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-[#3D5142] text-[#F4F1EB] border-l-2 border-[#C5A059]"
                  : "text-[#C9C3B4] hover:bg-[#3D5142]/50"
              }`
            }
          >
            <it.icon className="w-4 h-4" strokeWidth={1.5} /> {it.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-5 border-t border-[#3D5142]">
        <div className="text-xs text-[#C9C3B4] mb-1">Conectada como</div>
        <div className="font-medium text-[#F4F1EB] text-sm">{user?.name || user?.email}</div>
        <button
          data-testid="sidebar-logout"
          onClick={handleLogout}
          className="mt-4 w-full flex items-center justify-center gap-2 text-xs py-2 rounded-full border border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059] hover:text-[#2B3A2F] transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Sair
        </button>
      </div>
    </aside>
  );
}
