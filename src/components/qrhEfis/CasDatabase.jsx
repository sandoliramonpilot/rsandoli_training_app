import React, { useMemo, useState } from "react";
import { CAS_MESSAGES, EDITORIAL_STATUS, REVISION_PENDING } from "@/lib/qrhEfisData";
import { Search, MessageSquare, ChevronRight } from "lucide-react";

export default function CasDatabase({ onSelectProcedure }) {
  const [query, setQuery] = useState("");
  const [systemFilter, setSystemFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  const systems = useMemo(() => [...new Set(CAS_MESSAGES.map((m) => m.system))].sort(), []);

  const filtered = useMemo(() => {
    let list = CAS_MESSAGES;
    if (systemFilter !== "all") list = list.filter((m) => m.system === systemFilter);
    if (levelFilter !== "all") list = list.filter((m) => m.classification === levelFilter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((m) =>
        [m.message, m.system, m.equipment, m.faultState, m.page]
          .filter(Boolean).join(" ").toLowerCase().includes(q)
      );
    }
    return list;
  }, [query, systemFilter, levelFilter]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-400" /> Base de Mensagens CAS
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Mensagens do Crew Alerting System conforme o documento fonte. Busca por mensagem, sistema, componente, sintoma ou página.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar mensagem, sistema, componente, página…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1A1D25] border border-slate-700/60 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>
        <select value={systemFilter} onChange={(e) => setSystemFilter(e.target.value)} className="px-3 py-2.5 rounded-xl bg-[#1A1D25] border border-slate-700/60 text-sm text-slate-200">
          <option value="all">Sistema: Todos</option>
          {systems.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="px-3 py-2.5 rounded-xl bg-[#1A1D25] border border-slate-700/60 text-sm text-slate-200">
          <option value="all">Nível: Todos</option>
          <option value="Warning">Warning</option>
          <option value="Caution">Caution</option>
          <option value="Advisory">Advisory</option>
          <option value="Pendente de conferência">Pendente</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-700/60">
                <th className="px-4 py-3 font-medium">Mensagem CAS</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Classificação</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Sistema</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Equipamento</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Página</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {filtered.map((m) => {
                const st = EDITORIAL_STATUS[m.validationStatus] || EDITORIAL_STATUS.aguardando_conferencia;
                return (
                  <tr key={m.message} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-amber-300">{m.message}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <ClassBadge classification={m.classification} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-400">{m.system}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-400">{m.equipment}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-slate-500 font-mono text-xs">{m.page}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {m.procedureId && (
                        <button
                          onClick={() => onSelectProcedure(m.procedureId)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-amber-400 hover:text-amber-300"
                        >
                          Abrir <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-10">Nenhuma mensagem encontrada.</p>
        )}
      </div>

      <div className="text-xs text-slate-500">
        <p>• {filtered.length} mensagem(ns) exibida(s) de {CAS_MESSAGES.length} cadastrada(s).</p>
        <p>• Revisão: {REVISION_PENDING}. Classificação e cores conforme conferência visual no documento.</p>
      </div>
    </div>
  );
}

function ClassBadge({ classification }) {
  const map = {
    Warning: "border-red-500/30 text-red-300 bg-red-500/10",
    Caution: "border-amber-500/30 text-amber-300 bg-amber-500/10",
    Advisory: "border-emerald-500/30 text-emerald-300 bg-emerald-500/10",
    "Pendente de conferência": "border-slate-600/40 text-slate-400 bg-slate-700/20",
  };
  const cls = map[classification] || map["Pendente de conferência"];
  return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${cls}`}>{classification}</span>;
}