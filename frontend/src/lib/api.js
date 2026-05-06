import axios from "axios";

const BASE = process.env.REACT_APP_BACKEND_URL;
export const API = `${BASE}/api`;

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("lm_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function maskPhone(value) {
  const d = (value || "").replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
}

export function maskCurrency(value) {
  const num = (value || "").replace(/\D/g, "");
  if (!num) return "";
  const n = parseInt(num, 10) / 100;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function parseCurrency(masked) {
  if (typeof masked === "number") return masked;
  return parseFloat((masked || "").replace(/[R$\s.]/g, "").replace(",", ".")) || 0;
}

export function formatMoney(value, finalidade) {
  if (!value && value !== 0) return "";
  try {
    const n = Number(value);
    const formatted = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(n);
    if (finalidade === "locacao") return `${formatted}/mês`;
    return formatted;
  } catch {
    return `R$ ${value}`;
  }
}

export function addWatermark(url) {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", "/upload/l_lm/fl_layer_apply,g_center,o_50,w_0.35/");
}

export function waLink(phone, message) {
  const clean = (phone || "5514991136895").replace(/\D/g, "");
  const msg = encodeURIComponent(message || "Olá Larissa! Vim pelo site e gostaria de mais informações.");
  return `https://wa.me/${clean}?text=${msg}`;
}

export const STAGE_LABELS = {
  novo: "Novo lead",
  primeiro_contato: "Primeiro contato",
  qualificacao: "Qualificação",
  imoveis_enviados: "Imóveis enviados",
  visita_agendada: "Visita agendada",
  proposta: "Proposta",
  negociacao: "Negociação",
  fechado: "Fechado",
  perdido: "Perdido",
};

export const STAGES = [
  "novo", "primeiro_contato", "qualificacao", "imoveis_enviados",
  "visita_agendada", "proposta", "negociacao", "fechado", "perdido",
];

export const ORIGIN_LABELS = {
  marketplace: "Marketplace",
  whatsapp: "WhatsApp",
  google: "Google",
  site: "Site",
  instagram: "Instagram",
  indicacao: "Indicação",
  facebook: "Facebook",
  anuncios: "Anúncios",
  outros: "Outros",
};

export const TYPE_LABELS = {
  casa: "Casa",
  apartamento: "Apartamento",
  condominio: "Condomínio",
  comercial: "Comercial",
  kitnet: "Kitnet",
  terreno: "Terreno",
};

export const PURPOSE_LABELS = {
  venda: "Venda",
  locacao: "Locação",
  permuta: "Permuta",
};
