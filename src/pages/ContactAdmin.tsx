import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthProvider";
import { useToast } from "../hooks/useToast";
import { Toast } from "../components/ui/Toast";
import type { Contact, ContactCategory } from "../types/database";
import { Menu, rem } from "@mantine/core";
import {
	IconDotsVertical,
	IconEye,
	IconPencil,
	IconTrash,
} from "@tabler/icons-react";

// カテゴリラベルの定義
const CATEGORY_LABELS: Record<ContactCategory, string> = {
	urgent: "🚨 緊急",
	account_delete: "🚪 退会申請",
	feature_request: "💡 機能追加の提案",
	account_related: "👤 アカウント関連",
	billing: "💳 支払いや請求",
	support: "🛟 サポート依頼",
	other: "📝 その他",
};

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
	font-size: 1.5rem;
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
	min-width: 800px;

	@media (max-width: 768px) {
		display: none;
	}

	/* 緊急カテゴリの行スタイル */
	tr.urgent-row {
		background: rgba(239, 68, 68, 0.05);
		border-left: 4px solid #ef4444;

		td:first-child {
			position: relative;

			&::before {
				content: "📌";
				position: absolute;
				left: -2px;
				top: 50%;
				transform: translateY(-50%);
				font-size: 10px;
			}
		}
	}
`;

const Th = styled.th`
	background: rgba(255, 255, 255, 0.1);
	color: white;
	padding: 12px;
	text-align: left;
	font-weight: 600;
	font-size: 0.9rem;

	/* カテゴリカラムを狭めに */
	&:first-child {
		width: 140px;

		@media (max-width: 1024px) {
			width: 120px;
		}
	}

	/* 名前カラムをPCで広く固定幅に */
	&:nth-child(2) {
		width: 160px;
		min-width: 160px;
		max-width: 180px;
		@media (max-width: 768px) {
			width: auto;
			min-width: unset;
			max-width: unset;
		}
	}

	/* タイトルカラムをPCで広く固定幅に */
	&:nth-child(3) {
		width: 180px;
		min-width: 160px;
		max-width: 200px;
		@media (max-width: 768px) {
			width: auto;
			min-width: unset;
			max-width: unset;
		}
	}

	/* ステータスカラムを固定幅で広めに */
	&:nth-child(5) {
		width: 86px;
		min-width: 86px;

		@media (max-width: 1024px) {
			width: 66px;
			min-width: 66px;
		}
	}
`;

const Td = styled.td`
	color: white;
	padding: 12px;
	border-top: 1px solid rgba(255, 255, 255, 0.1);
	font-size: 0.9rem;

	/* カテゴリカラムの調整 */
	&:first-child {
		padding: 12px 8px;

		@media (max-width: 1024px) {
			padding: 8px 6px;
		}
	}

	/* ステータスカラムを固定幅で広めに */
	&:nth-child(5) {
		width: 102px;
		min-width: 102px;

		@media (max-width: 1024px) {
			width: 82px;
			min-width: 82px;
		}
	}
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

const PinButton = styled.button<{ $isPinned: boolean }>`
	position: absolute;
	top: 12px;
	right: 52px; /* 3点Menu分の余白を確保 */
	@media (min-width: 481px) {
		margin-right: 8px;
	}
	background: ${({ $isPinned }) =>
		$isPinned ? "#dc7633" : "rgba(255, 255, 255, 0.1)"};
	border: 2px solid
		${({ $isPinned }) => ($isPinned ? "#dc7633" : "rgba(255, 255, 255, 0.2)")};
	color: ${({ $isPinned }) =>
		$isPinned ? "white" : "rgba(255, 255, 255, 0.7)"};
	border-radius: 50%;
	width: 32px;
	height: 32px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 14px;
	transition: all 0.3s ease;
	z-index: 9;
	box-shadow: ${({ $isPinned }) =>
		$isPinned ? "0 2px 8px rgba(220, 118, 51, 0.3)" : "none"};
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;

	&:hover {
		background: ${({ $isPinned }) =>
			$isPinned ? "#b8621f" : "rgba(255, 255, 255, 0.2)"};
		transform: scale(1.1);
		box-shadow: ${({ $isPinned }) =>
			$isPinned
				? "0 4px 12px rgba(220, 118, 51, 0.4)"
				: "0 4px 12px rgba(0, 0, 0, 0.3)"};
	}

	&:active {
		transform: scale(0.95);
	}

	/* ピン留め済みの場合、アイコンを少し傾ける */
	${({ $isPinned }) =>
		$isPinned &&
		`
		transform: rotate(-15deg);
		&:hover {
			transform: rotate(-15deg) scale(1.1);
		}
		&:active {
			transform: rotate(-15deg) scale(0.95);
		}
	`}

	@media (max-width: 480px) {
		top: 8px;
		right: 44px;
		margin-right: 0;
	}
`;

