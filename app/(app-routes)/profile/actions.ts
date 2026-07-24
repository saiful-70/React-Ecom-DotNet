"use server";

import { z } from "zod";
import { ApiClient, ApiResponse } from "@/lib/api-client";
import { cookies } from "next/headers";
import { UserProfileModel } from "./model";
import { UserMiniProfileModel } from "../(auth)/model";
import { API_ROUTES } from "@/lib/api-route";
import { revalidatePath } from "next/cache";
import { AUTH_TOKEN_COOKIE_NAME } from "@/lib/config/auth.config";
import { ABSOLUTE_ROUTES } from "@/lib/absolute-routes";

// Lightweight, forward-compatible: only the fields the profile form actually
// sends are constrained; unknown/extra fields on the Partial<UserMiniProfileModel>
// input are passed through untouched.
const UpdateUserProfileSchema = z
  .object({
    name: z.string().min(1).max(100),
    email: z.string().email().or(z.literal("")),
    phone: z.string().max(20),
  })
  .partial()
  .passthrough();

export async function getUserProfile() {
  return await new ApiClient("auth/get-profile")
    .withMethod("GET")
    .withCookieHeaders(await cookies())
    .execute<UserProfileModel>();
}

export async function logoutUser() {
  const response = await new ApiClient(API_ROUTES.AUTH.LOGOUT)
    .withMethod("POST")
    .withCookieHeaders(await cookies())
    .execute<UserProfileModel>();
  if (response.success) {
    const cookieList = await cookies();
    cookieList.delete(AUTH_TOKEN_COOKIE_NAME);
  }
  return response;
}

export async function clearAuthAndRedirect() {
  "use server";
  const cookieList = await cookies();
  cookieList.delete(AUTH_TOKEN_COOKIE_NAME);
}

export async function updateUserProfile(model: Partial<UserMiniProfileModel>) {
  const parsed = UpdateUserProfileSchema.safeParse(model);
  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid input",
    } as UserProfileModel;
  }

  const response = await new ApiClient(API_ROUTES.AUTH.UPDATE_PROFILE)
    .withMethod("PUT")
    .withCookieHeaders(await cookies())
    .withBody(parsed.data)
    .execute<UserProfileModel>();
  revalidatePath(ABSOLUTE_ROUTES.PROFILE);
  return response;
}

export async function changePassword(data: {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}): Promise<ApiResponse<{ message: string }>> {
  return await new ApiClient(API_ROUTES.AUTH.CHANGE_PASSWORD)
    .withMethod("POST")
    .withCookieHeaders(await cookies())
    .withBody(data)
    .execute<ApiResponse<{ message: string }>>();
}

export async function updateAvatar(
  formData: FormData,
): Promise<ApiResponse<UserProfileModel>> {
  const response = await new ApiClient(API_ROUTES.AUTH.UPDATE_PROFILE)
    .withMethod("POST")
    .withCookieHeaders(await cookies())
    .withFormData(formData)
    .execute<ApiResponse<UserProfileModel>>();

  if (response.success) {
    // Update the mini profile atom with new avatar
    revalidatePath(ABSOLUTE_ROUTES.PROFILE);
  }

  return response;
}
