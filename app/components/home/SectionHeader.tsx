"use client";

import { VariantLink as Link } from "@/components/shared/ui/variant-link";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils/utils";
import { SECTION_HEADER_MB } from "@/lib/ui/rhythm";

interface SectionHeaderProps {
  titleKey: string;
  descriptionKey: string;
  /** When set, renders an inline "view all" on the title's baseline. */
  viewAllHref?: string;
  className?: string;
}

/**
 * Shelf label: title on the left, a rule running across the gap, and the
 * "view all" action on the same baseline.
 *
 * The rule is structural, not decorative — it ties the header to the grid
 * directly beneath it, so consecutive sections read as separate shelves
 * rather than blocks floating in whitespace.
 *
 * Replaces a centred stack (eyebrow + `lg:text-5xl` heading + lead paragraph
 * + `mb-12`) that ran ~165px tall per section and printed the section title
 * twice — the eyebrow and the heading were both `t(titleKey)`.
 */
export function SectionHeader({
  titleKey,
  descriptionKey,
  viewAllHref,
  className,
}: SectionHeaderProps) {
  const { t } = useTranslation();
  const description = t(descriptionKey);

  return (
    <div className={cn(SECTION_HEADER_MB, className)}>
      <div className="flex items-end gap-2.5 sm:gap-4">
        {/* Shelf tab: the gradient stub is the same motif the category rings
            and trust wells carry, shrunk to a label marker. It gives the
            title a left edge to sit against so a shelf reads as a shelf
            before a single word is parsed. */}
        <span
          aria-hidden="true"
          className="mb-1 h-6 w-1.5 shrink-0 rounded-full bg-saffron-gradient sm:h-7"
        />

        <h2 className="font-display text-xl font-bold leading-tight tracking-tight sm:text-2xl">
          {t(titleKey)}
        </h2>

        {/* Baseline rule. Sits above the text baseline so descenders clear it. */}
        <span
          aria-hidden="true"
          className="mb-1.5 hidden h-px flex-1 bg-gradient-to-r from-primary/40 to-primary/5 sm:block"
        />

        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="group mb-0.5 ml-auto flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-primary/30 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 sm:ml-0 sm:px-3 sm:text-sm"
          >
            {t("products.viewAll")}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      {description && description !== descriptionKey && (
        <p className="mt-1.5 max-w-2xl pl-4 text-xs leading-snug text-muted-foreground sm:text-sm">
          {description}
        </p>
      )}
    </div>
  );
}
