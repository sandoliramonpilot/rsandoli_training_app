import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { QRH_CATEGORIES } from "@/lib/qrhData";
import { Plane, BookOpen, Clock, TrendingUp, AlertTriangle, Plus, CheckCircle2, Wrench, Siren, Library, GraduationCap, ChevronRight, Award } from "lucide-react";

function fmtHours(min) {
  if (!min) return "0h";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
}

const FLIGHT_TYPE_LABELS = {
  private: "Privado", instruction: "Instrução", charter: "Táxi aéreo",
  ems: "Aeromédico", vip: "VIP", photo: "Fotografia", other: "Outro",
};

const PHASE_LABELS = {
  pre_flight: "Pré-Voo", startup: "Acionamento", post_startup: "Pós-Acionamento",
  before_takeoff: "Before Takeoff", shutdown: "Corte de Motor", post_flight: "Pós-Voo",
};

export default function Dashboard() {
  const [flights, setFlights] = useState(null);
  const [aircraft, setAircraft] = useState(null);
  const [checklists, setChecklists] = useState(null);
  const [docs, setDocs] = useState([]);
  const [trainingProgress, setTrainingProgress] = useState({});

  useEffect(() => {
    Promise.all([
      base44.entities.FlightLog.list("-date", 200).catch(() => []),
      base44.entities.Aircraft.list().catch(() => []),
      base44.entities.ChecklistRecord.list("-date", 50).catch(() => []),
      base44.entities.LibraryDocument.list("-created_date", 5).catch(() => []),
    ]).then(([f, a, c, d]) => {
      setFlights(f); setAircraft(a); setChecklists(c); setDocs(d);
    });
    try { setTrainingProgress(JSON.parse(localStorage.getItem("training_progress") || "{}")); } catch {}
  }, []);

  const loading = !flights || !aircraft || !checklists;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-sky-600 rounded-full animate-spin" />
      </div>
    );
  }

  const totalMinutes = flights.reduce((s, f) => s + (f.flight_time_minutes || 0), 0);
  const totalLandings = flights.reduce((s, f) => s + (f.landings || 0), 0);
  const available = aircraft.filter((a) => a.status === "available").length;
  const inMaint = aircraft.filter((a) => a.status === "in_maintenance").length;
  const grounded = aircraft.filter((a) => a.status === "grounded").length;
  const discrepancies = (checklists || []).filter((c) => c.status !== "ok").length;
  const lastChecklist = checklists?.[0];
  const recentFlights = [...flights].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);

  const trainingValues = Object.values(trainingProgress);
  const completedCourses = trainingValues.filter((v) => v >= 100).length;
  const inProgressCourses = trainingValues.filter((v) => v > 0 && v < 100).length;

  const stats = [
    { label: "Total de horas", value: fmtHours(totalMinutes), icon: Clock, accent: "from-sky-500 to-blue-600" },
    { label: "Voos registrados", value: flights.length, icon: BookOpen, accent: "from-amber-500 to-orange-600" },
    { label: "Total de pousos", value: totalLandings, icon: Plane, accent: "from-violet-500 to-purple-600" },
    { label: "Cursos concluídos", value: completedCourses, icon: Award, accent: "from-emerald-500 to-teal-600" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-sky-600 font-semibold">Painel do Piloto</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mt-1">RSANDOLI PILOT</h1>
        <p className="text-slate-500 mt-2 text-sm">Sistema integrado de operações, procedimentos e treinamento para helicópteros.</p>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.accent} flex items-center justify-center mb-3 shadow-sm`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold tracking-tight text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickLink to="/checklist" icon={CheckCircle2} label="Checklists" sub="Pré-voo · Acionamento" accent="from-sky-500 to-blue-600" />
        <QuickLink to="/qrh" icon={Siren} label="QRH" sub="Emergências" accent="from-rose-500 to-red-600" />
        <QuickLink to="/biblioteca" icon={Library} label="Biblioteca" sub="Manuais · PDFs" accent="from-emerald-500 to-teal-600" />
        <QuickLink to="/treinamentos" icon={GraduationCap} label="Treinamentos" sub="AW119_Koala" accent="from-indigo-500 to-purple-600" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Last checklist */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Último checklist realizado</h2>
              <Link to="/checklist" className="text-xs font-medium text-sky-600 hover:text-sky-700">Ver todos →</Link>
            </div>
            {lastChecklist ? (
              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{PHASE_LABELS[lastChecklist.checklist_type] || lastChecklist.checklist_type}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lastChecklist.date ? new Date(lastChecklist.date).toLocaleDateString("pt-BR") : "—"} · {lastChecklist.aircraft_registration || "—"} · {lastChecklist.pilot_name || "—"}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                  lastChecklist.status === "ok" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-amber-700 bg-amber-50 border-amber-200"
                }`}>
                  {lastChecklist.status === "ok" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {lastChecklist.status === "ok" ? "OK" : "Discrepância"}
                </span>
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-sm text-slate-400">Nenhum checklist registrado ainda.</div>
            )}
          </div>

          {/* QRH quick access */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Atalhos QRH</h2>
              <Link to="/qrh" className="text-xs font-medium text-rose-600 hover:text-rose-700">Ver todos →</Link>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {QRH_CATEGORIES.slice(0, 6).map((c) => (
                <Link key={c.id} to="/qrh" className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 hover:border-rose-200 hover:bg-rose-50/40 transition-colors group">
                  <span className={`w-2 h-2 rounded-full ${c.color === "red" ? "bg-red-500" : c.color === "amber" ? "bg-amber-500" : "bg-blue-500"}`} />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-rose-700">{c.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent flights */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Voos recentes</h2>
              <Link to="/flight-log" className="text-xs font-medium text-sky-600 hover:text-sky-700">Ver todos →</Link>
            </div>
            {recentFlights.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-slate-400">Nenhum voo registrado ainda.</div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentFlights.map((f) => (
                  <li key={f.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {f.departure_location || "—"} <span className="text-slate-300 mx-1">→</span> {f.arrival_location || "—"}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {f.date ? new Date(f.date).toLocaleDateString("pt-BR") : "—"} · {f.aircraft_registration || "—"} · {f.pilot_name || "—"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-slate-900">{fmtHours(f.flight_time_minutes)}</p>
                      <p className="text-[11px] text-slate-400">{FLIGHT_TYPE_LABELS[f.flight_type] || f.flight_type}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Training progress */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Treinamentos em andamento</h2>
              <Link to="/treinamentos" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">Ver →</Link>
            </div>
            <div className="px-6 py-4 space-y-3">
              {inProgressCourses === 0 && completedCourses === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">Nenhum treinamento iniciado.</p>
              ) : (
                Object.entries(trainingProgress).filter(([, v]) => v > 0).slice(0, 4).map(([id, val]) => (
                  <div key={id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600 truncate">{id.replace(/_/g, " ")}</span>
                      <span className="text-xs font-semibold text-slate-900">{val}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${val >= 100 ? "bg-emerald-500" : "bg-gradient-to-r from-indigo-500 to-blue-600"}`} style={{ width: `${val}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Library recent */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Biblioteca recente</h2>
              <Link to="/biblioteca" className="text-xs font-medium text-emerald-600 hover:text-emerald-700">Ver →</Link>
            </div>
            {docs.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-slate-400">Nenhum documento enviado.</div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {docs.map((d) => (
                  <li key={d.id} className="px-6 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm text-slate-700 truncate">{d.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Fleet status */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Situação da frota</h2>
              <Link to="/aircraft" className="text-xs font-medium text-sky-600 hover:text-sky-700">Ver →</Link>
            </div>
            <div className="px-6 py-4 space-y-3">
              <StatusRow icon={CheckCircle2} color="text-emerald-600 bg-emerald-50" label="Disponíveis" value={available} />
              <StatusRow icon={Wrench} color="text-amber-600 bg-amber-50" label="Em manutenção" value={inMaint} />
              <StatusRow icon={AlertTriangle} color="text-rose-600 bg-rose-50" label="Aterrissadas" value={grounded} />
            </div>
            {discrepancies > 0 && (
              <div className="mx-6 mb-5 mt-1 px-4 py-3 rounded-lg bg-rose-50 border border-rose-100 flex items-center gap-2 text-sm text-rose-700">
                <AlertTriangle className="w-4 h-4" />
                {discrepancies} discrepância(s) em checklists
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label, sub, accent }) {
  return (
    <Link to={to} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-shadow group">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center mb-3 shadow-sm`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="font-semibold text-slate-900 text-sm">{label}</p>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
    </Link>
  );
}

function StatusRow({ icon: Icon, color, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm text-slate-600">{label}</span>
      </div>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}