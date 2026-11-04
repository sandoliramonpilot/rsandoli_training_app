import React from "react";
import { Navigate } from "react-router-dom";
import { useProfile } from "@/lib/ProfileContext";

export default function ModuleGate({ children }) {
  const { profileValue, modulosPermitidos } = useProfile();

  if (!modulosPermitidos?.length) return <Navigate to="/sem-acesso" />;
  if (!profileValue) return <Navigate to="/selecionar-modulo" />;
  if (!modulosPermitidos.includes(profileValue))
    return <Navigate to="/selecionar-modulo" />;

  return children;
}
