import React, { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, X, Plane, Clock, Search, Trash2, Edit3 } from "lucide-react";

const FLIGHT_TYPE_LABELS = {
  private: "Privado", instruction: "Instrução", charter: "Táxi aéreo",
  ems: "Aeromédico", vip: "VIP", photo: "Fotografia", maintenance: "Manutenção", other: "Outro",
};

const ROLE_LABELS = {
  comandante: "Piloto em Comando",
  instrutor: "Instrutor de Voo",
  instrucao: "Piloto em Instrução",
  single_pilot: "Copiloto em Operação Single Pilot",
  single_pilot_copiloto: "Copiloto em Operação Single Pilot com Copiloto, por questões regulamentares",
};

function fmtHours(min) {
  if (!min && min !== 0) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
}

function calcMinutes(dep, arr) {
  if (!dep || !arr) return 0;
  const [dh, dm] = dep.split(":").map(Number);
  const [ah, am] = arr.split(":").map(Number);
  let mins = (ah * 60 + am) - (dh * 60 + dm);
  if (mins < 0) mins += 24 * 60;
  return mins;
}

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  aircraft_id: "",
  pilot_name: "",
  pilot_role: "",
  copilot_name: "",
  copilot_role: "",
  departure_location: "",
  arrival_location: "",
  departure_time: "",
  arrival_time: "",
  flight_time_minutes: 0,
  day_time_minutes: 0,
  night_time_minutes: 0,
  ifr_time_minutes: 0,
  flight_type: "private",
  landings: 1,
  night_flight: false,
  ifr: false,
  fuel_uplift_liters: "",
  notes: "",
};

