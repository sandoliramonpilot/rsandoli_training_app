import React from "react";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/lib/pwa";

// Indicador discreto de status "Sem conexão".
export default function OfflineIndicator() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div className="fixed top-3 inset-x-0 flex justify-center z-40 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold shadow-lg">
        <WifiOff className="w-3.5 h-3.5" />
        Sem conexão — recursos online indisponíveis
      </div>
    </div>
  );
}