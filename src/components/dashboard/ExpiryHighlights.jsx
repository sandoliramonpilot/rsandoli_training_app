import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { collectExpiries, expiryStatus, EXPIRY_COLORS } from "@/lib/pilotUtils";
import { useProfile } from "@/lib/ProfileContext";
import { ShieldAlert, Users, Plane, ChevronRight, CheckCircle2, AlertTriangle, XCircle, CalendarClock } from "lucide-react";

const HORIZON_DAYS = 90;

// Faixa de urgência pelo menor número de dias (pior item do piloto/aeronave)
function worstBucket(days) {
  if (days < 0) return "expired";
  if (days <= 30) return "30";
  if (days <= 60) return "60";
  return "90";
}

const BUCKET_META = {
  expired: { tone: "text-rose-400", border: "border-l-rose-500", chip: "bg-rose-500/10 text-rose-300 border-rose-500/30", icon: XCircle, label: "Vencido" },
  "30": { tone: "text-orange-400", border: "border-l-orange-500", chip: "bg-orange-500/10 text-orange-300 border-orange-500/30", icon: AlertTriangle, label: "≤ 30 dias" },
  "60": { tone: "text-yellow-400", border: "border-l-yellow-500", chip: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30", icon: CalendarClock, label: "31 – 60 dias" },
  "90": { tone: "text-sky-400", border: "border-l-sky-500", chip: "bg-sky-500/10 text-sky-300 border-sky-500/30", icon: CalendarClock, label: "61 – 90 dias" },
};

export default function ExpiryHighlights() {
  const { profileFilter } = useProfile();
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Pilot.filter(profileFilter).catch(() => []),
      base44.entities.LibraryDocument.filter(profileFilter).catch(() => []),
    ]).then(([pilots, docs]) => {
      // Pilotos: agrega todos os vencimentos ≤ 90 dias
      const pilotAlerts = [];
      pilots.forEach((p) => {
        const exps = collectExpiries(p)
          .map((e) => ({ ...e, ...expiryStatus(e.date) }))
          .filter((e) => e.days !== null && e.days <= HORIZON_DAYS);
        if (!exps.length) return;
        const worst = exps.reduce((a, b) => (a.days < b.days ? a : b));
        pilotAlerts.push({
          id: p.id,
          name: p.full_name || p.war_name || "Piloto",
          count: exps.length,
          worstDays: worst.days,
          worstLabel: worst.label,
          bucket: worstBucket(worst.days),
        });
      });
      pilotAlerts.sort((a, b) => a.worstDays - b.worstDays);

      // Aeronaves: agrega documentos técnicos com validity_date ≤ 90 dias
      const byAircraft = new Map();
      docs.forEach((d) => {
        if (!d.validity_date) return;
        const st = expiryStatus(d.validity_date);
        if (st.days === null || st.days > HORIZON_DAYS) return;
        const key = d.aircraft_id || d.aircraft_registration || d.id;
        const reg = d.aircraft_registration || "—";
        if (!byAircraft.has(key)) byAircraft.set(key, { id: key, registration: reg, items: [] });
        byAircraft.get(key).items.push({ title: d.title, days: st.days, label: st.label });
      });
      const aircraftAlerts = [];
      byAircraft.forEach((a) => {
        const worst = a.items.reduce((x, y) => (x.days < y.days ? x : y));
        aircraftAlerts.push({
          id: a.id,
          registration: a.registration,
          count: a.items.length,
          worstDays: worst.days,
          worstLabel: worst.title,
          bucket: worstBucket(worst.days),
        });
      });
      aircraftAlerts.sort((a, b) => a.worstDays - b.worstDays);

      setData({ pilotAlerts, aircraftAlerts });
    });
  }, [profileFilter]);

  if (!data) {
    return (
      <div className="rounded-2xl border border-slate-700/60 bg-[#1A1D25] p-6 flex items-center justify-center">
        <div className="w-6 h-6 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  const { pilotAlerts, aircraftAlerts } = data;
  const total = pilotAlerts.length + aircraftAlerts.length;
  if (total === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-[#1A1D25] overflow-hidden shadow-lg">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-amber-500/20 bg-gradient-to-r from-amber-500/[0.06] to-transparent">
        <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-slate-100 text-sm">Atenção — Vencimentos próximos</h2>
          <p className="text-xs text-slate-500 mt-0.5">Selos por piloto e aeronave (documentos e inspeções ≤ 90 dias)</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-700/40">
        <AlertColumn
          title="Pilotos em alerta"
          icon={Users}
          to="/pilotos"
          items={pilotAlerts}
          renderName={(p) => p.name}
          renderSub={(p) => `${p.count} ${p.count === 1 ? "item" : "itens"} · ${p.worstLabel}`}
        />
        <AlertColumn
          title="Aeronaves em alerta"
          icon={Plane}
          to="/biblioteca"
          items={aircraftAlerts}
          renderName={(a) => a.registration}
          renderSub={(a) => `${a.count} ${a.count === 1 ? "documento" : "documentos"} · ${a.worstLabel}`}
        />
      </div>
    </div>
  );
}

function AlertColumn({ title, icon: Icon, to, items, renderName, renderSub }) {
  return (
    <div className="px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
          <span className="text-xs text-slate-500">· {items.length}</span>
        </div>
        <Link to={to} className="text-xs font-medium text-amber-400 hover:text-amber-300">Ver →</Link>
      </div>

      {items.length === 0 ? (
        <div className="flex items-center gap-2 py-3 text-sm text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>Nenhum vencimento próximo</span>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.slice(0, 6).map((it) => {
            const meta = BUCKET_META[it.bucket];
            const MIcon = meta.icon;
            return (
              <li key={it.id}>
                <Link
                  to={to}
                  className={`flex items-center gap-3 rounded-lg border border-slate-700/50 border-l-2 ${meta.border} bg-[#12141A] px-3 py-2.5 hover:bg-slate-800/40 transition-colors`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${meta.chip}`}>
                    <MIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-100 truncate">{renderName(it)}</p>
                    <p className="text-xs text-slate-500 truncate">{renderSub(it)}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full border shrink-0 ${meta.chip}`}>
                    {it.worstDays < 0 ? `${Math.abs(it.worstDays)}d` : `${it.worstDays}d`}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                </Link>
              </li>
            );
          })}
          {items.length > 6 && (
            <li className="pt-1 text-center text-xs text-slate-500">+{items.length - 6} outro(s) — ver módulo</li>
          )}
        </ul>
      )}
    </div>
  );
}