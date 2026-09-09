import { describe, expect, it } from "vitest";
import { CardBrand } from "../types/card";
import {
	detectCardBrand,
	formatCardNumber,
	getCardBrandName,
	maskCardNumber,
	validateCard,
	validateCardNumber,
	validateCVC,
	validateExpiry,
	validateHolderName,
} from "./cardValidation";

describe("validateCardNumber (Luhnアルゴリズム)", () => {
	it("有効なテストカード番号(Visa)を受理する", () => {
		expect(validateCardNumber("4242424242424242")).toBe(true);
	});

	it("スペース区切りのカード番号も受理する", () => {
		expect(validateCardNumber("4242 4242 4242 4242")).toBe(true);
	});

	it("チェックサムが不正なカード番号を拒否する", () => {
		expect(validateCardNumber("4242424242424241")).toBe(false);
	});

	it("数字以外の文字を含む場合は拒否する", () => {
		expect(validateCardNumber("4242abcd42424242")).toBe(false);
	});

	it("空文字を拒否する", () => {
		expect(validateCardNumber("")).toBe(false);
	});
});

describe("detectCardBrand", () => {
	it.each([
		["4242424242424242", CardBrand.VISA],
		["5555555555554444", CardBrand.MASTERCARD],
		["378282246310005", CardBrand.AMEX],
		["3530111333300000", CardBrand.JCB],
		["6011111111111117", CardBrand.DISCOVER],
		["30569309025904", CardBrand.DINERS],
		["9999999999999999", CardBrand.UNKNOWN],
	])("%s のブランドを正しく判定する", (number, expected) => {
		expect(detectCardBrand(number)).toBe(expected);
	});
});

describe("formatCardNumber", () => {
	it("通常のカードは4桁区切りでフォーマットする", () => {
		expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
	});

	it("Amexは4-6-5区切りでフォーマットする", () => {
		expect(formatCardNumber("378282246310005")).toBe("3782 822463 10005");
	});
});

describe("validateExpiry", () => {
	it("未来の有効期限を受理する", () => {
		const nextYear = new Date().getFullYear() + 1;
		expect(validateExpiry("01", String(nextYear).slice(-2))).toBe(true);
	});

	it("過去の年を拒否する", () => {
		expect(validateExpiry("01", "20")).toBe(false);
	});

	it("不正な月(0や13)を拒否する", () => {
		expect(validateExpiry("00", "30")).toBe(false);
		expect(validateExpiry("13", "30")).toBe(false);
	});

	it("数値でない入力を拒否する", () => {
		expect(validateExpiry("ab", "cd")).toBe(false);
	});
});

describe("validateCVC", () => {
	it("Amex以外は3桁を要求する", () => {
		expect(validateCVC("123", CardBrand.VISA)).toBe(true);
		expect(validateCVC("1234", CardBrand.VISA)).toBe(false);
	});

	it("Amexは4桁を要求する", () => {
		expect(validateCVC("1234", CardBrand.AMEX)).toBe(true);
		expect(validateCVC("123", CardBrand.AMEX)).toBe(false);
	});

	it("数字以外を拒否する", () => {
		expect(validateCVC("12a", CardBrand.VISA)).toBe(false);
	});
});

describe("validateHolderName", () => {
	it("英字とスペースのみの名前を受理する", () => {
		expect(validateHolderName("Taro Yamada")).toBe(true);
	});

	it("1文字の名前を拒否する", () => {
		expect(validateHolderName("A")).toBe(false);
	});

	it("日本語や数字を含む名前を拒否する", () => {
		expect(validateHolderName("山田太郎")).toBe(false);
		expect(validateHolderName("Taro123")).toBe(false);
	});
});

describe("validateCard（統合検証）", () => {
	it("すべての項目が正しい場合はisValid=trueを返す", () => {
		const nextYear = new Date().getFullYear() + 1;
		const result = validateCard({
			number: "4242424242424242",
			expiryMonth: "12",
			expiryYear: String(nextYear).slice(-2),
			cvc: "123",
			holderName: "Taro Yamada",
		});
		expect(result.isValid).toBe(true);
		expect(result.errors).toEqual({});
	});

	it("カード番号が空の場合、専用のエラーメッセージを返す", () => {
		const result = validateCard({
			number: "",
			expiryMonth: "12",
			expiryYear: "30",
			cvc: "123",
			holderName: "Taro Yamada",
		});
		expect(result.isValid).toBe(false);
		expect(result.errors.number).toBe("カード番号を入力してください");
	});

	it("複数項目が不正な場合、それぞれのエラーを個別に返す", () => {
		const result = validateCard({
			number: "1234",
			expiryMonth: "",
			expiryYear: "",
			cvc: "",
			holderName: "",
		});
		expect(result.isValid).toBe(false);
		expect(result.errors.number).toBeDefined();
		expect(result.errors.expiryMonth).toBeDefined();
		expect(result.errors.expiryYear).toBeDefined();
		expect(result.errors.cvc).toBeDefined();
		expect(result.errors.holderName).toBeDefined();
	});
});

describe("maskCardNumber", () => {
	it("下4桁以外をマスクする（下4桁のみ数字として残る）", () => {
		const masked = maskCardNumber("4242424242424242");
		expect(masked.endsWith("4242")).toBe(true);
		expect(masked.slice(0, -4)).toMatch(/^\*+$/);
	});

	it("4桁未満はそのまま返す", () => {
		expect(maskCardNumber("42")).toBe("42");
	});
});

describe("getCardBrandName", () => {
	it("既知のブランドは表示名を返す", () => {
		expect(getCardBrandName(CardBrand.VISA)).toBe("Visa");
		expect(getCardBrandName(CardBrand.AMEX)).toBe("American Express");
	});

	it("不明なブランドはUnknownを返す", () => {
		expect(getCardBrandName(CardBrand.UNKNOWN)).toBe("Unknown");
	});
});
