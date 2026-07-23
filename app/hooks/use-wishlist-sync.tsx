import { useAtom } from "jotai";
import { useEffect } from "react";
import { wishlistAtom } from "@/store/wishlist.atom";
import { miniProfileAtom } from "@/store/mini-profile.atom";
import { getWishlists } from "@/(app-routes)/(auth)/action";

export function useWishlistSync() {
  const [wishlistIds, setWishlistIds] = useAtom(wishlistAtom);
  const [userProfile] = useAtom(miniProfileAtom);

  useEffect(() => {
    // Only fetch wishlists if user is logged in
    if (userProfile) {
      const fetchWishlists = async () => {
        try {
          const response = await getWishlists();
          if (response.success && response.data) {
            // Extract product IDs from wishlist items
            const productIds = response.data.map((item) => item.product_id);
            setWishlistIds(productIds);
          }
        } catch (error) {
          console.error("Error syncing wishlist:", error);
        }
      };

      fetchWishlists();
    }
    // Note: we intentionally do NOT clear the wishlist when userProfile is
    // null. `miniProfileAtom` is null both for guests (whose local wishlist
    // should persist across reloads) and for a logged-in user hit by a
    // transient profile-fetch failure (auth-initializer.tsx sets it null on
    // any error, indistinguishable here from a real logout). Since this hook
    // only observes the profile *value* and not why it changed, there's no
    // reliable signal to tell "confirmed logout" apart from "fetch failed" -
    // clearing here would wipe a real wishlist on a transient error. Explicit
    // logout flows (see UserMenu.tsx) should clear the wishlist themselves if
    // that behavior is ever desired.
  }, [userProfile, setWishlistIds]);

  return { wishlistIds, setWishlistIds };
}
