import { useState, useEffect, useCallback } from "react";

interface LoginAttemptsState {
	attempts: number;
	isBlocked: boolean;
	blockedUntil: number | null;
	timeRemaining: number;
}

const MAX_ATTEMPTS = 10; // 初回試行 + 9回の再試行 = 計10回
const BLOCK_DURATION = 5 * 60 * 1000; // 5分（ミリ秒）
const STORAGE_KEY = "login_attempts";

export const useLoginAttempts = (onBlockReleased?: () => void) => {
	const [state, setState] = useState<LoginAttemptsState>({
		attempts: 0,
		isBlocked: false,
		blockedUntil: null,
		timeRemaining: 0,
	});

	// ローカルストレージから状態を復元
	const loadFromStorage = useCallback(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const data = JSON.parse(stored);
				const now = Date.now();

				if (data.blockedUntil && now < data.blockedUntil) {
					// まだブロック期間中
					setState({
						attempts: data.attempts || 0,
						isBlocked: true,
						blockedUntil: data.blockedUntil,
						timeRemaining: Math.ceil((data.blockedUntil - now) / 1000),
					});
				} else {
					// ブロック期間が終了している場合はリセット
					setState({
						attempts: 0,
						isBlocked: false,
						blockedUntil: null,
						timeRemaining: 0,
					});
					localStorage.removeItem(STORAGE_KEY);
					// ページロード時にブロックが既に解除されている場合もコールバックを実行
					if (data.blockedUntil && onBlockReleased) {
						setTimeout(() => onBlockReleased(), 0);
					}
				}
			}
		} catch (error) {
			console.error("Failed to load login attempts from storage:", error);
		}
	}, [onBlockReleased]);

	// ローカルストレージに状態を保存
	const saveToStorage = useCallback((newState: LoginAttemptsState) => {
		try {
			if (newState.isBlocked && newState.blockedUntil) {
				localStorage.setItem(
					STORAGE_KEY,
					JSON.stringify({
						attempts: newState.attempts,
						blockedUntil: newState.blockedUntil,
					})
				);
			} else {
				localStorage.removeItem(STORAGE_KEY);
			}
		} catch (error) {
			console.error("Failed to save login attempts to storage:", error);
		}
	}, []);

	// コンポーネントマウント時に状態を復元
	useEffect(() => {
		loadFromStorage();
	}, [loadFromStorage]);

	// カウントダウンタイマー
	useEffect(() => {
		let interval: NodeJS.Timeout;

		if (state.isBlocked && state.timeRemaining > 0) {
			interval = setInterval(() => {
				setState((prevState) => {
					if (prevState.timeRemaining <= 1) {
						// ブロック解除
						const newState = {
							attempts: 0,
							isBlocked: false,
							blockedUntil: null,
							timeRemaining: 0,
						};
						saveToStorage(newState);
						// ブロック解除時のコールバックを実行
						if (onBlockReleased) {
							onBlockReleased();
						}
						return newState;
					}

					return {
						...prevState,
						timeRemaining: prevState.timeRemaining - 1,
					};
				});
			}, 1000);
		}

		return () => {
			if (interval) {
				clearInterval(interval);
			}
		};
	}, [state.isBlocked, state.timeRemaining, saveToStorage, onBlockReleased]);

	// ログイン失敗時の処理
	const recordFailedAttempt = useCallback(() => {
		setState((prevState) => {
			const newAttempts = prevState.attempts + 1;

			if (newAttempts >= MAX_ATTEMPTS) {
				// 制限に達した場合はブロック
				const blockedUntil = Date.now() + BLOCK_DURATION;
				const newState = {
					attempts: newAttempts,
					isBlocked: true,
					blockedUntil,
					timeRemaining: Math.ceil(BLOCK_DURATION / 1000),
				};
				saveToStorage(newState);
				return newState;
			}

			const newState = {
				...prevState,
				attempts: newAttempts,
			};
			saveToStorage(newState);
			return newState;
		});
	}, [saveToStorage]);

	// ログイン成功時の処理（試行回数をリセット）
	const resetAttempts = useCallback(() => {
		const newState = {
			attempts: 0,
			isBlocked: false,
			blockedUntil: null,
			timeRemaining: 0,
		};
		setState(newState);
		saveToStorage(newState);
	}, [saveToStorage]);

	// 残り試行回数を計算
	const remainingAttempts = Math.max(0, MAX_ATTEMPTS - state.attempts);

	// カウントダウン表示用のフォーマット関数
	const formatTimeRemaining = useCallback((seconds: number): string => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	}, []);

	return {
		attempts: state.attempts,
		remainingAttempts,
		isBlocked: state.isBlocked,
		timeRemaining: state.timeRemaining,
		timeRemainingFormatted: formatTimeRemaining(state.timeRemaining),
		recordFailedAttempt,
		resetAttempts,
		maxAttempts: MAX_ATTEMPTS,
	};
};
