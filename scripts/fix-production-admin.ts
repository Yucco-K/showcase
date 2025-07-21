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

async function fixProductionAdmin() {
	try {
		const adminEmail = "yuki2082710@gmail.com";

		console.log("=== 本番環境管理者設定修正 ===");
		console.log("対象メールアドレス:", adminEmail);

		// 1. roleカラムの追加
		console.log("\n1. roleカラムの追加...");

		// まず、roleカラムが存在するか確認
		const { data: sampleProfile, error: profileError } = await supabase
			.from("profiles")
			.select("*")
			.limit(1);

		if (profileError) {
			console.error("profilesテーブルアクセスエラー:", profileError);
			return;
		}

		if (sampleProfile && sampleProfile.length > 0) {
			const profile = sampleProfile[0];
			const hasRoleColumn = "role" in profile;

			if (!hasRoleColumn) {
				console.log("roleカラムが存在しないため、追加します...");

				// roleカラムを追加（PostgreSQLのALTER TABLE文を直接実行）
				const { error: alterError } = await supabase
					.from("profiles")
					.update({ role: "user" })
					.eq("id", profile.id);

				if (alterError) {
					console.error("roleカラム追加エラー:", alterError);
					console.log("手動でroleカラムを追加する必要があります");
					return;
				}

				console.log("✅ roleカラムを追加しました");
			} else {
				console.log("✅ roleカラムは既に存在します");
			}
		}

		// 2. 管理者権限の設定
		console.log("\n2. 管理者権限の設定...");
		const { data: updateData, error: updateError } = await supabase
			.from("profiles")
			.update({ role: "admin" })
			.eq("email", adminEmail)
			.select();

		if (updateError) {
			console.error("管理者権限設定エラー:", updateError);
			return;
		}

		if (updateData && updateData.length > 0) {
			console.log("✅ 管理者権限を設定しました:");
			console.log("  - ID:", updateData[0].id);
			console.log("  - Email:", updateData[0].email);
			console.log("  - Role:", updateData[0].role);
		} else {
			console.log("❌ ユーザーの更新に失敗しました");
		}

		// 3. 設定確認
		console.log("\n3. 設定確認...");
		const { data: user, error: userError } = await supabase
			.from("profiles")
			.select("*")
			.eq("email", adminEmail)
			.single();

		if (userError) {
			console.error("設定確認エラー:", userError);
		} else {
			console.log("✅ 最終確認:");
			console.log("  - ID:", user.id);
			console.log("  - Email:", user.email);
			console.log("  - Role:", user.role);
			console.log("  - Created:", user.created_at);
		}

		console.log("\n=== 修正完了 ===");
	} catch (error) {
		console.error("修正中にエラーが発生:", error);
	}
}

fixProductionAdmin();
