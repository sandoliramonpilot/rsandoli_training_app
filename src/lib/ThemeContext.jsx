import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const KEY = "theme_pref";
const DIRTY = "theme_pref_dirty";
const VALID = ["dark", "light", "auto"];
const ThemeContext = createContext(null);

function readLocal() {
  const v = localStorage.getItem(KEY);
  return VALID.includes(v) ? v : "auto";
}

function systemTheme() {
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(resolved) {
  const root = document.documentElement;
  root.setAttribute("data-theme", resolved);
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
  // Cor da barra de status / interface externa do aplicativo instalado
  // acompanha o tema escolhido (Escuro, Claro/Sol ou Automático).
  const bg = resolved === "light" ? "#FFFFFF" : "#0D141C";
  root.style.backgroundColor = bg;
  document.getElementById("meta-theme-color")?.setAttribute("content", bg);
}

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [preference, setPreferenceState] = useState(readLocal);
  const [resolved, setResolved] = useState(() => (readLocal() === "auto" ? systemTheme() : readLocal()));

  // Resolve e aplica; no modo automático acompanha o dispositivo em tempo real
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const update = () => {
      const r = preference === "auto" ? systemTheme() : preference;
      setResolved(r);
      applyTheme(r);
    };
    update();
    if (preference !== "auto") return undefined;
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [preference]);

  // Sincroniza com o perfil do usuário ao autenticar
  useEffect(() => {
    if (!user?.id) return;
    if (localStorage.getItem(DIRTY) === "true") {
      localStorage.removeItem(DIRTY);
      base44.auth.updateMe({ theme_preference: readLocal() }).catch(() => {});
    } else if (VALID.includes(user.theme_preference)) {
      localStorage.setItem(KEY, user.theme_preference);
      setPreferenceState(user.theme_preference);
    }
  }, [user?.id, user?.theme_preference]);

  const setPreference = useCallback(async (value) => {
    if (!VALID.includes(value)) return;
    localStorage.setItem(KEY, value);
    setPreferenceState(value);
    if (user?.id) {
      await base44.auth.updateMe({ theme_preference: value });
    } else {
      localStorage.setItem(DIRTY, "true");
    }
  }, [user?.id]);

  return (
    <ThemeContext.Provider value={{ preference, resolved, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  return ctx;
}