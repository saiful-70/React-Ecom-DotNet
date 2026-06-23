import { AUTH_TOKEN_COOKIE_NAME } from "@/lib/config/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/profile", "/admin"];

// Routes that should redirect to home if already authenticated
const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const token = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value;
	const isAuthenticated = !!token;

	// Check if the current route is protected
	const isProtectedRoute = protectedRoutes.some((route) =>
		pathname.startsWith(route)
	);

	// Check if the current route is an auth route
	const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

	// Redirect to login if trying to access protected route without authentication
	if (isProtectedRoute && !isAuthenticated) {
		const url = new URL("/login", request.url);
		url.searchParams.set("redirect", pathname);
		return NextResponse.redirect(url);
	}

	// Redirect to home if trying to access auth routes while already authenticated
	if (isAuthRoute && isAuthenticated) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	// Forward pathname on the *request* headers so server components can read it
	// via next/headers (response headers are only visible to the browser).
	const requestHeaders = new Headers(request.headers);
	requestHeaders.set("x-pathname", pathname);

	const response = NextResponse.next({ request: { headers: requestHeaders } });
	response.headers.set("x-pathname", pathname);

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
