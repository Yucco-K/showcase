--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('a2471462-9461-48dd-ad52-a5b9318ae0bc', 'AppBuzz Hive', 'ニュースフィードとコメント機能付き情報収集アプリ', 'AppBuzz Hive は、ニュースや記事をカテゴリ別にまとめ、コメント・お気に入り機能付きで自分だけの情報ハブにできます。', 32000, 'business', NULL, '{ニュース,コメント,お気に入り}', true, false, 3, 3, 1, '2025-07-22 12:47:22.995444+00', '2025-07-24 14:52:11.878025+00', '2025-07-22', '{コメント,お気に入り,通知}', '{ウェブ連携}');
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('36f65661-3a74-47df-b4f3-6d5a22b54e17', 'MyRecipeNote', 'オリジナルレシピを簡単に整理・共有', '「MyRecipeNote」は、お気に入りの料理レシピを登録し、写真付きで保存・共有できるアプリです。食材ごとのタグ付けや、調理時間・難易度などの管理も可能。家族や友人にリンクでシェアすることもできます。MyRecipeNote は、お気に入りの料理レシピを写真付きで簡単に登録・整理・共有できる、あなただけのデジタルレシピ帳アプリです。

📚 オリジナルレシピの一元管理
材料、手順、調理時間、難易度などを記録し、写真とともにレシピを一覧で管理できます。紙のレシピやバラバラのメモを整理し、いつでもサクッと参照できるようになるので、料理の準備がスムーズに。

🏷 食材タグ＆カテゴリ分類
「野菜」「魚」「簡単レシピ」「時短」など、自分好みのタグやカテゴリを自由に設定。検索やフィルターで目的のレシピをすぐ見つけられます。

⏱ 調理時間・難易度の記録・フィルタ
5分以内のサク饭レシピや、20分以上じっくり調理が必要なメニューなど、時間別・難易度別のフィルタリングが可能。献立に迷うことなく、シーンに合わせた料理選びができます。

📸 写真付き保存で視覚的に管理
スマホで撮った料理写真をそのまま貼り付け。完成イメージや参考写真を見返すことで、調理のモチベーションもアップ！

🌐 リンクで簡単共有
レシピをURLで生成し、家族や友人に共有可能。メールやSNSに送るだけで、みんなのキッチンにあなたのレシピが届きます。

📱 デバイス間の同期＆今後の拡張予定
スマホ、タブレット、PCなど複数デバイス間で同期対応予定。
また次のような便利機能の追加も検討しています：

Webサイトやブログからのレシピクリップ

スケーリング対応（分量の自動調整）

買い物リストの自動生成

OCRによる紙レシピの取り込み

📊 グラフ表示で振り返りも簡単
登録数やタグ別のカテゴリ比率、調理時間別のレシピ分布などをグラフで可視化。自分のレシピ傾向を振り返り、次のお買い物や料理アイデアに活用できます。

—
毎日の献立決めに悩むあなたも、家族にレシピを伝えたいあなたも、MyRecipeNote は“あなたのキッチンの整理整頓パートナー”です。使えば使うほど、あなたらしい料理のスタイルが見えてくる、そんなレベルアップ型レシピアプリを目指しています。', 500, 'レシピ・生活', '', '{料理,写真,タグ}', true, true, 2, 18, 5, '2025-07-22 11:48:33.034+00', '2025-07-22 16:03:32.507614+00', '2025-07-22', '{写真付き登録,材料タグ付け,レシピ共有機能}', '{会員登録が必要,ブラウザ環境推奨}');
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('12b2111a-f717-4414-adf8-e045d7b9e2cc', 'SnazzySync Apps', '写真やファイルのクラウド同期アプリ', 'SnazzySync Apps は、スマホとPC間で指定フォルダの写真や書類を自動でクラウド同期し、バージョン管理と履歴確認も可能です。', 24000, 'productivity', NULL, '{クラウド,同期,写真}', false, true, 1, 19, 7, '2025-07-22 12:47:22.995444+00', '2025-07-22 16:03:32.507614+00', '2025-07-22', '{自動同期,バージョン管理,履歴}', '{APIキー必要}');
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('23382510-1131-4ab1-a0d4-af94efc9188c', 'CollabPlanner', '複数人で予定を立てられるプロジェクト型カレンダー', '飲み会・旅行・チーム作業など、複数人で予定を調整・共有するためのカレンダーアプリ。タスク割り振り、コメント機能、リマインダー送信などを備え、プロジェクト計画をスムーズに進行可能です。GroupCal Planner（仮称）は、飲み会・旅行・チーム作業など、多人数での予定調整をスムーズに行えるカレンダー型ツールです。

📅 共有カレンダー + タスク分担
チームメンバーが参加するイベント（飲み会、ミーティング、旅行計画など）をカレンダーに追加。参加者ごとに「誰が何を担当するか」をタスクとして割り当てることで、役割分担が明確になります。

💬 コメント・チャット機能付き
各予定にコメントを残せるので、日時調整や詳細情報のやり取りがその予定内で完結。外部ツールに頼らず円滑なコミュニケーションが可能です—Asana や Wrike のようなコメント機能がその場に融合された設計です 
Wrike
+12
Reddit
+12
Lifewire
+12
。

🔔 リマインダー＆通知
イベントの作成やタスクの割当とともに、自動でリマインダーが送信。期限や開催日の直前にプッシュ通知で知らせ、うっかり忘れを防ぎます。Google Calendar や Outlook のような履歴共有とリマインド設計を取り入れています 
Zapier
Wrike
。

🗓 色分けカレンダー＆ビュー切替
飲み会、仕事、旅行、個人予定などを色分けで視覚的に区別。日・週・月表示を直感的に切り替えられ、一覧性もバッチリです。

🔄 リアルタイム同期＆アクセス管理
スマホ・PC間でデータは即時同期。編集権限や閲覧権限をメンバー別に設定し、業務系でもプライベート向けでも安心して使えます 
Google Workspace
。

📊 イベント進捗ダッシュボード
タスクの達成率、未着手／進行中の予定数などをグラフ化し、プロジェクトやイベントの進行状況を見える化。チームでの進行管理も一目瞭然です。

🌐 外部カレンダーとの連携にも対応
Google Calendar, Outlook, Apple Calendar など主要サービスとのインポート／エクスポート対応により、既存のスケジュールともスムーズに統合できます 
Google Workspace
Zapier
。

—
小さなグループからチーム規模まで、GroupCal Planner は全員の予定をまとめて管理し、役割分担・進捗共有まで可能にする、次世代共有カレンダーです。', 1200, 'チーム・スケジュール', '', '{予定,カレンダー,共有}', true, false, 4, 8, 3, '2025-07-22 11:48:33.034+00', '2025-07-22 16:03:32.507614+00', '2025-07-22', '{招待機能,カレンダー共有,リマインダー付き}', '{メールアドレス登録必須}');
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('4087a2e4-0652-43b5-a6e0-01238b4ca740', 'AppJive Junction', '音楽プレイリスト作成＆共有アプリ', 'AppJive Junction は、自分だけの音楽プレイリストを作成し、URLで友人にシェア。ジャンルタグやお気に入り管理で音楽の楽しみを広げます。', 39000, 'entertainment', NULL, '{音楽,プレイリスト,共有}', true, true, 3, 18, 7, '2025-07-22 12:47:22.995444+00', '2025-07-22 16:03:32.507614+00', '2025-07-22', '{共有リンク,ジャンル分類,お気に入り}', '{ミュージックAPI連携}');
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('f731b595-0825-4c62-9cf0-66a8cda744ee', 'ByteBound', 'コードスニペットを管理・共有できるプログラマー向けアプリ', 'ByteBound は、よく使うコードスニペットを分類・保存し、チームと共有・検索・タグ管理ができる開発支援ツールです。', 5000, 'productivity', NULL, '{コード,スニペット,タグ}', true, true, 2, 13, 3, '2025-07-22 12:47:22.995444+00', '2025-07-22 16:03:32.507614+00', '2025-07-22', '{タグ管理,共有,検索}', '{Git連携}');
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('49f86325-2e78-4013-8a35-6ef9f59c7a39', 'Pixel Pulse Nexus', '健康データと活動量をグラフ管理するヘルスケアアプリ', 'Pixel Pulse Nexus は、歩数・心拍・体重・睡眠をまとめて記録し、傾向グラフで日々の健康を可視化します。', 22000, 'health', NULL, '{健康,歩数,心拍}', false, true, 3, 25, 6, '2025-07-22 12:47:22.995444+00', '2025-07-22 16:03:32.507614+00', '2025-07-22', '{グラフ表示,歩数追跡,心拍記録}', '{フィットネス機器連携}');
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('325fd6d7-ab34-4952-bf64-f846609a859b', 'AppThrive', 'マインドフル記録と日記機能を持つウェルネスアプリ', 'AppThrive は、毎日の気分・感謝・成果を日記形式で記録し、月間モチベーションチャートや通知による振り返りをサポートします。', 9000, 'health', NULL, '{日記,気分,記録}', false, true, 3, 12, 5, '2025-07-22 12:47:22.995444+00', '2025-07-22 16:03:32.507614+00', '2025-07-22', '{モチベーションチャート,通知,日記形式}', '{通知許可}');
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('9b1df0b9-0ae1-4116-a058-43edd370aeac', 'Study Planner', '科目ごとの勉強時間を管理する学習プランナー', 'Study Planner は、試験勉強や日々の学習を計画的に進めたい人向けのタイムトラッカーアプリです。自分の学習スタイルに合わせて記録・管理ができ、毎日の勉強習慣を「見える化」しながら、無理なくモチベーションを維持します。

⏱ カスタマイズ可能な勉強タイマー：Pomodoro（25分集中＋5分休憩）など、集中スタイルに合わせてセッションを設定可能。集中と休憩を繰り返し、効率的な学習リズムを促します。

📅 学習スケジュール管理：日別・週別にタスクを計画。試験日や提出期限を登録すると、自動でリマインド。学習の過不足を防ぎ、計画通りに実行できます。

📊 学習進捗ダッシュボード：累計学習時間、科目別の時間配分、日ごとの達成状況などをグラフで可視化。「自分はどれだけがんばったか」がひと目でわかります。

🎯 目標設定と達成感：科目やテーマごとに「〇時間到達」「○回セッション完了」といった目標を設定し、小さな達成を積み重ねつつ続けられる設計。ステータスや進捗丸ごと視覚化でモチベーションアップ！

🔔 通知＆リマインダー機能：学習開始や休憩終了のタイミングをプッシュ通知でお知らせ。リズムを崩さず、習慣化をサポートします。

☁️ クラウド同期（将来対応）：スマホ・タブレット・PC間でデータ共有できる設計。どこでも記録でき、学習状況をいつでも確認可能です。

わかりやすく直感的なUIで、「学習の中断」「気づいたら動画三昧…」といった自己流リズムの乱れも防ぎ、毎日の勉強をポジティブに定着させます。試験対策・資格学習・語学勉強・読書記録など、あらゆる学びに寄り添う“あなただけの学習コーチ”です。', 59500, 'education', 'https://ljjptkfrdeiktywbbybr.supabase.co/storage/v1/object/public/eye-catching//sample9.png', '{学習,タイムトラッキング}', false, true, 1, 13, 6, '2025-07-15 15:04:28.809083+00', '2025-07-22 15:57:08.165623+00', '2025-07-16', NULL, '{テスト}');
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('529ee0ff-6769-4005-98bf-1b0666192c9a', 'Prism Pulse', 'ゲーム進行管理と通知機能を持つゲーマー向けタイマーアプリ', 'Prism Pulse は、ゲームプレイタイムを管理し、プレイ時間に応じた休憩リマインダーを送信します。タイトル・スクリーンショット記録も可能で、ゲームライフを健康的にサポート。', 15000, 'entertainment', NULL, '{ゲーム,管理,タイマー}', false, true, 1, 12, 4, '2025-07-22 12:47:22.995444+00', '2025-07-22 16:01:07.737806+00', '2025-07-22', '{休憩通知,スクリーンショット記録}', '{通知許可}');
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('f28a54d2-3c72-4727-8207-36048861863a', 'Zen Breath', 'マインドフルネスと呼吸法をサポートするリラクゼーションアプリ', 'Zen Breath は、短時間の呼吸エクササイズと瞑想セッションをガイドし、日々のストレス軽減と集中力向上を支援します。セッション履歴、リマインダー、音声ガイダンス付き。', 7000, 'health', NULL, '{瞑想,呼吸,ストレスケア}', false, true, 1, 22, 6, '2025-07-22 12:47:22.995444+00', '2025-07-22 16:03:32.507614+00', '2025-07-22', '{タイマー,音声ガイド,リマインダー}', '{ヘッドホン推奨}');
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('b22f8af8-0699-45e3-94ff-c79b200ddd8a', 'Wealth Weave', '収入・支出の分析ができる個人向け家計簿アプリ', 'Wealth Weave は、収入・支出を入力すると自動でグラフ化され、カテゴリー分析・月ごとのトレンド比較が可能。目標設定＆節約達成通知も搭載。', 10000, 'productivity', NULL, '{家計簿,収支,分析}', true, true, 1, 10, 2, '2025-07-22 12:47:22.995444+00', '2025-07-22 16:03:32.507614+00', '2025-07-22', '{グラフ表示,節約目標,通知}', '{カレンダー連携}');
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('8f0ffaa8-0af2-4fdf-bc90-dd10613a75f9', 'Health Tracker', '体重・睡眠・食事を記録して健康管理', 'Health Tracker は、毎日の体重・睡眠時間・食事内容をシンプルに記録し、健康の“見える化”を叶えるヘルスケアアプリです。

一目でわかるグラフ表示：体重の推移、睡眠時間の変化、食事バランスを日・週・月単位で見やすく可視化。健康状態の傾向をすぐつかめます。

簡単な入力操作：体重、就寝・起床時刻、食事メモをタップ操作で直感的に入力。レシートやメニュー名入力にも対応予定で、入力の手間を軽減。

目標設定＆達成チェック：目標体重や睡眠時間の目安を設定し、記録と連動した進捗ダッシュボードで「達成感」を実感できます。

リマインダー機能：毎日の記録を忘れがちなタイミングにプッシュ通知でお知らせ。継続を促して健康習慣をしっかり定着。

クラウド同期（将来的な対応）：スマホやタブレット間で記録を自動的に同期。どの端末でも最新の健康データにすぐアクセスできます。

安心のプライバシー設計：すべての健康データは端末内に暗号化保存。安心して使える設計です。

さらに、体重・睡眠・食事という基本的な記録に加え、将来は水分摂取や歩数、心拍数などの拡張も検討中。「Apple Health」や「Samsung Health」のようなトラッキングアプリに触発された設計で、健康管理を一元化します 
note.com
。

毎日のちょっとした記録が、暮らしの質を大きく変える。Health Tracker は、ひとりひとりの健康習慣を応援し、無理なく続けられる“あなた専用の健康パートナー”です。', 72000, 'health', 'https://ljjptkfrdeiktywbbybr.supabase.co/storage/v1/object/public/eye-catching//sample12.png', '{健康,ヘルスケア}', true, false, 4, 38, 12, '2025-07-15 15:04:28.809083+00', '2025-07-22 16:03:32.507614+00', '2025-07-22', NULL, NULL);
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('13ea5a9c-0400-4102-8e2c-4bcc07210aab', 'Nova Nexus', 'データ同期とノート共有ができるクラウドノートアプリ', 'Nova Nexus は、リアルタイム同期・テンプレート共有機能付きのクラウドノート。Markdown・チェックリスト対応で柔軟に使えます。', 18000, 'productivity', NULL, '{ノート,同期,Markdown}', true, false, 2, 15, 4, '2025-07-22 12:47:22.995444+00', '2025-07-22 16:03:32.507614+00', '2025-07-22', '{Markdown,テンプレ共有,同期}', '{クラウド登録}');
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('ea7117af-fb8e-4547-be46-5b3bd8dac06e', 'AppSpark Safari', '旅行プランの作成と共有ができる旅行管理アプリ', 'AppSpark Safari は、旅行の日程・交通・宿泊をまとめたプランを作成し、地図連携・友人共有ができる旅行計画アプリです。', 54000, 'entertainment', NULL, '{旅行,プラン,共有}', true, false, 2, 8, 2, '2025-07-22 12:47:22.995444+00', '2025-07-22 16:03:32.507614+00', '2025-07-22', '{地図連携,プラン共有,日程リマインダー}', '{位置情報許可}');
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('79867535-da68-4d94-ae27-1807d0581da0', 'Inventory Lite', '小規模店舗向けの在庫管理アプリ', 'Inventory Lite は、小さなショップや個人事業主向けに設計された、シンプル＆直感的な在庫管理 Web アプリです。スマホ・PC・タブレットなどどのデバイスからでもアクセス可能で、手軽に在庫数の登録・更新・確認ができます。

リアルタイム在庫トラッキング：入庫・出庫履歴を即時反映。現在の在庫数が常に正確に把握でき、過不足を未然に防ぎます 
MSP Mobility
+4
Apple
+4
Apple
+4
。

カテゴリー／タグ管理：商品をカテゴリやタグで整理し、必要なものをすぐに検索・確認できます 
Apple
。

しきい値アラート機能：在庫が指定数以下になると通知でお知らせ。欠品による販売機会の損失を防ぎます 
Google Play
+14
Apple
+14
MSP Mobility
+14
。

グラフ・レポート生成：在庫の増減や回転率などを視覚化し、売れ筋アイテムや発注タイミングの判断に役立ちます 
Apple
ナショナルファンディング
。

バーコード／QRコード対応（将来予定）：スマホカメラやスキャナーで読み取って登録・出庫処理が可能に。作業時間を大幅に短縮します 
MSP Mobility
+2
ahg.com
+2
ナショナルファンディング
+2
。

エクスポート機能：CSV や Excel 形式で在庫データを出力し、会計ソフトや分析ツールへ簡単に連携できます 
Apple
。

ユーザーフレンドリーな UI：専門知識は不要。直感的な操作で、導入や日々の登録がスムーズに行えます 
MSP Mobility
ナショナルファンディング
。', 91000, 'business', 'https://ljjptkfrdeiktywbbybr.supabase.co/storage/v1/object/public/eye-catching//sample11.png', '{在庫,ビジネス}', false, false, 3, 24, 8, '2025-07-15 15:04:28.809083+00', '2025-07-22 16:03:32.507614+00', '2025-07-16', NULL, '{テスト456}');
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('0addbe4f-d02d-403b-a350-9093152f2930', 'Mind Craft', '習慣化をサポートする習慣トラッカーアプリ', 'Mind Craft は、習慣を日次・週次で記録し、継続率・達成率グラフ表示。通知でリマインドし、美しいUIで毎日の習慣をサポートします。', 15000, 'productivity', NULL, '{習慣,記録,通知}', false, true, 3, 3, 1, '2025-07-22 12:47:22.995444+00', '2025-07-24 07:39:59.336236+00', '2025-07-22', '{リマインダー,継続率表示,通知履歴}', '{通知許可}');
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('71338039-c74f-49a1-be87-3f6f318bd0c8', 'Thrive Track', 'セルフケアを助ける習慣記録アプリ', 'Thrive Track は、瞑想・運動・睡眠の習慣を記録し、週間レポートや達成バッジでセルフケアを楽しみながら続けられるアプリです。', 27000, 'health', NULL, '{習慣,セルフケア,レポート}', false, true, 0, 21, 6, '2025-07-22 12:47:22.995444+00', '2025-07-22 16:01:07.737806+00', '2025-07-22', '{週間レポート,バッジ,通知}', '{通知許可}');
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('6a054dbe-51db-43fb-9bc8-8ab83c3f69f2', 'IdeaLog', 'ひらめきを逃さず記録・整理できるノートアプリ', 'IdeaLog は、ビジネスアイデア、ブログのネタ、企画の構想など、あらゆるひらめきを逃さずキャッチし、自由に育てられるノート管理アプリです。

🎯 カテゴリ・タグで整理
アイデアを「仕事」「学習」「ライフスタイル」などカテゴリに分類し、さらに「マーケティング」「旅行」「レシピ」など自由にタグ付け。後からでも簡単に検索・フィルタでき、思い立った瞬間にメモした感覚のまま振り返りやすく整理できます。

🗓 日付順・重要度でソート可能
「いつ書いた？」「今必要なアイデアは？」といったニーズに合わせ、時系列や優先度で並び替え。俯瞰しながら、優先すべき構想に集中できます。

🤖 AIによるタイトル生成
なんとなくの思考やメモからでも、ボタンひとつで数秒以内にキャッチ―で整ったタイトル案を複数提案。ブログ記事、プレゼン、企画書の一歩目をサポートします。これは、AI見出し生成ツールと同様の仕組みを応用した機能です 
canva.com
semrush.com
。

📊 メモの可視化ダッシュボード
アイデアの数、カテゴリごとの構成、月別／週別の蓄積数などを棒グラフ・円グラフで可視化し、自分の思考スタイルや偏りを「見える化」。蓄積の傾向がひと目で把握できます。

🔔 リマインド機能
後で見返したいメモには「あとでチェック」フラグを付けてリマインダーを設定可能。思い出したいタイミングで通知され、大切なアイデアを逃しません。

📋 直感的で軽快なUI
ミニマルな入力画面、サクサクした操作性、高速検索。起動・記録・編集がスムーズに行え、思考フローを邪魔しません。

☁️ クラウド同期＆将来の拡張へ対応予定
複数デバイス間でのデータ同期や、AIによる要約・カテゴリー提案、自動タグ付けなど、より高度な整理・分析機能も今後順次対応予定です。', 1500, 'productivity', NULL, '{アイデア,メモ,分類}', false, true, 1, 11, 4, '2025-07-22 11:48:33.034+00', '2025-07-22 16:03:32.507614+00', '2025-07-22', '{AI提案,タグ分類,メモ検索}', '{特になし（無料プランあり）}');
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('bf7e12f6-9ab9-4754-8694-769ccc4320e6', 'Runner Tribe', 'ランニング記録とコミュニティ機能付きランニングアプリ', 'Runner Tribe は、ランニング距離・ペース・コースを地図上に記録し、他のユーザーと成果をシェアできるコミュニティ機能付きランナー向けアプリです。', 26000, 'health', NULL, '{ランニング,コミュニティ,記録}', true, true, 2, 4, 2, '2025-07-22 12:47:22.995444+00', '2025-07-22 16:03:32.507614+00', '2025-07-22', '{距離追跡,SNS共有,コースマップ表示}', '{位置情報許可}');
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('058087df-ec45-403f-9ae9-8a3c2cb5c9c1', 'Lift Atlas', 'フィットネス記録とワークアウトガイドのアプリ', 'Lift Atlas は、筋トレや有酸素運動の記録と、部位別トレーニングプランの作成ができるフィットネスアプリです。セット数・休憩時間の自動記録、目標達成率のグラフ化、共有機能も搭載。', 26000, 'health', NULL, '{運動,記録,プラン}', true, false, 1, 12, 4, '2025-07-22 12:47:22.995444+00', '2025-07-22 15:57:08.165623+00', '2025-07-22', '{セット数記録,休憩タイマー,プラン共有}', '{アカウント登録必須}');
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('37f11358-a507-4225-b3b8-906694167942', 'Household Budgeter', '収入と支出をシンプルに記録出来る家計簿アプリ', '「Household Budgeter」は、家計管理をシンプルかつスマートに行える家計簿アプリです。
毎日の収入・支出を直感的に記録でき、カテゴリー別にグラフやカレンダーで視覚化。予算設定や目標管理も可能で、「貯蓄したい」「浪費を抑えたい」といった目的に合わせたプランニングをサポートします。
銀行口座やクレジットカードとの自動連携（将来的な対応）や、レシート撮影による記録入力省力化にも対応予定。
データは端末内に安全に暗号化保存。月次や年次のレポートで家計の傾向を把握でき、節約・貯蓄・支出見直しが自然と習慣に。軽やかなUIで、家族との共有も視野に入れた設計です。', 48700, 'productivity', 'https://ljjptkfrdeiktywbbybr.supabase.co/storage/v1/object/public/eye-catching//sample8.png', '{家計簿,ファイナンス}', true, true, 2, 37, 11, '2025-07-22 06:07:50.134092+00', '2025-07-22 16:03:32.507614+00', '2025-07-22', '{test1,test2,test3}', NULL);
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('82e16aa5-4f0e-4ed4-b37b-2371bae67a21', 'TapTrack', '習慣トラッカー＆リマインダーアプリ', 'TapTrack は、毎日の習慣をタップで記録し、達成率グラフ・バッジ獲得機能でやる気を支えます。', 20000, 'productivity', NULL, '{習慣,トラッカー,バッジ}', true, false, 1, 12, 4, '2025-07-22 12:47:22.995444+00', '2025-07-22 16:03:32.507614+00', '2025-07-22', '{ステータスバッジ,達成率グラフ,通知}', '{通知許可}');
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('4fc7c824-22ab-465b-b6d4-8f56597ab5d2', 'ReformMemo', '自宅の修繕・リフォーム履歴を簡単記録', '壁紙の張り替え、水回りの修理、外構工事など、自宅にまつわる工事・修繕の履歴を時系列で残せるアプリ。費用・業者・写真付きの記録や、次回点検のリマインダーも可能。HomeFix Journal（仮称）は、壁紙の張り替えや水回りの修理、外構工事など、自宅のあらゆる工事・修繕を時系列で記録＆管理できる住宅管理アプリです。

🏡 写真付きメンテナンスログ
施工前・施工後の写真をアップロードし、いつどんな工事を行ったかを視覚的に一元管理。これまでの修繕履歴がひと目でわかり、後々の保証や資産評価に役立ちます。

💰 費用＆業者情報の記録
工事ごとに発生した費用や業者名、発注内容、領収書・保証書などの書類も添付可能。毎月・年間の支出額も自動集計され、家計やリフォーム費用の分析に活用できます。

📅 次回点検リマインダー
防水や外壁メンテの定期点検、設備の交換目安日など、リマインダー設定で管理。「いつやったっけ？」を防ぎ、将来的な劣化・トラブルに備えられます。

📊 履歴・傾向の可視化
時系列での費用推移や工事件数、カテゴリー別保存一覧がグラフやリストで確認可能。大規模修理の傾向や次の資金計画にも役立ちます。

🔍 検索＆フィルター機能
「外壁」「キッチン」「浴室」などカテゴリー別で絞り込み、必要な項目だけをすぐに呼び出せます。工事履歴や担当業者の確認もスムーズです。

☁️ クラウド同期＆バックアップ対応
データは安全にクラウドに保存され、複数のデバイスからアクセス可能。万一のスマホ紛失時も安心です。

🔧 専門業者との連携も容易に
将来的には、依頼履歴や見積依頼の送信、業者選定の参考になるプロ情報とリンクする機能を導入予定です。

—
📂 家をメンテナンスする人にとって、過去の履歴は財産でもあります。「どこをいつ直したか」「次に何をすべきか」がすぐに分かる、自宅のメンテナンス記録アプリとして役立ちます。', 1000, '住宅・記録', '', '{修繕,住宅,リフォーム}', true, false, 2, 17, 5, '2025-07-22 11:48:33.034+00', '2025-07-22 16:03:32.507614+00', '2025-07-22', '{写真保存,コスト管理,リマインダー機能}', '{会員登録必須}');
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('700cf9b3-3079-47bd-92c8-2ad767d85283', 'EliteEdge Labs', 'プロジェクト進捗とタスクを可視化するチーム管理アプリ', 'EliteEdge Labs は、プロジェクトごとのタスク進行状況・担当者・期限を管理でき、カンバンビュー・ダッシュボードが使いやすい仕様です。', 23000, 'productivity', NULL, '{タスク,進捗,チーム}', true, true, 0, 14, 5, '2025-07-22 12:47:22.995444+00', '2025-07-22 16:01:07.737806+00', '2025-07-22', '{カンバン,ダッシュボード,共有}', '{アカウント登録}');
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('7050e32a-f699-4954-90bd-8a0d98f58419', 'Simple TODO', '最小限の機能でサクッと使える TODO アプリ', 'Simple TODO は、「タスクの追加・完了・削除」だけに徹底的にこだわった、究極のシンプル TODO アプリです。無駄な機能を削ぎ落とし、必要な操作はワンタップ—直感的に使えて、思考の邪魔をしません。

✅ 即時記録：アプリ起動後すぐにタスクを追加。文字入力後に「Enter」または「＋ボタン」を押すだけでリストに反映され、時間をムダにしません。

✅ ワンタップ完了：タスク名をタップすることで、完了済みにスッと切り替わり、チェックや取り消し線で視覚的にもすっきり整理できます。

✅ スワイプで削除：不要になったタスクは横スワイプで一瞬で削除。アニメーションで達成感も得られます。

✅ 邪魔しないデザイン：リストは白背景に黒文字、アイコンや装飾ゼロ。まるで紙のメモ帳のように自然体で使えるUIです。

✅ 高速起動＆軽快動作：超軽量構造で、さっと開いてさっと閉じられる。日常の隙間時間にサクサク使えて、タスク管理が習慣になります。

✅ 通知やリマインドはあえて非搭載：時間に縛られず、自分のペースでやる。やりたいことを書き出し、こなすだけ。その潔さこそがこのアプリの美学です。', 33000, 'productivity', 'https://ljjptkfrdeiktywbbybr.supabase.co/storage/v1/object/public/eye-catching//sample7.png', '{タスク,TODO}', false, true, 4, 6, 2, '2025-07-15 15:04:28.809083+00', '2025-07-22 16:03:32.507614+00', '2025-07-16', '{テスト}', NULL);
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('24710e6f-dc52-432b-b180-4aa9a26b66cf', 'PetLog', 'ペットの体調・通院・食事を一元管理', 'ワンちゃん・ネコちゃんなどのペットの健康記録をまとめて管理できるアプリ。通院歴、ワクチン接種、食事・体重の記録などを写真付きで保存できます。複数匹の登録も対応し、家族で共有することも可能。PetLog は、愛犬・愛猫をはじめとした複数のペットに対応する、使いやすい健康・ケア記録アプリです。
📅 通院履歴・ワクチン接種を記録
獣医師による診察日、予防接種、投薬、検査結果などの健康履歴を日付とともに記録。履歴はタイムラインで確認でき、ペットの健康状態を漏れなく把握できます。

🐾 体重・食事・生活習慣のトラッキング
毎日の体重や食事内容、排泄・散歩などの記録も簡単。食事の量や種類の変化から、体調の微妙なサインにも気づけます。体重変化はグラフ表示で「今どのタイミングか」が一目でわかります。

📸 写真付きメモでより豊かな記録
診察証明、薬の画像、成長の記録など、写真を添えて保存。文字情報だけでは伝わりにくい内容も、視覚的に振り返ることが可能です。11petsなど同様に視覚的に記録するスタイルを採用しています 
Pickles Vets
。

🔔 複数匹／家族での共有も簡単
複数ペットのプロフィールをまとめて管理でき、家族やペットシッターとデータを共有できます。ペットごとにリマインダーや記録担当を割り当てて、ケアの協力体制が整います。複数ペットの健康管理ニーズに対応した設計です 
Cprime
。

🗓 リマインダー機能で重要イベントを見逃さない
次回のワクチン接種や定期健康診断、投薬時期などを通知設定可能。忘れやすいケア予定をしっかりフォローし、大切なペットの健康維持を支えます。

📊 健康データの可視化・傾向把握
体重の推移、通院回数、食事頻度などをグラフで表示。異常値やトレンドを早めに察知でき、獣医師への相談時の資料にも活用できます。

☁️ 将来的なクラウド同期・連携対応予定
データのバックアップ・同期や、スマート首輪等のウェアラブル機器との連携（体重計測や活動量などの自動取得）、予約管理機能の拡充など、さらなる拡張も視野に設計されています。', 980, 'ペット・健康', '', '{ペット,記録,健康}', false, true, 1, 14, 4, '2025-07-22 11:48:33.034+00', '2025-07-22 16:03:32.507614+00', '2025-07-22', '{通院記録,写真付き成長記録,家族共有機能}', '{ペット登録が必要}');
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('67fd65ed-d14e-4840-904f-7376c457604b', 'AppNest', 'ウェブリンクを整理・共有できるブックマークアプリ', 'AppNest は、お気に入りのウェブ記事や動画をカテゴリー・タグ付きで保存し、リスト共有やコメント機能で情報収集を効率化します。', 5000, 'entertainment', NULL, '{リンク,整理,共有}', true, true, 0, 18, 6, '2025-07-22 12:47:22.995444+00', '2025-07-22 16:00:00.936926+00', '2025-07-22', '{コメント,タグ分類,共有}', '{アカウント登録}');
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('c853bf3b-6ff9-4696-89d9-291c7b4c03f8', 'AppWave Revue', '映画レビュー記録＆評価アプリ', 'AppWave Revue は、観た映画の感想と評価を記録し、ジャンル・お気に入りタグで整理。レビューリストの共有機能付きで、映画好き同志の交流も可能です。', 13000, 'entertainment', NULL, '{映画,レビュー,評価}', false, true, 2, 22, 7, '2025-07-22 12:47:22.995444+00', '2025-07-22 16:01:07.737806+00', '2025-07-22', '{評価記録,ジャンル分類,共有}', '{SNS連携}');
INSERT INTO public.products (id, name, description, long_desc, price, category, image_url, tags, is_featured, is_popular, likes, stars_total, stars_count, created_at, updated_at, last_updated, features, requirements) VALUES ('f5ca9558-439a-4909-86d1-c5ce04f78ac4', 'Prosper Path', '節約と投資記録をサポートするパーソナルファイナンスアプリ', 'Prosper Path は、貯蓄・投資の目標を立て、収支を入力すると自動的に目標達成率と資産推移のグラフを生成します。', 30000, 'business', NULL, '{貯蓄,投資,グラフ}', false, true, 1, 36, 12, '2025-07-22 12:47:22.995444+00', '2025-07-22 16:01:07.737806+00', '2025-07-22', '{資産グラフ,目標設定,通知}', '{金融API連携}');


--
-- PostgreSQL database dump complete
--

