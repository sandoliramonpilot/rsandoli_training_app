import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';
import {
  AIRCRAFT_PROFILES,
  DEFAULT_PROFILE,
} from '@/lib/aircraftProfile';

const ProfileContext = createContext(null);

/** Determina os perfis autorizados para o usuário a partir do campo aircraft_profiles. */
function resolveUserProfiles(user) {
  if (!user) return [DEFAULT_PROFILE];
  if (user.is_master || user.access_level === 'admin_geral') return AIRCRAFT_PROFILES;
  let profiles = user.aircraft_profiles;
  if (typeof profiles === 'string') {
    try { profiles = JSON.parse(profiles); } catch { profiles = []; }
  }
  if (!Array.isArray(profiles) || profiles.length === 0) return [DEFAULT_PROFILE];
  return profiles.filter((p) => AIRCRAFT_PROFILES.includes(p));
}

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const [aircraft, setAircraft] = useState(null);

  const modulosPermitidos = useMemo(() => {
    const lista = Array.isArray(user?.modulos_habilitados)
      ? user.modulos_habilitados
      : resolveUserProfiles(user);
    return lista.filter((m) => AIRCRAFT_PROFILES.includes(m));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const salvo = localStorage.getItem("aircraft");
    const inicial = modulosPermitidos.includes(salvo)
      ? salvo
      : modulosPermitidos[0] ?? null;
    setAircraft(inicial);
    if (inicial) localStorage.setItem("aircraft", inicial);
  }, [user, modulosPermitidos]);

  const trocarAeronave = (novo) => {
    if (!modulosPermitidos.includes(novo)) return false;
    localStorage.setItem("aircraft", novo);
    setAircraft(novo);
    return true;
  };

  const profileValue = aircraft;
  const profileFilter = aircraft ? { aircraftProfile: aircraft } : {};

  return (
    <ProfileContext.Provider
      value={{ profileValue, profileFilter, aircraft, modulosPermitidos, trocarAeronave }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);