"use server";

import { ApiClient } from "@/lib/api-client";
import {
	LoginCredentialsModel,
	RegisterUserModel,
	RegisterUserSchema,
	AuthUserResponseModel,
} from "./model";
import { cookies } from "next/headers";
import { parseJWT } from "@/lib/utils/security.utils";
import { getCookieConfig } from "@/lib/config/server.config";
import { AUTH_TOKEN_COOKIE_NAME } from "@/lib/config/auth.config";
import { API_ROUTES } from "@/lib/api-route";
import { Product } from "../products/model";

interface WishlistItem {
	id: number;
	user_id: number;
	product_id: number;
	created_at: string;
	updated_at: string;
	product: Product;
}

interface WishlistResponse {
	success: boolean;
	message: string;
	data?: WishlistItem[];
}

interface ToggleWishlistResponse {
	success: boolean;
	message: string;
	data?: unknown;
}

export async function registerUser(data: RegisterUserModel) {
	const parsed = RegisterUserSchema.safeParse(data);
	if (!parsed.success) {
		return { success: false, message: "Invalid input" } as AuthUserResponseModel;
	}

	const response = await new ApiClient("auth/register")
		.withMethod("POST")
		.withBody<RegisterUserModel>(parsed.data)
		.execute<AuthUserResponseModel>();

	if (response.success) {
		await storeCookie(response?.data?.token ?? "");
		// Ensure cookie is committed to the response
		await new Promise((resolve) => setTimeout(resolve, 50));
	}
	return response;
}

export async function loginUser(model: LoginCredentialsModel) {
	const response = await new ApiClient("auth/login")
		.withMethod("POST")
		.withBody<LoginCredentialsModel>(model)
		.execute<AuthUserResponseModel>();
	if (response.success) {
		await storeCookie(response?.data?.token ?? "");
		// Ensure cookie is committed to the response
		await new Promise((resolve) => setTimeout(resolve, 50));
	}

	return response;
}

export async function refreshToken() {
	const cookieStore = await cookies();
	const response = await new ApiClient(API_ROUTES.AUTH.REFRESH_TOKEN)
		.withMethod("POST")
		.withCookieHeaders(cookieStore)
		.execute<AuthUserResponseModel>();

	if (response.success) {
		await storeCookie(response?.data?.token ?? "");
		// Ensure cookie is committed to the response
		await new Promise((resolve) => setTimeout(resolve, 50));
	}

	return response;
}

export async function storeCookie(token: string) {
	const cookieList = await cookies();
	const tokenInfo = parseJWT(token);
	const config = getCookieConfig({
		priority: "high",
		httpOnly: true,
		expires: tokenInfo?.exp ? new Date(tokenInfo.exp * 1000) : undefined,
	});
	cookieList.set(AUTH_TOKEN_COOKIE_NAME, token, config);
}

export async function toggleWishlist(
	productId: number
): Promise<ToggleWishlistResponse> {
	try {
		const cookieStore = await cookies();
		const response = await new ApiClient(API_ROUTES.WISHLIST.TOGGLE)
			.withMethod("POST")
			.withCookieHeaders(cookieStore)
			.withBody({ product_id: productId })
			.execute<ToggleWishlistResponse>();

		return response;
	} catch (error) {
		console.error("Error toggling wishlist:", error);
		return {
			success: false,
			message: "Failed to toggle wishlist",
		};
	}
}

export async function getWishlists(): Promise<WishlistResponse> {
	try {
		const cookieStore = await cookies();
		const response = await new ApiClient(API_ROUTES.WISHLIST.GET_ALL)
			.withMethod("GET")
			.withCookieHeaders(cookieStore)
			.execute<WishlistResponse>();

		return response;
	} catch (error) {
		console.error("Error fetching wishlists:", error);
		return {
			success: false,
			message: "Failed to fetch wishlists",
			data: [],
		};
	}
}
