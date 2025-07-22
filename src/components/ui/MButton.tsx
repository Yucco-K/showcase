import { Button } from "@mantine/core";
import { useState } from "react";
import type { ButtonProps } from "@mantine/core/lib/components/Button/Button";

export interface MButtonProps extends ButtonProps {
	/** 二重クリックを防ぐため自動で disabled にする時間(ms)。0 で無効 */
	preventDoubleClickMs?: number;
}

/**
 * Mantine ラッパーボタン。
 * - `preventDoubleClickMs` を指定するとクリック後に一時的に無効化して二重送信を防止
 * - Mantine Button のすべての props をそのまま使用可能
 */
export const MButton = ({
	preventDoubleClickMs = 0,
	onClick,
	disabled,
	children,
	...rest
}: MButtonProps) => {
	const [localDisabled, setLocalDisabled] = useState(false);

	const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
		if (preventDoubleClickMs > 0) {
			setLocalDisabled(true);
			setTimeout(() => setLocalDisabled(false), preventDoubleClickMs);
		}
		onClick?.(e);
	};

	return (
		<Button
			onClick={handleClick}
			disabled={disabled || localDisabled}
			{...rest}
		>
			{children}
		</Button>
	);
};
