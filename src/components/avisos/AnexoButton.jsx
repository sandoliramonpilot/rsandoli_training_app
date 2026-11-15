import React, { useState } from "react";
import { FileText, Image as ImageIcon, Video, Presentation, Loader2 } from "lucide-react";
import { anexoKind, abrirAnexo } from "@/lib/avisoUtils";

const ICONS = {
  image: ImageIcon,
  video: Video,
  doc: FileText,
  slide: Presentation,
  pdf: FileText,
};

export default function AnexoButton({ anexo }) {
  const [loading, setLoading] = useState(false);
  const Icon = ICONS[anexoKind(anexo.name)] || FileText;

  const open = async () => {
    setLoading(true);
    try {
      await abrirAnexo(anexo);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={open}
      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-background border border-border text-slate-300 hover:border-amber-500/50 hover:text-amber-300 transition-colors"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Icon className="w-3.5 h-3.5" />
      )}
      <span className="max-w-[190px] truncate">{anexo.name}</span>
    </button>
  );
}