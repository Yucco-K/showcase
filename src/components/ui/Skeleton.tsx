import React from "react";
import styled, { keyframes } from "styled-components";

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const SkeletonBase = styled.div<{ $width?: string; $height?: string }>`
	width: ${(props) => props.$width || "100%"};
	height: ${(props) => props.$height || "20px"};
	background: linear-gradient(
		90deg,
		rgba(255, 255, 255, 0.1) 25%,
		rgba(255, 255, 255, 0.15) 50%,
		rgba(255, 255, 255, 0.1) 75%
	);
	background-size: 200px 100%;
	animation: ${shimmer} 2s infinite;
	border-radius: 4px;
	margin-bottom: 8px;
`;

const SkeletonContainer = styled.div`
	padding: 20px;
	max-width: 1200px;
	margin: 0 auto;
`;

const SkeletonHeader = styled.div`
	display: flex;
	gap: 24px;
	margin-bottom: 32px;

	@media (max-width: 768px) {
		flex-direction: column;
	}
`;

const SkeletonImageSection = styled.div`
	flex: 1;
	max-width: 400px;
`;

const SkeletonInfoSection = styled.div`
	flex: 2;
`;

const SkeletonReviewItem = styled.div`
	background: rgba(255, 255, 255, 0.1);
	border-radius: 8px;
	padding: 16px;
	margin-bottom: 16px;
`;

const SkeletonCard = styled.div`
	background: rgba(255, 255, 255, 0.1);
	border-radius: 12px;
	padding: 24px;
	backdrop-filter: blur(10px);
	border: 1px solid rgba(255, 255, 255, 0.2);
`;

const SkeletonChartContainer = styled.div`
	background: rgba(255, 255, 255, 0.1);
	border-radius: 12px;
	padding: 24px;
	backdrop-filter: blur(10px);
	border: 1px solid rgba(255, 255, 255, 0.2);
	margin-bottom: 24px;
`;

const SkeletonTabContainer = styled.div`
	display: flex;
	gap: 16px;
	margin-bottom: 32px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	padding-bottom: 16px;
`;

const SkeletonTable = styled.div`
	background: rgba(255, 255, 255, 0.1);
	border-radius: 12px;
	padding: 24px;
	backdrop-filter: blur(10px);
	border: 1px solid rgba(255, 255, 255, 0.2);
`;

export const ProductDetailSkeleton: React.FC = () => {
	return (
		<SkeletonContainer>
			{/* 戻るボタン */}
			<SkeletonBase
				$width="120px"
				$height="40px"
				style={{ marginBottom: "24px" }}
			/>

			{/* ヘッダー部分 */}
			<SkeletonHeader>
				{/* 画像セクション */}
				<SkeletonImageSection>
					<SkeletonBase
						$width="100%"
						$height="300px"
						style={{ marginBottom: "16px" }}
					/>
					<div style={{ display: "flex", gap: "8px" }}>
						<SkeletonBase $width="80px" $height="60px" />
						<SkeletonBase $width="80px" $height="60px" />
						<SkeletonBase $width="80px" $height="60px" />
					</div>
				</SkeletonImageSection>

				{/* 情報セクション */}
				<SkeletonInfoSection>
					<SkeletonBase
						$width="60%"
						$height="32px"
						style={{ marginBottom: "16px" }}
					/>
					<SkeletonBase
						$width="100%"
						$height="20px"
						style={{ marginBottom: "8px" }}
					/>
					<SkeletonBase
						$width="80%"
						$height="20px"
						style={{ marginBottom: "24px" }}
					/>

					{/* 価格 */}
					<SkeletonBase
						$width="120px"
						$height="28px"
						style={{ marginBottom: "16px" }}
					/>

					{/* 評価 */}
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "8px",
							marginBottom: "24px",
						}}
					>
						<SkeletonBase $width="100px" $height="20px" />
						<SkeletonBase $width="60px" $height="20px" />
					</div>

					{/* ボタン */}
					<div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
						<SkeletonBase $width="150px" $height="44px" />
						<SkeletonBase $width="44px" $height="44px" />
					</div>

					{/* メタ情報 */}
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(3, 1fr)",
							gap: "16px",
							marginBottom: "24px",
						}}
					>
						<SkeletonBase $width="100%" $height="40px" />
						<SkeletonBase $width="100%" $height="40px" />
						<SkeletonBase $width="100%" $height="40px" />
					</div>

					{/* タグ */}
					<div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
						<SkeletonBase $width="60px" $height="24px" />
						<SkeletonBase $width="80px" $height="24px" />
						<SkeletonBase $width="70px" $height="24px" />
					</div>
				</SkeletonInfoSection>
			</SkeletonHeader>

			{/* タブ */}
			<div style={{ marginBottom: "24px" }}>
				<div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
					<SkeletonBase $width="100px" $height="32px" />
					<SkeletonBase $width="80px" $height="32px" />
					<SkeletonBase $width="120px" $height="32px" />
				</div>
				<SkeletonBase $width="100%" $height="200px" />
			</div>

			{/* レビューセクション */}
			<div>
				<SkeletonBase
					$width="120px"
					$height="28px"
					style={{ marginBottom: "24px" }}
				/>

				{/* レビューアイテム */}
				{[1, 2, 3].map((i) => (
					<SkeletonReviewItem key={i}>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "8px",
								marginBottom: "12px",
							}}
						>
							<SkeletonBase $width="100px" $height="16px" />
							<SkeletonBase $width="120px" $height="16px" />
						</div>
						<SkeletonBase
							$width="100%"
							$height="16px"
							style={{ marginBottom: "8px" }}
						/>
						<SkeletonBase
							$width="80%"
							$height="16px"
							style={{ marginBottom: "16px" }}
						/>
						<div style={{ display: "flex", gap: "8px" }}>
							<SkeletonBase $width="24px" $height="24px" />
							<SkeletonBase $width="24px" $height="24px" />
							<SkeletonBase $width="24px" $height="24px" />
						</div>
					</SkeletonReviewItem>
				))}
			</div>
		</SkeletonContainer>
	);
};

