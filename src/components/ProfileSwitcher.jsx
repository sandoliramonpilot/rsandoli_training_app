import React from "react";
import { useProfile } from "@/lib/ProfileContext";
import { Plane, ChevronDown, Layers } from "lucide-react";
import { H125_SUBVARIANTS } from "@/lib/h125Variants";

const PROFILE_META = {
  AW119: { label: "AW119 Leonardo Helicopters", short: "AW119" },
  H125: { label: "H125 Eurocopter", short: "H125" },
};

function SelectShell({ icon: Icon, children }) {
  return (
    <div className="relative">
      <Icon className="w-3.5 h-3.5 text-amber-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
      {children}
      <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

function selectClass() {
  return "w-full appearance-none pl-8 pr-7 py-2 rounded-lg bg-[#1A1D25] border border-slate-800 text-xs text-slate-300 cursor-pointer hover:border-amber-500/40 focus:outline-none focus:border-amber-500/50";
}

export default function ProfileSwitcher() {
  const {
    aircraft: profile,
    trocarAeronave: setProfile,
    modulosPermitidos: userProfiles,
    h125SubVariant,
    trocarSubvarianteH125,
  } = useProfile();
  const profiles = Array.isArray(userProfiles) ? userProfiles : [];
  const isH125 = profile === "H125";

  // Single profile — static badge
  if (profiles.length <= 1) {
    const meta = PROFILE_META[profile] || PROFILE_META.AW119;
    return (
      <div className="mx-3 mt-3 space-y-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1A1D25] border border-slate-800 text-xs">
          <Plane className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-slate-500">Perfil:</span>
          <span className="font-medium text-amber-300">{meta.short}</span>
        </div>
        {isH125 && <SubVariantPicker value={h125SubVariant} onChange={trocarSubvarianteH125} />}
      </div>
    );
  }

  // Multiple profiles — dropdown
  return (
    <div className="mx-3 mt-3 space-y-2">
      <SelectShell icon={Plane}>
        <select
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
          className={selectClass()}
        >
          {profiles.map((p) => (
            <option key={p} value={p}>{PROFILE_META[p]?.label || p}</option>
          ))}
        </select>
      </SelectShell>
      {isH125 && <SubVariantPicker value={h125SubVariant} onChange={trocarSubvarianteH125} />}
    </div>
  );
}

function SubVariantPicker({ value, onChange }) {
  const current = H125_SUBVARIANTS.find((v) => v.id === value) || H125_SUBVARIANTS[0];
  return (
    <SelectShell icon={Layers}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Sub-variante H125"
        className={selectClass()}
        title={current.description}
      >
        {H125_SUBVARIANTS.map((v) => (
          <option key={v.id} value={v.id}>{v.label}</option>
        ))}
      </select>
    </SelectShell>
  );
}