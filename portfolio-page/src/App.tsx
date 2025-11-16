import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ExternalLink, Code, Database, Zap, Users, MessageSquare, ShoppingCart, BarChart3, Search, Package, FileText, Mail, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';

// Mock image data structure
interface ImageData {
  src: string;
  title: string;
  description: string;
}

// Image groups with actual file paths
const imageGroups = {
  frontend: [
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 15.49.02.png', title: 'トップページ', description: '魅力的なヒーローセクションとナビゲーション' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 15.49.16.png', title: 'お問い合わせページ', description: 'カテゴリ別問い合わせフォーム' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 15.49.49.png', title: 'FAQ・よくある質問', description: 'カテゴリ別質問セレクタ' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 15.50.19.png', title: 'お問い合わせフォーム詳細', description: '詳細な入力フォーム' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 15.50.37.png', title: 'お問い合わせ返信', description: '会話形式の問い合わせビュー' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 15.51.27.png', title: 'トップページ（ログイン後）', description: 'ユーザーアバター表示' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 15.52.19.png', title: 'ログインモーダル', description: '美しいログインUI' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 15.52.27.png', title: 'マイページ', description: 'プロフィール・パスワード変更' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 15.53.00.png', title: 'プロダクト一覧', description: '検索・フィルタ・並び替え機能付き' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 15.53.34.png', title: 'プロダクト詳細ページ', description: 'アプリ詳細情報と価格表示' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 15.53.42.png', title: 'レコメンデーション', description: '関連アプリの提案機能' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 15.53.59.png', title: 'レビューセクション', description: 'ユーザーレビューと評価表示' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 15.54.08.png', title: 'レビュー詳細ページ', description: '詳細なレビュー表示' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 15.54.25.png', title: 'レビュー投稿フォーム', description: '星評価とコメント入力' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 15.55.45.png', title: 'ブログページ', description: '記事カードのグリッドレイアウト' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 15.55.52.png', title: 'マイページ - いいね一覧', description: 'お気に入りアプリの管理' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 15.56.00.png', title: 'マイページ - 購入済みアプリ', description: 'ユーザーの購入履歴' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 15.56.08.png', title: 'マイページ - お問い合わせ履歴', description: '問い合わせスレッド一覧' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 15.56.27.png', title: 'マイページ - プロフィール編集', description: 'ユーザー情報管理' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 15.56.39.png', title: 'お知らせページ', description: '重要なお知らせの一覧' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 15.56.47.png', title: 'お知らせ詳細', description: 'リッチコンテンツ表示' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 15.57.03.png', title: 'ブログ記事詳細', description: 'Markdown形式の記事表示' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 16.09.01.png', title: 'プロダクト検索', description: 'リアルタイム検索機能' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 16.09.14.png', title: 'プロダクトフィルタ', description: 'カテゴリ・価格帯フィルタ' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 16.09.50.png', title: 'レビューフィルタ', description: '評価・カテゴリ別フィルタリング' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 17.45.04.png', title: 'チャットボット統合', description: 'AIアシスタントによるサポート' },
  ],
  mypage: [
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 15.56.00.png', title: '購入したアプリ', description: 'ユーザーの購入履歴一覧' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 15.56.27.png', title: 'プロフィール編集', description: 'ユーザー情報とパスワード管理' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 15.55.52.png', title: 'いいね＆お気に入り', description: 'お気に入りアプリの管理' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 15.56.08.png', title: 'お問い合わせ履歴', description: '問い合わせスレッド一覧' },
    { src: '/showcase/screenshots/frontend/スクリーンショット 2025-11-16 15.52.27.png', title: 'セキュリティ設定', description: 'パスワードとメールアドレス変更' },
  ],
  adminInfo: [
    { src: '/showcase/screenshots/admin/info/スクリーンショット 2025-11-16 16.10.16.png', title: 'お知らせ編集', description: 'リッチテキストエディタ搭載' },
    { src: '/showcase/screenshots/admin/info/スクリーンショット 2025-11-16 16.10.24.png', title: 'お知らせ詳細表示', description: '公開されたお知らせページ' },
  ],
  adminProducts: [
    { src: '/showcase/screenshots/admin/product-edit-form.png', title: '商品編集フォーム', description: '商品情報の詳細編集' },
    { src: '/showcase/screenshots/admin/products/スクリーンショット 2025-11-16 16.10.37.png', title: '商品管理一覧', description: '全商品の編集・削除・検索' },
    { src: '/showcase/screenshots/admin/products/スクリーンショット 2025-11-16 16.10.45.png', title: '新規商品作成', description: '商品情報の詳細入力フォーム' },
    { src: '/showcase/screenshots/admin/products/スクリーンショット 2025-11-16 16.11.06.png', title: '商品詳細管理', description: '商品ステータス・特徴管理' },
  ],
  adminBlog: [
    { src: '/showcase/screenshots/admin/blog/スクリーンショット 2025-11-16 16.11.14.png', title: 'ブログ管理一覧', description: '記事のステータス管理' },
    { src: '/showcase/screenshots/admin/blog/スクリーンショット 2025-11-16 16.11.26.png', title: 'ブログ編集（プレビュー）', description: 'リアルタイムプレビュー機能' },
    { src: '/showcase/screenshots/admin/blog/スクリーンショット 2025-11-16 16.11.34.png', title: 'ブログ編集', description: 'Markdownエディタ' },
  ],
  adminContact: [
    { src: '/showcase/screenshots/admin/contact/スクリーンショット 2025-11-16 16.11.44.png', title: 'お問い合わせ管理', description: 'ステータス別フィルタリング' },
    { src: '/showcase/screenshots/admin/contact/スクリーンショット 2025-11-16 16.12.04.png', title: 'お問い合わせ返信フォーム', description: 'ステータス変更と返信' },
    { src: '/showcase/screenshots/admin/contact/スクリーンショット 2025-11-16 16.12.12.png', title: 'お問い合わせスレッド', description: '会話形式の履歴表示' },
    { src: '/showcase/screenshots/admin/contact/スクリーンショット 2025-11-16 16.12.23.png', title: 'お問い合わせ詳細（上部）', description: '問い合わせ内容の確認' },
    { src: '/showcase/screenshots/admin/contact/スクリーンショット 2025-11-16 16.13.18.png', title: 'お問い合わせ詳細（中部）', description: '会話スレッド表示' },
    { src: '/showcase/screenshots/admin/contact/スクリーンショット 2025-11-16 16.13.28.png', title: 'お問い合わせ詳細（続き）', description: '返信履歴の詳細' },
    { src: '/showcase/screenshots/admin/contact/スクリーンショット 2025-11-16 16.13.40.png', title: 'お問い合わせ詳細（続き2）', description: '会話フロー全体' },
    { src: '/showcase/screenshots/admin/contact/スクリーンショット 2025-11-16 16.13.51.png', title: 'お問い合わせ詳細（下部）', description: '返信入力エリア' },
  ],
  adminMarketing: [
    { src: '/showcase/screenshots/admin/marketing/スクリーンショット 2025-11-16 16.14.07.png', title: 'マーケティングダッシュボード', description: '売上・訪問者数などのKPI' },
    { src: '/showcase/screenshots/admin/marketing/スクリーンショット 2025-11-16 16.14.18.png', title: 'レコメンデーション分析', description: 'クリック率と関連性の可視化' },
    { src: '/showcase/screenshots/admin/marketing/スクリーンショット 2025-11-16 16.14.36.png', title: 'パフォーマンス指標', description: '詳細な分析データ' },
  ],
  chatbot: [
    { src: '/showcase/screenshots/chatbot/スクリーンショット 2025-11-16 16.27.09.png', title: 'チャットボット - 初期表示', description: 'ウェルカムメッセージ' },
    { src: '/showcase/screenshots/chatbot/スクリーンショット 2025-11-16 16.27.18.png', title: 'チャットボット - FAQ', description: 'よくある質問への自動応答' },
    { src: '/showcase/screenshots/chatbot/スクリーンショット 2025-11-16 16.27.58.png', title: 'チャットボット - 商品推薦', description: 'AIによる商品推薦カード' },
    { src: '/showcase/screenshots/chatbot/スクリーンショット 2025-11-16 16.28.08.png', title: 'チャットボット - 推薦詳細', description: '商品説明と価格情報' },
    { src: '/showcase/screenshots/chatbot/スクリーンショット 2025-11-16 16.28.19.png', title: 'チャットボット - 会話継続', description: '自然な対話の流れ' },
    { src: '/showcase/screenshots/chatbot/スクリーンショット 2025-11-16 16.28.27.png', title: 'チャットボット - 詳細案内', description: 'ポートフォリオショーケース案内' },
  ],
};

