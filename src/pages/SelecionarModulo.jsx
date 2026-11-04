import React from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/lib/ProfileContext";
import { TRAINING_BY_AIRCRAFT } from "@/lib/trainingData";

export default function SelecionarModulo() {
  const { modulosPermitidos, trocarAeronave } = useProfile();
  const navigate = useNavigate();

  const escolher = (aeronave) => {
    if (trocarAeronave(aeronave)) navigate("/training");
  };

  return (
    <div className="max-w-2xl mx-auto mt-16 space-y-6 text-center">
      <h1 className="text-2xl font-bold text-slate-100">
        Selecione seu módulo
      </h1>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {modulosPermitidos.map((a) => (
          <button
            key={a}
            onClick={() => escolher(a)}
            className="px-6 py-5 rounded-2xl bg-[#1A1D25] border border-slate-700/60 hover:border-amber-500/40 text-left"
          >
            <p className="text-sm font-semibold text-slate-100">
              {TRAINING_BY_AIRCRAFT[a].name}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {TRAINING_BY_AIRCRAFT[a].label}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
