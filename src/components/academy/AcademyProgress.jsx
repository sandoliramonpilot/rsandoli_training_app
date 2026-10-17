import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { can } from "@/lib/accessControl";
import { safeParse } from "@/lib/pilotUtils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid,
} from "recharts";
import {
  Award, BookOpen, Users, TrendingUp, Loader2, CheckCircle2, Plus, X,
  ChevronDown, ChevronRight, GraduationCap, BarChart3,
} from "lucide-react";
import { useProfile } from "@/lib/ProfileContext";

export default function AcademyProgress() {
  const { user } = useAuth();
  const { profileFilter, profileValue } = useProfile();
  const [pilots, setPilots] = useState(null);
  const [courses, setCourses] = useState(null);
  const [completions, setCompletions] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const canEdit = can(user, "treinamentos", "editar");

  const load = async () => {
    const [p, c, comp] = await Promise.all([
      base44.entities.Pilot.filter(profileFilter).catch(() => []),
      base44.entities.TrainingDocument.filter({ ...profileFilter, status: "active" }).catch(() => []),
      base44.entities.TrainingCompletion.filter(profileFilter).catch(() => []),
    ]);
    setPilots(p);
    setCourses(c);
    setCompletions(comp);
  };
  useEffect(() => { load(); }, [profileFilter]);

  const activePilots = useMemo(() => (pilots || []).filter((p) => p.status !== "inactive"), [pilots]);

  // Per-pilot progress data
  const pilotProgress = useMemo(() => {
    if (!activePilots.length || !courses) return [];
    const totalCourses = courses.length || 1;
    return activePilots.map((p) => {
      const done = (completions || []).filter((c) => c.pilot_id === p.id && c.status === "completed");
      const certs = safeParse(p.certificates, []);
      const pct = totalCourses > 0 ? Math.round((done.length / totalCourses) * 100) : 0;
      return {
        id: p.id,
        name: p.full_name || "—",
        warName: p.war_name || "",
        role: p.role,
        completed: done.length,
        total: totalCourses,
        pct,
        certifications: certs.length,
        completions: done,
      };
    }).sort((a, b) => b.pct - a.pct);
  }, [activePilots, courses, completions]);

  const summary = useMemo(() => {
    const totalCourses = courses?.length || 0;
    const totalPilots = activePilots.length;
    const avgPct = pilotProgress.length ? Math.round(pilotProgress.reduce((s, p) => s + p.pct, 0) / pilotProgress.length) : 0;
    const totalCerts = pilotProgress.reduce((s, p) => s + p.certifications, 0);
    const totalCompletions = (completions || []).filter((c) => c.status === "completed").length;
    return { totalCourses, totalPilots, avgPct, totalCerts, totalCompletions };
  }, [courses, activePilots, pilotProgress, completions]);

  const chartData = useMemo(() => pilotProgress.map((p) => ({ name: p.warName || p.name.split(" ")[0], pct: p.pct, fullName: p.name })), [pilotProgress]);

  if (!pilots || !courses || !completions) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" /> Progresso dos Pilotos
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Conclusão de treinamentos e certificações por piloto.</p>
        </div>
        {canEdit && (
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-400 text-slate-900">
            <Plus className="w-4 h-4" /> Registrar conclusão
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <SummaryCard icon={BookOpen} label="Treinamentos" value={summary.totalCourses} tone="text-amber-400" />
        <SummaryCard icon={Users} label="Pilotos ativos" value={summary.totalPilots} tone="text-sky-400" />
        <SummaryCard icon={TrendingUp} label="Conclusão média" value={`${summary.avgPct}%`} tone="text-emerald-400" />
        <SummaryCard icon={CheckCircle2} label="Conclusões registradas" value={summary.totalCompletions} tone="text-teal-400" />
        <SummaryCard icon={Award} label="Certificações" value={summary.totalCerts} tone="text-violet-400" />
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-amber-400" /> % de Conclusão por Piloto</h3>
          <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 44)}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#33415540" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fill: "#cbd5e1", fontSize: 12 }} width={90} />
              <Tooltip
                contentStyle={{ background: "#1A1D25", border: "1px solid #33415560", borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: "#f1f5f9" }}
                formatter={(v) => [`${v}%`, "Conclusão"]}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || _}
              />
              <Bar dataKey="pct" radius={[0, 6, 6, 0]} maxBarSize={28}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.pct >= 80 ? "#10b981" : d.pct >= 50 ? "#f59e0b" : d.pct >= 25 ? "#f97316" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detailed table */}
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden">
        <div className="px-5 py-3.5 bg-[#12141A] border-b border-slate-700/60">
          <h3 className="font-semibold text-sm text-slate-200">Detalhamento por Piloto</h3>
        </div>
        {pilotProgress.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-10">Nenhum piloto ativo encontrado.</p>
        ) : (
          <div className="divide-y divide-slate-700/40">
            {pilotProgress.map((p) => (
              <div key={p.id}>
                <button
                  onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] text-left"
                >
                  {expanded === p.id ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-100 truncate">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.completed}/{p.total} treinamentos · {p.certifications} certificação(ões)</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:block w-32 h-2 rounded-full bg-slate-700/40 overflow-hidden">
                      <div className={`h-full rounded-full ${p.pct >= 80 ? "bg-emerald-500" : p.pct >= 50 ? "bg-amber-500" : p.pct >= 25 ? "bg-orange-500" : "bg-rose-500"}`} style={{ width: `${p.pct}%` }} />
                    </div>
                    <span className={`text-sm font-bold ${p.pct >= 80 ? "text-emerald-400" : p.pct >= 50 ? "text-amber-400" : p.pct >= 25 ? "text-orange-400" : "text-rose-400"}`}>{p.pct}%</span>
                  </div>
                </button>
                {expanded === p.id && (
                  <div className="px-5 pb-4 pt-1 bg-[#12141A]/50">
                    {p.completions.length === 0 ? (
                      <p className="text-xs text-slate-500 pl-8">Nenhum treinamento concluído ainda.</p>
                    ) : (
                      <ul className="space-y-1.5 pl-8">
                        {p.completions.map((c) => (
                          <li key={c.id} className="flex items-center gap-2 text-xs text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="flex-1 truncate">{c.training_title || "Treinamento"}</span>
                            {c.score != null && <span className="text-slate-500">Nota: {c.score}%</span>}
                            {c.completed_at && <span className="text-slate-500">{new Date(c.completed_at).toLocaleDateString("pt-BR")}</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <CompletionForm
          pilots={activePilots}
          courses={courses}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-4">
      <Icon className="w-5 h-5 text-slate-400 mb-2" />
      <p className={`text-2xl font-bold tracking-tight ${tone}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function CompletionForm({ pilots, courses, onClose, onSaved }) {
  const { profileValue } = useProfile();
  const [pilotId, setPilotId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [score, setScore] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!pilotId || !courseId) { setError("Selecione o piloto e o treinamento."); return; }
    setSaving(true);
    try {
      const pilot = pilots.find((p) => p.id === pilotId);
      const course = courses.find((c) => c.id === courseId);
      // Avoid duplicate
      const existing = await base44.entities.TrainingCompletion.filter({
        pilot_id: pilotId, training_document_id: courseId,
      }).catch(() => []);
      if (existing.length > 0) {
        await base44.entities.TrainingCompletion.update(existing[0].id, {
          status: "completed", completed_at: new Date().toISOString(),
          score: score ? Number(score) : undefined,
        });
      } else {
        await base44.entities.TrainingCompletion.create({
          aircraftProfile: profileValue,
          pilot_id: pilotId, pilot_name: pilot?.full_name || "",
          training_document_id: courseId, training_title: course?.title || "",
          discipline: course?.discipline || "",
          status: "completed", completed_at: new Date().toISOString(),
          score: score ? Number(score) : undefined,
        });
      }
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Erro ao registrar conclusão.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-[#1A1D25] w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl border border-slate-700/60">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60">
          <h2 className="font-semibold text-lg text-slate-100 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-amber-400" /> Registrar Conclusão</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700/40"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {error && <div className="px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">{error}</div>}
          <label className="block">
            <span className="block text-xs font-medium text-slate-400 mb-1">Piloto *</span>
            <select className={inputCls} value={pilotId} onChange={(e) => setPilotId(e.target.value)}>
              <option value="">Selecionar…</option>
              {pilots.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-400 mb-1">Treinamento *</span>
            <select className={inputCls} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              <option value="">Selecionar…</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-400 mb-1">Aproveitamento (%) — opcional</span>
            <input type="number" min="0" max="100" className={inputCls} value={score} onChange={(e) => setScore(e.target.value)} placeholder="Ex: 85" />
          </label>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-700/40">Cancelar</button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-400 text-slate-900 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}