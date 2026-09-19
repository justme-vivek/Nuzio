import Subscription from '../models/Subscription.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Billing/payments are intentionally excluded from this build.
// This endpoint powers the static Plan & Billing screen.

export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: '₹0',
    period: 'mo',
    tagline: 'Everything you need for your morning habit.',
    features: [
      '5-min and 10-min morning briefs',
      'AI summaries with source attribution',
      '3 narrator voices',
      'Discover + search + saved stories',
      'In-app notifications',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: '₹79',
    period: 'mo',
    badge: 'LAUNCH OFFER',
    tagline: 'Longer, richer briefings and premium controls.',
    features: [
      '15-min deep briefings',
      'Premium narrator voices',
      'Multi-language support (English + Hindi)',
      'Priority generation queue',
      'Full audio controls',
    ],
  },
  pro_annual: {
    id: 'pro_annual',
    name: 'Pro Annual',
    price: '₹1,499',
    period: 'yr',
    tagline: 'All Pro benefits, locked in at launch pricing.',
    features: [
      'Everything in Pro',
      'Offline mode for your commute',
      'Early access to new features',
      '2 months free vs monthly',
    ],
  },
};

// GET /api/v1/subscription
export const getSubscription = asyncHandler(async (req, res) => {
  let sub = await Subscription.findOne({ user: req.user._id });
  if (!sub) sub = await Subscription.create({ user: req.user._id });

  res.json({
    ok: true,
    subscription: {
      plan: sub.plan,
      status: sub.status,
      startDate: sub.startDate,
      billingEnabled: false, // payments excluded for now
      plans: PLANS,
    },
  });
});
