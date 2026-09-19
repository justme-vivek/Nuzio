import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import NuzioLogo from '../../components/NuzioLogo/NuzioLogo.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import { NOTIFICATION_TYPES, formatTime12 } from '../../constants/onboarding.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../components/ui/Toast.jsx';

export default function Notifications() {
  const navigate = useNavigate();
  const { preferences, patchPreferences } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const timeLabel = formatTime12(preferences?.briefingTime || '07:00');

  const savePrefs = async (payload) => {
    setSaving(true);
    try {
      await patchPreferences({ notifications: payload });
      navigate('/all-set');
    } catch (err) {
      toast(err?.response?.data?.error || 'Could not save notification preferences', 'error');
      navigate('/all-set');
    } finally {
      setSaving(false);
    }
  };

  const onAllow = async () => {
    let enabled = true;
    try {
      if ('Notification' in window && Notification.permission !== 'granted') {
        const res = await Notification.requestPermission();
        enabled = res === 'granted';
      } else if ('Notification' in window) {
        enabled = Notification.permission === 'granted';
      }
    } catch {
      enabled = true; // browser may not support; still store prefs
    }
    if (enabled && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('Nuzio AI', { body: 'You are set. Your morning brief will be ready on time.' });
      } catch {
        // ignore
      }
    }
    await savePrefs({ morningBrief: true, breakingStory: true, weeklyDigest: false });
  };

  const onNotNow = () => savePrefs({ morningBrief: true, breakingStory: false, weeklyDigest: false });

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 pb-32 pt-7">
      <div className="flex items-center justify-between">
        <NuzioLogo size="sm" />
        <button type="button" onClick={onNotNow} className="font-mono text-[11px] tracking-[0.2em] text-muted">
          SKIP →
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-10">
        <h1 className="text-3xl font-bold leading-tight">
          Stay in <span className="serif-accent text-primary">the loop.</span>
        </h1>
        <p className="mt-2 text-sm text-muted">Turn on notifications so you never miss your brief.</p>

        <Card className="mt-7 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Bell size={17} />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold">Nuzio</p>
              <p className="font-mono text-[10px] text-muted">NOW</p>
            </div>
          </div>
          <p className="mt-3 text-sm font-medium">Your morning brief is ready</p>
          <p className="text-xs text-muted">6 stories · AI & Tech, Markets, Startups · Voice: Aria · 15:00</p>
        </Card>

        <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">· What you'll receive</p>
        <div className="mt-3 space-y-2.5">
          {NOTIFICATION_TYPES.map((n) => (
            <div key={n.id} className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3.5">
              <span className="text-lg">{n.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted">{n.message}</p>
              </div>
              <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[9px] text-muted">{n.badge}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md space-y-2.5 px-6 pb-8">
        <Button full size="lg" loading={saving} onClick={onAllow}>
          Allow notifications
        </Button>
        <Button full variant="ghost" onClick={onNotNow}>
          Not now
        </Button>
      </div>
    </div>
  );
}
