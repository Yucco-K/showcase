import { Link } from "react-router-dom";
import styled from "styled-components";
import { FaGithub } from "react-icons/fa";

const FooterContainer = styled.footer`
	background: rgba(20, 26, 42, 0.4);
	backdrop-filter: blur(16px) saturate(150%);
	border-top: 1px solid rgba(255, 255, 255, 0.1);
	padding: 3rem 2rem 1.5rem;
	margin-top: 4rem;
	color: rgba(255, 255, 255, 0.8);
`;

const FooterContent = styled.div`
	max-width: 1200px;
	margin: 0 auto;
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	gap: 3rem;
	margin-bottom: 2rem;

	@media (max-width: 768px) {
		grid-template-columns: 1fr;
		gap: 2rem;
	}
`;

const FooterSection = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1rem;
`;

const FooterTitle = styled.h3`
	color: #ffd700;
	font-size: 1.2rem;
	font-weight: 600;
	margin: 0 0 0.5rem 0;
	letter-spacing: 0.5px;
`;

const FooterText = styled.p`
	margin: 0;
	line-height: 1.6;
	color: rgba(255, 255, 255, 0.7);
	font-size: 0.95rem;
`;

const FooterLink = styled(Link)`
	color: rgba(255, 255, 255, 0.7);
	text-decoration: none;
	font-size: 0.95rem;
	transition: all 0.2s;
	padding: 0.3rem 0;
	width: fit-content;

	&:hover {
		color: #ffd700;
		padding-left: 0.5rem;
	}

	&:focus {
		outline: 2px solid #ffd700;
		outline-offset: 2px;
		color: #ffd700;
		border-radius: 4px;
	}
`;

const ExternalLink = styled.a`
	color: rgba(255, 255, 255, 0.7);
	text-decoration: none;
	font-size: 0.95rem;
	transition: all 0.2s;
	padding: 0.3rem 0;
	width: fit-content;
	display: inline-block;

	&:hover {
		color: #ffd700;
		padding-left: 0.5rem;
	}

	&:focus {
		outline: 2px solid #ffd700;
		outline-offset: 2px;
		color: #ffd700;
		border-radius: 4px;
	}
`;

const SocialLinks = styled.div`
	display: flex;
	gap: 1rem;
	margin-top: 0.5rem;
`;

const SocialIcon = styled.a`
	color: rgba(255, 255, 255, 0.7);
	font-size: 1.5rem;
	transition: all 0.3s;

	&:hover {
		color: #ffd700;
		transform: translateY(-3px);
	}

	&:focus {
		outline: 2px solid #ffd700;
		outline-offset: 4px;
		color: #ffd700;
		border-radius: 4px;
	}
`;

const FooterBottom = styled.div`
	max-width: 1200px;
	margin: 0 auto;
	padding-top: 2rem;
	border-top: 1px solid rgba(255, 255, 255, 0.1);
	text-align: center;
	color: rgba(255, 255, 255, 0.6);
	font-size: 0.9rem;
`;

const TechStack = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
	margin-top: 0.5rem;
`;

const TechBadge = styled.span`
	background: rgba(255, 215, 0, 0.1);
	color: #ffd700;
	padding: 0.3rem 0.8rem;
	border-radius: 12px;
	font-size: 0.85rem;
	font-weight: 500;
	border: 1px solid rgba(255, 215, 0, 0.2);
`;

export default function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<FooterContainer>
			<FooterContent>
				<FooterSection>
					<FooterTitle>App Showcase</FooterTitle>
					<FooterText>
						架空のアプリストアを通じてポートフォリオを紹介するフルスタックWebアプリケーション
					</FooterText>
					<TechStack>
						<TechBadge>React</TechBadge>
						<TechBadge>TypeScript</TechBadge>
						<TechBadge>Supabase</TechBadge>
						<TechBadge>Stripe</TechBadge>
						<TechBadge>AI</TechBadge>
					</TechStack>
				</FooterSection>

				<FooterSection>
					<FooterTitle>クイックリンク</FooterTitle>
					<FooterLink to="/products">製品一覧</FooterLink>
					<FooterLink to="/blog">ブログ</FooterLink>
					<FooterLink to="/portfolio">ポートフォリオ</FooterLink>
					<FooterLink to="/information">インフォメーション</FooterLink>
					<FooterLink to="/contact">お問い合わせ</FooterLink>
				</FooterSection>

				<FooterSection>
					<FooterTitle>リソース</FooterTitle>
					<ExternalLink
						href="https://github.com/Yucco-K/showcase-docs"
						target="_blank"
						rel="noopener noreferrer"
					>
						📚 ドキュメント
					</ExternalLink>
					<ExternalLink
						href="https://github.com/Yucco-K/showcase/blob/main/docs/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC%E3%82%AC%E3%82%A4%E3%83%89_JA.md"
						target="_blank"
						rel="noopener noreferrer"
					>
						📖 ユーザーガイド
					</ExternalLink>
					<ExternalLink
						href="https://github.com/Yucco-K/showcase/blob/main/docs/FAQ.md"
						target="_blank"
						rel="noopener noreferrer"
					>
						❓ FAQ
					</ExternalLink>
					<ExternalLink
						href="https://github.com/Yucco-K/showcase/blob/main/docs/TERMS_OF_SERVICE.md"
						target="_blank"
						rel="noopener noreferrer"
					>
						📜 利用規約
					</ExternalLink>
					<ExternalLink
						href="https://github.com/Yucco-K/showcase/blob/main/docs/PRIVACY_POLICY.md"
						target="_blank"
						rel="noopener noreferrer"
					>
						🔒 プライバシーポリシー
					</ExternalLink>
					<ExternalLink
						href="https://github.com/Yucco-K/showcase/blob/main/docs/%E5%80%8B%E4%BA%BA%E6%83%85%E5%A0%B1%E4%BF%9D%E8%AD%B7%E8%A6%8F%E5%AE%9A_JA.md"
						target="_blank"
						rel="noopener noreferrer"
					>
						🛡️ 個人情報保護規定
					</ExternalLink>
				</FooterSection>

				<FooterSection>
					<FooterTitle>リポジトリ</FooterTitle>
					<FooterText>GitHubでソースコードを公開中</FooterText>
					<SocialLinks>
						<SocialIcon
							href="https://github.com/Yucco-K/showcase"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="GitHub"
						>
							<FaGithub />
						</SocialIcon>
					</SocialLinks>
				</FooterSection>
			</FooterContent>

			<FooterBottom>
				<p>
					© {currentYear} App Showcase. All rights reserved.
					<br />
					Built with ❤️ using React, TypeScript, Supabase & AI
				</p>
			</FooterBottom>
		</FooterContainer>
	);
}
