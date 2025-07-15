import React, { useState, useEffect } from "react";
import styled from "styled-components";
import type { CreditCard, CardValidation } from "../../types/card";
import { CardBrand } from "../../types/card";
import {
	validateCard,
	formatCardNumber,
	detectCardBrand,
	getMonthOptions,
	getYearOptions,
	getCardBrandName,
} from "../../utils/cardValidation";

interface CardInputProps {
	onCardChange: (card: CreditCard, validation: CardValidation) => void;
	initialCard?: Partial<CreditCard>;
	className?: string;
}

const Container = styled.div`
	width: 100%;
	max-width: 500px;
`;

const CardPreview = styled.div`
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 16px;
	padding: 24px;
	margin-bottom: 32px;
	position: relative;
	overflow: hidden;
	min-height: 200px;
	color: white;

	&::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
	}
`;

const CardContent = styled.div`
	position: relative;
	z-index: 2;
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`;

const CardBrandIcon = styled.div<{ brand: CardBrand }>`
	position: absolute;
	top: 20px;
	right: 20px;
	width: 50px;
	height: 32px;
	background: rgba(255, 255, 255, 0.9);
	border-radius: 6px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 12px;
	font-weight: bold;
	color: #333;

	${(props) => {
		switch (props.brand) {
			case CardBrand.VISA:
				return "background: linear-gradient(45deg, #1a1f71, #0f1975);";
			case CardBrand.MASTERCARD:
				return "background: linear-gradient(45deg, #eb001b, #f79e1b);";
			case CardBrand.AMEX:
				return "background: linear-gradient(45deg, #006fcf, #00b2e3);";
			case CardBrand.JCB:
				return "background: linear-gradient(45deg, #005cb9, #0066cc);";
			default:
				return "background: rgba(255, 255, 255, 0.9);";
		}
	}}
`;

const CardNumber = styled.div`
	font-size: 22px;
	font-weight: 600;
	letter-spacing: 2px;
	margin: 20px 0;
	font-family: "Courier New", monospace;
`;

const CardBottom = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
`;

const CardName = styled.div`
	font-size: 14px;
	font-weight: 500;
	text-transform: uppercase;
	max-width: 60%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

const CardExpiry = styled.div`
	font-size: 14px;
	font-weight: 500;
	font-family: "Courier New", monospace;
`;

const FormSection = styled.div`
	margin-bottom: 24px;
`;

const FormRow = styled.div`
	display: flex;
	gap: 16px;
	margin-bottom: 16px;

	@media (max-width: 480px) {
		flex-direction: column;
		gap: 12px;
	}
`;

const InputGroup = styled.div<{ flex?: number }>`
	flex: ${(props) => props.flex || 1};
	display: flex;
	flex-direction: column;
`;

const Label = styled.label`
	color: rgba(255, 255, 255, 0.9);
	font-size: 14px;
	font-weight: 600;
	margin-bottom: 8px;
	display: block;
`;

const Input = styled.input<{ hasError?: boolean }>`
	background: rgba(255, 255, 255, 0.1);
	border: 1px solid
		${(props) => (props.hasError ? "#ef4444" : "rgba(255, 255, 255, 0.3)")};
	border-radius: 8px;
	color: white;
	padding: 12px 16px;
	font-size: 16px;
	transition: all 0.2s ease;

	&::placeholder {
		color: rgba(255, 255, 255, 0.5);
	}

	&:focus {
		outline: none;
		border-color: ${(props) => (props.hasError ? "#ef4444" : "#3b82f6")};
		box-shadow: 0 0 0 2px
			${(props) =>
				props.hasError ? "rgba(239, 68, 68, 0.2)" : "rgba(59, 130, 246, 0.2)"};
	}
`;

const Select = styled.select<{ hasError?: boolean }>`
	background: rgba(255, 255, 255, 0.1);
	border: 1px solid
		${(props) => (props.hasError ? "#ef4444" : "rgba(255, 255, 255, 0.3)")};
	border-radius: 8px;
	color: white;
	padding: 12px 16px;
	font-size: 16px;
	transition: all 0.2s ease;
	cursor: pointer;

	option {
		background: #1f2937;
		color: white;
	}

	&:focus {
		outline: none;
		border-color: ${(props) => (props.hasError ? "#ef4444" : "#3b82f6")};
		box-shadow: 0 0 0 2px
			${(props) =>
				props.hasError ? "rgba(239, 68, 68, 0.2)" : "rgba(59, 130, 246, 0.2)"};
	}
`;

const ErrorMessage = styled.div`
	color: #ef4444;
	font-size: 12px;
	margin-top: 4px;
	display: flex;
	align-items: center;
	gap: 4px;

	&::before {
		content: "⚠";
		font-size: 14px;
	}
`;

