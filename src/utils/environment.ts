/**
 * 開発環境かどうかを判定するユーティリティ関数
 * @returns {boolean} 開発環境の場合true
 */
export function isDevelopmentEnvironment(): boolean {
	return (
		(typeof import.meta !== "undefined" &&
			(import.meta as { env?: { DEV?: boolean } }).env?.DEV) ||
		process.env.NODE_ENV === "development"
	);
}
