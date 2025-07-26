#!/usr/bin/env -S deno run --allow-net --allow-env

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getTestJWT() {
	try {
		// テスト用ユーザーでサインイン（存在しない場合は作成）
		const { data, error } = await supabase.auth.signInWithPassword({
			email: "test@example.com",
			password: "testpassword123",
		});

		if (error) {
			console.log("サインインエラー:", error.message);

			// ユーザーが存在しない場合は作成
			if (error.message.includes("Invalid login credentials")) {
				console.log("テストユーザーを作成中...");
				const { data: signUpData, error: signUpError } =
					await supabase.auth.signUp({
						email: "test@example.com",
						password: "testpassword123",
					});

				if (signUpError) {
					console.error("ユーザー作成エラー:", signUpError);
					return;
				}

				console.log("テストユーザー作成完了");
				console.log("アクセストークン:", signUpData.session?.access_token);
				return signUpData.session?.access_token;
			}
			return;
		}

		console.log("サインイン成功");
		console.log("アクセストークン:", data.session?.access_token);
		return data.session?.access_token;
	} catch (err) {
		console.error("JWT取得エラー:", err);
	}
}

if (import.meta.main) {
	getTestJWT();
}
