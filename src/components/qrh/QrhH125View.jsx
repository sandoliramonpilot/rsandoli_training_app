import React, { useMemo, useState, useEffect } from "react";
import {
  Siren, ClipboardCheck, Gauge, Search, AlertTriangle, FileText, Plane,
  ShieldCheck, Clock, BadgeCheck, XCircle,
} from "lucide-react";
import { useProfile } from "@/lib/ProfileContext";
import { H125_SUBVARIANTS } from "@/lib/h125Variants";
import {
  QRH_H125_VARIANT_KEYS,
  QRH_H125_GROUPS,
  getQrhH125Data,
  VALIDATION_STATUS_META,
} from "@/lib/qrhH125Data";
import ProcedureCard from "@/components/checklist/ProcedureCard";
import BackToDashboard from "@/components/BackToDashboard";

const GROUP_ICONS = { emergencias: Siren, normais: ClipboardCheck, limites: Gauge };

/**
 * Visualização do QRH para o módulo H125 (AS350 B2 / B3e).
 * validationMap: { [procedure_key]: { status, reviewed_by, reviewed_at } }
 * canValidate: boolean — exibe controles de validação administrativa
 */
export default function QrhH125View({ validationMap = {}, canValidate = false, onOpenValidation }) {
  const { profileValue, h125SubVariant, trocarSubvarianteH125 } = useProfile();
  const [group, setGroup] = useState("emergencias");
  const [query, setQuery] = useState("");

  const variantKey = QRH_H125_VARIANT_KEYS[h125SubVariant] || "B2";
  const data = useMemo(() => getQrhH125Data(variantKey), [variantKey]);
  const items = data[group] || [];

  // Reseta a busca ao trocar de variante
  useEffect(() => { setQuery(""); }, [variantKey]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (group === "limites") {
      const list = q
        ? items.filter((l) => l.titulo.toLowerCase().includes(q) || l.conteudo.join(" ").toLowerCase().includes(q))
        : items;
      return { type: "limites", list };
    }
    const filtered = q
      ? items.filter(
          (p) =>
            p.n.toLowerCase().includes(q) ||
            p.g.toLowerCase().includes(q) ||
            (p.p || "").toLowerCase().includes(q) ||
            (p.c || "").toLowerCase().includes(q)
        )
      : items;
    const byCat = {};
    filtered.forEach((p) => {
      if (!byCat[p.g]) byCat[p.g] = [];
      byCat[p.g].push(p);
    });
    return { type: "procedures", byCat, count: filtered.length };
  }, [items, group, query]);

  // Resumo de validação da variante ativa
  const variantSummary = useMemo(() => {
    const all = [...data.emergencias, ...data.normais];
    let approved = 0, pending = 0, rejected = 0;
    all.forEach((p) => {
      const st = validationMap[p.procedure_key]?.status || "pending";
      if (st === "approved") approved++;
      else if (st === "rejected") rejected++;
      else pending++;
    });
    return { total: all.length, approved, pending, rejected };
  }, [data, validationMap]);

  return (
    <div className="space-y-5">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Operações · H125</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-rose-300 to-rose-500 bg-clip-text text-transparent">
            QRH · H125
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Procedimentos de referência rápida para {data.label}. Consulte sempre o manual oficial a bordo.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canValidate && (
            <button
              onClick={onOpenValidation}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" /> Validação
            </button>
          )}
          <BackToDashboard />
        </div>
      </header>

      {/* Aviso de validação técnica pendente */}
      <div className="space-y-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Material transcrito da fonte fornecida, <strong>pendente de validação técnica aeronáutica</strong>. Não substitui o
            manual oficial do fabricante, que deve permanecer a bordo conforme exigências da ANAC. Itens marcados
            como “pendente de transcrição” estão aguardando conferência com o PDF de origem.
          </p>
        </div>
      </div>

      {/* Seletor de sub-variante + resumo de validação */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Plane className="w-4 h-4 text-amber-400" /> Variante:
        </div>
        <div className="inline-flex bg-[#1A1D25] border border-slate-700/60 rounded-lg p-1">
          {H125_SUBVARIANTS.map((v) => {
            const active = (QRH_H125_VARIANT_KEYS[v.id] || "B2") === variantKey;
            return (
              <button
                key={v.id}
                onClick={() => trocarSubvarianteH125(v.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  active ? "bg-amber-500 text-slate-900" : "text-slate-400 hover:text-slate-200"
                }`}
                title={v.description}
              >
                {v.label}
              </button>
            );
          })}
        </div>
        <a
          href={data.pdfUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition-colors"
        >
          <FileText className="w-3.5 h-3.5" /> PDF de origem
        </a>

        <div className="flex items-center gap-2 ml-auto text-xs">
          <ValidationBadge status="approved" count={variantSummary.approved} />
          <ValidationBadge status="pending" count={variantSummary.pending} />
          <ValidationBadge status="rejected" count={variantSummary.rejected} />
        </div>
      </div>

      {/* Abas de grupo */}
      <div className="flex flex-wrap items-center gap-2">
        {QRH_H125_GROUPS.map((g) => {
          const Icon = GROUP_ICONS[g.id] || Siren;
          const active = group === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setGroup(g.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                active
                  ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  : "bg-[#1A1D25] text-slate-400 border-slate-700/60 hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {g.label}
            </button>
          );
        })}

        <div className="relative ml-auto">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar procedimento…"
            className="w-full sm:w-72 pl-9 pr-3 py-2 rounded-lg bg-[#1A1D25] border border-slate-700/60 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/40"
          />
        </div>
      </div>

      {/* Conteúdo */}
      {grouped.type === "limites" ? (
        <LimitesList list={grouped.list} />
      ) : grouped.count === 0 ? (
        <div className="rounded-xl border border-slate-700/60 bg-[#1A1D25] px-6 py-12 text-center text-sm text-slate-500">
          Nenhum procedimento encontrado para a busca.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped.byCat).map(([cat, procs]) => (
            <section key={cat}>
              <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2.5 px-1">{cat}</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {procs.map((p, i) => (
                  <ProcedureCardWithStatus
                    key={`${cat}-${p.n}-${i}`}
                    proc={p}
                    status={validationMap[p.procedure_key]?.status || "pending"}
                    reviewedBy={validationMap[p.procedure_key]?.reviewed_by}
                    reviewedAt={validationMap[p.procedure_key]?.reviewed_at}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function ValidationBadge({ status, count }) {
  const meta = VALIDATION_STATUS_META[status];
  const Icon = status === "approved" ? BadgeCheck : status === "rejected" ? XCircle : Clock;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${meta.badge}`}>
      <Icon className="w-3 h-3" /> {meta.label}: {count}
    </span>
  );
}

function ProcedureCardWithStatus({ proc, status, reviewedBy, reviewedAt }) {
  const meta = VALIDATION_STATUS_META[status] || VALIDATION_STATUS_META.pending;
  return (
    <div className="relative">
      <ProcedureCard proc={proc} />
      <div className="absolute top-2 right-2 flex items-center gap-1.5">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${meta.badge}`}>
          {meta.label}
        </span>
      </div>
      {reviewedBy && status !== "pending" && (
        <p className="absolute bottom-1.5 right-3 text-[10px] text-slate-500">
          {reviewedBy}{reviewedAt ? ` · ${new Date(reviewedAt).toLocaleDateString("pt-BR")}` : ""}
        </p>
      )}
    </div>
  );
}

function LimitesList({ list }) {
  if (list.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700/60 bg-[#1A1D25] px-6 py-12 text-center text-sm text-slate-500">
        Nenhum limite encontrado para a busca.
      </div>
    );
  }
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {list.map((l) => (
        <div key={l.titulo} className="rounded-xl border border-slate-700/60 bg-[#1A1D25] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-700/60 bg-[#12141A]">
            <h4 className="text-sm font-semibold text-amber-300 tracking-tight">{l.titulo}</h4>
          </div>
          <ul className="px-4 py-3 space-y-1.5">
            {l.conteudo.map((c, i) => (
              <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-1.5">
                <span className="w-1 h-1 rounded-full bg-amber-500/60 shrink-0 mt-1.5" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}