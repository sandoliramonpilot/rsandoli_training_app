import React, { useMemo, useState } from "react";
import { MISSION_LABELS } from "@/lib/checklistData";
import { Search, Star, ClipboardCheck, CheckCircle2, AlertTriangle, Eye, Copy } from "lucide-react";

export default function ChecklistHistoryList({ records, onView, onDuplicate, onToggleFavorite }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) =>
      [r.date, r.aircraft_registration, r.pic_name, MISSION_LABELS[r.mission_type]].filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [records, query]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por data, aeronave, piloto ou missão…"
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#1A1D25] border border-slate-700/60 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 px-6 py-16 text-center">
          <ClipboardCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Nenhum checklist registrado ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const ok = r.status === "ok";
            return (
              <div key={r.id} className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-100">{r.aircraft_registration || "—"}</p>
                    <span className="text-xs text-slate-600">·</span>
                    <p className="text-sm text-slate-400">{MISSION_LABELS[r.mission_type] || r.mission_type}</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {r.date ? new Date(r.date).toLocaleDateString("pt-BR") : "—"} · {r.start_time || "—"}–{r.end_time || "—"} · PIC: {r.pic_name || "—"}
                    {r.sic_name ? ` · SIC: ${r.sic_name}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => onToggleFavorite(r)} className="p-1.5 text-slate-500 hover:text-amber-400">
                    {r.favorite ? <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> : <Star className="w-4 h-4" />}
                  </button>
                  <button onClick={() => onDuplicate(r)} className="p-1.5 text-slate-500 hover:text-sky-400" title="Duplicar checklist">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => onView(r)} className="p-1.5 text-slate-500 hover:text-slate-200" title="Visualizar">
                    <Eye className="w-4 h-4" />
                  </button>
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${ok ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" : "text-amber-400 bg-amber-500/10 border-amber-500/30"}`}>
                    {ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    {ok ? "OK" : "Pendências"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}