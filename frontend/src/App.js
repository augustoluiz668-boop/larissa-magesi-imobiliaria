import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";
import { api } from "./lib/api";

import Home from "./pages/public/Home";
import ImoveisList from "./pages/public/ImoveisList";
import ImovelDetail from "./pages/public/ImovelDetail";
import About from "./pages/public/About";
import Financing from "./pages/public/Financing";
import Contact from "./pages/public/Contact";
import CadastrarImovel from "./pages/public/CadastrarImovel";

import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import LeadsPage from "./pages/admin/Leads";
import FunilPage from "./pages/admin/Funil";
import ImoveisAdmin from "./pages/admin/Imoveis";
import Relatorios from "./pages/admin/Relatorios";
import OrigemLeads from "./pages/admin/OrigemLeads";
import Configuracoes from "./pages/admin/Configuracoes";
import Depoimentos from "./pages/admin/Depoimentos";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsappFab from "./components/WhatsappFab";

function ScrollToHash() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash.slice(1));
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [pathname, hash]);
  return null;
}

function PublicShell({ children }) {
  const [settings, setSettings] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("lm_settings") || "{}"); } catch { return {}; }
  });
  useEffect(() => {
    api.get("/public/settings").then((r) => {
      setSettings(r.data);
      try { sessionStorage.setItem("lm_settings", JSON.stringify(r.data)); } catch {}
    }).catch(() => {});
  }, []);
  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col">
      <Navbar settings={settings} />
      <main className="flex-1">{React.cloneElement(children, { settings })}</main>
      <Footer settings={settings} />
      <WhatsappFab phone={settings.whatsapp} />
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <ScrollToHash />
          <Toaster position="top-right" richColors />
          <Routes>
            <Route path="/" element={<PublicShell><Home /></PublicShell>} />
            <Route path="/imoveis" element={<PublicShell><ImoveisList /></PublicShell>} />
            <Route path="/imoveis/:id" element={<PublicShell><ImovelDetail /></PublicShell>} />
            <Route path="/sobre" element={<PublicShell><About /></PublicShell>} />
            <Route path="/financiamento" element={<PublicShell><Financing /></PublicShell>} />
            <Route path="/contato" element={<PublicShell><Contact /></PublicShell>} />
            <Route path="/cadastrar-imovel" element={<PublicShell><CadastrarImovel /></PublicShell>} />

            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
            <Route path="/admin/funil" element={<ProtectedRoute><FunilPage /></ProtectedRoute>} />
            <Route path="/admin/imoveis" element={<ProtectedRoute><ImoveisAdmin /></ProtectedRoute>} />
            <Route path="/admin/depoimentos" element={<ProtectedRoute><Depoimentos /></ProtectedRoute>} />
            <Route path="/admin/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
            <Route path="/admin/origem" element={<ProtectedRoute><OrigemLeads /></ProtectedRoute>} />
            <Route path="/admin/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
