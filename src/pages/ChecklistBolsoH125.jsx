import React, { useMemo, useState } from "react";
import { Siren, ClipboardCheck, Gauge, Search, AlertTriangle, FileText, Plane, Loader2 } from "lucide-react";
import { useProfile } from "@/lib/ProfileContext";
import { H125_SUBVARIANTS } from "@/lib/h125Variants";
import {
  H125_POCKET_SOURCE,
  H125_POCKET_GROUPS,
  H125_POCKET_VALIDATION,
  h125PocketVariant,
} from "@/lib/h125PocketChecklistData";
import ProcedureCard from "@/components/checklist/ProcedureCard";
import BackToDashboard from "@/components/BackToDashboard";

const VARIANT_MAP = { b2_vemd: "B2", b3e_arriel2d: "B3e" };
const VARIANT_KEY_TO_ID = { B2: "b2_vemd", B3e: "b3e_arriel2d" };

const GROUP_ICONS = { emergencias: Siren, normais: ClipboardCheck, limites: Gauge };

export default function ChecklistBolsoH125() {
  const { profileValue, h125SubVariant, trocarSubvarianteH125 } = useProfile();
  const [group, setGroup] = useState("emergencias");
  const [query, setQuery] = useState("");

  const variantKey = VARIANT_MAP[h125SubVariant] || "B2";
  const variant = h125PocketVariant(variantKey);
  const items = variant[group] || [];

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

  // Só faz sentido no módulo H125 (após os hooks).
  if (profileValue && profileValue !== "H125") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-6">
        <Plane className="w-10 h-10 text-slate-600 mb-3" />
        <p className="text-sm text-slate-400">
          O Checklist de Bolso é exclusivo do módulo H125 (AS350 B2/B3e).
        </p>
        <p className="text-xs text-slate-500 mt-1">Selecione o perfil H125 no seletor de aeronave para acessar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Operações · H125</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
            Checklist de Bolso
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Transcrição de referência rápida para {variant.label}. Consulte sempre o manual oficial a bordo.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <BackToDashboard />
        </div>
      </header>

      {/* Aviso de validação pendente */}
      <div className="space-y-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Material transcrito da fonte fornecida, <strong>pendente de validação técnica aeronáutica</strong>. Não substitui o
            manual oficial do fabricante, que deve permanecer a bordo conforme exigências da ANAC. Itens marcados
            como “pendente de transcrição” estão aguardando conferência com o PDF de origem.
          </p>
        </div>
        {H125_POCKET_VALIDATION?.crossCheckedPublicRefs && (
          <p className="text-xs text-amber-300/80 pl-7">
            Revisão de consistência em {H125_POCKET_VALIDATION.reviewedAt}: valores de cabeçalho (pesos, VNE, teto, motor)
            conferidos com referências públicas do fabricante. {H125_POCKET_VALIDATION.technicalSignOffPending
              ? "Validação técnica final ainda pendente: conferência por piloto/instrutor contra o RFM/POH vigente."
              : ""}
          </p>
        )}
      </div>

      {/* Seletor de sub-variante */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Plane className="w-4 h-4 text-amber-400" /> Variante:
        </div>
        <div className="inline-flex bg-[#1A1D25] border border-slate-700/60 rounded-lg p-1">
          {H125_SUBVARIANTS.map((v) => {
            const active = (VARIANT_MAP[v.id] || "B2") === variantKey;
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
          href={variant.pdfUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition-colors"
        >
          <FileText className="w-3.5 h-3.5" /> PDF de origem
        </a>
      </div>

      {/* Abas de grupo */}
      <div className="flex flex-wrap items-center gap-2">
        {H125_POCKET_GROUPS.map((g) => {
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
              <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2.5 px-1">
                {cat}
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {procs.map((p, i) => (
                  <ProcedureCard key={`${cat}-${p.n}-${i}`} proc={p} />
                ))}
              </div>
            </section>
          ))}
        </div>
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