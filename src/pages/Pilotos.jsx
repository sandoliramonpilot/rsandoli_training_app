import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Search, Plus, Users, ChevronLeft, Camera, Star, ShieldCheck,
  Clock, AlertTriangle, CheckCircle2, X, Calendar, Phone, Mail,
  MapPin, Building2, Hourglass, FileText, History, ChevronRight,
  CircleUserRound, Loader2, BadgeCheck,
} from "lucide-react";
import {
  ROLE_LABELS, safeParse, collectExpiries, nextCriticalExpiry,
  EXPIRY_COLORS, LICENSE_TYPES, CERTIFICATE_TYPES, DOC_CATEGORIES,
} from "@/lib/pilotUtils";

// user management scope: admins & managers manage everyone; pilots edit only themselves
const MANAGER_ROLES = ["admin", "instructor", "manager"];

export default function Pilotos() {
  const [pilots, setPilots] = useState(null);
  const [me, setMe] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [fRole, setFRole] = useState("all");
  const [fBase, setFBase] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showApprovals, setShowApprovals] = useState(false);
  const [requests, setRequests] = useState([]);

  const isManager = me && MANAGER_ROLES.includes(me.role);

  useEffect(() => {
    base44.auth.me().then((u) => setMe(u)).catch(() => setMe(null));
  }, []);

  const load = async () => {
    const p = await base44.entities.Pilot.list().catch(() => []);
    setPilots(p);
  };
  useEffect(() => { load(); }, []);

  const bases = useMemo(() => {
    if (!pilots) return [];
    return [...new Set(pilots.map((p) => p.base).filter(Boolean))].sort();
  }, [pilots]);

  const filtered = useMemo(() => {
    if (!pilots) return [];
    let list = [...pilots];
    if (fRole !== "all") list = list.filter((p) => p.role === fRole);
    if (fBase !== "all") list = list.filter((p) => p.base === fBase);
    if (fStatus !== "all") list = list.filter((p) => p.status === fStatus);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((p) => [p.full_name, p.war_name, p.registration, p.company].filter(Boolean).join(" ").toLowerCase().includes(q));
    list.sort((a, b) => {
      if (sortBy === "expiry") {
        const ea = nextCriticalExpiry(a)?.days ?? 9999;
        const eb = nextCriticalExpiry(b)?.days ?? 9999;
        return ea - eb;
      }
      return (a.full_name || "").localeCompare(b.full_name || "");
    });
    return list;
  }, [pilots, fRole, fBase, fStatus, query, sortBy]);

  const fromList = selected ? pilots.find((p) => p.id === selected.id) : null;
  const selectedPilot = fromList || selected;

  if (!pilots || !me) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Operações</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
            Cadastro de Pilotos
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Gestão documental, habilitações, vencimentos e experiência operacional.</p>
        </div>
        <div className="flex gap-2">
          {isManager && (
            <button
              onClick={() => { setShowApprovals(true); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-700 text-slate-200 hover:border-amber-500/40 hover:text-amber-300 transition-colors"
            >
              <Hourglass className="w-4 h-4" /> Aprovações
            </button>
          )}
          {isManager && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-400 text-slate-900 transition-colors shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" /> Novo Piloto
            </button>
          )}
        </div>
      </header>

      {selectedPilot ? (
        <PilotDetail
          pilot={selectedPilot}
          me={me}
          isManager={isManager}
          onBack={() => setSelected(null)}
          onRefresh={load}
        />
      ) : (
        <>
          {/* Filters + search */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pesquisar por nome, matrícula…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1A1D25] border border-slate-700/60 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50"
              />
            </div>
            <Select value={fRole} onChange={setFRole} options={[{ v: "all", l: "Todas funções" }, ...Object.entries(ROLE_LABELS).map(([v, l]) => ({ v, l }))]} />
            <Select value={fBase} onChange={setFBase} options={[{ v: "all", l: "Todas bases" }, ...bases.map((b) => ({ v: b, l: b }))]} />
            <Select value={fStatus} onChange={setFStatus} options={[{ v: "all", l: "Todos status" }, { v: "active", l: "Ativo" }, { v: "inactive", l: "Inativo" }]} />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">{filtered.length} piloto(s)</p>
            <button onClick={() => setSortBy(sortBy === "name" ? "expiry" : "name")} className="text-xs font-medium text-amber-400 hover:text-amber-300">
              {sortBy === "name" ? "Ordenar por vencimento" : "Ordenar por nome"} <ChevronRight className="w-3 h-3 inline" />
            </button>
          </div>

          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((p) => {
                const crit = nextCriticalExpiry(p);
                const exp = crit ? EXPIRY_COLORS[crit.status] : EXPIRY_COLORS.none;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className="text-left bg-[#1A1D25] rounded-2xl border border-slate-700/60 hover:border-amber-500/40 transition-colors p-5 hover:shadow-lg hover:shadow-black/30 group"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar pilot={p} size="lg" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-slate-100 truncate">{p.full_name}</h3>
                          {p.approval_status === "pending" && <Hourglass className="w-4 h-4 text-amber-400 shrink-0" />}
                        </div>
                        <p className="text-xs text-amber-400/90 font-medium">{ROLE_LABELS[p.role] || p.role}</p>
                        <p className="text-[11px] text-slate-500 mt-1 truncate">
                          {p.registration ? `Mat. ${p.registration} · ` : ""}{p.base || "Sem base"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700/40">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${p.status === "active" ? "text-emerald-400" : "text-slate-500"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.status === "active" ? "bg-emerald-500" : "bg-slate-500"}`} />
                        {p.status === "active" ? "Ativo" : "Inativo"}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border ${exp.pill}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${exp.dot}`} />
                        {crit ? `${crit.kind} ${crit.label}` : "Sem vencimentos"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {showForm && (
        <PilotForm
          me={me}
          onClose={() => setShowForm(false)}
          onDone={() => { setShowForm(false); load(); }}
        />
      )}

      {showApprovals && (
        <ApprovalsPanel
          requests={requests}
          setRequests={setRequests}
          onClose={() => setShowApprovals(false)}
          onDecision={() => load()}
        />
      )}
    </div>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2.5 rounded-xl bg-[#1A1D25] border border-slate-700/60 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50"
    >
      {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
}

function EmptyState() {
  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 px-6 py-16 text-center">
      <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
      <p className="text-sm text-slate-500">Nenhum piloto encontrado. Use "Novo Piloto" para cadastrar.</p>
    </div>
  );
}

function Avatar({ pilot, size = "md", uri }) {
  const src = uri || pilot?.photo_uri;
  const cls = size === "lg" ? "w-14 h-14 rounded-xl" : "w-16 h-16 rounded-xl";
  return (
    <div className={`${cls} bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shrink-0 overflow-hidden`}>
      {src ? (
        <img src={src} alt={pilot?.full_name || "Foto"} className="w-full h-full object-cover" />
      ) : (
        <CircleUserRound className="w-8 h-8 text-slate-500" />
      )}
    </div>
  );
}

// ---------- PILOT DETAIL ----------
function PilotDetail({ pilot, me, isManager, onBack, onRefresh }) {
  const [editing, setEditing] = useState(null); // 'personal'|'operational'|'licenses'|'certificates'|'docs'
  const hours = safeParse(pilot.hours, {});
  const licenses = safeParse(pilot.licenses, []);
  const certificates = safeParse(pilot.certificates, []);
  const documents = safeParse(pilot.documents, []);
  const expiries = collectExpiries(pilot);

  const stats = {
    expired: expiries.filter((e) => days(e.date) < 0).length,
    "30": expiries.filter((e) => { const d = days(e.date); return d >= 0 && d <= 30; }).length,
    "60": expiries.filter((e) => { const d = days(e.date); return d > 30 && d <= 60; }).length,
    "90": expiries.filter((e) => { const d = days(e.date); return d > 60 && d <= 90; }).length,
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-amber-300 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Voltar à lista
      </button>

      {/* Header card */}
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-6 flex flex-col sm:flex-row gap-5">
        <Avatar pilot={pilot} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-bold text-slate-100">{pilot.full_name}</h2>
            {pilot.war_name && <span className="text-sm text-amber-400/80">"{pilot.war_name}"</span>}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-slate-400">
            <span className="inline-flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-amber-400" /> {ROLE_LABELS[pilot.role] || pilot.role}</span>
            <span className="inline-flex items-center gap-1.5"><Building2 className="w-4 h-4 text-slate-500" /> {pilot.company || "—"}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-500" /> {pilot.base || "—"}</span>
            <span className="inline-flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-500" /> {pilot.email || "—"}</span>
            <span className="inline-flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-500" /> {pilot.phone || "—"}</span>
          </div>
        </div>
        {isManager && (
          <button onClick={() => editing ? setEditing(null) : setEditing("personal")} className="self-start px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 text-slate-200 hover:border-amber-500/40 hover:text-amber-300">
            {editing ? "Concluir" : "Editar"}
          </button>
        )}
      </div>

      {/* Expiry panel */}
      {expiries.length > 0 && (
        <div className="bg-[#12141A] rounded-2xl border border-slate-700/60 p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200 mb-4"><AlertTriangle className="w-4 h-4 text-amber-400" /> Controle de Vencimentos</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <Stat mini color="rose" label="Vencidos" value={stats.expired} />
            <Stat mini color="amber" label="≤ 30 dias" value={stats["30"]} />
            <Stat mini color="yellow" label="≤ 60 dias" value={stats["60"]} />
            <Stat mini color="emerald" label="≤ 90 dias" value={stats["90"]} />
          </div>
          <ul className="space-y-2">
            {expiries.map((e, i) => {
              const d = days(e.date);
              const st = d < 0 ? "expired" : d <= 30 ? "30" : d <= 60 ? "60" : d <= 90 ? "90" : "ok";
              const c = EXPIRY_COLORS[st];
              return (
                <li key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-700/30 last:border-0">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                    <span className="text-[11px] uppercase tracking-wider text-slate-500">{e.kind}</span>
                    {e.label}
                  </span>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${c.pill}`}>{fmt(e.date)}{st === "ok" ? "" : ` · ${c.label}`}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Personal */}
      <Section title="Dados Pessoais" onEdit={isManager ? () => setEditing(editing === "personal" ? null : "personal") : null}>
        {editing === "personal" ? (
          <EditPersonalSections pilot={pilot} onCancel={() => setEditing(null)} onSaved={onRefresh} />
        ) : (
          <Grid rows={[
            ["Nome completo", pilot.full_name], ["Nome de guerra", pilot.war_name], ["Nascimento", fmt(pilot.birth_date)],
            ["CPF", pilot.cpf], ["RG", pilot.rg], ["Matrícula", pilot.registration],
            ["Nacionalidade", pilot.nationality], ["Estado civil", pilot.marital_status], ["Tipo sanguíneo", pilot.blood_type],
            ["Telefone", pilot.phone], ["E-mail", pilot.email], ["Endereço", pilot.address],
          ]} />
        )}
      </Section>

      {/* Operational */}
      <Section title="Dados Operacionais" onEdit={isManager ? () => setEditing(editing === "operational" ? null : "operational") : null}>
        {editing === "operational" ? (
          <EditOperational pilot={pilot} onCancel={() => setEditing(null)} onSaved={onRefresh} />
        ) : (
          <Grid rows={[
            ["Função", ROLE_LABELS[pilot.role] || pilot.role], ["Base operacional", pilot.base], ["Empresa", pilot.company],
            ["Admissão", fmt(pilot.admission_date)], ["Código ANAC", pilot.anac_code], ["Status", pilot.status === "active" ? "Ativo" : "Inativo"],
          ]} />
        )}
      </Section>

      {/* Hours */}
      <Section title="Horas de Voo" onEdit={isManager ? () => setEditing(editing === "hours" ? null : "hours") : null}>
        {editing === "hours" ? (
          <EditHours pilot={pilot} hours={hours} onCancel={() => setEditing(null)} onSaved={onRefresh} />
        ) : (
          <Grid rows={[
            ["Horas totais", hours.total ?? "—"], ["Em helicópteros", hours.rotary ?? "—"], ["No AW119Kx", hours.aw119 ?? "—"],
            ["IFR", hours.ifr ?? "—"], ["NVG", hours.nvg ?? "—"], ["Últimos 30 dias", hours.d30 ?? "—"],
            ["Últimos 90 dias", hours.d90 ?? "—"], ["Últimos 12 meses", hours.d12 ?? "—"],
          ]} />
        )}
      </Section>

      {/* Licenses */}
      <Section title={`Licenças e Habilitações (${licenses.length})`} onEdit={isManager ? () => setEditing(editing === "licenses" ? null : "licenses") : null}>
        {editing === "licenses" ? (
          <EditList
            kind="licenses"
            pilot={pilot}
            types={LICENSE_TYPES}
            onCancel={() => setEditing(null)}
            onSaved={onRefresh}
          />
        ) : licenses.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhuma licença cadastrada.</p>
        ) : (
          <ItemsList
            items={licenses}
            render={(l) => ({
              title: l.typeLabel || l.type || "Licença",
              sub: l.number ? `Nº ${l.number}` : "",
              badge: l.expiry ? { d: days(l.expiry), text: fmt(l.expiry) } : null,
            })}
          />
        )}
      </Section>

      {/* Certificates */}
      <Section title={`Certificados e Cursos (${certificates.length})`} onEdit={isManager ? () => setEditing(editing === "certificates" ? null : "certificates") : null}>
        {editing === "certificates" ? (
          <EditList
            kind="certificates"
            pilot={pilot}
            types={CERTIFICATE_TYPES}
            onCancel={() => setEditing(null)}
            onSaved={onRefresh}
          />
        ) : certificates.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum curso cadastrado.</p>
        ) : (
          <ItemsList
            items={certificates}
            render={(c) => ({
              title: c.typeLabel || c.type || "Curso",
              sub: c.institution ? c.institution : "",
              badge: c.expiry ? { d: days(c.expiry), text: fmt(c.expiry) } : null,
            })}
          />
        )}
      </Section>

      {/* Documents */}
      <Section title={`Documentos (${documents.length})`} onEdit={isManager ? () => setEditing(editing === "docs" ? null : "docs") : null}>
        {editing === "docs" ? (
          <EditDocuments pilot={pilot} onCancel={() => setEditing(null)} onSaved={onRefresh} />
        ) : documents.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum documento anexado.</p>
        ) : (
          <ItemsList
            items={documents}
            render={(d) => ({
              title: d.label || d.categoryLabel || "Documento",
              sub: d.note || "",
              badge: d.expiry ? { d: days(d.expiry), text: fmt(d.expiry) } : null,
              action: d.file_uri ? { label: "Abrir", onClick: () => openFile(d.file_uri) } : null,
            })}
          />
        )}
      </Section>
    </div>
  );
}

