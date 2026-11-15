import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Loader2, UserRound, X, Check } from "lucide-react";

// Seleção múltipla de pilotos destinatários de um aviso.
export default function PilotosDestinatariosPicker({ value = [], onChange }) {
  const [pilots, setPilots] = useState(null);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    base44.entities.Pilot.filter({}, { sort: "full_name", limit: 300 })
      .then((page) => setPilots(page.items || []))
      .catch(() => setPilots([]));
  }, []);

  const porId = useMemo(
    () => new Map((pilots || []).map((p) => [p.id, p])),
    [pilots]
  );

  const filtrados = useMemo(() => {
    const lista = (pilots || []).filter((p) => p.registration_status !== "inactive");
    const q = busca.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter((p) =>
      [p.full_name, p.war_name, p.email, p.email_login, p.anac_code, p.registration]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [pilots, busca]);

  const toggle = (id) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  const nomeDe = (id) => {
    const p = porId.get(id);
    return p?.full_name || "Piloto";
  };

  return (
    <div className="rounded-xl bg-background border border-border p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-300">
          Pilotos destinatários
        </p>
        <span className="text-[11px] text-slate-500">
          {value.length === 0
            ? "Nenhum selecionado — todos os pilotos do perfil recebem"
            : `${value.length} selecionado(s)`}
        </span>
      </div>

      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((id) => (
            <li
              key={id}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] bg-amber-500/10 text-amber-300 border border-amber-500/30"
            >
              {nomeDe(id)}
              <button
                type="button"
                onClick={() => toggle(id)}
                className="hover:text-rose-300"
                aria-label={`Remover ${nomeDe(id)}`}
              >
                <X className="w-3 h-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar piloto por nome, CANAC ou e-mail…"
          className="w-full pl-8 pr-3 py-2 rounded-lg bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
        />
      </div>

      <div className="max-h-48 overflow-y-auto rounded-lg border border-border divide-y divide-border">
        {!pilots ? (
          <div className="flex items-center justify-center py-5">
            <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
          </div>
        ) : filtrados.length === 0 ? (
          <p className="px-3 py-4 text-center text-[11px] text-slate-500">
            Nenhum piloto encontrado.
          </p>
        ) : (
          filtrados.map((p) => {
            const ativo = value.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-secondary/60 transition-colors"
              >
                <span
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    ativo
                      ? "bg-amber-500 border-amber-500 text-slate-900"
                      : "border-border text-transparent"
                  }`}
                >
                  <Check className="w-3 h-3" />
                </span>
                <UserRound className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-slate-200 truncate">
                    {p.full_name}
                  </span>
                  <span className="block text-[10px] text-slate-500 truncate">
                    {[p.war_name, p.email_login || p.email, p.aircraftProfile]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}