/**
 * Vertical rhythm for page sections — the single source of truth.
 *
 * Before this existed, each home section invented its own ladder
 * (`py-6 sm:py-12 lg:py-16` next to `py-8 sm:py-14 lg:py-20` next to
 * `py-6 md:py-12`), which is how the spacing drifted apart. Compose these
 * instead of hardcoding a new ramp.
 *
 * The scale is deliberately tight: this is a grocery storefront, where the
 * job is comparing many products quickly. Editorial whitespace works against
 * that. Two adjacent sections used to leave ~96px of dead space between
 * product rows; SECTION_Y brings that to ~56px.
 *
 * These are plain strings so Tailwind's scanner still sees the literal class
 * names (`app/**` is in the content globs).
 */

/**
 * Standard section band. Use on every top-level page section.
 *
 * Mobile stays at the tightest step deliberately — phone viewports have the
 * least room to give away, so the ramp only opens up once there's width for it.
 */
export const SECTION_Y = "py-6 md:py-10";

/**
 * Brand moments (hero-adjacent, trust strip) may breathe one step more.
 * Use sparingly — if everything is emphasised, nothing is.
 */
export const SECTION_Y_FEATURE = "py-8 md:py-12";

/** Gap between a section's header and its content. */
export const SECTION_HEADER_MB = "mb-4 md:mb-5";
