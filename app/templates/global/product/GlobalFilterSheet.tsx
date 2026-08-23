"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "next/navigation";
import { useVariantRouter as useRouter } from "@/hooks/use-variant-router";
import { getAllProducts } from "@/(app-routes)/products/action";
import type { Category } from "@/components/shared/models/category";
import type { Brand } from "@/components/shared/models/brand";
import { trackFilterChanged } from "@/lib/analytics/tracking";
import { GlobalFacetGroups } from "./GlobalFacetGroups";
import {
	countActiveFilters,
	draftFromParams,
	paramsFromDraft,
	queryFromDraft,
	type CatalogueFilterDraft,
} from "./listing-filters";
import "../global.css";

/**
 * Mobile filter sheet: full screen, draft state, and an explicit
 * "Show N results" apply button. N is a real number — the pending draft is
 * probed against the products endpoint (per_page 1) with a debounce, never
 * guessed. Escape or the close control abandons the draft.
 */
export function GlobalFilterSheet({
	open,
	onClose,
	categories,
	brands,
}: {
	open: boolean;
	onClose: () => void;
	categories: Category[];
	brands: Brand[];
}) {
	const { t } = useTranslation();
	const router = useRouter();
	const searchParams = useSearchParams();

	const [draft, setDraft] = useState<CatalogueFilterDraft>(() =>
		draftFromParams(searchParams)
	);
	const [pendingCount, setPendingCount] = useState<number | null>(null);
	const [isCounting, setIsCounting] = useState(false);
	const probeIdRef = useRef(0);

	// Re-seed the draft from the URL each time the sheet opens.
	useEffect(() => {
		if (open) {
			setDraft(draftFromParams(new URLSearchParams(searchParams.toString())));
		}
	}, [open, searchParams]);

	// Close on Escape; lock body scroll while open.
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKey);
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = previousOverflow;
		};
	}, [open, onClose]);

	// Probe the real result count for the pending draft (debounced).
	useEffect(() => {
		if (!open) return;
		const id = ++probeIdRef.current;
		setIsCounting(true);
		const timer = setTimeout(async () => {
			try {
				const res = await getAllProducts(
					queryFromDraft(draft, searchParams.toString())
				);
				if (probeIdRef.current === id) {
					setPendingCount(res?.data?.meta?.total ?? null);
				}
			} catch {
				if (probeIdRef.current === id) setPendingCount(null);
			} finally {
				if (probeIdRef.current === id) setIsCounting(false);
			}
		}, 400);
		return () => clearTimeout(timer);
	}, [open, draft, searchParams]);

	if (!open) return null;

	const apply = () => {
		void trackFilterChanged("All", "(sheet-applied)");
		const params = paramsFromDraft(draft, searchParams.toString());
		router.push(`/products?${params.toString()}`, { scroll: false });
		onClose();
	};

	const clearAll = () =>
		setDraft({
			categories: [],
			brands: [],
			priceMin: "",
			priceMax: "",
			special: "",
		});

	const activeCount = countActiveFilters(draft);

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-label={t("products.filters", "Filters")}
			className="g-settle fixed inset-0 z-[60] flex flex-col bg-background lg:hidden"
		>
			<div className="flex items-center justify-between border-b border-border px-4 py-3">
				<h2 className="font-display text-lg font-black uppercase tracking-tight">
					{t("products.filters", "Filters")}
					{activeCount > 0 && (
						<span className="ml-2 align-middle text-xs font-semibold text-muted-foreground tabular-nums">
							({activeCount})
						</span>
					)}
				</h2>
				<button
					type="button"
					onClick={onClose}
					aria-label={t("global.filters.close", "Close filters")}
					className="ring-warm-focus flex h-9 w-9 items-center justify-center rounded-sm border border-border text-foreground transition-colors hover:border-foreground"
				>
					<X className="h-4 w-4" />
				</button>
			</div>

			<div className="flex-1 overflow-y-auto px-4 py-5">
				<GlobalFacetGroups
					draft={draft}
					onChange={setDraft}
					categories={categories}
					brands={brands}
				/>
			</div>

			<div className="flex items-center gap-3 border-t border-border px-4 py-3">
				<button
					type="button"
					onClick={clearAll}
					disabled={activeCount === 0}
					className="ring-warm-focus rounded-sm px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
				>
					{t("global.filters.clearAll", "Clear all")}
				</button>
				<button
					type="button"
					onClick={apply}
					className="ring-warm-focus flex flex-1 items-center justify-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
				>
					{isCounting && <Loader2 className="h-4 w-4 animate-spin" />}
					{pendingCount !== null && !isCounting
						? t("global.filters.showResults", "Show {{count}} results", {
								count: pendingCount,
							})
						: t("global.filters.showResultsBare", "Show results")}
				</button>
			</div>
		</div>
	);
}
