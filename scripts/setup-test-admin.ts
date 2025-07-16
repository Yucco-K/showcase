import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "http://127.0.0.1:54321";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
	throw new Error("Missing SUPABASE_SERVICE_KEY environment variable");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupTestAdmin() {
	try {
		const adminEmail = process.env.ADMIN_EMAIL || "yuki2082710@gmail.com";
		const adminPassword = process.env.ADMIN_PASSWORD;

		if (!adminPassword) {
			throw new Error("Missing ADMIN_PASSWORD environment variable");
		}

		// 管理者アカウントを作成
		const { data: signUpData, error: signUpError } =
			await supabase.auth.admin.createUser({
				email: adminEmail,
				password: adminPassword,
				email_confirm: true,
				user_metadata: {
					is_admin: true,
				},
			});

		if (signUpError) {
			throw signUpError;
		}

		console.log("Test admin account created:", signUpData);
	} catch (error) {
		console.error("Error setting up test admin:", error);
	}
}

setupTestAdmin();
