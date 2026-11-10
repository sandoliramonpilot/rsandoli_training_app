import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

// Hook de validacao do QRH H125: le o mapa de status por variante e
// expoe acoes administrativas (aprovar / reprovar / reabrir / aprovar tudo).
export function useQrhValidation(variantKey) {
  const [validationMap, setValidationMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!variantKey) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("manageQrhValidation", {
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

  const setStatus = useCallback(async (proc, status, justification) => {
    setSaving(true);
    try {
      const res = await base44.functions.invoke("manageQrhValidation", {
        action: "set_status",
        variant: variantKey,
        procedure_key: proc.procedure_key,
        group: proc.group,
        procedure_name: proc.n,
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
      const res = await base44.functions.invoke("manageQrhValidation", {
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