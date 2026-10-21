import React, { useState } from "react";
import { HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import InstallGuide from "@/components/pwa/InstallGuide";

/** Abre as instruções de instalação do dispositivo atual. */
export default function InstallGuideDialog({ platformId, safariFallback, className }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={
            className ||
            "inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
          }
        >
          <HelpCircle className="h-4 w-4" aria-hidden="true" />
          Como instalar
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Como instalar o aplicativo</DialogTitle>
          <DialogDescription>
            A instalação cria um ícone próprio do RSandoli Training na tela inicial, sem passar
            pelas lojas de aplicativos.
          </DialogDescription>
        </DialogHeader>
        <InstallGuide platformId={platformId} safariFallback={safariFallback} />
      </DialogContent>
    </Dialog>
  );
}