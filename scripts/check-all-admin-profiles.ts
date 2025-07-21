import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
	throw new Error("Missing VITE_SUPABASE_URL environment variable");
}

if (!supabaseServiceKey) {
	throw new Error("Missing SUPABASE_SERVICE_KEY environment variable");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAllAdminProfiles() {
	try {
		console.log("=== 全管理者プロファイル確認 ===");

		// 環境変数から管理者メールアドレスを取得
		const adminEmails = process.env.VITE_ADMIN_EMAILS;
		if (!adminEmails) {
			console.log("❌ VITE_ADMIN_EMAILS が設定されていません");
			return;
		}

		const emailList = adminEmails.split(",").map((e) => e.trim().toLowerCase());
		console.log("設定済み管理者メールアドレス:", emailList);

		// 各メールアドレスのプロファイルを確認
		for (const email of emailList) {
			console.log(`\n--- ${email} の確認 ---`);

			const { data: user, error: userError } = await supabase
				.from("profiles")
				.select("*")
				.eq("email", email)
				.single();

			if (userError) {
				if (userError.code === "PGRST116") {
					console.log(`❌ ユーザーが見つかりません: ${email}`);
				} else {
					console.error(`ユーザー確認エラー (${email}):`, userError);
				}
			} else {
				console.log(`✅ ユーザーが見つかりました:`);
				console.log(`  - ID: ${user.id}`);
				console.log(`  - Email: ${user.email}`);
				console.log(`  - Role: ${user.role || "未設定"}`);
				console.log(`  - Created: ${user.created_at}`);

				// roleがadminでない場合は警告
				if (user.role !== "admin") {
					console.log(
						`⚠️  警告: ${email} のroleが "admin" ではありません (現在: ${
							user.role || "未設定"
						})`
					);
				}
			}
		}

		// 全admin権限を持つユーザーを確認
		console.log("\n=== 全admin権限ユーザー確認 ===");
		const { data: adminUsers, error: adminError } = await supabase
			.from("profiles")
			.select("*")
			.eq("role", "admin");

		if (adminError) {
			console.error("admin権限ユーザー確認エラー:", adminError);
		} else {
			console.log(`admin権限を持つユーザー数: ${adminUsers?.length || 0}`);
			adminUsers?.forEach((user) => {
				console.log(`  - ${user.email} (ID: ${user.id})`);
			});
		}

		console.log("\n=== 確認完了 ===");
	} catch (error) {
		console.error("確認中にエラーが発生:", error);
	}
}

checkAllAdminProfiles();
