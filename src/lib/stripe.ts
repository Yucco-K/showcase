import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  throw new Error('Missing env.VITE_STRIPE_PUBLISHABLE_KEY');
}

export const stripePromise = loadStripe(stripePublishableKey);

export const PRICING_PLANS = {
  basic: {
    name: 'Basic',
    price: 980,
    currency: 'jpy',
    features: ['基本機能アクセス', '月5回まで利用可能', 'メールサポート'],
  },
  premium: {
    name: 'Premium', 
    price: 1980,
    currency: 'jpy',
    features: ['全機能アクセス', '無制限利用', '優先サポート', '高度な分析機能'],
  },
} as const;

export type PricingPlan = keyof typeof PRICING_PLANS;
