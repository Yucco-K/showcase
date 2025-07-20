import React, { useState } from "react";
import {
	signUpSchema,
	profileUpdateSchema,
	changePasswordSchema,
} from "../../lib/validation";

export const ValidationTest: React.FC = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [username, setUsername] = useState("");
	const [biography, setBiography] = useState("");
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [result, setResult] = useState<string>("");

	const testSignUp = () => {
		try {
			signUpSchema.parse({ email, password });
			setResult("✅ サインアップバリデーション成功");
		} catch (error) {
			if (error instanceof Error) {
				setResult(`❌ サインアップエラー: ${error.message}`);
			}
		}
	};

	const testProfileUpdate = () => {
		try {
			profileUpdateSchema.parse({ username, biography });
			setResult("✅ プロフィール更新バリデーション成功");
		} catch (error) {
			if (error instanceof Error) {
				setResult(`❌ プロフィール更新エラー: ${error.message}`);
			}
		}
	};

	const testPasswordChange = () => {
		try {
			changePasswordSchema.parse({
				currentPassword,
				newPassword,
				confirmPassword,
			});
			setResult("✅ パスワード変更バリデーション成功");
		} catch (error) {
			if (error instanceof Error) {
				setResult(`❌ パスワード変更エラー: ${error.message}`);
			}
		}
	};

	return (
		<div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
			<h2>バリデーションテスト</h2>

			<div style={{ marginBottom: "20px" }}>
				<h3>サインアップテスト</h3>
				<input
					type="email"
					placeholder="メールアドレス"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					style={{ marginRight: "10px", padding: "5px" }}
				/>
				<input
					type="password"
					placeholder="パスワード"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					style={{ marginRight: "10px", padding: "5px" }}
				/>
				<button type="button" onClick={testSignUp}>
					テスト
				</button>
			</div>

			<div style={{ marginBottom: "20px" }}>
				<h3>プロフィール更新テスト</h3>
				<input
					type="text"
					placeholder="ユーザーネーム"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					style={{ marginRight: "10px", padding: "5px" }}
				/>
				<input
					type="text"
					placeholder="バイオグラフィー"
					value={biography}
					onChange={(e) => setBiography(e.target.value)}
					style={{ marginRight: "10px", padding: "5px" }}
				/>
				<button type="button" onClick={testProfileUpdate}>
					テスト
				</button>
			</div>

			<div style={{ marginBottom: "20px" }}>
				<h3>パスワード変更テスト</h3>
				<input
					type="password"
					placeholder="現在のパスワード"
					value={currentPassword}
					onChange={(e) => setCurrentPassword(e.target.value)}
					style={{ marginRight: "10px", padding: "5px" }}
				/>
				<input
					type="password"
					placeholder="新しいパスワード"
					value={newPassword}
					onChange={(e) => setNewPassword(e.target.value)}
					style={{ marginRight: "10px", padding: "5px" }}
				/>
				<input
					type="password"
					placeholder="確認用パスワード"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
					style={{ marginRight: "10px", padding: "5px" }}
				/>
				<button type="button" onClick={testPasswordChange}>
					テスト
				</button>
			</div>

			<div
				style={{
					padding: "10px",
					backgroundColor: result.includes("❌") ? "#fee" : "#efe",
					border: "1px solid #ccc",
					borderRadius: "5px",
				}}
			>
				<strong>結果:</strong> {result || "テストを実行してください"}
			</div>
		</div>
	);
};
