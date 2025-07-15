import React from "react";
import styled from "styled-components";
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

const StyledButton = styled.button<{ $isSubmitting: boolean }>`
	opacity: ${({ $isSubmitting }) => ($isSubmitting ? 0.6 : 1)};
	cursor: ${({ $isSubmitting }) => ($isSubmitting ? "not-allowed" : "pointer")};
	transition: opacity 0.2s ease;
`;

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
		<StyledButton
			onClick={handleClick}
			disabled={disabled || isSubmitting}
			className={className}
			style={style}
			type={type}
			$isSubmitting={isSubmitting}
		>
			{isSubmitting ? "処理中..." : children}
		</StyledButton>
	);
};
