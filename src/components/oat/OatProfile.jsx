import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  OAT_FUNCTION_LABELS, OAT_REGISTRATION_STATUS_LABELS, OAT_REGISTRATION_STATUS_STYLES,
  OAT_CHANGE_TYPE_LABELS, OAT_CHANGE_STATUS_LABELS,
  OAT_HABILITATION_TYPES, OAT_HABILITATION_SITUATIONS,
  OAT_CERTIFICATE_TYPES, OAT_CERTIFICATE_SITUATIONS,
  OAT_CMA_CLASSES, OAT_AIRCRAFT_MODELS, OAT_ENDORSEMENT_FUNCTIONS, OAT_ENDORSEMENT_SITUATIONS,
  OAT_DOC_CATEGORIES, OAT_HOURS_SOURCES,
  safeParse, maskCPF, maskRG, collectExpiries, cmaStatus, daysUntil,
  EXPIRY_COLORS, fmtDate, fmtDateTime,
} from "@/lib/oatUtils";
import { can } from "@/lib/accessControl";
import {
  ChevronLeft, BadgeCheck, Building2, MapPin, Mail, Phone, AlertTriangle,
  FileText, History, ShieldCheck, Lock, Plus, Trash2, Upload, Loader2,
  CheckCircle2, X, Clock, Download, Send, KeyRound, UserCog, FileBarChart,
} from "lucide-react";

const inputCls = "w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50";

const TABS = [
  { id: "visao", label: "Visão Geral" },
  { id: "pessoais", label: "Dados Pessoais" },
  { id: "operacionais", label: "Dados Operacionais" },
  { id: "funcoes", label: "Funções" },
  { id: "licencas", label: "Licenças e Habilitações" },
  { id: "certificados", label: "Certificados e Cursos" },
  { id: "cma", label: "CMA" },
  { id: "aeronaves", label: "Aeronaves e Endossos" },
  { id: "documentos", label: "Documentos" },
  { id: "vencimentos", label: "Vencimentos" },
  { id: "solicitacoes", label: "Solicitações" },
  { id: "seguranca", label: "Segurança e Conta" },
  { id: "historico", label: "Histórico" },
];

