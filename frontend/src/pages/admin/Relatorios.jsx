import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { api, STAGE_LABELS, ORIGIN_LABELS, TYPE_LABELS, formatMoney } from "../../lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#2B3A2F", "#C5A059", "#7A9477", "#8B6D3F", "#4A5D4E", "#A88656", "#5C6E55", "#D4B574", "#3D5142"];

export default function Relatorios() {
  const [s, setS] = useState(null);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    api.get("/admin/dashboard/stats").then((r) => setS(r.data));
    api.get("/admin/reports/insights").then((r) => setInsights(r.data.insights || []));
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
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
              <XAxis dataKey="mes" stroke="#5C5C5C" fontSize={12} />
              <YAxis stroke="#5C5C5C" fontSize={12} />
              <Tooltip /> <Line type="monotone" dataKey="leads" stroke="#2B3A2F" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Leads por cidade">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={s.por_cidade}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
              <XAxis dataKey="name" stroke="#5C5C5C" fontSize={11} angle={-20} textAnchor="end" height={60} />
              <YAxis stroke="#5C5C5C" fontSize={12} />
              <Tooltip /> <Bar dataKey="value" fill="#C5A059" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Leads por tipo de imóvel">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={s.por_tipo.map((x) => ({ ...x, name: TYPE_LABELS[x.name] || x.name }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
              <XAxis dataKey="name" stroke="#5C5C5C" fontSize={11} />
              <YAxis stroke="#5C5C5C" fontSize={12} />
              <Tooltip /> <Bar dataKey="value" fill="#2B3A2F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Funil comercial completo">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={s.funil.map((x) => ({ ...x, name: STAGE_LABELS[x.stage] }))} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
              <XAxis type="number" stroke="#5C5C5C" fontSize={12} />
              <YAxis dataKey="name" type="category" width={140} stroke="#5C5C5C" fontSize={12} />
              <Tooltip /> <Bar dataKey="count" fill="#C5A059" radius={[0, 4, 4, 0]} />
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
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
              <XAxis dataKey="name" stroke="#5C5C5C" fontSize={11} />
              <YAxis stroke="#5C5C5C" fontSize={12} />
              <Tooltip /> <Bar dataKey="value" fill="#2B3A2F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="mt-8 bg-[#2B3A2F] text-[#F4F1EB] rounded-sm p-8">
        <div className="lm-overline !text-[#C5A059] mb-3">Insights automáticos</div>
        <div className="font-serif text-3xl mb-5">Inteligência comercial</div>
        <ul className="grid md:grid-cols-2 gap-3">
          {insights.map((t, i) => (
            <li key={i} className="bg-[#3D5142]/60 border border-[#3D5142] rounded-sm px-5 py-4 text-sm leading-relaxed">{t}</li>
          ))}
        </ul>
      </div>
    </AdminLayout>
  );
}

function KpiMini({ label, value }) {
  return (
    <div className="bg-white border border-[#E5E0D8] rounded-sm p-5">
      <div className="lm-overline">{label}</div>
      <div className="font-serif text-2xl text-[#2B3A2F] mt-2">{value}</div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white border border-[#E5E0D8] rounded-sm p-5">
      <div className="font-serif text-xl text-[#2B3A2F] mb-4">{title}</div>
      {children}
    </div>
  );
}
