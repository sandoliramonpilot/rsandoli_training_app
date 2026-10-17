import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';
import {
  AIRCRAFT_PROFILES,
  DEFAULT_PROFILE,
  getSelectedProfile,
  setSelectedProfile,
  clearSelectedProfile,
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

  const userProfiles = useMemo(() => resolveUserProfiles(user), [user]);

  const [profile, setProfileState] = useState(() => {
    const stored = getSelectedProfile();
    return stored;
  });

  // Ajusta o perfil selecionado quando o usuário muda (login/troca de conta)
  useEffect(() => {
    if (!user) return;
    const stored = getSelectedProfile();
    if (userProfiles.includes(stored)) {
      setProfileState(stored);
    } else {
      const fallback = userProfiles[0] || DEFAULT_PROFILE;
      setSelectedProfile(fallback);
      setProfileState(fallback);
    }
  }, [user, userProfiles]);

  const setProfile = (p) => {
    if (!userProfiles.includes(p)) return;
    setSelectedProfile(p);
    setProfileState(p);
  };

  const canAccess = (p) => userProfiles.includes(p);

  // Filtro para queries do SDK (inclui compartilhados)
  const profileFilter = useMemo(
    () => ({ aircraftProfile: { $in: [profile, 'shared'] } }),
    [profile]
  );

  const value = {
    profile,           // perfil selecionado ("AW119" | "H125")
    setProfile,        // troca de perfil
    canAccess,         // verifica autorização para um perfil
    userProfiles,      // perfis autorizados do usuário
    profileFilter,     // { aircraftProfile: { $in: [profile, "shared"] } }
    profileValue: profile, // valor a setar em creates
    clearProfile: clearSelectedProfile,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}