import React, { useState } from "react";
import styled from "styled-components";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../hooks/useToast";
import { Toast } from "../ui/Toast";
import { useAuth } from "../../contexts/AuthProvider";
import type { ContactCategory } from "../../types/database";

const Container = styled.div`
	max-width: 600px;
	margin: 0 auto;
	padding: 32px 24px;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 12px;
	box-sizing: border-box;

	@media (max-width: 768px) {
		margin: 0 16px;
		padding: 24px 16px;
	}
`;

const Field = styled.div`
	margin-bottom: 16px;
	label {
		display: block;
		font-weight: 600;
		margin-bottom: 4px;
		color: #fff;
	}
	input,
	textarea {
		width: 100%;
		padding: 12px 16px;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.05);
		color: #fff;
		box-sizing: border-box;
	}
`;

const Button = styled.button`
	padding: 12px 24px;
	border: none;
	border-radius: 8px;
	font-weight: 600;
	cursor: pointer;
	background: linear-gradient(135deg, #3ea8ff, #0066cc);
	color: #fff;
	width: 100%;
	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
`;

const ScrollBox = styled.div`
	max-height: 300px;
	overflow-y: auto;
	margin-bottom: 24px;
	padding-right: 8px;
	padding-left: 8px;
	line-height: 1.6;
	color: rgba(255, 255, 255, 0.85);

	/* スクロールバーのスタイル */
	&::-webkit-scrollbar {
		width: 8px;
	}

	&::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 4px;
	}

	&::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.8);
		border-radius: 4px;
	}

	&::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 1);
	}

	h3 {
		color: #fff;
		margin-top: 1.6em;
	}
	ul {
		padding-left: 1.2em;
	}

	@media (max-width: 768px) {
		max-height: 250px;
		font-size: 0.9rem;
	}
`;

const CheckboxLabel = styled.label`
	display: flex;
	align-items: center;
	gap: 8px;
	margin: 16px 0;
	color: #fff;
	input {
		accent-color: #3ea8ff;
	}
`;

const PreviewContainer = styled.div`
	background: rgba(255, 255, 255, 0.08);
	border-radius: 12px;
	padding: 24px;
	margin-bottom: 24px;
	border: 1px solid rgba(255, 255, 255, 0.2);
`;

const PreviewTitle = styled.h3`
	color: #fff;
	margin: 0 0 16px 0;
	font-size: 18px;
	font-weight: 600;
`;

const PreviewField = styled.div`
	margin-bottom: 16px;

	.label {
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
		font-size: 14px;
		margin-bottom: 4px;
		display: block;
	}

	.value {
		color: #fff;
		padding: 8px 12px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		white-space: pre-wrap;
		word-break: break-word;
	}
`;

const CategoryPreview = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 8px 12px;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 6px;
	border: 1px solid rgba(255, 255, 255, 0.1);

	.icon {
		font-size: 20px;
	}

	.text {
		color: #fff;
		font-weight: 500;
	}
`;

const ButtonGroup = styled.div`
	display: flex;
	gap: 12px;
	margin-top: 24px;

	@media (max-width: 768px) {
		flex-direction: column;
	}
`;

const SecondaryButton = styled.button`
	padding: 12px 24px;
	border: 1px solid rgba(255, 255, 255, 0.3);
	border-radius: 8px;
	font-weight: 600;
	cursor: pointer;
	background: transparent;
	color: rgba(255, 255, 255, 0.9);
	flex: 1;

	&:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(255, 255, 255, 0.5);
	}
`;

const PrimaryButton = styled(Button)`
	flex: 1;
	margin: 0;
`;

const CategoryGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	gap: 16px;
	margin-bottom: 16px;

	@media (max-width: 768px) {
		grid-template-columns: 1fr;
		gap: 12px;
	}

	@media (max-width: 480px) {
		gap: 8px;
	}
`;

