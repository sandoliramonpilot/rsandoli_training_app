import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

// Hook de validacao do checklist operacional H125: le o mapa de status por
// variante e expoe acoes administrativas (aprovar / reprovar / reabrir / aprovar tudo).
export function useChecklistValidation(variantKey) {
  const [validationMap, setValidationMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!variantKey) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("manageChecklistValidation", {
        action: "list",
        variant: variantKey,
      });
      setValidationMap(res.data?.map || {});
    } catch {
      setValidationMap({});
    } finally {
      setLoading(false);
    }
  }, [variantKey]);

  useEffect(() => { load(); }, [load]);

  const setStatus = useCallback(async (phase, status, justification) => {
    setSaving(true);
    try {
      const res = await base44.functions.invoke("manageChecklistValidation", {
        action: "set_status",
        variant: variantKey,
        phase_id: phase.id,
        phase_name: phase.name,
        status,
        justification,
      });
      if (res.data?.ok) {
        await load();
        return { ok: true, message: res.data.message };
      }
      return { ok: false, error: res.data?.error || "Falha ao atualizar." };
    } catch (e) {
      return { ok: false, error: e.message || "Erro de comunicação." };
    } finally {
      setSaving(false);
    }
  }, [variantKey, load]);

  const approveAll = useCallback(async () => {
    setSaving(true);
    try {
      const res = await base44.functions.invoke("manageChecklistValidation", {
        action: "approve_all",
        variant: variantKey,
      });
      if (res.data?.ok) {
        await load();
        return { ok: true, count: res.data.count };
      }
      return { ok: false, error: res.data?.error };
    } catch (e) {
      return { ok: false, error: e.message };
    } finally {
      setSaving(false);
    }
  }, [variantKey, load]);

  return { validationMap, loading, saving, setStatus, approveAll, reload: load };
}