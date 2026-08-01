"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent } from "@/components/shared/ui/card";
import { isChunkLoadError, reloadForStaleChunks } from "@/lib/utils/chunk-error";

interface ErrorPageProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
	const { t } = useTranslation();

	// A chunk-load failure usually means a new build was deployed while this
	// tab held the old one — reload once to pick up the fresh chunks.
	const isChunkError = isChunkLoadError(error);

	useEffect(() => {
		if (isChunkError && reloadForStaleChunks()) return;
		console.error(error);
	}, [error, isChunkError]);

	const handleRetry = () => {
		// reset() re-renders the same tree — useless for a missing chunk, so
		// hard-reload instead.
		if (isChunkError) window.location.reload();
		else reset();
	};

	return (
		<div className="flex min-h-[60vh] items-center justify-center bg-background px-4 py-12">
			<Card className="w-full max-w-md">
				<CardContent className="flex flex-col items-center gap-4 p-8 text-center">
					<div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
						<AlertTriangle className="size-8 text-destructive" />
					</div>
					<h1 className="text-xl font-bold">{t("common.error")}</h1>
					<Button onClick={handleRetry} className="w-full sm:w-auto" size="lg">
						<RotateCcw className="size-4" />
						{t("common.retry")}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
