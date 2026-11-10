import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';
import {
  AIRCRAFT_PROFILES,
  DEFAULT_PROFILE,
  getSelectedProfile,
  setSelectedProfile,
  profileQueryFilter,
} from '@/lib/aircraftProfile';
import {
  getStoredH125Subvariant,
  setStoredH125Subvariant,
  DEFAULT_H125_SUBVARIANT,
} from '@/lib/h125Variants';

const ProfileContext = createContext(null);

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
  const [h125SubVariant, setH125SubVariantState] = useState(() => getStoredH125Subvariant());

  const modulosPermitidos = useMemo(() => resolveUserProfiles(user), [user]);

  const trocarSubvarianteH125 = (novo) => {
    setStoredH125Subvariant(novo);
    setH125SubVariantState(novo);
  };

  useEffect(() => {
    if (!user) {
      setAircraft(null);
      return;
    }
    const salvo = getSelectedProfile();
    const inicial = modulosPermitidos.includes(salvo)
      ? salvo
      : modulosPermitidos[0] ?? null;
    setAircraft(inicial);
    if (inicial) setSelectedProfile(inicial);
  }, [user, modulosPermitidos]);

  const trocarAeronave = (novo) => {
    if (!modulosPermitidos.includes(novo)) return false;
    setSelectedProfile(novo);
    setAircraft(novo);
    return true;
  };

  const profileValue = aircraft;
  const profileFilter = aircraft ? profileQueryFilter(aircraft) : {};

  const value = useMemo(
    () => ({
      profileValue,
      profileFilter,
      aircraft,
      modulosPermitidos,
      trocarAeronave,
      h125SubVariant,
      trocarSubvarianteH125,
      temMultiplosPerfis: modulosPermitidos.length > 1,
    }),
    [profileValue, profileFilter, aircraft, modulosPermitidos, h125SubVariant]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export const useProfile = () => useContext(ProfileContext);