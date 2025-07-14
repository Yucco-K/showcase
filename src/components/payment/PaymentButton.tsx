import styled from "styled-components";

const Button = styled.button<{ $disabled: boolean }>`
	width: 100%;
	padding: 1rem;
	background: ${({ $disabled }) => ($disabled ? "#ccc" : "#007bff")};
	color: white;
	border: none;
	border-radius: 6px;
	font-size: 1.1rem;
	font-weight: 600;
	cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
	transition: background 0.3s ease;

	&:hover {
		background: ${({ $disabled }) => ($disabled ? "#ccc" : "#0056b3")};
	}
`;

const DisclaimerText = styled.div`
	margin-top: 1rem;
	font-size: 0.9rem;
	color: #666;
	text-align: center;
`;

interface PaymentButtonProps {
	loading: boolean;
	planName: string;
	onClick: () => void;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
	loading,
	planName,
	onClick,
}) => {
	return (
		<>
			<Button $disabled={loading} onClick={onClick}>
				{loading ? "処理中..." : `${planName}プランで決済する`}
			</Button>

			<DisclaimerText>
				※ これはデモ画面です。実際の決済は行われません。
			</DisclaimerText>
		</>
	);
};

export default PaymentButton;
