import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import type { Product } from "../../types/product";
import type { CreditCard, CardValidation, PaymentFlow } from "../../types/card";
import { CardInput } from "./CardInput";
import { useProductPayment } from "../../hooks/useProductPayment";

interface PaymentModalProps {
	product: Product;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: (productId: string) => void;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Overlay = styled.div<{ isOpen: boolean }>`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.8);
	backdrop-filter: blur(10px);
	z-index: 1000;
	display: ${(props) => (props.isOpen ? "flex" : "none")};
	align-items: center;
	justify-content: center;
	padding: 20px;
	animation: ${fadeIn} 0.3s ease-out;
`;

const ModalContainer = styled.div`
	background: rgba(30, 30, 30, 0.95);
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 20px;
	max-width: 600px;
	width: 100%;
	max-height: 90vh;
	overflow-y: auto;
	position: relative;
	animation: ${slideUp} 0.3s ease-out;

	@media (max-width: 768px) {
		max-width: 95vw;
		border-radius: 16px;
	}
`;

const CloseButton = styled.button`
	position: absolute;
	top: 20px;
	right: 20px;
	background: rgba(255, 255, 255, 0.1);
	border: none;
	border-radius: 50%;
	width: 40px;
	height: 40px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-size: 18px;
	cursor: pointer;
	transition: all 0.2s ease;
	z-index: 1001;

	&:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: scale(1.1);
	}
`;

const ModalHeader = styled.div`
	padding: 32px 32px 0 32px;
	text-align: center;
	position: relative;
`;

const StepIndicator = styled.div`
	display: flex;
	justify-content: center;
	gap: 8px;
	margin-bottom: 24px;
`;

const Step = styled.div<{ $active: boolean; $completed: boolean }>`
	width: 40px;
	height: 40px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 14px;
	font-weight: 600;
	transition: all 0.3s ease;

	${(props) => {
		if (props.$completed) {
			return `
        background: #4ade80;
        color: white;
      `;
		} else if (props.$active) {
			return `
        background: #3b82f6;
        color: white;
      `;
		} else {
			return `
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.5);
      `;
		}
	}}
`;

const Title = styled.h2`
	color: white;
	font-size: 24px;
	font-weight: 700;
	margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
	color: rgba(255, 255, 255, 0.7);
	font-size: 16px;
	margin: 0 0 24px 0;
`;

const ProductSummary = styled.div`
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 12px;
	padding: 20px;
	margin: 24px 32px;
	display: flex;
	gap: 16px;
	align-items: center;
`;

const ProductImage = styled.div`
	width: 60px;
	height: 60px;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-size: 12px;
	font-weight: bold;
	text-align: center;
	flex-shrink: 0;
`;

const ProductInfo = styled.div`
	flex: 1;
`;

const ProductName = styled.h3`
	color: white;
	font-size: 16px;
	font-weight: 600;
	margin: 0 0 4px 0;
`;

const ProductDescription = styled.p`
	color: rgba(255, 255, 255, 0.7);
	font-size: 14px;
	margin: 0 0 8px 0;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
`;

const ProductPrice = styled.div`
	color: #4ade80;
	font-size: 20px;
	font-weight: 700;
`;

const ModalContent = styled.div`
	padding: 0 32px 32px 32px;
`;

const ActionButtons = styled.div`
	display: flex;
	gap: 12px;
	margin-top: 24px;

	@media (max-width: 480px) {
		flex-direction: column;
	}
`;

const Button = styled.button<{ $variant?: "primary" | "secondary" }>`
	flex: 1;
	padding: 14px 24px;
	border-radius: 12px;
	font-size: 16px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	${(props) => {
		if (props.$variant === "primary") {
			return `
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
        border: none;
        
        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
        }
      `;
		} else {
			return `
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.3);
        
        &:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
        }
      `;
		}
	}}
`;

const LoadingSpinner = styled.div`
	width: 20px;
	height: 20px;
	border: 2px solid rgba(255, 255, 255, 0.3);
	border-top: 2px solid white;
	border-radius: 50%;
	animation: ${spin} 1s linear infinite;
`;

const ConfirmationSection = styled.div`
	text-align: center;
	padding: 20px 0;
`;

