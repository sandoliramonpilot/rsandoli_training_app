import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { getAccessLevel } from "@/lib/accessControl";
import { ShieldCheck, AlertTriangle, ClipboardCheck, ChevronRight, XCircle } from "lucide-react";

const PHASE_NAMES = {
  pre_voo: "Pré-Voo",
  pre_acionamento: "Pré-Acionamento",
  acionamento: "Acionamento",
  pos_acionamento: "Pós-Acionamento",
  decolagem: "Decolagem",
  corte_motor: "Corte de Motor",
};

export default function AprovacoesChecklist() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (getAccessLevel(user) !== "admin_geral") {
      setLoading(false);
      return;
    }
    Promise.all([
      base44.entities.ChecklistValidation.filter({ status: "pending" }).catch(() => []),
      base44.entities.ChecklistRecord
        .filter({}, { sort: "-created_date", limit: 200 })
        .then((r) => r.items)
        .catch(() => []),
    ]).then(([validations, records]) => {
      const result = [];

      validations.forEach((v) => {
        result.push({
          id: `val-${v.id}`,
          type: "pending",
          model: "H125",
          variant: v.variant,
          phaseId: v.phase_id,
          phaseName: v.phase_name || PHASE_NAMES[v.phase_id] || v.phase_id,
          date: v.created_date,
          discrepancyText: null,
        });
      });

      records.forEach((rec) => {
        const model = rec.aircraftProfile || "AW119";
        let phases = {};
        try {
          phases = JSON.parse(rec.phases_progress || "{}");
        } catch {
          phases = {};
        }
        const variant = phases.__variant || null;
        let foundDiscrepancy = false;

        Object.entries(phases).forEach(([key, val]) => {
          if (key === "__variant") return;
          if (val && typeof val === "object" && val.discrepancy && String(val.discrepancy).trim()) {
            foundDiscrepancy = true;
            result.push({
              id: `disc-${rec.id}-${key}`,
              type: "discrepancy",
              model,
              variant,
              phaseId: key,
              phaseName: PHASE_NAMES[key] || key,
              date: rec.date || rec.created_date,
              discrepancyText: val.discrepancy,
              aircraftReg: rec.aircraft_registration,
              picName: rec.pic_name,
            });
          }
        });

        if (!foundDiscrepancy && rec.justification && rec.justification.trim()) {
          result.push({
            id: `disc-${rec.id}-general`,
            type: "discrepancy",
            model,
            variant,
            phaseId: null,
            phaseName: "Geral",
            date: rec.date || rec.created_date,
            discrepancyText: rec.justification,
            aircraftReg: rec.aircraft_registration,
            picName: rec.pic_name,
          });
        }
      });

      setRows(result);
      setLoading(false);
    });
  }, [user]);

  const pendingCount = rows.filter((r) => r.type === "pending").length;
  const discrepancyCount = rows.filter((r) => r.type === "discrepancy").length;

  const filtered = useMemo(() => {
    if (filter === "pending") return rows.filter((r) => r.type === "pending");
    if (filter === "discrepancies") return rows.filter((r) => r.type === "discrepancy");
    return rows;
  }, [rows, filter]);

  if (getAccessLevel(user) !== "admin_geral") {
    return (
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 px-6 py-16 text-center">
        <XCircle className="w-10 h-10 text-rose-500/60 mx-auto mb-3" />
        <p className="text-sm text-slate-400">Acesso restrito ao Administrador Geral.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  const buildLink = (r) => {
    const params = new URLSearchParams();
    params.set("modelo", r.model);
    if (r.variant) params.set("variante", r.variant);
    if (r.phaseId) params.set("fase", r.phaseId);
    return `/checklist?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Administração</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
          Aprovações de Checklist
        </h1>
        <p className="text-slate-400 mt-2 text-sm">
          Fases aguardando aprovação técnica e discrepâncias registradas por pilotos
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SummaryCard icon={ShieldCheck} label="Aguardando aprovação" value={pendingCount} color="amber" />
        <SummaryCard icon={AlertTriangle} label="Com discrepâncias" value={discrepancyCount} color="rose" />
      </div>

      <div className="inline-flex bg-[#1A1D25] border border-slate-700/60 rounded-lg p-1 text-sm">
        <FilterTab label="Todos" active={filter === "all"} onClick={() => setFilter("all")} count={rows.length} />
        <FilterTab label="Pendentes" active={filter === "pending"} onClick={() => setFilter("pending")} count={pendingCount} />
        <FilterTab label="Discrepâncias" active={filter === "discrepancies"} onClick={() => setFilter("discrepancies")} count={discrepancyCount} />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 px-6 py-16 text-center">
          <ClipboardCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Nenhum registro pendente.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <Row key={r.id} row={r} link={buildLink(r)} />
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    amber: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    rose: "text-rose-400 border-rose-500/30 bg-rose-500/10",
  };
  return (
    <div className={`rounded-xl border ${colors[color]} px-5 py-4 flex items-center gap-4`}>
      <Icon className="w-8 h-8" />
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

function FilterTab({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-md font-medium transition-colors ${active ? "bg-amber-500 text-slate-900" : "text-slate-400"}`}
    >
      {label}{" "}
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? "bg-slate-900/20" : "bg-slate-700/40"}`}>
        {count}
      </span>
    </button>
  );
}

function Row({ row, link }) {
  const [expanded, setExpanded] = useState(false);
  const isPending = row.type === "pending";
  return (
    <div className="bg-[#1A1D25] rounded-xl border border-slate-700/60 overflow-hidden hover:border-amber-500/30 transition-colors">
      <Link to={link} className="flex items-center gap-4 px-4 py-3">
        <div
          className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
            isPending ? "bg-amber-500/15 text-amber-400" : "bg-rose-500/15 text-rose-400"
          }`}
        >
          {isPending ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                row.model === "H125"
                  ? "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                  : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {row.model === "H125" ? "H125" : "AW119"}
            </span>
            {row.variant && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-700/40 text-slate-400">
                {row.variant}
              </span>
            )}
            <span className="text-sm font-medium text-slate-200">{row.phaseName}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
            <span>{isPending ? "Aguarda aprovação técnica" : "Discrepância registrada"}</span>
            {row.date && <span>· {new Date(row.date).toLocaleDateString("pt-BR")}</span>}
            {row.aircraftReg && <span>· {row.aircraftReg}</span>}
            {row.picName && <span>· {row.picName}</span>}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
      </Link>
      {row.discrepancyText && (
        <div className="border-t border-slate-700/60">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="w-full text-left px-4 py-2 text-xs text-slate-500 hover:text-slate-300"
          >
            {expanded ? "Recolher" : "Ver discrepância"}
          </button>
          {expanded && (
            <p className="px-4 pb-3 text-sm text-slate-300 leading-relaxed">{row.discrepancyText}</p>
          )}
        </div>
      )}
    </div>
  );
}