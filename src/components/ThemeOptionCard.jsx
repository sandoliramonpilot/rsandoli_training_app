import React from "react";
import { Check } from "lucide-react";

// Paletas fixas apenas para a pré-visualização (independem do tema ativo)
const PALETTES = {
  dark: { bg: "#0D141C", card: "#16222F", title: "#FFFFFF", text: "#A5B4FC", btn: "#FFA500", btnText: "#000000", ok: "#00FF00", okBg: "#16222F", border: "#1F2E3E" },
  light: { bg: "#FFFFFF", card: "#F8F9FA", title: "#0B131F", text: "#343A40", btn: "#E65100", btnText: "#FFFFFF", ok: "#1B5E20", okBg: "#E8F5E9", border: "#CED4DA" },
};

function Mini({ p }) {
  return (
    <div className="rounded-lg p-2 h-24 flex flex-col gap-1.5" style={{ background: p.bg, border: `1px solid ${p.border}` }}>
      <div className="rounded-md p-1.5" style={{ background: p.card, border: `1px solid ${p.border}` }}>
        <div className="text-[10px] font-bold leading-none" style={{ color: p.title }}>Checklist</div>
        <div className="text-[9px] mt-1 leading-none" style={{ color: p.text }}>Procedimento normal</div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] font-bold px-1.5 py-1 rounded" style={{ background: p.btn, color: p.btnText }}>Iniciar</span>
        <span className="text-[9px] font-bold px-1.5 py-1 rounded" style={{ background: p.okBg, color: p.ok, border: `1px solid ${p.ok}` }}>✓ Conforme</span>
      </div>
    </div>
  );
}

export default function ThemeOptionCard({ option, active, onSelect, disabled }) {
  const preview = option.id === "auto" ? (
    <div className="grid grid-cols-2 gap-1">
      <Mini p={PALETTES.light} />
      <Mini p={PALETTES.dark} />
    </div>
  ) : (
    <Mini p={PALETTES[option.id]} />
  );
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(option.id)}
      aria-pressed={active}
      className={`relative text-left rounded-xl border-2 p-3 transition-all bg-card ${active ? "border-primary" : "border-border hover:border-muted-foreground"}`}
    >
      {active && (
        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center z-10">
          <Check className="w-3 h-3" />
        </span>
      )}
      {preview}
      <p className="mt-3 text-sm font-semibold text-foreground">{option.label}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
    </button>
  );
}