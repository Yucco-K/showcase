import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
	throw new Error("Missing VITE_SUPABASE_URL environment variable");
}

if (!supabaseServiceKey) {
	throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupProductionAdmin() {
	try {
		const adminEmail = "yuki2082710@gmail.com";

		console.log("Setting up admin role for:", adminEmail);

		// 1. まず、profilesテーブルにroleカラムが存在するかチェック
		const { data: columnCheck, error: columnError } = await supabase
			.from("information_schema.columns")
			.select("column_name")
			.eq("table_name", "profiles")
			.eq("column_name", "role");

		if (columnError) {
			console.error("Error checking for role column:", columnError);
			return;
		}

		// 2. roleカラムが存在しない場合は追加
		if (!columnCheck || columnCheck.length === 0) {
			console.log("Adding role column to profiles table...");
			const { error: alterError } = await supabase.rpc("exec_sql", {
				sql: `
					ALTER TABLE public.profiles 
					ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));
				`,
			});

			if (alterError) {
				console.error("Error adding role column:", alterError);
				return;
			}
			console.log("Role column added successfully");
		} else {
			console.log("Role column already exists");
		}

		// 3. 指定されたメールアドレスのユーザーを管理者に設定
		console.log("Setting admin role for user...");
		const { data: updateData, error: updateError } = await supabase
			.from("profiles")
			.update({ role: "admin" })
			.eq("email", adminEmail)
			.select();

		if (updateError) {
			console.error("Error updating user role:", updateError);
			return;
		}

		if (updateData && updateData.length > 0) {
			console.log("Admin role set successfully for:", adminEmail);
			console.log("Updated profile:", updateData[0]);
		} else {
			console.log("No user found with email:", adminEmail);

			// 4. ユーザーが存在しない場合は作成
			console.log("Creating admin user...");
			const { data: createData, error: createError } =
				await supabase.auth.admin.createUser({
					email: adminEmail,
					password: "temporary_password_123", // 一時的なパスワード
					email_confirm: true,
					user_metadata: {
						is_admin: true,
					},
				});

			if (createError) {
				console.error("Error creating admin user:", createError);
				return;
			}

			console.log("Admin user created:", createData.user?.id);

			// 5. 作成されたユーザーのプロフィールを更新
			if (createData.user) {
				const { error: profileError } = await supabase
					.from("profiles")
					.update({ role: "admin" })
					.eq("id", createData.user.id);

				if (profileError) {
					console.error("Error updating profile role:", profileError);
				} else {
					console.log("Profile role updated successfully");
				}
			}
		}

		// 6. 管理者権限チェック関数を作成
		console.log("Creating admin check functions...");
		const { error: functionError } = await supabase.rpc("exec_sql", {
			sql: `
				CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
				RETURNS BOOLEAN AS $$
				BEGIN
					RETURN EXISTS (
						SELECT 1 FROM public.profiles 
						WHERE id = user_id AND role = 'admin'
					);
				END;
				$$ LANGUAGE plpgsql SECURITY DEFINER;
			`,
		});

		if (functionError) {
			console.error("Error creating is_admin function:", functionError);
		} else {
			console.log("Admin check function created successfully");
		}

		console.log("Production admin setup completed successfully!");
	} catch (error) {
		console.error("Error in production admin setup:", error);
	}
}

setupProductionAdmin();
