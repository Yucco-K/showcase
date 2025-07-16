import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Project, Profile } from "../types/database";
import type { User } from "@supabase/supabase-js";

export function useProjects() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchProjects() {
			try {
				setLoading(true);
				const { data, error } = await supabase
					.from("projects")
					.select("*")
					.order("created_at", { ascending: false });

				if (error) {
					throw error;
				}

				setProjects(data || []);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "プロジェクトの取得に失敗しました"
				);
			} finally {
				setLoading(false);
			}
		}

		fetchProjects();
	}, []);

	return { projects, loading, error };
}

export function useProfile(userId?: string) {
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!userId) {
			setLoading(false);
			return;
		}

		async function fetchProfile() {
			try {
				setLoading(true);
				const { data, error } = await supabase
					.from("profiles")
					.select("*")
					.eq("id", userId)
					.single();

				if (error) {
					throw error;
				}

				setProfile(data);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "プロファイルの取得に失敗しました"
				);
			} finally {
				setLoading(false);
			}
		}

		fetchProfile();
	}, [userId]);

	return { profile, loading, error };
}

export function useSupabaseAuth() {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// 認証状態の監視
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			setUser(session?.user || null);
			setLoading(false);
		});

		return () => subscription.unsubscribe();
	}, []);

	return { user, loading };
}
