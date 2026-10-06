import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { ShieldCheck, Loader2, ScrollText } from "lucide-react";

const TERMS_VERSION = "v1";

function getDeviceInfo() {
  try {
    const nav = navigator;
    const screen = window.screen;
    return [
      nav?.platform ? `Platform: ${nav.platform}` : "",
      nav?.language ? `Lang: ${nav.language}` : "",
      screen ? `Screen: ${screen.width}x${screen.height}` : "",
      nav?.hardwareConcurrency ? `Cores: ${nav.hardwareConcurrency}` : "",
    ].filter(Boolean).join(" | ");
  } catch {
    return "";
  }
}

export default function TermsModal({ onAccept }) {
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleAccept = async () => {
    if (!agreed || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await base44.functions.invoke("acceptTerms", {
        device_info: getDeviceInfo(),
        session_id: sessionStorage.getItem("terms_session_id") || crypto.randomUUID(),
        terms_version: TERMS_VERSION,
      });
      sessionStorage.setItem("terms_accepted", "true");
      onAccept();
    } catch (e) {
      // Mesmo em caso de erro de rede, permite prosseguir mas registra localmente
      sessionStorage.setItem("terms_accepted", "true");
      onAccept();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-2xl bg-[#12141A] rounded-2xl border border-amber-500/30 shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 sm:px-7 py-4 sm:py-5 border-b border-slate-700/60 bg-gradient-to-r from-amber-500/10 to-transparent">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold tracking-tight text-amber-300 uppercase">
              Informações Legais e Técnicas
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Aceite obrigatório para acesso ao sistema
            </p>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-4 text-sm sm:text-[15px] leading-relaxed text-slate-300">
          <p>
            O aplicativo <span className="font-semibold text-slate-100">#RSANDOLI PILOTS Helicopter Training</span> foi
            desenvolvido exclusivamente para fins de instrução, treinamento teórico, capacitação e
            aperfeiçoamento profissional de pilotos e tripulantes.
          </p>
          <p>
            A formatação, a organização visual, a interface gráfica e o layout deste aplicativo foram
            desenvolvidos com o auxílio de ferramentas de Inteligência Artificial, sob supervisão humana
            especializada.
          </p>
          <p>
            Todo o conteúdo técnico, operacional e instrucional foi elaborado, validado e revisado por
            instrutor qualificado, com base nas publicações oficiais, manuais e documentos técnicos
            aplicáveis.
          </p>

          {/* Highlight banner 1 */}
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3">
            <div className="flex items-start gap-2.5">
              <ScrollText className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-sm font-semibold text-amber-200">
                EXCLUSIVAMENTE PARA TREINAMENTO E INSTRUÇÃO
              </p>
            </div>
            <p className="text-sm text-slate-300 mt-1.5">
              Este aplicativo possui caráter exclusivamente educacional e{" "}
              <span className="font-semibold text-amber-200">NÃO SUBSTITUI PUBLICAÇÕES OFICIAIS</span> em
              nenhuma circunstância — incluindo manuais aprovados da aeronave, POH, AFM, FCOM, QRH,
              checklists, boletins, diretrizes do fabricante, regulamentações da ANAC ou quaisquer outras
              publicações oficiais vigentes.
            </p>
          </div>

          <p>
            Em caso de divergência entre as informações aqui apresentadas e a documentação oficial
            aplicável, <span className="font-semibold text-slate-100">prevalecerá sempre a publicação
            oficial mais atualizada</span>.
          </p>
          <p>
            O uso deste aplicativo implica na concordância com estes termos e no reconhecimento de que o
            usuário permanece integralmente responsável pela consulta e utilização das publicações
            oficiais exigidas para a operação da aeronave.
          </p>
          <p>
            Este aplicativo é uma ferramenta independente e não possui vínculo, patrocínio,
            certificação ou aprovação da Leonardo Helicopters ou de qualquer outro fabricante.
          </p>

          <div className="pt-2 border-t border-slate-700/50">
            <p className="text-sm font-semibold text-slate-200">
              © RSANDOLI — Serviços de Pilotos de Aeronave Ltda.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Todos os direitos autorais, de propriedade intelectual, conteúdo, identidade visual e
              materiais instrucionais são reservados. A reprodução total ou parcial sem autorização
              expressa é proibida.
            </p>
          </div>
        </div>

        {/* Footer — checkbox + button */}
        <div className="border-t border-slate-700/60 px-5 sm:px-7 py-4 sm:py-5 bg-[#1A1D25] rounded-b-2xl space-y-3.5">
          <label className="flex items-start gap-3 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-slate-600 bg-[#12141A] accent-amber-500 shrink-0 cursor-pointer"
            />
            <span className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">
              <span className="font-medium">Li e concordo</span> com as Informações Legais e Técnicas.
            </span>
          </label>

          {error && (
            <p className="text-xs text-rose-400">{error}</p>
          )}

          <button
            onClick={handleAccept}
            disabled={!agreed || submitting}
            className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide uppercase transition-all ${
              agreed && !submitting
                ? "bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-lg shadow-amber-500/20"
                : "bg-slate-700/50 text-slate-500 cursor-not-allowed"
            }`}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Registrando…
              </span>
            ) : (
              "Concordo"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}