export default function OatProfile({ oat, me, isManager, onBack, onRefresh }) {
  const [tab, setTab] = useState("visao");
  const [editing, setEditing] = useState(null);
  const fromList = oat;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-amber-300 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Voltar à lista
      </button>

      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-6 flex flex-col sm:flex-row gap-5">
        <Avatar oat={fromList} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-bold text-slate-100">{fromList.full_name}</h2>
            {fromList.war_name && <span className="text-sm text-amber-400/80">"{fromList.war_name}"</span>}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-slate-400">
            <span className="inline-flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-amber-400" /> {OAT_FUNCTION_LABELS[fromList.role] || fromList.role}</span>
            <span className="inline-flex items-center gap-1.5"><Building2 className="w-4 h-4 text-slate-500" /> {fromList.organization || "—"}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-500" /> {fromList.base || "—"}</span>
            <span className="inline-flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-500" /> {fromList.email || "—"}</span>
            <span className="inline-flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-500" /> {fromList.phone || "—"}</span>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${OAT_REGISTRATION_STATUS_STYLES[fromList.registration_status] || ""}`}>
              {OAT_REGISTRATION_STATUS_LABELS[fromList.registration_status] || fromList.registration_status}
            </span>
            {fromList.approval_status === "pending" && (
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full border bg-amber-500/10 text-amber-300 border-amber-500/30">Cadastro pendente</span>
            )}
          </div>
        </div>
        {isManager && (
          <button onClick={() => setEditing(editing ? null : "pessoais")} className="self-start px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 text-slate-200 hover:border-amber-500/40 hover:text-amber-300">
            {editing ? "Concluir" : "Editar"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 pb-1 border-b border-slate-700/60">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-2 text-xs font-medium whitespace-nowrap rounded-t-lg transition-colors ${
              tab === t.id ? "text-amber-300 border-b-2 border-amber-500" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
        {tab === "visao" && <TabVisao oat={fromList} />}
        {tab === "pessoais" && <TabPessoais oat={fromList} isManager={isManager} editing={editing} setEditing={setEditing} onSaved={onRefresh} />}
        {tab === "operacionais" && <TabOperacionais oat={fromList} isManager={isManager} editing={editing} setEditing={setEditing} onSaved={onRefresh} />}
        {tab === "funcoes" && <TabFuncoes oat={fromList} isManager={isManager} onSaved={onRefresh} />}
        {tab === "licencas" && <TabLicencas oat={fromList} isManager={isManager} onSaved={onRefresh} />}
        {tab === "certificados" && <TabCertificados oat={fromList} isManager={isManager} onSaved={onRefresh} />}
        {tab === "cma" && <TabCMA oat={fromList} isManager={isManager} onSaved={onRefresh} />}
        {tab === "aeronaves" && <TabAeronaves oat={fromList} isManager={isManager} onSaved={onRefresh} />}
        {tab === "documentos" && <TabDocumentos oat={fromList} isManager={isManager} onSaved={onRefresh} />}
        {tab === "vencimentos" && <TabVencimentos oat={fromList} />}
        {tab === "solicitacoes" && <TabSolicitacoes oat={fromList} isManager={isManager} me={me} />}
        {tab === "seguranca" && <TabSeguranca oat={fromList} isManager={isManager} />}
        {tab === "historico" && <TabHistorico oat={fromList} />}
      </div>
    </div>
  );
}

function Avatar({ oat, size = "md" }) {
  const cls = size === "lg" ? "w-14 h-14 rounded-xl" : "w-16 h-16 rounded-xl";
  return (
    <div className={`${cls} bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shrink-0 overflow-hidden`}>
      {oat?.photo_uri ? (
        <img src={oat.photo_uri} alt={oat?.full_name || "Foto"} className="w-full h-full object-cover" />
      ) : (
        <span className="text-lg font-bold text-amber-400/60">{(oat?.full_name || "?").slice(0, 2).toUpperCase()}</span>
      )}
    </div>
  );
}

function Grid({ rows }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-2 text-sm border-b border-slate-700/30 pb-2">
          <span className="text-slate-500 shrink-0">{k}</span>
          <span className="text-slate-200 text-right truncate">{v || "—"}</span>
        </div>
      ))}
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

function FormActions({ saving, onCancel }) {
  return (
    <div className="flex justify-end gap-2 pt-1">
      <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-700/40">Cancelar</button>
      <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-400 text-slate-900 disabled:opacity-50">
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando…</> : <><CheckCircle2 className="w-4 h-4" /> Salvar</>}
      </button>
    </div>
  );
}

async function openFile(file_uri) {
  try {
    const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri });
    window.open(signed_url, "_blank");
  } catch { alert("Não foi possível abrir o arquivo."); }
}

// ---- TAB: Visão Geral ----
function TabVisao({ oat }) {
  const expiries = collectExpiries(oat);
  const cma = safeParse(oat.cma, null);
  const cmaSt = cmaStatus(cma);
  const nextExp = expiries.length > 0 ? expiries[0] : null;
  return (
    <div className="space-y-5">
      <Grid rows={[
        ["Função principal", OAT_FUNCTION_LABELS[oat.role] || oat.role],
        ["Base operacional", oat.base],
        ["Unidade", oat.unit],
        ["Organização", oat.organization],
        ["CANAC", oat.anac_code],
        ["Situação cadastral", OAT_REGISTRATION_STATUS_LABELS[oat.registration_status]],
        ["Próximo vencimento", nextExp ? `${nextExp.kind}: ${fmtDate(nextExp.date)}` : "—"],
        ["Situação do CMA", cmaSt.label],
      ]} />
      {expiries.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Próximos vencimentos</h4>
          <div className="space-y-1.5">
            {expiries.slice(0, 5).map((e, i) => {
              const d = daysUntil(e.date);
              const st = d < 0 ? "expired" : d <= 30 ? "30" : d <= 60 ? "60" : d <= 90 ? "90" : "ok";
              const c = EXPIRY_COLORS[st];
              return (
                <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-700/30 last:border-0">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                    <span className="text-[11px] uppercase tracking-wider text-slate-500">{e.kind}</span>
                    {e.label}
                  </span>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${c.pill}`}>{fmtDate(e.date)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- TAB: Dados Pessoais ----
function TabPessoais({ oat, isManager, editing, setEditing, onSaved }) {
  if (editing === "pessoais") {
    return <EditPessoais oat={oat} onCancel={() => setEditing(null)} onSaved={onSaved} />;
  }
  return (
    <div className="space-y-4">
      <Grid rows={[
        ["Nome completo", oat.full_name], ["Nome de guerra", oat.war_name], ["Nascimento", fmtDate(oat.birth_date)],
        ["CPF", maskCPF(oat.cpf)], ["RG", maskRG(oat.rg)], ["Órgão emissor", oat.rg_issuer],
        ["Nacionalidade", oat.nationality], ["Estado civil", oat.marital_status], ["Tipo sanguíneo", oat.blood_type],
        ["Telefone", oat.phone], ["Telefone alternativo", oat.phone_alt], ["E-mail de contato", oat.email],
        ["E-mail de login", oat.email_login],
        ["CEP", oat.cep], ["Logradouro", oat.logradouro], ["Número", oat.address_number],
        ["Complemento", oat.address_complement], ["Bairro", oat.bairro], ["Cidade", oat.city],
        ["Estado", oat.state], ["País", oat.country],
        ["Contato de emergência", oat.emergency_contact_name], ["Telefone do contato", oat.emergency_contact_phone], ["Relação", oat.emergency_contact_relation],
      ]} />
      {!isManager && (
        <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-2">
          <Lock className="w-3 h-3" /> Campos pessoais sensíveis são protegidos. Solicite alteração via aba de solicitações.
        </p>
      )}
    </div>
  );
}

function EditPessoais({ oat, onCancel, onSaved }) {
  const [f, setF] = useState(() => ({
    full_name: oat.full_name || "", war_name: oat.war_name || "", birth_date: oat.birth_date || "",
    nationality: oat.nationality || "", marital_status: oat.marital_status || "",
    phone: oat.phone || "", phone_alt: oat.phone_alt || "", email: oat.email || "",
    cep: oat.cep || "", logradouro: oat.logradouro || "", address_number: oat.address_number || "",
    address_complement: oat.address_complement || "", bairro: oat.bairro || "", city: oat.city || "",
    state: oat.state || "", country: oat.country || "",
    emergency_contact_name: oat.emergency_contact_name || "",
    emergency_contact_phone: oat.emergency_contact_phone || "",
    emergency_contact_relation: oat.emergency_contact_relation || "",
  }));
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const patch = {};
      Object.entries(f).forEach(([k, v]) => { if (v !== undefined) patch[k] = v === "" ? null : v; });
      await base44.entities.Oat.update(oat.id, patch);
      onSaved(); onCancel();
    } catch (err) {
      alert(err?.response?.data?.error || err?.data?.error || err.message || "Erro ao salvar OAT.");
    } finally { setSaving(false); }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Field label="Nome completo"><input className={inputCls} value={f.full_name} onChange={set("full_name")} /></Field>
        <Field label="Nome de guerra"><input className={inputCls} value={f.war_name} onChange={set("war_name")} /></Field>
        <Field label="Nascimento"><input type="date" className={inputCls} value={f.birth_date} onChange={set("birth_date")} /></Field>
        <Field label="Nacionalidade"><input className={inputCls} value={f.nationality} onChange={set("nationality")} /></Field>
        <Field label="Estado civil"><input className={inputCls} value={f.marital_status} onChange={set("marital_status")} /></Field>
        <Field label="Telefone"><input className={inputCls} value={f.phone} onChange={set("phone")} /></Field>
        <Field label="Telefone alternativo"><input className={inputCls} value={f.phone_alt} onChange={set("phone_alt")} /></Field>
        <Field label="E-mail de contato"><input className={inputCls} value={f.email} onChange={set("email")} /></Field>
        <Field label="CEP"><input className={inputCls} value={f.cep} onChange={set("cep")} /></Field>
        <Field label="Logradouro"><input className={inputCls} value={f.logradouro} onChange={set("logradouro")} /></Field>
        <Field label="Número"><input className={inputCls} value={f.address_number} onChange={set("address_number")} /></Field>
        <Field label="Complemento"><input className={inputCls} value={f.address_complement} onChange={set("address_complement")} /></Field>
        <Field label="Bairro"><input className={inputCls} value={f.bairro} onChange={set("bairro")} /></Field>
        <Field label="Cidade"><input className={inputCls} value={f.city} onChange={set("city")} /></Field>
        <Field label="Estado"><input className={inputCls} value={f.state} onChange={set("state")} /></Field>
        <Field label="País"><input className={inputCls} value={f.country} onChange={set("country")} /></Field>
        <Field label="Contato de emergência — nome"><input className={inputCls} value={f.emergency_contact_name} onChange={set("emergency_contact_name")} /></Field>
        <Field label="Contato de emergência — telefone"><input className={inputCls} value={f.emergency_contact_phone} onChange={set("emergency_contact_phone")} /></Field>
        <Field label="Contato de emergência — relação"><input className={inputCls} value={f.emergency_contact_relation} onChange={set("emergency_contact_relation")} /></Field>
      </div>
      <FormActions saving={saving} onCancel={onCancel} />
    </form>
  );
}

