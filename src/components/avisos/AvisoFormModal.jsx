import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Loader2, AlertTriangle, Upload } from "lucide-react";
import { AVISO_ACCEPT, AVISO_MAX_MB, PERFIS, parseAnexos, parseProfiles } from "@/lib/avisoUtils";
import AnexoButton from "@/components/avisos/AnexoButton";

const fieldCls =
  "w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30";

export default function AvisoFormModal({ aviso, autor, onClose, onSaved }) {
  const [form, setForm] = useState({
    titulo: aviso?.titulo || "",
    texto: aviso?.texto || "",
    importante: !!aviso?.importante,
    publicado: aviso ? aviso.publicado !== false : true,
    profiles: aviso ? parseProfiles(aviso) : ["AW119", "H125"],
    anexos: aviso ? parseAnexos(aviso) : [],
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const toggleProfile = (value) => {
    set(
      "profiles",
      form.profiles.includes(value)
        ? form.profiles.filter((p) => p !== value)
        : [...form.profiles, value]
    );
  };

  const upload = async (files) => {
    setError("");
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        if (file.size > AVISO_MAX_MB * 1024 * 1024) {
          setError(`${file.name} excede ${AVISO_MAX_MB} MB.`);
          continue;
        }
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        uploaded.push({ name: file.name, uri: file_uri, size: file.size, type: file.type });
      }
      if (uploaded.length) set("anexos", [...form.anexos, ...uploaded]);
    } catch {
      setError("Não foi possível enviar o arquivo. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const removeAnexo = (idx) =>
    set("anexos", form.anexos.filter((_, i) => i !== idx));

  const save = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.texto.trim()) {
      setError("Preencha o título e o texto do aviso.");
      return;
    }
    if (form.profiles.length === 0) {
      setError("Selecione ao menos uma aeronave.");
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      titulo: form.titulo.trim(),
      texto: form.texto.trim(),
      importante: form.importante,
      publicado: form.publicado,
      aircraft_profiles: JSON.stringify(form.profiles),
      anexos: JSON.stringify(form.anexos),
      autor: autor || "",
      data_publicacao: new Date().toISOString().slice(0, 10),
    };
    try {
      if (aviso) await base44.entities.Aviso.update(aviso.id, payload);
      else await base44.entities.Aviso.create(payload);
      onSaved();
    } catch (err) {
      setError(err?.message || "Não foi possível salvar o aviso.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-[#1A1D25] w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl border border-slate-700/60 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1A1D25] px-6 py-4 border-b border-slate-700/60 flex items-center justify-between">
          <h2 className="font-semibold text-lg text-slate-100">
            {aviso ? "Editar aviso" : "Novo aviso"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={save} className="px-6 py-5 space-y-4">
          <label className="block">
            <span className="block text-xs font-medium text-slate-400 mb-1">Título</span>
            <input
              value={form.titulo}
              onChange={(e) => set("titulo", e.target.value)}
              placeholder="Ex.: Nova diretriz de operação noturna"
              className={fieldCls}
            />
          </label>

          <label className="block">
            <span className="block text-xs font-medium text-slate-400 mb-1">Texto do aviso</span>
            <textarea
              value={form.texto}
              onChange={(e) => set("texto", e.target.value)}
              rows={5}
              placeholder="Descreva o aviso ou recomendação operacional…"
              className={fieldCls}
            />
          </label>

          <div>
            <span className="block text-xs font-medium text-slate-400 mb-2">
              Aeronaves
            </span>
            <div className="flex flex-wrap gap-2">
              {PERFIS.map((p) => {
                const active = form.profiles.includes(p.value);
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => toggleProfile(p.value)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      active
                        ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
                        : "bg-background text-slate-400 border-border hover:text-slate-200"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer px-3 py-2.5 rounded-lg bg-background border border-border">
              <input
                type="checkbox"
                checked={form.importante}
                onChange={(e) => set("importante", e.target.checked)}
                className="w-4 h-4 accent-amber-500"
              />
              Marcar como importante
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer px-3 py-2.5 rounded-lg bg-background border border-border">
              <input
                type="checkbox"
                checked={form.publicado}
                onChange={(e) => set("publicado", e.target.checked)}
                className="w-4 h-4 accent-amber-500"
              />
              Publicar para os pilotos
            </label>
          </div>

          <div className="p-4 rounded-xl bg-background border border-border space-y-3">
            <p className="text-xs font-semibold text-slate-300">Anexos</p>
            <p className="text-[11px] text-slate-500">
              Aceita .pdf, .jpg, .doc/.docx, .mp4 e .pptx — até {AVISO_MAX_MB} MB por arquivo.
            </p>
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer">
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              {uploading ? "Enviando…" : "Escolher arquivos"}
              <input
                type="file"
                multiple
                accept={AVISO_ACCEPT}
                disabled={uploading}
                onChange={(e) => upload(Array.from(e.target.files || []))}
                className="hidden"
              />
            </label>
            {form.anexos.length > 0 && (
              <ul className="space-y-2">
                {form.anexos.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="flex items-center gap-2">
                    <AnexoButton anexo={f} />
                    <button
                      type="button"
                      onClick={() => removeAnexo(i)}
                      className="text-slate-500 hover:text-rose-400 text-xs"
                    >
                      remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-amber-500 text-slate-900 hover:bg-amber-400 disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Salvando…" : "Salvar aviso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}