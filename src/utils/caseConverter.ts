// Utility type to transform snake_case keys to camelCase
export type CamelCase<T> = T extends Record<string, any>
	? {
			[K in keyof T as K extends string
				? K extends `${infer P}_${infer S}`
					? `${P}${Capitalize<S>}`
					: K
				: never]: CamelCase<T[K]>;
	  }
	: T;

// Utility type to transform camelCase keys to snake_case
export type SnakeCase<T> = T extends Record<string, any>
	? {
			[K in keyof T as K extends string
				? K extends `${infer P}${infer S}`
					? `${P extends Capitalize<P>
							? "_"
							: ""}${Lowercase<P>}${SnakeCase<S>}`
					: K
				: never]: SnakeCase<T[K]>;
	  }
	: T;

// snake_case → camelCase
export function toCamelCase<T extends Record<string, unknown>>(
	obj: T
): CamelCase<T> {
	if (Array.isArray(obj)) {
		return obj.map(toCamelCase) as any;
	}
	if (obj !== null && typeof obj === "object") {
		return Object.fromEntries(
			Object.entries(obj).map(([key, value]) => [
				key.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
				toCamelCase(value as Record<string, unknown>),
			])
		) as CamelCase<T>;
	}
	return obj as CamelCase<T>;
}

// camelCase → snake_case
export function toSnakeCase<T extends Record<string, unknown>>(
	obj: T
): SnakeCase<T> {
	if (Array.isArray(obj)) {
		return obj.map(toSnakeCase) as any;
	}
	if (obj !== null && typeof obj === "object") {
		return Object.fromEntries(
			Object.entries(obj).map(([key, value]) => [
				key.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase()),
				toSnakeCase(value as Record<string, unknown>),
			])
		) as SnakeCase<T>;
	}
	return obj as SnakeCase<T>;
}
