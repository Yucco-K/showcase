import React from "react";
import { Button } from "@mantine/core";
import { usePreventDoubleClick } from "../../hooks/usePreventDoubleClick";

interface PreventDoubleClickButtonProps {
	onClick: () => void | Promise<void>;
	disabled?: boolean;
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
	type?: "button" | "submit" | "reset";
	delay?: number;
}

export const PreventDoubleClickButton: React.FC<
	PreventDoubleClickButtonProps
> = ({
	onClick,
	disabled = false,
	children,
	className,
	style,
	type = "button",
	delay = 1000,
}) => {
	const { isSubmitting, preventDoubleClick } = usePreventDoubleClick(delay);

	const handleClick = () => {
		preventDoubleClick(onClick);
	};

	return (
		<Button
			onClick={handleClick}
			disabled={disabled || isSubmitting}
			className={className}
			style={style}
			type={type}
			radius="sm"
			variant="filled"
		>
			{isSubmitting ? "処理中..." : children}
		</Button>
	);
};
