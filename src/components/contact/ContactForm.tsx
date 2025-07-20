import React, { useState } from "react";
import styled from "styled-components";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../hooks/useToast";
import { Toast } from "../ui/Toast";

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

export const ContactForm: React.FC = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [sent, setSent] = useState(false);
	const [agree, setAgree] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
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
		console.log("Submitting contact form:", { name, email, message });

		// バリデーションチェック
		const validationErrors = validateForm();
		if (validationErrors.length > 0) {
			console.log("Validation errors:", validationErrors);
			showError(validationErrors.join("\n"));
			return;
		}

		setIsSubmitting(true);
		try {
			const { error } = await supabase.from("contacts").insert({
				name: name.trim(),
				email: email.trim(),
				message: message.trim(),
				status: "pending",
				is_checked: false,
				is_replied: false,
			});
			console.log("Supabase response:", { error });
			if (error) {
				console.error("Contact form error:", error);
				showError("送信に失敗しました...");
			} else {
				console.log("Contact form submitted successfully");
				showSuccess("お問い合わせを送信しました。ありがとうございます。");
				setSent(true);
			}
		} catch (error) {
			console.error("Contact form submission error:", error);
			showError("送信に失敗しました...");
		} finally {
			setIsSubmitting(false);
		}
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
			<ScrollBox>
				<h3>よくあるご質問</h3>
				<details>
					<summary>
						<strong>Q1:</strong> サービスの利用は無料ですか？
					</summary>
					<p style={{ marginTop: "8px" }}>
						<strong>A:</strong> はい、基本機能はすべて無料でご利用いただけます。
					</p>
				</details>
				<details>
					<summary>
						<strong>Q2:</strong> 退会方法を教えてください。
					</summary>
					<p style={{ marginTop: "8px" }}>
						<strong>A:</strong> お問い合わせフォームより退会の旨ご連絡ください。
					</p>
				</details>
				<details>
					<summary>
						<strong>Q3:</strong> 問い合わせの返答はいつもらえますか？
					</summary>
					<p style={{ marginTop: "8px" }}>
						<strong>A:</strong> 原則として 2
						営業日以内にメールでご連絡いたします。
					</p>
				</details>

				<h3>利用規約（詳細）</h3>
				<p>
					本サービスをご利用いただく前に、以下の利用規約をよくお読みください。ユーザーは本サービスを利用することで、本規約に同意したものとみなされます。
				</p>
				<ul>
					<li>ユーザーは法令・公序良俗に反する行為を行ってはなりません。</li>
					<li>弊社は予告なくサービス内容を変更・停止する場合があります。</li>
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

				<h3>プライバシーポリシー（抜粋）</h3>
				<p>
					当社は個人情報保護の重要性を認識し、適切に取り扱います。
					<br />
					・取得した個人情報はお問い合わせ対応の目的のみに使用します。
					<br />
					・法令に基づく場合を除き、第三者に提供することはありません。
					<br />
					・ユーザーからの請求があった場合、遅滞なく開示・訂正・削除に応じます。
				</p>
			</ScrollBox>

			<form onSubmit={handleSubmit}>
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
			<Toast
				message={toast.message}
				type={toast.type}
				isVisible={toast.isVisible}
				onClose={hideToast}
			/>
		</Container>
	);
};
