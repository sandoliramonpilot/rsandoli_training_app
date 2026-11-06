import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { TRAINING_BY_AIRCRAFT } from "@/lib/trainingData";

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const [selectedAircraft, setAircraft] = useState(
    () => localStorage.getItem("aircraft") || localStorage.getItem("aircraft_profile")
  );
  const MODULE_TO_AIRCRAFT = {
    aw119_training: "AW119",
    h125_training: "H125",
  };
  const modulosPermitidos = useMemo(() => {
    const lista = Array.isArray(user?.modulos_habilitados)
      ? user.modulos_habilitados
      : ["AW119"];
    return lista.filter((m) => TRAINING_BY_AIRCRAFT[m]);
  }, [user]);
  const aircraft = modulosPermitidos.includes(selectedAircraft)
    ? selectedAircraft
    : modulosPermitidos[0] ?? null;

  useEffect(() => {
    if (!user || !aircraft) return;
    localStorage.setItem("aircraft", aircraft);
    localStorage.setItem("aircraft_profile", aircraft);
  }, [user, aircraft]);

  const trocarAeronave = (novo) => {
    if (!modulosPermitidos.includes(novo)) return false;
    setAircraft(novo);
    return true;
  };
  const profileFilter = useMemo(
    () => aircraft ? { aircraftProfile: aircraft } : {},
    [aircraft]
  );

  return (
    <ProfileContext.Provider value={{ aircraft, trocarAeronave, modulosPermitidos, profileValue: aircraft, profileFilter }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
