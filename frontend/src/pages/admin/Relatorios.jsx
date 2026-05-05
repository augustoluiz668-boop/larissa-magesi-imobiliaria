import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { STAGE_LABELS, ORIGIN_LABELS, TYPE_LABELS, formatMoney } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#071d34", "#c9a66b", "#7A9477", "#8B6D3F", "#4A5D4E", "#A88656", "#5C6E55", "#dbbf8a", "#0d2d4c"];

const FAIXAS = [
  { label: "Até R$ 200k", min: 0, max: 200000 },
  { label: "R$ 200k – 400k", min: 200000, max: 400000 },
  { label: "R$ 400k – 600k", min: 400000, max: 600000 },
  { label: "R$ 600k – 1M", min: 600000, max: 1000000 },
  { label: "Acima de R$ 1M", min: 1000000, max: Infinity },
];

function buildBudgetTable(leads) {
  const tipos = [...new Set(leads.map((l) => l.tipo_imovel).filter(Boolean))].sort();
  const rows = FAIXAS.map((f) => {
    const leadsInFaixa = leads.filter((l) => l.orcamento >= f.min && l.orcamento < f.max);
    const byTipo = {};
    tipos.forEach((t) => { byTipo[t] = leadsInFaixa.filter((l) => l.tipo_imovel === t).length; });
    return { faixa: f.label, total: leadsInFaixa.length, byTipo };
  });
  return { rows, tipos };
}