const SecurityInfo = styled.div`
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 8px;
	padding: 12px;
	margin-top: 16px;

	h4 {
		margin: 0 0 8px 0;
		color: white;
		font-size: 14px;
		font-weight: 600;
	}

	p {
		margin: 0;
		color: rgba(255, 255, 255, 0.7);
		font-size: 12px;
		line-height: 1.4;
	}
`;

export const CardInput: React.FC<CardInputProps> = ({
	onCardChange,
	initialCard = {},
	className,
}) => {
	const [card, setCard] = useState<CreditCard>({
		number: "",
		expiryMonth: "",
		expiryYear: "",
		cvc: "",
		holderName: "",
		...initialCard,
	});

	const [validation, setValidation] = useState<CardValidation>({
		isValid: false,
		errors: {},
	});

	useEffect(() => {
		const newValidation = validateCard(card);
		setValidation(newValidation);
		onCardChange(card, newValidation);
	}, [card, onCardChange]);

	const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		const formattedValue = formatCardNumber(value);

		setCard((prev) => ({
			...prev,
			number: formattedValue,
			brand: detectCardBrand(formattedValue),
		}));
	};

	const handleInputChange =
		(field: keyof CreditCard) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
			setCard((prev) => ({
				...prev,
				[field]: e.target.value,
			}));
		};

	const cardBrand = detectCardBrand(card.number);
	const displayNumber = card.number || "•••• •••• •••• ••••";
	const displayName = card.holderName.toUpperCase() || "CARD HOLDER";
	const displayExpiry =
		card.expiryMonth && card.expiryYear
			? `${card.expiryMonth}/${card.expiryYear}`
			: "MM/YY";

	const monthOptions = getMonthOptions();
	const yearOptions = getYearOptions();

	return (
		<Container className={className}>
			<CardPreview>
				<CardContent>
					<CardBrandIcon brand={cardBrand}>
						{getCardBrandName(cardBrand)}
					</CardBrandIcon>

					<CardNumber>{displayNumber}</CardNumber>

					<CardBottom>
						<CardName>{displayName}</CardName>
						<CardExpiry>{displayExpiry}</CardExpiry>
					</CardBottom>
				</CardContent>
			</CardPreview>

			<FormSection>
				<InputGroup>
					<Label>カード番号</Label>
					<Input
						type="text"
						placeholder="1234 5678 9012 3456"
						value={card.number}
						onChange={handleCardNumberChange}
						hasError={!!validation.errors.number}
						maxLength={cardBrand === CardBrand.AMEX ? 17 : 19}
					/>
					{validation.errors.number && (
						<ErrorMessage>{validation.errors.number}</ErrorMessage>
					)}
				</InputGroup>
			</FormSection>

			<FormRow>
				<InputGroup flex={2}>
					<Label>カード名義人</Label>
					<Input
						type="text"
						placeholder="TARO YAMADA"
						value={card.holderName}
						onChange={handleInputChange("holderName")}
						hasError={!!validation.errors.holderName}
						style={{ textTransform: "uppercase" }}
					/>
					{validation.errors.holderName && (
						<ErrorMessage>{validation.errors.holderName}</ErrorMessage>
					)}
				</InputGroup>
			</FormRow>

			<FormRow>
				<InputGroup>
					<Label>有効期限</Label>
					<div style={{ display: "flex", gap: "8px" }}>
						<Select
							value={card.expiryMonth}
							onChange={handleInputChange("expiryMonth")}
							hasError={!!validation.errors.expiryMonth}
							style={{ flex: 1 }}
							title="有効期限(月)"
						>
							<option value="">月</option>
							{monthOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</Select>
						<Select
							value={card.expiryYear}
							onChange={handleInputChange("expiryYear")}
							hasError={!!validation.errors.expiryYear}
							style={{ flex: 1 }}
							title="有効期限(年)"
						>
							<option value="">年</option>
							{yearOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</Select>
					</div>
					{(validation.errors.expiryMonth || validation.errors.expiryYear) && (
						<ErrorMessage>
							{validation.errors.expiryMonth || validation.errors.expiryYear}
						</ErrorMessage>
					)}
				</InputGroup>

				<InputGroup>
					<Label>セキュリティコード</Label>
					<Input
						type="text"
						placeholder={cardBrand === CardBrand.AMEX ? "1234" : "123"}
						value={card.cvc}
						onChange={handleInputChange("cvc")}
						hasError={!!validation.errors.cvc}
						maxLength={cardBrand === CardBrand.AMEX ? 4 : 3}
					/>
					{validation.errors.cvc && (
						<ErrorMessage>{validation.errors.cvc}</ErrorMessage>
					)}
				</InputGroup>
			</FormRow>

			<SecurityInfo>
				<h4>🔒 セキュリティについて</h4>
				<p>
					お客様のカード情報は最高レベルの暗号化技術で保護されており、 PCI
					DSS準拠の安全なサーバーで処理されます。
					カード情報を保存することはありません。
				</p>
			</SecurityInfo>
		</Container>
	);
};