export const MarketingDashboardSkeleton: React.FC = () => {
	return (
		<SkeletonContainer>
			{/* ヘッダー */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "32px",
				}}
			>
				<SkeletonBase $width="220px" $height="32px" />
				<SkeletonBase $width="120px" $height="40px" />
			</div>

			{/* タブ */}
			<SkeletonTabContainer>
				<SkeletonBase $width="80px" $height="32px" />
				<SkeletonBase $width="160px" $height="32px" />
				<SkeletonBase $width="140px" $height="32px" />
			</SkeletonTabContainer>

			{/* 統計カードグリッド */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
					gap: "24px",
					marginBottom: "32px",
				}}
			>
				{[1, 2, 3, 4].map((i) => (
					<SkeletonCard key={i}>
						<SkeletonBase
							$width="120px"
							$height="16px"
							style={{ marginBottom: "12px" }}
						/>
						<SkeletonBase $width="80px" $height="32px" />
					</SkeletonCard>
				))}
			</div>

			{/* チャート1 */}
			<SkeletonChartContainer>
				<SkeletonBase
					$width="160px"
					$height="24px"
					style={{ marginBottom: "16px" }}
				/>
				<div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
					<SkeletonBase $width="40px" $height="32px" />
					<SkeletonBase $width="40px" $height="32px" />
					<SkeletonBase $width="40px" $height="32px" />
					<div style={{ flex: 1 }} />
					<SkeletonBase $width="60px" $height="32px" />
					<SkeletonBase $width="60px" $height="32px" />
				</div>
				<SkeletonBase $width="100%" $height="300px" />
			</SkeletonChartContainer>

			{/* チャート2 */}
			<SkeletonChartContainer>
				<SkeletonBase
					$width="200px"
					$height="24px"
					style={{ marginBottom: "16px" }}
				/>
				<SkeletonBase $width="100%" $height="300px" />
			</SkeletonChartContainer>

			{/* テーブル */}
			<SkeletonTable>
				<SkeletonBase
					$width="180px"
					$height="24px"
					style={{ marginBottom: "16px" }}
				/>
				{/* テーブルヘッダー */}
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
						gap: "16px",
						marginBottom: "16px",
					}}
				>
					<SkeletonBase $width="100%" $height="16px" />
					<SkeletonBase $width="100%" $height="16px" />
					<SkeletonBase $width="100%" $height="16px" />
					<SkeletonBase $width="100%" $height="16px" />
					<SkeletonBase $width="100%" $height="16px" />
					<SkeletonBase $width="100%" $height="16px" />
				</div>
				{/* テーブル行 */}
				{[1, 2, 3, 4, 5].map((i) => (
					<div
						key={i}
						style={{
							display: "grid",
							gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
							gap: "16px",
							marginBottom: "12px",
						}}
					>
						<SkeletonBase $width="100%" $height="16px" />
						<SkeletonBase $width="100%" $height="16px" />
						<SkeletonBase $width="100%" $height="16px" />
						<SkeletonBase $width="100%" $height="16px" />
						<SkeletonBase $width="100%" $height="16px" />
						<SkeletonBase $width="100%" $height="16px" />
					</div>
				))}
			</SkeletonTable>
		</SkeletonContainer>
	);
};
