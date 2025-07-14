import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export function useBgColor() {
	const { pathname } = useLocation();

	return useMemo(() => {
		if (pathname === "/internship") return "#ffe5b4"; // 薄いオレンジ
		if (pathname === "/portfolio") return "#d0ffd6"; // 薄い黄緑
		if (pathname === "/payment") return "#f0f8ff"; // 薄いブルー
		return "#2b8dff"; // 濃いスカイブルー
	}, [pathname]);
}
