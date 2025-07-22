export function formatDate(
	dateString: string,
	format: "ja" | "iso" = "ja"
): string {
	if (!dateString) return "";
	const date = new Date(dateString);
	if (isNaN(date.getTime())) return dateString;
	if (format === "ja") {
		return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
	} else {
		// ISO形式
		return date.toISOString().slice(0, 10);
	}
}