function toInt(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export default function FlightLog() {
  const [flights, setFlights] = useState(null);
  const [aircraft, setAircraft] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [f, a] = await Promise.all([
      base44.entities.FlightLog.list("-date", 500).catch(() => []),
      base44.entities.Aircraft.list().catch(() => []),
    ]);
    setFlights(f);
    setAircraft(a);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!flights) return [];
    const q = query.trim().toLowerCase();
    if (!q) return flights;
    return flights.filter((f) =>
      [f.pilot_name, f.copilot_name, f.departure_location, f.arrival_location, f.aircraft_registration, f.flight_type, f.date]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [flights, query]);

  const totalMinutes = filtered.reduce((s, f) => s + (f.flight_time_minutes || 0), 0);

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm, aircraft_id: aircraft[0]?.id || "" });
    setShowForm(true);
  };

  const openEdit = (f) => {
    setEditing(f);
    setForm({
      date: f.date || new Date().toISOString().slice(0, 10),
      aircraft_id: f.aircraft_id || "",
      pilot_name: f.pilot_name || "",
      pilot_role: f.pilot_role || "",
      copilot_name: f.copilot_name || "",
      copilot_role: f.copilot_role || "",
      departure_location: f.departure_location || "",
      arrival_location: f.arrival_location || "",
      departure_time: f.departure_time || "",
      arrival_time: f.arrival_time || "",
      flight_time_minutes: f.flight_time_minutes || 0,
      day_time_minutes: f.day_time_minutes || 0,
      night_time_minutes: f.night_time_minutes || 0,
      ifr_time_minutes: f.ifr_time_minutes || 0,
      flight_type: f.flight_type || "private",
      landings: f.landings ?? 1,
      night_flight: !!f.night_flight,
      ifr: !!f.ifr,
      fuel_uplift_liters: f.fuel_uplift_liters ?? "",
      notes: f.notes || "",
    });
    setShowForm(true);
  };

  const onField = (k, v) => {
    setForm((prev) => {
      const next = { ...prev, [k]: v };
      if (k === "departure_time" || k === "arrival_time") {
        next.flight_time_minutes = calcMinutes(next.departure_time, next.arrival_time);
      }
      return next;
    });
  };

  const remove = async (f) => {
    if (!confirm("Excluir este registro de voo?")) return;
    await base44.entities.FlightLog.delete(f.id);
    await load();
  };

  if (!flights) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-sky-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-sky-600 font-semibold">Registros</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">Diário de Bordo</h1>
          <p className="text-slate-500 mt-2 text-sm">{filtered.length} voos · {fmtHours(totalMinutes)} no total filtrado</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Novo voo
        </button>
      </header>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por piloto, rota, matrícula…"
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Plane className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Nenhum voo encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-400 bg-slate-50/70">
                  <th className="px-5 py-3 font-medium">Data</th>
                  <th className="px-5 py-3 font-medium">Rota</th>
                  <th className="px-5 py-3 font-medium">Aeronave</th>
                  <th className="px-5 py-3 font-medium">Tripulação</th>
                  <th className="px-5 py-3 font-medium">Tipo</th>
                  <th className="px-5 py-3 font-medium text-right">Tempo</th>
                  <th className="px-5 py-3 font-medium text-right">Pousos</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/60 transition-colors align-top">
                    <td className="px-5 py-3 whitespace-nowrap text-slate-600">{f.date ? new Date(f.date).toLocaleDateString("pt-BR") : "—"}</td>
                    <td className="px-5 py-3">
                      <span className="text-slate-900 font-medium">{f.departure_location || "—"}</span>
                      <span className="text-slate-300 mx-1.5">→</span>
                      <span className="text-slate-900 font-medium">{f.arrival_location || "—"}</span>
                      {(f.night_flight || f.ifr) && (
                        <span className="ml-2 inline-flex gap-1">
                          {f.night_flight && <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-medium">NOT</span>}
                          {f.ifr && <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 font-medium">IFR</span>}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{f.aircraft_registration || "—"}</td>
                    <td className="px-5 py-3">
                      <div className="space-y-0.5">
                        <div className="text-slate-900 whitespace-nowrap">{f.pilot_name || "—"}</div>
                        {f.pilot_role && <div className="text-[11px] text-sky-600">{ROLE_LABELS[f.pilot_role]}</div>}
                        {f.copilot_name && (
                          <div className="text-slate-500 whitespace-nowrap text-xs">{f.copilot_name}{f.copilot_role ? ` · ${ROLE_LABELS[f.copilot_role]}` : ""}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{FLIGHT_TYPE_LABELS[f.flight_type] || "—"}</td>
                    <td className="px-5 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">{fmtHours(f.flight_time_minutes)}</td>
                    <td className="px-5 py-3 text-right text-slate-600 whitespace-nowrap">{f.landings ?? "—"}</td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <button onClick={() => openEdit(f)} className="p-1.5 text-slate-400 hover:text-sky-600 rounded-md hover:bg-sky-50 transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => remove(f)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <FlightForm
          form={form}
          aircraft={aircraft}
          editing={editing}
          saving={saving}
          onField={onField}
          onClose={() => setShowForm(false)}
          onSubmit={async (payload) => {
            setSaving(true);
            try {
              if (editing) await base44.entities.FlightLog.update(editing.id, payload);
              else await base44.entities.FlightLog.create(payload);
              setShowForm(false);
              await load();
            } finally {
              setSaving(false);
            }
          }}
        />
      )}
    </div>
  );
}

function FlightForm({ form, aircraft, editing, saving, onField, onClose, onSubmit }) {
  const [error, setError] = useState("");

  const total = toInt(form.flight_time_minutes);
  const day = toInt(form.day_time_minutes);
  const night = toInt(form.night_time_minutes);
  const ifr = toInt(form.ifr_time_minutes);
  const sumDayNight = day + night;
  const sumMismatch = sumDayNight !== total;
  const ifrExceeds = ifr > total;

  const hasCopilot = !!form.copilot_name?.trim();
  const hasPilot = !!form.pilot_name?.trim();

  const validate = () => {
    if (hasPilot && !form.pilot_role) {
      return 'Campo obrigatório: "Função a bordo" do piloto.';
    }
    if (hasCopilot && !form.copilot_role) {
      return 'Campo obrigatório: "Função a bordo" do copiloto.';
    }
    if (total <= 0) {
      return 'Campo obrigatório: "Tempo total de voo" deve ser maior que zero.';
    }
    if (sumMismatch) {
      return `Inconsistência: diurno (${day}) + noturno (${night}) = ${sumDayNight} min, diferente do total (${total} min).`;
    }
    if (ifrExceeds) {
      return `Inconsistência: tempo IFR (${ifr} min) superior ao tempo total (${total} min).`;
    }
    return "";
  };

  const save = (e) => {
    e.preventDefault();
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setError("");
    const ac = aircraft.find((a) => a.id === form.aircraft_id);
    const payload = {
      ...form,
      aircraft_registration: ac?.registration || "",
      landings: Number(form.landings) || 1,
      flight_time_minutes: total,
      day_time_minutes: day,
      night_time_minutes: night,
      ifr_time_minutes: ifr,
      fuel_uplift_liters: form.fuel_uplift_liters === "" ? null : Number(form.fuel_uplift_liters),
      pilot_role: hasPilot ? form.pilot_role : null,
      copilot_role: hasCopilot ? form.copilot_role : null,
    };
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white/95 backdrop-blur px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-lg text-slate-900">{editing ? "Editar voo" : "Novo voo"}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={save} className="px-6 py-5 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Data *">
              <input type="date" required value={form.date} onChange={(e) => onField("date", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Aeronave *">
              <select required value={form.aircraft_id} onChange={(e) => onField("aircraft_id", e.target.value)} className={inputCls}>
                <option value="">Selecione…</option>
                {aircraft.map((a) => (
                  <option key={a.id} value={a.id}>{a.registration} — {a.model}</option>
                ))}
              </select>
            </Field>
            <Field label="Piloto *">
              <input required value={form.pilot_name} onChange={(e) => onField("pilot_name", e.target.value)} className={inputCls} placeholder="Nome do piloto" />
            </Field>
            <Field label="Função a bordo do piloto *">
              <select required value={form.pilot_role} onChange={(e) => onField("pilot_role", e.target.value)} className={inputCls}>
                <option value="">Selecione…</option>
                {Object.entries(ROLE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Copiloto">
              <input value={form.copilot_name} onChange={(e) => onField("copilot_name", e.target.value)} className={inputCls} placeholder="Opcional" />
            </Field>
            <Field label={hasCopilot ? "Função a bordo do copiloto *" : "Função a bordo do copiloto"}>
              <select value={form.copilot_role} onChange={(e) => onField("copilot_role", e.target.value)} className={inputCls} required={hasCopilot}>
                <option value="">Selecione…</option>
                {Object.entries(ROLE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Origem *">
              <input required value={form.departure_location} onChange={(e) => onField("departure_location", e.target.value)} className={inputCls} placeholder="SBSP / local" />
            </Field>
            <Field label="Destino *">
              <input required value={form.arrival_location} onChange={(e) => onField("arrival_location", e.target.value)} className={inputCls} placeholder="SBGR / local" />
            </Field>
            <Field label="Decolagem (HH:MM)">
              <input type="time" value={form.departure_time} onChange={(e) => onField("departure_time", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Pouso (HH:MM)">
              <input type="time" value={form.arrival_time} onChange={(e) => onField("arrival_time", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Tipo de voo">
              <select value={form.flight_type} onChange={(e) => onField("flight_type", e.target.value)} className={inputCls}>
                {Object.entries(FLIGHT_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Pousos">
              <input type="number" min="0" value={form.landings} onChange={(e) => onField("landings", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Combustível abastecido (L)">
              <input type="number" step="0.1" value={form.fuel_uplift_liters} onChange={(e) => onField("fuel_uplift_liters", e.target.value)} className={inputCls} placeholder="Opcional" />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <Field label="Tempo total de voo (min) *">
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="number" min="0" value={form.flight_time_minutes} onChange={(e) => onField("flight_time_minutes", e.target.value)} className={inputCls + " pl-9"} />
              </div>
            </Field>
            <div className="hidden sm:block" />
            <Field label="Tempo de voo diurno (min)">
              <input type="number" min="0" value={form.day_time_minutes} onChange={(e) => onField("day_time_minutes", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Tempo de voo noturno (min)">
              <input type="number" min="0" value={form.night_time_minutes} onChange={(e) => onField("night_time_minutes", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Tempo de voo IFR (min)">
              <input type="number" min="0" value={form.ifr_time_minutes} onChange={(e) => onField("ifr_time_minutes", e.target.value)} className={inputCls} />
            </Field>
            <div className="text-[11px] text-slate-500 self-end sm:col-span-1">
              Soma diurno + noturno: <strong className={sumMismatch ? "text-rose-600" : "text-emerald-600"}>{sumDayNight} min</strong> · IFR: <strong className={ifrExceeds ? "text-rose-600" : "text-slate-700"}>{ifr} min</strong>
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.night_flight} onChange={(e) => onField("night_flight", e.target.checked)} className="w-4 h-4 rounded accent-sky-600" />
              Voo noturno
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.ifr} onChange={(e) => onField("ifr", e.target.checked)} className="w-4 h-4 rounded accent-sky-600" />
              IFR
            </label>
          </div>

          <Field label="Observações">
            <textarea value={form.notes} onChange={(e) => onField("notes", e.target.value)} rows={3} className={inputCls} placeholder="Notas do voo, condições, etc." />
          </Field>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">{error}</div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors">
              {saving ? "Salvando…" : "Salvar voo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls = "w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-600 mb-1.5">{label}</span>
      {children}
    </label>
  );
}