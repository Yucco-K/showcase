import { describe, expect, it } from "vitest";
import {
	changePasswordSchema,
	emailSchema,
	passwordSchema,
	profileUpdateSchema,
	signInSchema,
	signUpSchema,
	usernameSchema,
} from "./validation";

describe("emailSchema", () => {
	it("有効なメールアドレスを受理する", () => {
		expect(emailSchema.safeParse("user@example.com").success).toBe(true);
	});

	it("空文字を拒否する", () => {
		const result = emailSchema.safeParse("");
		expect(result.success).toBe(false);
	});

	it("形式が不正なメールアドレスを拒否する", () => {
		expect(emailSchema.safeParse("not-an-email").success).toBe(false);
	});

	it("254文字を超えるメールアドレスを拒否する", () => {
		const longLocal = "a".repeat(250);
		expect(emailSchema.safeParse(`${longLocal}@example.com`).success).toBe(
			false
		);
	});
});

describe("passwordSchema", () => {
	it("大文字・小文字・数字を含む8文字以上を受理する", () => {
		expect(passwordSchema.safeParse("Passw0rd").success).toBe(true);
	});

	it("8文字未満を拒否する", () => {
		expect(passwordSchema.safeParse("Pass0rd").success).toBe(false);
	});

	it("数字を含まない場合は拒否する", () => {
		expect(passwordSchema.safeParse("Passwordonly").success).toBe(false);
	});

	it("大文字を含まない場合は拒否する", () => {
		expect(passwordSchema.safeParse("passw0rd").success).toBe(false);
	});

	it("128文字を超える場合は拒否する", () => {
		expect(passwordSchema.safeParse("Aa1".repeat(50)).success).toBe(false);
	});
});

describe("usernameSchema", () => {
	it("日本語のユーザーネームを受理する", () => {
		expect(usernameSchema.safeParse("山田太郎").success).toBe(true);
	});

	it("英数字とハイフン・アンダースコアを受理する", () => {
		expect(usernameSchema.safeParse("taro_yamada-01").success).toBe(true);
	});

	it("空文字を拒否する", () => {
		expect(usernameSchema.safeParse("").success).toBe(false);
	});

	it("50文字を超える場合は拒否する", () => {
		expect(usernameSchema.safeParse("あ".repeat(51)).success).toBe(false);
	});

	it("制御文字を含む場合は拒否する", () => {
		expect(usernameSchema.safeParse("taro\n").success).toBe(false);
	});
});

describe("signUpSchema / signInSchema", () => {
	it("有効なメール・パスワードの組み合わせを受理する（サインアップ）", () => {
		const result = signUpSchema.safeParse({
			email: "user@example.com",
			password: "Passw0rd",
		});
		expect(result.success).toBe(true);
	});

	it("サインインはパスワードの複雑性要件を課さない", () => {
		const result = signInSchema.safeParse({
			email: "user@example.com",
			password: "any",
		});
		expect(result.success).toBe(true);
	});

	it("サインインでも空パスワードは拒否する", () => {
		const result = signInSchema.safeParse({
			email: "user@example.com",
			password: "",
		});
		expect(result.success).toBe(false);
	});
});

describe("profileUpdateSchema", () => {
	it("usernameとbiographyは省略可能", () => {
		expect(profileUpdateSchema.safeParse({}).success).toBe(true);
	});

	it("500文字を超えるbiographyを拒否する", () => {
		const result = profileUpdateSchema.safeParse({
			biography: "あ".repeat(501),
		});
		expect(result.success).toBe(false);
	});
});

describe("changePasswordSchema", () => {
	it("新パスワードと確認用パスワードが一致する場合は成功する", () => {
		const result = changePasswordSchema.safeParse({
			currentPassword: "OldPass1",
			newPassword: "NewPass1",
			confirmPassword: "NewPass1",
		});
		expect(result.success).toBe(true);
	});

	it("新パスワードと確認用パスワードが不一致の場合は失敗する", () => {
		const result = changePasswordSchema.safeParse({
			currentPassword: "OldPass1",
			newPassword: "NewPass1",
			confirmPassword: "Different1",
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].path).toEqual(["confirmPassword"]);
		}
	});
});
