import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";
import { useToast } from "../../hooks/useToast";
import { Toast } from "../ui/Toast";

interface AdminProtectedRouteProps {
	children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
	children,
}) => {
	const { user, loading, isAdmin } = useAuth();
	const navigate = useNavigate();
	const { toast, showError, hideToast } = useToast();

	useEffect(() => {
		// ローディング完了後に認証・権限チェック
		if (!loading) {
			// 未ログインまたは管理者権限がない場合はTOPページにリダイレクト
			if (!user || !isAdmin(user)) {
				if (!user) {
					showError("管理者ページにアクセスするにはログインが必要です。");
				} else {
					showError("管理者権限が必要です。");
				}
				navigate("/", { replace: true });
			}
		}
	}, [user, loading, isAdmin, navigate, showError]);

	// ローディング中は何も表示しない
	if (loading) {
		return null;
	}

	// 認証済みかつ管理者権限がある場合のみ子コンポーネントを表示
	if (user && isAdmin(user)) {
		return (
			<>
				{children}
				<Toast
					message={toast.message}
					type={toast.type}
					isVisible={toast.isVisible}
					onClose={hideToast}
				/>
			</>
		);
	}

	// それ以外の場合は何も表示しない（リダイレクト処理中）
	return (
		<Toast
			message={toast.message}
			type={toast.type}
			isVisible={toast.isVisible}
			onClose={hideToast}
		/>
	);
};
