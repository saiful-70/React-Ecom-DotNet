"use client";

import { useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/ui/select";
import { cn } from "@/lib/utils/utils";
import {
  isValueSelectable,
  type UnitAxes,
  type UnitIssue,
  type UnitSelection,
  type UnitSlot,
} from "@/lib/bundles/units";
import type { BundleTierItem } from "@/lib/bundles/types";

interface BundleUnitPickerProps {
  slots: UnitSlot[];
  selections: Record<string, UnitSelection>;
  issues: Record<string, UnitIssue>;
  axesFor: (item: BundleTierItem) => UnitAxes | null;
  onAxisChange: (
    slotKey: string,
    item: BundleTierItem,
    optionName: string,
    value: string
  ) => void;
  /** Show each unit's product name — only useful for multi-product combos. */
  showItemName?: boolean;
}

/**
 * The numbered per-unit configuration rows revealed by the selected tier: one
 * row per unit, each carrying a dropdown per option axis (Size, Colour, …).
 *
 * Unavailable option values render disabled rather than hidden so the shopper
 * can see the full size run instead of wondering where a size went.
 */
export function BundleUnitPicker({
  slots,
  selections,
  issues,
  axesFor,
  onAxisChange,
  showItemName = false,
}: BundleUnitPickerProps) {
  const { t } = useTranslation();

  const issueText = (issue: UnitIssue) =>
    issue === "out_of_stock"
      ? t("bundle.unitOutOfStock")
      : issue === "unresolved"
        ? t("bundle.unitUnavailableCombination")
        : t("bundle.unitSelectAllOptions");

  return (
    <div className="space-y-3">
      {slots.map((slot) => {
        const axes = axesFor(slot.item);
        if (!axes) return null;
        const selection = selections[slot.key];
        const issue = issues[slot.key];

        return (
          <div key={slot.key} className="flex items-start gap-2.5 sm:gap-3">
            {/* Unit ordinal — in bulk mode the row spans all units ("22×") */}
            <span className="mt-8 w-7 shrink-0 text-right text-sm font-bold tabular-nums text-foreground/70">
              {slot.span > 1 ? `${slot.span}×` : `${slot.index + 1}.`}
            </span>

            <div className="min-w-0 flex-1 space-y-1.5">
              {showItemName && (
                <p className="truncate text-xs font-medium text-muted-foreground">
                  {slot.item.name}
                </p>
              )}

              <div
                className={cn(
                  "grid gap-2.5 sm:gap-3",
                  axes.options.length > 1 ? "grid-cols-2" : "grid-cols-1"
                )}
              >
                {axes.options.map((option) => {
                  const value = selection?.axisValues[option.name] ?? "";
                  // Backend sends a localized label; the product-derived
                  // fallback sends none, so build one from the axis name.
                  const label =
                    option.label ||
                    t("bundle.selectAxis", { axis: option.name });

                  return (
                    <div key={option.name} className="min-w-0 space-y-1">
                      <label
                        htmlFor={`unit-${slot.key}-${option.id}`}
                        className="block text-xs font-semibold text-foreground/80"
                      >
                        {label}
                      </label>
                      <Select
                        value={value}
                        onValueChange={(next) =>
                          onAxisChange(slot.key, slot.item, option.name, next)
                        }
                      >
                        <SelectTrigger
                          id={`unit-${slot.key}-${option.id}`}
                          aria-label={label}
                          className={cn(
                            "h-11 w-full bg-background text-sm font-medium",
                            issue && "border-destructive"
                          )}
                        >
                          <SelectValue placeholder={label} />
                        </SelectTrigger>
                        <SelectContent>
                          {option.values.map((optionValue) => {
                            const selectable =
                              optionValue.is_available &&
                              isValueSelectable(
                                axes,
                                option.name,
                                optionValue.value
                              );
                            return (
                              <SelectItem
                                key={`${option.id}-${optionValue.id}-${optionValue.value}`}
                                value={optionValue.value}
                                disabled={!selectable}
                              >
                                {optionValue.label || optionValue.value}
                                {!selectable && (
                                  <span className="ml-1.5 text-xs text-muted-foreground">
                                    ({t("bundle.unavailable")})
                                  </span>
                                )}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>

              {issue && (
                <p className="flex items-center gap-1 text-xs font-medium text-destructive">
                  <AlertCircle className="size-3.5 shrink-0" />
                  {issueText(issue)}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
