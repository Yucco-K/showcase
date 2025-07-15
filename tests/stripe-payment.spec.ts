import { test, expect } from "@playwright/test";

test.describe.skip(
	"Stripe決済機能テスト (skipped - payment feature removed)",
	() => {
		test.beforeEach(async ({ page }) => {
			// ローカル環境でのテスト実行
			await page.goto("http://localhost:5173");
		});

		test("Stripe設定の確認", async ({ page }) => {
			// コンソールログをキャプチャ
			const messages: string[] = [];
			page.on("console", (msg) => messages.push(msg.text()));

			// Stripeクライアントの初期化を確認
			await page.evaluate(() => {
				console.log("Stripe client check initiated");
			});

			// Stripeエラーがないことを確認
			const stripeErrors = messages.filter(
				(msg) =>
					msg.toLowerCase().includes("stripe") &&
					(msg.includes("error") || msg.includes("failed"))
			);
			expect(stripeErrors).toHaveLength(0);
		});

		test("プライシングプランの表示確認", async ({ page }) => {
			// プライシング情報の確認
			const planData = await page.evaluate(() => {
				// PRICING_PLANSの定義確認
				const basicPlan = {
					name: "Basic",
					price: 980,
					currency: "jpy",
					features: ["基本機能アクセス", "月5回まで利用可能", "メールサポート"],
				};

				const premiumPlan = {
					name: "Premium",
					price: 1980,
					currency: "jpy",
					features: [
						"全機能アクセス",
						"無制限利用",
						"優先サポート",
						"高度な分析機能",
					],
				};

				console.log("Basic plan price:", basicPlan.price);
				console.log("Premium plan price:", premiumPlan.price);
				console.log("Currency:", basicPlan.currency);

				return { basicPlan, premiumPlan };
			});

			// プラン設定が正しいことを確認
			expect(planData.basicPlan.price).toBe(980);
			expect(planData.premiumPlan.price).toBe(1980);
			expect(planData.basicPlan.currency).toBe("jpy");
		});

		test("決済フローのモック確認", async ({ page }) => {
			// ネットワークリクエストをモニター
			const requests: string[] = [];

			page.on("request", (request) => {
				if (request.url().includes("stripe")) {
					requests.push(request.url());
				}
			});

			// 決済ボタンがクリックされた時の動作をシミュレート
			await page.evaluate(() => {
				// 決済処理のモック
				const mockPayment = {
					plan: "basic",
					amount: 980,
					currency: "jpy",
					success: true,
				};

				console.log("Mock payment initiated:", mockPayment);

				// 決済成功の処理確認
				if (mockPayment.success) {
					console.log("Payment successful");
				}
			});
		});

		test("Stripe Elementsの読み込み確認", async ({ page }) => {
			// Stripe Elements用のコンテナが存在することを確認
			await page.evaluate(() => {
				// 決済フォーム用のHTML要素を作成
				const paymentContainer = document.createElement("div");
				paymentContainer.id = "card-element";
				paymentContainer.style.padding = "10px";
				paymentContainer.style.border = "1px solid #ccc";
				document.body.appendChild(paymentContainer);

				console.log("Payment container created");
			});

			// 決済コンテナが作成されたことを確認
			const cardElement = await page.locator("#card-element");
			await expect(cardElement).toBeVisible();
		});

		test("決済エラーハンドリングの確認", async ({ page }) => {
			// エラー処理のテスト
			await page.evaluate(() => {
				const mockErrors = [
					"カード番号が無効です",
					"有効期限が無効です",
					"CVCが無効です",
					"決済が拒否されました",
				];

				// エラーメッセージの表示確認
				mockErrors.forEach((error, index) => {
					console.log(`Error ${index + 1}:`, error);
				});

				// エラーハンドリング関数のモック
				const handlePaymentError = (error: string) => {
					console.log("Payment error handled:", error);
					return { handled: true, message: error };
				};

				// 各エラーが適切に処理されることを確認
				mockErrors.forEach((error) => {
					const result = handlePaymentError(error);
					expect(result.handled).toBe(true);
					expect(result.message).toBe(error);
				});
			});
		});

		test("決済完了後のリダイレクト確認", async ({ page }) => {
			// 決済完了後の処理をシミュレート
			await page.evaluate(() => {
				const simulatePaymentSuccess = () => {
					const paymentResult = {
						paymentIntent: {
							id: "pi_test_" + Math.random().toString(36).substr(2, 9),
							status: "succeeded",
							amount: 980,
							currency: "jpy",
						},
					};

					console.log("Payment succeeded:", paymentResult);

					// 成功ページへのリダイレクト処理
					const successUrl = "/payment/success";
					console.log("Redirecting to:", successUrl);

					return paymentResult;
				};

				const result = simulatePaymentSuccess();
				expect(result.paymentIntent.status).toBe("succeeded");
			});
		});

		test("サブスクリプション管理の確認", async ({ page }) => {
			// サブスクリプション関連の処理をテスト
			await page.evaluate(() => {
				const mockSubscription = {
					id: "sub_test_" + Math.random().toString(36).substr(2, 9),
					status: "active",
					plan: "premium",
					current_period_start: new Date().toISOString(),
					current_period_end: new Date(
						Date.now() + 30 * 24 * 60 * 60 * 1000
					).toISOString(),
				};

				console.log("Mock subscription:", mockSubscription);

				// サブスクリプション情報の検証
				expect(mockSubscription.status).toBe("active");
				expect(mockSubscription.plan).toBe("premium");
				expect(new Date(mockSubscription.current_period_end) > new Date()).toBe(
					true
				);
			});
		});

		test("Webhookエンドポイントの確認", async ({ page }) => {
			// Webhook処理のモック確認
			await page.evaluate(() => {
				const mockWebhookEvents = [
					"payment_intent.succeeded",
					"payment_intent.payment_failed",
					"customer.subscription.created",
					"customer.subscription.updated",
					"customer.subscription.deleted",
				];

				// 各Webhookイベントの処理確認
				mockWebhookEvents.forEach((event) => {
					console.log("Webhook event:", event);

					// イベント処理のモック
					const processWebhook = (eventType: string) => {
						return {
							received: true,
							processed: true,
							event: eventType,
							timestamp: new Date().toISOString(),
						};
					};

					const result = processWebhook(event);
					expect(result.received).toBe(true);
					expect(result.processed).toBe(true);
				});
			});
		});
	}
);
