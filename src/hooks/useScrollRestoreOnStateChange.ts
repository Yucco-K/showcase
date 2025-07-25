import { useRef, useCallback, useLayoutEffect } from "react";
import { isDevelopmentEnvironment } from "../utils/environment";

/**
 * スクロール位置を保持し、状態変更後に自動復元するためのフック
 * @returns handleWithScrollRestore: (callback: () => void) => (e: MouseEvent) => void
 */
export const useScrollRestoreOnStateChange = () => {
	const scrollPositionRef = useRef<{ x: number; y: number } | null>(null);

	// ラップしたコールバック関数を返す
	const handleWithScrollRestore = useCallback((callback: () => void) => {
		return (e: React.MouseEvent | React.TouchEvent) => {
			e.preventDefault();
			e.stopPropagation();

			// スクロール位置を保存
			scrollPositionRef.current = {
				x: window.scrollX,
				y: window.scrollY,
			};

			// デバッグ用ログ
			if (isDevelopmentEnvironment()) {
				console.debug(
					`[ScrollRestore] Saved position: x=${scrollPositionRef.current.x}, y=${scrollPositionRef.current.y}`
				);
			}

			// 状態更新などの副作用実行
			callback();
		};
	}, []);

	// レンダリング後にスクロール復元
	useLayoutEffect(() => {
		if (scrollPositionRef.current) {
			const { x, y } = scrollPositionRef.current;
			scrollPositionRef.current = null;

			// デバッグ用ログ
			if (isDevelopmentEnvironment()) {
				console.debug(`[ScrollRestore] Restoring position: x=${x}, y=${y}`);
			}

			// モバイル対応: より長い遅延でスクロール復元
			const isMobile =
				/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
					navigator.userAgent
				);
			const delay = isMobile ? 100 : 30; // モバイルは100ms、デスクトップは30ms

			// 2段階復元: 描画 → 次フレーム → さらにタイマーで遅延
			requestAnimationFrame(() => {
				setTimeout(() => {
					// モバイル向け: 複数回復元を試行
					const restoreScroll = () => {
						window.scrollTo(x, y);
						if (isDevelopmentEnvironment()) {
							console.debug(
								`[ScrollRestore] Restored to: x=${window.scrollX}, y=${window.scrollY}`
							);
						}
					};

					restoreScroll();

					// モバイルで復元が失敗する場合があるため、追加で試行
					if (isMobile) {
						setTimeout(restoreScroll, 50);
						setTimeout(restoreScroll, 150);
					}
				}, delay);
			});
		}
	});

	return { handleWithScrollRestore };
};
