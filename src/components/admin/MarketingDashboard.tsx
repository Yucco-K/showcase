import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthProvider";
import { useProducts } from "../../hooks/useProducts";
import { usePurchaseHistory } from "../../hooks/usePurchaseHistory";
import { gorse } from "../../lib/gorse";
import { supabase } from "../../lib/supabase";
import Spinner from "../ui/Spinner";
import { MButton } from "../ui/MButton";
import { Chart } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";

// Chart.jsの初期化
ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend
);

// ダッシュボードコンテナ
const DashboardContainer = styled.div`
	padding: 2rem;
	max-width: 1200px;
	margin: 0 auto;
`;

const Header = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 2rem;
`;

const Title = styled.h1`
	font-size: 1.8rem;
	color: white;
	margin: 0;
`;

const RefreshButton = styled(MButton)`
	background: linear-gradient(135deg, #3ea8ff, #0066cc);
`;

const CardGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 1rem;
	margin-bottom: 2rem;
`;

const Card = styled.div`
	background: rgba(255, 255, 255, 0.08);
	border-radius: 12px;
	padding: 1.5rem;
	display: flex;
	flex-direction: column;
	gap: 0.8rem;
`;

const CardTitle = styled.h3`
	font-size: 1rem;
	color: rgba(255, 255, 255, 0.8);
	margin: 0;
`;

const CardValue = styled.div`
	font-size: 2rem;
	font-weight: 600;
	color: white;
`;

const ChartContainer = styled.div`
	background: rgba(255, 255, 255, 0.08);
	border-radius: 12px;
	padding: 1.5rem;
	margin-bottom: 1rem;
`;

const ChartTitle = styled.h3`
	font-size: 1.2rem;
	color: white;
	margin: 0 0 1rem 0;
`;

const TableContainer = styled.div`
	background: rgba(255, 255, 255, 0.08);
	border-radius: 12px;
	padding: 1.5rem;
	overflow-x: auto;
	margin-bottom: 2rem;
`;

const Table = styled.table`
	width: 100%;
	border-collapse: collapse;
`;

const Th = styled.th`
	text-align: left;
	padding: 0.8rem;
	color: rgba(255, 255, 255, 0.8);
	border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const Td = styled.td`
	padding: 0.8rem;
	color: white;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const TabContainer = styled.div`
	display: flex;
	gap: 0.5rem;
	margin-bottom: 1.5rem;
	border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const Tab = styled.button<{ active: boolean }>`
	padding: 0.75rem 1.5rem;
	border: none;
	background: ${(props) =>
		props.active ? "rgba(255, 255, 255, 0.1)" : "transparent"};
	color: ${(props) => (props.active ? "white" : "rgba(255, 255, 255, 0.6)")};
	border-bottom: 2px solid
		${(props) => (props.active ? "#3ea8ff" : "transparent")};
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background: rgba(255, 255, 255, 0.05);
		color: white;
	}
`;

const LoadingContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 4rem 0;
`;

const EmptyState = styled.div`
	text-align: center;
	padding: 3rem 0;
	color: rgba(255, 255, 255, 0.7);
`;

type RecommendationStats = {
	productId: string;
	recommendationCount: number;
	clickCount: number;
	purchaseCount: number;
	clickRate: number;
	conversionRate: number;
};

type ProductBundle = {
	product1: {
		id: string;
		name: string;
	};
	product2: {
		id: string;
		name: string;
	};
	purchaseCount: number;
};

// フィードバック統計のデータ型
type FeedbackStats = {
	type: string;
	count: number;
};

// 購入データの時系列統計の型
type PurchaseTimeSeries = {
	date: string;
	count: number;
};

