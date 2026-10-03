import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import {
  ACCESS_LEVELS,
  ACCESS_LEVEL_LABELS,
  ACCOUNT_STATUSES,
  ACCOUNT_STATUS_LABELS,
  canManageUsers,
  getAccessLevel,
  PERMISSION_MODULES,
  PERMISSION_ACTIONS,
  DEFAULT_PERMISSIONS_BY_LEVEL,
} from "@/lib/accessControl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import VerifyCodeModal from "@/components/VerifyCodeModal";
import {
  Users, Search, Plus, Loader2, ShieldCheck, Lock, Unlock, PauseCircle, PlayCircle,
  Ban, Eye, EyeOff, Pencil, History, KeyRound, X, ChevronDown, ChevronUp,
  MailCheck, Send, Trash2,
} from "lucide-react";

const STATUS_STYLES = {
  ativa: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  convite_pendente: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  bloqueada: "text-rose-400 bg-rose-500/10 border-rose-500/30",
  suspensa: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  desativada: "text-slate-500 bg-slate-700/30 border-slate-600/40",
};

const LEVEL_STYLES = {
  admin_geral: "text-amber-300 bg-amber-500/10 border-amber-500/30",
  administrador: "text-violet-300 bg-violet-500/10 border-violet-500/30",
  gestor_supervisor: "text-sky-300 bg-sky-500/10 border-sky-500/30",
  operacional: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
  consulta: "text-slate-300 bg-slate-600/20 border-slate-600/40",
};

