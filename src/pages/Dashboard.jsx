import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { QRH_CATEGORIES } from "@/lib/qrhData";
import { Plane, BookOpen, Clock, TrendingUp, AlertTriangle, Plus, CheckCircle2, Wrench, Siren, Library, GraduationCap, ChevronRight, Award, ClipboardCheck, Users, HelpCircle } from "lucide-react";

function fmtHours(min) {
  if (!min) return "0h";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
}

const FLIGHT_TYPE_LABELS = {
  private: "Privado", instruction: "Instrução", charter: "Táxi aéreo",
  ems: "Aeromédico", vip: "VIP", photo: "Fotografia", other: "Outro"
};

const PHASE_LABELS = {
  pre_flight: "Pré-Voo", startup: "Partida", post_startup: "Pós-Acionamento",
  before_takeoff: "Antes da Decolagem", shutdown: "Corte de Motor", post_flight: "Pós-Voo", taxi: "Taxi"
};

export default function Dashboard() {
  const [flights, setFlights] = useState(null);
  const [aircraft, setAircraft] = useState(null);
  const [checklists, setChecklists] = useState(null);
  const [docs, setDocs] = useState([]);
  const [pilots, setPilots] = useState([]);
  const [simStats, setSimStats] = useState({ count: 0, avg: 0 });

  useEffect(() => {
    Promise.all([
    base44.entities.FlightLog.list("-date", 200).catch(() => []),
    base44.entities.Aircraft.list().catch(() => []),
    base44.entities.ChecklistRecord.list("-date", 50).catch(() => []),
    base44.entities.LibraryDocument.list("-created_date", 5).catch(() => []),
    base44.entities.Pilot.list().catch(() => [])]
    ).then(([f, a, c, d, p]) => {
      setFlights(f);setAircraft(a);setChecklists(c);setDocs(d);setPilots(p);
    });
    try {
      const h = JSON.parse(localStorage.getItem("sim_history") || "[]");
      const avg = h.length ? Math.round(h.reduce((s, x) => s + x.pct, 0) / h.length) : 0;
      setSimStats({ count: h.length, avg });
    } catch {}
  }, []);

  const loading = !flights || !aircraft || !checklists;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin" />
      </div>);

  }

  const totalMinutes = flights.reduce((s, f) => s + (f.flight_time_minutes || 0), 0);
  const totalLandings = flights.reduce((s, f) => s + (f.landings || 0), 0);
  const available = aircraft.filter((a) => a.status === "available").length;
  const inMaint = aircraft.filter((a) => a.status === "in_maintenance").length;
  const grounded = aircraft.filter((a) => a.status === "grounded").length;
  const discrepancies = (checklists || []).filter((c) => c.status !== "ok").length;
  const lastChecklist = checklists?.[0];
  const recentFlights = [...flights].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);
  const activePilots = pilots.filter((p) => p.status === "active").length;

  const stats = [
  { label: "Total de horas", value: fmtHours(totalMinutes), icon: Clock, accent: "from-amber-500 to-amber-400" },
  { label: "Voos registrados", value: flights.length, icon: BookOpen, accent: "from-violet-500 to-purple-400" },
  { label: "Pilotos ativos", value: activePilots, icon: Users, accent: "from-teal-500 to-emerald-400" },
  { label: "Simulados · média", value: `${simStats.avg}%`, icon: Award, accent: "from-sky-500 to-blue-400" }];


  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Painel do Piloto</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">Con-</h1>
        <p className="text-slate-400 mt-2 text-sm">Sistema integrado de treinamento, procedimentos e consulta operacional para helicópteros.</p>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5 hover:border-amber-500/30 transition-colors">
              <div className={`w-10 h-10 bg-gradient-to-br rounded-[32px] ${s.accent} flex items-center justify-center mb-3 shadow-lg`}>
                <Icon className="w-5 h-5 text-slate-900" />
              </div>
              <p className="text-2xl font-bold tracking-tight text-slate-100">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>);

        })}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickLink to="/checklist" icon={ClipboardCheck} label="Checklists" sub="Fases de voo" accent="from-sky-500 to-blue-500" />
        <QuickLink to="/qrh" icon={Siren} label="QRH" sub="Emergências" accent="from-rose-500 to-red-500" />
        <QuickLink to="/pilotos" icon={Users} label="Pilotos" sub="Cadastro e vencimentos" accent="from-teal-500 to-emerald-500" />
        <QuickLink to="/simulados" icon={HelpCircle} label="Simulados" sub="Avaliações" accent="from-violet-500 to-purple-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Last checklist */}
          <Panel title="Último checklist realizado" to="/checklist" linkLabel="Ver todos">
            {lastChecklist ?
            <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-slate-100">{PHASE_LABELS[lastChecklist.checklist_type] || lastChecklist.checklist_type}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lastChecklist.date ? new Date(lastChecklist.date).toLocaleDateString("pt-BR") : "—"} · {lastChecklist.aircraft_registration || "—"} · {lastChecklist.pilot_name || "—"}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${lastChecklist.status === "ok" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" : "text-amber-400 bg-amber-500/10 border-amber-500/30"}`}>
                  {lastChecklist.status === "ok" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {lastChecklist.status === "ok" ? "OK" : "Discrepância"}
                </span>
              </div> :

            <div className="py-8 text-center text-sm text-slate-500">Nenhum checklist registrado ainda.</div>
            }
          </Panel>

          {/* QRH quick access */}
          <Panel title="Atalhos QRH" to="/qrh" linkLabel="Ver todos">
            <div className="py-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {QRH_CATEGORIES.slice(0, 6).map((c) =>
              <Link key={c.id} to="/qrh" className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-700/50 hover:border-rose-500/40 hover:bg-rose-500/[0.03] transition-colors">
                  <span className={`w-2 h-2 rounded-full ${c.color === "red" ? "bg-rose-500" : c.color === "amber" ? "bg-amber-500" : "bg-teal-500"}`} />
                  <span className="text-sm font-medium text-slate-300">{c.name}</span>
                </Link>
              )}
            </div>
          </Panel>

          {/* Recent flights */}
          <Panel title="Voos recentes" to="/flight-log" linkLabel="Ver todos">
            {recentFlights.length === 0 ?
            <div className="py-10 text-center text-sm text-slate-500">Nenhum voo registrado ainda.</div> :

            <ul className="divide-y divide-slate-700/40">
                {recentFlights.map((f) =>
              <li key={f.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-100 truncate">
                        {f.departure_location || "—"} <span className="text-slate-600 mx-1">→</span> {f.arrival_location || "—"}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {f.date ? new Date(f.date).toLocaleDateString("pt-BR") : "—"} · {f.aircraft_registration || "—"} · {f.pilot_name || "—"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-slate-100">{fmtHours(f.flight_time_minutes)}</p>
                      <p className="text-[11px] text-slate-500">{FLIGHT_TYPE_LABELS[f.flight_type] || f.flight_type}</p>
                    </div>
                  </li>
              )}
              </ul>
            }
          </Panel>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Academy modules */}
          <Panel title="Academy" to="/treinamentos" linkLabel="Ver">
            <div className="space-y-2 py-1">
              <QuickRow title="Sistemas da Aeronave" sub="10 categorias" icon={Plane} />
              <QuickRow title="HeliPilot" sub="SAS & Flight Director" icon={TrendingUp} />
              <QuickRow title="Genesys IDU-680" sub="EFIS integrado" icon={Library} />
              <QuickRow title="Limitações" sub="Operacionais" icon={Award} />
            </div>
          </Panel>

          {/* Library recent */}
          <Panel title="Biblioteca recente" to="/biblioteca" linkLabel="Ver">
            {docs.length === 0 ?
            <div className="py-8 text-center text-sm text-slate-500">Nenhum documento enviado.</div> :

            <ul className="divide-y divide-slate-700/40">
                {docs.map((d) =>
              <li key={d.id} className="py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-sm text-slate-300 truncate">{d.title}</span>
                  </li>
              )}
              </ul>
            }
          </Panel>

          {/* Fleet status */}
          <Panel title="Situação da frota" to="/aircraft" linkLabel="Ver">
            <div className="space-y-3 py-1">
              <StatusRow icon={CheckCircle2} color="text-emerald-400 bg-emerald-500/10" label="Disponíveis" value={available} />
              <StatusRow icon={Wrench} color="text-amber-400 bg-amber-500/10" label="Em manutenção" value={inMaint} />
              <StatusRow icon={AlertTriangle} color="text-rose-400 bg-rose-500/10" label="Aterrissadas" value={grounded} />
            </div>
            {discrepancies > 0 &&
            <div className="mt-4 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-sm text-rose-300">
                <AlertTriangle className="w-4 h-4" />
                {discrepancies} discrepância(s) em checklists
              </div>
            }
          </Panel>
        </div>
      </div>
    </div>);

}

function Panel({ title, to, linkLabel, children }) {
  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60">
        <h2 className="font-semibold text-slate-100">{title}</h2>
        {to && <Link to={to} className="text-xs font-medium text-amber-400 hover:text-amber-300">{linkLabel} →</Link>}
      </div>
      <div className="px-6 py-2">{children}</div>
    </div>);

}

function QuickLink({ to, icon: Icon, label, sub, accent }) {
  return (
    <Link to={to} className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-4 hover:border-amber-500/40 hover:shadow-lg hover:shadow-black/30 transition-all group">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center mb-3 shadow-lg`}>
        <Icon className="w-5 h-5 text-slate-900" />
      </div>
      <p className="font-semibold text-slate-100 text-sm">{label}</p>
      <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
    </Link>);

}

function QuickRow({ title, sub, icon: Icon }) {
  return (
    <Link to="/treinamentos" className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-slate-700/20 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-amber-400" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-200">{title}</p>
        <p className="text-[11px] text-slate-500">{sub}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-600 ml-auto shrink-0" />
    </Link>);

}

function StatusRow({ icon: Icon, color, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm text-slate-300">{label}</span>
      </div>
      <span className="font-semibold text-slate-100">{value}</span>
    </div>);

}