import React, { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import MilestoneForm from "@/components/marcos/MilestoneForm";
import {
  Plus, Loader2, X, Megaphone, Linkedin, CheckCircle2, Circle, Clock,
  Trash2, Pencil, Send, Sparkles, Calendar, Trophy,
} from "lucide-react";

const CONNECTOR_ID = "6ac678fd8ca0552cee16b417";

const CATEGORY_LABELS = {
  feature: "Funcionalidade", modulo: "Módulo", integracao: "Integração",
  seguranca: "Segurança", infra: "Infra", conteudo: "Conteúdo", outro: "Outro",
};

const STATUS_CONFIG = {
  planejado: { label: "Planejado", icon: Circle, tone: "text-slate-400 bg-slate-500/10 border-slate-500/30" },
  em_andamento: { label: "Em andamento", icon: Clock, tone: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  concluido: { label: "Concluído", icon: CheckCircle2, tone: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  publicado: { label: "Publicado", icon: Send, tone: "text-sky-400 bg-sky-500/10 border-sky-500/30" },
};

export default function MarcosProjeto() {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState(null);
  const [connected, setConnected] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [publishing, setPublishing] = useState(null);
  const [toast, setToast] = useState("");

  // Rule 2: reusable fetch for connection status
  const checkConnection = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("publishMilestoneLinkedIn", { action: "status" });
      setConnected(res.data.connected);
      setProfile(res.data.profile || null);
    } catch {
      setConnected(false);
      setProfile(null);
    }
  }, []);

  const loadMilestones = useCallback(async () => {
    const list = await base44.entities.ProjectMilestone.list("-milestone_date", 200).catch(() => []);
    setMilestones(list);
  }, []);

  useEffect(() => {
    (async () => {
      await Promise.all([loadMilestones(), checkConnection()]);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  // Rule 3: open OAuth popup, poll for close, then re-fetch
  const handleConnect = async () => {
    const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
    const popup = window.open(url, "_blank");
    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        checkConnection();
      }
    }, 500);
  };

  const handleDisconnect = async () => {
    await base44.connectors.disconnectAppUser(CONNECTOR_ID);
    setConnected(false);
    setProfile(null);
    setToast("Conta LinkedIn desconectada.");
  };

  const saveMilestone = async (form) => {
    const wasConcluido = modal?.milestone?.status === "concluido" || modal?.milestone?.status === "publicado";
    let saved;
    try {
      if (modal.milestone) {
        saved = await base44.entities.ProjectMilestone.update(modal.milestone.id, form);
      } else {
        saved = await base44.entities.ProjectMilestone.create(form);
      }
    } catch (err) {
      setToast(err?.response?.data?.error || err?.data?.error || err.message || "Erro ao salvar marco.");
      setModal(null);
      return;
    }
    await loadMilestones();
    setModal(null);
    setToast(modal.milestone ? "Marco atualizado." : "Marco criado com sucesso.");

    // Auto-publish: se marcou como concluído e auto_publish está ligado, publica automaticamente
    if (form.status === "concluido" && form.auto_publish && !wasConcluido) {
      if (connected) {
        setToast("Marco concluído! Publicando no LinkedIn automaticamente...");
        await publishMilestone(saved);
      } else {
        setToast("Marco salvo como concluído. Conecte o LinkedIn para publicar automaticamente.");
      }
    }
  };

  const publishMilestone = async (milestone) => {
    if (!connected) {
      setToast("Conecte sua conta do LinkedIn primeiro.");
      return;
    }
    setPublishing(milestone.id);
    try {
      const res = await base44.functions.invoke("publishMilestoneLinkedIn", {
        action: "publish",
        milestone_id: milestone.id,
      });
      setToast(`"${milestone.title}" publicado no LinkedIn! 🎉`);
      await loadMilestones();
    } catch (e) {
      setToast(e?.response?.data?.error || "Erro ao publicar no LinkedIn. Verifique a conexão e permissões.");
    } finally {
      setPublishing(null);
    }
  };

  const deleteMilestone = async (milestone) => {
    if (!confirm(`Excluir o marco "${milestone.title}"?`)) return;
    await base44.entities.ProjectMilestone.delete(milestone.id);
    await loadMilestones();
    setToast("Marco excluído.");
  };

  const stats = milestones
    ? {
        total: milestones.length,
        concluidos: milestones.filter((m) => m.status === "concluido" || m.status === "publicado").length,
        publicados: milestones.filter((m) => m.status === "publicado").length,
        andamento: milestones.filter((m) => m.status === "em_andamento").length,
      }
    : { total: 0, concluidos: 0, publicados: 0, andamento: 0 };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Administração</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
            Marcos do Projeto
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Acompanhe e divulgue as conquistas do RSandoli_Training automaticamente no LinkedIn.
          </p>
        </div>
        <Button className="bg-amber-500 hover:bg-amber-400 text-slate-900" onClick={() => setModal({ milestone: null })}>
          <Plus className="w-4 h-4 mr-2" /> Novo marco
        </Button>
      </header>

      {toast && (
        <div className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm flex items-center justify-between">
          {toast}
          <button onClick={() => setToast("")} className="text-amber-400 hover:text-amber-200"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* LinkedIn Connection Card */}
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#0A66C2] flex items-center justify-center shrink-0">
              <Linkedin className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-100">Conta do LinkedIn</p>
              {connected ? (
                <p className="text-sm text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Conectada
                  {profile?.firstName && (
                    <span className="text-slate-400">
                      {" — "}
                      {typeof profile.firstName === "object"
                        ? Object.values(profile.firstName).join(" ")
                        : profile.firstName}{" "}
                      {typeof profile.lastName === "object"
                        ? Object.values(profile.lastName).join(" ")
                        : profile.lastName || ""}
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-sm text-slate-500">Não conectada — conecte para publicar marcos</p>
              )}
            </div>
          </div>
          {connected ? (
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-rose-300" onClick={handleDisconnect}>
              Desconectar
            </Button>
          ) : (
            <Button className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white" onClick={handleConnect}>
              <Linkedin className="w-4 h-4 mr-2" /> Conectar LinkedIn
            </Button>
          )}
        </div>
        {!connected && (
          <div className="mt-4 pt-4 border-t border-slate-700/40 flex items-start gap-2 text-xs text-slate-500">
            <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
            <span>
              Ao conectar, cada marco concluído pode ser publicado automaticamente no seu feed do LinkedIn.
              A conexão é individual — cada administrador conecta a própria conta.
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatMini icon={Trophy} label="Total de marcos" value={stats.total} tone="text-amber-400" />
        <StatMini icon={Clock} label="Em andamento" value={stats.andamento} tone="text-orange-400" />
        <StatMini icon={CheckCircle2} label="Concluídos" value={stats.concluidos} tone="text-emerald-400" />
        <StatMini icon={Send} label="Publicados" value={stats.publicados} tone="text-sky-400" />
      </div>

      {/* Milestone List */}
      {milestones && milestones.length === 0 ? (
        <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 px-6 py-16 text-center">
          <Megaphone className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Nenhum marco cadastrado ainda.</p>
          <Button className="mt-4 bg-amber-500 hover:bg-amber-400 text-slate-900" onClick={() => setModal({ milestone: null })}>
            <Plus className="w-4 h-4 mr-2" /> Criar primeiro marco
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {milestones?.map((m) => {
            const st = STATUS_CONFIG[m.status] || STATUS_CONFIG.planejado;
            const StatusIcon = st.icon;
            return (
              <div key={m.id} className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${st.tone}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-100">{m.title}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${st.tone}`}>{st.label}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700/40 text-slate-400 border border-slate-700/40">
                          {CATEGORY_LABELS[m.category] || m.category}
                        </span>
                      </div>
                      {m.description && <p className="text-sm text-slate-400 mt-1 line-clamp-2">{m.description}</p>}
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        {m.milestone_date && (
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(m.milestone_date).toLocaleDateString("pt-BR")}</span>
                        )}
                        {m.published_at && (
                          <span className="flex items-center gap-1 text-sky-400">
                            <Linkedin className="w-3 h-3" /> Publicado em {new Date(m.published_at).toLocaleString("pt-BR")}
                          </span>
                        )}
                        {m.auto_publish && m.status !== "publicado" && (
                          <span className="flex items-center gap-1 text-amber-400"><Sparkles className="w-3 h-3" /> Auto-publicar</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {m.status !== "publicado" && (
                      <button
                        title="Publicar no LinkedIn"
                        onClick={() => publishMilestone(m)}
                        disabled={publishing === m.id || !connected}
                        className="p-2 rounded-lg text-slate-500 hover:text-sky-400 hover:bg-sky-500/10 transition-colors disabled:opacity-30"
                      >
                        {publishing === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    )}
                    <button title="Editar" onClick={() => setModal({ milestone: m })} className="p-2 rounded-lg text-slate-500 hover:text-amber-300 hover:bg-amber-500/10 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button title="Excluir" onClick={() => deleteMilestone(m)} className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <MilestoneForm
          milestone={modal.milestone}
          onSave={saveMilestone}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

function StatMini({ icon: Icon, label, value, tone }) {
  return (
    <div className="bg-[#1A1D25] rounded-xl border border-slate-700/60 px-4 py-3 flex items-center gap-3">
      <Icon className={`w-5 h-5 ${tone}`} />
      <div>
        <p className={`text-xl font-bold tracking-tight ${tone}`}>{value}</p>
        <p className="text-[10px] text-slate-500">{label}</p>
      </div>
    </div>
  );
}