export default function Usuarios() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState(null);
  const [actorLevel, setActorLevel] = useState(null);
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal] = useState(null); // { mode: 'create'|'edit'|'view', user }
  const [auditUser, setAuditUser] = useState(null);
  const [toast, setToast] = useState("");
  const [showAudit, setShowAudit] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [pendingSensitive, setPendingSensitive] = useState(null); // { label, run }

  const load = async () => {
    const res = await base44.functions.invoke("manageUsers", { action: "list" });
    setUsers(res.data.users);
    setActorLevel(res.data.actorLevel);
  };
  useEffect(() => { load().catch(() => setUsers([])); }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    if (!users) return [];
    let list = users;
    if (levelFilter !== "all") list = list.filter((u) => u.access_level === levelFilter);
    if (statusFilter !== "all") list = list.filter((u) => u.account_status === statusFilter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((u) =>
        [u.full_name, u.login, u.email, u.registration, u.job_title, u.unit]
          .filter(Boolean).join(" ").toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, query, levelFilter, statusFilter]);

  const call = async (payload) => {
    try {
      await base44.functions.invoke("manageUsers", payload);
      await load();
      return true;
    } catch (e) {
      setToast(e?.response?.data?.error || e.message || "Erro ao executar ação.");
      return false;
    }
  };

  const cancelInvite = async (u) => {
    const ok = await call({ action: "cancel_invite", invite_id: u.id });
    if (ok) setToast(`Convite de ${u.email} cancelado.`);
  };

  const resendInvite = async (u) => {
    const ok = await call({ action: "resend_invite", invite_id: u.id });
    if (ok) setToast(`Convite reenviado para ${u.email}.`);
  };

  const setStatus = async (u, status) => {
    // Operações sensíveis exigem código de acesso.
    const sensitive = status === "desativada" || (u.access_level === "admin_geral" && status !== "ativa");
    const run = async () => {
      const ok = await call({ action: "update", user_id: u.id, account_status: status });
      if (ok) setToast(`Situação de ${u.full_name} alterada para "${ACCOUNT_STATUS_LABELS[status]}".`);
    };
    if (sensitive) {
      setPendingSensitive({ label: status === "desativada" ? "Desativar usuário" : "Alterar situação de administrador", run });
    } else {
      await run();
    }
  };

  const openAudit = async (u) => {
    setAuditUser(u);
    if (getAccessLevel(me) === "admin_geral") {
      const logs = await base44.entities.AccessAuditLog.filter({ target_user_id: u.id }, "-created_date", 100).catch(() => []);
      setAuditLogs(logs);
    } else {
      setAuditLogs([]);
    }
  };

  if (!users) {
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
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">Usuários e Acessos</h1>
          <p className="text-slate-400 mt-2 text-sm">Cadastro, permissões e situação das contas do aplicativo.</p>
        </div>
        <div className="flex items-center gap-2">
          {actorLevel === "admin_geral" && (
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-amber-300" onClick={() => setShowAudit(true)}>
              <History className="w-4 h-4 mr-2" /> Auditoria
            </Button>
          )}
          <Button className="bg-amber-500 hover:bg-amber-400 text-slate-900" onClick={() => setModal({ mode: "create" })}>
            <Plus className="w-4 h-4 mr-2" /> Novo usuário
          </Button>
        </div>
      </header>

      {toast && (
        <div className="px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm flex items-center justify-between">
          {toast}
          <button onClick={() => setToast("")} className="text-amber-400 hover:text-amber-200"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar por nome, login, e-mail, matrícula…"
            className="pl-10 bg-[#1A1D25] border-slate-700/60"
          />
        </div>
        <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-[#1A1D25] border border-slate-700/60 text-slate-300 text-sm">
          <option value="all">Nível: Todos</option>
          {ACCESS_LEVELS.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-[#1A1D25] border border-slate-700/60 text-slate-300 text-sm">
          <option value="all">Situação: Todas</option>
          {ACCOUNT_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 px-6 py-16 text-center">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Nenhum usuário encontrado.</p>
        </div>
      ) : (
        <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-700/60">
                  <th className="px-4 py-3 font-medium">Usuário</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Matrícula / Cargo</th>
                  <th className="px-4 py-3 font-medium">Nível de acesso</th>
                  <th className="px-4 py-3 font-medium">Situação</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Último acesso</th>
                  <th className="px-4 py-3 font-medium hidden xl:table-cell">Criado em</th>
                  <th className="px-4 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {filtered.map((u) => (
                  <UserRow key={u.id} u={u} me={me} actorLevel={actorLevel} onEdit={() => setModal({ mode: "edit", user: u })} onView={() => setModal({ mode: "view", user: u })} onStatus={setStatus} onAudit={openAudit} onCancelInvite={() => cancelInvite(u)} onResendInvite={() => resendInvite(u)} onReset={() => {
                    setPendingSensitive({
                      label: "Redefinir senha de usuário",
                      run: async () => {
                        const ok = await call({ action: "reset_password", user_id: u.id });
                        if (ok) setToast(`Redefinição de senha encaminhada para ${u.email}.`);
                      },
                    });
                  }} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <UserFormModal
          mode={modal.mode}
          user={modal.user}
          actorLevel={actorLevel}
          me={me}
          onClose={() => setModal(null)}
          onSaved={async (msg) => { setModal(null); await load(); setToast(msg); }}
          onError={(msg) => setToast(msg)}
        />
      )}

      {auditUser && (
        <AuditModal user={auditUser} logs={auditLogs} onClose={() => setAuditUser(null)} />
      )}
      {showAudit && (
        <AuditModal global onClose={() => setShowAudit(false)} />
      )}
      {pendingSensitive && (
        <VerifyCodeModal
          operation={pendingSensitive.label}
          onVerified={async () => {
            const run = pendingSensitive.run;
            setPendingSensitive(null);
            await run();
          }}
          onClose={() => setPendingSensitive(null)}
        />
      )}
    </div>
  );
}

function UserRow({ u, me, actorLevel, onEdit, onView, onStatus, onAudit, onCancelInvite, onResendInvite, onReset }) {
  const isSelf = u.id === me?.id;
  const targetIsGeral = u.access_level === "admin_geral";
  const actorIsGeral = actorLevel === "admin_geral";
  const canEdit = !isSelf && (actorIsGeral || (!targetIsGeral && actorLevel === "administrador"));
  const isInvite = u.invite === true;
  const canEditInvite = actorIsGeral || (u.access_level !== "admin_geral" && actorLevel === "administrador");
  const st = STATUS_STYLES[u.account_status] || STATUS_STYLES.ativa;

  return (
    <tr className="hover:bg-white/[0.02]">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs shrink-0 ${isInvite ? "bg-amber-500/10 border border-amber-500/30 text-amber-400" : "bg-gradient-to-br from-amber-500/30 to-amber-600/10 border border-amber-500/30 text-amber-300 font-semibold"}`}>
            {isInvite ? <MailCheck className="w-4 h-4" /> : (u.full_name || u.email || "?").slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-slate-100 truncate">{u.full_name || "—"}</p>
            <p className="text-xs text-slate-500 truncate">{u.login ? `${u.login} · ` : ""}{u.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <p className="text-slate-300">{u.registration || "—"}</p>
        <p className="text-xs text-slate-500">{u.job_title || "—"}</p>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2.5 py-1 rounded-full border ${LEVEL_STYLES[u.access_level] || LEVEL_STYLES.consulta}`}>
          {ACCESS_LEVEL_LABELS[u.access_level] || u.access_level}
        </span>
      </td>
      <td className="px-4 py-3">
        {isInvite ? (
          <span className="text-xs px-2.5 py-1 rounded-full border text-amber-300 bg-amber-500/10 border-amber-500/30">Convite pendente</span>
        ) : (
          <span className={`text-xs px-2.5 py-1 rounded-full border ${st}`}>{ACCOUNT_STATUS_LABELS[u.account_status]}</span>
        )}
      </td>
      <td className="px-4 py-3 hidden md:table-cell text-slate-400 text-xs">
        {u.last_login_at ? new Date(u.last_login_at).toLocaleString("pt-BR") : "—"}
      </td>
      <td className="px-4 py-3 hidden xl:table-cell text-slate-500 text-xs">
        {u.created_date ? new Date(u.created_date).toLocaleDateString("pt-BR") : "—"}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <IconBtn title="Visualizar" onClick={onView}><Eye className="w-4 h-4" /></IconBtn>
          {isInvite ? (
            <>
              {canEditInvite && <IconBtn title="Reenviar convite" onClick={() => onResendInvite()}><Send className="w-4 h-4" /></IconBtn>}
              {canEditInvite && <IconBtn title="Cancelar convite" danger onClick={() => onCancelInvite()}><Trash2 className="w-4 h-4" /></IconBtn>}
            </>
          ) : (
            <>
              {canEdit && <IconBtn title="Editar" onClick={onEdit}><Pencil className="w-4 h-4" /></IconBtn>}
              {canEdit && u.account_status === "ativa" && <IconBtn title="Bloquear" onClick={() => onStatus(u, "bloqueada")}><Lock className="w-4 h-4" /></IconBtn>}
              {canEdit && u.account_status === "bloqueada" && <IconBtn title="Desbloquear" onClick={() => onStatus(u, "ativa")}><Unlock className="w-4 h-4" /></IconBtn>}
              {canEdit && u.account_status === "ativa" && <IconBtn title="Suspender" onClick={() => onStatus(u, "suspensa")}><PauseCircle className="w-4 h-4" /></IconBtn>}
              {canEdit && u.account_status === "suspensa" && <IconBtn title="Reativar" onClick={() => onStatus(u, "ativa")}><PlayCircle className="w-4 h-4" /></IconBtn>}
              {canEdit && u.account_status !== "desativada" && <IconBtn title="Desativar" danger onClick={() => onStatus(u, "desativada")}><Ban className="w-4 h-4" /></IconBtn>}
              {canEdit && u.account_status === "desativada" && <IconBtn title="Reativar" onClick={() => onStatus(u, "ativa")}><PlayCircle className="w-4 h-4" /></IconBtn>}
              {canEdit && <IconBtn title="Redefinir senha" onClick={() => onReset()}><KeyRound className="w-4 h-4" /></IconBtn>}
            </>
          )}
          {actorIsGeral && !isInvite && <IconBtn title="Histórico" onClick={() => onAudit(u)}><History className="w-4 h-4" /></IconBtn>}
        </div>
      </td>
    </tr>
  );
}

function IconBtn({ title, onClick, danger, children }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-colors ${danger ? "text-slate-500 hover:text-rose-400 hover:bg-rose-500/10" : "text-slate-500 hover:text-amber-300 hover:bg-amber-500/10"}`}
    >
      {children}
    </button>
  );
}

// ---------------------- FORM MODAL ----------------------
function UserFormModal({ mode, user, actorLevel, me, onClose, onSaved, onError }) {
  const isView = mode === "view";
  const isCreate = mode === "create";
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPerms, setShowPerms] = useState(false);
  const [perms, setPerms] = useState({});
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    login: user?.login || "",
    email: user?.email || "",
    phone: user?.phone || "",
    registration: user?.registration || "",
    job_title: user?.job_title || "",
    unit: user?.unit || "",
    admin_notes: user?.admin_notes || "",
    access_level: user?.access_level || "",
    account_status: user?.account_status || "ativa",
    must_change_password: user?.must_change_password || false,
    send_invite: true,
  });

  useEffect(() => {
    const base = user?.custom_permissions ? JSON.parse(user.custom_permissions) : null;
    if (base) setPerms(base);
    else if (form.access_level && DEFAULT_PERMISSIONS_BY_LEVEL[form.access_level] !== "*") {
      setPerms(JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS_BY_LEVEL[form.access_level] || {})));
    }
  }, [user]);

  useEffect(() => {
    if (form.access_level && DEFAULT_PERMISSIONS_BY_LEVEL[form.access_level] !== "*" && !user?.custom_permissions) {
      setPerms(JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS_BY_LEVEL[form.access_level] || {})));
    }
  }, [form.access_level]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const togglePerm = (mod, act) => {
    setPerms((p) => {
      const cur = new Set(p[mod] || []);
      if (cur.has(act)) cur.delete(act); else cur.add(act);
      return { ...p, [mod]: [...cur] };
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.full_name.trim() || !form.login.trim() || (isCreate && !form.email.trim()) || !form.access_level) {
      setError("Preencha nome, login, e-mail e selecione um nível de acesso.");
      return;
    }
    setSaving(true);
    try {
      if (isCreate) {
        const res = await base44.functions.invoke("manageUsers", {
          action: "create",
          full_name: form.full_name,
          login: form.login,
          email: form.email,
          phone: form.phone,
          registration: form.registration,
          job_title: form.job_title,
          unit: form.unit,
          admin_notes: form.admin_notes,
          access_level: form.access_level,
          must_change_password: form.must_change_password,
          custom_permissions: form.access_level === "admin_geral" ? null : perms,
        });
        onSaved(`Usuário criado com sucesso. Convite enviado para ${form.email}.`);
      } else {
        await base44.functions.invoke("manageUsers", {
          action: "update",
          user_id: user.id,
          account_status: form.account_status,
          access_level: form.access_level !== user.access_level ? form.access_level : undefined,
          custom_permissions: actorLevel === "admin_geral" && form.access_level !== "admin_geral" ? perms : undefined,
          profile: {
            full_name: form.full_name,
            login: form.login,
            phone: form.phone,
            registration: form.registration,
            job_title: form.job_title,
            unit: form.unit,
            admin_notes: form.admin_notes,
          },
        });
        onSaved("Cadastro atualizado com sucesso.");
      }
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const levelOptions = ACCESS_LEVELS.filter((l) => {
    if (actorLevel === "admin_geral") return true;
    return l.id !== "admin_geral";
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60">
          <h2 className="font-semibold text-slate-100">{isCreate ? "Novo usuário" : isView ? "Detalhes do usuário" : "Editar usuário"}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-5">
          {error && <div className="px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">{error}</div>}

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nome completo *"><Input disabled={isView} value={form.full_name} onChange={(e) => set("full_name", e.target.value)} className="bg-[#12141A] border-slate-700/60" /></Field>
            <Field label="Login *"><Input disabled={isView} value={form.login} onChange={(e) => set("login", e.target.value)} className="bg-[#12141A] border-slate-700/60" /></Field>
            <Field label="E-mail *"><Input disabled={isView || !isCreate} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="bg-[#12141A] border-slate-700/60" /></Field>
            <Field label="Telefone"><Input disabled={isView} value={form.phone} onChange={(e) => set("phone", e.target.value)} className="bg-[#12141A] border-slate-700/60" /></Field>
            <Field label="Matrícula"><Input disabled={isView} value={form.registration} onChange={(e) => set("registration", e.target.value)} className="bg-[#12141A] border-slate-700/60" /></Field>
            <Field label="Função / cargo"><Input disabled={isView} value={form.job_title} onChange={(e) => set("job_title", e.target.value)} className="bg-[#12141A] border-slate-700/60" /></Field>
            <Field label="Unidade / setor"><Input disabled={isView} value={form.unit} onChange={(e) => set("unit", e.target.value)} className="bg-[#12141A] border-slate-700/60" /></Field>
            <Field label="Nível de acesso *">
              <select disabled={isView || user?.id === me?.id} value={form.access_level} onChange={(e) => set("access_level", e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-slate-200 text-sm">
                <option value="">Selecionar…</option>
                {levelOptions.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </Field>
            {!isCreate && (
              <Field label="Situação da conta">
                <select disabled={isView || user?.id === me?.id} value={form.account_status} onChange={(e) => set("account_status", e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-slate-200 text-sm">
                  {ACCOUNT_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </Field>
            )}
            <Field label="Observações administrativas" className="sm:col-span-2">
              <Textarea disabled={isView} value={form.admin_notes} onChange={(e) => set("admin_notes", e.target.value)} className="bg-[#12141A] border-slate-700/60 min-h-[72px]" />
            </Field>
          </div>

          {isCreate && (
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.send_invite} onChange={(e) => set("send_invite", e.target.checked)} className="accent-amber-500" />
                Enviar convite de acesso por e-mail (o usuário define a própria senha)
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.must_change_password} onChange={(e) => set("must_change_password", e.target.checked)} className="accent-amber-500" />
                Exigir alteração da senha no primeiro acesso
              </label>
            </div>
          )}

          {actorLevel === "admin_geral" && form.access_level && form.access_level !== "admin_geral" && (
            <div className="border border-slate-700/60 rounded-xl overflow-hidden">
              <button type="button" onClick={() => setShowPerms((o) => !o)} className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-300 hover:bg-white/5">
                <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-amber-400" /> Permissões personalizadas</span>
                {showPerms ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showPerms && (
                <div className="px-4 pb-4 max-h-64 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-700/60">
                        <th className="text-left py-2 pr-2 font-medium">Módulo</th>
                        {PERMISSION_ACTIONS.slice(0, 9).map((a) => <th key={a.id} className="py-2 px-1 font-medium text-center">{a.name}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {PERMISSION_MODULES.map((m) => (
                        <tr key={m.id} className="border-b border-slate-700/30">
                          <td className="py-2 pr-2 text-slate-300">{m.name}</td>
                          {PERMISSION_ACTIONS.slice(0, 9).map((a) => (
                            <td key={a.id} className="py-2 px-1 text-center">
                              <input
                                type="checkbox"
                                disabled={isView}
                                checked={(perms[m.id] || []).includes(a.id)}
                                onChange={() => togglePerm(m.id, a.id)}
                                className="accent-amber-500"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {!isView && (
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="border-slate-700 text-slate-300">Cancelar</Button>
              <Button type="submit" disabled={saving} className="bg-amber-500 hover:bg-amber-400 text-slate-900">
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isCreate ? "Criar usuário" : "Salvar alterações"}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-slate-400 text-xs">{label}</Label>
      {children}
    </div>
  );
}

// ---------------------- AUDIT MODAL ----------------------
function AuditModal({ user, global, logs: userLogs, onClose }) {
  const [logs, setLogs] = useState(null);

  useEffect(() => {
    if (global) {
      base44.entities.AccessAuditLog.list("-created_date", 200).then(setLogs).catch(() => setLogs([]));
    }
  }, [global]);

  const data = global ? logs : (userLogs || []);
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60">
          <h2 className="font-semibold text-slate-100">{global ? "Auditoria de acessos" : `Histórico — ${user?.full_name || user?.email}`}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto">
          {!data ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>
          ) : data.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Nenhum registro encontrado.</p>
          ) : (
            <ul className="space-y-3">
              {data.map((l) => (
                <li key={l.id} className="border border-slate-700/50 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-200">{l.action}</p>
                    <p className="text-[11px] text-slate-500 whitespace-nowrap">{new Date(l.created_at || l.created_date).toLocaleString("pt-BR")}</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {l.actor_name && <>Por: {l.actor_name}</>}
                    {l.target_name && <> · Afetado: {l.target_name}</>}
                  </p>
                  {l.details && <p className="text-xs text-slate-400 mt-1">{l.details}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}