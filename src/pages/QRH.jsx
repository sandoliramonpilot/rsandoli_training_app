import React, { useState, useMemo, useEffect } from "react";
import { QRH_CATEGORIES, QRH_PROCEDURES, CRITICALITY_CONFIG } from "@/lib/qrhData";
import { Search, Star, StarOff, AlertTriangle, ShieldAlert, Info, ChevronRight } from "lucide-react";

export default function QRH() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("qrh_favorites") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("qrh_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id) => {
    setFavorites((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const filtered = useMemo(() => {
    let list = QRH_PROCEDURES;
    if (activeCategory === "favorites") {
      list = list.filter((p) => favorites.includes(p.id));
    } else if (activeCategory !== "all") {
      list = list.filter((p) => p.category === activeCategory);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        [p.title, p.condition, ...(p.symptoms || []), ...(p.immediateActions || [])]
          .join(" ").toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeCategory, query, favorites]);

  const catCount = (catId) => {
    if (catId === "all") return QRH_PROCEDURES.length;
    if (catId === "favorites") return favorites.length;
    return QRH_PROCEDURES.filter((p) => p.category === catId).length;
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-rose-600 font-semibold">Emergências</p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1">QRH Digital</h1>
        <p className="text-slate-500 mt-2 text-sm">Procedimentos de emergência de acesso rápido. 🔴 Emergência · 🟡 Cautela · 🔵 Informação</p>
      </header>

      {/* Search */}
      <div className="relative max-w-lg">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar procedimento…"
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
        />
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        <CategoryPill label="Todos" active={activeCategory === "all"} onClick={() => setActiveCategory("all")} count={catCount("all")} />
        <CategoryPill label="★ Favoritos" active={activeCategory === "favorites"} onClick={() => setActiveCategory("favorites")} count={catCount("favorites")} />
        {QRH_CATEGORIES.map((c) => (
          <CategoryPill key={c.id} label={c.name} active={activeCategory === c.id} onClick={() => setActiveCategory(c.id)} count={catCount(c.id)} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm px-6 py-16 text-center">
            <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Nenhum procedimento encontrado.</p>
          </div>
        ) : (
          filtered.map((p) => {
            const cfg = CRITICALITY_CONFIG[p.criticality];
            const isFav = favorites.includes(p.id);
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <button onClick={() => setSelected(p)} className="w-full text-left p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider">{p.category}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}
                      className="p-1 -mt-1 -mr-1 text-slate-300 hover:text-amber-500"
                    >
                      {isFav ? <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> : <StarOff className="w-4 h-4" />}
                    </button>
                  </div>
                  <h3 className="font-semibold text-slate-900 mt-2">{p.title}</h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{p.condition}</p>
                  <div className="flex items-center gap-1 text-xs text-rose-600 mt-3 font-medium">
                    Ver procedimento <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>
            );
          })
        )}
      </div>

      {selected && <ProcedureDetail procedure={selected} onClose={() => setSelected(null)} isFav={favorites.includes(selected.id)} onToggleFav={toggleFavorite} />}
    </div>
  );
}

function ProcedureDetail({ procedure, onClose, isFav, onToggleFav }) {
  const cfg = CRITICALITY_CONFIG[procedure.criticality];
  const Icon = procedure.criticality === "emergency" ? AlertTriangle : procedure.criticality === "caution" ? ShieldAlert : Info;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className={`sticky top-0 px-6 py-4 border-b ${cfg.border} ${cfg.bg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${cfg.bg} ${cfg.border} border flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${cfg.text}`} />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-slate-900">{procedure.title}</h2>
                <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => onToggleFav(procedure.id)} className="p-2 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-white/60">
                {isFav ? <Star className="w-5 h-5 fill-amber-400 text-amber-400" /> : <StarOff className="w-5 h-5" />}
              </button>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white/60 text-xl leading-none">×</button>
            </div>
          </div>
        </div>
        <div className="px-6 py-5 space-y-5">
          <Section title="Condição" color="slate">{procedure.condition}</Section>
          <Section title="Sintomas" color="amber">
            <ul className="space-y-1.5">
              {procedure.symptoms.map((s, i) => <li key={i} className="flex items-start gap-2 text-sm text-slate-600"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />{s}</li>)}
            </ul>
          </Section>
          <Section title="Ações Imediatas" color="red">
            <ol className="space-y-2">
              {procedure.immediateActions.map((a, i) => <li key={i} className="flex items-start gap-3 text-sm text-slate-700"><span className="w-5 h-5 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>{a}</li>)}
            </ol>
          </Section>
          <Section title="Ações Subsequentes" color="blue">
            <ol className="space-y-2">
              {procedure.subsequentActions.map((a, i) => <li key={i} className="flex items-start gap-3 text-sm text-slate-700"><span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>{a}</li>)}
            </ol>
          </Section>
          <Section title="Observações Operacionais" color="slate">
            <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-100">{procedure.notes}</p>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, color, children }) {
  const colorMap = { red: "text-red-700", amber: "text-amber-700", blue: "text-blue-700", slate: "text-slate-700" };
  return (
    <div>
      <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${colorMap[color]}`}>{title}</h4>
      {children}
    </div>
  );
}

function CategoryPill({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors border ${
        active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
      }`}
    >
      {label}
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? "bg-white/20" : "bg-slate-100"}`}>{count}</span>
    </button>
  );
}