const ContactCard = styled.div`
	background: rgba(255, 255, 255, 0.05);
	border-radius: 12px;
	padding: 16px;
	padding-top: 46px; /* ピン留めボタンのためのマージン */
	border: 1px solid rgba(255, 255, 255, 0.1);
	position: relative;
	font-size: 0.9rem;

	/* 緊急カテゴリの特別スタイル */
	&.urgent-contact {
		border: 2px solid #ef4444;
		background: rgba(239, 68, 68, 0.05);
		position: relative;

		&::before {
			content: "📌";
			position: absolute;
			top: -8px;
			right: 16px;
			background: #dc7633;
			color: white;
			padding: 4px 8px;
			border-radius: 0 0 8px 8px;
			font-size: 10px;
			font-weight: 600;
		}

		@media (max-width: 480px) {
			&::before {
				font-size: 9px;
				padding: 2px 6px;
				top: -6px;
				right: 12px;
			}
		}

		/* 緊急カテゴリではピン留めボタンを非表示（既に最優先表示のため不要） */
		${PinButton} {
			display: none;
		}
	}

	/* ピン留めされたカードの特別スタイル */
	&.pinned-contact {
		border: 2px solid #dc7633;
		background: rgba(220, 118, 51, 0.05);

		&::after {
			content: "📌";
			position: absolute;
			top: -8px;
			right: 16px;
			background: #dc7633;
			color: white;
			padding: 4px 8px;
			border-radius: 0 0 8px 8px;
			font-size: 10px;
			font-weight: 600;
		}

		@media (max-width: 480px) {
			&::after {
				font-size: 9px;
				padding: 2px 6px;
				top: -6px;
				right: 12px;
				display: none;
			}
		}
	}

	@media (max-width: 480px) {
		padding: 16px;
		padding-top: 44px; /* モバイルでのピン留めボタンマージン */
	}
`;

const CardHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 16px;
	flex-wrap: wrap;
	gap: 8px;
`;

const CardTitle = styled.h3`
	color: white;
	margin: 0;
	font-size: 1rem;
	font-weight: 600;
	flex: 1;
	min-width: 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;

	@media (max-width: 768px) {
		font-size: 0.95rem;
	}

	@media (max-width: 480px) {
		font-size: 0.9rem;
	}
`;

const CardStatus = styled.span<{ $status: Contact["status"] }>`
	padding: 4px 8px;
	border-radius: 4px;
	font-size: 0.75rem;
	font-weight: 600;
	display: inline-block;
	white-space: nowrap;
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

// モバイルカード内の情報行をより柔軟に
const CardInfoRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const CardLabel = styled.span`
	color: rgba(255, 255, 255, 0.7);
	font-size: 0.85rem;
`;

const CardValue = styled.span`
	color: white;
	font-size: 0.85rem;
	font-weight: 500;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 200px;
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
		word-break: break-word;
		overflow-wrap: anywhere;
	}

	p {
		color: rgba(255, 255, 255, 0.8);
		margin: 0;
		white-space: pre-wrap;
		line-height: 1.5;
		word-break: break-word;
		overflow-wrap: anywhere;
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

	@media (max-width: 1024px) {
		padding: 16px;
		gap: 12px;
	}

	@media (max-width: 768px) {
		padding: 16px;
		flex-direction: column;
		align-items: stretch;
		gap: 12px;
	}

	@media (max-width: 480px) {
		padding: 12px;
		gap: 8px;
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
	min-width: 150px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;

	&:focus {
		outline: none;
		border-color: #3b82f6;
	}

	option {
		background: #1f2937;
		color: white;
		white-space: nowrap;
	}

	@media (max-width: 768px) {
		width: 100%;
		min-width: unset;
		padding: 12px 16px;
		font-size: 16px; /* iOS でのズーム防止 */
	}

	@media (max-width: 480px) {
		font-size: 14px;
		padding: 10px 12px;
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
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;

	&:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	@media (max-width: 768px) {
		width: 100%;
		padding: 12px 16px;
		font-size: 16px;
	}

	@media (max-width: 480px) {
		padding: 10px 12px;
		font-size: 14px;
	}
`;

