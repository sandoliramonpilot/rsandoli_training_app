import React, { useEffect, useMemo, useState } from "react";
import {
  SUB_SECTIONS, PROCEDURES, CAS_MESSAGES, CAS_NOTES,
  EFIS_SOURCE, PERMANENT_WARNING, EDITORIAL_STATUS,
  getProceduresBySubSection, getProcedureById,
} from "@/lib/qrhEfisData";
import ProcedureDetail from "@/components/qrhEfis/ProcedureDetail";
import CasDatabase from "@/components/qrhEfis/CasDatabase";
import BackToDashboard from "@/components/BackToDashboard";
import {
  Search, ChevronLeft, Star, AlertTriangle, MessageSquare,
  BookOpen, FileText, GraduationCap, ClipboardList, Eye,
  Monitor, Gauge, Joystick, Navigation, Siren, RefreshCw,
  ShieldAlert, ChevronRight, X,
} from "lucide-react";

const SECTION_ICONS = {
  "visao-geral": Eye,
  "cas": MessageSquare,
  "displays": Monitor,
  "sensores": Gauge,
  "helipilot": Joystick,
  "miscompare": RefreshCw,
  "navegacao": Navigation,
  "htaws": ShieldAlert,
  "mensagens-cas": MessageSquare,
  "relacionados": BookOpen,
  "estudo": GraduationCap,
  "revisao": ClipboardList,
};

const FAV_KEY = "qrh_efis_favorites";

