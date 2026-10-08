import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  OAT_FUNCTION_LABELS, OAT_REGISTRATION_STATUS_LABELS,
  OAT_HABILITATION_TYPES, OAT_HABILITATION_SITUATIONS,
  OAT_CERTIFICATE_TYPES, OAT_CERTIFICATE_SITUATIONS,
  OAT_CMA_CLASSES, OAT_AIRCRAFT_MODELS, OAT_ENDORSEMENT_FUNCTIONS,
  OAT_ENDORSEMENT_SITUATIONS, OAT_DOC_CATEGORIES, OAT_HOURS_SOURCES,
  safeParse, maskCPF,
} from "@/lib/oatUtils";
import {
  X, ChevronLeft, ChevronRight, Check, Loader2, Search, Link2, UserPlus,
  AlertTriangle, Lock, FileText, Upload, Plus, Trash2, ShieldCheck,
} from "lucide-react";

const STEPS = [
  { id: "vinculo", label: "Vínculo", icon: Link2 },
  { id: "identificacao", label: "Identificação", icon: UserPlus },
  { id: "endereco", label: "Endereço", icon: FileText },
  { id: "operacional", label: "Operacional", icon: ShieldCheck },
  { id: "situacao", label: "Situação", icon: AlertTriangle },
  { id: "licencas", label: "Licenças", icon: ShieldCheck },
  { id: "certificados", label: "Certificados", icon: ShieldCheck },
  { id: "cma", label: "CMA", icon: ShieldCheck },
  { id: "aeronaves", label: "Aeronaves", icon: ShieldCheck },
  { id: "documentos", label: "Documentos", icon: FileText },
  { id: "revisao", label: "Revisão", icon: Check },
  { id: "confirmacao", label: "Confirmação", icon: Lock },
];

const inputCls = "w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50";