const CategoryBadge = styled.span<{ $isUrgent: boolean }>`
	font-size: 14px;
	padding: 6px 12px;
	border-radius: 16px;
	background: ${({ $isUrgent }) =>
		$isUrgent ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.1)"};
	color: ${({ $isUrgent }) =>
		$isUrgent ? "#ef4444" : "rgba(255, 255, 255, 0.8)"};
	font-weight: 600;
	white-space: nowrap;
	display: inline-block;

	@media (max-width: 768px) {
		font-size: 13px;
		padding: 5px 10px;
		border-radius: 12px;
	}

	@media (max-width: 480px) {
		font-size: 12px;
		padding: 4px 8px;
		border-radius: 10px;

		/* 緊急カテゴリの場合はより目立つように */
		${({ $isUrgent }) =>
			$isUrgent &&
			`
			background: rgba(239, 68, 68, 0.3);
			border: 1px solid #ef4444;
			box-shadow: 0 0 8px rgba(239, 68, 68, 0.3);
		`}
	}
`;

const CategoryRow = styled.div`
	display: flex;
	justify-content: flex-start;
	align-items: center;
	gap: 12px;
	margin-bottom: 12px;
	width: 100%;
	flex-wrap: wrap;

	@media (max-width: 480px) {
		gap: 8px;
	}
`;

interface ContactFormData {
	is_checked: boolean;
	is_replied: boolean;
	status: "pending" | "in_progress" | "completed" | "closed";
	admin_notes: string;
}

const SearchInput = styled.input`
	padding: 8px;
	border-radius: 4px;
	border: 1px solid #ccc;
	width: 240px;
	font-size: 14px;

	@media (max-width: 768px) {
		width: 100%;
		padding: 12px;
		font-size: 16px; /* iOS でのズーム防止 */
		box-sizing: border-box;
	}

	@media (max-width: 480px) {
		padding: 10px;
		font-size: 14px;
	}
`;

const SearchContainer = styled.div`
	margin-bottom: 24px;

	@media (max-width: 768px) {
		margin-bottom: 20px;
	}
`;

const SearchHint = styled.div`
	margin-top: 8px;
	font-size: 0.9rem;
	color: rgba(255, 255, 255, 0.7);

	@media (max-width: 480px) {
		font-size: 0.8rem;
		margin-top: 6px;
	}
`;

