import React, { useState, useEffect, useCallback } from "react";
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
	title?: string;
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
	completed_at: string | null;
}

interface ContactReplyThread {
	id: string;
	contact_id: string;
	sender_type: string;
	sender_id: string | null;
	message: string;
	created_at: string;
}

interface AdminProfile {
	id: string;
	full_name: string;
	email: string;
}

const Container = styled.div`
	max-width: 800px;
	margin: 0 auto;
	padding: 80px 0 40px;

	@media (max-width: 768px) {
		padding: 60px 0 16px;
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
	grid-template-columns: 1fr;
	gap: 16px;
	margin-bottom: 16px;
`;

const InfoItem = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

const InfoLabel = styled.span`
	color: rgba(255, 255, 255, 0.85);
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
		word-break: break-word;
		overflow-wrap: anywhere;
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
		word-break: break-word;
		overflow-wrap: anywhere;
	}
`;

const EmptyNotes = styled.div`
	color: rgba(255, 255, 255, 0.75);
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
	color: rgba(255, 255, 255, 0.85);
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

const ElapsedTime = styled.span<{ $isOver3Days: boolean }>`
	color: ${({ $isOver3Days }) =>
		$isOver3Days ? "#ef4444" : "rgba(255, 255, 255, 0.8)"};
	font-weight: 600;
	font-size: 0.9rem;
`;

// 編集モーダル用のスタイル
const Modal = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.8);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
`;

const ModalContent = styled.div`
	background: #1e1e2f;
	border-radius: 12px;
	padding: 32px;
	width: 90%;
	max-width: 600px;
	max-height: 90vh;
	overflow-y: auto;
	position: relative;
`;

const CloseButton = styled.button`
	position: absolute;
	top: 16px;
	right: 16px;
	background: none;
	border: none;
	color: white;
	font-size: 24px;
	cursor: pointer;
	width: 40px;
	height: 40px;
	padding: 0;

	@media (max-width: 768px) {
		font-size: 32px;
		width: 56px;
		height: 56px;
		padding: 8px;
	}
`;

const ContactInfo = styled.div`
	margin-bottom: 24px;

	h3 {
		color: white;
		margin-bottom: 16px;
	}

	p {
		color: rgba(255, 255, 255, 0.9);
		margin: 8px 0;
	}
`;

const ModalMessageContent = styled.div`
	margin-bottom: 24px;

	h4 {
		color: white;
		margin-bottom: 12px;
	}

	p {
		color: rgba(255, 255, 255, 0.9);
		background: rgba(255, 255, 255, 0.05);
		padding: 16px;
		border-radius: 8px;
		white-space: pre-wrap;
		word-break: break-word;
		overflow-wrap: anywhere;
	}
`;

const Form = styled.form`
	display: flex;
	flex-direction: column;
	gap: 16px;
`;

const FormField = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;

	label {
		color: white;
		font-weight: 600;
	}

	select,
	textarea {
		padding: 12px;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.05);
		color: white;
		font-size: 14px;
	}

	textarea {
		min-height: 100px;
		resize: vertical;
		word-break: break-word;
		overflow-wrap: anywhere;
		white-space: pre-wrap;
	}
`;

const CheckboxField = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;

	input[type="checkbox"] {
		width: 18px;
		height: 18px;
	}

	label {
		color: white;
		font-weight: 600;
	}
`;

const ButtonRow = styled.div`
	display: flex;
	gap: 12px;
	margin-top: 24px;
`;

const ModalButton = styled.button<{ $variant?: "primary" | "secondary" }>`
	padding: 12px 24px;
	border: none;
	border-radius: 8px;
	font-weight: 600;
	cursor: pointer;
	flex: 1;

	${({ $variant }) => {
		switch ($variant) {
			case "secondary":
				return "background: rgba(255,255,255,0.2); color:#fff;";
			default:
				return "background: linear-gradient(135deg,#3EA8FF,#0066CC); color:#fff;";
		}
	}}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
`;

const ThreadSection = styled(Section)`
	border-left: 4px solid #3ea8ff;
`;

