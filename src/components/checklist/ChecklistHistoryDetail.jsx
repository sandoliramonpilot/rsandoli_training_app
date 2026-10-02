import React, { useRef, useState } from "react";
import { CHECKLIST_PHASES, MISSION_LABELS } from "@/lib/checklistData";
import { X, Printer, FileDown, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function ChecklistHistoryDetail({ record, onClose }) {
  const printRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const progress = JSON.parse(record.phases_progress || "{}");

  const handlePrint = () => {
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Checklist ${record.aircraft_registration}</title>
      <style>body{font-family:sans-serif;padding:24px;color:#111} h1{font-size:18px} h2{font-size:14px;margin-top:16px} li{margin:3px 0;font-size:12px} .done{color:#059669} .pending{color:#dc2626} .just{color:#b45309}</style>
      </head><body>${printRef.current.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const canvas = await html2canvas(printRef.current, { backgroundColor: "#ffffff", scale: 2 });
      const pdf = new jsPDF("p", "mm", "a4");
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, w, h);
      pdf.save(`checklist_${record.aircraft_registration}_${record.date}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1A1D25] w-full max-w-2xl rounded-2xl border border-slate-700/60 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1A1D25]/95 backdrop-blur px-6 py-4 border-b border-slate-700/60 flex items-center justify-between">
          <h2 className="font-semibold text-slate-100">Detalhes do checklist</h2>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/5" title="Imprimir"><Printer className="w-4 h-4" /></button>
            <button onClick={handleExportPdf} disabled={exporting} className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/5" title="Exportar PDF"><FileDown className="w-4 h-4" /></button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/5"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div ref={printRef} className="px-6 py-5 bg-[#1A1D25] text-slate-200">
          <h1 className="font-bold text-lg">Checklist — {record.aircraft_registration}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {record.date ? new Date(record.date).toLocaleDateString("pt-BR") : "—"} · {record.start_time || "—"}–{record.end_time || "—"} ·{" "}
            {MISSION_LABELS[record.mission_type] || record.mission_type}
          </p>
          <div className="grid grid-cols-2 gap-2 mt-3 text-sm text-slate-300">
            <p>PIC: {record.pic_name} ({record.pic_canac || "—"})</p>
            <p>SIC: {record.sic_name || "—"} ({record.sic_canac || "—"})</p>
            <p>Horímetro inicial: {record.horimeter_initial || "—"}</p>
            <p>Combustível inicial: {record.fuel_initial || "—"}</p>
            <p>PAX: {record.pax_count ?? "—"}</p>
            <p>Executado por: {record.executed_by || "—"}</p>
            {record.finalized_at && (
              <>
                <p>Finalizado em: {new Date(record.finalized_at).toLocaleString("pt-BR")}</p>
                <p>Finalizado por: {record.finalized_by || "—"}</p>
              </>
            )}
          </div>

          {CHECKLIST_PHASES.map((phase) => {
            const items = progress[phase.id]?.items || [];
            if (items.length === 0) return null;
            return (
              <div key={phase.id} className="mt-5">
                <h2 className="font-semibold text-sm text-amber-400">{phase.title}</h2>
                <ul className="mt-2 space-y-1">
                  {items.map((it, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      {it.checked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : it.justification ? (
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className={it.checked ? "text-slate-300" : "text-slate-400"}>{it.text}</span>
                        {!it.checked && it.justification && (
                          <div className="text-xs text-amber-400/80 mt-0.5">Não executado, com justificativa: {it.justification}</div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}