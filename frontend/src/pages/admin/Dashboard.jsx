import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { api, formatMoney, STAGE_LABELS, ORIGIN_LABELS } from "../../lib/api";
import {
  Users, TrendingUp, KeyRound, CheckCircle2, X, Home, Calendar, Activity, Thermometer, DollarSign,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#2B3A2F", "#C5A059", "#7A9477", "#8B6D3F", "#4A5D4E", "#A88656", "#5C6E55", "#D4B574", "#3D5142"];

function Kpi({ icon: Icon, label, value, hint, testid, tone = "default" }) {
  const tones = {
    default: "bg-white",
    olive: "bg-[#2B3A2F] text-[#F4F1EB] border-[#2B3A2F]",
    gold: "bg-[#C5A059]/10 border-[#C5A059]/40",
  };
  return (
    <div data-testid={testid} className={`border border-[#E5E0D8] rounded-sm p-5 ${tones[tone]}`}>
      <div className="flex items-center justify-between">
        <div className="lm-overline" style={tone === "olive" ? { color: "#C5A059" } : {}}>{label}</div>
        <Icon className="w-4 h-4 opacity-70" strokeWidth={1.5} />
      </div>
      <div className={`font-serif text-3xl mt-2 ${tone === "olive" ? "text-[#F4F1EB]" : "text-[#2B3A2F]"}`}>{value}</div>
      {hint && <div className={`text-xs mt-1 ${tone === "olive" ? "text-[#C9C3B4]" : "text-[#5C5C5C]"}`}>{hint}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [s, setS] = useState(null);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    api.get("/admin/dashboard/stats").then((r) => setS(r.data));
    api.get("/admin/reports/insights").then((r) => setInsights(r.data.insights || []));
  }, []);

  if (!s) return <AdminLayout title="Dashboard"><div className="py-24 text-center text-[#5C5C5C]">Carregando…</div></AdminLayout>;

  const origemData = s.por_origem.map((x) => ({ ...x, name: ORIGIN_LABELS[x.name] || x.name }));
  const funilData = s.funil.map((x) => ({ ...x, name: STAGE_LABELS[x.stage] || x.stage }));

  return (
    <AdminLayout title="Dashboard" subtitle="Visão geral do seu negócio imobiliário">
      {/* KPIs primeira linha */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi testid="kpi-total" icon={Users} label="Total de leads" value={s.total_leads} tone="olive" />
        <Kpi testid="kpi-novos" icon={TrendingUp} label="Novos" value={s.novos} />
        <Kpi testid="kpi-visitas" icon={Calendar} label="Visitas agendadas" value={s.visitas} />
        <Kpi testid="kpi-fechados" icon={CheckCircle2} label="Negócios fechados" value={s.fechados} tone="gold" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <Kpi testid="kpi-atend" icon={Activity} label="Em atendimento" value={s.em_atendimento} />
        <Kpi testid="kpi-propostas" icon={KeyRound} label="Propostas" value={s.propostas} />
        <Kpi testid="kpi-negociacoes" icon={Home} label="Negociações" value={s.negociacoes} />
        <Kpi testid="kpi-conv" icon={TrendingUp} label="Taxa de conversão" value={`${s.conversao}%`} hint={`${s.fechados} de ${s.total_leads}`} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <Kpi testid="kpi-aberto" icon={DollarSign} label="Em oportunidades abertas" value={formatMoney(s.valor_aberto)} />
        <Kpi testid="kpi-fechado" icon={DollarSign} label="Em negócios fechados" value={formatMoney(s.valor_fechado)} tone="gold" />
        <Kpi testid="kpi-imoveis" icon={Home} label="Imóveis cadastrados" value={s.total_imoveis} />
        <Kpi testid="kpi-perdidos" icon={X} label="Leads perdidos" value={s.perdidos} />
      </div>

      {/* Gráficos */}
      <div className="grid lg:grid-cols-3 gap-5 mt-8">
        <div className="bg-white border border-[#E5E0D8] rounded-sm p-5 lg:col-span-2">
          <div className="lm-overline mb-1">Evolução de leads</div>
          <div className="font-serif text-2xl text-[#2B3A2F] mb-4">Últimos 6 meses</div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={s.evolucao_mensal}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
              <XAxis dataKey="mes" stroke="#5C5C5C" fontSize={12} />
              <YAxis stroke="#5C5C5C" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="leads" stroke="#2B3A2F" strokeWidth={2.5} dot={{ fill: "#C5A059", r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-sm p-5">
          <div className="lm-overline mb-1">Temperatura dos leads</div>
          <div className="font-serif text-2xl text-[#2B3A2F] mb-4 flex items-center gap-2"><Thermometer className="w-5 h-5" /> Quente · Morno · Frio</div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={s.por_temperatura} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                {s.por_temperatura.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-sm p-5 lg:col-span-2">
          <div className="lm-overline mb-1">Funil comercial</div>
          <div className="font-serif text-2xl text-[#2B3A2F] mb-4">Leads por etapa</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={funilData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
              <XAxis type="number" stroke="#5C5C5C" fontSize={12} />
              <YAxis dataKey="name" type="category" width={130} stroke="#5C5C5C" fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#2B3A2F" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-sm p-5">
          <div className="lm-overline mb-1">Leads por origem</div>
          <div className="font-serif text-2xl text-[#2B3A2F] mb-4">Canais que trazem resultado</div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={origemData} dataKey="value" nameKey="name" outerRadius={95}>
                {origemData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 text-xs mt-3">
            {origemData.map((o, i) => (
              <span key={i} className="flex items-center gap-1 text-[#5C5C5C]">
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} /> {o.name} · {o.value}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-8 bg-[#2B3A2F] text-[#F4F1EB] rounded-sm p-8">
        <div className="text-xs tracking-[0.25em] uppercase text-[#C5A059] mb-3">Insights automáticos</div>
        <div className="font-serif text-3xl mb-5">Inteligência comercial</div>
        <ul className="grid md:grid-cols-2 gap-3">
          {insights.map((t, i) => (
            <li key={i} data-testid={`insight-${i}`} className="bg-[#3D5142]/60 border border-[#3D5142] rounded-sm px-5 py-4 text-sm leading-relaxed">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </AdminLayout>
  );
}
