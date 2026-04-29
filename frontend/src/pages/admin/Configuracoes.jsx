import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { api } from "../../lib/api";
import { Save } from "lucide-react";
import { toast } from "sonner";

export default function Configuracoes() {
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/public/settings").then((r) => setS(r.data));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/admin/settings", { ...s, finance_rate_annual: Number(s.finance_rate_annual) || 10.49 });
      toast.success("Configurações salvas");
    } catch { toast.error("Falha ao salvar"); } finally { setSaving(false); }
  };

  if (!s) return <AdminLayout title="Configurações"><div className="py-20 text-center">Carregando…</div></AdminLayout>;
  const f = (k) => ({ value: s[k] ?? "", onChange: (e) => setS({ ...s, [k]: e.target.value }) });

  return (
    <AdminLayout title="Configurações" subtitle="Dados públicos exibidos no site institucional">
      <form onSubmit={save} data-testid="settings-form" className="space-y-6 max-w-5xl">
        <Section title="Identidade">
          <Field label="CRECI" testid="set-creci" {...f("creci")} />
          <Field label="Cidade de atuação" {...f("cidade")} />
          <Field label="URL do logo (PNG)" {...f("logo_url")} colSpan />
          <Field label="URL da sua foto profissional" {...f("photo_url")} colSpan />
        </Section>

        <Section title="Contato">
          <Field label="Telefone" {...f("telefone")} />
          <Field label="WhatsApp (somente números com DDI)" testid="set-wa" {...f("whatsapp")} />
          <Field label="E-mail" type="email" {...f("email")} />
          <Field label="Endereço profissional" {...f("endereco")} />
        </Section>

        <Section title="Redes sociais (URLs ou @usuário)">
          <Field label="Instagram" {...f("instagram")} />
          <Field label="Facebook" {...f("facebook")} />
          <Field label="YouTube (URL completa)" {...f("youtube")} />
          <Field label="TikTok (URL completa)" {...f("tiktok")} />
          <Field label="LinkedIn (URL completa)" {...f("linkedin")} />
          <Field label="Google Meu Negócio (URL completa)" {...f("google_business")} />
        </Section>

        <Section title="Apresentação e mensagem">
          <div className="md:col-span-2"><label className="lm-label">Bio / Apresentação</label>
            <textarea rows={3} className="lm-input" {...f("bio")} data-testid="set-bio" />
          </div>
          <div className="md:col-span-2"><label className="lm-label">Missão</label>
            <textarea rows={3} className="lm-input" {...f("missao")} />
          </div>
          <div className="md:col-span-2"><label className="lm-label">Visão</label>
            <textarea rows={3} className="lm-input" {...f("visao")} />
          </div>
          <div className="md:col-span-2"><label className="lm-label">Valores (separados por ·)</label>
            <input className="lm-input" {...f("valores")} />
          </div>
        </Section>

        <Section title="Simulação de financiamento">
          <Field label="Taxa de juros anual (% a.a.)" type="number" {...f("finance_rate_annual")} />
        </Section>

        <div className="flex justify-end">
          <button disabled={saving} type="submit" className="lm-btn-primary" data-testid="set-save"><Save className="w-4 h-4" /> {saving ? "Salvando…" : "Salvar alterações"}</button>
        </div>
      </form>
    </AdminLayout>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white border border-[#E5E0D8] rounded-sm p-6">
      <div className="font-serif text-xl text-[#2B3A2F] mb-4">{title}</div>
      <div className="grid md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", testid, colSpan }) {
  return (
    <div className={colSpan ? "md:col-span-2" : ""}>
      <label className="lm-label">{label}</label>
      <input type={type} className="lm-input" value={value} onChange={onChange} data-testid={testid} />
    </div>
  );
}
