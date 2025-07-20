import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthProvider";
import { LoginModal } from "./LoginModal";

interface ProtectedRouteProps {
	children: React.ReactNode;
	requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
	children,
	requireAuth = true,
}) => {
	const { user, loading } = useAuth();
	const [showLoginModal, setShowLoginModal] = useState(false);

	useEffect(() => {
		if (!loading && requireAuth && !user) {
			setShowLoginModal(true);
		} else if (user) {
			setShowLoginModal(false);
		}
	}, [user, loading, requireAuth]);

	// ローディング中は何も表示しない
	if (loading) {
		return null;
	}

	// 認証が不要、または認証済みの場合は子コンポーネントを表示
	if (!requireAuth || user) {
		return <>{children}</>;
	}

	// 未ログインの場合はログインモーダルを表示
	return (
		<>
			{/* 背景として子コンポーネントも表示 */}
			{children}
			<LoginModal
				isOpen={showLoginModal}
				onClose={() => setShowLoginModal(false)}
			/>
		</>
	);
};
