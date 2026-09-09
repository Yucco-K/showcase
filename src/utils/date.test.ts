import { describe, expect, it } from "vitest";
import { formatDate } from "./date";

describe("formatDate", () => {
	it("日本語形式(デフォルト)で年月日を返す", () => {
		expect(formatDate("2026-03-05")).toBe("2026年3月5日");
	});

	it("iso形式を指定した場合はYYYY-MM-DD形式を返す", () => {
		expect(formatDate("2026-03-05T10:00:00Z", "iso")).toBe("2026-03-05");
	});

	it("空文字を渡した場合は空文字を返す", () => {
		expect(formatDate("")).toBe("");
	});

	it("不正な日付文字列は入力をそのまま返す", () => {
		expect(formatDate("not-a-date")).toBe("not-a-date");
	});
});
