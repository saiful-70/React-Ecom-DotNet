"use client";

import { useTranslation } from "react-i18next";

interface SectionHeaderProps {
  titleKey: string;
  descriptionKey: string;
}

export function SectionHeader({
  titleKey,
  descriptionKey,
}: SectionHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="text-center mb-8 sm:mb-10 lg:mb-12 px-2">
      <div className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <span className="h-px w-6 sm:w-8 bg-primary/40" />
        <span className="font-display text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-primary">
          {t(titleKey)}
        </span>
        <span className="h-px w-6 sm:w-8 bg-primary/40" />
      </div>
      <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-3 sm:mb-4 tracking-tight text-balance leading-tight">
        {t(titleKey)}
      </h2>
      <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
        {t(descriptionKey)}
      </p>
    </div>
  );
}
