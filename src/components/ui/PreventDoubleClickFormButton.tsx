import React from "react";
import styled from "styled-components";
import { useFormContext } from "react-hook-form";
import { usePreventDoubleClick } from "../../hooks/usePreventDoubleClick";

interface PreventDoubleClickFormButtonProps {
	onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
	disabled?: boolean;
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
	delay?: number;
}

const StyledButton = styled.button<{ $isSubmitting: boolean }>`
	opacity: ${({ $isSubmitting }) => ($isSubmitting ? 0.6 : 1)};
	cursor: ${({ $isSubmitting }) => ($isSubmitting ? "not-allowed" : "pointer")};
	transition: opacity 0.2s ease;
`;

export const PreventDoubleClickFormButton: React.FC<
	PreventDoubleClickFormButtonProps
> = ({
	onSubmit,
	disabled = false,
	children,
	className,
	style,
	delay = 1000,
}) => {
	const {
		handleSubmit,
		formState: { isValid },
	} = useFormContext();
	const { isSubmitting, preventDoubleClick } = usePreventDoubleClick(delay);

	const handleFormSubmit = (data: Record<string, unknown>) => {
		preventDoubleClick(() => onSubmit(data));
	};

	return (
		<StyledButton
			onClick={handleSubmit(handleFormSubmit)}
			disabled={disabled || isSubmitting || !isValid}
			className={className}
			style={style}
			type="submit"
			$isSubmitting={isSubmitting}
		>
			{isSubmitting ? "送信中..." : children}
		</StyledButton>
	);
};
