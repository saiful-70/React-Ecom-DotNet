"use server";

import { findCombo, listCombos } from "@/lib/bundles/mock";
import type { Bundle } from "@/lib/bundles/types";

// Combo (multi-product bundle) fetch actions.
//
// Reads mock data until the backend implements the bundle contract
// (docs/superpowers/specs/2026-07-21-bundle-combo-api-contract.md). The real
// implementation will call `GET combos/{slug}` / `GET combos` via ApiClient;
// these signatures stay stable so the route/components never change.

export async function getCombo(slug: string): Promise<Bundle | null> {
  return findCombo(slug);
}

export async function getCombos(): Promise<Bundle[]> {
  return listCombos();
}
