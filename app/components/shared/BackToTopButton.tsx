"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils/utils";

interface BackToTopButtonProps {
	className?: string;
}

export default function BackToTopButton({ className }: BackToTopButtonProps = {}) {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const checkScroll = () => {
			// Simply check if user has scrolled down more than 50px
			const scrollY =
				window.pageYOffset ||
				window.scrollY ||
				document.documentElement.scrollTop;

			// Show button if scrolled more than 100px
			setIsVisible(scrollY > 100);
		};

		// Check on mount
		checkScroll();

		// Add scroll listener
		window.addEventListener("scroll", checkScroll, { passive: true });

		return () => {
			window.removeEventListener("scroll", checkScroll);
		};
	}, []);

	// Don't render button if not visible
	if (!isVisible) return null;
	return (
		<Button
			variant={"default"}
			className={cn(
				"fixed bottom-4 md:bottom-3 right-4 z-50 transition-opacity duration-300 shadow-lg",
				className
			)}
			onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
			aria-label="Back to top"
			size="icon"
		>
			<ChevronUp className="size-5 sm:size-7" strokeWidth={4} />
		</Button>
	);
}