export default function NewOatForm({ me, onClose, onDone }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    vinculoMode: "no_account",
    linkedUser: null,
    full_name: "", war_name: "", birth_date: "", nationality: "Brasileira",
    marital_status: "", cpf: "", rg: "", rg_issuer: "", rg_issue_date: "",
    blood_type: "", phone: "", phone_alt: "", email: "", email_login: "",
    emergency_contact_name: "", emergency_contact_phone: "", emergency_contact_relation: "",
    cep: "", logradouro: "", address_number: "", address_complement: "",
    bairro: "", city: "", state: "", country: "Brasil",
    role: "oat", role_secondary: [], base: "", unit: "", organization: "",
    admission_date: "", anac_code: "", license_anac: "", category: "",
    hours: {}, hours_ref_date: "", hours_source: "declared",
    registration_status: "active", registration_status_start: "",
    registration_status_end: "", registration_status_reason: "",
    operational_restriction: "",
    licenses: [], certificates: [], cma: null,
    aircraft_endorsements: [], documents: [],
    confirmation_comment: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [cpfDup, setCpfDup] = useState(false);
  const [canacDup, setCanacDup] = useState(false);
  const [existingOats, setExistingOats] = useState([]);

  useEffect(() => {
    base44.entities.Oat.list().then(setExistingOats).catch(() => {});
  }, []);

  useEffect(() => {
    if (data.cpf) {
      const dup = existingOats.some((o) => o.cpf && o.cpf.replace(/\D/g, "") === data.cpf.replace(/\D/g, ""));
      setCpfDup(dup);
    }
    if (data.anac_code) {
      const dup = existingOats.some((o) => o.anac_code === data.anac_code && data.anac_code);
      setCanacDup(dup);
    }
  }, [data.cpf, data.anac_code, existingOats]);

  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const canAdvance = useMemo(() => {
    if (step === 1 && !data.full_name.trim()) return false;
    return true;
  }, [step, data]);

  const next = () => { setError(""); if (step < STEPS.length - 1) setStep(step + 1); };
  const back = () => { setError(""); if (step > 0) setStep(step - 1); };

  const submit = async () => {
    setError("");
    if (cpfDup) { setError("CPF duplicado — não é possível criar o cadastro."); return; }
    if (canacDup) { setError("CANAC duplicado — não é possível criar o cadastro."); return; }
    if (!data.full_name.trim()) { setError("Nome completo é obrigatório."); return; }
    setSaving(true);
    try {
      const payload = {
        full_name: data.full_name, war_name: data.war_name, birth_date: data.birth_date || undefined,
        nationality: data.nationality, marital_status: data.marital_status,
        cpf: data.cpf, rg: data.rg, rg_issuer: data.rg_issuer, rg_issue_date: data.rg_issue_date || undefined,
        blood_type: data.blood_type, phone: data.phone, phone_alt: data.phone_alt,
        email: data.email, email_login: data.email_login || data.linkedUser?.email || undefined,
        emergency_contact_name: data.emergency_contact_name,
        emergency_contact_phone: data.emergency_contact_phone,
        emergency_contact_relation: data.emergency_contact_relation,
        cep: data.cep, logradouro: data.logradouro, address_number: data.address_number,
        address_complement: data.address_complement, bairro: data.bairro, city: data.city,
        state: data.state, country: data.country,
        user_id: data.linkedUser?.id || undefined,
        role: data.role, base: data.base, unit: data.unit, organization: data.organization,
        admission_date: data.admission_date || undefined,
        anac_code: data.anac_code, license_anac: data.license_anac, category: data.category,
        registration_status: data.registration_status,
        registration_status_start: data.registration_status_start || undefined,
        registration_status_end: data.registration_status_end || undefined,
        registration_status_reason: data.registration_status_reason,
        operational_restriction: data.operational_restriction,
        hours: Object.keys(data.hours).length ? JSON.stringify(data.hours) : undefined,
        hours_ref_date: data.hours_ref_date || undefined,
        hours_source: data.hours_source,
        licenses: data.licenses.length ? JSON.stringify(data.licenses) : undefined,
        certificates: data.certificates.length ? JSON.stringify(data.certificates) : undefined,
        cma: data.cma ? JSON.stringify(data.cma) : undefined,
        aircraft_endorsements: data.aircraft_endorsements.length ? JSON.stringify(data.aircraft_endorsements) : undefined,
        documents: data.documents.length ? JSON.stringify(data.documents) : undefined,
        role_secondary: data.role_secondary.length ? JSON.stringify(data.role_secondary) : undefined,
        approval_status: "approved",
      };
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
      await base44.entities.Oat.create(payload);
      onDone();
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Erro ao criar OAT.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-[#1A1D25] w-full sm:max-w-3xl sm:rounded-2xl rounded-t-2xl shadow-2xl border border-slate-700/60 max-h-[94vh] flex flex-col">
        <div className="sticky top-0 bg-[#1A1D25]/95 backdrop-blur px-6 py-4 border-b border-slate-700/60 flex items-center justify-between z-10">
          <div>
            <h2 className="font-semibold text-lg text-slate-100">Novo OAT</h2>
            <p className="text-xs text-slate-500 mt-0.5">Etapa {step + 1} de {STEPS.length} — {STEPS[step].label}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700/40">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-slate-700/60 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = i < step;
              const active = i === step;
              return (
                <div key={s.id} className="flex items-center">
                  <button
                    onClick={() => i <= step && setStep(i)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      active ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" :
                      done ? "text-emerald-400 hover:bg-emerald-500/10" : "text-slate-600"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      active ? "bg-amber-500 text-slate-900" :
                      done ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700/50"
                    }`}>
                      {done ? <Check className="w-3 h-3" /> : i + 1}
                    </span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {i < STEPS.length - 1 && <div className={`w-4 h-px ${i < step ? "bg-emerald-500/40" : "bg-slate-700/40"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
            </div>
          )}
          {cpfDup && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
              ⚠ CPF duplicado — já existe OAT cadastrado com este CPF.
            </div>
          )}
          {canacDup && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
              ⚠ CANAC duplicado — já existe OAT cadastrado com este CANAC.
            </div>
          )}

          {step === 0 && <StepVinculo data={data} set={set} existingOats={existingOats} />}
          {step === 1 && <StepIdentificacao data={data} set={set} />}
          {step === 2 && <StepEndereco data={data} set={set} />}
          {step === 3 && <StepOperacional data={data} set={set} />}
          {step === 4 && <StepSituacao data={data} set={set} />}
          {step === 5 && <StepLicencas data={data} set={set} />}
          {step === 6 && <StepCertificados data={data} set={set} />}
          {step === 7 && <StepCMA data={data} set={set} />}
          {step === 8 && <StepAeronaves data={data} set={set} />}
          {step === 9 && <StepDocumentos data={data} set={set} />}
          {step === 10 && <StepRevisao data={data} />}
          {step === 11 && <StepConfirmacao data={data} set={set} />}
        </div>

        <div className="sticky bottom-0 bg-[#1A1D25]/95 backdrop-blur px-6 py-4 border-t border-slate-700/60 flex items-center justify-between">
          <button onClick={back} disabled={step === 0} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" /> Voltar
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={next} disabled={!canAdvance} className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-400 text-slate-900 disabled:opacity-50">
              Avançar <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={submit} disabled={saving} className="inline-flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-900 disabled:opacity-50">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Criando…</> : <><Check className="w-4 h-4" /> CRIAR CADASTRO DO OAT</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-medium text-slate-400 mb-1">{label}{required && <span className="text-amber-400"> *</span>}</span>
      {children}
    </label>
  );
}