const CategoryCard = styled.button<{ $selected: boolean; $isUrgent?: boolean }>`
	border: 2px solid
		${({ $selected, $isUrgent }) =>
			$selected
				? $isUrgent
					? "#ef4444"
					: "#3b82f6"
				: "rgba(255, 255, 255, 0.2)"};
	border-radius: 12px;
	padding: 16px;
	cursor: pointer;
	transition: all 0.3s ease;
	background: ${({ $selected, $isUrgent }) =>
		$selected
			? $isUrgent
				? "rgba(239, 68, 68, 0.1)"
				: "rgba(59, 130, 246, 0.1)"
			: "rgba(255, 255, 255, 0.05)"};
	position: relative;
	overflow: hidden;
	width: 100%;
	text-align: left;

	&:hover {
		transform: translateY(-2px);
		border-color: ${({ $isUrgent }) => ($isUrgent ? "#ef4444" : "#3b82f6")};
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
		background: ${({ $isUrgent }) =>
			$isUrgent ? "rgba(239, 68, 68, 0.15)" : "rgba(59, 130, 246, 0.15)"};
	}

	&:focus {
		outline: none;
		border-color: ${({ $isUrgent }) => ($isUrgent ? "#ef4444" : "#3b82f6")};
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
	}

	&::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: ${({ $selected, $isUrgent }) =>
			$selected ? ($isUrgent ? "#ef4444" : "#3b82f6") : "transparent"};
		transition: all 0.3s ease;
	}

	@media (max-width: 768px) {
		padding: 14px;
		border-radius: 10px;
	}

	@media (max-width: 480px) {
		padding: 12px;
		border-radius: 8px;
	}
`;

const CategoryIcon = styled.div`
	font-size: 24px;
	margin-bottom: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 48px;
	height: 48px;
	border-radius: 12px;
	background: rgba(255, 255, 255, 0.1);

	@media (max-width: 768px) {
		font-size: 22px;
		width: 44px;
		height: 44px;
		border-radius: 10px;
	}

	@media (max-width: 480px) {
		font-size: 20px;
		width: 40px;
		height: 40px;
		border-radius: 8px;
		margin-bottom: 6px;
	}
`;

const CategoryTitle = styled.h3`
	color: white;
	font-size: 16px;
	font-weight: 600;
	margin: 0 0 4px 0;
	line-height: 1.3;

	@media (max-width: 768px) {
		font-size: 15px;
	}

	@media (max-width: 480px) {
		font-size: 14px;
		margin-bottom: 2px;
	}
`;

const CategoryDescription = styled.p`
	color: rgba(255, 255, 255, 0.7);
	font-size: 13px;
	margin: 0;
	line-height: 1.4;

	@media (max-width: 480px) {
		font-size: 12px;
		line-height: 1.3;
	}
`;

const CategoryLabel = styled.label`
	color: white;
	font-size: 16px;
	font-weight: 600;
	margin-bottom: 16px;
	display: block;

	@media (max-width: 768px) {
		font-size: 15px;
		margin-bottom: 14px;
	}

	@media (max-width: 480px) {
		font-size: 14px;
		margin-bottom: 12px;
	}
`;

// カテゴリ選択肢の詳細定義
const CATEGORY_DETAILS: Record<
	ContactCategory,
	{ icon: string; title: string; description: string; isUrgent?: boolean }
> = {
	urgent: {
		icon: "🚨",
		title: "緊急のお問い合わせ",
		description: "システム障害・緊急性の高い問題",
		isUrgent: true,
	},
	account_delete: {
		icon: "🚪",
		title: "退会申請",
		description: "アカウント削除のご依頼",
	},
	feature_request: {
		icon: "💡",
		title: "機能追加の提案",
		description: "新機能のアイデア・改善提案",
	},
	account_related: {
		icon: "👤",
		title: "アカウント関連",
		description: "ログイン・設定変更に関するお問い合わせ",
	},
	billing: {
		icon: "💳",
		title: "支払いや請求",
		description: "料金・決済・請求書に関するご質問",
	},
	support: {
		icon: "🛟",
		title: "サポート依頼",
		description: "使い方・トラブルシューティング",
	},
	other: {
		icon: "📝",
		title: "その他",
		description: "上記に当てはまらないお問い合わせ",
	},
};

