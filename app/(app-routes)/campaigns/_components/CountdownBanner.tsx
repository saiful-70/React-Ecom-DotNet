"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

interface Props {
	minutes: number;
	message: string;
}

function pad(n: number) {
	return n.toString().padStart(2, "0");
}

export function CountdownBanner({ minutes, message }: Props) {
	const totalRef = useRef(minutes * 60);
	const [secondsLeft, setSecondsLeft] = useState(totalRef.current);

	useEffect(() => {
		const id = setInterval(() => {
			setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
		}, 1000);
		return () => clearInterval(id);
	}, []);

	const mm = Math.floor(secondsLeft / 60);
	const ss = secondsLeft % 60;

	return (
		<div className="relative bg-terracotta-gradient text-primary-foreground">
			<div className="container mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
				<div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
					<Clock className="w-3.5 h-3.5 sm:w-5 sm:h-5 shrink-0 animate-pulse" />
					<p className="text-[11px] sm:text-sm leading-tight">
						{message}
					</p>
				</div>
				<div className="flex items-center gap-1 font-display font-semibold text-xs sm:text-base shrink-0">
					<span className="bg-background/15 backdrop-blur rounded-md px-1.5 py-0.5 tabular-nums">
						{pad(mm)}
					</span>
					<span>:</span>
					<span className="bg-background/15 backdrop-blur rounded-md px-1.5 py-0.5 tabular-nums">
						{pad(ss)}
					</span>
				</div>
			</div>
		</div>
	);
}
