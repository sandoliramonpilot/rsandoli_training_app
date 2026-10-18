import React, { useState } from "react";
import { Palette } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
import ThemeOptionCard from "@/components/ThemeOptionCard";

const OPTIONS = [
  { id: "auto", label: "Automático", description: "Segue a configuração de aparência do dispositivo." },
  { id: "light", label: "Claro / Sol", description: "Otimizado para alta legibilidade em ambientes externos e sob luz solar direta." },
  { id: "dark", label: "Escuro", description: "Indicado para ambientes com pouca luminosidade." },
];

export default function AppearanceSettings() {
  const { preference, setPreference } = useTheme();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const select = async (id) => {
    setSaving(true);
    setError("");
    try {
      await setPreference(id);
    } catch {
      setError("O tema foi aplicado, mas não foi possível salvá-lo no perfil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h2 className="font-semibold text-foreground flex items-center gap-2">
        <Palette className="w-5 h-5 text-primary" /> Tema do Aplicativo
      </h2>
      <p className="text-sm text-muted-foreground mt-1 mb-4">
        Escolha o modo de exibição mais adequado ao ambiente de operação.
      </p>
      {error && <p className="mb-3 text-sm font-medium text-destructive">Atenção: {error}</p>}
      <div className="grid sm:grid-cols-3 gap-3">
        {OPTIONS.map((o) => (
          <ThemeOptionCard key={o.id} option={o} active={preference === o.id} onSelect={select} disabled={saving} />
        ))}
      </div>
    </div>
  );
}