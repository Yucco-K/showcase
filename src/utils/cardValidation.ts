import type { CreditCard, CardValidation } from "../types/card";
import { CardBrand } from "../types/card";

// Luhnアルゴリズムによるカード番号の検証
export const validateCardNumber = (number: string): boolean => {
	const cleanNumber = number.replace(/\s+/g, "");

	if (!/^\d+$/.test(cleanNumber)) {
		return false;
	}

	let sum = 0;
	let isEven = false;

	for (let i = cleanNumber.length - 1; i >= 0; i--) {
		let digit = parseInt(cleanNumber.charAt(i), 10);

		if (isEven) {
			digit *= 2;
			if (digit > 9) {
				digit -= 9;
			}
		}

		sum += digit;
		isEven = !isEven;
	}

	return sum % 10 === 0;
};

// カードブランドの判定
export const detectCardBrand = (number: string): CardBrand => {
	const cleanNumber = number.replace(/\s+/g, "");

	if (/^4/.test(cleanNumber)) {
		return CardBrand.VISA;
	} else if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) {
		return CardBrand.MASTERCARD;
	} else if (/^3[47]/.test(cleanNumber)) {
		return CardBrand.AMEX;
	} else if (/^35/.test(cleanNumber)) {
		return CardBrand.JCB;
	} else if (/^6011|^644|^65/.test(cleanNumber)) {
		return CardBrand.DISCOVER;
	} else if (/^30[0-5]|^36|^38/.test(cleanNumber)) {
		return CardBrand.DINERS;
	}

	return CardBrand.UNKNOWN;
};

// カード番号のフォーマット（スペース区切り）
export const formatCardNumber = (number: string): string => {
	const cleanNumber = number.replace(/\s+/g, "");
	const brand = detectCardBrand(cleanNumber);

	if (brand === CardBrand.AMEX) {
		// American Express: 4-6-5 format
		return cleanNumber
			.slice(0, 15)
			.replace(/(\d{4})(\d{6})(\d{5})/, "$1 $2 $3")
			.trim();
	} else {
		// Other cards: 4-4-4-4 format
		return cleanNumber
			.slice(0, 16)
			.replace(/(\d{4})(?=\d)/g, "$1 ")
			.trim();
	}
};

// 有効期限の検証
export const validateExpiry = (month: string, year: string): boolean => {
	const currentDate = new Date();
	const currentYear = currentDate.getFullYear();
	const currentMonth = currentDate.getMonth() + 1;

	const expMonth = parseInt(month, 10);
	const expYear = parseInt(year, 10);

	if (isNaN(expMonth) || isNaN(expYear)) {
		return false;
	}

	if (expMonth < 1 || expMonth > 12) {
		return false;
	}

	const fullYear = expYear < 100 ? 2000 + expYear : expYear;

	if (fullYear < currentYear) {
		return false;
	}

	if (fullYear === currentYear && expMonth < currentMonth) {
		return false;
	}

	return true;
};

// CVCの検証
export const validateCVC = (cvc: string, brand: CardBrand): boolean => {
	if (!/^\d+$/.test(cvc)) {
		return false;
	}

	if (brand === CardBrand.AMEX) {
		return cvc.length === 4;
	} else {
		return cvc.length === 3;
	}
};

// 名前の検証
export const validateHolderName = (name: string): boolean => {
	return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name.trim());
};

// 包括的なカード検証
export const validateCard = (card: CreditCard): CardValidation => {
	const errors: CardValidation["errors"] = {};

	// カード番号の検証
	if (!card.number || card.number.replace(/\s+/g, "").length === 0) {
		errors.number = "カード番号を入力してください";
	} else if (!validateCardNumber(card.number)) {
		errors.number = "有効なカード番号を入力してください";
	}

	// 有効期限の検証
	if (!card.expiryMonth || !card.expiryYear) {
		if (!card.expiryMonth) errors.expiryMonth = "月を選択してください";
		if (!card.expiryYear) errors.expiryYear = "年を選択してください";
	} else if (!validateExpiry(card.expiryMonth, card.expiryYear)) {
		errors.expiryMonth = "有効な有効期限を入力してください";
		errors.expiryYear = "有効な有効期限を入力してください";
	}

	// CVCの検証
	const brand = detectCardBrand(card.number);
	if (!card.cvc) {
		errors.cvc = "セキュリティコードを入力してください";
	} else if (!validateCVC(card.cvc, brand)) {
		if (brand === CardBrand.AMEX) {
			errors.cvc = "4桁のセキュリティコードを入力してください";
		} else {
			errors.cvc = "3桁のセキュリティコードを入力してください";
		}
	}

	// 名前の検証
	if (!card.holderName || card.holderName.trim().length === 0) {
		errors.holderName = "カード名義人を入力してください";
	} else if (!validateHolderName(card.holderName)) {
		errors.holderName = "有効な名前を入力してください（英字のみ）";
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors,
	};
};

// カード番号をマスクする
export const maskCardNumber = (number: string): string => {
	const cleanNumber = number.replace(/\s+/g, "");
	if (cleanNumber.length < 4) return cleanNumber;

	const last4 = cleanNumber.slice(-4);
	const masked = "*".repeat(cleanNumber.length - 4);

	return formatCardNumber(masked + last4);
};

// 月の選択肢を生成
export const getMonthOptions = (): Array<{ value: string; label: string }> => {
	return Array.from({ length: 12 }, (_, i) => {
		const month = i + 1;
		return {
			value: month.toString().padStart(2, "0"),
			label: month.toString().padStart(2, "0"),
		};
	});
};

// 年の選択肢を生成（現在年から10年後まで）
export const getYearOptions = (): Array<{ value: string; label: string }> => {
	const currentYear = new Date().getFullYear();
	const years = [];

	for (let i = 0; i < 10; i++) {
		const year = currentYear + i;
		years.push({
			value: year.toString().slice(-2),
			label: year.toString(),
		});
	}

	return years;
};

// カードブランドのアイコン/画像パスを取得
export const getCardBrandIcon = (brand: CardBrand): string => {
	switch (brand) {
		case CardBrand.VISA:
			return "/icons/visa.svg";
		case CardBrand.MASTERCARD:
			return "/icons/mastercard.svg";
		case CardBrand.AMEX:
			return "/icons/amex.svg";
		case CardBrand.JCB:
			return "/icons/jcb.svg";
		case CardBrand.DISCOVER:
			return "/icons/discover.svg";
		case CardBrand.DINERS:
			return "/icons/diners.svg";
		default:
			return "/icons/card-default.svg";
	}
};

// カードブランドの表示名を取得
export const getCardBrandName = (brand: CardBrand): string => {
	switch (brand) {
		case CardBrand.VISA:
			return "Visa";
		case CardBrand.MASTERCARD:
			return "Mastercard";
		case CardBrand.AMEX:
			return "American Express";
		case CardBrand.JCB:
			return "JCB";
		case CardBrand.DISCOVER:
			return "Discover";
		case CardBrand.DINERS:
			return "Diners Club";
		default:
			return "Unknown";
	}
};
