import type { CSSProperties } from "react";

/**
 * SIM-colour department coding. Each department (category) owns exactly one
 * hue end-to-end — chip, tags, band — assigned by index into the fixed
 * --dept-1..--dept-6 cycle defined in bazar.css. Components apply
 * `deptStyle(index)` on a wrapper and let the .bz-dept-* classes read the
 * scoped `--dept` var; the colour itself is never restated in TSX.
 */
export const DEPT_CYCLE_LENGTH = 6;

export function deptVar(index: number): string {
	const slot = ((index % DEPT_CYCLE_LENGTH) + DEPT_CYCLE_LENGTH) % DEPT_CYCLE_LENGTH;
	return `var(--dept-${slot + 1})`;
}

export function deptStyle(index: number): CSSProperties {
	return { "--dept": deptVar(index) } as CSSProperties;
}
