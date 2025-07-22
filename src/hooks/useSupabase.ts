import { useSupabaseQuery } from "./common/useSupabaseQuery";
import type { Project, Profile } from "../types/database";
import type { User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useProjects() {
	const {
		data: projects,
		loading,
		error,
		refetch,
	} = useSupabaseQuery<Project, Project>({
		table: "projects",
		select: "*",
		order: { column: "created_at", ascending: false },
		cache: true,
	});
	return { projects, loading, error, refetch };
}

export function useProfile(userId?: string) {
	const { data, loading, error, refetch } = useSupabaseQuery<Profile, Profile>({
		table: "profiles",
		select: "*",
		eq: userId ? { id: userId } : undefined,
		cache: true,
	});
	// 単一取得なのでdata[0]を返す
	return { profile: data[0] ?? null, loading, error, refetch };
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
