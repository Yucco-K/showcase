import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthProvider";
import { useToast } from "../hooks/useToast";
import { Toast } from "../components/ui/Toast";

interface Contact {
	id: string;
	name: string;
	email: string;
	message: string;
	created_at: string;
	is_checked: boolean;
	is_replied: boolean;
	status: "pending" | "in_progress" | "completed" | "closed";
	admin_notes: string | null;
	replied_at: string | null;
	checked_at: string | null;
	checked_by: string | null;
	replied_by: string | null;
}

const Container = styled.div`
	max-width: 800px;
	margin: 0 auto;
	padding: 24px;

	@media (max-width: 768px) {
		padding: 16px;
	}
`;

const Header = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 32px;

	@media (max-width: 768px) {
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;
	}
`;

const Title = styled.h1`
	color: white;
	margin: 0;
	font-size: 2rem;

	@media (max-width: 768px) {
		font-size: 1.5rem;
	}
`;

const BackButton = styled(Link)`
	background: rgba(255, 255, 255, 0.1);
	color: white;
	text-decoration: none;
	padding: 12px 24px;
	border-radius: 8px;
	font-weight: 600;
	transition: all 0.2s ease;
	border: 1px solid rgba(255, 255, 255, 0.2);

	&:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: translateY(-2px);
	}
`;

const Section = styled.div`
	background: rgba(255, 255, 255, 0.05);
	border-radius: 12px;
	padding: 24px;
	margin-bottom: 24px;
	border: 1px solid rgba(255, 255, 255, 0.1);

	@media (max-width: 768px) {
		padding: 16px;
	}
`;

const SectionTitle = styled.h2`
	color: white;
	margin: 0 0 16px 0;
	font-size: 1.5rem;
	border-bottom: 2px solid rgba(255, 255, 255, 0.2);
	padding-bottom: 8px;
`;

const InfoGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 16px;
	margin-bottom: 16px;
`;

const InfoItem = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

const InfoLabel = styled.span`
	color: rgba(255, 255, 255, 0.7);
	font-size: 0.9rem;
	font-weight: 500;
`;

const InfoValue = styled.span`
	color: white;
	font-size: 1rem;
	font-weight: 600;
`;

const StatusBadge = styled.span<{ $status: Contact["status"] }>`
	padding: 6px 12px;
	border-radius: 6px;
	font-size: 0.9rem;
	font-weight: 600;
	display: inline-block;
	${({ $status }) => {
		switch ($status) {
			case "pending":
				return "background: #fbbf24; color: #92400e;";
			case "in_progress":
				return "background: #3b82f6; color: white;";
			case "completed":
				return "background: #10b981; color: white;";
			case "closed":
				return "background: #6b7280; color: white;";
			default:
				return "background: #6b7280; color: white;";
		}
	}}
`;

const MessageContent = styled.div`
	background: rgba(255, 255, 255, 0.05);
	border-radius: 8px;
	padding: 20px;
	border-left: 4px solid #3b82f6;
	margin-top: 16px;

	p {
		color: rgba(255, 255, 255, 0.9);
		margin: 0;
		white-space: pre-wrap;
		line-height: 1.6;
		font-size: 1rem;
	}
`;

const AdminNotes = styled.div`
	background: rgba(255, 255, 255, 0.05);
	border-radius: 8px;
	padding: 20px;
	border-left: 4px solid #10b981;
	margin-top: 16px;

	h4 {
		color: white;
		margin: 0 0 12px 0;
		font-size: 1.1rem;
	}

	p {
		color: rgba(255, 255, 255, 0.9);
		margin: 0;
		white-space: pre-wrap;
		line-height: 1.6;
		font-size: 1rem;
	}
`;

const EmptyNotes = styled.div`
	color: rgba(255, 255, 255, 0.5);
	font-style: italic;
	text-align: center;
	padding: 20px;
`;

const ActionButtons = styled.div`
	display: flex;
	gap: 12px;
	margin-top: 24px;

	@media (max-width: 768px) {
		flex-direction: column;
	}
`;

const Button = styled.button<{ $variant?: "primary" | "secondary" | "danger" }>`
	padding: 12px 24px;
	border: none;
	border-radius: 8px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
	flex: 1;

	${({ $variant }) => {
		switch ($variant) {
			case "secondary":
				return "background: rgba(255,255,255,0.2); color:#fff;";
			case "danger":
				return "background: #dc2626; color:#fff;";
			default:
				return "background: linear-gradient(135deg,#3EA8FF,#0066CC); color:#fff;";
		}
	}}

	&:hover {
		transform: translateY(-2px);
	}
`;

const LoadingMessage = styled.div`
	text-align: center;
	padding: 60px 20px;
	color: rgba(255, 255, 255, 0.7);
	font-size: 1.1rem;
`;

const ErrorMessage = styled.div`
	text-align: center;
	padding: 60px 20px;
	color: #ef4444;
	font-size: 1.1rem;
`;

