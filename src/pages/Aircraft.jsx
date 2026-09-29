import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, X, Plane, Trash2, Edit3, Wrench, CheckCircle2, AlertTriangle } from "lucide-react";

const STATUS = {
  available: { label: "Disponível", color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  in_maintenance: { label: "Em manutenção", color: "text-amber-700 bg-amber-50 border-amber-200", icon: Wrench },
  grounded: { label: "Aterrissada", color: "text-rose-700 bg-rose-50 border-rose-200", icon: AlertTriangle },
};

const emptyForm = {
  registration: "",
  model: "",
  manufacturer: "",
  year: "",
  total_hours: 0,
  status: "available",
  notes: "",
};

export default function Aircraft() {
  const [aircraft, setAircraft] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => setAircraft(await base44.entities.Aircraft.list().catch(() => []));
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (a) => {
    setEditing(a);
    setForm({
      registration: a.registration || "",
      model: a.model || "",
      manufacturer: a.manufacturer || "",
      year: a.year ?? "",
      total_hours: a.total_hours ?? 0,
      status: a.status || "available",
      notes: a.notes || "",
    });
    setShowForm(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.registration || !form.model) return;
    setSaving(true);
    const payload = {
      ...form,
      year: form.year === "" ? null : Number(form.year),
      total_hours: Number(form.total_hours) || 0,
    };
    try {
      if (editing) await base44.entities.Aircraft.update(editing.id, payload);
      else await base44.entities.Aircraft.create(payload);
      setShowForm(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (a) => {
    if (!confirm(`Excluir a aeronave ${a.registration}?`)) return;
    await base44.entities.Aircraft.delete(a.id);
    await load();
  };

  if (!aircraft) {
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
          <p className="text-xs uppercase tracking-widest text-sky-600 font-semibold">Frota</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">Aeronaves</h1>
          <p className="text-slate-500 mt-2 text-sm">{aircraft.length} helicóptero(s) cadastrado(s)</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Nova aeronave
        </button>
      </header>

      {aircraft.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm px-6 py-16 text-center">
          <Plane className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Nenhuma aeronave cadastrada.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {aircraft.map((a) => {
            const st = STATUS[a.status] || STATUS.available;
            const StIcon = st.icon;
            return (
              <div key={a.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-bold tracking-tight text-slate-900">{a.registration || "—"}</p>
                    <p className="text-sm text-slate-500">{a.model || "—"}</p>
                    {a.manufacturer && <p className="text-xs text-slate-400 mt-0.5">{a.manufacturer}{a.year ? ` · ${a.year}` : ""}</p>}
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${st.color}`}>
                    <StIcon className="w-3.5 h-3.5" />
                    {st.label}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Total de horas</p>
                    <p className="font-semibold text-slate-900">{(a.total_hours || 0).toFixed(1)}h</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(a)} className="p-2 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-sky-50 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => remove(a)} className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {a.notes && <p className="mt-3 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">{a.notes}</p>}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <AircraftForm form={form} editing={editing} saving={saving} onField={(k, v) => setForm((p) => ({ ...p, [k]: v }))} onClose={() => setShowForm(false)} onSave={save} />
      )}
    </div>
  );
}

function AircraftForm({ form, editing, saving, onField, onClose, onSave }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white/95 backdrop-blur px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-lg text-slate-900">{editing ? "Editar aeronave" : "Nova aeronave"}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSave} className="px-6 py-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Matrícula *">
              <input required value={form.registration} onChange={(e) => onField("registration", e.target.value.toUpperCase())} className={inputCls} placeholder="PR-ABC" />
            </Field>
            <Field label="Modelo *">
              <input required value={form.model} onChange={(e) => onField("model", e.target.value)} className={inputCls} placeholder="Robinson R44" />
            </Field>
            <Field label="Fabricante">
              <input value={form.manufacturer} onChange={(e) => onField("manufacturer", e.target.value)} className={inputCls} placeholder="Robinson" />
            </Field>
            <Field label="Ano">
              <input type="number" value={form.year} onChange={(e) => onField("year", e.target.value)} className={inputCls} placeholder="2020" />
            </Field>
            <Field label="Total de horas">
              <input type="number" step="0.1" value={form.total_hours} onChange={(e) => onField("total_hours", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => onField("status", e.target.value)} className={inputCls}>
                <option value="available">Disponível</option>
                <option value="in_maintenance">Em manutenção</option>
                <option value="grounded">Aterrissada</option>
              </select>
            </Field>
          </div>
          <Field label="Observações">
            <textarea value={form.notes} onChange={(e) => onField("notes", e.target.value)} rows={3} className={inputCls} placeholder="Notas sobre a aeronave" />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors">
              {saving ? "Salvando…" : "Salvar"}
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