import { describe, expect, it } from "vitest";
import { toCamelCase, toSnakeCase } from "./caseConverter";

describe("toCamelCase", () => {
	it("snake_caseのキーをcamelCaseに変換する", () => {
		expect(toCamelCase({ user_name: "taro", is_admin: true })).toEqual({
			userName: "taro",
			isAdmin: true,
		});
	});

	it("ネストしたオブジェクトも再帰的に変換する", () => {
		expect(
			toCamelCase({ user_info: { first_name: "taro", last_name: "yamada" } })
		).toEqual({
			userInfo: { firstName: "taro", lastName: "yamada" },
		});
	});

	it("配列の要素も変換する", () => {
		expect(toCamelCase({ items: [{ item_id: "1" }, { item_id: "2" }] })).toEqual(
			{
				items: [{ itemId: "1" }, { itemId: "2" }],
			}
		);
	});

	it("アンダースコアを含まないキーはそのまま保持する", () => {
		expect(toCamelCase({ id: "1", name: "test" })).toEqual({
			id: "1",
			name: "test",
		});
	});
});

describe("toSnakeCase", () => {
	it("camelCaseのキーをsnake_caseに変換する", () => {
		expect(toSnakeCase({ userName: "taro", isAdmin: true })).toEqual({
			user_name: "taro",
			is_admin: true,
		});
	});

	it("ネストしたオブジェクトも再帰的に変換する", () => {
		expect(
			toSnakeCase({ userInfo: { firstName: "taro", lastName: "yamada" } })
		).toEqual({
			user_info: { first_name: "taro", last_name: "yamada" },
		});
	});

	it("toCamelCaseとtoSnakeCaseは互いに逆変換になる", () => {
		const original = { user_name: "taro", contact_info: { phone_number: "123" } };
		expect(toSnakeCase(toCamelCase(original))).toEqual(original);
	});
});