function ProtectedNote() {
  return (
    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
      <Lock className="w-3 h-3" /> Campo administrado pela organização. Solicite alteração via aba de solicitações.
    </p>
  );
}

function StepVinculo({ data, set, existingOats }) {
  const [userQuery, setUserQuery] = useState("");
  const [users, setUsers] = useState(null);
  const [searching, setSearching] = useState(false);

  const searchUsers = async () => {
    if (!userQuery.trim()) return;
    setSearching(true);
    try {
      const res = await base44.functions.invoke("manageUsers", { action: "list" });
      const q = userQuery.trim().toLowerCase();
      const filtered = (res.data.users || []).filter((u) =>
        [u.full_name, u.email, u.login].filter(Boolean).join(" ").toLowerCase().includes(q)
      );
      setUsers(filtered);
    } catch { setUsers([]); }
    setSearching(false);
  };

  const linkedOat = data.linkedUser ? existingOats.find((o) => o.user_id === data.linkedUser.id) : null;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-200 mb-1">Vínculo com Usuário</h3>
        <p className="text-xs text-slate-500">Defina como o OAT será vinculado a uma conta de acesso.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {[
          { v: "no_account", t: "Criar OAT sem conta de acesso", d: "Cadastro operacional sem login." },
          { v: "link", t: "Vincular a usuário existente", d: "Associar a uma conta já cadastrada." },
          { v: "request_account", t: "Criar OAT e solicitar conta", d: "Cadastro + convite de acesso." },
          { v: "migration", t: "Continuar cadastro migrado", d: "Completar cadastro pendente." },
        ].map((opt) => (
          <button
            key={opt.v}
            onClick={() => set("vinculoMode", opt.v)}
            className={`text-left p-4 rounded-xl border transition-colors ${
              data.vinculoMode === opt.v ? "border-amber-500/50 bg-amber-500/10" : "border-slate-700/60 hover:border-slate-600"
            }`}
          >
            <p className="text-sm font-medium text-slate-200">{opt.t}</p>
            <p className="text-xs text-slate-500 mt-1">{opt.d}</p>
          </button>
        ))}
      </div>

      {data.vinculoMode === "link" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), searchUsers())}
                placeholder="Buscar por nome ou e-mail…"
                className={`${inputCls} pl-10`}
              />
            </div>
            <button onClick={searchUsers} disabled={searching} className="px-4 rounded-lg bg-slate-700/60 text-sm text-slate-200 hover:bg-slate-700">
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
            </button>
          </div>
          {users && users.length === 0 && <p className="text-sm text-slate-500">Nenhum usuário encontrado.</p>}
          {users && users.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {users.map((u) => {
                const hasOat = existingOats.some((o) => o.user_id === u.id);
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      if (hasOat) return;
                      set("linkedUser", u);
                      set("full_name", u.full_name || "");
                      set("email_login", u.email || "");
                    }}
                    disabled={hasOat}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      data.linkedUser?.id === u.id ? "border-amber-500/50 bg-amber-500/10" :
                      hasOat ? "border-slate-700/30 opacity-50 cursor-not-allowed" : "border-slate-700/60 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-200">{u.full_name || "—"}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                      {hasOat && <span className="text-xs text-amber-400">Já vinculado</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          {data.linkedUser && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <p className="text-sm text-amber-200">Vinculado a: <strong>{data.linkedUser.full_name}</strong> ({data.linkedUser.email})</p>
              {linkedOat && (
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-xs text-rose-300">Este usuário já possui OAT vinculado.</p>
                  <span className="text-xs text-amber-400 font-medium">Abrir cadastro existente</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StepIdentificacao({ data, set }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-200 mb-1">Identificação</h3>
        <p className="text-xs text-slate-500">Dados pessoais do OAT. Campos protegidos serão gerenciados pela administração.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Field label="Nome completo" required><input className={inputCls} value={data.full_name} onChange={(e) => set("full_name", e.target.value)} /></Field>
        <Field label="Nome de guerra"><input className={inputCls} value={data.war_name} onChange={(e) => set("war_name", e.target.value)} /></Field>
        <Field label="Data de nascimento"><input type="date" className={inputCls} value={data.birth_date} onChange={(e) => set("birth_date", e.target.value)} /></Field>
        <Field label="Nacionalidade"><input className={inputCls} value={data.nationality} onChange={(e) => set("nationality", e.target.value)} /></Field>
        <Field label="Estado civil"><input className={inputCls} value={data.marital_status} onChange={(e) => set("marital_status", e.target.value)} /></Field>
        <Field label="Tipo sanguíneo">
          <select className={inputCls} value={data.blood_type} onChange={(e) => set("blood_type", e.target.value)}>
            <option value="">—</option>
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
        <Field label="CPF"><input className={inputCls} value={data.cpf} onChange={(e) => set("cpf", e.target.value)} placeholder="000.000.000-00" /></Field>
        <Field label="RG"><input className={inputCls} value={data.rg} onChange={(e) => set("rg", e.target.value)} /></Field>
        <Field label="Órgão emissor"><input className={inputCls} value={data.rg_issuer} onChange={(e) => set("rg_issuer", e.target.value)} placeholder="SSP/UF" /></Field>
        <Field label="Data de emissão do RG"><input type="date" className={inputCls} value={data.rg_issue_date} onChange={(e) => set("rg_issue_date", e.target.value)} /></Field>
        <Field label="Telefone celular"><input className={inputCls} value={data.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
        <Field label="Telefone alternativo"><input className={inputCls} value={data.phone_alt} onChange={(e) => set("phone_alt", e.target.value)} /></Field>
        <Field label="E-mail de contato"><input type="email" className={inputCls} value={data.email} onChange={(e) => set("email", e.target.value)} /></Field>
        <Field label="E-mail de login">
          <input className={`${inputCls} opacity-60`} value={data.email_login} readOnly placeholder="Origina da conta vinculada" />
          <ProtectedNote />
        </Field>
      </div>
      <div className="pt-3 border-t border-slate-700/40">
        <p className="text-xs font-semibold text-slate-400 mb-3">Contato de emergência</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Nome"><input className={inputCls} value={data.emergency_contact_name} onChange={(e) => set("emergency_contact_name", e.target.value)} /></Field>
          <Field label="Telefone"><input className={inputCls} value={data.emergency_contact_phone} onChange={(e) => set("emergency_contact_phone", e.target.value)} /></Field>
          <Field label="Relação / vínculo"><input className={inputCls} value={data.emergency_contact_relation} onChange={(e) => set("emergency_contact_relation", e.target.value)} placeholder="Pai, mãe, cônjuge…" /></Field>
        </div>
      </div>
    </div>
  );
}

function StepEndereco({ data, set }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-200 mb-1">Endereço</h3>
        <p className="text-xs text-slate-500">Endereço residencial. Dado protegido — visível somente para perfis autorizados.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Field label="CEP"><input className={inputCls} value={data.cep} onChange={(e) => set("cep", e.target.value)} placeholder="00000-000" /></Field>
        <Field label="Logradouro" className="sm:col-span-2"><input className={inputCls} value={data.logradouro} onChange={(e) => set("logradouro", e.target.value)} /></Field>
        <Field label="Número"><input className={inputCls} value={data.address_number} onChange={(e) => set("address_number", e.target.value)} /></Field>
        <Field label="Complemento"><input className={inputCls} value={data.address_complement} onChange={(e) => set("address_complement", e.target.value)} /></Field>
        <Field label="Bairro"><input className={inputCls} value={data.bairro} onChange={(e) => set("bairro", e.target.value)} /></Field>
        <Field label="Cidade"><input className={inputCls} value={data.city} onChange={(e) => set("city", e.target.value)} /></Field>
        <Field label="Estado (UF)"><input className={inputCls} value={data.state} onChange={(e) => set("state", e.target.value)} /></Field>
        <Field label="País"><input className={inputCls} value={data.country} onChange={(e) => set("country", e.target.value)} /></Field>
      </div>
    </div>
  );
}

function StepOperacional({ data, set }) {
  const setHour = (k, v) => set("hours", { ...data.hours, [k]: v === "" ? undefined : Number(v) });
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-200 mb-1">Dados Operacionais</h3>
        <p className="text-xs text-slate-500">Função, base, habilitações e experiência.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Field label="Função principal">
          <select className={inputCls} value={data.role} onChange={(e) => set("role", e.target.value)}>
            {Object.entries(OAT_FUNCTION_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
        <Field label="Base operacional"><input className={inputCls} value={data.base} onChange={(e) => set("base", e.target.value)} /></Field>
        <Field label="Unidade"><input className={inputCls} value={data.unit} onChange={(e) => set("unit", e.target.value)} /></Field>
        <Field label="Organização"><input className={inputCls} value={data.organization} onChange={(e) => set("organization", e.target.value)} /></Field>
        <Field label="Data de admissão / início"><input type="date" className={inputCls} value={data.admission_date} onChange={(e) => set("admission_date", e.target.value)} /></Field>
        <Field label="Código ANAC/CANAC"><input className={inputCls} value={data.anac_code} onChange={(e) => set("anac_code", e.target.value)} /></Field>
        <Field label="Nº licença ANAC"><input className={inputCls} value={data.license_anac} onChange={(e) => set("license_anac", e.target.value)} /></Field>
        <Field label="Categoria"><input className={inputCls} value={data.category} onChange={(e) => set("category", e.target.value)} /></Field>
      </div>
      <div className="pt-3 border-t border-slate-700/40">
        <p className="text-xs font-semibold text-slate-400 mb-3">Experiência / Horas</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Data de referência das horas"><input type="date" className={inputCls} value={data.hours_ref_date} onChange={(e) => set("hours_ref_date", e.target.value)} /></Field>
          <Field label="Fonte das horas">
            <select className={inputCls} value={data.hours_source} onChange={(e) => set("hours_source", e.target.value)}>
              {OAT_HOURS_SOURCES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </Field>
        </div>
      </div>
    </div>
  );
}

function StepSituacao({ data, set }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-200 mb-1">Situação Cadastral</h3>
        <p className="text-xs text-slate-500">Situação operacional do OAT. Não substitui a situação da conta ou documental.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {Object.entries(OAT_REGISTRATION_STATUS_LABELS).map(([v, l]) => (
          <button
            key={v}
            onClick={() => set("registration_status", v)}
            className={`text-left p-3 rounded-lg border text-sm transition-colors ${
              data.registration_status === v ? "border-amber-500/50 bg-amber-500/10 text-amber-200" : "border-slate-700/60 text-slate-300 hover:border-slate-600"
            }`}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Data de início"><input type="date" className={inputCls} value={data.registration_status_start} onChange={(e) => set("registration_status_start", e.target.value)} /></Field>
        <Field label="Data prevista de término"><input type="date" className={inputCls} value={data.registration_status_end} onChange={(e) => set("registration_status_end", e.target.value)} /></Field>
        <Field label="Motivo" className="sm:col-span-2"><input className={inputCls} value={data.registration_status_reason} onChange={(e) => set("registration_status_reason", e.target.value)} /></Field>
        <Field label="Restrição operacional" className="sm:col-span-2"><input className={inputCls} value={data.operational_restriction} onChange={(e) => set("operational_restriction", e.target.value)} /></Field>
      </div>
    </div>
  );
}

function StepLicencas({ data, set }) {
  const items = data.licenses;
  const addRow = () => set("licenses", [...items, { type: "", typeLabel: "", number: "", issue: "", expiry: "", situation: "valid", institution: "", note: "" }]);
  const upd = (i, k, v) => set("licenses", items.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const del = (i) => set("licenses", items.filter((_, j) => j !== i));
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Licenças e Habilitações</h3>
          <p className="text-xs text-slate-500">Cadastre cada habilitação individualmente.</p>
        </div>
        <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-400 hover:text-amber-300">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>
      {items.length === 0 && <p className="text-sm text-slate-500 py-4 text-center">Nenhuma habilitação. Adicione abaixo.</p>}
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border border-slate-700/60 bg-[#12141A] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Habilitação {i + 1}</span>
            <button type="button" onClick={() => del(i)} className="text-xs text-rose-400 hover:text-rose-300 inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remover</button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <Field label="Tipo">
              <select className={inputCls} value={it.type} onChange={(e) => { const t = OAT_HABILITATION_TYPES.find((x) => x.id === e.target.value); upd(i, "type", e.target.value); upd(i, "typeLabel", t?.label || ""); }}>
                <option value="">Selecione…</option>
                {OAT_HABILITATION_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Número"><input className={inputCls} value={it.number} onChange={(e) => upd(i, "number", e.target.value)} /></Field>
            <Field label="Situação">
              <select className={inputCls} value={it.situation} onChange={(e) => upd(i, "situation", e.target.value)}>
                {OAT_HABILITATION_SITUATIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Data de concessão"><input type="date" className={inputCls} value={it.issue} onChange={(e) => upd(i, "issue", e.target.value)} /></Field>
            <Field label="Data de validade"><input type="date" className={inputCls} value={it.expiry} onChange={(e) => upd(i, "expiry", e.target.value)} /></Field>
            <Field label="Autoridade emissora"><input className={inputCls} value={it.institution} onChange={(e) => upd(i, "institution", e.target.value)} /></Field>
            <Field label="Observações" className="sm:col-span-2 lg:col-span-3"><input className={inputCls} value={it.note} onChange={(e) => upd(i, "note", e.target.value)} /></Field>
          </div>
        </div>
      ))}
    </div>
  );
}

function StepCertificados({ data, set }) {
  const items = data.certificates;
  const addRow = () => set("certificates", [...items, { type: "", typeLabel: "", number: "", issue: "", conclusion: "", expiry: "", situation: "valid", institution: "", note: "" }]);
  const upd = (i, k, v) => set("certificates", items.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const del = (i) => set("certificates", items.filter((_, j) => j !== i));
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Certificados e Cursos</h3>
          <p className="text-xs text-slate-500">Cadastre cada curso individualmente.</p>
        </div>
        <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-400 hover:text-amber-300">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>
      {items.length === 0 && <p className="text-sm text-slate-500 py-4 text-center">Nenhum curso. Adicione abaixo.</p>}
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border border-slate-700/60 bg-[#12141A] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Curso {i + 1}</span>
            <button type="button" onClick={() => del(i)} className="text-xs text-rose-400 hover:text-rose-300 inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remover</button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <Field label="Tipo">
              <select className={inputCls} value={it.type} onChange={(e) => { const t = OAT_CERTIFICATE_TYPES.find((x) => x.id === e.target.value); upd(i, "type", e.target.value); upd(i, "typeLabel", t?.label || ""); }}>
                <option value="">Selecione…</option>
                {OAT_CERTIFICATE_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Nº certificado"><input className={inputCls} value={it.number} onChange={(e) => upd(i, "number", e.target.value)} /></Field>
            <Field label="Situação">
              <select className={inputCls} value={it.situation} onChange={(e) => upd(i, "situation", e.target.value)}>
                {OAT_CERTIFICATE_SITUATIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Data de realização"><input type="date" className={inputCls} value={it.issue} onChange={(e) => upd(i, "issue", e.target.value)} /></Field>
            <Field label="Data de conclusão"><input type="date" className={inputCls} value={it.conclusion} onChange={(e) => upd(i, "conclusion", e.target.value)} /></Field>
            <Field label="Vencimento"><input type="date" className={inputCls} value={it.expiry} onChange={(e) => upd(i, "expiry", e.target.value)} /></Field>
            <Field label="Instituição emissora"><input className={inputCls} value={it.institution} onChange={(e) => upd(i, "institution", e.target.value)} /></Field>
            <Field label="Observações" className="sm:col-span-2 lg:col-span-3"><input className={inputCls} value={it.note} onChange={(e) => upd(i, "note", e.target.value)} /></Field>
          </div>
        </div>
      ))}
    </div>
  );
}

function StepCMA({ data, set }) {
  const cma = data.cma || {};
  const setCma = (k, v) => set("cma", { ...cma, [k]: v });
  const hasCma = !!data.cma;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">CMA — Certificado Médico Aeronáutico</h3>
          <p className="text-xs text-slate-500">Registro do certificado médico e sua validade.</p>
        </div>
        {!hasCma && (
          <button type="button" onClick={() => set("cma", { classe: "", number: "", issue: "", expiry: "", restrictions: "", authority: "", note: "" })} className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-400 hover:text-amber-300">
            <Plus className="w-4 h-4" /> Adicionar CMA
          </button>
        )}
      </div>
      {!hasCma ? (
        <p className="text-sm text-slate-500 py-4 text-center">Nenhum CMA cadastrado. O OAT ficará sem informação de validade médica.</p>
      ) : (
        <div className="rounded-xl border border-slate-700/60 bg-[#12141A] p-4 space-y-3">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Field label="Classe">
              <select className={inputCls} value={cma.classe} onChange={(e) => setCma("classe", e.target.value)}>
                <option value="">Selecione…</option>
                {OAT_CMA_CLASSES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Número do documento"><input className={inputCls} value={cma.number} onChange={(e) => setCma("number", e.target.value)} /></Field>
            <Field label="Autoridade emissora"><input className={inputCls} value={cma.authority} onChange={(e) => setCma("authority", e.target.value)} /></Field>
            <Field label="Data de emissão"><input type="date" className={inputCls} value={cma.issue} onChange={(e) => setCma("issue", e.target.value)} /></Field>
            <Field label="Data de vencimento"><input type="date" className={inputCls} value={cma.expiry} onChange={(e) => setCma("expiry", e.target.value)} /></Field>
            <Field label="Restrições"><input className={inputCls} value={cma.restrictions} onChange={(e) => setCma("restrictions", e.target.value)} /></Field>
            <Field label="Observações" className="sm:col-span-2 lg:col-span-3"><input className={inputCls} value={cma.note} onChange={(e) => setCma("note", e.target.value)} /></Field>
          </div>
          <button type="button" onClick={() => set("cma", null)} className="text-xs text-rose-400 hover:text-rose-300 inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remover CMA</button>
        </div>
      )}
    </div>
  );
}

function StepAeronaves({ data, set }) {
  const items = data.aircraft_endorsements;
  const addRow = () => set("aircraft_endorsements", [...items, { model: "", modelLabel: "", function: "", issue: "", expiry: "", situation: "valid", note: "" }]);
  const upd = (i, k, v) => set("aircraft_endorsements", items.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const del = (i) => set("aircraft_endorsements", items.filter((_, j) => j !== i));
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Aeronaves e Endossos</h3>
          <p className="text-xs text-slate-500">Associe modelos de helicóptero e autorizações.</p>
        </div>
        <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-400 hover:text-amber-300">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>
      {items.length === 0 && <p className="text-sm text-slate-500 py-4 text-center">Nenhuma aeronave associada.</p>}
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border border-slate-700/60 bg-[#12141A] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Aeronave {i + 1}</span>
            <button type="button" onClick={() => del(i)} className="text-xs text-rose-400 hover:text-rose-300 inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remover</button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <Field label="Modelo">
              <select className={inputCls} value={it.model} onChange={(e) => { const m = OAT_AIRCRAFT_MODELS.find((x) => x.id === e.target.value); upd(i, "model", e.target.value); upd(i, "modelLabel", m?.label || ""); }}>
                <option value="">Selecione…</option>
                {OAT_AIRCRAFT_MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </Field>
            <Field label="Função autorizada">
              <select className={inputCls} value={it.function} onChange={(e) => upd(i, "function", e.target.value)}>
                <option value="">Selecione…</option>
                {OAT_ENDORSEMENT_FUNCTIONS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
            </Field>
            <Field label="Situação">
              <select className={inputCls} value={it.situation} onChange={(e) => upd(i, "situation", e.target.value)}>
                {OAT_ENDORSEMENT_SITUATIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Data de concessão"><input type="date" className={inputCls} value={it.issue} onChange={(e) => upd(i, "issue", e.target.value)} /></Field>
            <Field label="Data de validade"><input type="date" className={inputCls} value={it.expiry} onChange={(e) => upd(i, "expiry", e.target.value)} /></Field>
            <Field label="Observações" className="sm:col-span-2 lg:col-span-3"><input className={inputCls} value={it.note} onChange={(e) => upd(i, "note", e.target.value)} /></Field>
          </div>
        </div>
      ))}
    </div>
  );
}

function StepDocumentos({ data, set }) {
  const [uploading, setUploading] = useState(null);
  const addFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(file.name);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      set("documents", [...data.documents, { category: "", categoryLabel: "", label: file.name, note: "", expiry: "", file_uri, file_name: file.name }]);
    } catch { alert("Erro ao enviar arquivo."); }
    setUploading(null);
    e.target.value = "";
  };
  const upd = (i, k, v) => set("documents", data.documents.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const del = (i) => set("documents", data.documents.filter((_, j) => j !== i));
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-200">Documentos</h3>
        <p className="text-xs text-slate-500">Anexe os arquivos necessários. Os arquivos são armazenados privadamente.</p>
      </div>
      <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border border-dashed border-slate-600 text-sm text-slate-300 hover:border-amber-400/60 hover:text-amber-300">
        <Upload className="w-4 h-4" /> {uploading ? `Enviando ${uploading}…` : "Anexar PDF ou imagem"}
        <input type="file" accept="application/pdf,image/*" className="hidden" onChange={addFile} />
      </label>
      {data.documents.length === 0 && <p className="text-sm text-slate-500">Nenhum documento anexado.</p>}
      {data.documents.map((d, i) => (
        <div key={i} className="rounded-xl border border-slate-700/60 bg-[#12141A] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 truncate"><FileText className="w-3.5 h-3.5 shrink-0" /> {d.file_name}</span>
            <button type="button" onClick={() => del(i)} className="text-xs text-rose-400 hover:text-rose-300 shrink-0 inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remover</button>
          </div>
          <div className="grid sm:grid-cols-3 gap-2">
            <Field label="Categoria">
              <select className={inputCls} value={d.category} onChange={(e) => { const c = OAT_DOC_CATEGORIES.find((x) => x.id === e.target.value); upd(i, "category", e.target.value); upd(i, "categoryLabel", c?.label || ""); }}>
                <option value="">Selecione…</option>
                {OAT_DOC_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Vencimento"><input type="date" className={inputCls} value={d.expiry} onChange={(e) => upd(i, "expiry", e.target.value)} /></Field>
            <Field label="Observação"><input className={inputCls} value={d.note} onChange={(e) => upd(i, "note", e.target.value)} /></Field>
          </div>
        </div>
      ))}
    </div>
  );
}

function StepRevisao({ data }) {
  const Row = ({ label, value }) => (
    <div className="flex justify-between gap-3 text-sm py-1.5 border-b border-slate-700/30">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="text-slate-200 text-right">{value || "—"}</span>
    </div>
  );
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-200">Revisão</h3>
        <p className="text-xs text-slate-500">Confira os dados antes de criar o cadastro.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1">
        <div>
          <p className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider mb-2">Identificação</p>
          <Row label="Nome" value={data.full_name} />
          <Row label="Nome de guerra" value={data.war_name} />
          <Row label="CPF" value={data.cpf ? maskCPF(data.cpf) : "—"} />
          <Row label="CANAC" value={data.anac_code} />
          <Row label="E-mail contato" value={data.email} />
          <Row label="E-mail login" value={data.email_login} />
        </div>
        <div>
          <p className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider mb-2">Operacional</p>
          <Row label="Função" value={OAT_FUNCTION_LABELS[data.role]} />
          <Row label="Base" value={data.base} />
          <Row label="Unidade" value={data.unit} />
          <Row label="Organização" value={data.organization} />
          <Row label="Situação" value={OAT_REGISTRATION_STATUS_LABELS[data.registration_status]} />
          <Row label="Habilitações" value={`${data.licenses.length} cadastrada(s)`} />
          <Row label="Cursos" value={`${data.certificates.length} cadastrado(s)`} />
          <Row label="CMA" value={data.cma ? "Cadastrado" : "Não informado"} />
          <Row label="Aeronaves" value={`${data.aircraft_endorsements.length} associada(s)`} />
          <Row label="Documentos" value={`${data.documents.length} anexado(s)`} />
        </div>
      </div>
    </div>
  );
}

function StepConfirmacao({ data, set }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-200">Confirmação</h3>
        <p className="text-xs text-slate-500">Confirme a identidade e a conferência documental antes de criar o cadastro.</p>
      </div>
      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-sm text-slate-300 space-y-2">
        <label className="flex items-center gap-2"><input type="checkbox" className="accent-amber-500" /> Confirmo a identidade do OAT.</label>
        <label className="flex items-center gap-2"><input type="checkbox" className="accent-amber-500" /> Confirmo a conferência documental dos dados informados.</label>
        <label className="flex items-center gap-2"><input type="checkbox" className="accent-amber-500" /> Declaro que as informações são verdadeiras e conferem com a documentação.</label>
      </div>
      <Field label="Comentário / declaração">
        <textarea className={`${inputCls} min-h-[80px]`} value={data.confirmation_comment} onChange={(e) => set("confirmation_comment", e.target.value)} placeholder="Observações sobre a conferência…" />
      </Field>
      <div className="p-3 rounded-lg bg-slate-700/20 border border-slate-700/40 text-xs text-slate-400">
        <Lock className="w-3.5 h-3.5 inline mr-1.5 text-amber-400" />
        A senha de acesso do aprovador será exigida na confirmação final. O sistema não armazena a senha utilizada.
      </div>
    </div>
  );
}