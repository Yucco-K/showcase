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

async function checkProductionAdmin() {
	try {
		const adminEmail = "yuki2082710@gmail.com";

		console.log("=== 本番環境管理者設定確認 ===");
		console.log("確認対象メールアドレス:", adminEmail);

		// 1. profilesテーブルの構造確認（roleカラムの存在確認）
		console.log("\n1. profilesテーブルの構造確認...");

		// roleカラムの存在を確認するため、まずprofilesテーブルにアクセス
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
			console.log("profilesテーブルのカラム:");
			Object.keys(profile).forEach((key) => {
				console.log(
					`  - ${key}: ${typeof profile[key as keyof typeof profile]}`
				);
			});

			// roleカラムの存在確認
			const hasRoleColumn = "role" in profile;
			console.log(
				`\nroleカラムの存在: ${hasRoleColumn ? "✅ 存在" : "❌ 不存在"}`
			);
		} else {
			console.log("profilesテーブルにデータがありません");
		}

		// 3. 指定メールアドレスのユーザー確認
		console.log("\n2. ユーザー確認...");
		const { data: user, error: userError } = await supabase
			.from("profiles")
			.select("*")
			.eq("email", adminEmail)
			.single();

		if (userError) {
			if (userError.code === "PGRST116") {
				console.log("❌ ユーザーが見つかりません:", adminEmail);
			} else {
				console.error("ユーザー確認エラー:", userError);
			}
		} else {
			console.log("✅ ユーザーが見つかりました:");
			console.log("  - ID:", user.id);
			console.log("  - Email:", user.email);
			console.log("  - Role:", user.role || "未設定");
			console.log("  - Created:", user.created_at);
		}

		// 4. 管理者権限チェック関数の確認（スキップ）
		console.log("\n3. 管理者権限チェック関数の確認...");
		console.log("（この確認はスキップします）");

		// 5. 環境変数の確認
		console.log("\n4. 環境変数確認...");
		const adminEmails = process.env.VITE_ADMIN_EMAILS;
		console.log("VITE_ADMIN_EMAILS:", adminEmails);

		if (adminEmails) {
			const emailList = adminEmails
				.split(",")
				.map((e) => e.trim().toLowerCase());
			console.log("設定済み管理者メールアドレス:");
			emailList.forEach((email) => {
				console.log(`  - ${email}`);
			});

			const isIncluded = emailList.includes(adminEmail.toLowerCase());
			console.log(
				`\n${adminEmail} の含まれ: ${
					isIncluded ? "✅ 含まれている" : "❌ 含まれていない"
				}`
			);
		} else {
			console.log("❌ VITE_ADMIN_EMAILS が設定されていません");
		}

		console.log("\n=== 確認完了 ===");
	} catch (error) {
		console.error("確認中にエラーが発生:", error);
	}
}

checkProductionAdmin();