// ---- TAB: Dados Operacionais ----
function TabOperacionais({ oat, isManager, editing, setEditing, onSaved }) {
  if (editing === "operacionais") {
    return <EditOperacionais oat={oat} onCancel={() => setEditing(null)} onSaved={onSaved} />;
  }
  return (
    <Grid rows={[
      ["Função principal", OAT_FUNCTION_LABELS[oat.role] || oat.role],
      ["Base operacional", oat.base], ["Unidade", oat.unit], ["Organização", oat.organization],
      ["Data de admissão", fmtDate(oat.admission_date)], ["CANAC", oat.anac_code],
      ["Licença ANAC", oat.license_anac], ["Categoria", oat.category],
      ["Situação cadastral", OAT_REGISTRATION_STATUS_LABELS[oat.registration_status]],
      ["Início da situação", fmtDate(oat.registration_status_start)],
      ["Término previsto", fmtDate(oat.registration_status_end)],
      ["Motivo", oat.registration_status_reason],
      ["Restrição operacional", oat.operational_restriction],
      ["Fonte das horas", oat.hours_source], ["Data de referência", fmtDate(oat.hours_ref_date)],
    ]} />
  );
}

function EditOperacionais({ oat, onCancel, onSaved }) {
  const [f, setF] = useState(() => ({
    role: oat.role || "oat", base: oat.base || "", unit: oat.unit || "", organization: oat.organization || "",
    admission_date: oat.admission_date || "", anac_code: oat.anac_code || "", license_anac: oat.license_anac || "",
    category: oat.category || "", registration_status: oat.registration_status || "active",
    registration_status_start: oat.registration_status_start || "", registration_status_end: oat.registration_status_end || "",
    registration_status_reason: oat.registration_status_reason || "", operational_restriction: oat.operational_restriction || "",
    hours_source: oat.hours_source || "declared", hours_ref_date: oat.hours_ref_date || "",
  }));
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const patch = {};
      Object.entries(f).forEach(([k, v]) => { if (v !== undefined) patch[k] = v === "" ? null : v; });
      await base44.entities.Oat.update(oat.id, patch);
      onSaved(); onCancel();
    } catch (err) {
      alert(err?.response?.data?.error || err?.data?.error || err.message || "Erro ao salvar OAT.");
    } finally { setSaving(false); }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Field label="Função principal">
          <select className={inputCls} value={f.role} onChange={set("role")}>
            {Object.entries(OAT_FUNCTION_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
        <Field label="Base operacional"><input className={inputCls} value={f.base} onChange={set("base")} /></Field>
        <Field label="Unidade"><input className={inputCls} value={f.unit} onChange={set("unit")} /></Field>
        <Field label="Organização"><input className={inputCls} value={f.organization} onChange={set("organization")} /></Field>
        <Field label="Data de admissão"><input type="date" className={inputCls} value={f.admission_date} onChange={set("admission_date")} /></Field>
        <Field label="CANAC"><input className={inputCls} value={f.anac_code} onChange={set("anac_code")} /></Field>
        <Field label="Licença ANAC"><input className={inputCls} value={f.license_anac} onChange={set("license_anac")} /></Field>
        <Field label="Categoria"><input className={inputCls} value={f.category} onChange={set("category")} /></Field>
        <Field label="Situação cadastral">
          <select className={inputCls} value={f.registration_status} onChange={set("registration_status")}>
            {Object.entries(OAT_REGISTRATION_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
        <Field label="Início da situação"><input type="date" className={inputCls} value={f.registration_status_start} onChange={set("registration_status_start")} /></Field>
        <Field label="Término previsto"><input type="date" className={inputCls} value={f.registration_status_end} onChange={set("registration_status_end")} /></Field>
        <Field label="Motivo"><input className={inputCls} value={f.registration_status_reason} onChange={set("registration_status_reason")} /></Field>
        <Field label="Restrição operacional" className="sm:col-span-2 lg:col-span-3"><input className={inputCls} value={f.operational_restriction} onChange={set("operational_restriction")} /></Field>
        <Field label="Fonte das horas">
          <select className={inputCls} value={f.hours_source} onChange={set("hours_source")}>
            {OAT_HOURS_SOURCES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </Field>
        <Field label="Data de referência das horas"><input type="date" className={inputCls} value={f.hours_ref_date} onChange={set("hours_ref_date")} /></Field>
      </div>
      <FormActions saving={saving} onCancel={onCancel} />
    </form>
  );
}

// ---- TAB: Funções ----
function TabFuncoes({ oat, isManager, onSaved }) {
  const functions = safeParse(oat.functions_exercised, []);
  const secondary = safeParse(oat.role_secondary, []);
  const [items, setItems] = useState(functions);
  const [sec, setSec] = useState(secondary);
  const [saving, setSaving] = useState(false);

  const addRow = () => setItems([...items, { name: "", type: "secondary", situation: "active", start: "", end: "", unit: "", aircraft: "", note: "" }]);
  const upd = (i, k, v) => setItems(items.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const del = (i) => setItems(items.filter((_, j) => j !== i));

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await base44.entities.Oat.update(oat.id, { functions_exercised: JSON.stringify(items), role_secondary: JSON.stringify(sec) });
      onSaved();
    } catch (err) {
      alert(err?.response?.data?.error || err?.data?.error || err.message || "Erro ao salvar OAT.");
    } finally { setSaving(false); }
  };

  if (!isManager) {
    return (
      <div className="space-y-3">
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Função principal</h4>
          <p className="text-sm text-slate-200">{OAT_FUNCTION_LABELS[oat.role] || oat.role}</p>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Funções exercidas</h4>
          {items.length === 0 ? <p className="text-sm text-slate-500">Nenhuma função registrada.</p> : (
            <div className="space-y-2">
              {items.map((f, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-slate-700/30 last:border-0">
                  <div>
                    <p className="text-slate-200">{f.name || "—"}</p>
                    <p className="text-xs text-slate-500">{f.type === "primary" ? "Principal" : "Secundária"} · {f.situation || "—"} · {f.unit || "—"}</p>
                  </div>
                  <span className="text-xs text-slate-500">{fmtDate(f.start)} → {fmtDate(f.end)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-200">Funções exercidas</h4>
          <p className="text-xs text-slate-500">Uma função principal ativa por vez. Funções secundárias podem ser várias.</p>
        </div>
        <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-400 hover:text-amber-300">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>
      {items.length === 0 && <p className="text-sm text-slate-500 py-4 text-center">Nenhuma função. Adicione abaixo.</p>}
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border border-slate-700/60 bg-[#12141A] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Função {i + 1}</span>
            <button type="button" onClick={() => del(i)} className="text-xs text-rose-400 hover:text-rose-300 inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remover</button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <Field label="Nome"><input className={inputCls} value={it.name} onChange={(e) => upd(i, "name", e.target.value)} placeholder="OAT, Instrutor…" /></Field>
            <Field label="Tipo">
              <select className={inputCls} value={it.type} onChange={(e) => upd(i, "type", e.target.value)}>
                <option value="primary">Principal</option>
                <option value="secondary">Secundária</option>
              </select>
            </Field>
            <Field label="Situação">
              <select className={inputCls} value={it.situation} onChange={(e) => upd(i, "situation", e.target.value)}>
                <option value="active">Ativa</option>
                <option value="suspended">Suspensa</option>
                <option value="closed">Encerrada</option>
                <option value="evaluation">Em avaliação</option>
              </select>
            </Field>
            <Field label="Data de início"><input type="date" className={inputCls} value={it.start} onChange={(e) => upd(i, "start", e.target.value)} /></Field>
            <Field label="Data de término"><input type="date" className={inputCls} value={it.end} onChange={(e) => upd(i, "end", e.target.value)} /></Field>
            <Field label="Unidade"><input className={inputCls} value={it.unit} onChange={(e) => upd(i, "unit", e.target.value)} /></Field>
            <Field label="Aeronave / frota"><input className={inputCls} value={it.aircraft} onChange={(e) => upd(i, "aircraft", e.target.value)} /></Field>
            <Field label="Observações" className="sm:col-span-2"><input className={inputCls} value={it.note} onChange={(e) => upd(i, "note", e.target.value)} /></Field>
          </div>
        </div>
      ))}
      <FormActions saving={saving} onCancel={() => {}} />
    </form>
  );
}

// ---- TAB: Licenças ----
function TabLicencas({ oat, isManager, onSaved }) {
  const items = safeParse(oat.licenses, []);
  const [list, setList] = useState(items);
  const [saving, setSaving] = useState(false);
  const addRow = () => setList([...list, { type: "", typeLabel: "", number: "", issue: "", expiry: "", situation: "valid", institution: "", note: "" }]);
  const upd = (i, k, v) => setList(list.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const del = (i) => setList(list.filter((_, j) => j !== i));
  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await base44.entities.Oat.update(oat.id, { licenses: JSON.stringify(list) }); onSaved(); } catch (err) { alert(err?.response?.data?.error || err?.data?.error || err.message || "Erro ao salvar OAT."); } finally { setSaving(false); }
  };
  if (!isManager) {
    return (
      <div className="space-y-2">
        {items.length === 0 ? <p className="text-sm text-slate-500">Nenhuma habilitação cadastrada.</p> : items.map((l, i) => (
          <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-slate-700/30 last:border-0">
            <div><p className="text-slate-200">{l.typeLabel || l.type || "Habilitação"}</p>{l.number && <p className="text-xs text-slate-500">Nº {l.number}</p>}</div>
            {l.expiry && <span className="text-xs text-slate-400">{fmtDate(l.expiry)}</span>}
          </div>
        ))}
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-200">Licenças e Habilitações ({list.length})</h4>
        <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-400 hover:text-amber-300"><Plus className="w-4 h-4" /> Adicionar</button>
      </div>
      {list.map((it, i) => (
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
            <Field label="Concessão"><input type="date" className={inputCls} value={it.issue} onChange={(e) => upd(i, "issue", e.target.value)} /></Field>
            <Field label="Validade"><input type="date" className={inputCls} value={it.expiry} onChange={(e) => upd(i, "expiry", e.target.value)} /></Field>
            <Field label="Autoridade emissora"><input className={inputCls} value={it.institution} onChange={(e) => upd(i, "institution", e.target.value)} /></Field>
            <Field label="Observações" className="sm:col-span-2 lg:col-span-3"><input className={inputCls} value={it.note} onChange={(e) => upd(i, "note", e.target.value)} /></Field>
          </div>
        </div>
      ))}
      <FormActions saving={saving} onCancel={() => {}} />
    </form>
  );
}

// ---- TAB: Certificados ----
function TabCertificados({ oat, isManager, onSaved }) {
  const items = safeParse(oat.certificates, []);
  const [list, setList] = useState(items);
  const [saving, setSaving] = useState(false);
  const addRow = () => setList([...list, { type: "", typeLabel: "", number: "", issue: "", conclusion: "", expiry: "", situation: "valid", institution: "", note: "" }]);
  const upd = (i, k, v) => setList(list.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const del = (i) => setList(list.filter((_, j) => j !== i));
  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await base44.entities.Oat.update(oat.id, { certificates: JSON.stringify(list) }); onSaved(); } catch (err) { alert(err?.response?.data?.error || err?.data?.error || err.message || "Erro ao salvar OAT."); } finally { setSaving(false); }
  };
  if (!isManager) {
    return (
      <div className="space-y-2">
        {items.length === 0 ? <p className="text-sm text-slate-500">Nenhum curso cadastrado.</p> : items.map((c, i) => (
          <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-slate-700/30 last:border-0">
            <div><p className="text-slate-200">{c.typeLabel || c.type || "Curso"}</p>{c.institution && <p className="text-xs text-slate-500">{c.institution}</p>}</div>
            {c.expiry && <span className="text-xs text-slate-400">{fmtDate(c.expiry)}</span>}
          </div>
        ))}
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-200">Certificados e Cursos ({list.length})</h4>
        <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-400 hover:text-amber-300"><Plus className="w-4 h-4" /> Adicionar</button>
      </div>
      {list.map((it, i) => (
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
            <Field label="Realização"><input type="date" className={inputCls} value={it.issue} onChange={(e) => upd(i, "issue", e.target.value)} /></Field>
            <Field label="Conclusão"><input type="date" className={inputCls} value={it.conclusion} onChange={(e) => upd(i, "conclusion", e.target.value)} /></Field>
            <Field label="Vencimento"><input type="date" className={inputCls} value={it.expiry} onChange={(e) => upd(i, "expiry", e.target.value)} /></Field>
            <Field label="Instituição"><input className={inputCls} value={it.institution} onChange={(e) => upd(i, "institution", e.target.value)} /></Field>
            <Field label="Observações" className="sm:col-span-2 lg:col-span-3"><input className={inputCls} value={it.note} onChange={(e) => upd(i, "note", e.target.value)} /></Field>
          </div>
        </div>
      ))}
      <FormActions saving={saving} onCancel={() => {}} />
    </form>
  );
}

// ---- TAB: CMA ----
function TabCMA({ oat, isManager, onSaved }) {
  const cma = safeParse(oat.cma, null);
  const [data, setData] = useState(cma || {});
  const [hasCma, setHasCma] = useState(!!cma);
  const [saving, setSaving] = useState(false);
  const setCma = (k, v) => setData((d) => ({ ...d, [k]: v }));
  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await base44.entities.Oat.update(oat.id, { cma: hasCma ? JSON.stringify(data) : undefined }); onSaved(); } catch (err) { alert(err?.response?.data?.error || err?.data?.error || err.message || "Erro ao salvar OAT."); } finally { setSaving(false); }
  };
  const st = cmaStatus(hasCma ? data : null);
  if (!isManager) {
    return (
      <div className="space-y-3">
        {cma ? (
          <Grid rows={[
            ["Classe", cma.classe], ["Número", cma.number], ["Autoridade", cma.authority],
            ["Emissão", fmtDate(cma.issue)], ["Vencimento", fmtDate(cma.expiry)],
            ["Restrições", cma.restrictions], ["Observações", cma.note],
            ["Situação", st.label],
          ]} />
        ) : <p className="text-sm text-slate-500">Nenhum CMA cadastrado.</p>}
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-200">CMA — Certificado Médico Aeronáutico</h4>
          {hasCma && <p className="text-xs text-slate-500 mt-0.5">Situação atual: <span className="text-amber-300">{st.label}</span></p>}
        </div>
        {!hasCma && (
          <button type="button" onClick={() => { setHasCma(true); setData({ classe: "", number: "", issue: "", expiry: "", restrictions: "", authority: "", note: "" }); }} className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-400 hover:text-amber-300"><Plus className="w-4 h-4" /> Adicionar CMA</button>
        )}
      </div>
      {!hasCma ? (
        <p className="text-sm text-slate-500 py-4 text-center">Nenhum CMA cadastrado.</p>
      ) : (
        <div className="rounded-xl border border-slate-700/60 bg-[#12141A] p-4 space-y-3">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Field label="Classe">
              <select className={inputCls} value={data.classe || ""} onChange={(e) => setCma("classe", e.target.value)}>
                <option value="">Selecione…</option>
                {OAT_CMA_CLASSES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Número"><input className={inputCls} value={data.number || ""} onChange={(e) => setCma("number", e.target.value)} /></Field>
            <Field label="Autoridade emissora"><input className={inputCls} value={data.authority || ""} onChange={(e) => setCma("authority", e.target.value)} /></Field>
            <Field label="Emissão"><input type="date" className={inputCls} value={data.issue || ""} onChange={(e) => setCma("issue", e.target.value)} /></Field>
            <Field label="Vencimento"><input type="date" className={inputCls} value={data.expiry || ""} onChange={(e) => setCma("expiry", e.target.value)} /></Field>
            <Field label="Restrições"><input className={inputCls} value={data.restrictions || ""} onChange={(e) => setCma("restrictions", e.target.value)} /></Field>
            <Field label="Observações" className="sm:col-span-2 lg:col-span-3"><input className={inputCls} value={data.note || ""} onChange={(e) => setCma("note", e.target.value)} /></Field>
          </div>
          <button type="button" onClick={() => { setHasCma(false); setData({}); }} className="text-xs text-rose-400 hover:text-rose-300 inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remover CMA</button>
        </div>
      )}
      <FormActions saving={saving} onCancel={() => {}} />
    </form>
  );
}

// ---- TAB: Aeronaves ----
function TabAeronaves({ oat, isManager, onSaved }) {
  const items = safeParse(oat.aircraft_endorsements, []);
  const [list, setList] = useState(items);
  const [saving, setSaving] = useState(false);
  const addRow = () => setList([...list, { model: "", modelLabel: "", function: "", issue: "", expiry: "", situation: "valid", note: "" }]);
  const upd = (i, k, v) => setList(list.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const del = (i) => setList(list.filter((_, j) => j !== i));
  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await base44.entities.Oat.update(oat.id, { aircraft_endorsements: JSON.stringify(list) }); onSaved(); } catch (err) { alert(err?.response?.data?.error || err?.data?.error || err.message || "Erro ao salvar OAT."); } finally { setSaving(false); }
  };
  if (!isManager) {
    return (
      <div className="space-y-2">
        {items.length === 0 ? <p className="text-sm text-slate-500">Nenhuma aeronave associada.</p> : items.map((e, i) => (
          <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-slate-700/30 last:border-0">
            <div><p className="text-slate-200">{e.modelLabel || e.model || "Aeronave"}</p><p className="text-xs text-slate-500">{e.function || "—"}</p></div>
            {e.expiry && <span className="text-xs text-slate-400">{fmtDate(e.expiry)}</span>}
          </div>
        ))}
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-200">Aeronaves e Endossos ({list.length})</h4>
        <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-400 hover:text-amber-300"><Plus className="w-4 h-4" /> Adicionar</button>
      </div>
      {list.map((it, i) => (
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
            <Field label="Concessão"><input type="date" className={inputCls} value={it.issue} onChange={(e) => upd(i, "issue", e.target.value)} /></Field>
            <Field label="Validade"><input type="date" className={inputCls} value={it.expiry} onChange={(e) => upd(i, "expiry", e.target.value)} /></Field>
            <Field label="Observações" className="sm:col-span-2 lg:col-span-3"><input className={inputCls} value={it.note} onChange={(e) => upd(i, "note", e.target.value)} /></Field>
          </div>
        </div>
      ))}
      <FormActions saving={saving} onCancel={() => {}} />
    </form>
  );
}

// ---- TAB: Documentos ----
function TabDocumentos({ oat, isManager, onSaved }) {
  const items = safeParse(oat.documents, []);
  const [list, setList] = useState(items);
  const [uploading, setUploading] = useState(null);
  const [saving, setSaving] = useState(false);
  const addFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(file.name);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      setList((arr) => [...arr, { category: "", categoryLabel: "", label: file.name, note: "", expiry: "", file_uri, file_name: file.name }]);
    } catch { alert("Erro ao enviar arquivo."); }
    setUploading(null);
    e.target.value = "";
  };
  const upd = (i, k, v) => setList(list.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const del = (i) => setList(list.filter((_, j) => j !== i));
  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await base44.entities.Oat.update(oat.id, { documents: JSON.stringify(list) }); onSaved(); } catch (err) { alert(err?.response?.data?.error || err?.data?.error || err.message || "Erro ao salvar OAT."); } finally { setSaving(false); }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-200">Documentos ({list.length})</h4>
        {isManager && (
          <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border border-dashed border-slate-600 text-sm text-slate-300 hover:border-amber-400/60 hover:text-amber-300">
            <Upload className="w-4 h-4" /> {uploading ? `Enviando ${uploading}…` : "Anexar PDF ou imagem"}
            <input type="file" accept="application/pdf,image/*" className="hidden" onChange={addFile} />
          </label>
        )}
      </div>
      {list.length === 0 && <p className="text-sm text-slate-500">Nenhum documento anexado.</p>}
      {list.map((d, i) => (
        <div key={i} className="rounded-xl border border-slate-700/60 bg-[#12141A] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 truncate"><FileText className="w-3.5 h-3.5 shrink-0" /> {d.file_name || d.label}</span>
            <div className="flex items-center gap-2 shrink-0">
              {d.file_uri && <button type="button" onClick={() => openFile(d.file_uri)} className="text-xs text-amber-400 hover:text-amber-300">Abrir</button>}
              {isManager && <button type="button" onClick={() => del(i)} className="text-xs text-rose-400 hover:text-rose-300 inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> Remover</button>}
            </div>
          </div>
          {isManager && (
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
          )}
        </div>
      ))}
      {isManager && list.length > 0 && <FormActions saving={saving} onCancel={() => {}} />}
    </form>
  );
}

// ---- TAB: Vencimentos ----
function TabVencimentos({ oat }) {
  const expiries = collectExpiries(oat);
  const stats = {
    expired: expiries.filter((e) => daysUntil(e.date) < 0).length,
    "15": expiries.filter((e) => { const d = daysUntil(e.date); return d >= 0 && d <= 15; }).length,
    "30": expiries.filter((e) => { const d = daysUntil(e.date); return d > 15 && d <= 30; }).length,
    "60": expiries.filter((e) => { const d = daysUntil(e.date); return d > 30 && d <= 60; }).length,
    "90": expiries.filter((e) => { const d = daysUntil(e.date); return d > 60 && d <= 90; }).length,
  };
  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200"><AlertTriangle className="w-4 h-4 text-amber-400" /> Controle de Vencimentos</h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { l: "Vencidos", v: stats.expired, c: "rose" },
          { l: "≤ 15 dias", v: stats["15"], c: "orange" },
          { l: "≤ 30 dias", v: stats["30"], c: "amber" },
          { l: "≤ 60 dias", v: stats["60"], c: "yellow" },
          { l: "≤ 90 dias", v: stats["90"], c: "sky" },
        ].map((s) => (
          <div key={s.l} className={`rounded-xl border p-3 text-center ${s.c === "rose" ? "bg-rose-500/10 border-rose-500/30 text-rose-300" : s.c === "orange" ? "bg-orange-500/10 border-orange-500/30 text-orange-300" : s.c === "amber" ? "bg-amber-500/10 border-amber-500/30 text-amber-300" : s.c === "yellow" ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300" : "bg-sky-500/10 border-sky-500/30 text-sky-300"}`}>
            <p className="text-xl font-bold">{s.v}</p>
            <p className="text-[11px] opacity-80">{s.l}</p>
          </div>
        ))}
      </div>
      {expiries.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhum vencimento cadastrado.</p>
      ) : (
        <ul className="space-y-2">
          {expiries.map((e, i) => {
            const d = daysUntil(e.date);
            const st = d < 0 ? "expired" : d <= 15 ? "15" : d <= 30 ? "30" : d <= 60 ? "60" : d <= 90 ? "90" : "ok";
            const c = EXPIRY_COLORS[st];
            return (
              <li key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-700/30 last:border-0">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                  <span className="text-[11px] uppercase tracking-wider text-slate-500">{e.kind}</span>
                  {e.label}
                </span>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${c.pill}`}>{fmtDate(e.date)}{st === "ok" ? "" : ` · ${d < 0 ? "vencido" : d + "d"}`}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ---- TAB: Solicitações ----
function TabSolicitacoes({ oat, isManager, me }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ change_type: "simple", reason: "", changes: "" });

  useEffect(() => {
    base44.entities.OatChangeRequest.filter({ oat_id: oat.id }, "-created_date", 50)
      .then(setRequests).catch(() => setRequests([])).finally(() => setLoading(false));
  }, [oat.id]);

  const submitRequest = async (e) => {
    e.preventDefault();
    const by = me ? me.email || me.id : "desconhecido";
    await base44.entities.OatChangeRequest.create({
      aircraftProfile: oat.aircraftProfile || "AW119",
      oat_id: oat.id, oat_name: oat.full_name, requested_by: by,
      change_type: form.change_type, changes: JSON.stringify({ description: form.changes }),
      reason: form.reason, status: "pending",
    });
    setForm({ change_type: "simple", reason: "", changes: "" });
    setShowForm(false);
    const r = await base44.entities.OatChangeRequest.filter({ oat_id: oat.id }, "-created_date", 50);
    setRequests(r);
  };

  const decide = async (req, status) => {
    const by = me ? me.email || me.id : "desconhecido";
    await base44.entities.OatChangeRequest.update(req.id, { status, reviewed_by: by, reviewed_at: new Date().toISOString() });
    const r = await base44.entities.OatChangeRequest.filter({ oat_id: oat.id }, "-created_date", 50);
    setRequests(r);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-200">Solicitações de Alteração</h4>
        <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-400 hover:text-amber-300">
          <Send className="w-4 h-4" /> Nova solicitação
        </button>
      </div>

      {showForm && (
        <form onSubmit={submitRequest} className="rounded-xl border border-slate-700/60 bg-[#12141A] p-4 space-y-3">
          <Field label="Tipo de alteração">
            <select className={inputCls} value={form.change_type} onChange={(e) => setForm({ ...form, change_type: e.target.value })}>
              {Object.entries(OAT_CHANGE_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>
          <Field label="Descrição da alteração"><textarea className={`${inputCls} min-h-[60px]`} value={form.changes} onChange={(e) => setForm({ ...form, changes: e.target.value })} placeholder="Descreva o que deseja alterar…" /></Field>
          <Field label="Motivo / justificativa"><input className={inputCls} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></Field>
          <button type="submit" className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-400 text-slate-900">Enviar solicitação</button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-amber-500" /></div>
      ) : requests.length === 0 ? (
        <p className="text-sm text-slate-500 py-4 text-center">Nenhuma solicitação registrada.</p>
      ) : (
        <div className="space-y-2">
          {requests.map((r) => (
            <div key={r.id} className="rounded-xl border border-slate-700/60 bg-[#12141A] p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{OAT_CHANGE_TYPE_LABELS[r.change_type]}</span>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                  r.status === "pending" ? "border-amber-500/30 text-amber-300 bg-amber-500/10" :
                  r.status === "approved" ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10" :
                  r.status === "rejected" ? "border-rose-500/30 text-rose-300 bg-rose-500/10" :
                  "border-slate-500/30 text-slate-400 bg-slate-500/10"
                }`}>{OAT_CHANGE_STATUS_LABELS[r.status] || r.status}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Solicitado por {r.requested_by}</p>
              {r.reason && <p className="text-xs text-slate-400 mt-1">Motivo: {r.reason}</p>}
              {isManager && r.status === "pending" && (
                <div className="flex gap-2 mt-2">
                  <button onClick={() => decide(r, "approved")} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25"><CheckCircle2 className="w-3 h-3" /> Aprovar</button>
                  <button onClick={() => decide(r, "rejected")} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25"><X className="w-3 h-3" /> Rejeitar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- TAB: Segurança e Conta ----
function TabSeguranca({ oat, isManager }) {
  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> E-mail de login</h4>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-200">{oat.email_login || "—"}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Utilizado exclusivamente para login. Somente leitura.</p>
          </div>
          <button className="text-xs text-amber-400 hover:text-amber-300">Solicitar alteração</button>
        </div>
      </div>
      <div className="pt-3 border-t border-slate-700/40">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5" /> Senha</h4>
        <p className="text-[11px] text-slate-500">A alteração de senha é feita pelo perfil pessoal do usuário. A senha nunca é exibida ou armazenada em texto.</p>
      </div>
      <div className="pt-3 border-t border-slate-700/40">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><UserCog className="w-3.5 h-3.5" /> Conta</h4>
        <Grid rows={[
          ["Situação da conta", oat.account_status_snapshot || "—"],
          ["Vínculo (user_id)", oat.user_id || "Sem conta vinculada"],
          ["Situação do OAT", OAT_REGISTRATION_STATUS_LABELS[oat.registration_status]],
        ]} />
        <button className="mt-3 text-xs text-rose-400 hover:text-rose-300">Solicitar exclusão da conta</button>
      </div>
    </div>
  );
}

// ---- TAB: Histórico ----
function TabHistorico({ oat }) {
  const log = safeParse(oat.approval_log, []);
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><History className="w-3.5 h-3.5" /> Histórico de alterações</h4>
      {log.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhum evento registrado. Eventos de criação, edição e aprovação serão registrados aqui.</p>
      ) : (
        <div className="space-y-2">
          {log.map((entry, i) => (
            <div key={i} className="flex items-start gap-3 text-sm py-2 border-b border-slate-700/30 last:border-0">
              <Clock className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-slate-300">{entry.action || "—"}</p>
                <p className="text-xs text-slate-500">{entry.actor || "—"} · {fmtDateTime(entry.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="pt-3 border-t border-slate-700/40">
        <p className="text-[11px] text-slate-500 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Eventos críticos (alteração de e-mail, senha, exclusão, aprovação) são registrados em auditoria.
        </p>
      </div>
    </div>
  );
}