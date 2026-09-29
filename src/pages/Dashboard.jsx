import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Plane, BookOpen, Clock, TrendingUp, AlertTriangle, Plus, CheckCircle2, Wrench } from "lucide-react";

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

export default function Dashboard() {
  const [flights, setFlights] = useState(null);
  const [aircraft, setAircraft] = useState(null);
  const [checklists, setChecklists] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.FlightLog.list("-date", 200).catch(() => []),
      base44.entities.Aircraft.list().catch(() => []),
      base44.entities.ChecklistRecord.list("-date", 50).catch(() => []),
    ]).then(([f, a, c]) => {
      setFlights(f);
      setAircraft(a);
      setChecklists(c);
    });
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
  const now = new Date();
  const last30 = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
  const recentMinutes = flights
    .filter((f) => f.date && new Date(f.date) >= last30)
    .reduce((s, f) => s + (f.flight_time_minutes || 0), 0);
  const totalLandings = flights.reduce((s, f) => s + (f.landings || 0), 0);
  const available = aircraft.filter((a) => a.status === "available").length;
  const inMaint = aircraft.filter((a) => a.status === "in_maintenance").length;
  const grounded = aircraft.filter((a) => a.status === "grounded").length;
  const discrepancies = (checklists || []).filter((c) => c.status !== "ok").length;

  const recentFlights = [...flights]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const stats = [
    { label: "Total de horas", value: fmtHours(totalMinutes), icon: Clock, accent: "from-sky-500 to-blue-600" },
    { label: "Últimos 30 dias", value: fmtHours(recentMinutes), icon: TrendingUp, accent: "from-emerald-500 to-teal-600" },
    { label: "Total de pousos", value: totalLandings, icon: Plane, accent: "from-violet-500 to-purple-600" },
    { label: "Voos registrados", value: flights.length, icon: BookOpen, accent: "from-amber-500 to-orange-600" },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-sky-600 font-semibold">Painel de Operações</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mt-1">Visão geral da esquadra</h1>
          <p className="text-slate-500 mt-2 text-sm">Acompanhe horas de voo, aeronaves e inspeções pré-voo.</p>
        </div>
        <Link
          to="/flight-log"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Registrar voo
        </Link>
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent flights */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Voos recentes</h2>
            <Link to="/flight-log" className="text-xs font-medium text-sky-600 hover:text-sky-700">Ver todos →</Link>
          </div>
          {recentFlights.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-400">
              Nenhum voo registrado ainda.
            </div>
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

        {/* Fleet status */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Situação da frota</h2>
            <Link to="/aircraft" className="text-xs font-medium text-sky-600 hover:text-sky-700">Ver →</Link>
          </div>
          <div className="px-6 py-4 space-y-3">
            <StatusRow icon={CheckCircle2} color="text-emerald-600 bg-emerald-50" label="Disponíveis" value={available} />
            <StatusRow icon={Wrench} color="text-amber-600 bg-amber-50" label="Em manutenção" value={inMaint} />
            <StatusRow icon={AlertTriangle} color="text-rose-600 bg-rose-50" label="Aterrissadas (grounded)" value={grounded} />
          </div>
          {discrepancies > 0 && (
            <div className="mx-6 mb-5 mt-1 px-4 py-3 rounded-lg bg-rose-50 border border-rose-100 flex items-center gap-2 text-sm text-rose-700">
              <AlertTriangle className="w-4 h-4" />
              {discrepancies} discrepância(s) em checklists recentes
            </div>
          )}
        </div>
      </div>
    </div>
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