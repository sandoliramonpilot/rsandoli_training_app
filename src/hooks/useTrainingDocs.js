import { useState, useEffect, useCallback, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/ProfileContext";

/**
 * Consulta documentos de treinamento escopados por aeronave + disciplina.
 * Chave composta: aircraftProfile + discipline.
 */
export function useTrainingDocs(discipline, options = {}) {
  const { profileValue } = useProfile();
  const [docs, setDocs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const status = options.status ?? "active";
  const extraKey = JSON.stringify(options.extra ?? {});
  const extra = useMemo(() => JSON.parse(extraKey), [extraKey]);

  const carregar = useCallback(async () => {
    if (!profileValue || !discipline) {
      setDocs([]);
      setCarregando(false);
      return;
    }
    setCarregando(true);
    setErro(null);
    try {
      const lista = await base44.entities.TrainingDocument.filter({
        aircraftProfile: profileValue,
        discipline,
        status,
        ...extra,
      });
      setDocs(lista ?? []);
    } catch (e) {
      setErro(e?.message || "Falha ao carregar documentos.");
      setDocs([]);
    } finally {
      setCarregando(false);
    }
  }, [profileValue, discipline, status, extra]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { docs, carregando, erro, recarregar: carregar, aircraftProfile: profileValue };
}

/** Grava um documento carimbando aircraftProfile e discipline automaticamente. */
export async function criarTrainingDoc(discipline, aircraftProfile, payload) {
  if (!aircraftProfile) throw new Error("Perfil de aeronave não definido.");
  return base44.entities.TrainingDocument.create({
    ...payload,
    discipline,
    aircraftProfile,
  });
}
