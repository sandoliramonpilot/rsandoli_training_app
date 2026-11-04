import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { AIRCRAFT_PROFILES, DEFAULT_PROFILE } from '@/lib/aircraftProfile';

const ProfileContext = createContext(null);

/**
 * Perfis de aeronave autorizados para o usuário.
 * Fonte de verdade: user.aircraft_profiles.
 * Admin geral e is_master recebem todos os perfis.
 */
function resolveUserProfiles(user) {
  if (!user) return [DEFAULT_PROFILE];
  if (user.is_master || user.access_level === 'admin_geral') return AIRCRAFT_PROFILES;

  let profiles = user.aircraft_profiles;
  if (typeof profiles === 'string') {
    try {
      profiles = JSON.parse(profiles);
    } catch {
      profiles = [];
    }
  }
  if (!Array.isArray(profiles) || profiles.length === 0) return [DEFAULT_PROFILE];

  const validos = profiles.filter((p) => AIRCRAFT_PROFILES.includes(p));
  return validos.length > 0 ? validos : [DEFAULT_PROFILE];
}

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const [aircraft, setAircraft] = useState(null);

  const modulosPermitidos = useMemo(() => resolveUserProfiles(user), [user]);

  useEffect(() => {
    if (!user) {
      setAircraft(null);
      return;
    }
    const salvo = localStorage.getItem('aircraft');
    const inicial = modulosPermitidos.includes(salvo)
      ? salvo
      : modulosPermitidos[0] ?? null;
    setAircraft(inicial);
    if (inicial) localStorage.setItem('aircraft', inicial);
  }, [user, modulosPermitidos]);

  const trocarAeronave = (novo) => {
    if (!modulosPermitidos.includes(novo)) return false;
    localStorage.setItem('aircraft', novo);
    setAircraft(novo);
    return true;
  };

  const profileValue = aircraft;
  const profileFilter = aircraft ? { aircraftProfile: aircraft } : {};

  const value = useMemo(
    () => ({
      profileValue,
      profileFilter,
      aircraft,
      modulosPermitidos,
      trocarAeronave,
      temMultiplosPerfis: modulosPermitidos.length > 1,
    }),
    [profileValue, profileFilter, aircraft, modulosPermitidos]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export const useProfile = () => useContext(ProfileContext);
