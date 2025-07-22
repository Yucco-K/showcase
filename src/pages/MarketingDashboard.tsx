import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
import MarketingDashboard from "../components/admin/MarketingDashboard";
import styled from "styled-components";

const Container = styled.div`
	min-height: 100vh;
	padding: 80px 0 40px;
`;

const MarketingDashboardPage: React.FC = () => {
	const { user, isAdmin } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		document.title = "マーケティングダッシュボード | Dummy App Store";

		// 管理者でない場合はリダイレクト
		if (user && !isAdmin(user)) {
			navigate("/");
		}
	}, [user, isAdmin, navigate]);

	return (
		<Container>
			<MarketingDashboard />
		</Container>
	);
};

export default MarketingDashboardPage;
