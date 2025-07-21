import { supabase } from "./supabase";
import type { Profile } from "../types/database";

/**
 * ユーザーが管理者かどうかをチェック
 */
export const isAdmin = async (userId?: string): Promise<boolean> => {
	if (!userId) return false;

	try {
		const { data, error } = await supabase
			.from("profiles")
			.select("role")
			.eq("id", userId)
			.single();

		if (error || !data) return false;

		return data.role === "admin";
	} catch (error) {
		console.error("Admin check error:", error);
		return false;
	}
};

/**
 * ユーザーがモデレーターかどうかをチェック（管理者も含む）
 */
export const isModerator = async (userId?: string): Promise<boolean> => {
	if (!userId) return false;

	try {
		const { data, error } = await supabase
			.from("profiles")
			.select("role")
			.eq("id", userId)
			.single();

		if (error || !data) return false;

		return data.role === "admin" || data.role === "moderator";
	} catch (error) {
		console.error("Moderator check error:", error);
		return false;
	}
};

/**
 * プロフィールから管理者権限をチェック
 */
export const isAdminFromProfile = (profile: Profile | null): boolean => {
	return profile?.role === "admin";
};

/**
 * プロフィールからモデレーター権限をチェック
 */
export const isModeratorFromProfile = (profile: Profile | null): boolean => {
	return profile?.role === "admin" || profile?.role === "moderator";
};

/**
 * 現在のユーザーのプロフィールを取得
 */
export const getCurrentUserProfile = async (): Promise<Profile | null> => {
	try {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) return null;

		const { data, error } = await supabase
			.from("profiles")
			.select("*")
			.eq("id", user.id)
			.single();

		if (error) {
			console.error("Profile fetch error:", error);
			return null;
		}

		return data;
	} catch (error) {
		console.error("Get current user profile error:", error);
		return null;
	}
};