function ImageCarousel({ images, onImageClick }: { images: ImageData[]; onImageClick: (index: number) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const nextImage = () => {
    setIsLoaded(false);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setIsLoaded(false);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative">
      {/* Carousel */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            onClick={() => onImageClick(currentIndex)}
            className="cursor-pointer"
          >
            <img
              src={images[currentIndex].src}
              alt={images[currentIndex].title}
              loading="lazy"
              onLoad={() => setIsLoaded(true)}
              className="w-full h-auto object-cover"
              style={{ maxHeight: '600px' }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
              <h3 className="text-xl mb-1">{images[currentIndex].title}</h3>
              <p className="text-sm text-gray-200">{images[currentIndex].description}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <button
          onClick={prevImage}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
          aria-label="前の画像"
        >
          <ChevronLeft className="w-6 h-6 text-purple-600" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
          aria-label="次の画像"
        >
          <ChevronRight className="w-6 h-6 text-purple-600" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'
              }`}
              aria-label={`画像 ${idx + 1} へ移動`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Lightbox({ images, initialIndex, onClose }: { images: ImageData[]; initialIndex: number; onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoaded, setIsLoaded] = useState(false);

  const nextImage = () => {
    setIsLoaded(false);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setIsLoaded(false);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-purple-400 transition-colors z-10"
        aria-label="閉じる"
      >
        <X className="w-8 h-8" />
      </button>

      <div className="max-w-7xl w-full" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
          >
            <img
              src={images[currentIndex].src}
              alt={images[currentIndex].title}
              loading="lazy"
              onLoad={() => setIsLoaded(true)}
              className="w-full h-auto rounded-2xl shadow-2xl"
              style={{ maxHeight: '85vh', objectFit: 'contain' }}
            />
            <div className="mt-4 text-center text-white">
              <h3 className="text-2xl mb-2">{images[currentIndex].title}</h3>
              <p className="text-gray-300">{images[currentIndex].description}</p>
              <p className="text-sm text-gray-400 mt-2">
                {currentIndex + 1} / {images.length}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white/20 p-4 rounded-full transition-all"
          aria-label="前の画像"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm hover:bg-white/20 p-4 rounded-full transition-all"
          aria-label="次の画像"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [lightboxImages, setLightboxImages] = useState<ImageData[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (images: ImageData[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxImages(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-6 py-2">
              <Star className="w-4 h-4 mr-2 inline-block" />
              Portfolio Showcase Project
            </Badge>
            <h1 className="text-5xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
              App Showcase
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto">
              ひらめきを形にする道具箱。使って楽しい、役立つがそろう。
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-6">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50 shadow-xl" asChild>
                <a href="https://showcase-yucco.vercel.app/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  デモを見る
                </a>
              </Button>
              <Button size="lg" className="bg-white/10 backdrop-blur-sm text-white border-2 border-white hover:bg-white hover:text-purple-600 transition-all shadow-xl" asChild>
                <a href="https://github.com/Yucco-K/showcase" target="_blank" rel="noopener noreferrer">
                  <Code className="w-5 h-5 mr-2" />
                  GitHub Repository
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-purple-50 to-transparent"></div>
      </section>

      {/* Overview Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <Card className="border-2 border-purple-200 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-3xl text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                📱 プロジェクト概要
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg text-gray-700 leading-relaxed">
                「App Showcase」は、架空のアプリストアを通じてポートフォリオを紹介する<strong>フルスタックWebアプリケーション</strong>です。
                ECサイトのようなUI/UXを持ちながら、ユーザー管理、レビューシステム、AIチャットボット、マーケティング分析ダッシュボードなど、
                <strong>実務で求められる多彩な機能</strong>を実装しています。
              </p>
              <div className="grid md:grid-cols-2 gap-4 pt-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                  <ShoppingCart className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-purple-900 mb-1">フロントエンド</h4>
                    <p className="text-sm text-gray-600">検索・フィルタ・レビュー・チャットボット統合</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                  <Settings className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-blue-900 mb-1">管理画面</h4>
                    <p className="text-sm text-gray-600">商品・ブログ・お問い合わせ・マーケティング管理</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200">
                  <Users className="w-6 h-6 text-pink-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-pink-900 mb-1">マイページ</h4>
                    <p className="text-sm text-gray-600">購入履歴・お気に入り・プロフィール管理</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                  <MessageSquare className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-green-900 mb-1">AI機能</h4>
                    <p className="text-sm text-gray-600">チャットボットによる商品推薦・FAQ対応</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            ✨ 主な機能
          </h2>
          <Accordion type="multiple" className="max-w-4xl mx-auto space-y-4">
            <AccordionItem value="item-1" className="border-2 border-purple-200 rounded-xl px-6 bg-white/80 backdrop-blur-sm shadow-lg">
              <AccordionTrigger className="hover:text-purple-600">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold">商品検索・フィルタリング・並び替え</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                カテゴリ、価格帯、評価、特徴タグなどの多軸フィルタリングに対応。リアルタイム検索でスムーズなUXを実現しています。
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-2 border-blue-200 rounded-xl px-6 bg-white/80 backdrop-blur-sm shadow-lg">
              <AccordionTrigger className="hover:text-blue-600">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">レビューシステム</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                ユーザーはレビューを投稿・編集・削除可能。管理者は返信やステータス管理ができ、会話形式のUIでスレッド表示にも対応しています。
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-2 border-pink-200 rounded-xl px-6 bg-white/80 backdrop-blur-sm shadow-lg">
              <AccordionTrigger className="hover:text-pink-600">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-pink-600" />
                  <span className="font-semibold">AIチャットボット統合</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                FAQ対応、商品推薦、最安値案内など、定型カード応答と自由会話を組み合わせたインテリジェントなサポート機能を提供します。
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border-2 border-green-200 rounded-xl px-6 bg-white/80 backdrop-blur-sm shadow-lg">
              <AccordionTrigger className="hover:text-green-600">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">レコメンデーションエンジン (Gorse)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                「一緒に購入される組み合わせ」「似たアプリ」など、Gorseを使った協調フィルタリングによるレコメンデーション機能を実装。クリック率の追跡も可能です。
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border-2 border-purple-200 rounded-xl px-6 bg-white/80 backdrop-blur-sm shadow-lg">
              <AccordionTrigger className="hover:text-purple-600">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold">マーケティングダッシュボード</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                売上・訪問者数・コンバージョン率・レコメンデーションのパフォーマンスなどをビジュアライズ。データドリブンな意思決定をサポートします。
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border-2 border-blue-200 rounded-xl px-6 bg-white/80 backdrop-blur-sm shadow-lg">
              <AccordionTrigger className="hover:text-blue-600">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">ユーザー認証・マイページ</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                Supabase Authによるログイン・会員登録、購入履歴、お気に入り管理、プロフィール編集、パスワード変更など、ユーザー体験に必要な機能を完備しています。
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="border-2 border-pink-200 rounded-xl px-6 bg-white/80 backdrop-blur-sm shadow-lg">
              <AccordionTrigger className="hover:text-pink-600">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-pink-600" />
                  <span className="font-semibold">商品・ブログ・お知らせ管理</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                管理者は商品情報、ブログ記事、お知らせをリッチテキストエディタで作成・編集・削除可能。カテゴリ・タグ・ステータス管理も充実しています。
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="border-2 border-green-200 rounded-xl px-6 bg-white/80 backdrop-blur-sm shadow-lg">
              <AccordionTrigger className="hover:text-green-600">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">お問い合わせ管理システム</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-700">
                ユーザーからの問い合わせをステータス別に管理。会話形式のスレッド表示で、履歴を追いながらスムーズに対応できます。
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>
      </section>

      {/* Screenshots Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            🖼️ スクリーンショット
          </h2>
          <Tabs defaultValue="frontend" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-lg mb-8">
              <TabsTrigger value="frontend" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-xl">
                <ShoppingCart className="w-4 h-4 mr-2" />
                フロントエンド
              </TabsTrigger>
              <TabsTrigger value="mypage" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl">
                <Users className="w-4 h-4 mr-2" />
                マイページ
              </TabsTrigger>
              <TabsTrigger value="admin" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-xl">
                <Settings className="w-4 h-4 mr-2" />
                管理画面
              </TabsTrigger>
              <TabsTrigger value="chatbot" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-xl">
                <MessageSquare className="w-4 h-4 mr-2" />
                チャットボット
              </TabsTrigger>
            </TabsList>

            <TabsContent value="frontend">
              <Card className="border-2 border-purple-200 shadow-2xl bg-white/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-900">
                    <ShoppingCart className="w-6 h-6" />
                    フロントエンド（公開ページ）
                  </CardTitle>
                  <CardDescription>
                    検索・フィルタ・商品詳細・レビュー・ブログ・お問い合わせなど、ユーザー向けの全機能
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageCarousel images={imageGroups.frontend} onImageClick={(index) => openLightbox(imageGroups.frontend, index)} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mypage">
              <Card className="border-2 border-pink-200 shadow-2xl bg-white/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-pink-900">
                    <Users className="w-6 h-6" />
                    マイページ
                  </CardTitle>
                  <CardDescription>
                    購入履歴・お気に入り・プロフィール編集・問い合わせ履歴などの個人管理機能
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageCarousel images={imageGroups.mypage} onImageClick={(index) => openLightbox(imageGroups.mypage, index)} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admin">
              <div className="space-y-8">
                <Card className="border-2 border-blue-200 shadow-2xl bg-white/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-900">
                      <Package className="w-6 h-6" />
                      商品管理
                    </CardTitle>
                    <CardDescription>商品の作成・編集・削除・検索機能</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ImageCarousel images={imageGroups.adminProducts} onImageClick={(index) => openLightbox(imageGroups.adminProducts, index)} />
                  </CardContent>
                </Card>

                <Card className="border-2 border-purple-200 shadow-2xl bg-white/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-900">
                      <FileText className="w-6 h-6" />
                      ブログ管理
                    </CardTitle>
                    <CardDescription>ブログ記事の作成・編集・ステータス管理</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ImageCarousel images={imageGroups.adminBlog} onImageClick={(index) => openLightbox(imageGroups.adminBlog, index)} />
                  </CardContent>
                </Card>

                <Card className="border-2 border-pink-200 shadow-2xl bg-white/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-pink-900">
                      <FileText className="w-6 h-6" />
                      お知らせ管理
                    </CardTitle>
                    <CardDescription>リッチテキストエディタでお知らせを作成</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ImageCarousel images={imageGroups.adminInfo} onImageClick={(index) => openLightbox(imageGroups.adminInfo, index)} />
                  </CardContent>
                </Card>

                <Card className="border-2 border-orange-200 shadow-2xl bg-white/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-900">
                      <Mail className="w-6 h-6" />
                      お問い合わせ管理
                    </CardTitle>
                    <CardDescription>ステータス別フィルタリング・スレッド表示・返信機能</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ImageCarousel images={imageGroups.adminContact} onImageClick={(index) => openLightbox(imageGroups.adminContact, index)} />
                  </CardContent>
                </Card>

                <Card className="border-2 border-cyan-200 shadow-2xl bg-white/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-cyan-900">
                      <BarChart3 className="w-6 h-6" />
                      マーケティングダッシュボード
                    </CardTitle>
                    <CardDescription>売上・訪問者数・コンバージョン率・レコメンデーション分析などのKPI可視化</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ImageCarousel images={imageGroups.adminMarketing} onImageClick={(index) => openLightbox(imageGroups.adminMarketing, index)} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="chatbot">
              <Card className="border-2 border-green-200 shadow-2xl bg-white/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-900">
                    <MessageSquare className="w-6 h-6" />
                    AIチャットボット機能
                  </CardTitle>
                  <CardDescription>
                    FAQ対応・商品推薦・ポートフォリオ案内などのインテリジェントサポート
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageCarousel images={imageGroups.chatbot} onImageClick={(index) => openLightbox(imageGroups.chatbot, index)} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </section>

      {/* Tech Stack Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            🛠️ 技術スタック
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-shadow bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Code className="w-6 h-6" />
                  フロントエンド
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="secondary" className="mr-2">React 19</Badge>
                <Badge variant="secondary" className="mr-2">Vite</Badge>
                <Badge variant="secondary" className="mr-2">TypeScript</Badge>
                <Badge variant="secondary" className="mr-2">Styled Components</Badge>
                <Badge variant="secondary" className="mr-2">Framer Motion</Badge>
                <Badge variant="secondary" className="mr-2">Mantine UI</Badge>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-shadow bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Database className="w-6 h-6" />
                  バックエンド
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="secondary" className="mr-2">Supabase</Badge>
                <Badge variant="secondary" className="mr-2">PostgreSQL</Badge>
                <Badge variant="secondary" className="mr-2">FastAPI (Python)</Badge>
                <Badge variant="secondary" className="mr-2">Supabase Auth</Badge>
                <Badge variant="secondary" className="mr-2">Supabase Storage</Badge>
              </CardContent>
            </Card>

            <Card className="border-2 border-pink-200 shadow-xl hover:shadow-2xl transition-shadow bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-pink-900">
                  <MessageSquare className="w-6 h-6" />
                  AI / 外部サービス
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="secondary" className="mr-2">OpenAI GPT-4o-mini</Badge>
                <Badge variant="secondary" className="mr-2">LangChain</Badge>
                <Badge variant="secondary" className="mr-2">pgvector</Badge>
                <Badge variant="secondary" className="mr-2">Gorse</Badge>
                <Badge variant="secondary" className="mr-2">Stripe</Badge>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 shadow-xl hover:shadow-2xl transition-shadow bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <Zap className="w-6 h-6" />
                  開発・デプロイ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="secondary" className="mr-2">Vercel</Badge>
                <Badge variant="secondary" className="mr-2">GitHub Actions</Badge>
                <Badge variant="secondary" className="mr-2">Docker</Badge>
                <Badge variant="secondary" className="mr-2">Playwright</Badge>
                <Badge variant="secondary" className="mr-2">ESLint</Badge>
                <Badge variant="secondary" className="mr-2">Cursor AI</Badge>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-900 via-blue-900 to-purple-900 text-white py-12">
        <div className="container mx-auto px-4 text-center space-y-4">
          <h3 className="text-2xl font-bold">App Showcase</h3>
          <p className="text-purple-200">Portfolio Showcase Project - 2025</p>
          <div className="flex justify-center gap-4">
            <Button className="bg-white/10 backdrop-blur-sm text-white border-2 border-white hover:bg-white hover:text-purple-600 transition-all" asChild>
              <a href="https://showcase-yucco.vercel.app/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Live Demo
              </a>
            </Button>
            <Button className="bg-white/10 backdrop-blur-sm text-white border-2 border-white hover:bg-white hover:text-purple-600 transition-all" asChild>
              <a href="https://github.com/Yucco-K/showcase" target="_blank" rel="noopener noreferrer">
                <Code className="w-4 h-4 mr-2" />
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </footer>

      {/* Lightbox */}
      {lightboxImages && (
        <Lightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={closeLightbox}
        />
      )}
    </div>
  );
}
