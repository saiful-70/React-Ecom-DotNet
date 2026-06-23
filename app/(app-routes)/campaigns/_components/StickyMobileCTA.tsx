"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import Price from "@/components/shared/Price";

interface Props {
	offerPrice: number;
	originalPrice: number;
}

export function StickyMobileCTA({ offerPrice, originalPrice }: Props) {
	const scrollToOrder = () => {
		document
			.getElementById("campaign-order")
			?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	return (
		<div
			className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-card border-t border-primary/20 shadow-warm-lg"
			style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
		>
			<div className="flex items-center gap-2 px-3 py-2">
				<div className="min-w-0 flex-1">
					<div className="flex items-baseline gap-1.5 whitespace-nowrap overflow-hidden">
						<span className="font-display text-base font-bold text-primary leading-none">
							<Price amount={offerPrice} />
						</span>
						<span className="text-[11px] text-muted-foreground line-through leading-none">
							<Price amount={originalPrice} />
						</span>
					</div>
					<div className="text-[10px] text-muted-foreground mt-1 truncate">
						ক্যাশ অন ডেলিভারি
					</div>
				</div>
				<Button
					onClick={scrollToOrder}
					className="shrink-0 h-10 px-3 text-xs font-semibold"
				>
					<ShoppingBag className="h-4 w-4 mr-1" />
					অর্ডার করুন
				</Button>
			</div>
		</div>
	);
}
