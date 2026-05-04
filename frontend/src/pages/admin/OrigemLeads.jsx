import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { ORIGIN_LABELS, formatMoney } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { TrendingUp, Target, DollarSign } from "lucide-react";

export default function OrigemLeads() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    supabase.from("leads").select("*").then(({ data }) => {
      if (!data) return;
      const map = {};
      data.forEach((l) => {
        const o = l.origem || "outros";
        if (!map[o]) map[o] = { origem: o, total: 0, fechados: 0, valor: 0 };
        map[o].total++;
        if (l.stage === "fechado") { map[o].fechados++; map[o].valor += l.orcamento || 0; }
      });
      setRows(Object.values(map).map((r) => ({ ...r, conversao: r.total > 0 ? Math.round((r.fechados / r.total) * 100) : 0 })));
    });
  }, []);

  const totals = rows.reduce((a, r) => ({
    leads: a.leads + r.total, fechados: a.fechados + r.fechados, valor: a.valor + r.valor,
  }), { leads: 0, fechados: 0, valor: 0 });
  const best = [...rows].sort((a, b) => b.total - a.total)[0];
  const bestConv = [...rows].sort((a, b) => b.conversao - a.conversao)[0];

  return (
    <AdminLayout title="Origem dos Leads" subtitle="Compreenda quais canais trazem o melhor resultado">
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card icon={Target} label="Origem com mais leads" value={best ? ORIGIN_LABELS[best.origem] : "—"} hint={best ? `${best.total} contatos` : ""} />
        <Card icon={TrendingUp} label="Melhor taxa de conversão" value={bestConv ? ORIGIN_LABELS[bestConv.origem] : "—"} hint={bestConv ? `${bestConv.conversao}% fechamento` : ""} />
        <Card icon={DollarSign} label="Receita total fechada" value={formatMoney(totals.valor)} hint={`${totals.fechados} negócios`} />
      </div>

      <div className="bg-white border border-[#d1dde8] rounded-sm overflow-hidden">
        <div className="overflow-x-auto lm-scroll">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f8fafc] text-xs uppercase tracking-wider text-[#5C5C5C] text-left">
              <tr>
                <th className="px-5 py-3">Origem</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Fechados</th>
                <th className="px-5 py-3">Perdidos</th>
                <th className="px-5 py-3">Abertos</th>
                <th className="px-5 py-3">Conversão</th>
                <th className="px-5 py-3">Valor fechado</th>
                <th className="px-5 py-3">Relevância</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const max = Math.max(...rows.map((x) => x.total));
                const pct = max ? Math.round((r.total / max) * 100) : 0;
                return (
                  <tr key={r.origem} className="border-t border-[#d1dde8]" data-testid={`origin-row-${r.origem}`}>
                    <td className="px-5 py-3 font-medium text-[#2C2C2C]">{ORIGIN_LABELS[r.origem]}</td>
                    <td className="px-5 py-3">{r.total}</td>
                    <td className="px-5 py-3 text-green-700">{r.fechados}</td>
                    <td className="px-5 py-3 text-red-700">{r.perdidos}</td>
                    <td className="px-5 py-3">{r.abertos}</td>
                    <td className="px-5 py-3">{r.conversao}%</td>
                    <td className="px-5 py-3 text-[#071d34]">{formatMoney(r.valor)}</td>
                    <td className="px-5 py-3">
                      <div className="w-32 h-1.5 rounded-full bg-[#f8fafc] overflow-hidden">
                        <div className="h-full bg-[#c9a66b]" style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && <tr><td colSpan={8} className="text-center py-10 text-[#5C5C5C]">Sem dados</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

function Card({ icon: Icon, label, value, hint }) {
  return (
    <div className="bg-white border border-[#d1dde8] rounded-sm p-5">
      <div className="flex items-center justify-between">
        <div className="lm-overline">{label}</div>
        <Icon className="w-4 h-4 text-[#5C5C5C]" />
      </div>
      <div className="font-serif text-2xl text-[#071d34] mt-2">{value}</div>
      {hint && <div className="text-xs text-[#5C5C5C] mt-1">{hint}</div>}
    </div>
  );
}
