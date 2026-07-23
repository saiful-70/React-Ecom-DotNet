"use client";

import { useEffect, useState } from "react";

/**
 * True only after the component has mounted on the client. Use this to gate
 * any render output that depends on localStorage-backed state (cart, wishlist,
 * etc.) so the first client render matches the server-rendered markup and
 * React doesn't throw a hydration mismatch.
 */
export function useHydrated(): boolean {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}
