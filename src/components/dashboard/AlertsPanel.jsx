import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { collectExpiries, expiryStatus, EXPIRY_COLORS } from "@/lib/pilotUtils";
import {
  AlertTriangle, Plane, Users, ChevronRight, ShieldAlert,
  HeartPulse, Award, FileText, CalendarClock, XCircle,
} from "lucide-react";

const HORIZON_DAYS = 90;

// Badge por tipo de item
const KIND_META = {
  CMA: { label: "CMA", icon: HeartPulse, color: "text-rose-300 bg-rose-500/10 border-rose-500/30" },
  Habilitação: { label: "Licença", icon: Award, color: "text-amber-300 bg-amber-500/10 border-amber-500/30" },
  Curso: { label: "Curso", icon: FileText, color: "text-sky-300 bg-sky-500/10 border-sky-500/30" },
  Documento: { label: "Documento", icon: FileText, color: "text-violet-300 bg-violet-500/10 border-violet-500/30" },
  Endosso: { label: "Endosso", icon: Award, color: "text-teal-300 bg-teal-500/10 border-teal-500/30" },
  "Documento técnico": { label: "Doc. técnico", icon: FileText, color: "text-slate-300 bg-slate-600/20 border-slate-600/40" },
};

// Faixas de antecedência
const THRESHOLDS = [
  { id: "expired", label: "Vencidos", min: -Infinity, max: -1, icon: XCircle, tone: "text-rose-400", card: "border-rose-500/30 bg-rose-500/5" },
  { id: "30", label: "≤ 30 dias", min: 0, max: 30, icon: AlertTriangle, tone: "text-orange-400", card: "border-orange-500/30 bg-orange-500/5" },
  { id: "60", label: "31 – 60 dias", min: 31, max: 60, icon: CalendarClock, tone: "text-yellow-400", card: "border-yellow-500/30 bg-yellow-500/5" },
  { id: "90", label: "61 – 90 dias", min: 61, max: 90, icon: CalendarClock, tone: "text-sky-400", card: "border-sky-500/30 bg-sky-500/5" },
];

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Pilot.list().catch(() => []),
      base44.entities.LibraryDocument.list().catch(() => []),
    ]).then(([pilots, docs]) => {
      const items = [];

      pilots.forEach((p) => {
        const exps = collectExpiries(p)
          .map((e) => ({ ...e, ...expiryStatus(e.date) }))
          .filter((e) => e.days !== null && e.days <= HORIZON_DAYS);
        exps.forEach((e) => {
          items.push({
            type: "pilot",
            id: `${p.id}_${e.label}_${e.date}`,
            pilotId: p.id,
            pilotName: p.full_name || p.war_name || "Piloto",
            label: e.label,
            kind: e.kind,
            date: e.date,
            days: e.days,
            status: e.status,
          });
        });
      });

      docs.forEach((d) => {
        if (!d.validity_date) return;
        const st = expiryStatus(d.validity_date);
        if (st.days === null || st.days > HORIZON_DAYS) return;
        items.push({
          type: "aircraft",
          id: d.id,
          aircraftId: d.aircraft_id,
          aircraftRegistration: d.aircraft_registration || "—",
          label: d.title,
          kind: "Documento técnico",
          date: d.validity_date,
          days: st.days,
          status: st.status,
        });
      });

      items.sort((a, b) => a.days - b.days);
      setAlerts(items);
    });
  }, []);

  // Contagem por faixa — somente licenças e CMA
  const thresholdCounts = useMemo(() => {
    const counts = { expired: 0, "30": 0, "60": 0, "90": 0 };
    if (!alerts) return counts;
    alerts.forEach((a) => {
      if (a.kind !== "Habilitação" && a.kind !== "CMA") return;
      const t = THRESHOLDS.find((th) => a.days >= th.min && a.days <= th.max);
      if (t) counts[t.id]++;
    });
    return counts;
  }, [alerts]);

  // Agrupar todos os alertas por faixa
  const grouped = useMemo(() => {
    const g = { expired: [], "30": [], "60": [], "90": [] };
    if (!alerts) return g;
    alerts.forEach((a) => {
      const t = THRESHOLDS.find((th) => a.days >= th.min && a.days <= th.max);
      if (t) g[t.id].push(a);
    });
    return g;
  }, [alerts]);

  const totalLicenseCma = thresholdCounts.expired + thresholdCounts["30"] + thresholdCounts["60"] + thresholdCounts["90"];

  if (!alerts) {
    return (
      <div className="rounded-2xl border border-slate-700/60 bg-[#1A1D25] p-6 flex items-center justify-center">
        <div className="w-6 h-6 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (alerts.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/[0.06] to-[#1A1D25] overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-100 text-sm">Alertas de Vencimento — Licenças e CMA</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Notificação automática com 90, 60 e 30 dias de antecedência
            </p>
          </div>
        </div>
        <Link to="/pilotos" className="text-xs font-medium text-amber-400 hover:text-amber-300">Pilotos →</Link>
      </div>

      {/* Cartões de resumo por faixa */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-5 py-4">
        {THRESHOLDS.map((th) => {
          const Icon = th.icon;
          const count = thresholdCounts[th.id];
          return (
            <div key={th.id} className={`rounded-xl border p-3 ${th.card}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${th.tone}`} />
                <span className="text-xs font-medium text-slate-400">{th.label}</span>
              </div>
              <p className={`text-2xl font-bold tracking-tight ${th.tone}`}>{count}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">licenças / CMA</p>
            </div>
          );
        })}
      </div>

      {/* Lista agrupada por faixa */}
      <div className="border-t border-slate-700/40">
        {THRESHOLDS.map((th) => {
          const items = grouped[th.id];
          if (!items || items.length === 0) return null;
          const Icon = th.icon;
          return (
            <div key={th.id}>
              {/* Faixa header */}
              <div className="flex items-center gap-2 px-5 py-2 bg-[#12141A] border-b border-slate-700/40">
                <Icon className={`w-3.5 h-3.5 ${th.tone}`} />
                <span className={`text-xs font-semibold uppercase tracking-wider ${th.tone}`}>{th.label}</span>
                <span className="text-xs text-slate-500">· {items.length} item(ns)</span>
              </div>
              {/* Itens */}
              <ul className="divide-y divide-slate-700/30">
                {items.slice(0, 12).map((a) => {
                  const color = EXPIRY_COLORS[a.status] || EXPIRY_COLORS.none;
                  const isPilot = a.type === "pilot";
                  const km = KIND_META[a.kind] || KIND_META["Documento técnico"];
                  const KIcon = km.icon;
                  return (
                    <li key={a.id}>
                      <Link
                        to={isPilot ? "/pilotos" : "/biblioteca"}
                        className="flex items-center gap-3 px-5 py-2.5 hover:bg-amber-500/[0.04] transition-colors"
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${km.color}`}>
                          <KIcon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-100 truncate">
                            {isPilot ? a.pilotName : a.aircraftRegistration}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            <span className="text-slate-400">{km.label}</span>
                            {a.label ? `: ${a.label}` : ""}
                            {" · "}
                            {new Date(a.date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${color.pill}`}>
                          {a.status === "expired" ? `Vencido ${Math.abs(a.days)}d` : `${a.days}d`}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {items.length > 12 && (
                <div className="px-5 py-2 text-center text-xs text-slate-500 border-b border-slate-700/30">
                  +{items.length - 12} outro(s) nesta faixa — ver módulo Pilotos
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalLicenseCma === 0 && alerts.length > 0 && (
        <div className="px-5 py-3 border-t border-slate-700/40 text-center">
          <span className="text-xs text-emerald-400 font-medium">
            ✓ Nenhuma licença ou CMA vencendo nos próximos 90 dias
          </span>
        </div>
      )}
    </div>
  );
}