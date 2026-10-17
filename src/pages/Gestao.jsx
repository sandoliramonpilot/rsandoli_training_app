import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { getAccessLevel } from "@/lib/accessControl";
import BackToDashboard from "@/components/BackToDashboard";
import { useProfile } from "@/lib/ProfileContext";
import {
  BarChart3, History, FileText, Users, GraduationCap, Award,
  TrendingUp, Clock, AlertCircle, Loader2, Download,
} from "lucide-react";

export default function Gestao() {
  const { user } = useAuth();
  const [tab, setTab] = useState("relatorios");
  const level = getAccessLevel(user);
  const canView = level === "admin_geral" || level === "administrador" || level === "gestor_supervisor";

  if (!canView) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Acesso restrito a administradores e gestores.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Administração</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">GESTÃO</h1>
          <p className="text-slate-400 mt-2 text-sm">Relatórios de treinamento e auditoria de acessos.</p>
        </div>
        <BackToDashboard />
      </header>

      <div className="flex gap-2">
        <button
          onClick={() => setTab("relatorios")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
            tab === "relatorios" ? "bg-amber-500 text-slate-900 border-amber-500" : "bg-[#1A1D25] text-slate-300 border-slate-700/60 hover:border-amber-500/40"
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Relatórios
        </button>
        <button
          onClick={() => setTab("auditoria")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
            tab === "auditorios" ? "bg-amber-500 text-slate-900 border-amber-500" : "bg-[#1A1D25] text-slate-300 border-slate-700/60 hover:border-amber-500/40"
          }`}
        >
          <History className="w-4 h-4" /> Auditoria
        </button>
      </div>

      {tab === "relatorios" && <RelatoriosTab />}
      {tab === "auditoria" && <AuditoriaTab level={level} />}
    </div>
  );
}

function RelatoriosTab() {
  const { profileFilter } = useProfile();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [pilots, aircraft, flights, checklists, docs] = await Promise.all([
          base44.entities.Pilot.filter(profileFilter).catch(() => []),
          base44.entities.Aircraft.filter(profileFilter).catch(() => []),
          base44.entities.FlightLog.filter(profileFilter).catch(() => []),
          base44.entities.ChecklistRecord.filter(profileFilter).catch(() => []),
          base44.entities.TrainingDocument.filter({ ...profileFilter, status: "active" }).catch(() => []),
        ]);
        setStats({
          pilots: pilots.length,
          aircraft: aircraft.length,
          flights: flights.length,
          checklists: checklists.length,
          trainingDocs: docs.length,
        });
      } catch {
        setStats(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [profileFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!stats) {
    return <div className="text-sm text-slate-500 text-center py-12">Não foi possível carregar os relatórios.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportCard icon={Users} label="Pilotos cadastrados" value={stats.pilots} accent="text-amber-400" />
        <ReportCard icon={TrendingUp} label="Aeronaves" value={stats.aircraft} accent="text-sky-400" />
        <ReportCard icon={Clock} label="Voos registrados" value={stats.flights} accent="text-teal-400" />
        <ReportCard icon={FileText} label="Checklists" value={stats.checklists} accent="text-violet-400" />
      </div>

      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-slate-100">Documentos de treinamento</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-amber-400">{stats.trainingDocs}</p>
            <p className="text-xs text-slate-500 mt-0.5">Documentos ativos</p>
          </div>
          <Award className="w-8 h-8 text-slate-700" />
        </div>
      </div>

      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
        <h3 className="font-semibold text-slate-100 mb-3">Relatórios disponíveis</h3>
        <ul className="space-y-2 text-sm text-slate-400">
          <li className="flex items-center gap-2"><FileText className="w-4 h-4 text-slate-600" /> Relatório de progresso de treinamento por piloto</li>
          <li className="flex items-center gap-2"><FileText className="w-4 h-4 text-slate-600" /> Relatório de certificados emitidos e validade</li>
          <li className="flex items-center gap-2"><FileText className="w-4 h-4 text-slate-600" /> Relatório de simulados e desempenho</li>
          <li className="flex items-center gap-2"><FileText className="w-4 h-4 text-slate-600" /> Relatório de vencimentos e treinamentos recorrentes</li>
        </ul>
        <p className="text-xs text-slate-500 mt-3 italic">Relatórios detalhados serão disponibilizados conforme o módulo de progresso for implementado.</p>
      </div>
    </div>
  );
}

function ReportCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
      <Icon className="w-5 h-5 text-slate-400 mb-2" />
      <p className={`text-2xl font-bold tracking-tight ${accent}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function AuditoriaTab({ level }) {
  const [logs, setLogs] = useState(null);

  useEffect(() => {
    if (level === "admin_geral") {
      base44.entities.AccessAuditLog.list("-created_date", 200)
        .then(setLogs)
        .catch(() => setLogs([]));
    } else {
      setLogs([]);
    }
  }, [level]);

  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-700/60">
        <h3 className="font-semibold text-slate-100">Auditoria de acessos e ações administrativas</h3>
        {level !== "admin_geral" && (
          <p className="text-xs text-amber-400 mt-1">Apenas Administrador Geral pode visualizar os registros de auditoria.</p>
        )}
      </div>
      <div className="p-5">
        {!logs ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">
            {level === "admin_geral" ? "Nenhum registro de auditoria encontrado." : "Você não tem permissão para visualizar os registros de auditoria."}
          </p>
        ) : (
          <ul className="space-y-3">
            {logs.map((l) => (
              <li key={l.id} className="border border-slate-700/50 rounded-xl px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-200">{l.action}</p>
                  <p className="text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(l.created_at || l.created_date).toLocaleString("pt-BR")}
                  </p>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {l.actor_name && <>Por: {l.actor_name}</>}
                  {l.target_name && <> · Afetado: {l.target_name}</>}
                </p>
                {l.details && <p className="text-xs text-slate-400 mt-1">{l.details}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}