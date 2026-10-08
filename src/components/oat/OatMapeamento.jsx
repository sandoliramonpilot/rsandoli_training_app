import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  AlertTriangle, Search, Loader2, FileBarChart, Link2, Copy,
  CheckCircle2, XCircle, Info,
} from "lucide-react";

// Mapeamento somente leitura — não cria vínculos, não altera nem migra registros.
// Compara usuários, OATs e registros legados de Pilotos por nome/CPF/CANAC/e-mail
// e apresenta possíveis correspondências e inconsistências ao administrador.
export default function OatMapeamento({ onClose }) {
  const [oats, setOats] = useState(null);
  const [pilots, setPilots] = useState(null);
  const [users, setUsers] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all | linked | unlinked | duplicate | inconsistent

  useEffect(() => {
    base44.entities.Oat.list().then(setOats).catch(() => setOats([]));
    base44.entities.Pilot.list().then(setPilots).catch(() => setPilots([]));
    base44.functions.invoke("manageUsers", { action: "list" })
      .then((res) => setUsers(res.data?.users || []))
      .catch(() => setUsers([]));
  }, []);

  const analysis = useMemo(() => {
    if (!oats || !pilots || !users) return null;
    const norm = (s) => (s || "").trim().toLowerCase().replace(/\s+/g, " ");
    const normCpf = (s) => (s || "").replace(/\D/g, "");
    const results = [];

    // OATs vs Pilotos (possíveis correspondências legadas)
    oats.forEach((oat) => {
      const matches = pilots.filter((p) => {
        const byName = norm(p.full_name) === norm(oat.full_name) && norm(oat.full_name);
        const byCpf = normCpf(p.cpf) && normCpf(p.cpf) === normCpf(oat.cpf);
        const byCanac = p.anac_code && oat.anac_code && p.anac_code === oat.anac_code;
        return byName || byCpf || byCanac;
      });
      const linkedUser = users.find((u) => u.id === oat.user_id);
      const oatUsers = users.filter((u) => norm(u.full_name) === norm(oat.full_name) || (u.email && u.email === oat.email_login));
      const status = matches.length > 1 ? "duplicate" : matches.length === 1 ? "matched" : oat.user_id ? "linked" : "unlinked";
      results.push({
        type: "OAT",
        record: oat,
        legacyMatches: matches,
        linkedUser,
        oatUsers,
        status,
      });
    });

    // Usuários sem OAT
    users.forEach((u) => {
      const hasOat = oats.some((o) => o.user_id === u.id);
      if (!hasOat) {
        const possibleOat = oats.filter((o) => norm(o.full_name) === norm(u.full_name) || (o.email_login && u.email && o.email_login === u.email));
        results.push({
          type: "Usuário sem OAT",
          record: u,
          possibleOat,
          status: possibleOat.length > 1 ? "duplicate" : possibleOat.length === 1 ? "matched" : "unlinked",
        });
      }
    });

    return results;
  }, [oats, pilots, users]);

  const filtered = useMemo(() => {
    if (!analysis) return [];
    let list = analysis;
    if (filter !== "all") list = list.filter((r) => r.status === filter);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((r) => [r.record?.full_name, r.record?.email, r.record?.anac_code, r.record?.cpf].filter(Boolean).join(" ").toLowerCase().includes(q));
    return list;
  }, [analysis, filter, query]);

  const stats = useMemo(() => {
    if (!analysis) return { total: 0, linked: 0, unlinked: 0, matched: 0, duplicate: 0 };
    return {
      total: analysis.length,
      linked: analysis.filter((r) => r.status === "linked").length,
      unlinked: analysis.filter((r) => r.status === "unlinked").length,
      matched: analysis.filter((r) => r.status === "matched").length,
      duplicate: analysis.filter((r) => r.status === "duplicate").length,
    };
  }, [analysis]);

  if (!oats || !pilots || !users) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-[#1A1D25] w-full sm:max-w-4xl sm:rounded-2xl rounded-t-2xl shadow-2xl border border-slate-700/60 max-h-[94vh] flex flex-col">
        <div className="sticky top-0 bg-[#1A1D25]/95 backdrop-blur px-6 py-4 border-b border-slate-700/60 flex items-center justify-between z-10">
          <div>
            <h2 className="font-semibold text-lg text-slate-100 flex items-center gap-2"><Link2 className="w-5 h-5 text-amber-400" /> Mapeamento de Correspondências</h2>
            <p className="text-xs text-slate-500 mt-0.5">Somente leitura — não cria vínculos, não altera nem migra registros.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-700/40 text-xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { l: "Total", v: stats.total, c: "text-slate-300" },
              { l: "Vinculados", v: stats.linked, c: "text-emerald-300" },
              { l: "Sem vínculo", v: stats.unlinked, c: "text-amber-300" },
              { l: "Correspondência", v: stats.matched, c: "text-sky-300" },
              { l: "Duplicidade", v: stats.duplicate, c: "text-rose-300" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-slate-700/60 bg-[#12141A] p-3 text-center">
                <p className={`text-2xl font-bold ${s.c}`}>{s.v}</p>
                <p className="text-[11px] text-slate-500">{s.l}</p>
              </div>
            ))}
          </div>

          {/* Warning */}
          <div className="px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Este mapeamento é exclusivamente de leitura. Nenhum vínculo, migração ou alteração é realizada. Registros inconsistentes devem ser revisados manualmente pelo Administrador Geral.</span>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pesquisar por nome, CANAC, CPF, e-mail…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#12141A] border border-slate-700/60 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-[#12141A] border border-slate-700/60 text-sm text-slate-200"
            >
              <option value="all">Todos</option>
              <option value="linked">Vinculados</option>
              <option value="unlinked">Sem vínculo</option>
              <option value="matched">Correspondência possível</option>
              <option value="duplicate">Duplicidade</option>
            </select>
          </div>

          {/* Results */}
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">Nenhum registro encontrado com os filtros atuais.</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((r, i) => (
                <div key={i} className="rounded-xl border border-slate-700/60 bg-[#12141A] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{r.type}</span>
                        <StatusBadge status={r.status} />
                      </div>
                      <p className="text-sm font-semibold text-slate-100 mt-1 truncate">{r.record?.full_name || r.record?.email || "—"}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {r.record?.anac_code && `CANAC: ${r.record.anac_code} · `}
                        {r.record?.email_login || r.record?.email || ""}
                      </p>
                    </div>
                  </div>
                  {r.legacyMatches && r.legacyMatches.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-700/40">
                      <p className="text-xs font-medium text-amber-400 mb-1.5">Possível correspondência legada (Pilotos):</p>
                      {r.legacyMatches.map((m, j) => (
                        <div key={j} className="flex items-center gap-2 text-xs text-slate-400 py-1">
                          <Copy className="w-3 h-3 text-amber-400/60" />
                          <span>{m.full_name}</span>
                          {m.anac_code && <span className="text-slate-600">· CANAC {m.anac_code}</span>}
                          <span className="text-slate-600">· ID {m.id.slice(-8)}</span>
                        </div>
                      ))}
                      <p className="text-[11px] text-rose-300 mt-1.5 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Revisão necessária — confirmar manualmente antes de qualquer ação.
                      </p>
                    </div>
                  )}
                  {r.possibleOat && r.possibleOat.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-700/40">
                      <p className="text-xs font-medium text-amber-400 mb-1.5">Possível OAT correspondente:</p>
                      {r.possibleOat.map((m, j) => (
                        <div key={j} className="flex items-center gap-2 text-xs text-slate-400 py-1">
                          <Copy className="w-3 h-3 text-amber-400/60" />
                          <span>{m.full_name}</span>
                          {m.anac_code && <span className="text-slate-600">· CANAC {m.anac_code}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  {r.linkedUser && (
                    <div className="mt-3 pt-3 border-t border-slate-700/40">
                      <p className="text-xs text-emerald-300 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Vinculado a: {r.linkedUser.email}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-[#1A1D25]/95 backdrop-blur px-6 py-4 border-t border-slate-700/60 flex items-center justify-between">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <FileBarChart className="w-3.5 h-3.5" /> Relatório do estado anterior gerado em tempo real.
          </p>
          <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-400 text-slate-900">Fechar</button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    linked: { label: "Vinculado", cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30", Icon: CheckCircle2 },
    unlinked: { label: "Sem vínculo", cls: "bg-amber-500/10 text-amber-300 border-amber-500/30", Icon: AlertTriangle },
    matched: { label: "Correspondência", cls: "bg-sky-500/10 text-sky-300 border-sky-500/30", Icon: Copy },
    duplicate: { label: "Duplicidade", cls: "bg-rose-500/10 text-rose-300 border-rose-500/30", Icon: XCircle },
  };
  const s = map[status] || map.unlinked;
  const Icon = s.Icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${s.cls}`}>
      <Icon className="w-3 h-3" /> {s.label}
    </span>
  );
}