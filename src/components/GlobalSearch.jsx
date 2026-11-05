import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useProfile } from "@/lib/ProfileContext";
import { can } from "@/lib/accessControl";
import { getTraining, TREINAMENTOS_GERAIS } from "@/lib/trainingData";
import { Search, X, Loader2 } from "lucide-react";

export default function GlobalSearch({ open, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profileValue } = useProfile();

  const [termo, setTermo] = useState("");
  const [docs, setDocs] = useState([]);
  const [carregandoDocs, setCarregandoDocs] = useState(false);

  const training = getTraining(profileValue);

  // Índice estático: módulos e capítulos do treinamento ativo
  const indiceTreinamento = useMemo(() => {
    const modulos = training?.data?.modules ?? [];
    const itens = [];

    modulos.forEach((m) => {
      itens.push({
        title: m.title,
        type: training?.name ?? "Treinamento",
        path: "/training",
      });

      (m.chapters ?? []).forEach((ch) => {
        itens.push({
          title: ch.title,
          type: `${training?.name ?? "Treinamento"} · ${m.title}`,
          path: "/training",
        });
      });
    });

    return itens;
  }, [training]);

  // Índice estático: treinamentos gerais
  const indiceGerais = useMemo(() => {
    const modulos = TREINAMENTOS_GERAIS?.modules ?? [];
    return modulos.map((m) => ({
      title: m.title,
      type: "Treinamentos Gerais",
      path: "/treinamentos-gerais",
    }));
  }, []);

  // Documentos do módulo ativo
  useEffect(() => {
    if (!open || !profileValue || !training) {
      setDocs([]);
      return;
    }

    let cancelado = false;
    setCarregandoDocs(true);

    base44.entities.TrainingDocument
      .filter(
        {
          aircraftProfile: profileValue,
          discipline: training.discipline,
          status: "active",
        },
        null,
        200
      )
      .then((lista) => {
        if (!cancelado) setDocs(lista ?? []);
      })
      .catch(() => {
        if (!cancelado) setDocs([]);
      })
      .finally(() => {
        if (!cancelado) setCarregandoDocs(false);
      });

    return () => {
      cancelado = true;
    };
  }, [open, profileValue, training]);

  const indiceDocumentos = useMemo(
    () =>
      docs.map((d) => ({
        title: d.title || d.file_name || "Documento",
        type: `Documento · ${training?.name ?? ""}`,
        path: "/training",
      })),
    [docs, training]
  );

  const resultados = useMemo(() => {
    const t = termo.trim().toLowerCase();
    if (t.length < 2) return [];

    const todos = [
      ...(can(user, "treinamentos_gerais", "visualizar") ? indiceGerais : []),
      ...(can(user, "aw119_training", "visualizar") ||
      can(user, "h125_training", "visualizar")
        ? [...indiceTreinamento, ...indiceDocumentos]
        : []),
    ];

    return todos
      .filter((i) => i.title?.toLowerCase().includes(t))
      .slice(0, 20);
  }, [termo, indiceTreinamento, indiceDocumentos, indiceGerais, user]);

  const irPara = (item) => {
    navigate(item.path);
    setTermo("");
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center pt-24 px-4">
      <div className="w-full max-w-xl bg-[#1A1D25] rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/60">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            autoFocus
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Buscar módulos, capítulos e documentos..."
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 outline-none"
          />
          {carregandoDocs && (
            <Loader2 className="w-4 h-4 animate-spin text-amber-500 shrink-0" />
          )}
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {termo.trim().length >= 2 && (
          <div className="max-h-80 overflow-auto">
            {resultados.length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-500 text-center">
                Nenhum resultado para "{termo}".
              </p>
            ) : (
              resultados.map((r, i) => (
                <button
                  key={`${r.path}-${i}`}
                  onClick={() => irPara(r)}
                  className="w-full text-left px-4 py-2.5 hover:bg-white/[0.03] border-b border-slate-700/30 last:border-0"
                >
                  <p className="text-sm text-slate-200">{r.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{r.type}</p>
                </button>
              ))
            )}
          </div>
        )}

        {termo.trim().length < 2 && (
          <p className="px-4 py-6 text-xs text-slate-500 text-center">
            Digite ao menos 2 caracteres.
          </p>
        )}
      </div>
    </div>
  );
}
