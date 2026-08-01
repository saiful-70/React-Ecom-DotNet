/**
 * Stale-deploy chunk-load recovery.
 *
 * When a new build is deployed, chunk filenames change and the old ones are
 * removed from the server. A browser still running the previous build then
 * fails to fetch a lazy chunk (`ChunkLoadError` / dynamic-import failure),
 * which bubbles to an error boundary. A full page reload fetches fresh HTML
 * that references the new chunks and recovers — so these helpers detect that
 * class of error and reload once, guarded against reload loops.
 */

/** True when an error looks like a failed JS/CSS chunk or dynamic import. */
export function isChunkLoadError(error: unknown): boolean {
	if (!error || typeof error !== "object") return false;
	const { name = "", message = "" } = error as {
		name?: string;
		message?: string;
	};
	return (
		name === "ChunkLoadError" ||
		/loading( css)? chunk [\w-]+ failed/i.test(message) ||
		/failed to (import|fetch) dynamically imported module/i.test(message) ||
		/importing a module script failed/i.test(message)
	);
}

const RELOAD_TS_KEY = "chunk-reload-ts";
// Don't auto-reload more than once per this window, so a genuinely broken
// deploy (asset really gone) falls through to the manual error UI instead of
// looping forever.
const RELOAD_COOLDOWN_MS = 10_000;

/**
 * Hard-reload once to pick up the freshly deployed build. Returns true when a
 * reload was triggered (caller should stop rendering the error UI), false when
 * suppressed by the cooldown (show the manual "try again" UI instead).
 */
export function reloadForStaleChunks(): boolean {
	if (typeof window === "undefined") return false;
	try {
		const last = Number(sessionStorage.getItem(RELOAD_TS_KEY)) || 0;
		if (Date.now() - last < RELOAD_COOLDOWN_MS) return false;
		sessionStorage.setItem(RELOAD_TS_KEY, String(Date.now()));
	} catch {
		// sessionStorage blocked (private mode / cookies off) — still reload once.
	}
	window.location.reload();
	return true;
}