const ThreadAccordion = styled.div`
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 8px;
	overflow: hidden;
	margin-bottom: 16px;
`;

const ThreadAccordionHeader = styled.button<{ $isOpen: boolean }>`
	width: 100%;
	background: rgba(255, 255, 255, 0.05);
	border: none;
	padding: 16px 20px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	cursor: pointer;
	transition: all 0.2s ease;
	color: white;
	font-weight: 600;

	&:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	&:focus {
		outline: none;
		box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
	}
`;

const ThreadAccordionContent = styled.div<{ $isOpen: boolean }>`
	max-height: ${({ $isOpen }) => ($isOpen ? "1000px" : "0")};
	overflow: hidden;
	transition: max-height 0.3s ease;
	background: rgba(255, 255, 255, 0.02);
`;

const ThreadList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 20px;
`;

const ThreadItem = styled.div<{ $isAdmin: boolean }>`
	background: rgba(255, 255, 255, 0.05);
	border-radius: 8px;
	padding: 16px;
	border-left: 4px solid ${({ $isAdmin }) => ($isAdmin ? "#3EA8FF" : "#10b981")};
`;

const ThreadMeta = styled.div`
	color: rgba(255, 255, 255, 0.8);
	font-size: 0.8rem;
	margin-top: 8px;
`;

const ThreadForm = styled.form`
	display: flex;
	flex-direction: column;
	gap: 12px;
	margin-top: 24px;
`;

const AccordionIcon = styled.span<{ $isOpen: boolean }>`
	transition: transform 0.2s ease;
	transform: rotate(${({ $isOpen }) => ($isOpen ? "180deg" : "0deg")});
	font-size: 1.2rem;
`;

const ThreadTextarea = styled.textarea`
	flex: 1;
	padding: 12px;
	border-radius: 8px;
	border: 1px solid rgba(255, 255, 255, 0.2);
	background: rgba(255, 255, 255, 0.05);
	color: white;
	font-size: 14px;
	min-height: 100px;
	resize: vertical;

	&::placeholder {
		color: rgba(255, 255, 255, 0.8);
		opacity: 1;
	}

	&:focus {
		outline: none;
		border-color: rgba(255, 255, 255, 0.4);
		box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
	}
