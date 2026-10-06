import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { can } from "@/lib/accessControl";
import BackToDashboard from "@/components/BackToDashboard";
import ShiftForm from "@/components/escalas/ShiftForm";
import {
  PERIOD_LABELS, STATUS_LABELS, STATUS_STYLES, detectOverlaps,
  getMonthGrid, WEEKDAYS, MONTH_NAMES,
} from "@/lib/scheduleUtils";
import {
  Plus, ChevronLeft, ChevronRight, CalendarDays, AlertTriangle,
  Plane, Users, Clock, Loader2, Pencil, Trash2, X, ListFilter,
} from "lucide-react";

export default function Escalas() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState(null);
  const [pilots, setPilots] = useState([]);
  const [aircraft, setAircraft] = useState([]);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [view, setView] = useState("calendar"); // calendar | list
  const [showForm, setShowForm] = useState(null); // null | shift object for edit | {} for new
  const [statusFilter, setStatusFilter] = useState("all");
  const [showOverlaps, setShowOverlaps] = useState(false);

  const canEdit = can(user, "escalas", "editar");

  useEffect(() => {
    base44.entities.Schedule.list("-date", 500).then(setSchedules).catch(() => setSchedules([]));
    base44.entities.Pilot.list().then(setPilots).catch(() => {});
    base44.entities.Aircraft.list().then(setAircraft).catch(() => {});
  }, []);

  const load = () => {
    base44.entities.Schedule.list("-date", 500).then(setSchedules).catch(() => {});
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthGrid = useMemo(() => getMonthGrid(year, month), [year, month]);

  const overlaps = useMemo(() => (schedules ? detectOverlaps(schedules) : []), [schedules]);
  const overlapDates = useMemo(() => new Set(overlaps.map((o) => o.date)), [overlaps]);

  // Schedules grouped by date for calendar dots
  const byDate = useMemo(() => {
    const map = {};
    (schedules || []).forEach((s) => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    return map;
  }, [schedules]);

  // Schedules for the selected date (calendar view) or all (list view)
  const daySchedules = useMemo(() => {
    if (!schedules) return [];
    let list = view === "calendar" ? (byDate[selectedDate] || []) : [...schedules];
    if (statusFilter !== "all") list = list.filter((s) => s.status === statusFilter);
    return list.sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));
  }, [schedules, byDate, selectedDate, view, statusFilter]);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToday = () => { setViewDate(new Date()); setSelectedDate(new Date().toISOString().slice(0, 10)); };

  const handleDelete = async (s) => {
    if (!confirm(`Excluir a escala "${s.mission}" de ${s.date}?`)) return;
    await base44.entities.Schedule.delete(s.id);
    load();
  };

  if (!schedules) {
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
          <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Operações</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">Escalas</h1>
          <p className="text-slate-400 mt-2 text-sm">Calendário de turnos, tripulação e detecção de sobreposições.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <BackToDashboard />
          {overlaps.length > 0 && (
            <button onClick={() => setShowOverlaps(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-orange-500/40 text-orange-300 bg-orange-500/10 hover:bg-orange-500/20">
              <AlertTriangle className="w-4 h-4" /> {overlaps.length} sobreposição(s)
            </button>
          )}
          {canEdit && (
            <button onClick={() => setShowForm({})} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-lg shadow-amber-500/20">
              <Plus className="w-4 h-4" /> Nova Escala
            </button>
          )}
        </div>
      </header>

      {/* View toggle */}
      <div className="flex items-center gap-2">
        <button onClick={() => setView("calendar")} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium ${view === "calendar" ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:text-slate-200 border border-transparent"}`}>
          <CalendarDays className="w-4 h-4" /> Calendário
        </button>
        <button onClick={() => setView("list")} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium ${view === "list" ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:text-slate-200 border border-transparent"}`}>
          <ListFilter className="w-4 h-4" /> Lista
        </button>
      </div>

      {view === "calendar" ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60">
              <div className="flex items-center gap-3">
                <button onClick={prevMonth} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-700/40"><ChevronLeft className="w-5 h-5" /></button>
                <h2 className="text-lg font-semibold text-slate-100">{MONTH_NAMES[month]} {year}</h2>
                <button onClick={nextMonth} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-700/40"><ChevronRight className="w-5 h-5" /></button>
              </div>
              <button onClick={goToday} className="text-xs font-medium text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-500/10">Hoje</button>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-center text-[11px] font-medium text-slate-500 uppercase tracking-wider py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthGrid.map((cell, i) => {
                  if (!cell.inMonth) {
                    return <div key={i} className="aspect-square rounded-lg bg-transparent" />;
                  }
                  const dayScheds = byDate[cell.date] || [];
                  const hasOverlap = overlapDates.has(cell.date);
                  const isSelected = cell.date === selectedDate;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(cell.date)}
                      className={`aspect-square rounded-lg border text-left p-1.5 transition-colors relative ${
                        isSelected ? "border-amber-500/50 bg-amber-500/10" :
                        hasOverlap ? "border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10" :
                        dayScheds.length > 0 ? "border-slate-600/40 bg-slate-700/20 hover:bg-slate-700/30" :
                        "border-slate-700/30 hover:border-slate-600/50"
                      }`}
                    >
                      <span className={`text-xs font-medium ${cell.isToday ? "text-amber-400" : "text-slate-300"}`}>{cell.day}</span>
                      {dayScheds.length > 0 && (
                        <div className="absolute bottom-1 left-1 right-1 flex flex-col gap-0.5">
                          {dayScheds.slice(0, 2).map((s, j) => (
                            <div key={j} className="text-[9px] truncate px-1 py-0.5 rounded bg-slate-800/80 text-slate-300 leading-tight">
                              {s.start_time} {s.mission}
                            </div>
                          ))}
                          {dayScheds.length > 2 && <div className="text-[9px] text-slate-500 px-1">+{dayScheds.length - 2}</div>}
                        </div>
                      )}
                      {hasOverlap && <AlertTriangle className="w-3 h-3 text-orange-400 absolute top-1 right-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Day detail */}
          <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-700/60">
              <h3 className="font-semibold text-sm text-slate-200">
                {new Date(selectedDate + "T00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{daySchedules.length} escala(s)</p>
            </div>
            <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
              {daySchedules.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">Nenhuma escala para esta data.</p>
              ) : (
                daySchedules.map((s) => <ShiftCard key={s.id} s={s} canEdit={canEdit} onEdit={() => setShowForm(s)} onDelete={() => handleDelete(s)} />)
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-xl bg-[#1A1D25] border border-slate-700/60 text-sm text-slate-200">
              <option value="all">Todas as situações</option>
              {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <p className="text-xs text-slate-500">{daySchedules.length} escala(s)</p>
          </div>
          {daySchedules.length === 0 ? (
            <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 px-6 py-16 text-center">
              <CalendarDays className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Nenhuma escala encontrada.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {daySchedules.map((s) => <ShiftCard key={s.id} s={s} canEdit={canEdit} onEdit={() => setShowForm(s)} onDelete={() => handleDelete(s)} showDate />)}
            </div>
          )}
        </div>
      )}

      {showForm && (
        <ShiftForm
          shift={showForm.id ? showForm : null}
          pilots={pilots}
          aircraft={aircraft}
          schedules={schedules}
          defaultDate={showForm.date || selectedDate}
          onClose={() => setShowForm(null)}
          onSaved={() => { setShowForm(null); load(); }}
        />
      )}

      {showOverlaps && (
        <OverlapsModal overlaps={overlaps} onClose={() => setShowOverlaps(false)} />
      )}
    </div>
  );
}

function ShiftCard({ s, canEdit, onEdit, onDelete, showDate }) {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-[#12141A] p-3.5 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-100 truncate">{s.mission}</p>
          {showDate && <p className="text-xs text-slate-500 mt-0.5">{new Date(s.date + "T00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", weekday: "short" })}</p>}
        </div>
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES[s.status] || STATUS_STYLES.planejada}`}>
          {STATUS_LABELS[s.status] || s.status}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
        {s.start_time && <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {s.start_time}{s.end_time ? `–${s.end_time}` : ""}</span>}
        {s.aircraft_registration && <span className="inline-flex items-center gap-1"><Plane className="w-3 h-3" /> {s.aircraft_registration}</span>}
        {(s.crew_pilot_name || s.crew_copilot_name) && (
          <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" /> {[s.crew_pilot_name, s.crew_copilot_name].filter(Boolean).join(" / ")}</span>
        )}
        {s.base && <span>{s.base}</span>}
      </div>
      {s.observations && <p className="text-xs text-slate-500 pt-1 border-t border-slate-700/30">{s.observations}</p>}
      {canEdit && (
        <div className="flex gap-2 pt-1">
          <button onClick={onEdit} className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300"><Pencil className="w-3 h-3" /> Editar</button>
          <button onClick={onDelete} className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300"><Trash2 className="w-3 h-3" /> Excluir</button>
        </div>
      )}
    </div>
  );
}

function OverlapsModal({ overlaps, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-[#1A1D25] w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-2xl border border-slate-700/60 max-h-[90vh] flex flex-col">
        <div className="sticky top-0 bg-[#1A1D25]/95 backdrop-blur px-6 py-4 border-b border-slate-700/60 flex items-center justify-between">
          <h2 className="font-semibold text-lg text-slate-100 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-orange-400" /> Sobreposições Detectadas</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700/40"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {overlaps.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Nenhuma sobreposição detectada.</p>
          ) : (
            overlaps.map((o, i) => (
              <div key={i} className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-4 space-y-3">
                <p className="text-sm font-medium text-orange-200">
                  {new Date(o.date + "T00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", weekday: "long" })}
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <ShiftMini s={o.shiftA} />
                  <ShiftMini s={o.shiftB} />
                </div>
                <div className="space-y-1">
                  {o.conflicts.map((c, j) => (
                    <p key={j} className="text-xs text-orange-300 flex items-center gap-1.5">
                      <Users className="w-3 h-3" /> <strong>{c.person}</strong> — {c.roleA} em "{o.shiftA.mission}" × {c.roleB} em "{o.shiftB.mission}"
                    </p>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ShiftMini({ s }) {
  return (
    <div className="rounded-lg bg-slate-800/40 border border-slate-700/40 p-3 text-xs">
      <p className="font-medium text-slate-200 truncate">{s.mission}</p>
      <p className="text-slate-500 mt-0.5">{s.start_time}–{s.end_time}</p>
      <p className="text-slate-500">{[s.crew_pilot_name, s.crew_copilot_name].filter(Boolean).join(" / ") || "Sem tripulação"}</p>
    </div>
  );
}