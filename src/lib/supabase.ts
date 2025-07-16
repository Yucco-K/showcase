import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
	throw new Error("Missing env.VITE_SUPABASE_URL");
}

if (!supabaseAnonKey) {
	throw new Error("Missing env.VITE_SUPABASE_ANON_KEY");
}

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const initSupabase = () => {
	if (!supabaseInstance) {
		supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
	}
	return supabaseInstance;
};

export const supabase = initSupabase();