`;

const ContactDetail: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { user, isAdmin, loading } = useAuth();
	const { toast, showSuccess, showError, hideToast } = useToast();
	const [contact, setContact] = useState<Contact | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingContact, setEditingContact] = useState<Contact | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);
	const [threadMessage, setThreadMessage] = useState("");
	const [threadSending, setThreadSending] = useState(false);
	const [threads, setThreads] = useState<ContactReplyThread[]>([]);
	const [threadLoading, setThreadLoading] = useState(false);
	const [threadError, setThreadError] = useState<string | null>(null);
	const [isThreadAccordionOpen, setIsThreadAccordionOpen] = useState(false);
	const [adminProfiles, setAdminProfiles] = useState<
		Record<string, AdminProfile>
	>({});

	useEffect(() => {
		const fetchContact = async () => {
			if (!id) return;

			try {
				const { data, error } = await supabase
					.from("contacts")
					.select(
						`
						*,
						profiles!contacts_user_id_fkey (
							id,
							full_name,
							email
						)
					`
					)
					.eq("id", id)
					.single();

				if (error) throw error;

				// profilesテーブルの情報を優先して名前を取得
				const contactData = data as any;
				const displayName = contactData.profiles?.full_name || contactData.name;

				const contactWithProfile: Contact = {
					...contactData,
					name: displayName,
				};

				setContact(contactWithProfile as unknown as Contact);
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

	// 管理者プロファイル取得
	const fetchAdminProfiles = useCallback(async (adminIds: string[]) => {
		if (adminIds.length === 0) return;

		try {
			const { data, error } = await supabase
				.from("profiles")
				.select("id, full_name, email")
				.in("id", adminIds);

			if (error) throw error;

			const profilesMap: Record<string, AdminProfile> = {};
			(data || []).forEach((profile: unknown) => {
				const p = profile as AdminProfile;
				profilesMap[p.id] = p;
			});
			setAdminProfiles(profilesMap);
		} catch (error) {
			console.error("Failed to fetch admin profiles:", error);
		}
	}, []);

	// 履歴取得
	useEffect(() => {
		const fetchThreads = async () => {
			if (!contact) return;
			setThreadLoading(true);
			setThreadError(null);
			try {
				const { data, error } = await supabase
					.from("contact_reply_threads")
					.select("*")
					.eq("contact_id", contact.id)
					.order("created_at", { ascending: true });
				if (error) throw error;
				const threadsData = (data || []) as unknown as ContactReplyThread[];
				setThreads(threadsData);

				// 管理者のIDを抽出してプロファイルを取得
				const adminIds = threadsData
					.filter(
						(thread) => thread.sender_type === "admin" && thread.sender_id
					)
					.map((thread) => thread.sender_id!)
					.filter((id, index, arr) => arr.indexOf(id) === index); // 重複除去

				if (adminIds.length > 0) {
					fetchAdminProfiles(adminIds);
				}
			} catch {
				setThreadError("履歴の取得に失敗しました");
			} finally {
				setThreadLoading(false);
			}
		};
		if (contact) fetchThreads();
	}, [contact, fetchAdminProfiles]);

	// 返信送信
	const handleSendThread = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!contact || !user || !threadMessage.trim()) return;
		setThreadSending(true);
		try {
			const { error } = await supabase.from("contact_reply_threads").insert({
				contact_id: contact.id,
				sender_type: "admin",
				sender_id: user.id,
				message: threadMessage.trim(),
			});
			if (error) throw error;
			setThreadMessage("");
			// 再取得
			const { data } = await supabase
				.from("contact_reply_threads")
				.select("*")
				.eq("contact_id", contact.id)
				.order("created_at", { ascending: true });
			setThreads((data || []) as unknown as ContactReplyThread[]);
			showSuccess("返信を送信しました");
		} catch {
			showError("返信に失敗しました");
		} finally {
			setThreadSending(false);
		}
	};

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

	// 経過時間を計算する関数
	const calculateElapsedTime = (
		createdAt: string,
		completedAt?: string | null
	) => {
		const created = new Date(createdAt);
		const endTime = completedAt ? new Date(completedAt) : new Date();
		const diffMs = endTime.getTime() - created.getTime();

		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
		const diffHours = Math.floor(
			(diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
		);
		const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

		if (diffDays > 0) {
			return `${diffDays}日${diffHours}時間`;
		} else if (diffHours > 0) {
			return `${diffHours}時間${diffMinutes}分`;
		} else {
			return `${diffMinutes}分`;
		}
	};

	// 3日以上経過しているかチェック
	const isOver3Days = (createdAt: string, completedAt?: string | null) => {
		const created = new Date(createdAt);
		const endTime = completedAt ? new Date(completedAt) : new Date();
		const diffMs = endTime.getTime() - created.getTime();
		const diffDays = diffMs / (1000 * 60 * 60 * 24);
		return diffDays >= 3;
	};

	// 完了ステータスかどうかチェック
	const isCompleted = contact?.status === "completed";

	const handleEdit = () => {
		setEditingContact(contact);
		setIsModalOpen(true);
	};

	const handleUpdate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingContact) return;

		setIsUpdating(true);
		try {
			// 完了ステータスになった場合はcompleted_atを設定、それ以外の場合はnullに設定
			const completedAt =
				editingContact.status === "completed" ? new Date().toISOString() : null;

			const { error } = await supabase
				.from("contacts")
				.update({
					is_checked: editingContact.is_checked,
					is_replied: editingContact.is_replied,
					status: editingContact.status,
					admin_notes: editingContact.admin_notes,
					checked_at: editingContact.is_checked
						? new Date().toISOString()
						: null,
					replied_at: editingContact.is_replied
						? new Date().toISOString()
						: null,
					checked_by: editingContact.is_checked ? user?.id : null,
					replied_by: editingContact.is_replied ? user?.id : null,
					completed_at: completedAt,
				})
				.eq("id", editingContact.id);

			if (error) throw error;

			showSuccess("お問い合わせを更新しました");
			// 更新されたデータでcontactを更新
			if (contact) {
				const updatedContact: Contact = {
					...contact,
					is_checked: editingContact.is_checked,
					is_replied: editingContact.is_replied,
					status: editingContact.status,
					admin_notes: editingContact.admin_notes,
					checked_at: editingContact.is_checked
						? new Date().toISOString()
						: null,
					replied_at: editingContact.is_replied
						? new Date().toISOString()
						: null,
					checked_by: editingContact.is_checked ? user?.id || null : null,
					replied_by: editingContact.is_replied ? user?.id || null : null,
					completed_at: completedAt,
				};
				setContact(updatedContact);
			}
			setIsModalOpen(false);
			setEditingContact(null);
		} catch (error) {
			console.error("Failed to update contact:", error);
			showError("更新に失敗しました");
		} finally {
			setIsUpdating(false);
		}
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
						<InfoLabel>問い合わせから経過した時間（推奨：3日以内）</InfoLabel>
						<InfoValue>
							<ElapsedTime
								$isOver3Days={isOver3Days(
									contact.created_at,
									contact.completed_at
								)}
							>
								{isCompleted && contact.completed_at ? "確定：" : ""}
								{calculateElapsedTime(contact.created_at, contact.completed_at)}
							</ElapsedTime>
						</InfoValue>
					</InfoItem>
					<InfoItem>
						<InfoLabel>問い合わせ送信日時</InfoLabel>
						<InfoValue>{formatDate(contact.created_at)}</InfoValue>
					</InfoItem>
					{isCompleted && contact.completed_at && (
						<InfoItem>
							<InfoLabel>対応完了日時</InfoLabel>
							<InfoValue>{formatDate(contact.completed_at)}</InfoValue>
						</InfoItem>
					)}
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
				{contact.title && (
					<h3
						style={{
							color: "white",
							marginBottom: "12px",
							wordBreak: "break-word",
							overflowWrap: "anywhere",
						}}
					>
						{contact.title}
					</h3>
				)}
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

			<ThreadSection>
				<ThreadAccordion>
					<ThreadAccordionHeader
						$isOpen={isThreadAccordionOpen}
						onClick={() => setIsThreadAccordionOpen(!isThreadAccordionOpen)}
					>
						<span>
							{isThreadAccordionOpen
								? "やりとり履歴"
								: `お問合せNo：${contact.id}`}
						</span>
						{!isThreadAccordionOpen && (
							<span
								style={{
									marginLeft: "auto",
									marginRight: "12px",
									whiteSpace: "nowrap",
									flexShrink: 0,
								}}
							>
								全{threads.length}件
							</span>
						)}
						<AccordionIcon $isOpen={isThreadAccordionOpen}>▼</AccordionIcon>
					</ThreadAccordionHeader>
					<ThreadAccordionContent $isOpen={isThreadAccordionOpen}>
						{threadLoading ? (
							<LoadingMessage>履歴を読み込み中...</LoadingMessage>
						) : threadError ? (
							<ErrorMessage>{threadError}</ErrorMessage>
						) : (
							<ThreadList>
								{threads.length === 0 && (
									<EmptyNotes>まだやりとりはありません</EmptyNotes>
								)}
								{threads.map((t) => (
									<ThreadItem key={t.id} $isAdmin={t.sender_type === "admin"}>
										{t.message}
										<ThreadMeta>
											{t.sender_type === "admin"
												? `管理者 ${
														adminProfiles[t.sender_id!]?.full_name || ""
												  }`.trim()
												: `ユーザー ${contact?.name || ""}`}
											・{new Date(t.created_at).toLocaleString("ja-JP")}
										</ThreadMeta>
									</ThreadItem>
								))}
							</ThreadList>
						)}
						{isAdmin(user) && (
							<ThreadForm onSubmit={handleSendThread}>
								<ThreadTextarea
									value={threadMessage}
									onChange={(e) => setThreadMessage(e.target.value)}
									placeholder="返信内容を入力"
									required
									rows={2}
									disabled={threadSending}
								/>
								<ModalButton
									type="submit"
									$variant="primary"
									disabled={threadSending || !threadMessage.trim()}
								>
									{threadSending ? "送信中..." : "送信"}
								</ModalButton>
							</ThreadForm>
						)}
					</ThreadAccordionContent>
				</ThreadAccordion>
			</ThreadSection>

			<ActionButtons>
				<Button onClick={handleEdit}>編集する</Button>
				<Button $variant="secondary" onClick={() => navigate("/contact-admin")}>
					一覧に戻る
				</Button>
			</ActionButtons>

			{/* 編集モーダル */}
			{isModalOpen && editingContact && (
				<Modal onClick={() => setIsModalOpen(false)}>
					<ModalContent onClick={(e) => e.stopPropagation()}>
						<CloseButton onClick={() => setIsModalOpen(false)}>×</CloseButton>
						<h2 style={{ color: "white", marginBottom: "24px" }}>
							お問い合わせ編集
						</h2>

						<ContactInfo>
							<h3>お客様情報</h3>
							<p>
								<strong>名前:</strong> {editingContact.name}
							</p>
							<p>
								<strong>メール:</strong> {editingContact.email}
							</p>
							<p>
								<strong>送信日時:</strong>{" "}
								{new Date(editingContact.created_at).toLocaleString()}
							</p>
						</ContactInfo>

						<ModalMessageContent>
							<h4>お問い合わせ内容</h4>
							<p>{editingContact.message}</p>
						</ModalMessageContent>

						<Form onSubmit={handleUpdate}>
							<FormField>
								<label htmlFor="status">ステータス</label>
								<select
									id="status"
									value={editingContact.status}
									onChange={(e) =>
										setEditingContact((prev) =>
											prev
												? {
														...prev,
														status: e.target.value as Contact["status"],
												  }
												: null
										)
									}
								>
									<option value="pending">未対応</option>
									<option value="in_progress">対応中</option>
									<option value="completed">完了</option>
									<option value="closed">終了</option>
								</select>
							</FormField>

							<CheckboxField>
								<input
									id="is_checked"
									type="checkbox"
									checked={editingContact.is_checked}
									onChange={(e) =>
										setEditingContact((prev) =>
											prev
												? {
														...prev,
														is_checked: e.target.checked,
												  }
												: null
										)
									}
								/>
								<label htmlFor="is_checked">確認済み</label>
							</CheckboxField>

							<CheckboxField>
								<input
									id="is_replied"
									type="checkbox"
									checked={editingContact.is_replied}
									onChange={(e) =>
										setEditingContact((prev) =>
											prev
												? {
														...prev,
														is_replied: e.target.checked,
												  }
												: null
										)
									}
								/>
								<label htmlFor="is_replied">返信済み</label>
							</CheckboxField>

							<FormField>
								<label htmlFor="admin_notes">管理者メモ</label>
								<textarea
									id="admin_notes"
									value={editingContact.admin_notes || ""}
									onChange={(e) =>
										setEditingContact((prev) =>
											prev
												? {
														...prev,
														admin_notes: e.target.value,
												  }
												: null
										)
									}
									placeholder="対応状況や返信内容などのメモを入力してください"
								/>
							</FormField>

							<ButtonRow>
								<ModalButton
									type="submit"
									$variant="primary"
									disabled={isUpdating}
								>
									{isUpdating ? "更新中..." : "更新"}
								</ModalButton>
								<ModalButton
									type="button"
									$variant="secondary"
									onClick={() => setIsModalOpen(false)}
									disabled={isUpdating}
								>
									キャンセル
								</ModalButton>
							</ButtonRow>
						</Form>
					</ModalContent>
				</Modal>
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

export default ContactDetail;
