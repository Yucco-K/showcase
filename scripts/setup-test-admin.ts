import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "http://127.0.0.1:54321";
const supabaseServiceKey =
	"[REDACTED_SUPABASE_SERVICE_KEY]";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupTestAdmin() {
	try {
		// 管理者アカウントを作成
		const { data: signUpData, error: signUpError } =
			await supabase.auth.admin.createUser({
				email: "yuki2082710@gmail.com",
				password: "yukiko0527",
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
