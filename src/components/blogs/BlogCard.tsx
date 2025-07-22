import React from "react";
import styled from "styled-components";
import type { BlogCardProps } from "../../types/blog";
import { BlogPlatform } from "../../types/blog";
import { formatDate } from "../../utils/date";

const Card = styled.div`
	width: 350px;
	height: 280px; /* カードの高さを固定 */
	max-width: 100%;
	display: flex;
	flex-direction: column;
	position: relative; /* アイコンの位置の基準にする */

	background: rgba(255, 255, 255, 0.1);
	border-radius: 16px;
	padding: 1.5rem;
	cursor: pointer;
	transition: all 0.3s ease;
	border: 1px solid rgba(255, 255, 255, 0.2);
	backdrop-filter: blur(10px);

	@media (max-width: 768px) {
		width: 280px;
		height: 260px; /* モバイルで縦を少し長く */
		padding: 0.8rem;
	}

	&:hover {
		transform: translateY(-5px);
		background: rgba(255, 255, 255, 0.15);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
	}
`;

const BlogHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 1rem;
	padding-right: 24px; /* アイコンのためのスペースを確保 */
`;

const PlatformBadge = styled.span<{ platform: BlogPlatform }>`
	padding: 0.25rem 0.75rem;
	border-radius: 20px;
	font-size: 0.75rem;
	font-weight: 600;
	color: white;
	background: ${({ platform }) => {
		switch (platform) {
			case BlogPlatform.ZENN:
				return "linear-gradient(135deg, #3EA8FF, #0066CC)";
			case BlogPlatform.QIITA:
				return "linear-gradient(135deg, #55C500, #3A8B00)";
			case BlogPlatform.NOTE:
				return "linear-gradient(135deg, #00B569, #00965B)";
			case BlogPlatform.MEDIUM:
				return "linear-gradient(135deg, #000000, #333333)";
			case BlogPlatform.HATENA:
				return "linear-gradient(135deg, #00A4DE, #0080B3)";
			default:
				return "linear-gradient(135deg, #667eea, #764ba2)";
		}
	}};
`;

const ReadTime = styled.span`
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.7);
	display: flex;
	align-items: center;
	gap: 0.25rem;

	&::before {
		content: "📖";
	}
`;

const AuthorName = styled.span`
	font-size: 0.8rem;
	color: rgba(255, 255, 255, 0.8);
	display: flex;
	align-items: center;
	gap: 0.25rem;
	margin-bottom: 0.5rem;

	&::before {
		content: "👤";
	}
`;

const BlogTitle = styled.h3`
	margin: 0 0 0.75rem 0;
	font-size: 1.1rem;
	font-weight: 600;
	color: white;
	line-height: 1.4;
	display: -webkit-box;
	-webkit-line-clamp: 3; /* モバイル縦長に合わせて3行まで表示 */
	-webkit-box-orient: vertical;
	overflow: hidden;
`;

const BlogDescription = styled.p`
	margin: 0 0 1rem 0;
	font-size: 0.9rem;
	color: rgba(255, 255, 255, 0.8);
	line-height: 1.5;
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
	overflow: hidden;
	flex-grow: 1; /* 可変の高さを吸収する */
`;

const BlogFooter = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
	gap: 1rem;
`;

const TagContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
	flex: 1;
`;

const Tag = styled.span`
	padding: 0.25rem 0.5rem;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 8px;
	font-size: 0.7rem;
	color: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(5px);
`;

const PublishDate = styled.span`
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.6);
	white-space: nowrap;
`;

const ExternalIcon = styled.div`
	position: absolute;
	top: 1rem;
	right: 1rem;
	width: 20px;
	height: 20px;
	opacity: 0.6;
	transition: opacity 0.3s ease;

	${Card}:hover & {
		opacity: 1;
	}

	&::before {
		content: "🔗";
		font-size: 14px;
	}
`;

const CardContainer = styled.div`
	position: relative;
	margin: 1rem; /* カード間のマージンを広めに */

	@media (max-width: 768px) {
		margin: 0.75rem; /* スマホでも広めに */
	}
`;

export const BlogCard: React.FC<BlogCardProps> = ({ blog, onClick }) => {
	const handleClick = () => {
		if (blog.isExternal) {
			window.open(blog.url, "_blank", "noopener,noreferrer");
		}
		onClick?.(blog);
	};

	return (
		<CardContainer>
			<Card onClick={handleClick}>
				{blog.isExternal && <ExternalIcon />}

				<BlogHeader>
					<PlatformBadge platform={blog.platform}>
						{blog.platform}
					</PlatformBadge>
					<ReadTime>{blog.readTime}分</ReadTime>
				</BlogHeader>

				{blog.author && <AuthorName>{blog.author}</AuthorName>}

				<BlogTitle>{blog.title}</BlogTitle>

				<BlogDescription>{blog.description}</BlogDescription>

				<BlogFooter>
					<TagContainer>
						{blog.tags.slice(0, 3).map((tag) => (
							<Tag key={tag}>{tag}</Tag>
						))}
						{blog.tags.length > 3 && (
							<Tag key="more">+{blog.tags.length - 3}</Tag>
						)}
					</TagContainer>

					<PublishDate>{formatDate(blog.publishDate)}</PublishDate>
				</BlogFooter>
			</Card>
		</CardContainer>
	);
};
