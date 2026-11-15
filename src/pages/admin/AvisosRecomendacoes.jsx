import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import BackToDashboard from "@/components/BackToDashboard";
import AnexoButton from "@/components/avisos/AnexoButton";
import AvisoFormModal from "@/components/avisos/AvisoFormModal";
import { useAuth } from "@/lib/AuthContext";
import { getAccessLevel } from "@/lib/accessControl";
import { Plus, Edit3, Trash2, Loader2, Megaphone, AlertTriangle, Eye, EyeOff, Mail, Users, CheckCircle2, XCircle } from "lucide-react";
import { parseAnexos, parseProfiles, parseDestinatarios, PERFIS } from "@/lib/avisoUtils";

export default function AvisosRecomendacoes() {
  const { user } = useAuth();
  const [avisos, setAvisos] = useState(null);
  const [editing, setEditing] = useState(undefined);
  const [busyId, setBusyId] = useState(null);
  const [emailBusyId, setEmailBusyId] = useState(null);
  const [emailResult, setEmailResult] = useState({});

  const canManage = ["admin_geral", "administrador"].includes(getAccessLevel(user));

  const load = async () => {
    const list = await base44.entities.Aviso.list("-created_date").catch(() => []);
    setAvisos(list);
  };

  useEffect(() => {
    load();
  }, []);

  const togglePublicado = async (aviso) => {
    setBusyId(aviso.id);
    try {
      await base44.entities.Aviso.update(aviso.id, { publicado: !aviso.publicado });
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const enviarEmail = async (aviso) => {
    setEmailBusyId(aviso.id);
    setEmailResult((p) => ({ ...p, [aviso.id]: null }));
    try {
      const res = await base44.functions.invoke("sendAvisoEmail", { aviso_id: aviso.id });
      const data = res.data || {};
      setEmailResult((p) => ({ ...p, [aviso.id]: data }));
      if (data.sent > 0) await load();
    } catch (err) {
      setEmailResult((p) => ({
        ...p,
        [aviso.id]: { ok: false, message: err?.response?.data?.error || err.message },
      }));
    } finally {
      setEmailBusyId(null);
    }
  };

  const remove = async (aviso) => {
    if (!window.confirm(`Excluir o aviso "${aviso.titulo}"?`)) return;
    setBusyId(aviso.id);
    try {
      await base44.entities.Aviso.delete(aviso.id);
      await load();
    } finally {
      setBusyId(null);
    }
  };

  if (!canManage) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Área restrita à administração.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Administração</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
            AVISOS E RECOMENDAÇÕES
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Comunicados operacionais publicados para os pilotos, por aeronave e por piloto.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <BackToDashboard />
          <button
            onClick={() => setEditing(null)}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-semibold px-4 py-2.5 rounded-lg"
          >
            <Plus className="w-4 h-4" /> Novo aviso
          </button>
        </div>
      </header>

      {!avisos ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : avisos.length === 0 ? (
        <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 px-6 py-16 text-center">
          <Megaphone className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Nenhum aviso criado ainda.</p>
          <p className="text-xs text-slate-500 mt-1">
            Use “Novo aviso” para publicar o primeiro comunicado aos pilotos.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {avisos.map((a) => {
            const anexos = parseAnexos(a);
            const profiles = parseProfiles(a);
            const destinatarios = parseDestinatarios(a);
            const resultado = emailResult[a.id];
            return (
              <article
                key={a.id}
                className={`bg-[#1A1D25] rounded-2xl border p-5 ${
                  a.importante ? "border-amber-500/40" : "border-slate-700/60"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {a.importante && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40">
                          <AlertTriangle className="w-3 h-3" /> Importante
                        </span>
                      )}
                      <span
                        className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          a.publicado
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                            : "bg-slate-700/30 text-slate-400 border-slate-600"
                        }`}
                      >
                        {a.publicado ? "Publicado" : "Rascunho"}
                      </span>
                      {PERFIS.filter((p) => profiles.includes(p.value)).map((p) => (
                        <span
                          key={p.value}
                          className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-slate-600 text-slate-300"
                        >
                          {p.label}
                        </span>
                      ))}
                      {destinatarios.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-sky-500/40 text-sky-300 bg-sky-500/10">
                          <Users className="w-3 h-3" /> {destinatarios.length} piloto(s)
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-slate-100 mt-2">{a.titulo}</h3>
                    <p className="text-sm text-slate-400 mt-1.5 whitespace-pre-line">{a.texto}</p>
                    {anexos.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {anexos.map((f, i) => (
                          <AnexoButton key={`${f.name}-${i}`} anexo={f} />
                        ))}
                      </div>
                    )}

                    {resultado && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {resultado.sent > 0 && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-2.5 py-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> E-mail enviado para {resultado.sent} piloto(s).
                          </span>
                        )}
                        {resultado.message && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-2.5 py-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" /> {resultado.message}
                          </span>
                        )}
                        {(resultado.failed || []).map((f, i) => (
                          <span
                            key={`f-${i}`}
                            className="inline-flex items-center gap-1.5 text-[11px] text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-2.5 py-1.5"
                          >
                            <XCircle className="w-3.5 h-3.5" /> {f.nome || f.email}: {f.motivo}
                          </span>
                        ))}
                        {(resultado.sem_conta || []).map((s, i) => (
                          <span
                            key={`s-${i}`}
                            className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-700/20 border border-slate-600 rounded-lg px-2.5 py-1.5"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" /> {s.nome || s.email}: sem conta de acesso
                          </span>
                        ))}
                      </div>
                    )}

                    {a.email_enviado_at && (
                      <p className="mt-2 text-[11px] text-slate-500">
                        Último envio por e-mail: {new Date(a.email_enviado_at).toLocaleString("pt-BR")}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => enviarEmail(a)}
                      disabled={emailBusyId === a.id}
                      title="Enviar por e-mail aos pilotos destinatários"
                      className="p-2 text-slate-400 hover:text-sky-300 rounded-lg hover:bg-white/5 disabled:opacity-40"
                    >
                      {emailBusyId === a.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => togglePublicado(a)}
                      disabled={busyId === a.id}
                      title={a.publicado ? "Despublicar" : "Publicar"}
                      className="p-2 text-slate-400 hover:text-emerald-300 rounded-lg hover:bg-white/5 disabled:opacity-40"
                    >
                      {a.publicado ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setEditing(a)}
                      title="Editar"
                      className="p-2 text-slate-400 hover:text-amber-300 rounded-lg hover:bg-white/5"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => remove(a)}
                      disabled={busyId === a.id}
                      title="Excluir"
                      className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5 disabled:opacity-40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {editing !== undefined && (
        <AvisoFormModal
          aviso={editing}
          autor={user?.full_name || user?.email || ""}
          onClose={() => setEditing(undefined)}
          onSaved={async () => {
            setEditing(undefined);
            await load();
          }}
        />
      )}
    </div>
  );
}