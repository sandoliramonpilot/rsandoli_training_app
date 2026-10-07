import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Loader2 } from "lucide-react";

const CATEGORIES = [
  { id: "feature", name: "Funcionalidade" },
  { id: "modulo", name: "Módulo / Disciplina" },
  { id: "integracao", name: "Integração" },
  { id: "seguranca", name: "Segurança" },
  { id: "infra", name: "Infraestrutura" },
  { id: "conteudo", name: "Conteúdo didático" },
  { id: "outro", name: "Outro" },
];

const STATUSES = [
  { id: "planejado", name: "Planejado" },
  { id: "em_andamento", name: "Em andamento" },
  { id: "concluido", name: "Concluído" },
  { id: "publicado", name: "Publicado" },
];

export default function MilestoneForm({ milestone, onSave, onClose }) {
  const [form, setForm] = useState({
    title: milestone?.title || "",
    description: milestone?.description || "",
    category: milestone?.category || "feature",
    status: milestone?.status || "planejado",
    milestone_date: milestone?.milestone_date || "",
    linkedin_text: milestone?.linkedin_text || "",
    auto_publish: milestone?.auto_publish ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) {
      setError("Informe o título do marco.");
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message || "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60">
          <h2 className="font-semibold text-slate-100">{milestone ? "Editar marco" : "Novo marco do projeto"}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {error && <div className="px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">{error}</div>}

          <div className="space-y-1.5">
            <Label className="text-slate-400 text-xs">Título *</Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} className="bg-[#12141A] border-slate-700/60" placeholder="Ex: PWA com instalação para iOS/Android" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-400 text-xs">Descrição</Label>
            <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} className="bg-[#12141A] border-slate-700/60 min-h-[80px]" placeholder="Detalhes do marco conquistado..." />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">Categoria</Label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-slate-200 text-sm">
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">Status</Label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-slate-200 text-sm">
                {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">Data do marco</Label>
              <Input type="date" value={form.milestone_date} onChange={(e) => set("milestone_date", e.target.value)} className="bg-[#12141A] border-slate-700/60" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-400 text-xs">Texto personalizado para LinkedIn (opcional)</Label>
            <Textarea value={form.linkedin_text} onChange={(e) => set("linkedin_text", e.target.value)} className="bg-[#12141A] border-slate-700/60 min-h-[100px]" placeholder="Deixe em branco para usar o texto automático (título + descrição + hashtags)." />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={form.auto_publish} onChange={(e) => set("auto_publish", e.target.checked)} className="accent-amber-500" />
            Publicar automaticamente no LinkedIn ao marcar como "Concluído"
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-700 text-slate-300">Cancelar</Button>
            <Button type="submit" disabled={saving} className="bg-amber-500 hover:bg-amber-400 text-slate-900">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {milestone ? "Salvar alterações" : "Criar marco"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}