const MenuButtonWrapper = styled.div`
	position: absolute;
	top: 12px;
	right: 12px;
	z-index: 9;
	/* ピン留めボタンと重ならないよう余白を確保 */
	@media (max-width: 480px) {
		top: 8px;
		right: 8px;
		margin-top: 8px;
		margin-left: 0;
	}
	@media (min-width: 481px) {
		margin-left: 16px;
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
		category: "all" as string,
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

			if (error) {
				console.error("Error fetching contacts:", error);
				showError("お問い合わせ一覧の取得に失敗しました");
				return;
			}

			const contactsData: Contact[] = (data as any[]).map((item) => ({
				id: String(item.id),
				name: String(item.name),
				email: String(item.email),
				title: item.title ? String(item.title) : "お問い合わせ",
				message: String(item.message),
				category: item.category || "other",
				created_at: String(item.created_at),
				is_checked: Boolean(item.is_checked),
				is_replied: Boolean(item.is_replied),
				status: item.status || "pending",
				admin_notes: item.admin_notes ? String(item.admin_notes) : null,
				replied_at: item.replied_at ? String(item.replied_at) : null,
				checked_at: item.checked_at ? String(item.checked_at) : null,
				checked_by: item.checked_by ? String(item.checked_by) : null,
				replied_by: item.replied_by ? String(item.replied_by) : null,
				is_pinned: Boolean(item.is_pinned),
				pinned_at: item.pinned_at ? String(item.pinned_at) : null,
				pinned_by: item.pinned_by ? String(item.pinned_by) : null,
			}));
			setContacts(contactsData);
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
		// 検索テキストフィルター
		const q = searchText.toLowerCase();
		const matchesSearch =
			contact.name.toLowerCase().includes(q) ||
			contact.email.toLowerCase().includes(q) ||
			contact.message.toLowerCase().includes(q);

		// ステータスフィルター
		const matchesStatus =
			filters.status === "all" || contact.status === filters.status;

		// カテゴリフィルター
		const matchesCategory =
			filters.category === "all" || contact.category === filters.category;

		// 確認状況フィルター
		const matchesChecked =
			filters.isChecked === "all" ||
			(filters.isChecked === "true" && contact.is_checked) ||
			(filters.isChecked === "false" && !contact.is_checked);

		// 返信状況フィルター
		const matchesReplied =
			filters.isReplied === "all" ||
			(filters.isReplied === "true" && contact.is_replied) ||
			(filters.isReplied === "false" && !contact.is_replied);

		return (
			matchesSearch &&
			matchesStatus &&
			matchesCategory &&
			matchesChecked &&
			matchesReplied
		);
	});

	// ソート処理：緊急カテゴリを最上位にピン留め
	const sortedContacts = [...filteredContacts].sort((a, b) => {
		// 緊急カテゴリの判定
		const aIsUrgent = a.category === "urgent";
		const bIsUrgent = b.category === "urgent";

		// 緊急カテゴリを最上位に配置
		if (aIsUrgent && !bIsUrgent) return -1;
		if (!aIsUrgent && bIsUrgent) return 1;

		// 両方とも緊急または両方とも非緊急の場合
		if (aIsUrgent && bIsUrgent) {
			// 緊急カテゴリ内では作成日時の降順（新しい順）
			const dateA = new Date(a.created_at).getTime();
			const dateB = new Date(b.created_at).getTime();
			return dateB - dateA;
		}

		// 非緊急カテゴリの場合：ピン留めを次に優先
		const aPinned = a.is_pinned || false;
		const bPinned = b.is_pinned || false;

		if (aPinned && !bPinned) return -1;
		if (!aPinned && bPinned) return 1;

		// 両方ともピン留めまたは両方とも非ピン留めの場合は作成日時の降順（新しい順）
		const dateA = new Date(a.created_at).getTime();
		const dateB = new Date(b.created_at).getTime();
		return dateB - dateA;
	});

	// ピン留めトグル処理
	const handleTogglePin = async (contactId: string, currentPinned: boolean) => {
		try {
			const { error } = await supabase
				.from("contacts")
				.update({
					is_pinned: !currentPinned,
					pinned_at: !currentPinned ? new Date().toISOString() : null,
					pinned_by: !currentPinned ? user?.id : null,
				})
				.eq("id", contactId);

			if (error) {
				console.error("Failed to toggle pin:", error);
				showError("ピン留めの更新に失敗しました");
				return;
			}

			// 成功時にローカル状態を更新
			setContacts((prevContacts) =>
				prevContacts.map((contact) =>
					contact.id === contactId
						? {
								...contact,
								is_pinned: !currentPinned,
								pinned_at: !currentPinned ? new Date().toISOString() : null,
								pinned_by: !currentPinned ? user?.id : null,
						  }
						: contact
				)
			);

			showSuccess(
				!currentPinned ? "ピン留めしました" : "ピン留めを解除しました"
			);
		} catch (error) {
			console.error("Failed to toggle pin:", error);
			showError("ピン留めの更新に失敗しました");
		}
	};

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
		return labels[status || "pending"];
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

			<SearchContainer>
				<SearchInput
					type="text"
					placeholder="検索"
					value={searchText}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setSearchText(e.target.value)
					}
				/>
				<SearchHint>
					名前・メールアドレス・お問い合わせ内容・管理者メモで検索可能
				</SearchHint>
			</SearchContainer>

			<FilterSection>
				<label htmlFor="category-filter" style={{ display: "none" }}>
					カテゴリ選択
				</label>
				<FilterSelect
					id="category-filter"
					aria-label="カテゴリ選択"
					title="カテゴリ選択"
					value={filters.category}
					onChange={(e) =>
						setFilters((prev) => ({ ...prev, category: e.target.value }))
					}
				>
					<option value="all">すべてのカテゴリ</option>
					{Object.entries(CATEGORY_LABELS).map(([value, label]) => (
						<option key={value} value={value}>
							{label}
						</option>
					))}
				</FilterSelect>

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
						setFilters({
							status: "all",
							category: "all",
							isChecked: "all",
							isReplied: "all",
						})
					}
				>
					フィルターリセット
				</FilterButton>
			</FilterSection>

			{/* テーブル表示 */}
			{sortedContacts.length > 0 ? (
				<TableContainer>
					<ContactTable>
						<thead>
							<tr>
								<Th>カテゴリ</Th>
								<Th>名前</Th>
								<Th>タイトル</Th>
								<Th>メール</Th>
								<Th>ステータス</Th>
								<Th>確認</Th>
								<Th>返信</Th>
								<Th>問い合わせ日時</Th>
								<Th>操作</Th>
							</tr>
						</thead>
						<tbody>
							{sortedContacts.map((contact) => (
								<tr
									key={contact.id}
									className={contact.category === "urgent" ? "urgent-row" : ""}
								>
									<Td>
										<CategoryBadge $isUrgent={contact.category === "urgent"}>
											{CATEGORY_LABELS[contact.category]}
										</CategoryBadge>
									</Td>
									<Td>{contact.name}</Td>
									<Td>
										{contact.title && contact.title.length > 30
											? `${contact.title.slice(0, 30)}...`
											: contact.title || "お問い合わせ"}
									</Td>
									<Td>{contact.email}</Td>
									<Td>
										<StatusBadge $status={contact.status}>
											{getStatusLabel(contact.status)}
										</StatusBadge>
									</Td>
									<Td>
										{contact.is_checked ? (
											<span
												style={{
													color: "#ffffff",
													backgroundColor: "#10b981",
													borderRadius: "50%",
													padding: "4px 8px",
													fontSize: "14px",
													fontWeight: "bold",
													display: "inline-block",
													minWidth: "20px",
													textAlign: "center",
												}}
											>
												✓
											</span>
										) : (
											<span
												style={{
													color: "#ffffff",
													backgroundColor: "#fbbf24",
													borderRadius: "4px",
													padding: "4px 8px",
													fontSize: "12px",
													fontWeight: "bold",
													display: "inline-block",
													minWidth: "20px",
													textAlign: "center",
												}}
											>
												未
											</span>
										)}
									</Td>
									<Td>
										{contact.is_replied ? (
											<span
												style={{
													color: "#ffffff",
													backgroundColor: "#10b981",
													borderRadius: "50%",
													padding: "4px 8px",
													fontSize: "14px",
													fontWeight: "bold",
													display: "inline-block",
													minWidth: "20px",
													textAlign: "center",
												}}
											>
												✓
											</span>
										) : (
											<span
												style={{
													color: "#ffffff",
													backgroundColor: "#fbbf24",
													borderRadius: "4px",
													padding: "4px 8px",
													fontSize: "12px",
													fontWeight: "bold",
													display: "inline-block",
													minWidth: "20px",
													textAlign: "center",
												}}
											>
												未
											</span>
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
										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: "0",
												position: "relative",
												minWidth: 80,
											}}
										>
											{contact.category !== "urgent" && (
												<PinButton
													$isPinned={contact.is_pinned || false}
													onClick={() =>
														handleTogglePin(
															contact.id,
															contact.is_pinned || false
														)
													}
													aria-label={
														contact.is_pinned
															? "ピン留めを解除"
															: "ピン留めする"
													}
													title={
														contact.is_pinned
															? "ピン留めを解除"
															: "ピン留めする"
													}
													style={{
														position: "absolute",
														right: 40,
														top: 4,
														zIndex: 2,
													}}
												>
													📌
												</PinButton>
											)}
											<MenuButtonWrapper>
												<Menu
													shadow="md"
													width={160}
													withinPortal
													position="bottom-end"
													offset={4}
												>
													<Menu.Target>
														<button
															type="button"
															style={{
																background: "none",
																border: "none",
																padding: 0,
																cursor: "pointer",
																display: "flex",
																alignItems: "center",
																justifyContent: "center",
																width: rem(32),
																height: rem(32),
															}}
															aria-label="操作メニュー"
														>
															<IconDotsVertical size={22} color="#fff" />
														</button>
													</Menu.Target>
													<Menu.Dropdown>
														<Menu.Item
															leftSection={<IconEye size={18} />}
															onClick={() =>
																navigate(`/contact-detail/${contact.id}`)
															}
														>
															表示
														</Menu.Item>
														<Menu.Item
															leftSection={<IconPencil size={18} />}
															onClick={() => handleEdit(contact)}
														>
															編集
														</Menu.Item>
														<Menu.Item
															leftSection={<IconTrash size={18} />}
															color="red"
															onClick={() => setDeleteConfirmId(contact.id)}
														>
															削除
														</Menu.Item>
													</Menu.Dropdown>
												</Menu>
											</MenuButtonWrapper>
										</div>
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
			{sortedContacts.length > 0 && (
				<MobileCardContainer>
					{sortedContacts.map((contact) => (
						<ContactCard
							key={contact.id}
							className={`${
								contact.category === "urgent" ? "urgent-contact" : ""
							} ${
								contact.is_pinned && contact.category !== "urgent"
									? "pinned-contact"
									: ""
							}`}
						>
							<PinButton
								$isPinned={contact.is_pinned || false}
								onClick={() =>
									handleTogglePin(contact.id, contact.is_pinned || false)
								}
								aria-label={
									contact.is_pinned ? "ピン留めを解除" : "ピン留めする"
								}
								title={contact.is_pinned ? "ピン留めを解除" : "ピン留めする"}
							>
								📌
							</PinButton>
							<MenuButtonWrapper>
								<Menu
									shadow="md"
									width={160}
									withinPortal
									position="bottom-end"
									offset={4}
								>
									<Menu.Target>
										<button
											type="button"
											style={{
												background: "none",
												border: "none",
												padding: 0,
												cursor: "pointer",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												width: rem(32),
												height: rem(32),
											}}
											aria-label="操作メニュー"
										>
											<IconDotsVertical size={22} color="#fff" />
										</button>
									</Menu.Target>
									<Menu.Dropdown>
										<Menu.Item
											leftSection={<IconEye size={18} />}
											onClick={() => navigate(`/contact-detail/${contact.id}`)}
										>
											表示
										</Menu.Item>
										<Menu.Item
											leftSection={<IconPencil size={18} />}
											onClick={() => handleEdit(contact)}
										>
											編集
										</Menu.Item>
										<Menu.Item
											leftSection={<IconTrash size={18} />}
											color="red"
											onClick={() => handleDelete(contact.id)}
										>
											削除
										</Menu.Item>
									</Menu.Dropdown>
								</Menu>
							</MenuButtonWrapper>
							<CardHeader>
								<CardTitle>{contact.title || "お問い合わせ"}</CardTitle>
							</CardHeader>

							<CategoryRow>
								<CategoryBadge $isUrgent={contact.category === "urgent"}>
									{CATEGORY_LABELS[contact.category]}
								</CategoryBadge>
								<CardStatus $status={contact.status}>
									{getStatusLabel(contact.status)}
								</CardStatus>
							</CategoryRow>

							<CardInfo>
								<CardInfoRow>
									<CardLabel>お名前</CardLabel>
									<CardValue>{contact.name}</CardValue>
								</CardInfoRow>
								<CardInfoRow>
									<CardLabel>メール</CardLabel>
									<CardValue>{contact.email}</CardValue>
								</CardInfoRow>
								<CardInfoRow>
									<CardLabel>確認状況</CardLabel>
									<CardValue>
										{contact.is_checked ? (
											<span
												style={{
													color: "#ffffff",
													backgroundColor: "#10b981",
													borderRadius: "50%",
													padding: "4px 8px",
													fontSize: "12px",
													fontWeight: "bold",
													display: "inline-block",
													marginRight: "8px",
												}}
											>
												✓
											</span>
										) : (
											<span
												style={{
													color: "#ffffff",
													backgroundColor: "#fbbf24",
													borderRadius: "4px",
													padding: "4px 8px",
													fontSize: "12px",
													fontWeight: "bold",
													display: "inline-block",
													marginRight: "8px",
												}}
											>
												未
											</span>
										)}
										{contact.is_checked ? "確認済み" : "未確認"}
									</CardValue>
								</CardInfoRow>
								<CardInfoRow>
									<CardLabel>返信状況</CardLabel>
									<CardValue>
										{contact.is_replied ? (
											<span
												style={{
													color: "#ffffff",
													backgroundColor: "#10b981",
													borderRadius: "50%",
													padding: "4px 8px",
													fontSize: "12px",
													fontWeight: "bold",
													display: "inline-block",
													marginRight: "8px",
												}}
											>
												✓
											</span>
										) : (
											<span
												style={{
													color: "#ffffff",
													backgroundColor: "#fbbf24",
													borderRadius: "4px",
													padding: "4px 8px",
													fontSize: "12px",
													fontWeight: "bold",
													display: "inline-block",
													marginRight: "8px",
												}}
											>
												未
											</span>
										)}
										{contact.is_replied ? "返信済み" : "未返信"}
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

							{/* <CardActions>...</CardActions> は削除または非表示 */}
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
							<h4>{editingContact.title || "お問い合わせ"}</h4>
							<p>{editingContact.message}</p>
						</MessageContent>

						<Form
							onSubmit={(e) => {
								e.preventDefault();
								onSubmit({
									is_checked: editingContact.is_checked || false,
									is_replied: editingContact.is_replied || false,
									status: editingContact.status || "pending",
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
