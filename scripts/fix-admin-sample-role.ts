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

async function fixAdminSampleRole() {
	try {
		const adminEmail = "admin@sample.com";

		console.log("=== admin@sample.com のrole修正 ===");
		console.log("対象メールアドレス:", adminEmail);

		// 1. 現在の状況確認
		console.log("\n1. 現在の状況確認...");
		const { data: user, error: userError } = await supabase
			.from("profiles")
			.select("*")
			.eq("email", adminEmail)
			.single();

		if (userError) {
			console.error("ユーザー確認エラー:", userError);
			return;
		}

		console.log("現在の設定:");
		console.log("  - ID:", user.id);
		console.log("  - Email:", user.email);
		console.log("  - Role:", user.role);
		console.log("  - Created:", user.created_at);

		// 2. roleをadminに更新
		console.log("\n2. roleをadminに更新...");
		const { data: updateData, error: updateError } = await supabase
			.from("profiles")
			.update({ role: "admin" })
			.eq("email", adminEmail)
			.select();

		if (updateError) {
			console.error("role更新エラー:", updateError);
			return;
		}

		if (updateData && updateData.length > 0) {
			console.log("✅ roleをadminに更新しました:");
			console.log("  - ID:", updateData[0].id);
			console.log("  - Email:", updateData[0].email);
			console.log("  - Role:", updateData[0].role);
		} else {
			console.log("❌ 更新に失敗しました");
		}

		// 3. 最終確認
		console.log("\n3. 最終確認...");
		const { data: finalUser, error: finalError } = await supabase
			.from("profiles")
			.select("*")
			.eq("email", adminEmail)
			.single();

		if (finalError) {
			console.error("最終確認エラー:", finalError);
		} else {
			console.log("✅ 最終確認:");
			console.log("  - ID:", finalUser.id);
			console.log("  - Email:", finalUser.email);
			console.log("  - Role:", finalUser.role);

			if (finalUser.role === "admin") {
				console.log("✅ admin@sample.com のroleが正常にadminに設定されました");
			} else {
				console.log("❌ roleの設定に問題があります");
			}
		}

		console.log("\n=== 修正完了 ===");
	} catch (error) {
		console.error("修正中にエラーが発生:", error);
	}
}

fixAdminSampleRole();