export default function Relatorios() {
  const [s, setS] = useState(null);
  const [insights, setInsights] = useState([]);
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    supabase.from("leads").select("*").then(({ data }) => {
      if (!data) return;
      setLeads(data);
      const count = (stage) => data.filter((l) => l.stage === stage).length;
      const total = data.length;
      const fechados = count("fechado");
      const por_origem = Object.entries(
        data.reduce((acc, l) => { acc[l.origem || "outros"] = (acc[l.origem || "outros"] || 0) + 1; return acc; }, {})
      ).map(([name, value]) => ({ name, value }));
      const funil = Object.entries(
        data.reduce((acc, l) => { acc[l.stage || "novo"] = (acc[l.stage || "novo"] || 0) + 1; return acc; }, {})
      ).map(([stage, total]) => ({ stage, total }));
      const now = new Date();
      const evolucao_mensal = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        return { mes: d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }), leads: data.filter((l) => (l.created_at || "").startsWith(key)).length };
      });
      const por_cidade = Object.entries(
        data.reduce((acc, l) => { const c = l.cidade_interesse || "—"; acc[c] = (acc[c] || 0) + 1; return acc; }, {})
      ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
      const por_tipo = Object.entries(
        data.reduce((acc, l) => { if (l.tipo_imovel) { acc[l.tipo_imovel] = (acc[l.tipo_imovel] || 0) + 1; } return acc; }, {})
      ).map(([name, value]) => ({ name, value }));
      const por_finalidade = Object.entries(
        data.reduce((acc, l) => { const f = l.finalidade || "outros"; acc[f] = (acc[f] || 0) + 1; return acc; }, {})
      ).map(([name, value]) => ({ name, value }));
      setS({
        total_leads: total, novos: count("novo"), visitas: count("visita_agendada"),
        fechados, em_atendimento: count("primeiro_contato") + count("qualificacao") + count("imoveis_enviados"),
        propostas: count("proposta"), negociacoes: count("negociacao"),
        conversao: total > 0 ? Math.round((fechados / total) * 100) : 0,
        valor_aberto: data.filter((l) => !["fechado","perdido"].includes(l.stage)).reduce((a, l) => a + (l.orcamento || 0), 0),
        valor_fechado: data.filter((l) => l.stage === "fechado").reduce((a, l) => a + (l.orcamento || 0), 0),
        perdidos: count("perdido"), por_origem, funil, evolucao_mensal, por_cidade, por_tipo, por_finalidade,
      });
    });
  }, []);

  if (!s) return <AdminLayout title="Relatórios"><div className="py-24 text-center text-[#5C5C5C]">Carregando…</div></AdminLayout>;

  return (
    <AdminLayout title="Relatórios" subtitle="Inteligência comercial para decisões melhores">
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <KpiMini label="Conversão geral" value={`${s.conversao}%`} />
        <KpiMini label="Oportunidades abertas" value={formatMoney(s.valor_aberto)} />
        <KpiMini label="Negócios fechados" value={formatMoney(s.valor_fechado)} />
        <KpiMini label="Ticket médio (fechados)" value={s.fechados ? formatMoney(s.valor_fechado / s.fechados) : "—"} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="Evolução de leads (6 meses)">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={s.evolucao_mensal}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1dde8" />
              <XAxis dataKey="mes" stroke="#5C5C5C" fontSize={12} />
              <YAxis stroke="#5C5C5C" fontSize={12} />
              <Tooltip /> <Line type="monotone" dataKey="leads" stroke="#071d34" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Leads por cidade">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={s.por_cidade}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1dde8" />
              <XAxis dataKey="name" stroke="#5C5C5C" fontSize={11} angle={-20} textAnchor="end" height={60} />
              <YAxis stroke="#5C5C5C" fontSize={12} />
              <Tooltip /> <Bar dataKey="value" fill="#c9a66b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Leads por tipo de imóvel">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={s.por_tipo.map((x) => ({ ...x, name: TYPE_LABELS[x.name] || x.name }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1dde8" />
              <XAxis dataKey="name" stroke="#5C5C5C" fontSize={11} />
              <YAxis stroke="#5C5C5C" fontSize={12} />
              <Tooltip /> <Bar dataKey="value" fill="#071d34" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Funil comercial completo">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={s.funil.map((x) => ({ ...x, name: STAGE_LABELS[x.stage] }))} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1dde8" />
              <XAxis type="number" stroke="#5C5C5C" fontSize={12} />
              <YAxis dataKey="name" type="category" width={140} stroke="#5C5C5C" fontSize={12} />
              <Tooltip /> <Bar dataKey="total" fill="#c9a66b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Finalidade mais buscada">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={s.por_finalidade} dataKey="value" nameKey="name" outerRadius={95}>
                {s.por_finalidade.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 text-xs mt-2">
            {s.por_finalidade.map((o, i) => (
              <span key={i} className="flex items-center gap-1 text-[#5C5C5C]">
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} /> {o.name} · {o.value}
              </span>
            ))}
          </div>
        </Card>

        <Card title="Origem dos leads">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={s.por_origem.map((x) => ({ ...x, name: ORIGIN_LABELS[x.name] || x.name }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1dde8" />
              <XAxis dataKey="name" stroke="#5C5C5C" fontSize={11} />
              <YAxis stroke="#5C5C5C" fontSize={12} />
              <Tooltip /> <Bar dataKey="value" fill="#071d34" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Faixa de valor mais buscada */}
      {leads.length > 0 && (() => {
        const { rows, tipos } = buildBudgetTable(leads.filter((l) => l.orcamento > 0));
        return (
          <div className="mt-5 bg-white border border-[#d1dde8] rounded-sm p-5">
            <div className="font-serif text-xl text-[#071d34] mb-4">Faixa de valor mais buscada</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-[#f8fafc] text-xs uppercase tracking-wider text-[#5C5C5C]">
                    <th className="px-4 py-2 text-left">Faixa</th>
                    <th className="px-4 py-2 text-center">Total</th>
                    {tipos.map((t) => <th key={t} className="px-4 py-2 text-center capitalize">{TYPE_LABELS[t] || t}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.faixa} className="border-t border-[#d1dde8]">
                      <td className="px-4 py-2 font-medium text-[#071d34]">{r.faixa}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.total > 0 ? "bg-[#c9a66b]/20 text-[#071d34]" : "text-[#5C5C5C]"}`}>
                          {r.total}
                        </span>
                      </td>
                      {tipos.map((t) => (
                        <td key={t} className="px-4 py-2 text-center text-[#5C5C5C]">
                          {r.byTipo[t] || 0}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      <div className="mt-5 bg-[#071d34] text-[#f8fafc] rounded-sm p-8">
        <div className="lm-overline !text-[#c9a66b] mb-3">Insights automáticos</div>
        <div className="font-serif text-3xl mb-5">Inteligência comercial</div>
        <ul className="grid md:grid-cols-2 gap-3">
          {insights.map((t, i) => (
            <li key={i} className="bg-[#0d2d4c]/60 border border-[#0d2d4c] rounded-sm px-5 py-4 text-sm leading-relaxed">{t}</li>
          ))}
        </ul>
      </div>
    </AdminLayout>
  );
}

function KpiMini({ label, value }) {
  return (
    <div className="bg-white border border-[#d1dde8] rounded-sm p-5">
      <div className="lm-overline">{label}</div>
      <div className="font-serif text-2xl text-[#071d34] mt-2">{value}</div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white border border-[#d1dde8] rounded-sm p-5">
      <div className="font-serif text-xl text-[#071d34] mb-4">{title}</div>
      {children}
    </div>
  );
}
