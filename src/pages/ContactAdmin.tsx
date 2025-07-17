import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
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

interface ContactFormData {
	is_checked: boolean;
	is_replied: boolean;
	status: Contact["status"];
	admin_notes: string;
}

const Container = styled.div`
	max-width: 1200px;
	margin: 0 auto;
	padding: 24px;

	@media (max-width: 768px) {
		padding: 16px;
	}
`;

const Title = styled.h1`
	color: white;
	margin-bottom: 24px;
`;

const TableContainer = styled.div`
	overflow-x: auto;
	border-radius: 12px;
	margin-bottom: 24px;
	position: relative;

	@media (max-width: 768px) {
		margin: 0 -16px 24px -16px;
		padding: 0 16px;
	}
`;

const ContactTable = styled.table`
	width: 100%;
	border-collapse: collapse;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 12px;
	overflow: hidden;
	min-width: 1000px;

	@media (max-width: 768px) {
		display: none;
	}
`;

const Th = styled.th`
	background: rgba(255, 255, 255, 0.1);
	color: white;
	padding: 16px;
	text-align: left;
	font-weight: 600;
`;

const Td = styled.td`
	color: white;
	padding: 16px;
	border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

// モバイル用カードレイアウト
const MobileCardContainer = styled.div`
	display: none;
	flex-direction: column;
	gap: 16px;

	@media (max-width: 768px) {
		display: flex;
	}
`;

const ContactCard = styled.div`
	background: rgba(255, 255, 255, 0.05);
	border-radius: 12px;
	padding: 20px;
	border: 1px solid rgba(255, 255, 255, 0.1);
`;

const CardHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 16px;
`;

const CardTitle = styled.h3`
	color: white;
	margin: 0;
	font-size: 1.1rem;
	font-weight: 600;
`;

const CardStatus = styled.span<{ $status: Contact["status"] }>`
	padding: 4px 8px;
	border-radius: 4px;
	font-size: 0.8rem;
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

const CardInfo = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	margin-bottom: 16px;
`;

const CardInfoRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const CardLabel = styled.span`
	color: rgba(255, 255, 255, 0.7);
	font-size: 0.9rem;
`;

const CardValue = styled.span`
	color: white;
	font-size: 0.9rem;
	font-weight: 500;
`;

const CardActions = styled.div`
	display: flex;
	gap: 8px;
	justify-content: flex-end;
`;

const ActionButton = styled.button<{ $variant: "edit" | "delete" | "view" }>`
	background: ${({ $variant }) => {
		switch ($variant) {
			case "edit":
				return "linear-gradient(135deg, #3b82f6, #1d4ed8)";
			case "view":
				return "linear-gradient(135deg, #10b981, #059669)";
			case "delete":
				return "linear-gradient(135deg, #f97316, #ea580c)";
			default:
				return "linear-gradient(135deg, #6b7280, #4b5563)";
		}
	}};
	color: white;
	border: none;
	border-radius: 6px;
	padding: 8px 12px;
	margin-left: 8px;
	margin-bottom: ${({ $variant }) => ($variant === "edit" ? "8px" : "0")};
	cursor: pointer;
	font-size: 14px;
	transition: all 0.2s ease;

	&:hover {
		transform: scale(1.05);
	}

	@media (max-width: 768px) {
		padding: 10px 14px;
		font-size: 16px;
		margin-left: 0;
		margin-bottom: 0;
		flex: 1;
	}
`;

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
	max-width: 800px;
	max-height: 90vh;
	overflow-y: auto;
	position: relative;

	@media (max-width: 768px) {
		width: 95%;
		padding: 24px 16px;
		max-height: 95vh;
	}
`;

const CloseButton = styled.button`
	position: absolute;
	top: 16px;
	right: 16px;
	background: none;
	border: none;
	color: rgba(255, 255, 255, 0.7);
	font-size: 24px;
	cursor: pointer;
	padding: 8px;
	border-radius: 4px;
	transition: all 0.2s ease;
	z-index: 10;

	&:hover {
		color: white;
		background: rgba(255, 255, 255, 0.1);
	}

	@media (max-width: 768px) {
		top: 12px;
		right: 12px;
		font-size: 20px;
		padding: 6px;
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

	input,
	select,
	textarea {
		padding: 12px;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.15);
		color: white;
		font-size: 14px;

		&:focus {
			outline: none;
			border-color: #3b82f6;
		}
	}

	textarea {
		resize: vertical;
		min-height: 100px;
	}
