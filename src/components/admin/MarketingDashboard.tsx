import React, { useState, useEffect, useCallback, useRef } from "react";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthProvider";
import { useProducts } from "../../hooks/useProducts";
import { usePurchaseHistory } from "../../hooks/usePurchaseHistory";
import { supabase } from "../../lib/supabase";
import Spinner from "../ui/Spinner";
import { MButton } from "../ui/MButton";
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
	Filler,
} from "chart.js";
import type { ChartData, ChartOptions, ScriptableContext } from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import type { Purchase as DBPurchase } from "../../types/purchase";

// Chart.jsの初期化
ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend,
	Filler
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

const DashboardTitle = styled.h1`
	font-size: 1.8rem;
	color: white;
	margin: 0;
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

const Tab = styled.button<{ $active: boolean }>`
	padding: 0.75rem 1.5rem;
	border: none;
	background: ${(props) =>
		props.$active ? "rgba(255, 255, 255, 0.1)" : "transparent"};
	color: ${(props) => (props.$active ? "white" : "rgba(255, 255, 255, 0.6)")};
	border-bottom: 2px solid
		${(props) => (props.$active ? "#3ea8ff" : "transparent")};
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

// 型定義の追加
type StatsData = {
	totalUsers: number;
	totalProducts: number;
	totalPurchases: number;
	totalRevenue: number;
};

// 購入データの型定義
interface PurchaseWithAmount extends DBPurchase {
	amount: number;
}

// amount型ガード
function hasAmount(item: any): item is { amount: number } {
	return typeof item.amount === "number";
}

// エラーの型定義
type DashboardError = {
	message: string;
	details?: string;
} & Error;

// フィードバック統計の型定義
type FeedbackStats = {
	type: string;
	count: number;
};

// 購入時系列データの型定義
type PurchaseTimeSeries = {
	date: string;
	count: number;
};

// レコメンデーション統計の型定義
type RecommendationStats = {
	productId: string;
	recommendationCount: number;
	clickCount: number;
	purchaseCount: number;
	clickRate: number;
	conversionRate: number;
};

// 商品バンドルの型定義
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

// 粒度タイプ
const TIME_GRANULARITIES = ["日", "週", "月"] as const;
type TimeGranularity = (typeof TIME_GRANULARITIES)[number];

// Chart.jsのオプション設定
const chartOptions: ChartOptions<"line"> = {
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
} as const;

const barChartOptions: ChartOptions<"bar"> = {
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
};

