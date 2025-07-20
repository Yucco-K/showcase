import fetch from "node-fetch";

const testCustomReset = async () => {
	try {
		const response = await fetch(
			"http://localhost:3000/api/auth/custom-reset-password",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: "test@example.com", // テスト用メールアドレス
					redirectUrl: "http://localhost:5173/reset-password",
				}),
			}
		);

		const data = await response.json();

		console.log("Response Status:", response.status);
		console.log("Response Data:", JSON.stringify(data, null, 2));

		if (data.resetLink) {
			console.log("\n=== Generated Reset Link ===");
			console.log(data.resetLink);
			console.log("\n=== Tokens Status ===");
			console.log(data.tokens);
		}
	} catch (error) {
		console.error("Test failed:", error);
	}
};

// 実行
testCustomReset();
