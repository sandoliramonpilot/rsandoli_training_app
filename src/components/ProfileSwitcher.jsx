import React from "react";
import { useProfile } from "@/lib/ProfileContext";
import { Plane, ChevronDown } from "lucide-react";

const PROFILE_META = {
  AW119: { label: "AW119 Leonardo Helicopters", short: "AW119" },
  H125: { label: "H125 Eurocopter", short: "H125" },
};

export default function ProfileSwitcher() {
  const { profile, setProfile, userProfiles } = useProfile();

  // Single profile — static badge
  if (userProfiles.length <= 1) {
    const meta = PROFILE_META[profile] || PROFILE_META.AW119;
    return (
      <div className="mx-3 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1A1D25] border border-slate-800 text-xs">
        <Plane className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="text-slate-500">Perfil:</span>
        <span className="font-medium text-amber-300">{meta.short}</span>
      </div>
    );
  }

  // Multiple profiles — dropdown
  return (
    <div className="mx-3 mt-3 relative">
      <select
        value={profile}
        onChange={(e) => setProfile(e.target.value)}
        className="w-full appearance-none pl-8 pr-7 py-2 rounded-lg bg-[#1A1D25] border border-slate-800 text-xs text-slate-300 cursor-pointer hover:border-amber-500/40 focus:outline-none focus:border-amber-500/50"
      >
        {userProfiles.map((p) => (
          <option key={p} value={p}>{PROFILE_META[p]?.label || p}</option>
        ))}
      </select>
      <Plane className="w-3.5 h-3.5 text-amber-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}