const CheckStatus = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	margin-top: 8px;
`;

const CheckIcon = styled.span<{ $checked: boolean }>`
	color: ${({ $checked }) => ($checked ? "#10b981" : "#fbbf24")};
	font-size: 1.2rem;
	font-weight: bold;
`;

const CheckText = styled.span<{ $checked: boolean }>`
	color: ${({ $checked }) => ($checked ? "#10b981" : "#fbbf24")};
	font-weight: 600;
`;

export const ContactDetail: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { user, isAdmin, loading } = useAuth();
	const { toast, hideToast } = useToast();
	const [contact, setContact] = useState<Contact | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchContact = async () => {
			if (!id) return;

			try {
				const { data, error } = await supabase
					.from("contacts")
					.select("*")
					.eq("id", id)
					.single();

				if (error) throw error;
				setContact(data);
			} catch (error) {
				console.error("Failed to fetch contact:", error);
				setError("お問い合わせの取得に失敗しました");
			} finally {
				setIsLoading(false);
			}
		};

		if (user && isAdmin(user)) {
			fetchContact();
		}
	}, [id, user, isAdmin]);

	const getStatusLabel = (status: Contact["status"]) => {
		const labels = {
			pending: "未対応",
			in_progress: "対応中",
			completed: "完了",
			closed: "終了",
		};
		return labels[status];
	};

	const formatDate = (dateString: string | null) => {
		if (!dateString) return "-";
		return new Date(dateString).toLocaleString("ja-JP");
	};

	if (loading) return <LoadingMessage>Loading...</LoadingMessage>;
	if (!user) {
		navigate("/");
		return null;
	}
	if (!isAdmin(user))
		return <ErrorMessage>管理者のみアクセスできます。</ErrorMessage>;

	if (isLoading)
		return <LoadingMessage>お問い合わせを読み込んでいます...</LoadingMessage>;
	if (error) return <ErrorMessage>{error}</ErrorMessage>;
	if (!contact)
		return <ErrorMessage>お問い合わせが見つかりません。</ErrorMessage>;

	return (
		<Container>
			<Header>
				<Title>お問い合わせ詳細</Title>
				<BackButton to="/contact-admin">← 一覧に戻る</BackButton>
			</Header>

			<Section>
				<SectionTitle>基本情報</SectionTitle>
				<InfoGrid>
					<InfoItem>
						<InfoLabel>お名前</InfoLabel>
						<InfoValue>{contact.name}</InfoValue>
					</InfoItem>
					<InfoItem>
						<InfoLabel>メールアドレス</InfoLabel>
						<InfoValue>{contact.email}</InfoValue>
					</InfoItem>
					<InfoItem>
						<InfoLabel>送信日時</InfoLabel>
						<InfoValue>{formatDate(contact.created_at)}</InfoValue>
					</InfoItem>
					<InfoItem>
						<InfoLabel>ステータス</InfoLabel>
						<StatusBadge $status={contact.status}>
							{getStatusLabel(contact.status)}
						</StatusBadge>
					</InfoItem>
				</InfoGrid>

				<CheckStatus>
					{contact.is_checked ? (
						<>
							<CheckIcon $checked={true}>✓</CheckIcon>
							<CheckText $checked={true}>確認済み</CheckText>
							{contact.checked_at && (
								<span
									style={{
										color: "rgba(255, 255, 255, 0.6)",
										marginLeft: "auto",
									}}
								>
									{formatDate(contact.checked_at)}
								</span>
							)}
						</>
					) : (
						<CheckText $checked={false}>未確認</CheckText>
					)}
				</CheckStatus>

				<CheckStatus>
					{contact.is_replied ? (
						<>
							<CheckIcon $checked={true}>✓</CheckIcon>
							<CheckText $checked={true}>返信済み</CheckText>
							{contact.replied_at && (
								<span
									style={{
										color: "rgba(255, 255, 255, 0.6)",
										marginLeft: "auto",
									}}
								>
									{formatDate(contact.replied_at)}
								</span>
							)}
						</>
					) : (
						<CheckText $checked={false}>未返信</CheckText>
					)}
				</CheckStatus>
			</Section>

			<Section>
				<SectionTitle>お問い合わせ内容</SectionTitle>
				<MessageContent>
					<p>{contact.message}</p>
				</MessageContent>
			</Section>

			<Section>
				<SectionTitle>管理者メモ</SectionTitle>
				{contact.admin_notes ? (
					<AdminNotes>
						<p>{contact.admin_notes}</p>
					</AdminNotes>
				) : (
					<EmptyNotes>管理者メモはありません</EmptyNotes>
				)}
			</Section>

			<ActionButtons>
				<Button onClick={() => navigate(`/contact-admin?edit=${contact.id}`)}>
					編集する
				</Button>
				<Button $variant="secondary" onClick={() => navigate("/contact-admin")}>
					一覧に戻る
				</Button>
			</ActionButtons>

			<Toast
				message={toast.message}
				type={toast.type}
				isVisible={toast.isVisible}
				onClose={hideToast}
			/>
		</Container>
	);
};