const ConfirmationIcon = styled.div<{ type: "success" | "error" }>`
	width: 80px;
	height: 80px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 36px;
	margin: 0 auto 24px auto;

	${(props) => {
		if (props.type === "success") {
			return `
        background: linear-gradient(135deg, #4ade80, #22c55e);
        color: white;
      `;
		} else {
			return `
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
      `;
		}
	}}
`;

const ConfirmationTitle = styled.h3`
	color: white;
	font-size: 20px;
	font-weight: 600;
	margin: 0 0 12px 0;
`;

const ConfirmationMessage = styled.p`
	color: rgba(255, 255, 255, 0.8);
	font-size: 16px;
	margin: 0 0 24px 0;
	line-height: 1.5;
`;

const PaymentDetails = styled.div`
	background: rgba(255, 255, 255, 0.05);
	border-radius: 12px;
	padding: 20px;
	margin: 24px 0;
	text-align: left;
`;

const DetailRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 8px 0;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);

	&:last-child {
		border-bottom: none;
		font-weight: 600;
		font-size: 18px;
		color: #4ade80;
	}
`;

const DetailLabel = styled.span`
	color: rgba(255, 255, 255, 0.7);
`;

const DetailValue = styled.span`
	color: white;
`;

export const PaymentModal: React.FC<PaymentModalProps> = ({
	product,
	isOpen,
	onClose,
	onSuccess,
}) => {
	const [paymentFlow, setPaymentFlow] = useState<PaymentFlow>({
		step: "input",
	});

	const [cardData, setCardData] = useState<CreditCard>({
		number: "",
		expiryMonth: "",
		expiryYear: "",
		cvc: "",
		holderName: "",
	});

	const [cardValidation, setCardValidation] = useState<CardValidation>({
		isValid: false,
		errors: {},
	});

	const { processProductPayment } = useProductPayment();

	useEffect(() => {
		if (isOpen) {
			setPaymentFlow({ step: "input" });
			setCardData({
				number: "",
				expiryMonth: "",
				expiryYear: "",
				cvc: "",
				holderName: "",
			});
		}
	}, [isOpen]);

	const handleCardChange = (card: CreditCard, validation: CardValidation) => {
		setCardData(card);
		setCardValidation(validation);
	};

	const handleNext = () => {
		if (paymentFlow.step === "input" && cardValidation.isValid) {
			setPaymentFlow({ step: "confirm", selectedCard: cardData });
		}
	};

	const handleBack = () => {
		if (paymentFlow.step === "confirm") {
			setPaymentFlow({ step: "input" });
		}
	};

	const handlePayment = async () => {
		setPaymentFlow({ step: "processing" });

		try {
			const result = await processProductPayment({
				productId: product.id,
				productName: product.name,
				amount: product.price,
			});

			if (result.success) {
				setPaymentFlow({
					step: "success",
					successMessage: result.message,
				});
				setTimeout(() => {
					onSuccess(product.id);
					onClose();
				}, 3000);
			} else {
				setPaymentFlow({
					step: "error",
					error: result.error || "決済に失敗しました",
				});
			}
		} catch {
			setPaymentFlow({
				step: "error",
				error: "決済処理中にエラーが発生しました",
			});
		}
	};

	const getStepNumber = (step: string) => {
		switch (step) {
			case "input":
				return 1;
			case "confirm":
				return 2;
			case "processing":
				return 3;
			case "success":
			case "error":
				return 4;
			default:
				return 1;
		}
	};

	const currentStep = getStepNumber(paymentFlow.step);

	if (!isOpen) return null;

	return (
		<Overlay
			isOpen={isOpen}
			onClick={(e) => e.target === e.currentTarget && onClose()}
		>
			<ModalContainer>
				<CloseButton onClick={onClose}>×</CloseButton>

				<ModalHeader>
					{paymentFlow.step !== "success" && paymentFlow.step !== "error" && (
						<StepIndicator>
							{[1, 2, 3, 4].map((stepNum) => (
								<Step
									key={stepNum}
									$active={stepNum === currentStep}
									$completed={stepNum < currentStep}
								>
									{stepNum < currentStep ? "✓" : stepNum}
								</Step>
							))}
						</StepIndicator>
					)}

					<Title>
						{paymentFlow.step === "input" && "お支払い情報入力"}
						{paymentFlow.step === "confirm" && "お支払い内容確認"}
						{paymentFlow.step === "processing" && "決済処理中"}
						{paymentFlow.step === "success" && "購入完了"}
						{paymentFlow.step === "error" && "決済エラー"}
					</Title>

					<Subtitle>
						{paymentFlow.step === "input" &&
							"クレジットカード情報を入力してください"}
						{paymentFlow.step === "confirm" &&
							"内容をご確認の上、決済を実行してください"}
						{paymentFlow.step === "processing" && "しばらくお待ちください..."}
						{paymentFlow.step === "success" && "ありがとうございました！"}
						{paymentFlow.step === "error" && "申し訳ございません"}
					</Subtitle>
				</ModalHeader>

				<ProductSummary>
					<ProductImage>{product.name}</ProductImage>
					<ProductInfo>
						<ProductName>{product.name}</ProductName>
						<ProductDescription>{product.description}</ProductDescription>
						<ProductPrice>¥{product.price.toLocaleString()}</ProductPrice>
					</ProductInfo>
				</ProductSummary>

				<ModalContent>
					{paymentFlow.step === "input" && (
						<>
							<CardInput
								onCardChange={handleCardChange}
								initialCard={cardData}
							/>
							<ActionButtons>
								<Button $variant="secondary" onClick={onClose}>
									キャンセル
								</Button>
								<Button
									$variant="primary"
									onClick={handleNext}
									disabled={!cardValidation.isValid}
								>
									確認画面へ
								</Button>
							</ActionButtons>
						</>
					)}

					{paymentFlow.step === "confirm" && (
						<>
							<PaymentDetails>
								<DetailRow>
									<DetailLabel>商品名</DetailLabel>
									<DetailValue>{product.name}</DetailValue>
								</DetailRow>
								<DetailRow>
									<DetailLabel>カード番号</DetailLabel>
									<DetailValue>
										**** **** **** {cardData.number.slice(-4)}
									</DetailValue>
								</DetailRow>
								<DetailRow>
									<DetailLabel>名義人</DetailLabel>
									<DetailValue>{cardData.holderName}</DetailValue>
								</DetailRow>
								<DetailRow>
									<DetailLabel>有効期限</DetailLabel>
									<DetailValue>
										{cardData.expiryMonth}/{cardData.expiryYear}
									</DetailValue>
								</DetailRow>
								<DetailRow>
									<DetailLabel>合計金額</DetailLabel>
									<DetailValue>¥{product.price.toLocaleString()}</DetailValue>
								</DetailRow>
							</PaymentDetails>

							<ActionButtons>
								<Button $variant="secondary" onClick={handleBack}>
									戻る
								</Button>
								<Button $variant="primary" onClick={handlePayment}>
									¥{product.price.toLocaleString()}を支払う
								</Button>
							</ActionButtons>
						</>
					)}

					{paymentFlow.step === "processing" && (
						<ConfirmationSection>
							<LoadingSpinner />
							<ConfirmationTitle>決済処理中...</ConfirmationTitle>
							<ConfirmationMessage>
								安全な決済処理を実行しています。
								<br />
								しばらくお待ちください。
							</ConfirmationMessage>
						</ConfirmationSection>
					)}

					{paymentFlow.step === "success" && (
						<ConfirmationSection>
							<ConfirmationIcon type="success">✓</ConfirmationIcon>
							<ConfirmationTitle>購入完了！</ConfirmationTitle>
							<ConfirmationMessage>
								{paymentFlow.successMessage}
								<br />
								このウィンドウは自動的に閉じます。
							</ConfirmationMessage>
						</ConfirmationSection>
					)}

					{paymentFlow.step === "error" && (
						<ConfirmationSection>
							<ConfirmationIcon type="error">!</ConfirmationIcon>
							<ConfirmationTitle>決済エラー</ConfirmationTitle>
							<ConfirmationMessage>
								{paymentFlow.error}
								<br />
								もう一度お試しください。
							</ConfirmationMessage>
							<ActionButtons>
								<Button $variant="secondary" onClick={onClose}>
									閉じる
								</Button>
								<Button
									$variant="primary"
									onClick={() => setPaymentFlow({ step: "input" })}
								>
									もう一度試す
								</Button>
							</ActionButtons>
						</ConfirmationSection>
					)}
				</ModalContent>
			</ModalContainer>
		</Overlay>
	);
};
