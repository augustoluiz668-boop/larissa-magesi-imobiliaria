import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Kanban, Home, BarChart3, Radar, Settings, LogOut, Star,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/leads", label: "Leads", icon: Users },
  { to: "/admin/funil", label: "Funil", icon: Kanban },
  { to: "/admin/imoveis", label: "Imóveis", icon: Home },
  { to: "/admin/depoimentos", label: "Depoimentos", icon: Star },
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
    <aside className="hidden md:flex flex-col w-64 bg-[#071d34] text-[#E8E2D6] min-h-screen sticky top-0">
      <div className="px-6 py-7 border-b border-[#0d2d4c]">
        <Link to="/" className="block">
          <div className="font-serif text-2xl text-[#f8fafc]">Larissa Magesi</div>
          <div className="text-[10px] tracking-[0.22em] uppercase text-[#c9a66b] mt-1">Painel Administrativo</div>
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
                  ? "bg-[#0d2d4c] text-[#f8fafc] border-l-2 border-[#c9a66b]"
                  : "text-[#a8b8cc] hover:bg-[#0d2d4c]/50"
              }`
            }
          >
            <it.icon className="w-4 h-4" strokeWidth={1.5} /> {it.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-5 border-t border-[#0d2d4c]">
        <div className="text-xs text-[#a8b8cc] mb-1">Conectada como</div>
        <div className="font-medium text-[#f8fafc] text-sm">{user?.name || user?.email}</div>
        <button
          data-testid="sidebar-logout"
          onClick={handleLogout}
          className="mt-4 w-full flex items-center justify-center gap-2 text-xs py-2 rounded-full border border-[#c9a66b] text-[#c9a66b] hover:bg-[#c9a66b] hover:text-[#071d34] transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Sair
        </button>
      </div>
    </aside>
  );
}
