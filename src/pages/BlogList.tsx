import React, { useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { BlogCard } from "../components/blogs/BlogCard";
import { useBlogs } from "../hooks/useBlogs";
import { BlogPlatform } from "../types/blog";

const glowAnimation = keyframes`
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
`;

const Container = styled.div`
	position: relative;
	min-height: 100vh;
	width: 100%;
	background-color: #02040a;
	overflow: hidden;

	&::before {
		content: "";
		position: absolute;
		top: 50%;
		left: 50%;
		width: 1200px;
		height: 1200px;
		background-image: radial-gradient(
				circle,
				rgba(62, 168, 255, 0.3) 0%,
				rgba(62, 168, 255, 0) 50%
			),
			radial-gradient(
				circle,
				rgba(138, 43, 226, 0.2) 0%,
				rgba(138, 43, 226, 0) 60%
			);
		background-blend-mode: screen;
		animation: ${glowAnimation} 40s linear infinite;
		z-index: 0;
	}

	> * {
		position: relative;
		z-index: 1;
	}
`;

const ContentWrapper = styled.div`
	max-width: 1200px; /* ⬅️ グリッドの幅と合わせる */
	margin: 0 auto;
	padding-inline: 24px;
	box-sizing: border-box;

	/* 小画面では全幅を使用 */
	@media (max-width: 1240px) {
		width: 100%;
		padding-inline: 16px;
	}
`;

const Header = styled.div`
	text-align: center;
	margin-bottom: 3rem;
	margin-top: 80px;

	@media (max-width: 768px) {
		margin-top: 60px;
	}
`;

const Title = styled.h1`
	font-size: 2.5rem;
	margin: 0 0 1rem 0;
	color: white;
	background: linear-gradient(135deg, #3ea8ff, #0066cc);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	text-shadow: 0 2px 20px rgba(62, 168, 255, 0.3);
`;

const Subtitle = styled.p`
	font-size: 1.1rem;
	color: rgba(255, 255, 255, 0.8);
	margin: 0;
`;

const StatsContainer = styled.div`
	display: flex;
	justify-content: center;
	gap: 2rem;
	margin: 2rem 0;
	flex-wrap: wrap;
`;

const StatCard = styled.div`
	background: rgba(20, 26, 42, 0.6);
	border-radius: 12px;
	padding: 1rem 1.5rem;
	text-align: center;
	backdrop-filter: blur(12px) saturate(150%);
	border: 1px solid rgba(255, 255, 255, 0.1);
	box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
	transition: all 0.3s ease;

	&:hover {
		transform: translateY(-5px);
		box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.5);
	}
`;

const StatNumber = styled.div`
	font-size: 1.5rem;
	font-weight: bold;
	color: #3ea8ff;
`;

const StatLabel = styled.div`
	font-size: 0.9rem;
	color: rgba(255, 255, 255, 0.7);
	margin-top: 0.25rem;
`;

const ControlsContainer = styled.div`
	display: flex;
	gap: 1rem;
	margin-bottom: 2rem;
	flex-wrap: wrap;
	align-items: center;
	justify-content: center; /* 中央揃えに変更 */
	width: 100%;
	box-sizing: border-box;
`;

const SearchInput = styled.input`
	padding: 0.75rem 1rem;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 25px;
	background: rgba(20, 26, 42, 0.6);
	color: white;
	font-size: 1rem;
	width: 100%;
	max-width: 280px;
	backdrop-filter: blur(10px);

	@media (max-width: 768px) {
		max-width: 240px;
	}

	&::placeholder {
		color: rgba(255, 255, 255, 0.5);
	}

	&:focus {
		outline: none;
		border-color: #3ea8ff;
		box-shadow: 0 0 0 2px rgba(62, 168, 255, 0.3);
	}
`;

const PlatformSelect = styled.select.attrs({
	"aria-label": "プラットフォームを選択",
	title: "プラットフォームを選択",
})`
	padding: 0.75rem 1rem;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 8px;
	background: rgba(20, 26, 42, 0.6);
	color: white;
	font-size: 1rem;
	backdrop-filter: blur(10px);
	width: 100%;
	max-width: 260px; /* 横幅を広げる */

	&:focus {
		outline: none;
		border-color: #3ea8ff;
		box-shadow: 0 0 0 2px rgba(62, 168, 255, 0.3);
	}

	option {
		background: #2a2a2a;
		color: white;
	}
`;

const Button = styled.button<{ $variant?: "primary" | "secondary" }>`
	padding: 0.75rem 1.5rem;
	border: none;
	border-radius: 8px;
	font-size: 1rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.3s ease;

	${({ $variant }) => {
		if ($variant === "secondary") {
			return `
				background: rgba(255, 255, 255, 0.2);
				color: white;
				&:hover {
					background: rgba(255, 255, 255, 0.3);
					transform: translateY(-2px);
				}
			`;
		}
		return `
			background: linear-gradient(135deg, #3EA8FF, #0066CC);
			color: white;
			&:hover {
				background: linear-gradient(135deg, #0066CC, #0055BB);
				transform: translateY(-2px);
			}
		`;
	}}
`;

const BlogGrid = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	margin-top: 2rem;
	margin-bottom: 3rem; /* 最下部に余白を追加 */
	width: 100%;
	box-sizing: border-box;
`;

const LoadingMessage = styled.div`
	text-align: center;
	padding: 3rem;
	color: rgba(255, 255, 255, 0.7);
	font-size: 1.1rem;
`;

const ErrorMessage = styled.div`
	text-align: center;
	padding: 3rem;
	color: rgba(255, 255, 255, 0.7);
	font-size: 1.1rem;

	h3 {
		color: #ff6b6b;
		margin-bottom: 1rem;
	}

	p {
		margin-bottom: 1.5rem;
	}
`;

const NoResultsMessage = styled.div`
	text-align: center;
	padding: 3rem;
	color: rgba(255, 255, 255, 0.7);
	font-size: 1.1rem;

	h3 {
		color: white;
		margin-bottom: 1rem;
	}
`;

const BlogList: React.FC = () => {
	const {
		blogs,
		filters,
		isLoading,
		error,
		updateFilter,
		resetFilters,
		getStats,
		getPlatformCounts,
		retry,
	} = useBlogs();

	const stats = getStats();
	const platformCounts = getPlatformCounts();

	console.log("BlogList render:", { blogs, isLoading, stats, platformCounts });

	const handleSearchChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			updateFilter({ searchQuery: e.target.value });
		},
		[updateFilter]
	);

	const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value;
		if (value === "all") {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { platform: _platform, ...rest } = filters;
			updateFilter(rest);
		} else {
			updateFilter({ platform: value as BlogPlatform });
		}
	};

	if (isLoading) {
		return (
			<Container>
				<LoadingMessage>
					<div>ブログ記事を読み込んでいます...</div>
					<div style={{ marginTop: "1rem", fontSize: "0.9rem", opacity: 0.7 }}>
						しばらくお待ちください
					</div>
				</LoadingMessage>
			</Container>
		);
	}

	if (error) {
		return (
			<Container>
				<ErrorMessage>
					<h3>読み込みエラー</h3>
					<p>{error}</p>
					<Button onClick={retry}>再試行</Button>
				</ErrorMessage>
			</Container>
		);
	}

	return (
		<Container>
			<ContentWrapper>
				<Header>
					<Title>Blog</Title>
					<Subtitle>
						日々の学びや技術的な発見を
						<br />
						シェアしています。
					</Subtitle>
				</Header>

				<StatsContainer>
					<StatCard>
						<StatNumber>{stats.total}</StatNumber>
						<StatLabel>Total Articles</StatLabel>
					</StatCard>
					{Object.entries(platformCounts).map(([platform, count]) => (
						<StatCard key={platform}>
							<StatNumber>{count}</StatNumber>
							<StatLabel>{platform}</StatLabel>
						</StatCard>
					))}
					<StatCard>
						<StatNumber>{stats.averageReadTime} min</StatNumber>
						<StatLabel>Avg. Read Time</StatLabel>
					</StatCard>
				</StatsContainer>

				<ControlsContainer>
					<SearchInput
						type="text"
						placeholder="タイトルやタグで検索..."
						value={filters.searchQuery || ""}
						onChange={handleSearchChange}
					/>
					<label htmlFor="platform-filter" style={{ display: "none" }}>
						プラットフォーム選択
					</label>
					<PlatformSelect
						id="platform-filter"
						aria-labelledby="platform-label"
						aria-label="プラットフォーム選択"
						title="プラットフォーム選択"
						value={filters.platform || "all"}
						onChange={handlePlatformChange}
					>
						<option value="all">すべてのプラットフォーム</option>
						{Object.values(BlogPlatform).map((platform) => (
							<option key={platform} value={platform}>
								{platform}
							</option>
						))}
					</PlatformSelect>
					<Button $variant="secondary" onClick={() => resetFilters()}>
						リセット
					</Button>
				</ControlsContainer>

				{blogs.length > 0 ? (
					<BlogGrid>
						{blogs.map((blog) => (
							<BlogCard key={blog.id} blog={blog} />
						))}
					</BlogGrid>
				) : (
					<NoResultsMessage>
						<h3>記事が見つかりませんでした</h3>
						<p>検索条件を変えて、もう一度お試しください。</p>
						<Button onClick={() => resetFilters()}>フィルタをリセット</Button>
					</NoResultsMessage>
				)}
			</ContentWrapper>
		</Container>
	);
};

export default BlogList;