`;

const CheckboxField = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;

	label {
		color: white;
		font-weight: 600;
		cursor: pointer;
	}

	input[type="checkbox"] {
		width: auto;
		margin: 0;
	}
`;

const ButtonRow = styled.div`
	display: flex;
	gap: 12px;
	margin-top: 24px;
`;

const Button = styled.button<{ $variant?: "primary" | "secondary" | "danger" }>`
	flex: 1;
	padding: 12px;
	border: none;
	border-radius: 8px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;

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

const StatusBadge = styled.span<{ $status: Contact["status"] }>`
	padding: 4px 8px;
	border-radius: 4px;
	font-size: 12px;
	font-weight: 600;
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

const ContactInfo = styled.div`
	background: rgba(255, 255, 255, 0.05);
	border-radius: 8px;
	padding: 16px;
	margin-bottom: 16px;

	h3 {
		color: white;
		margin: 0 0 12px 0;
	}

	p {
		color: rgba(255, 255, 255, 0.8);
		margin: 4px 0;
	}
`;

const MessageContent = styled.div`
	background: rgba(255, 255, 255, 0.05);
	border-radius: 8px;
	padding: 16px;
	margin-bottom: 16px;
	border-left: 4px solid #3b82f6;

	h4 {
		color: white;
		margin: 0 0 8px 0;
	}

	p {
		color: rgba(255, 255, 255, 0.8);
		margin: 0;
		white-space: pre-wrap;
		line-height: 1.5;
	}
`;

const FilterSection = styled.div`
	background: rgba(255, 255, 255, 0.1);
	border-radius: 12px;
	padding: 20px;
	margin-bottom: 24px;
	display: flex;
	gap: 16px;
	flex-wrap: wrap;
	align-items: center;

	@media (max-width: 768px) {
		padding: 16px;
		flex-direction: column;
		align-items: stretch;
	}
`;

const FilterSelect = styled.select.attrs({
	"aria-label": "フィルター選択",
	title: "フィルター選択",
})`
	padding: 8px 12px;
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 6px;
	background: rgba(255, 255, 255, 0.1);
	color: white;
	font-size: 14px;

	&:focus {
		outline: none;
		border-color: #3b82f6;
	}

	option {
		background: #1f2937;
		color: white;
	}
`;

const FilterButton = styled.button`
	padding: 8px 16px;
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: 6px;
	background: rgba(255, 255, 255, 0.1);
	color: white;
	font-size: 14px;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background: rgba(255, 255, 255, 0.2);
	}
`;

