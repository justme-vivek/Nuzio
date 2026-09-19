import { useQuery } from '@tanstack/react-query';
import { BadgeCheck } from 'lucide-react';
import { getSubscription } from '../../services/user.api.js';
import { useToast } from '../../components/ui/Toast.jsx';

const CARDS = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    period: '/mo',
    tagline: 'Everything you need for your morning habit.',
    features: ['Morning briefs (5/10 min)', 'AI summaries with sources', '3 narrator voices', 'Discover, search & saved stories'],
    cta: 'Current plan',
    current: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹79',
    period: '/mo',
    badge: 'LAUNCH OFFER',
    tagline: 'Longer, richer briefings and premium controls.',
    features: ['15-min deep briefings', 'Premium narrator voices', 'Multi-language (English + Hindi)', 'Priority generation queue'],
    cta: 'Upgrade to Pro',
    highlight: true,
  },
  {
    id: 'pro_annual',
    name: 'Pro Annual',
    price: '₹1,499',
    period: '/yr',
    tagline: 'All Pro benefits, locked in at launch pricing.',
    features: ['Everything in Pro', 'Offline mode for commutes', 'Early access to features', '2 months free vs monthly'],
    cta: 'Choose Annual',
  },
];

export default function Billing() {
  const { toast } = useToast();
  const { data } = useQuery({ queryKey: ['subscription'], queryFn: getSubscription });

  const currentPlan = data?.plan || 'free';

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">
          Plan <span className="serif-accent text-primary">& billing</span>
        </h1>
        <p className="mt-1 text-sm text-muted">Start free. Upgrade when mornings pay for themselves.</p>
      </div>

      <div className="space-y-4">
        {CARDS.map((c) => (
          <div
            key={c.id}
            className={`rounded-3xl border p-5 ${
              c.highlight
                ? 'border-mint/50 bg-gradient-to-b from-mint/10 to-card shadow-[0_0_40px_rgba(52,211,153,0.12)]'
                : 'border-line bg-card'
            }`}
          >
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-lg font-bold">{c.name}</h2>
              {c.id === currentPlan && (
                <span className="flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent">
                  <BadgeCheck size={10} /> Active
                </span>
              )}
              {c.badge && (
                <span className="rounded-full border border-mint/40 bg-mint/10 px-2 py-0.5 font-mono text-[9px] tracking-wider text-mint">
                  {c.badge}
                </span>
              )}
            </div>
            <p className="mb-3">
              <span className="text-3xl font-extrabold">{c.price}</span>
              <span className="text-sm text-muted">{c.period}</span>
            </p>
            <p className="text-xs text-muted">{c.tagline}</p>
            <ul className="mt-3 space-y-1.5">
              {c.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-ink/90">
                  <span className="text-accent">✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={c.current || c.id === currentPlan}
              onClick={() => toast('Payments are coming soon — Pro is not available in this build yet.')}
              className={`tap mt-4 w-full rounded-full py-3 text-sm font-semibold transition-all ${
                c.current || c.id === currentPlan
                  ? 'cursor-not-allowed border border-line bg-card2 text-muted'
                  : c.highlight
                    ? 'bg-gradient-to-r from-accent to-mint text-[#052e2b]'
                    : 'border border-primary/50 bg-primary/10 text-primary'
              }`}
            >
              {c.current || c.id === currentPlan ? 'Current plan' : `${c.cta} · coming soon`}
            </button>
          </div>
        ))}
      </div>

      <p className="pb-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        · Billing & payments excluded in this build ·
      </p>
    </div>
  );
}
