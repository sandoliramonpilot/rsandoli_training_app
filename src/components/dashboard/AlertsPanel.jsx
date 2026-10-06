import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { collectExpiries, expiryStatus, EXPIRY_COLORS } from "@/lib/pilotUtils";
import { AlertTriangle, Plane, Users, ChevronRight, ShieldAlert } from "lucide-react";

const HORIZON_DAYS = 90; // janela de alerta (vencidos + próximos 90 dias)

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

  const { expiredCount, upcomingCount } = useMemo(() => {
    if (!alerts) return { expiredCount: 0, upcomingCount: 0 };
    const expired = alerts.filter((a) => a.status === "expired").length;
    return { expiredCount: expired, upcomingCount: alerts.length - expired };
  }, [alerts]);

  if (!alerts || alerts.length === 0) return null;

  const top = alerts.slice(0, 6);

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/[0.06] to-[#1A1D25] overflow-hidden shadow-lg">
      <div className="flex items-center justify-between px-5 py-4 border-b border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-100 text-sm">Alertas de vencimento</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {expiredCount > 0 && <span className="text-rose-400 font-medium">{expiredCount} vencido(s)</span>}
              {expiredCount > 0 && upcomingCount > 0 && <span className="text-slate-600"> · </span>}
              {upcomingCount > 0 && <span className="text-amber-400 font-medium">{upcomingCount} próximo(s)</span>}
              <span className="text-slate-600"> · próximos {HORIZON_DAYS}d</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/pilotos" className="text-xs font-medium text-amber-400 hover:text-amber-300">Pilotos →</Link>
          <Link to="/biblioteca" className="text-xs font-medium text-amber-400 hover:text-amber-300">Biblioteca →</Link>
        </div>
      </div>

      <ul className="divide-y divide-slate-700/40 max-h-[320px] overflow-y-auto">
        {top.map((a) => {
          const color = EXPIRY_COLORS[a.status] || EXPIRY_COLORS.none;
          const isPilot = a.type === "pilot";
          return (
            <li key={a.id}>
              <Link
                to={isPilot ? "/pilotos" : "/biblioteca"}
                className="flex items-center gap-3 px-5 py-3 hover:bg-amber-500/[0.04] transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isPilot ? "bg-teal-500/10 border border-teal-500/20" : "bg-sky-500/10 border border-sky-500/20"}`}>
                  {isPilot ? <Users className="w-4 h-4 text-teal-400" /> : <Plane className="w-4 h-4 text-sky-400" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-100 truncate">
                    {isPilot ? a.pilotName : a.aircraftRegistration}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {a.kind}: <span className="text-slate-400">{a.label}</span> · {new Date(a.date).toLocaleDateString("pt-BR")}
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

      {alerts.length > top.length && (
        <div className="px-5 py-2.5 border-t border-slate-700/40 text-center">
          <span className="text-xs text-slate-500">+{alerts.length - top.length} outro(s) alerta(s) — ver módulos</span>
        </div>
      )}
    </div>
  );
}