const MarketingDashboard: React.FC = () => {
	const { user, isAdmin } = useAuth();
	const { allProducts } = useProducts();
	const { getAllPurchaseHistory, getPurchaseCount } = usePurchaseHistory();

	const [activeTab, setActiveTab] = useState<
		"overview" | "recommendations" | "bundles"
	>("overview");
	const [isLoading, setIsLoading] = useState(true);
	const [timeGranularity, setTimeGranularity] = useState<TimeGranularity>("日");
	const [timePage, setTimePage] = useState(0); // 0=最新, 1=1つ前...
	const [statsData, setStatsData] = useState<StatsData>({
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

	// 基本的な統計情報の取得
	const fetchBasicStats = useCallback(async () => {
		// ユーザー数を取得
		const { count: userCount } = await supabase
			.from("profiles")
			.select("id", { count: "exact", head: true });
		// 商品数はメモリ内のデータを使用
		const productCount = allProducts.length;
		// 総購入数はgetPurchaseCountで取得
		const totalPurchases = await getPurchaseCount();
		// 総収益はgetAllPurchaseHistoryで計算
		const purchaseHistory = await getAllPurchaseHistory();
		const totalRevenue = purchaseHistory.reduce(
			(sum, item) => sum + (hasAmount(item) ? item.amount : 0),
			0
		);
		console.log("[Dashboard] purchaseHistory:", purchaseHistory);
		console.log("[Dashboard] totalRevenue:", totalRevenue);
		setStatsData({
			totalUsers: userCount || 0,
			totalProducts: productCount,
			totalPurchases,
			totalRevenue,
		});
	}, [allProducts, getAllPurchaseHistory, getPurchaseCount]);

	// 購入時系列データの取得
	const fetchPurchaseTimeSeries = useCallback(async () => {
		try {
			// 粒度・ページごとの時系列データ生成（モック）
			let timeSeriesData: PurchaseTimeSeries[];
			if (timeGranularity === "日") {
				const dates = Array.from({ length: 7 }, (_, i) => {
					const date = new Date();
					date.setDate(date.getDate() - (6 + timePage * 7) + i);
					return date.toISOString().split("T")[0];
				});
				timeSeriesData = dates.map((date) => ({
					date,
					count: Math.floor(Math.random() * 20) + 5,
				}));
			} else if (timeGranularity === "週") {
				const weeks = Array.from({ length: 8 }, (_, i) => {
					const now = new Date();
					now.setDate(now.getDate() - 7 * (7 + timePage * 8) + i * 7);
					const weekStr = `${now.getFullYear()}-W${String(
						Math.ceil((now.getDate() + 6) / 7)
					).padStart(2, "0")}`;
					return weekStr;
				});
				timeSeriesData = weeks.map((week) => ({
					date: week,
					count: Math.floor(Math.random() * 30) + 10,
				}));
			} else {
				const months = Array.from({ length: 12 }, (_, i) => {
					const now = new Date();
					now.setMonth(now.getMonth() - (11 + timePage * 12) + i);
					return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
						2,
						"0"
					)}`;
				});
				timeSeriesData = months.map((month) => ({
					date: month,
					count: Math.floor(Math.random() * 50) + 20,
				}));
			}
			setPurchaseTimeSeries(timeSeriesData);
		} catch (error) {
			console.error("Failed to fetch purchase time series:", error);
			setPurchaseTimeSeries([]);
		}
	}, [timeGranularity, timePage]);

	// フィードバック統計の取得
	const fetchFeedbackStats = useCallback(async () => {
		try {
			// 実際のデータが取得できない場合はモックデータを使用
			const mockFeedbackStats: FeedbackStats[] = [
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
	}, []);

	// 最も推薦された商品のデータ取得
	const fetchTopRecommendations = useCallback(async () => {
		try {
			// 実際のデータが取得できない場合はモックデータを使用
			const mockRecommendations: RecommendationStats[] = allProducts
				.slice(0, 10)
				.map((product) => ({
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
	}, [allProducts]);

	// 一緒に購入されることが多い商品バンドルの取得
	const fetchProductBundles = useCallback(async () => {
		try {
			// 実際のデータが取得できない場合はモックデータを使用
			const mockBundles: ProductBundle[] = [];

			// ランダムな商品バンドルを生成
			for (let i = 0; i < 8; i++) {
				const product1Index = Math.floor(Math.random() * allProducts.length);
				const product2Index = Math.floor(Math.random() * allProducts.length);

				// 同じ商品の組み合わせを避ける
				if (product1Index === product2Index) continue;

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
	}, [allProducts]);

	// データ取得の実行
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
			} catch (error: unknown) {
				const dashboardError = error as DashboardError;
				console.error(
					"Failed to fetch dashboard data:",
					dashboardError.message
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchDashboardData();
	}, [
		user,
		isAdmin,
		fetchBasicStats,
		fetchFeedbackStats,
		fetchPurchaseTimeSeries,
		fetchTopRecommendations,
		fetchProductBundles,
	]);

	// データ更新関数
	const refreshData = () => {
		setIsLoading(true);
		Promise.all([
			fetchBasicStats(),
			fetchFeedbackStats(),
			fetchPurchaseTimeSeries(),
			fetchTopRecommendations(),
			fetchProductBundles(),
		])
			.catch((error: unknown) => {
				const dashboardError = error as DashboardError;
				console.error("Failed to refresh data:", dashboardError.message);
			})
			.finally(() => {
				setIsLoading(false);
			});
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
					<DashboardTitle>マーケティングダッシュボード</DashboardTitle>
				</Header>
				<LoadingContainer>
					<Spinner text="データを読み込み中..." size={40} />
				</LoadingContainer>
			</DashboardContainer>
		);
	}

	// 時系列データのチャートデータ
	const timeSeriesChartData: ChartData<"line"> = {
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
	};

	// フィードバックタイプ別のチャートデータ
	const feedbackChartData: ChartData<"bar"> = {
		labels: feedbackStats.map((item) => item.type),
		datasets: [
			{
				label: "フィードバック数",
				data: feedbackStats.map((item) => item.count),
				backgroundColor: [
					"rgba(255, 99, 132, 0.7)", // 赤
					"rgba(54, 162, 235, 0.7)", // 青
					"rgba(255, 206, 86, 0.7)", // 黄
					"rgba(75, 192, 192, 0.7)", // 緑
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
	};

	// レコメンデーション効果のチャートデータ
	const recommendationChartData: ChartData<"bar"> = {
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
				data: topRecommendedProducts.slice(0, 5).map((item) => item.clickCount),
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
	};

	// 商品バンドルのチャートデータ
	const bundleChartData: ChartData<"bar"> = {
		labels: topProductBundles
			.slice(0, 5)
			.map((bundle) => `${bundle.product1.name} + ${bundle.product2.name}`),
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
	};

	// 商品バンドル表示のオプション
	const bundleChartOptions: ChartOptions<"bar"> = {
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
		indexAxis: "y",
	} as const;

	return (
		<DashboardContainer>
			<Header>
				<DashboardTitle>マーケティングダッシュボード</DashboardTitle>
				<button
					type="button"
					className="mantine-button"
					onClick={refreshData}
					style={{
						background: "linear-gradient(135deg, #3ea8ff, #0066cc)",
						color: "white",
						border: "none",
						padding: "8px 16px",
						borderRadius: "6px",
						fontSize: "14px",
						fontWeight: 500,
						cursor: "pointer",
					}}
				>
					データを更新
				</button>
			</Header>

			<TabContainer>
				<Tab
					$active={activeTab === "overview"}
					onClick={() => setActiveTab("overview")}
				>
					概要
				</Tab>
				<Tab
					$active={activeTab === "recommendations"}
					onClick={() => setActiveTab("recommendations")}
				>
					レコメンデーション分析
				</Tab>
				<Tab
					$active={activeTab === "bundles"}
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
						<ChartTitle>購入数の推移</ChartTitle>
						<div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
							{TIME_GRANULARITIES.map((g) => (
								<button
									key={g}
									onClick={() => {
										setTimeGranularity(g);
										setTimePage(0);
									}}
									type="button"
									style={{
										padding: "6px 16px",
										borderRadius: 6,
										border:
											g === timeGranularity
												? "2px solid #3ea8ff"
												: "1px solid #ccc",
										background: g === timeGranularity ? "#3ea8ff" : "#fff",
										color: g === timeGranularity ? "#fff" : "#333",
										fontWeight: g === timeGranularity ? 700 : 400,
										cursor: "pointer",
									}}
								>
									{g}
								</button>
							))}
							<div style={{ flex: 1 }} />
							<button
								onClick={() => setTimePage((p) => p + 1)}
								style={{ marginRight: 4 }}
								type="button"
							>
								前へ
							</button>
							<button
								onClick={() => setTimePage((p) => Math.max(0, p - 1))}
								disabled={timePage === 0}
								type="button"
							>
								次へ
							</button>
						</div>
						<div style={{ height: "300px" }}>
							<Line data={timeSeriesChartData} options={chartOptions} />
						</div>
					</ChartContainer>

					{/* フィードバック統計 */}
					<ChartContainer>
						<ChartTitle>フィードバックタイプ別の統計</ChartTitle>
						<div style={{ height: "300px" }}>
							<Bar data={feedbackChartData} options={barChartOptions} />
						</div>
					</ChartContainer>
				</>
			)}

			{activeTab === "recommendations" && (
				<>
					<ChartContainer>
						<ChartTitle>レコメンデーションの効果</ChartTitle>
						<div style={{ height: "300px" }}>
							<Bar data={recommendationChartData} options={barChartOptions} />
						</div>
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
					{/*
					// バンドル作成アクションは将来的に追加予定。現時点ではUIを非表示にしています。
					<div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
						<ChartTitle>一緒に購入されることが多いアプリの組み合わせ</ChartTitle>
						<button
							type="button"
							className="mantine-button"
							onClick={() => {}}
							style={{
								background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
								color: "white",
								border: "none",
								padding: "8px 16px",
								borderRadius: "6px",
								fontSize: "14px",
								fontWeight: 500,
								cursor: "pointer",
							}}
						>
							バンドル作成
						</button>
					</div>
					*/}
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
									{/* <Th>アクション</Th> バンドル作成機能は将来的に追加予定。現時点ではUIを非表示にしています。 */}
								</tr>
							</thead>
							<tbody>
								{topProductBundles.map((bundle, index) => (
									<tr
										key={`bundle-${index}-${bundle.product1.id}-${bundle.product2.id}`}
									>
										<Td>{bundle.product1.name}</Td>
										<Td>{bundle.product2.name}</Td>
										<Td>{bundle.purchaseCount}</Td>
										{/* <Td></Td> バンドル作成アクションは将来的に追加予定。現時点ではUIを非表示にしています。 */}
									</tr>
								))}
							</tbody>
						</Table>
					</TableContainer>

					<ChartContainer>
						<ChartTitle>トップ商品バンドル</ChartTitle>
						<div style={{ height: "400px" }}>
							<Bar data={bundleChartData} options={bundleChartOptions} />
						</div>
					</ChartContainer>
				</>
			)}
		</DashboardContainer>
	);
};

export default MarketingDashboard;