function days(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  const now = new Date(); now.setHours(0,0,0,0); d.setHours(0,0,0,0);
  return Math.round((d - now) / 86400000);
}
function fmt(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("pt-BR");
}
async function openFile(file_uri) {
  try {
    const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri });
    window.open(signed_url, "_blank");
  } catch { alert("Não foi possível abrir o arquivo."); }
}

function Section({ title, onEdit, children }) {
  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#12141A] border-b border-slate-700/60">
        <h3 className="font-semibold text-sm text-slate-200">{title}</h3>
        {onEdit && (
          <button onClick={onEdit} className="text-xs font-medium text-amber-400 hover:text-amber-300">
            {onEdit ? "Editar" : ""}
          </button>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
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

function ItemsList({ items, render }) {
  return (
    <div className="space-y-2">
      {items.map((it, i) => {
        const r = render(it);
        const c = r.badge ? EXPIRY_COLORS[r.badge.d < 0 ? "expired" : r.badge.d <= 30 ? "30" : r.badge.d <= 60 ? "60" : r.badge.d <= 90 ? "90" : "ok"] : EXPIRY_COLORS.none;
        return (
          <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-slate-700/30 last:border-0">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{r.title}</p>
              {r.sub && <p className="text-xs text-slate-500 truncate">{r.sub}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {r.badge && <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${c.pill}`}>{r.badge.text}</span>}
              {r.action && (
                <button onClick={r.action.onClick} className="text-xs font-medium text-amber-400 hover:text-amber-300">{r.action.label}</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Stat({ mini, color, label, value }) {
  const map = { rose: "from-rose-500/20 border-rose-500/30 text-rose-300", amber: "from-amber-500/20 border-amber-500/30 text-amber-300", yellow: "from-yellow-500/20 border-yellow-500/30 text-yellow-300", emerald: "from-emerald-500/20 border-emerald-500/30 text-emerald-300" };
  return (
    <div className={`rounded-xl border bg-gradient-to-br ${map[color]} to-transparent p-3 text-center`}>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-[11px] opacity-80">{label}</p>
    </div>
  );
}

// ---------- FORMS (editing sections) ----------
function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-400 mb-1">{label}</span>
      {children}
    </label>
  );
}
const inputCls = "w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50";

// Saves edit of pilot fields; uses change-request flow for non-managers
async function savePilotUpdate({ me, pilotId, changes, fields }) {
  if (fields) {
    const patch = {};
    Object.entries(fields).forEach(([k, v]) => { if (v !== undefined) patch[k] = v; });
    await base44.entities.Pilot.update(pilotId, patch);
  }
}

function EditPersonalSections({ pilot, onCancel, onSaved }) {
  const [f, setF] = useState(() => ({
    full_name: pilot.full_name || "", war_name: pilot.war_name || "", birth_date: pilot.birth_date || "",
    cpf: pilot.cpf || "", rg: pilot.rg || "", registration: pilot.registration || "",
    nationality: pilot.nationality || "", marital_status: pilot.marital_status || "", blood_type: pilot.blood_type || "",
    phone: pilot.phone || "", email: pilot.email || "", address: pilot.address || "",
  }));
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await savePilotUpdate({ pilotId: pilot.id, fields: f });
      onSaved(); onCancel();
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Field label="Nome completo"><input className={inputCls} value={f.full_name} onChange={set("full_name")} /></Field>
        <Field label="Nome de guerra"><input className={inputCls} value={f.war_name} onChange={set("war_name")} /></Field>
        <Field label="Nascimento"><input type="date" className={inputCls} value={f.birth_date} onChange={set("birth_date")} /></Field>
        <Field label="CPF"><input className={inputCls} value={f.cpf} onChange={set("cpf")} /></Field>
        <Field label="RG"><input className={inputCls} value={f.rg} onChange={set("rg")} /></Field>
        <Field label="Matrícula"><input className={inputCls} value={f.registration} onChange={set("registration")} /></Field>
        <Field label="Nacionalidade"><input className={inputCls} value={f.nationality} onChange={set("nationality")} /></Field>
        <Field label="Estado civil"><input className={inputCls} value={f.marital_status} onChange={set("marital_status")} /></Field>
        <Field label="Tipo sanguíneo"><input className={inputCls} value={f.blood_type} onChange={set("blood_type")} /></Field>
        <Field label="Telefone"><input className={inputCls} value={f.phone} onChange={set("phone")} /></Field>
        <Field label="E-mail"><input className={inputCls} value={f.email} onChange={set("email")} /></Field>
        <Field label="Endereço"><input className={inputCls} value={f.address} onChange={set("address")} /></Field>
      </div>
      <FormActions saving={saving} onCancel={onCancel} />
    </form>
  );
}

function EditOperational({ pilot, onCancel, onSaved }) {
  const [f, setF] = useState(() => ({ role: pilot.role || "copilot", base: pilot.base || "", company: pilot.company || "", admission_date: pilot.admission_date || "", anac_code: pilot.anac_code || "", status: pilot.status || "active" }));
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const [saving, setSaving] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await savePilotUpdate({ pilotId: pilot.id, fields: f }); onSaved(); onCancel(); } finally { setSaving(false); }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Field label="Função"><select className={inputCls} value={f.role} onChange={set("role")}>{Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
        <Field label="Base operacional"><input className={inputCls} value={f.base} onChange={set("base")} /></Field>
        <Field label="Empresa"><input className={inputCls} value={f.company} onChange={set("company")} /></Field>
        <Field label="Admissão"><input type="date" className={inputCls} value={f.admission_date} onChange={set("admission_date")} /></Field>
        <Field label="Código ANAC"><input className={inputCls} value={f.anac_code} onChange={set("anac_code")} /></Field>
        <Field label="Status"><select className={inputCls} value={f.status} onChange={set("status")}><option value="active">Ativo</option><option value="inactive">Inativo</option></select></Field>
      </div>
      <FormActions saving={saving} onCancel={onCancel} />
    </form>
  );
}

function EditHours({ pilot, hours, onCancel, onSaved }) {
  const keys = [["total", "Horas totais"], ["rotary", "Em helicópteros"], ["aw119", "No AW119Kx"], ["ifr", "IFR"], ["nvg", "NVG"], ["d30", "Últimos 30 dias"], ["d90", "Últimos 90 dias"], ["d12", "Últimos 12 meses"]];
  const [f, setF] = useState(() => Object.fromEntries(keys.map(([k]) => [k, hours[k] ?? ""])));
  const [saving, setSaving] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const clean = Object.fromEntries(keys.map(([k]) => [k, f[k] === "" ? 0 : Number(f[k])]));
      await savePilotUpdate({ pilotId: pilot.id, fields: { hours: JSON.stringify({ ...hours, ...clean }) } });
      onSaved(); onCancel();
    } finally { setSaving(false); }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {keys.map(([k, l]) => (
          <Field key={k} label={l}><input type="number" min="0" className={inputCls} value={f[k]} onChange={(e) => setF((p) => ({ ...p, [k]: e.target.value }))} /></Field>
        ))}
      </div>
      <FormActions saving={saving} onCancel={onCancel} />
    </form>
  );
}

function EditList({ kind, pilot, types, onCancel, onSaved }) {
  const [items, setItems] = useState(() => safeParse(pilot[kind], []));
  const [saving, setSaving] = useState(false);

  const addRow = () => setItems((p) => [...p, { type: "", typeLabel: "", number: "", issue: "", expiry: "", institution: "", note: "" }]);
  const upd = (i, k, v) => setItems((arr) => arr.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const del = (i) => setItems((arr) => arr.filter((_, j) => j !== i));

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const clean = items.filter((x) => x.type || x.typeLabel || x.number || x.expiry);
      for (const it of clean) {
        if (it.type) {
          const tl = (types.find((t) => t.id === it.type) || {}).label;
          if (tl) it.typeLabel = tl;
        }
      }
      await savePilotUpdate({ pilotId: pilot.id, fields: { [kind]: JSON.stringify(clean) } });
      onSaved(); onCancel();
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {items.length === 0 && <p className="text-sm text-slate-500">Nenhum item — adicione abaixo.</p>}
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border border-slate-700/60 bg-[#12141A] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Item {i + 1}</span>
            <button type="button" onClick={() => del(i)} className="text-xs text-rose-400 hover:text-rose-300">Remover</button>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            <Field label="Tipo">
              <select className={inputCls} value={it.type} onChange={(e) => upd(i, "type", e.target.value)}>
                <option value="">Selecione…</option>
                {types.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Número"><input className={inputCls} value={it.number} onChange={(e) => upd(i, "number", e.target.value)} /></Field>
            <Field label="Emissão"><input type="date" className={inputCls} value={it.issue} onChange={(e) => upd(i, "issue", e.target.value)} /></Field>
            <Field label="Vencimento"><input type="date" className={inputCls} value={it.expiry} onChange={(e) => upd(i, "expiry", e.target.value)} /></Field>
            <Field label="Instituição"><input className={inputCls} value={it.institution} onChange={(e) => upd(i, "institution", e.target.value)} /></Field>
            <Field label="Observações"><input className={inputCls} value={it.note} onChange={(e) => upd(i, "note", e.target.value)} /></Field>
          </div>
        </div>
      ))}
      <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-400 hover:text-amber-300">
        <Plus className="w-4 h-4" /> Adicionar item
      </button>
      <FormActions saving={saving} onCancel={onCancel} />
    </form>
  );
}

function EditDocuments({ pilot, onCancel, onSaved }) {
  const [items, setItems] = useState(() => safeParse(pilot.documents, []));
  const [uploading, setUploading] = useState(null);
  const [saving, setSaving] = useState(false);

  const addFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(file.name);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      setItems((arr) => [...arr, { category: "", categoryLabel: "", label: file.name, note: "", expiry: "", file_uri, file_name: file.name }]);
    } catch { alert("Erro ao enviar arquivo."); }
    setUploading(null);
    e.target.value = "";
  };

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const clean = items.filter((x) => x.category || x.label);
      for (const d of clean) {
        if (d.category) {
          const cl = (DOC_CATEGORIES.find((c) => c.id === d.category) || {}).label;
          if (cl) d.categoryLabel = cl;
        }
      }
      await savePilotUpdate({ pilotId: pilot.id, fields: { documents: JSON.stringify(clean) } });
      onSaved(); onCancel();
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border border-dashed border-slate-600 text-sm text-slate-300 hover:border-amber-400/60 hover:text-amber-300">
          <UploadIcon /> {uploading ? `Enviando ${uploading}…` : "Anexar PDF ou imagem"}
          <input type="file" accept="application/pdf,image/*" className="hidden" onChange={addFile} />
        </label>
      </div>
      {items.length === 0 && <p className="text-sm text-slate-500">Nenhum documento anexado.</p>}
      {items.map((d, i) => (
        <div key={i} className="rounded-xl border border-slate-700/60 bg-[#12141A] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 truncate"><FileText className="w-3.5 h-3.5 shrink-0" /> {d.file_name || d.label}</span>
            <button type="button" onClick={() => setItems((arr) => arr.filter((_, j) => j !== i))} className="text-xs text-rose-400 hover:text-rose-300 shrink-0">Remover</button>
          </div>
          <div className="grid sm:grid-cols-3 gap-2">
            <Field label="Categoria">
              <select className={inputCls} value={d.category} onChange={(e) => setItems((arr) => arr.map((x, j) => j === i ? { ...x, category: e.target.value } : x))}>
                <option value="">Selecione…</option>
                {DOC_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Vencimento"><input type="date" className={inputCls} value={d.expiry} onChange={(e) => setItems((arr) => arr.map((x, j) => j === i ? { ...x, expiry: e.target.value } : x))} /></Field>
            <Field label="Observação"><input className={inputCls} value={d.note} onChange={(e) => setItems((arr) => arr.map((x, j) => j === i ? { ...x, note: e.target.value } : x))} /></Field>
          </div>
        </div>
      ))}
      <FormActions saving={saving} onCancel={onCancel} />
    </form>
  );
}

function UploadIcon() { return <FileText className="w-4 h-4" />; }

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

// ---------- NEW PILOT FORM ----------
function PilotForm({ me, onClose, onDone }) {
  const [f, setF] = useState({ full_name: "", war_name: "", registration: "", role: "copilot", base: "", company: "", email: "", phone: "", status: "active" });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    if (!f.full_name) return;
    setSaving(true);
    try {
      await base44.entities.Pilot.create({ ...f, approval_status: "approved" });
      onDone();
    } finally { setSaving(false); }
  };
  return (
    <Modal onClose={onClose} title="Novo Piloto">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Nome completo *"><input className={inputCls} value={f.full_name} onChange={set("full_name")} /></Field>
          <Field label="Nome de guerra"><input className={inputCls} value={f.war_name} onChange={set("war_name")} /></Field>
          <Field label="Matrícula"><input className={inputCls} value={f.registration} onChange={set("registration")} /></Field>
          <Field label="Função"><select className={inputCls} value={f.role} onChange={set("role")}>{Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
          <Field label="Base operacional"><input className={inputCls} value={f.base} onChange={set("base")} /></Field>
          <Field label="Empresa"><input className={inputCls} value={f.company} onChange={set("company")} /></Field>
          <Field label="E-mail"><input className={inputCls} value={f.email} onChange={set("email")} /></Field>
          <Field label="Telefone"><input className={inputCls} value={f.phone} onChange={set("phone")} /></Field>
        </div>
        <FormActions saving={saving} onCancel={onClose} />
      </form>
    </Modal>
  );
}

function Modal({ onClose, title, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-[#1A1D25] w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-2xl border border-slate-700/60 max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1A1D25]/95 backdrop-blur px-6 py-4 border-b border-slate-700/60 flex items-center justify-between">
          <h2 className="font-semibold text-lg text-slate-100">{title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700/40"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ---------- APPROVALS ----------
const REQUEST_MANAGER_MAP = { admin: "admin", instructor: "instructor", manager: "manager" };

function ApprovalsPanel({ requests, setRequests, onClose, onDecision }) {
  useEffect(() => {
    base44.entities.PilotChangeRequest.list("-created_date", 100).then((r) => setRequests(r)).catch(() => setRequests([]));
  }, []);

  const decide = async (req, status) => {
    const me = await base44.auth.me().catch(() => null);
    const by = me ? me.email || me.id : "desconhecido";
    await base44.entities.PilotChangeRequest.update(req.id, {
      status, reviewed_by: by, reviewed_at: new Date().toISOString(),
    });
    // apply approved changes
    if (status === "approved") {
      const changes = safeParse(req.changes, {});
      let patch = {};
      if (changes.fields) {
        patch = changes.fields;
        if (changes.fields.hours) patch.hours = JSON.stringify(changes.fields.hours);
        if (changes.fields.licenses) patch.licenses = JSON.stringify(changes.fields.licenses);
        if (changes.fields.certificates) patch.certificates = JSON.stringify(changes.fields.certificates);
        if (changes.fields.documents) patch.documents = JSON.stringify(changes.fields.documents);
      }
      if (Object.keys(patch).length) await base44.entities.Pilot.update(req.pilot_id, { ...patch, approval_status: "approved" });
    }
    setRequests((r) => r.map((x) => x.id === req.id ? { ...x, status } : x));
    onDecision();
  };

  return (
    <Modal onClose={onClose} title="Fluxo de Aprovação">
      {requests.length === 0 ? (
        <p className="text-sm text-slate-500 py-6 text-center">Nenhuma alteração pendente.</p>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const changes = safeParse(r.changes, {});
            return (
              <div key={r.id} className="rounded-xl border border-slate-700/60 bg-[#12141A] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-200">{r.pilot_name}</p>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${r.status === "pending" ? "border-amber-500/30 text-amber-300 bg-amber-500/10" : r.status === "approved" ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10" : "border-rose-500/30 text-rose-300 bg-rose-500/10"}`}>
                    {r.status === "pending" ? "Pendente" : r.status === "approved" ? "Aprovado" : "Rejeitado"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Solicitado por {r.requested_by}</p>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2">{(changes.fields && Object.keys(changes.fields).join(", ")) || "Campos alterados"}</p>
                {r.status === "pending" && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => decide(r, "approved")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Aprovar
                    </button>
                    <button onClick={() => decide(r, "rejected")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25">
                      <X className="w-3.5 h-3.5" /> Rejeitar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}