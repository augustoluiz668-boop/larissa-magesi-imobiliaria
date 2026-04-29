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
      await api.put("/admin/settings", s);
      toast.success("Configurações salvas");
    } catch {
      toast.error("Falha ao salvar");
    } finally { setSaving(false); }
  };

  if (!s) return <AdminLayout title="Configurações"><div className="py-20 text-center">Carregando…</div></AdminLayout>;
  const f = (k) => ({ value: s[k] || "", onChange: (e) => setS({ ...s, [k]: e.target.value }) });

  return (
    <AdminLayout title="Configurações" subtitle="Dados públicos exibidos no site institucional">
      <form onSubmit={save} data-testid="settings-form" className="bg-white border border-[#E5E0D8] rounded-sm p-6 grid md:grid-cols-2 gap-4 max-w-4xl">
        <div><label className="lm-label">CRECI</label><input className="lm-input" {...f("creci")} data-testid="set-creci" /></div>
        <div><label className="lm-label">Cidade de atuação</label><input className="lm-input" {...f("cidade")} /></div>
        <div><label className="lm-label">Telefone</label><input className="lm-input" {...f("telefone")} /></div>
        <div><label className="lm-label">WhatsApp (somente números com DDI)</label><input className="lm-input" {...f("whatsapp")} data-testid="set-wa" /></div>
        <div><label className="lm-label">E-mail</label><input className="lm-input" type="email" {...f("email")} /></div>
        <div><label className="lm-label">Instagram</label><input className="lm-input" {...f("instagram")} /></div>
        <div><label className="lm-label">Facebook</label><input className="lm-input" {...f("facebook")} /></div>
        <div><label className="lm-label">Endereço profissional</label><input className="lm-input" {...f("endereco")} /></div>
        <div className="md:col-span-2"><label className="lm-label">Bio / Apresentação</label>
          <textarea rows={4} className="lm-input" {...f("bio")} data-testid="set-bio" />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <button disabled={saving} type="submit" className="lm-btn-primary" data-testid="set-save"><Save className="w-4 h-4" /> {saving ? "Salvando…" : "Salvar alterações"}</button>
        </div>
      </form>
    </AdminLayout>
  );
}
