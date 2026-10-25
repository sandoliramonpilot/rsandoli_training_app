import React, { useState, useEffect, useMemo } from "react";
  const isGeral = me?.access_level === "admin_geral";
import { base44 } from "@/api/base44Client";
import {
  ACCESS_LEVELS, ACCESS_LEVEL_LABELS, ACCOUNT_STATUSES, ACCOUNT_STATUS_LABELS,
  PERMISSION_MODULES, PERMISSION_ACTIONS, DEFAULT_PERMISSIONS_BY_LEVEL,
} from "@/lib/accessControl";
import {
  X, Loader2, AlertTriangle, Check, ChevronLeft, ChevronRight, UserPlus,
  ShieldCheck, Link2, FileText, Upload, Plane, Users,
} from "lucide-react";

const inputCls = "w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50";

const STEPS = [
  { id: 1, label: "Dados Básicos", icon: UserPlus },
  { id: 2, label: "Acesso", icon: ShieldCheck },
  { id: 3, label: "Vínculo com Piloto", icon: Link2 },
  { id: 4, label: "Revisão", icon: FileText },
];

export default function NewUserForm({ actorLevel, onClose, onSaved, onError }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [pilotMatches, setPilotMatches] = useState(null);
  const [searchingPilots, setSearchingPilots] = useState(false);
  const [linkDecision, setLinkDecision] = useState(null); // 'link_existing' | 'create_new' | 'review'

  const [f, setF] = useState({
    full_name: "", display_name: "", email: "", phone: "", registration: "",
    canac: "", cpf: "", job_title: "", unit: "", photo_uri: "", admin_notes: "",
    access_level: "", account_status: "convite_pendente", activation_method: "convite",
    must_change_password: true, require_code: false, send_invite: true,
  });
  const [perms, setPerms] = useState({});

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (f.access_level && DEFAULT_PERMISSIONS_BY_LEVEL[f.access_level] !== "*" && !f.access_level) {
      setPerms(JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS_BY_LEVEL[f.access_level] || {})));
    }
  }, [f.access_level]);

  const levelOptions = ACCESS_LEVELS.filter((l) => {
    if (actorLevel === "admin_geral") return true;
    return l.id !== "admin_geral";
  });

  const requireCodeAuto = ["admin_geral", "administrador", "gestor_supervisor"].includes(f.access_level);

  // Step validation
  const step1Valid = f.full_name.trim().length >= 3 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()) && f.phone.trim().length >= 8;
  const step2Valid = !!f.access_level && !!f.activation_method;

  const searchPilots = async () => {
    setSearchingPilots(true);
    try {
      const res = await base44.functions.invoke("manageUsers", {
        action: "find_pilot_matches",
        email: f.email, cpf: f.cpf, canac: f.canac, registration: f.registration,
      });
      const matches = res.data?.matches || [];
      setPilotMatches(matches);
      if (matches.length === 0) setLinkDecision("create_new");
      else if (matches.length === 1 && !matches[0].user_id) setLinkDecision("link_existing");
      else setLinkDecision("review");
    } catch {
      setPilotMatches([]);
      setLinkDecision("create_new");
    } finally {
      setSearchingPilots(false);
    }
  };

  const next = () => {
    setError("");
    if (step === 1 && !step1Valid) { setError("Preencha nome (mín. 3 caracteres), e-mail válido e telefone."); return; }
    if (step === 2 && !step2Valid) { setError("Selecione o nível de acesso e o método de ativação."); return; }
    if (step === 3 && !linkDecision) { setError("Defina o vínculo com o piloto antes de continuar."); return; }
    if (step === 3) { setStep(4); return; }
    setStep((s) => Math.min(4, s + 1));
    if (step === 2) searchPilots();
  };
  const back = () => { setError(""); setStep((s) => Math.max(1, s - 1)); };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      set("photo_uri", file_uri);
    } catch { setError("Erro ao enviar foto."); }
    setUploadingPhoto(false);
    e.target.value = "";
  };

  const submit = async () => {
    setError("");
    if (!step1Valid || !step2Valid) { setError("Revise os campos obrigatórios."); return; }
    setSaving(true);
    try {
      const res = await base44.functions.invoke("manageUsers", {
        action: "create",
        full_name: f.full_name.trim(),
        login: f.email.trim().toLowerCase(),
        email: f.email.trim().toLowerCase(),
        phone: f.phone.trim(),
        registration: f.registration.trim() || undefined,
        canac: f.canac.trim() || undefined,
        cpf: f.cpf.trim() || undefined,
        job_title: f.job_title.trim() || undefined,
        unit: f.unit.trim() || undefined,
        admin_notes: f.admin_notes.trim() || undefined,
        access_level: f.access_level,
        must_change_password: f.activation_method === "temp_password" ? true : f.must_change_password,
        custom_permissions: (actorLevel === "admin_geral" && form.access_level !== "admin_geral" ? { custom_permissions: perms } : {}),
        photo_uri: f.photo_uri || undefined,
      });
      onSaved(res.data?.message || "Usuário criado com sucesso.");
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Erro ao criar usuário.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-[#1A1D25] w-full sm:max-w-3xl sm:rounded-2xl rounded-t-2xl shadow-2xl border border-slate-700/60 max-h-[94vh] flex flex-col">
        {/* Header + stepper */}
        <div className="sticky top-0 bg-[#1A1D25]/95 backdrop-blur px-6 py-4 border-b border-slate-700/60 z-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg text-slate-100">Novo Usuário</h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700/40"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {STEPS.map((s) => {
              const Icon = s.icon;
              const active = step === s.id;
              const done = step > s.id;
              return (
                <React.Fragment key={s.id}>
                  <div className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${active ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" : done ? "text-emerald-400" : "text-slate-500"}`}>
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{s.id}</span>
                  </div>
                  {s.id < 4 && <div className={`flex-1 h-px ${done ? "bg-emerald-500/40" : "bg-slate-700/60"}`} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
            </div>
          )}

          {step === 1 && <Step1 f={f} set={set} uploadingPhoto={uploadingPhoto} onPhoto={handlePhoto} />}
          {step === 2 && <Step2 f={f} set={set} levelOptions={levelOptions} requireCodeAuto={requireCodeAuto} perms={perms} setPerms={setPerms} actorLevel={actorLevel} />}
          {step === 3 && <Step3 searching={searchingPilots} matches={pilotMatches} decision={linkDecision} setDecision={setLinkDecision} />}
          {step === 4 && <Step4 f={f} perms={perms} linkDecision={linkDecision} pilotMatches={pilotMatches} />}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#1A1D25]/95 backdrop-blur px-6 py-4 border-t border-slate-700/60 flex justify-between gap-2">
          <button onClick={back} disabled={step === 1} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-700/40 disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" /> Voltar
          </button>
          {step < 4 ? (
            <button onClick={next} className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-400 text-slate-900">
              Avançar <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={submit} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-400 text-slate-900 disabled:opacity-50">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Criando…</> : <><Check className="w-4 h-4" /> CRIAR USUÁRIO</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- STEP 1: DADOS BÁSICOS ----------
function Step1({ f, set, uploadingPhoto, onPhoto }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">Informe os dados básicos do novo usuário. O e-mail será o identificador de acesso.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Nome completo" required className="sm:col-span-2"><input className={inputCls} value={f.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Mínimo 3 caracteres" /></Field>
        <Field label="Nome de exibição"><input className={inputCls} value={f.display_name} onChange={(e) => set("display_name", e.target.value)} placeholder="Opcional — apenas interface" /></Field>
        <Field label="E-mail de acesso" required><input type="email" className={inputCls} value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="usado como login" /></Field>
        <Field label="Telefone celular" required><input className={inputCls} value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+55 (DD) 00000-0000" /></Field>
        <Field label="Matrícula"><input className={inputCls} value={f.registration} onChange={(e) => set("registration", e.target.value)} /></Field>
        <Field label="CANAC"><input className={inputCls} value={f.canac} onChange={(e) => set("canac", e.target.value)} placeholder="Opcional no cadastro inicial" /></Field>
        <Field label="CPF"><input className={inputCls} value={f.cpf} onChange={(e) => set("cpf", e.target.value)} placeholder="Mascarado e protegido" /></Field>
        <Field label="Função / cargo"><input className={inputCls} value={f.job_title} onChange={(e) => set("job_title", e.target.value)} /></Field>
        <Field label="Unidade / setor"><input className={inputCls} value={f.unit} onChange={(e) => set("unit", e.target.value)} /></Field>
        <Field label="Foto de perfil">
          <label className="inline-flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border border-dashed border-slate-600 text-sm text-slate-300 hover:border-amber-400/60 hover:text-amber-300">
            <Upload className="w-4 h-4" /> {uploadingPhoto ? "Enviando…" : f.photo_uri ? "Foto anexada" : "Selecionar imagem"}
            <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
          </label>
        </Field>
        <Field label="Observações administrativas" className="sm:col-span-2">
          <textarea className={`${inputCls} min-h-[56px]`} value={f.admin_notes} onChange={(e) => set("admin_notes", e.target.value)} placeholder="Visível somente a perfis autorizados" />
        </Field>
      </div>
    </div>
  );
}

// ---------- STEP 2: ACESSO ----------
function Step2({ f, set, levelOptions, requireCodeAuto, perms, setPerms, actorLevel }) {
  const [showPerms, setShowPerms] = useState(false);
  const togglePerm = (mod, act) => {
    setPerms((p) => {
      const cur = new Set(p[mod] || []);
      if (cur.has(act)) cur.delete(act); else cur.add(act);
      return { ...p, [mod]: [...cur] };
    });
  };
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Nível de acesso" required>
          <select className={inputCls} value={f.access_level} onChange={(e) => set("access_level", e.target.value)}>
            <option value="">Selecionar…</option>
            {levelOptions.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </Field>
        <Field label="Situação inicial">
          <select className={inputCls} value={f.account_status} onChange={(e) => set("account_status", e.target.value)}>
            <option value="convite_pendente">Convite pendente</option>
            <option value="ativa">Ativa (apenas com senha válida)</option>
          </select>
        </Field>
        <Field label="Método de ativação" required>
          <select className={inputCls} value={f.activation_method} onChange={(e) => set("activation_method", e.target.value)}>
            <option value="convite">Enviar convite (usuário define a senha)</option>
            <option value="temp_password">Gerar senha temporária</option>
          </select>
        </Field>
        <Field label="Exigir troca de senha no primeiro acesso">
          <label className="flex items-center gap-2 mt-2 text-sm text-slate-300">
            <input type="checkbox" checked={f.must_change_password} disabled={f.activation_method === "temp_password"} onChange={(e) => set("must_change_password", e.target.checked)} className="accent-amber-500" />
            {f.activation_method === "temp_password" ? "Obrigatório para senha temporária" : "Ativar"}
          </label>
        </Field>
      </div>

      <div className="px-4 py-3 rounded-lg bg-slate-700/20 border border-slate-700/40 text-sm text-slate-300 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
        {requireCodeAuto ? "Autenticação por código será obrigatória para este perfil administrativo." : "Autenticação por código é configurável para este perfil."}
      </div>

      {isGeral === "admin_geral" && f.access_level && f.access_level !== "admin_geral" && (
        <div className="border border-slate-700/60 rounded-xl overflow-hidden">
          <button type="button" onClick={() => setShowPerms((o) => !o)} className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-300 hover:bg-white/5">
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-amber-400" /> Permissões personalizadas por módulo</span>
            <ChevronRight className={`w-4 h-4 transition-transform ${showPerms ? "rotate-90" : ""}`} />
          </button>
          {showPerms && (
            <div className="px-4 pb-4 max-h-64 overflow-y-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-slate-500 border-b border-slate-700/60">
                  <th className="text-left py-2 pr-2 font-medium">Módulo</th>
                  {PERMISSION_ACTIONS.slice(0, 9).map((a) => <th key={a.id} className="py-2 px-1 font-medium text-center">{a.name}</th>)}
                </tr></thead>
                <tbody>
                  {PERMISSION_MODULES.map((m) => (
                    <tr key={m.id} className="border-b border-slate-700/30">
                      <td className="py-2 pr-2 text-slate-300">{m.name}</td>
                      {PERMISSION_ACTIONS.slice(0, 9).map((a) => (
                        <td key={a.id} className="py-2 px-1 text-center">
                          <input type="checkbox" checked={(perms[m.id] || []).includes(a.id)} onChange={() => togglePerm(m.id, a.id)} className="accent-amber-500" />
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
    </div>
  );
}

// ---------- STEP 3: VÍNCULO COM PILOTO ----------
function Step3({ searching, matches, decision, setDecision }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 text-sm">
        <Link2 className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Será criado um cadastro associado no módulo <strong>Pilotos</strong>. Se já existir um piloto compatível, você poderá vinculá-lo para evitar duplicidade.</span>
      </div>

      {searching ? (
        <div className="flex items-center gap-2 text-sm text-slate-400 py-4"><Loader2 className="w-4 h-4 animate-spin text-amber-400" /> Procurando pilotos compatíveis…</div>
      ) : matches === null ? (
        <p className="text-sm text-slate-500">A busca será realizada ao avançar.</p>
      ) : matches.length === 0 ? (
        <div className="space-y-3">
          <div className="px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
            <Check className="w-4 h-4" /> Nenhum piloto compatível encontrado. Um novo cadastro será criado e marcado como <strong>Incompleto</strong>.
          </div>
          <DecisionCard selected={decision === "create_new"} onClick={() => setDecision("create_new")} title="Criar novo cadastro de piloto" desc="Será criado um registro individual vinculado a este usuário." />
        </div>
      ) : matches.length === 1 ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-300">Um piloto compatível foi encontrado:</p>
          <PilotMatchCard m={matches[0]} />
          {matches[0].user_id ? (
            <div className="px-4 py-3 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-300 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Este piloto já está vinculado a outro usuário. Será criado um novo piloto para evitar conflito.
            </div>
          ) : (
            <DecisionCard selected={decision === "link_existing"} onClick={() => setDecision("link_existing")} title="Vincular ao piloto existente" desc="Evita duplicidade — o cadastro existente será associado a este usuário." />
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="px-4 py-3 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-300 text-sm flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Múltiplas correspondências encontradas ({matches.length}). O vínculo automático está bloqueado — será necessário revisão administrativa após a criação.</span>
          </div>
          {matches.map((m) => <PilotMatchCard key={m.id} m={m} />)}
          <DecisionCard selected={decision === "review"} onClick={() => setDecision("review")} title="Criar usuário e marcar piloto para revisão" desc="O usuário será criado; o vínculo do piloto será resolvido posteriormente." />
        </div>
      )}
    </div>
  );
}

// ---------- STEP 4: REVISÃO ----------
function Step4({ f, perms, linkDecision, pilotMatches }) {
  const rows = [
    ["Nome completo", f.full_name], ["Nome de exibição", f.display_name || "—"],
    ["E-mail de acesso", f.email], ["Telefone", f.phone],
    ["Matrícula", f.registration || "—"], ["CANAC", f.canac || "—"],
    ["CPF", f.cpf ? "***.***.***-**" : "—"], ["Função / cargo", f.job_title || "—"],
    ["Unidade", f.unit || "—"],
    ["Nível de acesso", ACCESS_LEVEL_LABELS[f.access_level] || "—"],
    ["Situação inicial", ACCOUNT_STATUS_LABELS[f.account_status] || "—"],
    ["Método de ativação", f.activation_method === "convite" ? "Convite por e-mail" : "Senha temporária"],
    ["Troca de senha obrigatória", f.must_change_password ? "Sim" : "Não"],
  ];
  const linkLabel = linkDecision === "link_existing" ? "Vincular a piloto existente" :
    linkDecision === "review" ? "Revisão necessária (múltiplas correspondências)" : "Criar novo piloto (incompleto)";

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">Revise os dados antes de criar o usuário. Após a confirmação, o convite será enviado e o cadastro de piloto será criado ou vinculado.</p>
      <div className="rounded-xl border border-slate-700/60 overflow-hidden">
        <div className="px-4 py-2.5 bg-[#12141A] border-b border-slate-700/60 text-xs font-semibold uppercase tracking-wider text-slate-400">Dados do Cadastro</div>
        <div className="px-4 py-3 grid sm:grid-cols-2 gap-x-6 gap-y-2">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-2 text-sm border-b border-slate-700/30 pb-1.5">
              <span className="text-slate-500 shrink-0">{k}</span>
              <span className="text-slate-200 text-right truncate">{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1.5 flex items-center gap-1.5"><Plane className="w-3.5 h-3.5" /> Vínculo com Piloto</p>
        <p className="text-sm text-slate-200">{linkLabel}</p>
        {pilotMatches?.length === 1 && !pilotMatches[0].user_id && (
          <p className="text-xs text-slate-500 mt-1">Piloto: {pilotMatches[0].full_name} ({pilotMatches[0].email})</p>
        )}
      </div>
    </div>
  );
}

// ---------- HELPERS ----------
function Field({ label, required, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-medium text-slate-400 mb-1">{label}{required && <span className="text-amber-400"> *</span>}</span>
      {children}
    </label>
  );
}

function PilotMatchCard({ m }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-700/60 bg-[#12141A] p-3">
      <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
        <Users className="w-4 h-4 text-amber-400" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-100 truncate">{m.full_name}</p>
        <p className="text-xs text-slate-500 truncate">{m.email || "Sem e-mail"} {m.registration && `· ${m.registration}`} {m.anac_code && `· CANAC ${m.anac_code}`}</p>
      </div>
      {m.user_id && <span className="text-[10px] text-orange-400 ml-auto shrink-0">Já vinculado</span>}
    </div>
  );
}

function DecisionCard({ selected, onClick, title, desc }) {
  return (
    <button onClick={onClick} className={`w-full text-left rounded-xl border p-3.5 transition-colors ${selected ? "border-amber-500/50 bg-amber-500/10" : "border-slate-700/60 hover:border-slate-600"}`}>
      <p className="text-sm font-medium text-slate-100 flex items-center gap-2">{selected && <Check className="w-4 h-4 text-amber-400" />} {title}</p>
      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
    </button>
  );
}