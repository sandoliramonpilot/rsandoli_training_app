import React from "react";

const ACCENTS = {
  amber: {
    iconBox: "bg-gradient-to-br from-amber-400 to-orange-600 shadow-amber-500/20",
  },
  rose: {
    iconBox: "bg-gradient-to-br from-rose-500 to-orange-600 shadow-rose-500/20",
  },
  sky: {
    iconBox: "bg-gradient-to-br from-sky-400 to-indigo-600 shadow-sky-500/20",
  },
};

export default function AcademyHeroBanner({
  badgeIcon: BadgeIcon,
  badgeText,
  subtitleLabel,
  title,
  description,
  icon: BigIcon,
  accent = "amber",
}) {
  const acc = ACCENTS[accent] || ACCENTS.amber;
  return (
    <div className="bg-white rounded-2xl border border-amber-200 shadow-lg overflow-hidden">
      <div className="p-6 md:p-8 flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {BadgeIcon && badgeText && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                <BadgeIcon className="w-3.5 h-3.5" /> {badgeText}
              </span>
            )}
            {subtitleLabel && (
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">{subtitleLabel}</span>
            )}
          </div>
          {title && (
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
          )}
          {description && (
            <p className="text-slate-600 mt-2 text-sm max-w-2xl leading-relaxed">{description}</p>
          )}
        </div>
        {BigIcon && (
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${acc.iconBox}`}>
            <BigIcon className="w-10 h-10 text-slate-900" />
          </div>
        )}
      </div>
    </div>
  );
}