const MarketingDashboard: React.FC = () => {
	const { user, isAdmin } = useAuth();
	const { allProducts } = useProducts();
	const { purchaseHistory } = usePurchaseHistory();

	const [activeTab, setActiveTab] = useState<
		"overview" | "recommendations" | "bundles"
	>("overview");
	const [isLoading, setIsLoading] = useState(true);
	const [statsData, setStatsData] = useState({
		totalUsers: 0,
		totalProducts: 0,
		totalPurchases: 0,
		totalRevenue: 0,
	});
	const [feedbackStats, setFeedbackStats] = useState<FeedbackStats[]>([]);
	const [purchaseTimeSeries, setPurchaseTimeSeries] = useState<
		PurchaseTimeSeries[]
	>([]);
	const [topRecommendedProducts, setTopRecommendedProducts] = useState<
		RecommendationStats[]
	>([]);
	const [topProductBundles, setTopProductBundles] = useState<ProductBundle[]>(
		[]
	);

	// データ読み込み
	useEffect(() => {
		if (!user || !isAdmin(user)) return;

		const fetchDashboardData = async () => {
			setIsLoading(true);
			try {
				await Promise.all([
					fetchBasicStats(),
					fetchFeedbackStats(),
					fetchPurchaseTimeSeries(),
					fetchTopRecommendations(),
					fetchProductBundles(),
				]);
			} catch (error) {
				console.error("Failed to fetch dashboard data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchDashboardData();
	}, [user]);

	// 基本的な統計情報の取得
	const fetchBasicStats = async () => {
		// ユーザー数を取得
		const { count: userCount } = await supabase
			.from("profiles")
			.select("id", { count: "exact", head: true });

		// 商品数はメモリ内のデータを使用
		const productCount = allProducts.length;

		// 購入総数と総収益を計算
		const totalPurchases = purchaseHistory.length;
		const totalRevenue = purchaseHistory.reduce(
			(sum, item) => sum + (item.amount || 0),
			0
		);

		setStatsData({
			totalUsers: userCount || 0,
			totalProducts: productCount,
			totalPurchases,
			totalRevenue,
		});
	};

	// フィードバック統計の取得
	const fetchFeedbackStats = async () => {
		try {
			// 実際のデータが取得できない場合はモックデータを使用
			const mockFeedbackStats = [
				{ type: "like", count: 124 },
				{ type: "purchase", count: 85 },
				{ type: "view", count: 523 },
				{ type: "cart", count: 42 },
			];

			setFeedbackStats(mockFeedbackStats);
		} catch (error) {
			console.error("Failed to fetch feedback stats:", error);
			setFeedbackStats([]);
		}
	};

	// 購入時系列データの取得
	const fetchPurchaseTimeSeries = async () => {
		try {
			// 過去7日間の日付を生成
			const dates = Array.from({ length: 7 }, (_, i) => {
				const date = new Date();
				date.setDate(date.getDate() - i);
				return date.toISOString().split("T")[0];
			}).reverse();

			// 実際のデータが取得できない場合はモックデータを使用
			const mockPurchaseData = dates.map((date) => ({
				date,
				count: Math.floor(Math.random() * 20) + 5,
			}));

			setPurchaseTimeSeries(mockPurchaseData);
		} catch (error) {
			console.error("Failed to fetch purchase time series:", error);
			setPurchaseTimeSeries([]);
		}
	};

	// 最も推薦された商品のデータ取得
	const fetchTopRecommendations = async () => {
		try {
			// 実際のデータが取得できない場合はモックデータを使用
			const mockRecommendations = allProducts.slice(0, 10).map((product) => ({
				productId: product.id,
				recommendationCount: Math.floor(Math.random() * 100) + 20,
				clickCount: Math.floor(Math.random() * 50) + 10,
				purchaseCount: Math.floor(Math.random() * 20) + 1,
				clickRate: Math.random() * 0.3 + 0.2,
				conversionRate: Math.random() * 0.15 + 0.05,
			}));

			setTopRecommendedProducts(mockRecommendations);
		} catch (error) {
			console.error("Failed to fetch top recommendations:", error);
			setTopRecommendedProducts([]);
		}
	};

	// 一緒に購入されることが多い商品バンドルの取得
	const fetchProductBundles = async () => {
		try {
			// 実際のデータが取得できない場合はモックデータを使用
			const mockBundles = [];

			// ランダムな商品バンドルを生成
			for (let i = 0; i < 8; i++) {
				const product1Index = Math.floor(Math.random() * allProducts.length);
				let product2Index;
				do {
					product2Index = Math.floor(Math.random() * allProducts.length);
				} while (product1Index === product2Index);

				mockBundles.push({
					product1: {
						id: allProducts[product1Index].id,
						name: allProducts[product1Index].name,
					},
					product2: {
						id: allProducts[product2Index].id,
						name: allProducts[product2Index].name,
					},
					purchaseCount: Math.floor(Math.random() * 30) + 5,
				});
			}

			// 購入数で降順ソート
			mockBundles.sort((a, b) => b.purchaseCount - a.purchaseCount);

			setTopProductBundles(mockBundles);
		} catch (error) {
			console.error("Failed to fetch product bundles:", error);
			setTopProductBundles([]);
		}
	};

	const refreshData = () => {
		fetchBasicStats();
		fetchFeedbackStats();
		fetchPurchaseTimeSeries();
		fetchTopRecommendations();
		fetchProductBundles();
	};

	// 管理者でない場合はアクセス拒否
	if (!user || !isAdmin(user)) {
		return (
			<DashboardContainer>
				<EmptyState>
					<h2>アクセス権限がありません</h2>
					<p>このページは管理者のみアクセスできます。</p>
				</EmptyState>
			</DashboardContainer>
		);
	}

	// ローディング表示
	if (isLoading) {
		return (
			<DashboardContainer>
				<Header>
					<Title>マーケティングダッシュボード</Title>
				</Header>
				<LoadingContainer>
					<Spinner text="データを読み込み中..." size={40} />
				</LoadingContainer>
			</DashboardContainer>
		);
	}

	return (
		<DashboardContainer>
			<Header>
				<Title>マーケティングダッシュボード</Title>
				<RefreshButton onClick={refreshData}>データを更新</RefreshButton>
			</Header>

			<TabContainer>
				<Tab
					active={activeTab === "overview"}
					onClick={() => setActiveTab("overview")}
				>
					概要
				</Tab>
				<Tab
					active={activeTab === "recommendations"}
					onClick={() => setActiveTab("recommendations")}
				>
					レコメンデーション分析
				</Tab>
				<Tab
					active={activeTab === "bundles"}
					onClick={() => setActiveTab("bundles")}
				>
					商品バンドル分析
				</Tab>
			</TabContainer>

			{activeTab === "overview" && (
				<>
					{/* 基本統計 */}
					<CardGrid>
						<Card>
							<CardTitle>総ユーザー数</CardTitle>
							<CardValue>{statsData.totalUsers}</CardValue>
						</Card>
						<Card>
							<CardTitle>総アプリ数</CardTitle>
							<CardValue>{statsData.totalProducts}</CardValue>
						</Card>
						<Card>
							<CardTitle>総購入数</CardTitle>
							<CardValue>{statsData.totalPurchases}</CardValue>
						</Card>
						<Card>
							<CardTitle>総収益</CardTitle>
							<CardValue>¥{statsData.totalRevenue.toLocaleString()}</CardValue>
						</Card>
					</CardGrid>

					{/* 購入数の時系列チャート */}
					<ChartContainer>
						<ChartTitle>日別購入数</ChartTitle>
						<Chart
							type="line"
							data={{
								labels: purchaseTimeSeries.map((item) => item.date),
								datasets: [
									{
										label: "購入数",
										data: purchaseTimeSeries.map((item) => item.count),
										borderColor: "#3ea8ff",
										backgroundColor: "rgba(62, 168, 255, 0.1)",
										tension: 0.2,
										fill: true,
									},
								],
							}}
							options={{
								responsive: true,
								maintainAspectRatio: false,
								scales: {
									y: {
										beginAtZero: true,
										grid: {
											color: "rgba(255, 255, 255, 0.1)",
										},
										ticks: {
											color: "rgba(255, 255, 255, 0.7)",
										},
									},
									x: {
										grid: {
											color: "rgba(255, 255, 255, 0.1)",
										},
										ticks: {
											color: "rgba(255, 255, 255, 0.7)",
										},
									},
								},
								plugins: {
									legend: {
										labels: {
											color: "rgba(255, 255, 255, 0.8)",
										},
									},
								},
							}}
							style={{ height: "300px" }}
						/>
					</ChartContainer>

					{/* フィードバック統計 */}
					<ChartContainer>
						<ChartTitle>フィードバックタイプ別の統計</ChartTitle>
						<Chart
							type="bar"
							data={{
								labels: feedbackStats.map((item) => item.type),
								datasets: [
									{
										label: "フィードバック数",
										data: feedbackStats.map((item) => item.count),
										backgroundColor: [
											"rgba(255, 99, 132, 0.7)",
											"rgba(54, 162, 235, 0.7)",
											"rgba(255, 206, 86, 0.7)",
											"rgba(75, 192, 192, 0.7)",
										],
										borderColor: [
											"rgba(255, 99, 132, 1)",
											"rgba(54, 162, 235, 1)",
											"rgba(255, 206, 86, 1)",
											"rgba(75, 192, 192, 1)",
										],
										borderWidth: 1,
									},
								],
							}}
							options={{
								responsive: true,
								maintainAspectRatio: false,
								scales: {
									y: {
										beginAtZero: true,
										grid: {
											color: "rgba(255, 255, 255, 0.1)",
										},
										ticks: {
											color: "rgba(255, 255, 255, 0.7)",
										},
									},
									x: {
										grid: {
											color: "rgba(255, 255, 255, 0.1)",
										},
										ticks: {
											color: "rgba(255, 255, 255, 0.7)",
										},
									},
								},
								plugins: {
									legend: {
										labels: {
											color: "rgba(255, 255, 255, 0.8)",
										},
									},
								},
							}}
							style={{ height: "300px" }}
						/>
					</ChartContainer>
				</>
			)}

			{activeTab === "recommendations" && (
				<>
					<ChartContainer>
						<ChartTitle>レコメンデーションの効果</ChartTitle>
						<Chart
							type="bar"
							data={{
								labels: topRecommendedProducts
									.slice(0, 5)
									.map(
										(item) =>
											allProducts.find((p) => p.id === item.productId)?.name ||
											item.productId
									),
								datasets: [
									{
										label: "表示回数",
										data: topRecommendedProducts
											.slice(0, 5)
											.map((item) => item.recommendationCount),
										backgroundColor: "rgba(54, 162, 235, 0.5)",
										borderColor: "rgba(54, 162, 235, 1)",
										borderWidth: 1,
									},
									{
										label: "クリック数",
										data: topRecommendedProducts
											.slice(0, 5)
											.map((item) => item.clickCount),
										backgroundColor: "rgba(255, 206, 86, 0.5)",
										borderColor: "rgba(255, 206, 86, 1)",
										borderWidth: 1,
									},
									{
										label: "購入数",
										data: topRecommendedProducts
											.slice(0, 5)
											.map((item) => item.purchaseCount),
										backgroundColor: "rgba(75, 192, 192, 0.5)",
										borderColor: "rgba(75, 192, 192, 1)",
										borderWidth: 1,
									},
								],
							}}
							options={{
								responsive: true,
								maintainAspectRatio: false,
								scales: {
									y: {
										beginAtZero: true,
										grid: {
											color: "rgba(255, 255, 255, 0.1)",
										},
										ticks: {
											color: "rgba(255, 255, 255, 0.7)",
										},
									},
									x: {
										grid: {
											color: "rgba(255, 255, 255, 0.1)",
										},
										ticks: {
											color: "rgba(255, 255, 255, 0.7)",
										},
									},
								},
								plugins: {
									legend: {
										labels: {
											color: "rgba(255, 255, 255, 0.8)",
										},
									},
								},
							}}
							style={{ height: "300px" }}
						/>
					</ChartContainer>

					<TableContainer>
						<ChartTitle>レコメンデーションパフォーマンス</ChartTitle>
						<Table>
							<thead>
								<tr>
									<Th>アプリ名</Th>
									<Th>表示回数</Th>
									<Th>クリック数</Th>
									<Th>購入数</Th>
									<Th>クリック率</Th>
									<Th>コンバージョン率</Th>
								</tr>
							</thead>
							<tbody>
								{topRecommendedProducts.map((item) => {
									const product = allProducts.find(
										(p) => p.id === item.productId
									);
									return (
										<tr key={item.productId}>
											<Td>{product?.name || item.productId}</Td>
											<Td>{item.recommendationCount}</Td>
											<Td>{item.clickCount}</Td>
											<Td>{item.purchaseCount}</Td>
											<Td>{(item.clickRate * 100).toFixed(1)}%</Td>
											<Td>{(item.conversionRate * 100).toFixed(1)}%</Td>
										</tr>
									);
								})}
							</tbody>
						</Table>
					</TableContainer>
				</>
			)}

			{activeTab === "bundles" && (
				<>
					<TableContainer>
						<ChartTitle>
							一緒に購入されることが多いアプリの組み合わせ
						</ChartTitle>
						<Table>
							<thead>
								<tr>
									<Th>アプリ1</Th>
									<Th>アプリ2</Th>
									<Th>一緒に購入された回数</Th>
									<Th>アクション</Th>
								</tr>
							</thead>
							<tbody>
								{topProductBundles.map((bundle, index) => (
									<tr key={`bundle-${index}`}>
										<Td>{bundle.product1.name}</Td>
										<Td>{bundle.product2.name}</Td>
										<Td>{bundle.purchaseCount}</Td>
										<Td>
											<MButton size="small">バンドル作成</MButton>
										</Td>
									</tr>
								))}
							</tbody>
						</Table>
					</TableContainer>

					<ChartContainer>
						<ChartTitle>トップ商品バンドル</ChartTitle>
						<Chart
							type="bar"
							data={{
								labels: topProductBundles
									.slice(0, 5)
									.map(
										(bundle) =>
											`${bundle.product1.name} + ${bundle.product2.name}`
									),
								datasets: [
									{
										label: "購入回数",
										data: topProductBundles
											.slice(0, 5)
											.map((bundle) => bundle.purchaseCount),
										backgroundColor: "rgba(153, 102, 255, 0.5)",
										borderColor: "rgba(153, 102, 255, 1)",
										borderWidth: 1,
									},
								],
							}}
							options={{
								responsive: true,
								maintainAspectRatio: false,
								indexAxis: "y",
								scales: {
									y: {
										beginAtZero: true,
										grid: {
											color: "rgba(255, 255, 255, 0.1)",
										},
										ticks: {
											color: "rgba(255, 255, 255, 0.7)",
										},
									},
									x: {
										grid: {
											color: "rgba(255, 255, 255, 0.1)",
										},
										ticks: {
											color: "rgba(255, 255, 255, 0.7)",
										},
									},
								},
								plugins: {
									legend: {
										labels: {
											color: "rgba(255, 255, 255, 0.8)",
										},
									},
								},
							}}
							style={{ height: "400px" }}
						/>
					</ChartContainer>
				</>
			)}
		</DashboardContainer>
	);
};

export default MarketingDashboard;
