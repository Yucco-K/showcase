// snake_case → camelCase
export function toCamelCase<T extends Record<string, unknown>>(
	obj: T
): unknown {
	if (Array.isArray(obj)) {
		return obj.map(toCamelCase);
	}
	if (obj !== null && typeof obj === "object") {
		return Object.fromEntries(
			Object.entries(obj).map(([key, value]) => [
				key.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
				toCamelCase(value as Record<string, unknown>),
			])
		);
	}
	return obj;
}

// camelCase → snake_case
export function toSnakeCase<T extends Record<string, unknown>>(
	obj: T
): unknown {
	if (Array.isArray(obj)) {
		return obj.map(toSnakeCase);
	}
	if (obj !== null && typeof obj === "object") {
		return Object.fromEntries(
			Object.entries(obj).map(([key, value]) => [
				key.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase()),
				toSnakeCase(value as Record<string, unknown>),
			])
		);
	}
	return obj;
}
