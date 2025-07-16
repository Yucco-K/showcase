import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Project } from "../types/database";

export function useProjects() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchProjects = async () => {
			try {
				setLoading(true);
				const { data, error } = await supabase
					.from("projects")
					.select("*")
					.order("created_at", { ascending: false });

				if (error) {
					throw error;
				}

				setProjects((data as unknown as Project[]) || []);
			} catch (err) {
				console.error("Failed to fetch projects:", err);
				setError(
					err instanceof Error
						? err.message
						: "プロジェクトの取得に失敗しました"
				);
			} finally {
				setLoading(false);
			}
		};

		fetchProjects();
	}, []);

	return { projects, loading, error };
}
