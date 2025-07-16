import React from "react";
import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	gap: 1rem;
`;

const SpinnerWheel = styled.div`
	width: 40px;
	height: 40px;
	border: 4px solid rgba(255, 255, 255, 0.1);
	border-left: 4px solid #ffffff;
	border-radius: 50%;
	animation: ${spin} 1s linear infinite;
`;

const SpinnerText = styled.div`
	color: white;
	font-size: 1rem;
	font-weight: 500;
`;

interface SpinnerProps {
	text?: string;
	size?: number;
}

const Spinner: React.FC<SpinnerProps> = ({
	text = "Loading...",
	size = 40,
}) => {
	return (
		<SpinnerContainer>
			<SpinnerWheel style={{ width: size, height: size }} />
			{text && <SpinnerText>{text}</SpinnerText>}
		</SpinnerContainer>
	);
};

export default Spinner;