export default function QRHEfis() {
  const [activeSection, setActiveSection] = useState("visao-geral");
  const [selectedProcId, setSelectedProcId] = useState(null);
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    try {
      setFavorites(JSON.parse(localStorage.getItem(FAV_KEY) || "[]"));
    } catch { setFavorites([]); }
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((f) => {
      const next = f.includes(id) ? f.filter((x) => x !== id) : [...f, id];
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
      return next;
    });
  };

  const selectedProc = selectedProcId ? getProcedureById(selectedProcId) : null;

  // Busca global dentro da subseção ativa
  const sectionProcedures = useMemo(() => {
    if (selectedProc) return [];
    return getProceduresBySubSection(activeSection);
  }, [activeSection, selectedProc]);

  const filteredProcedures = useMemo(() => {
    if (!sectionProcedures.length) return [];
    const q = query.trim().toLowerCase();
    if (!q) return sectionProcedures;
    return sectionProcedures.filter((p) =>
      [p.title, p.titlePt, p.system, p.equipment, p.category, ...p.casMessages, p.page]
        .filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [sectionProcedures, query]);

  // Busca global (todas as subseções) quando há query e estamos na visão geral
  const globalResults = useMemo(() => {
    if (activeSection !== "visao-geral" || selectedProc) return [];
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PROCEDURES.filter((p) =>
      [p.title, p.titlePt, p.system, p.equipment, p.category, ...p.casMessages, p.page]
        .filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [query, activeSection, selectedProc]);

  const openProcedure = (id) => {
    setSelectedProcId(id);
    setQuery("");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold">Operações</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-1 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
            QRH-EFIS
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Genesys EFIS IDU-680 — Procedimentos de Emergência e Mau Funcionamento
          </p>
        </div>
        <BackToDashboard />
      </header>

      {/* Advertência permanente */}
      <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-4">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200 leading-relaxed font-medium">{PERMANENT_WARNING}</p>
        </div>
      </div>

      {selectedProc ? (
        // ===================== DETALHE DO PROCEDIMENTO =====================
        <div className="space-y-4">
          <button
            onClick={() => setSelectedProcId(null)}
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-amber-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar à lista
          </button>
          <ProcedureDetail
            proc={selectedProc}
            isFavorite={favorites.includes(selectedProc.id)}
            onToggleFavorite={() => toggleFavorite(selectedProc.id)}
          />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[220px_1fr] gap-5">
          {/* Sidebar de subseções */}
          <aside className="lg:sticky lg:top-4 lg:self-start">
            <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-2 lg:max-h-[calc(100vh-2rem)] overflow-y-auto">
              <nav className="space-y-0.5">
                {SUB_SECTIONS.map((s) => {
                  const Icon = SECTION_ICONS[s.id] || FileText;
                  const active = activeSection === s.id;
                  const count = s.id === "mensagens-cas" ? CAS_MESSAGES.length : getProceduresBySubSection(s.id).length;
                  return (
                    <button
                      key={s.id}
                      onClick={() => { setActiveSection(s.id); setQuery(""); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                        active
                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                          : "text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1 truncate">{s.label}</span>
                      {count > 0 && <span className="text-[10px] text-slate-500">{count}</span>}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Conteúdo */}
          <div className="min-w-0 space-y-4">
            {/* Busca (somente em subseções com procedimentos) */}
            {activeSection !== "visao-geral" && activeSection !== "cas" && activeSection !== "mensagens-cas" && activeSection !== "relacionados" && activeSection !== "estudo" && activeSection !== "revisao" && activeSection !== "htaws" && (
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar procedimento, mensagem CAS, sistema, página…"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1A1D25] border border-slate-700/60 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            )}

            {activeSection === "visao-geral" && <VisaoGeral globalResults={globalResults} onOpen={openProcedure} favorites={favorites} />}
            {activeSection === "cas" && <CasIntro />}
            {activeSection === "mensagens-cas" && <CasDatabase onSelectProcedure={openProcedure} />}
            {activeSection === "relacionados" && <Relacionados onOpen={openProcedure} />}
            {activeSection === "estudo" && <EstudoOverview onOpen={openProcedure} />}
            {activeSection === "revisao" && <RevisaoControl favorites={favorites} onOpen={openProcedure} />}
            {activeSection === "htaws" && <HtawsSection />}

            {/* Listas de procedimentos por subseção */}
            {["displays", "sensores", "helipilot", "miscompare", "navegacao"].includes(activeSection) && (
              <ProcedureList
                procedures={filteredProcedures}
                onOpen={openProcedure}
                favorites={favorites}
                emptyHint={query ? "Nenhum procedimento encontrado na busca." : "Nenhum procedimento nesta subseção."}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ===================== VISÃO GERAL =====================
function VisaoGeral({ globalResults, onOpen, favorites }) {
  const stats = {
    total: PROCEDURES.length,
    aprovados: PROCEDURES.filter((p) => p.status === "aprovado_consulta").length,
    pendentes: PROCEDURES.filter((p) => p.status !== "aprovado_consulta").length,
    cas: CAS_MESSAGES.length,
  };
  return (
    <div className="space-y-4">
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
        <h2 className="text-lg font-bold text-slate-100 mb-2">Visão Geral</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          O QRH-EFIS reúne os procedimentos de emergência e mau funcionamento do sistema Genesys EFIS IDU-680,
          conforme o <span className="text-amber-300 font-medium">{EFIS_SOURCE.document}</span>, {EFIS_SOURCE.section},
          Document No. <span className="font-mono text-amber-300">{EFIS_SOURCE.docNumber}</span>.
        </p>
        <p className="text-sm text-slate-400 leading-relaxed mt-2">
          Cada falha possui página individual. PFD e MFD estão separados. Piloto e copiloto estão separados.
          ADC e AHRS estão separados. ATT, HDG, ALT e IAS MISCOMP possuem páginas próprias. GPS FAIL e GPS MISCOMP estão separados.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Procedimentos" value={stats.total} tone="text-amber-400" />
        <StatCard label="Aprovados para consulta" value={stats.aprovados} tone="text-emerald-400" />
        <StatCard label="Pendentes de conferência" value={stats.pendentes} tone="text-amber-400" />
        <StatCard label="Mensagens CAS" value={stats.cas} tone="text-sky-400" />
      </div>

      {globalResults.length > 0 && (
        <div className="bg-[#1A1D25] rounded-2xl border border-amber-500/30 p-4">
          <p className="text-sm font-semibold text-amber-300 mb-2">Resultados da busca ({globalResults.length})</p>
          <div className="space-y-1.5">
            {globalResults.map((p) => (
              <button
                key={p.id}
                onClick={() => onOpen(p.id)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-left"
              >
                <span className="text-sm text-slate-200 truncate">{p.title}</span>
                <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Estrutura de Subseções</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {SUB_SECTIONS.map((s) => {
            const Icon = SECTION_ICONS[s.id] || FileText;
            return (
              <div key={s.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#12141A] border border-slate-700/40">
                <Icon className="w-4 h-4 text-amber-400/70 shrink-0" />
                <span className="text-sm text-slate-300">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {favorites.length > 0 && (
        <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Favoritos
          </h3>
          <div className="space-y-1.5">
            {favorites.map((fid) => {
              const p = getProcedureById(fid);
              if (!p) return null;
              return (
                <button
                  key={fid}
                  onClick={() => onOpen(fid)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-left"
                >
                  <span className="text-sm text-slate-200 truncate">{p.title}</span>
                  <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ===================== CAS INTRO (Seção 9) =====================
function CasIntro() {
  return (
    <div className="space-y-4">
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
        <h2 className="text-lg font-bold text-slate-100 mb-1">Crew Alerting System — CAS</h2>
        <p className="text-sm text-slate-400">
          Conforme as páginas 3-3 a 3-9 do documento fonte. A janela CAS apresenta mensagens de alerta no PFD e no MFD.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <ColorCard label="Warning" color="red" desc="Vermelho" />
        <ColorCard label="Caution" color="amber" desc="Âmbar / Amarelo" />
        <ColorCard label="Advisory" color="emerald" desc="Verde" />
      </div>

      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Apresentação e Funcionamento</h3>
        <ul className="space-y-2 text-sm text-slate-300">
          {[
            "Localização da janela CAS no PFD e no MFD",
            "Full Engine format e Half Engine format",
            "Quantidade de mensagens visíveis",
            "Funcionamento da Master Warning Light",
            "Funcionamento da Master Caution Light",
            "Reconhecimento das mensagens",
            "Alertas sonoros",
            "Priorização e expansão da lista",
            "Comportamento das mensagens após reconhecimento",
            "Rolagem da lista",
          ].map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-slate-600 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-[#1A1D25] rounded-2xl border border-amber-500/30 p-5">
        <h3 className="text-sm font-semibold text-amber-300 mb-3">Observações Específicas do Documento</h3>
        <ul className="space-y-2">
          {CAS_NOTES.map((note, i) => (
            <li key={i} className="text-sm text-slate-300 flex gap-2">
              <span className="text-amber-400 shrink-0">•</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <p className="text-sm text-amber-300/90 font-medium">CONTEÚDO PENDENTE DE CONFERÊNCIA NO DOCUMENTO ORIGINAL.</p>
        <p className="text-xs text-slate-500 mt-1">A descrição detalhada do CAS deve ser transcrita fielmente das páginas 3-3 a 3-9.</p>
      </div>
    </div>
  );
}

function ColorCard({ label, color, desc }) {
  const map = {
    red: "border-red-500/40 bg-red-950/30 text-red-300",
    amber: "border-amber-500/40 bg-amber-950/30 text-amber-300",
    emerald: "border-emerald-500/40 bg-emerald-950/30 text-emerald-300",
  };
  return (
    <div className={`rounded-xl border p-4 ${map[color]}`}>
      <p className="text-lg font-bold">{label}</p>
      <p className="text-xs opacity-80 mt-0.5">{desc}</p>
    </div>
  );
}

// ===================== PROCEDURE LIST =====================
function ProcedureList({ procedures, onOpen, favorites, emptyHint }) {
  if (procedures.length === 0) {
    return (
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 px-6 py-12 text-center">
        <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="text-sm text-slate-500">{emptyHint}</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {procedures.map((p) => {
        const st = EDITORIAL_STATUS[p.status] || EDITORIAL_STATUS.aguardando_conferencia;
        const fav = favorites.includes(p.id);
        return (
          <button
            key={p.id}
            onClick={() => onOpen(p.id)}
            className="w-full text-left bg-[#1A1D25] rounded-xl border border-slate-700/60 hover:border-amber-500/40 transition-colors p-4 group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-sm font-semibold text-slate-100 truncate">{p.title}</h3>
                  {fav && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />}
                </div>
                <p className="text-xs text-amber-400/70">{p.titlePt}</p>
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  {p.casMessages.map((m) => (
                    <span key={m} className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300">
                      {m}
                    </span>
                  ))}
                  <span className="text-[10px] text-slate-500">{p.system}</span>
                  <span className="text-[10px] text-slate-600">·</span>
                  <span className="text-[10px] text-slate-500 font-mono">p. {p.page}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${st.color}`}>{st.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ===================== RELACIONADOS =====================
function Relacionados({ onOpen }) {
  // Referências cruzadas — procedimentos que se referenciam
  const refs = [
    { from: "repeated-disturbances", to: "sas-1-off", label: "Repeated Disturbances → Failure of One SAS" },
    { from: "oscillatory-malfunction", to: "sas-1-off", label: "Oscillatory Malfunction → Failure of One SAS" },
    { from: "oscillatory-malfunction", to: "sas-2-off", label: "Oscillatory Malfunction → Failure of One SAS (SAS 2)" },
    { from: "gps-loss-nav-after-faf", to: "gps-miscomp", label: "GPS/FMS Loss after FAF → GPS MISCOMP" },
  ];
  return (
    <div className="space-y-4">
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
        <h2 className="text-lg font-bold text-slate-100 mb-1">Procedimentos Relacionados</h2>
        <p className="text-sm text-slate-400">Referências cruzadas entre procedimentos conforme o documento fonte.</p>
      </div>
      <div className="space-y-2">
        {refs.map((r, i) => {
          const toProc = getProcedureById(r.to);
          if (!toProc) return null;
          return (
            <button
              key={i}
              onClick={() => onOpen(r.to)}
              className="w-full text-left bg-[#1A1D25] rounded-xl border border-slate-700/60 hover:border-amber-500/40 transition-colors p-4"
            >
              <p className="text-xs text-slate-500 mb-1">{r.label}</p>
              <p className="text-sm font-medium text-slate-100">{toProc.title}</p>
              <p className="text-xs text-amber-400/70">{toProc.titlePt}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ===================== ESTUDO OVERVIEW =====================
function EstudoOverview({ onOpen }) {
  const studyProcs = PROCEDURES.filter((p) => p.studyContent);
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-teal-500/30 bg-teal-950/20 p-5">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-5 h-5 text-teal-400" />
          <h2 className="text-lg font-bold text-slate-100">Modo de Estudo</h2>
        </div>
        <p className="text-sm text-slate-400">
          Explicações didáticas separadas do procedimento oficial. Inclui descrição do sistema, significado da falha,
          lógica de reconfiguração, efeitos sobre Flight Director e HeliPilot, erros comuns e perguntas de revisão.
        </p>
      </div>
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Conteúdo Didático Disponível</h3>
        {studyProcs.length === 0 ? (
          <p className="text-sm text-slate-500">
            Conteúdo de estudo pendente de elaboração. As explicações didáticas serão adicionadas após a transcrição
            dos procedimentos oficiais, em bloco separado, sem alterar o procedimento aprovado.
          </p>
        ) : (
          <div className="space-y-2">
            {studyProcs.map((p) => (
              <button
                key={p.id}
                onClick={() => onOpen(p.id)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-left"
              >
                <span className="text-sm text-slate-200">{p.title}</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ===================== CONTROLE DE REVISÃO =====================
function RevisaoControl({ favorites, onOpen }) {
  const byStatus = useMemo(() => {
    const groups = {};
    PROCEDURES.forEach((p) => {
      const s = p.status;
      if (!groups[s]) groups[s] = [];
      groups[s].push(p);
    });
    return groups;
  }, []);

  return (
    <div className="space-y-4">
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
        <h2 className="text-lg font-bold text-slate-100 mb-1">Controle de Revisão</h2>
        <p className="text-sm text-slate-400">
          Status editorial de cada procedimento. Somente procedimentos "Aprovado para consulta" aparecem no modo de Consulta Rápida.
        </p>
      </div>

      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Documento Fonte</h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <KV label="Documento" value={EFIS_SOURCE.document} />
          <KV label="Seção" value={EFIS_SOURCE.section} />
          <KV label="Nº do documento" value={EFIS_SOURCE.docNumber} mono />
          <KV label="Aplicabilidade" value={EFIS_SOURCE.applicability} />
        </div>
        <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <p className="text-xs text-amber-300/90">
            O arquivo contém páginas com revisões diferentes (inicial jun/2021, Rev. C 13/dez/2021, Rev. D 06/mar/2023).
            A revisão é registrada por procedimento/página, conferida visualmente antes de salvar.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(EDITORIAL_STATUS).map(([sid, st]) => {
          const procs = byStatus[sid] || [];
          if (procs.length === 0) return null;
          return (
            <div key={sid} className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 bg-[#12141A] border-b border-slate-700/60">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${st.color}`}>{st.label}</span>
                <span className="text-xs text-slate-500">{procs.length} procedimento(s)</span>
              </div>
              <div className="divide-y divide-slate-700/40">
                {procs.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onOpen(p.id)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-2.5 hover:bg-white/[0.02] text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-slate-200 truncate">{p.title}</p>
                      <p className="text-xs text-slate-500">
                        {p.casMessages.join(", ") || "Sem CAS"} · p. {p.page}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===================== HTAWS =====================
function HtawsSection() {
  return (
    <div className="space-y-4">
      <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-5">
        <h2 className="text-lg font-bold text-slate-100 mb-1">Alertas HTAWS e Tráfego</h2>
        <p className="text-sm text-slate-400">
          Helicopter Terrain Awareness and Warning System e alertas de tráfego vinculados ao EFIS.
        </p>
      </div>
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <p className="text-sm text-amber-300/90 font-medium">CONTEÚDO PENDENTE DE CONFERÊNCIA NO DOCUMENTO ORIGINAL.</p>
        <p className="text-xs text-slate-500 mt-1">
          Os procedimentos de HTAWS e tráfego serão criados após identificação e conferência visual das páginas aplicáveis no documento fonte.
        </p>
      </div>
    </div>
  );
}

// ===================== HELPERS =====================
function StatCard({ label, value, tone }) {
  return (
    <div className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 p-4">
      <p className={`text-2xl font-bold tracking-tight ${tone}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function KV({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-3 py-1.5 border-b border-slate-700/30 last:border-0">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className={`text-slate-200 text-right truncate ${mono ? "font-mono text-xs" : ""}`}>{value || "—"}</span>
    </div>
  );
}