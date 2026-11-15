import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/ProfileContext";
import { useAuth } from "@/lib/AuthContext";
import { Megaphone, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import {
  isAplicavel,
  isDestinadoAo,
  isDirecionado,
  parseAnexos,
  fmtData,
} from "@/lib/avisoUtils";
import AnexoButton from "@/components/avisos/AnexoButton";
import AvisoDestaqueCard from "@/components/avisos/AvisoDestaqueCard";

export default function AvisosPanel() {
  const { profileValue } = useProfile();
  const { user } = useAuth();
  const [avisos, setAvisos] = useState(null);
  const [pilotId, setPilotId] = useState(null);
  const [abertoId, setAbertoId] = useState(null);

  useEffect(() => {
    base44.entities.Aviso.filter({ publicado: true }, { sort: "-created_date", limit: 30 })
      .then((page) => setAvisos(page.items))
      .catch(() => setAvisos([]));
  }, []);

  // Identifica o cadastro de piloto do usuário logado para os avisos direcionados.
  useEffect(() => {
    if (!user?.id) {
      setPilotId(null);
      return;
    }
    base44.entities.Pilot.filter({}, { sort: "full_name", limit: 300 })
      .then((page) => {
        const items = page.items || [];
        const email = String(user.email || "").toLowerCase();
        const meu =
          items.find((p) => p.user_id === user.id) ||
          items.find((p) => p.email_login && String(p.email_login).toLowerCase() === email) ||
          items.find((p) => p.email && String(p.email).toLowerCase() === email);
        setPilotId(meu?.id || null);
      })
      .catch(() => setPilotId(null));
  }, [user?.id, user?.email]);

  const aplicaveis = (avisos || []).filter(
    (a) => isAplicavel(a, profileValue) && isDestinadoAo(a, pilotId)
  );
  const destaques = aplicaveis.filter((a) => isDirecionado(a) || a.importante);
  const demais = aplicaveis.filter((a) => !destaques.some((d) => d.id === a.id));

  return (
    <section id="avisos" className="bg-[#1A1D25] rounded-2xl border border-slate-700/60 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60">
        <h2 className="font-semibold text-slate-100 inline-flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-amber-400" /> Avisos e recomendações
        </h2>
        {avisos && (
          <span className="text-xs text-slate-500">
            {aplicaveis.length} {aplicaveis.length === 1 ? "aviso" : "avisos"}
          </span>
        )}
      </div>

      <div className="px-6 py-4 space-y-3">
        {!avisos ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
          </div>
        ) : aplicaveis.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Nenhum aviso publicado para o seu perfil de aeronave.
          </p>
        ) : (
          <>
            {destaques.map((a) => (
              <AvisoDestaqueCard key={a.id} aviso={a} />
            ))}

            {demais.length > 0 && (
              <ul className="divide-y divide-slate-700/40">
                {demais.map((a) => {
                  const open = abertoId === a.id;
                  const anexos = parseAnexos(a);
                  return (
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={() => setAbertoId(open ? null : a.id)}
                        className="w-full flex items-center gap-2 py-3 text-left"
                      >
                        <span className="text-sm font-medium text-slate-200 flex-1 truncate">
                          {a.titulo}
                        </span>
                        <span className="text-[11px] text-slate-500 shrink-0">
                          {fmtData(a.data_publicacao)}
                        </span>
                        {open ? (
                          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                      </button>
                      {open && (
                        <div className="pb-4 space-y-3">
                          <p className="text-sm text-slate-400 whitespace-pre-line">{a.texto}</p>
                          {anexos.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {anexos.map((f, i) => (
                                <AnexoButton key={`${f.name}-${i}`} anexo={f} />
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </section>
  );
}