export const ContactForm: React.FC = () => {
	const { user } = useAuth();
	const [name, setName] = useState("");
	const [email, setEmail] = useState(user?.email || "");
	const [title, setTitle] = useState("");
	const [message, setMessage] = useState("");
	const [category, setCategory] = useState<ContactCategory>("other");
	const [sent, setSent] = useState(false);
	const [agree, setAgree] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPreview, setShowPreview] = useState(false);
	const { toast, showError, showSuccess, hideToast } = useToast();

	// バリデーション関数
	const validateForm = () => {
		const errors: string[] = [];

		// お名前のバリデーション
		if (!name.trim()) {
			errors.push("お名前を入力してください");
		} else if (name.trim().length < 2) {
			errors.push("お名前は2文字以上で入力してください");
		}

		// メールアドレスのバリデーション
		if (!email.trim()) {
			errors.push("メールアドレスを入力してください");
		} else {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email.trim())) {
				errors.push("正しいメールアドレスの形式で入力してください");
			}
		}

		// タイトルのバリデーション（任意項目）
		if (title.trim() && title.trim().length > 100) {
			errors.push("タイトルは100文字以内で入力してください");
		}

		// メッセージのバリデーション
		if (!message.trim()) {
			errors.push("メッセージを入力してください");
		} else if (message.trim().length < 10) {
			errors.push("メッセージは10文字以上で入力してください");
		} else if (message.trim().length > 1000) {
			errors.push("メッセージは1000文字以内で入力してください");
		}

		// 利用規約同意のバリデーション
		if (!agree) {
			errors.push("利用規約とプライバシーポリシーに同意してください");
		}

		return errors;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// バリデーションチェック
		const validationErrors = validateForm();
		if (validationErrors.length > 0) {
			showError(validationErrors.join("\n"));
			return;
		}

		// プレビュー画面を表示
		setShowPreview(true);
	};

	const handleConfirmSubmit = async () => {
		setIsSubmitting(true);
		try {
			const contactData: {
				name: string;
				email: string;
				title: string;
				message: string;
				category: string;
				user_id?: string;
			} = {
				name: name.trim(),
				email: email.trim(),
				title: title.trim() || "お問い合わせ",
				message: message.trim(),
				category: category,
			};

			// ユーザーがログインしている場合はuser_idを設定
			if (user) {
				contactData.user_id = user.id;
			}

			const { error } = await supabase.from("contacts").insert(contactData);

			if (error) {
				console.error("Contact form error:", error);
				showError("送信に失敗しました...");
			} else {
				showSuccess("お問い合わせを送信しました。ありがとうございます。");
				setSent(true);
			}
		} catch (error) {
			console.error("Contact form submission error:", error);
			showError("送信に失敗しました...");
		} finally {
			setIsSubmitting(false);
			setShowPreview(false);
		}
	};

	const handleCancelPreview = () => {
		setShowPreview(false);
	};

	if (sent) {
		return (
			<Container>
				<h2>お問い合わせありがとうございます！</h2>
				<p>確認の上、折り返しご連絡いたします。</p>
			</Container>
		);
	}

	return (
		<Container>
			<h2>お問い合わせ</h2>

			{showPreview ? (
				// プレビュー画面
				<>
					<PreviewContainer>
						<PreviewTitle>
							こちらの内容で送信します。よろしいでしょうか？
						</PreviewTitle>

						<PreviewField>
							<span className="label">お問い合わせの種類</span>
							<CategoryPreview>
								<span className="icon">{CATEGORY_DETAILS[category].icon}</span>
								<span className="text">{CATEGORY_DETAILS[category].title}</span>
							</CategoryPreview>
						</PreviewField>

						<PreviewField>
							<span className="label">お名前</span>
							<div className="value">{name}</div>
						</PreviewField>

						<PreviewField>
							<span className="label">メールアドレス</span>
							<div className="value">{email}</div>
						</PreviewField>

						{title && (
							<PreviewField>
								<span className="label">タイトル</span>
								<div className="value">{title}</div>
							</PreviewField>
						)}

						<PreviewField>
							<span className="label">メッセージ</span>
							<div className="value">{message}</div>
						</PreviewField>
					</PreviewContainer>

					<ButtonGroup>
						<SecondaryButton
							type="button"
							onClick={handleCancelPreview}
							disabled={isSubmitting}
						>
							キャンセル
						</SecondaryButton>
						<PrimaryButton
							type="button"
							onClick={handleConfirmSubmit}
							disabled={isSubmitting}
						>
							{isSubmitting ? "送信中..." : "確認しました"}
						</PrimaryButton>
					</ButtonGroup>
				</>
			) : (
				// フォーム画面
				<>
					<ScrollBox>
						<h3>よくあるご質問</h3>
						<details>
							<summary>
								<strong>Q1:</strong> サービスの利用は無料ですか？
							</summary>
							<p style={{ marginTop: "8px" }}>
								<strong>A:</strong>{" "}
								はい、基本機能はすべて無料でご利用いただけます。一部のプレミアム機能や商品購入には料金が発生する場合があります。
							</p>
						</details>
						<details>
							<summary>
								<strong>Q2:</strong> アカウント登録は必要ですか？
							</summary>
							<p style={{ marginTop: "8px" }}>
								<strong>A:</strong>{" "}
								商品の閲覧やブログの閲覧は登録不要です。商品の購入、お気に入り登録、レビュー投稿にはアカウント登録が必要です。
							</p>
						</details>
						<details>
							<summary>
								<strong>Q3:</strong> 商品の購入方法を教えてください。
							</summary>
							<p style={{ marginTop: "8px" }}>
								<strong>A:</strong>{" "}
								商品詳細ページで「購入する」ボタンをクリックし、Stripe決済システムでクレジットカード情報を入力して購入できます。購入後はマイページで購入履歴を確認できます。
							</p>
						</details>
						<details>
							<summary>
								<strong>Q4:</strong> 商品の返品・交換は可能ですか？
							</summary>
							<p style={{ marginTop: "8px" }}>
								<strong>A:</strong>{" "}
								デジタル商品のため、原則として返品・交換はお受けできません。商品に不具合がある場合は、お問い合わせフォームよりご連絡ください。
							</p>
						</details>
						<details>
							<summary>
								<strong>Q5:</strong> お気に入り機能の使い方を教えてください。
							</summary>
							<p style={{ marginTop: "8px" }}>
								<strong>A:</strong>{" "}
								商品カードのハートマークをクリックするとお気に入りに追加できます。ログインが必要で、マイページでお気に入り商品を一覧表示できます。
							</p>
						</details>
						<details>
							<summary>
								<strong>Q6:</strong>{" "}
								レビューを投稿するにはどうすればいいですか？
							</summary>
							<p style={{ marginTop: "8px" }}>
								<strong>A:</strong>{" "}
								商品詳細ページのレビューセクションで、星評価（1〜5）とコメントを入力して投稿できます。ログインが必要で、購入済み商品のみレビュー可能です。
							</p>
						</details>
						<details>
							<summary>
								<strong>Q7:</strong> ブログの投稿はできますか？
							</summary>
							<p style={{ marginTop: "8px" }}>
								<strong>A:</strong>{" "}
								現在、ブログの投稿は管理者のみが可能です。一般ユーザーはブログの閲覧のみ可能です。
							</p>
						</details>
						<details>
							<summary>
								<strong>Q8:</strong>{" "}
								パスワードを忘れた場合はどうすればいいですか？
							</summary>
							<p style={{ marginTop: "8px" }}>
								<strong>A:</strong>{" "}
								ログインページで「パスワードを忘れた場合」をクリックし、登録済みのメールアドレスを入力すると、パスワードリセット用のメールが送信されます。
							</p>
						</details>
						<details>
							<summary>
								<strong>Q9:</strong>{" "}
								メールアドレスやパスワードを変更したい場合はどうすればいいですか？
							</summary>
							<p style={{ marginTop: "8px" }}>
								<strong>A:</strong>{" "}
								マイページからメールアドレスやパスワードの変更が可能です。ログイン後、マイページにアクセスして設定を変更してください。
							</p>
						</details>
						<details>
							<summary>
								<strong>Q10:</strong> 退会方法を教えてください。
							</summary>
							<p style={{ marginTop: "8px" }}>
								<strong>A:</strong>{" "}
								お問い合わせフォームより退会の旨ご連絡ください。退会後はアカウント情報とデータが削除されます。
							</p>
						</details>
						<details>
							<summary>
								<strong>Q11:</strong> 問い合わせの返答はいつもらえますか？
							</summary>
							<p style={{ marginTop: "8px" }}>
								<strong>A:</strong>{" "}
								原則として2営業日以内にメールでご連絡いたします。緊急の場合は、お問い合わせ内容に「緊急」と記載してください。
							</p>
						</details>
						<details>
							<summary>
								<strong>Q12:</strong> データのバックアップはされていますか？
							</summary>
							<p style={{ marginTop: "8px" }}>
								<strong>A:</strong> はい、Supabase
								Proプランを使用して1日1回のバックアップを取得し、過去7日間分を保持しています。システム障害時は数分〜数十分で復旧可能です。
							</p>
						</details>
						<details>
							<summary>
								<strong>Q13:</strong> 対応ブラウザを教えてください。
							</summary>
							<p style={{ marginTop: "8px" }}>
								<strong>A:</strong>{" "}
								Chrome、Firefox、Safari、Edgeの最新版に対応しています。Internet
								Explorerはサポートしていません。
							</p>
						</details>

						<h3>利用規約（詳細）</h3>
						<p>
							本サービスをご利用いただく前に、以下の利用規約をよくお読みください。ユーザーは本サービスを利用することで、本規約に同意したものとみなされます。
						</p>
						<ul>
							<li>
								<strong>第1条（適用）</strong>
								<br />
								本規約は、当社が提供するサービスの利用に関する条件を定めるものです。ユーザーは本サービスを利用することで、本規約に同意したものとみなされます。
							</li>
							<li>
								<strong>第2条（利用登録）</strong>
								<br />
								本サービスの利用を希望する者は、本規約に同意の上、当社の定める方法によって利用登録を申請するものとします。当社は、利用登録の申請者に必要事項を通知した場合には、利用登録の完了をもって、申請者をユーザーとして登録するものとします。
							</li>
							<li>
								<strong>第3条（禁止事項）</strong>
								<br />
								ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
								<ul>
									<li>法令または公序良俗に違反する行為</li>
									<li>犯罪行為に関連する行為</li>
									<li>
										当社のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為
									</li>
									<li>本サービスの運営を妨害するおそれのある行為</li>
									<li>
										他のユーザーに関する個人情報等を収集または蓄積する行為
									</li>
									<li>他のユーザーに成りすます行為</li>
									<li>
										当社のサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為
									</li>
								</ul>
							</li>
							<li>
								<strong>第4条（本サービスの提供の停止等）</strong>
								<br />
								当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
								<ul>
									<li>
										本サービスにかかるコンピュータシステムの保守点検または更新を行う場合
									</li>
									<li>
										地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合
									</li>
									<li>その他、当社が本サービスの提供が困難と判断した場合</li>
								</ul>
							</li>
							<li>
								<strong>第5条（利用制限および登録抹消）</strong>
								<br />
								当社は、ユーザーが以下のいずれかに該当する場合には、事前の通知なく、ユーザーに対して、本サービスの全部もしくは一部の利用を制限し、またはユーザーとしての登録を抹消することができるものとします。
								<ul>
									<li>本規約のいずれかの条項に違反した場合</li>
									<li>登録事項に虚偽の事実があることが判明した場合</li>
									<li>料金等の支払債務の不履行があった場合</li>
									<li>当社からの連絡に対し、一定期間返答がない場合</li>
									<li>
										その他、当社が本サービスの利用を適当でないと判断した場合
									</li>
								</ul>
							</li>
							<li>
								<strong>第6条（退会）</strong>
								<br />
								ユーザーは、当社の定める退会手続により、本サービスから退会できるものとします。退会手続は、お問い合わせフォームより退会の旨をご連絡いただくことで完了します。
							</li>
							<li>
								<strong>第7条（システム障害時のデータ保全）</strong>
								<br />
								当社は、Supabase
								Proプランの標準的なバックアップおよび復旧機能を利用し、システム障害時にデータの整合性と可用性を確保します。
								<ul>
									<li>
										1日1回の「Daily Backups」を取得 →
										過去7日間分を保持（最大24時間のデータ消失を想定）
									</li>
									<li>
										「Point‑in‑Time
										Recovery（PITR）」を設定した場合、2分ごとのトランザクションログ（WAL）が保存され、最大2分単位での復旧が可能
									</li>
									<li>
										復旧開始から通常「数分〜数十分」でフェイルオーバーまたはデータ復旧が完了します
									</li>
									<li>
										復旧はSupabaseのダッシュボードまたはManagement
										APIより開始可能で、ダウンタイム中はサービス停止状態となります
									</li>
								</ul>
							</li>
							<li>
								<strong>第8条（損害賠償責任の制限）</strong>
								<br />
								本サービスは市場平均よりも大幅に低廉な価格設定で提供しているため、当社がユーザーに対して負う損害賠償責任は、
								<u>
									当該ユーザーが本サービスの利用対価として直近に支払った金額（単発購入の場合は購入金額、サブスクリプションの場合は障害発生日を含む直前1か月分の利用料）を上限
								</u>
								とします。
								<br />
								ただし、当社に
								<span style={{ textDecoration: "underline" }}>
									故意または重大な過失
								</span>
								がある場合、または消費者契約法その他の法規で免責が認められない場合には、本条の責任制限は適用されません。
							</li>
						</ul>

						<h3>プライバシーポリシー（詳細）</h3>
						<p>
							当社は、個人情報の保護に関する法律（以下「個人情報保護法」）を遵守し、個人情報の適切な取得、利用、管理を行います。
						</p>
						<ul>
							<li>
								<strong>1. 個人情報の取得</strong>
								<br />
								当社は、以下の方法により個人情報を取得いたします。
								<ul>
									<li>
										お問い合わせフォームからの送信時（氏名、メールアドレス、お問い合わせ内容）
									</li>
									<li>
										サービス利用時のアカウント登録（氏名、メールアドレス、その他登録情報）
									</li>
									<li>決済処理時（決済情報、購入履歴）</li>
									<li>
										アクセスログ（IPアドレス、ブラウザ情報、アクセス日時）
									</li>
								</ul>
							</li>
							<li>
								<strong>2. 個人情報の利用目的</strong>
								<br />
								取得した個人情報は、以下の目的でのみ利用いたします。
								<ul>
									<li>お問い合わせへの回答・対応</li>
									<li>サービスの提供・運営</li>
									<li>決済処理・課金管理</li>
									<li>サービス改善のための分析</li>
									<li>法令に基づく対応</li>
									<li>セキュリティの確保</li>
								</ul>
							</li>
							<li>
								<strong>3. 個人情報の第三者提供</strong>
								<br />
								当社は、以下の場合を除き、個人情報を第三者に提供いたしません。
								<ul>
									<li>ご本人の同意がある場合</li>
									<li>法令に基づく場合</li>
									<li>人の生命、身体または財産の保護のために必要な場合</li>
									<li>
										公衆衛生の向上または児童の健全な育成の推進のために特に必要な場合
									</li>
									<li>
										国の機関、地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合
									</li>
								</ul>
							</li>
							<li>
								<strong>4. 個人情報の管理</strong>
								<br />
								当社は、個人情報の正確性及び安全性を確保するために、セキュリティの向上及び従業員の教育を徹底し、個人情報の漏洩、滅失またはき損の防止その他の個人情報の安全管理のために必要かつ適切な措置を講じます。
							</li>
							<li>
								<strong>5. 個人情報の開示・訂正・削除</strong>
								<br />
								当社は、ご本人からの個人情報の開示、訂正、利用停止、削除の請求に対して、法令に基づき適切に対応いたします。これらの請求は、お問い合わせフォームよりご連絡ください。
							</li>
							<li>
								<strong>6. クッキー（Cookie）の使用</strong>
								<br />
								当社のウェブサイトでは、ユーザーの利便性向上のためクッキーを使用することがあります。クッキーの使用を望まない場合は、ブラウザの設定によりクッキーを無効にすることができます。
							</li>
							<li>
								<strong>7. プライバシーポリシーの変更</strong>
								<br />
								当社は、必要に応じて本プライバシーポリシーを変更することがあります。重要な変更がある場合は、ウェブサイト上でお知らせいたします。
							</li>
						</ul>
					</ScrollBox>

					<form onSubmit={handleSubmit}>
						<Field>
							<CategoryLabel>お問い合わせの種類 *</CategoryLabel>
							<CategoryGrid>
								{Object.entries(CATEGORY_DETAILS).map(([value, details]) => (
									<CategoryCard
										key={value}
										type="button"
										$selected={category === value}
										$isUrgent={details.isUrgent}
										onClick={() => setCategory(value as ContactCategory)}
										aria-pressed={category === value}
										aria-label={`${details.title}: ${details.description}`}
									>
										<CategoryIcon>{details.icon}</CategoryIcon>
										<CategoryTitle>{details.title}</CategoryTitle>
										<CategoryDescription>
											{details.description}
										</CategoryDescription>
									</CategoryCard>
								))}
							</CategoryGrid>
						</Field>

						<Field>
							<label htmlFor="name">お名前 *</label>
							<input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</Field>
						<Field>
							<label htmlFor="email">メールアドレス *</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</Field>
						<Field>
							<label htmlFor="title">タイトル（任意）</label>
							<input
								id="title"
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
							/>
						</Field>
						<Field>
							<label htmlFor="message">メッセージ *</label>
							<textarea
								id="message"
								rows={6}
								value={message}
								onChange={(e) => setMessage(e.target.value)}
							/>
						</Field>

						<CheckboxLabel htmlFor="agree">
							<input
								id="agree"
								type="checkbox"
								checked={agree}
								onChange={(e) => setAgree(e.target.checked)}
								title="規約に同意する"
							/>
							利用規約とプライバシーポリシーに同意します
						</CheckboxLabel>

						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "送信中..." : "送信"}
						</Button>
					</form>
				</>
			)}
			<Toast
				message={toast.message}
				type={toast.type}
				isVisible={toast.isVisible}
				onClose={hideToast}
			/>
		</Container>
	);
};
