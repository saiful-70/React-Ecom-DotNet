import { AUTH_TOKEN_COOKIE_NAME } from "@/lib/config/auth.config";
import {
	DEFAULT_VARIANT_ID,
	DEMO_PREFIX,
	PATHNAME_HEADER,
	PINNED_VARIANT_ID,
	SHOWCASE_MODE,
	VARIANT_HEADER,
} from "@/lib/config/variant.config";
import { isValidVariantId } from "@/variants/registry";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/profile", "/admin"];

// Routes that should redirect to home if already authenticated
const authRoutes = ["/login", "/register"];

/**
 * Resolve the active variant and the real (prefix-stripped) app path.
 *
 * - Showcase mode: URLs look like `/demo/<id>/rest`. We strip the `/demo/<id>`
 *   prefix so the existing routes under app/(app-routes) render unchanged, and
 *   remember that a rewrite is needed. `/demo` (or `/demo/<invalid>`) is left
 *   alone so the gallery route can handle it.
 * - Deploy mode: no prefix; the variant is pinned via `ACTIVE_VARIANT` env.
 */
function resolveVariant(pathname: string): {
	variantId: string;
	appPath: string;
	inVariantScope: boolean;
} {
	if (SHOWCASE_MODE) {
		const segments = pathname.split("/").filter(Boolean); // ["demo","bn-01","products"]
		if (segments[0] === "demo" && isValidVariantId(segments[1])) {
			const variantId = segments[1];
			const appPath =
				segments.length > 2 ? `/${segments.slice(2).join("/")}` : "/";
			return { variantId, appPath, inVariantScope: true };
		}
		// `/demo`, `/demo/<invalid>`, or any other path: no prefix to strip.
		return {
			variantId: DEFAULT_VARIANT_ID,
			appPath: pathname,
			inVariantScope: false,
		};
	}

	// Client deploy mode: one variant pinned via env.
	return {
		variantId: PINNED_VARIANT_ID || DEFAULT_VARIANT_ID,
		appPath: pathname,
		inVariantScope: false,
	};
}

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const token = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value;
	const isAuthenticated = !!token;

	const { variantId, appPath, inVariantScope } = resolveVariant(pathname);

	// In showcase variant scope, keep the visitor inside the current demo by
	// re-attaching the `/demo/<id>` prefix to any redirect target.
	const prefixed = (target: string) =>
		inVariantScope
			? `${DEMO_PREFIX}/${variantId}${target === "/" ? "" : target}`
			: target;

	// Auth-gating runs against the REAL app path (prefix already stripped).
	const isProtectedRoute = protectedRoutes.some((route) =>
		appPath.startsWith(route)
	);
	const isAuthRoute = authRoutes.some((route) => appPath.startsWith(route));

	// Redirect to login if trying to access protected route without authentication
	if (isProtectedRoute && !isAuthenticated) {
		const url = new URL(prefixed("/login"), request.url);
		url.searchParams.set("redirect", prefixed(appPath));
		return NextResponse.redirect(url);
	}

	// Redirect to home if trying to access auth routes while already authenticated
	if (isAuthRoute && isAuthenticated) {
		return NextResponse.redirect(new URL(prefixed("/"), request.url));
	}

	// Forward the resolved app path + active variant on the *request* headers so
	// server components can read them via next/headers (response headers are only
	// visible to the browser).
	const requestHeaders = new Headers(request.headers);
	requestHeaders.set(PATHNAME_HEADER, appPath);
	requestHeaders.set(VARIANT_HEADER, variantId);

	let response: NextResponse;
	if (inVariantScope) {
		// Rewrite `/demo/<id>/rest` → `/rest` (query string preserved).
		const rewriteUrl = new URL(appPath, request.url);
		rewriteUrl.search = request.nextUrl.search;
		response = NextResponse.rewrite(rewriteUrl, {
			request: { headers: requestHeaders },
		});
	} else {
		response = NextResponse.next({ request: { headers: requestHeaders } });
	}

	response.headers.set(PATHNAME_HEADER, appPath);
	response.headers.set(VARIANT_HEADER, variantId);

	return response;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|data).*)",
	],
};