export const ContactAdmin: React.FC = () => {
	const navigate = useNavigate();
	const { user, isAdmin, loading } = useAuth();
	const { toast, showSuccess, showError, hideToast } = useToast();
	const [contacts, setContacts] = useState<Contact[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingContact, setEditingContact] = useState<Contact | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
	const [filters, setFilters] = useState({
		status: "all" as string,
		isChecked: "all" as string,
		isReplied: "all" as string,
	});
	const [searchText, setSearchText] = useState("");

	// お問い合わせ一覧を取得
	const fetchContacts = useCallback(async () => {
		try {
			const { data, error } = await supabase
				.from("contacts")
				.select("*")
				.order("created_at", { ascending: false });

			if (error) throw error;
			setContacts(data || []);
		} catch (error) {
			console.error("Failed to fetch contacts:", error);
			showError("お問い合わせ一覧の取得に失敗しました");
		}
	}, [showError]);

	useEffect(() => {
		if (user && isAdmin(user)) {
			fetchContacts();
		}
	}, [user, isAdmin, fetchContacts]);

	// フィルタリング処理
	const filteredContacts = contacts.filter((contact) => {
		const q = searchText.toLowerCase();
		return (
			contact.name.toLowerCase().includes(q) ||
			contact.email.toLowerCase().includes(q) ||
			contact.message.toLowerCase().includes(q) ||
			(contact.admin_notes?.toLowerCase().includes(q) ?? false)
		);
	});

	// 編集モーダルを開く
	const handleEdit = (contact: Contact) => {
		setEditingContact(contact);
		setIsModalOpen(true);
	};

	// 削除処理
	const handleDelete = async (contactId: string) => {
		setDeleteConfirmId(contactId);
	};

	const confirmDelete = async () => {
		if (!deleteConfirmId) return;

		try {
			const { error } = await supabase
				.from("contacts")
				.delete()
				.eq("id", deleteConfirmId);

			if (error) throw error;

			showSuccess("お問い合わせを削除しました");
			fetchContacts();
		} catch (error) {
			console.error("Failed to delete contact:", error);
			showError("削除に失敗しました");
		} finally {
			setDeleteConfirmId(null);
		}
	};

	// フォーム送信処理
	const onSubmit = async (data: ContactFormData) => {
		if (!editingContact) return;

		setIsLoading(true);
		try {
			const payload = {
				is_checked: data.is_checked,
				is_replied: data.is_replied,
				status: data.status,
				admin_notes: data.admin_notes || null,
				checked_at: data.is_checked ? new Date().toISOString() : null,
				replied_at: data.is_replied ? new Date().toISOString() : null,
				checked_by: data.is_checked ? user?.id : null,
				replied_by: data.is_replied ? user?.id : null,
			};

			const { error } = await supabase
				.from("contacts")
				.update(payload)
				.eq("id", editingContact.id);

			if (error) throw error;
			showSuccess("お問い合わせを更新しました");

			setIsModalOpen(false);
			setEditingContact(null);
			fetchContacts();
		} catch (error) {
			console.error("Failed to update contact:", error);
			showError("更新に失敗しました");
		} finally {
			setIsLoading(false);
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

	if (loading) return <p style={{ color: "white" }}>Loading...</p>;
	if (!user) {
		navigate("/");
		return null;
	}
	if (!isAdmin(user))
		return <p style={{ color: "white" }}>管理者のみアクセスできます。</p>;

	return (
		<Container>
			<Title>Contact Admin</Title>

			<div style={{ marginBottom: 24 }}>
				<input
					type="text"
					placeholder="検索"
					value={searchText}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setSearchText(e.target.value)
					}
					style={{
						padding: 8,
						borderRadius: 4,
						border: "1px solid #ccc",
						width: 240,
					}}
				/>
				<div
					style={{
						marginTop: 8,
						fontSize: "0.9rem",
						color: "rgba(255, 255, 255, 0.7)",
					}}
				>
					名前・メールアドレス・お問い合わせ内容・管理者メモで検索可能
				</div>
			</div>

			<FilterSection>
				<label htmlFor="status-filter" style={{ display: "none" }}>
					ステータス選択
				</label>
				<FilterSelect
					id="status-filter"
					aria-label="ステータス選択"
					title="ステータス選択"
					value={filters.status}
					onChange={(e) =>
						setFilters((prev) => ({ ...prev, status: e.target.value }))
					}
				>
					<option value="all">すべてのステータス</option>
					<option value="pending">未対応</option>
					<option value="in_progress">対応中</option>
					<option value="completed">完了</option>
					<option value="closed">終了</option>
				</FilterSelect>

				<label htmlFor="checked-filter" style={{ display: "none" }}>
					確認状況選択
				</label>
				<FilterSelect
					id="checked-filter"
					aria-label="確認状況選択"
					title="確認状況選択"
					value={filters.isChecked}
					onChange={(e) =>
						setFilters((prev) => ({ ...prev, isChecked: e.target.value }))
					}
				>
					<option value="all">確認状況</option>
					<option value="true">確認済み</option>
					<option value="false">未確認</option>
				</FilterSelect>

				<label htmlFor="replied-filter" style={{ display: "none" }}>
					返信状況選択
				</label>
				<FilterSelect
					id="replied-filter"
					aria-label="返信状況選択"
					title="返信状況選択"
					value={filters.isReplied}
					onChange={(e) =>
						setFilters((prev) => ({ ...prev, isReplied: e.target.value }))
					}
				>
					<option value="all">返信状況</option>
					<option value="true">返信済み</option>
					<option value="false">未返信</option>
				</FilterSelect>

				<FilterButton
					onClick={() =>
						setFilters({ status: "all", isChecked: "all", isReplied: "all" })
					}
				>
					フィルターリセット
				</FilterButton>
			</FilterSection>

			{/* テーブル表示 */}
			{filteredContacts.length > 0 ? (
				<TableContainer>
					<ContactTable>
						<thead>
							<tr>
								<Th>名前</Th>
								<Th>メール</Th>
								<Th>ステータス</Th>
								<Th>確認</Th>
								<Th>返信</Th>
								<Th>問い合わせ日時</Th>
								<Th>操作</Th>
							</tr>
						</thead>
						<tbody>
							{filteredContacts.map((contact) => (
								<tr key={contact.id}>
									<Td>{contact.name}</Td>
									<Td>{contact.email}</Td>
									<Td>
										<StatusBadge $status={contact.status}>
											{getStatusLabel(contact.status)}
										</StatusBadge>
									</Td>
									<Td>
										{contact.is_checked ? (
											<span style={{ color: "#10b981" }}>✓</span>
										) : (
											<span style={{ color: "#fbbf24" }}>未</span>
										)}
									</Td>
									<Td>
										{contact.is_replied ? (
											<span style={{ color: "#10b981" }}>✓</span>
										) : (
											<span style={{ color: "#fbbf24" }}>未</span>
										)}
									</Td>
									<Td>
										{new Date(contact.created_at).toLocaleString("ja-JP", {
											year: "numeric",
											month: "2-digit",
											day: "2-digit",
											hour: "2-digit",
											minute: "2-digit",
											second: "2-digit",
											hour12: false,
										})}
									</Td>
									<Td>
										<ActionButton
											$variant="view"
											onClick={() => navigate(`/contact-detail/${contact.id}`)}
										>
											👀
										</ActionButton>
										<ActionButton
											$variant="edit"
											onClick={() => handleEdit(contact)}
										>
											✏️
										</ActionButton>
										<ActionButton
											$variant="delete"
											onClick={() => handleDelete(contact.id)}
										>
											🗑️
										</ActionButton>
									</Td>
								</tr>
							))}
						</tbody>
					</ContactTable>
				</TableContainer>
			) : (
				<div
					style={{
						textAlign: "center",
						padding: "48px 24px",
						color: "rgba(255, 255, 255, 0.7)",
						fontSize: "1.1rem",
					}}
				>
					<div style={{ marginBottom: "16px" }}>
						お探しのお問い合わせが見つかりませんでした
					</div>
					<div style={{ fontSize: "0.9rem" }}>
						検索条件を変えて、もう一度お試しください。
					</div>
				</div>
			)}

			{/* モバイルカード表示 */}
			{filteredContacts.length > 0 && (
				<MobileCardContainer>
					{filteredContacts.map((contact) => (
						<ContactCard key={contact.id}>
							<CardHeader>
								<CardTitle>{contact.name}</CardTitle>
								<CardStatus $status={contact.status}>
									{getStatusLabel(contact.status)}
								</CardStatus>
							</CardHeader>

							<CardInfo>
								<CardInfoRow>
									<CardLabel>メール</CardLabel>
									<CardValue>{contact.email}</CardValue>
								</CardInfoRow>
								<CardInfoRow>
									<CardLabel>確認状況</CardLabel>
									<CardValue>
										{contact.is_checked ? (
											<span style={{ color: "#10b981" }}>✓ 確認済み</span>
										) : (
											<span style={{ color: "#fbbf24" }}>未確認</span>
										)}
									</CardValue>
								</CardInfoRow>
								<CardInfoRow>
									<CardLabel>返信状況</CardLabel>
									<CardValue>
										{contact.is_replied ? (
											<span style={{ color: "#10b981" }}>✓ 返信済み</span>
										) : (
											<span style={{ color: "#fbbf24" }}>未返信</span>
										)}
									</CardValue>
								</CardInfoRow>
								<CardInfoRow>
									<CardLabel>問い合わせ日時</CardLabel>
									<CardValue>
										{new Date(contact.created_at).toLocaleString("ja-JP", {
											year: "numeric",
											month: "2-digit",
											day: "2-digit",
											hour: "2-digit",
											minute: "2-digit",
											second: "2-digit",
											hour12: false,
										})}
									</CardValue>
								</CardInfoRow>
							</CardInfo>

							<CardActions>
								<ActionButton
									$variant="view"
									onClick={() => navigate(`/contact-detail/${contact.id}`)}
								>
									👀
								</ActionButton>
								<ActionButton
									$variant="edit"
									onClick={() => handleEdit(contact)}
								>
									✏️
								</ActionButton>
								<ActionButton
									$variant="delete"
									onClick={() => handleDelete(contact.id)}
								>
									🗑️
								</ActionButton>
							</CardActions>
						</ContactCard>
					))}
				</MobileCardContainer>
			)}

			{isModalOpen && editingContact && (
				<Modal onClick={() => setIsModalOpen(false)}>
					<ModalContent onClick={(e) => e.stopPropagation()}>
						<CloseButton onClick={() => setIsModalOpen(false)}>×</CloseButton>
						<h2 style={{ color: "white", marginBottom: "24px" }}>
							お問い合わせ詳細
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

						<MessageContent>
							<h4>お問い合わせ内容</h4>
							<p>{editingContact.message}</p>
						</MessageContent>

						<Form
							onSubmit={(e) => {
								e.preventDefault();
								onSubmit({
									is_checked: editingContact.is_checked,
									is_replied: editingContact.is_replied,
									status: editingContact.status,
									admin_notes: editingContact.admin_notes || "",
								});
							}}
						>
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
								<Button type="submit" $variant="primary" disabled={isLoading}>
									{isLoading ? "更新中..." : "更新"}
								</Button>
								<Button
									type="button"
									$variant="secondary"
									onClick={() => setIsModalOpen(false)}
									disabled={isLoading}
								>
									キャンセル
								</Button>
							</ButtonRow>
						</Form>
					</ModalContent>
				</Modal>
			)}

			{/* 削除確認モーダル */}
			{deleteConfirmId && (
				<button
					type="button"
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						background: "rgba(0, 0, 0, 0.7)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						zIndex: 1000,
						border: "none",
						cursor: "default",
					}}
					onClick={() => setDeleteConfirmId(null)}
					onKeyDown={(e) => {
						if (e.key === "Escape") {
							setDeleteConfirmId(null);
						}
					}}
				>
					<div
						style={{
							background: "#1f2937",
							border: "1px solid rgba(255, 255, 255, 0.2)",
							borderRadius: "12px",
							padding: "32px",
							maxWidth: "400px",
							width: "90%",
							textAlign: "center",
							color: "white",
						}}
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.stopPropagation()}
						role="dialog"
						tabIndex={-1}
					>
						<h2
							style={{
								margin: "0 0 16px 0",
								fontSize: "20px",
								fontWeight: 600,
							}}
						>
							削除確認
						</h2>
						<p
							style={{
								margin: "0 0 24px 0",
								color: "rgba(255, 255, 255, 0.8)",
								lineHeight: 1.5,
							}}
						>
							このお問い合わせを削除しますか？この操作は取り消せません。
						</p>
						<div
							style={{ display: "flex", gap: "12px", justifyContent: "center" }}
						>
							<button
								type="button"
								style={{
									padding: "12px 24px",
									borderRadius: "8px",
									fontWeight: 600,
									cursor: "pointer",
									transition: "all 0.2s ease",
									border: "1px solid rgba(255, 255, 255, 0.3)",
									fontSize: "14px",
									background: "rgba(255, 255, 255, 0.1)",
									color: "white",
								}}
								onClick={() => setDeleteConfirmId(null)}
							>
								キャンセル
							</button>
							<button
								type="button"
								style={{
									padding: "12px 24px",
									borderRadius: "8px",
									fontWeight: 600,
									cursor: "pointer",
									transition: "all 0.2s ease",
									border: "none",
									fontSize: "14px",
									background: "#ef4444",
									color: "white",
								}}
								onClick={confirmDelete}
							>
								削除
							</button>
						</div>
					</div>
				</button>
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
