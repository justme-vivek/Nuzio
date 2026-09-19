import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import StepHeader from '../../components/StepHeader/StepHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import { TIME_SLOTS } from '../../constants/onboarding.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../components/ui/Toast.jsx';
import { apiErrorMessage } from '../../services/api.js';

export default function BriefingTime() {
  const navigate = useNavigate();
  const { preferences, patchPreferences } = useAuth();
  const { toast } = useToast();
  const [selected, setSelected] = useState(preferences?.briefingTime || '07:00');
  const [saving, setSaving] = useState(false);

  const timezone = (() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    } catch {
      return 'Asia/Kolkata';
    }
  })();

  const display = TIME_SLOTS.find((t) => t.value === selected);
  const ap = display?.ap || 'AM';

  const onContinue = async () => {
    setSaving(true);
    try {
      await patchPreferences({ briefingTime: selected, timezone });
      navigate('/notifications');
    } catch (err) {
      toast(apiErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 pb-32 pt-7">
      <StepHeader step={3} total={5} />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-10">
        <h1 className="text-3xl font-bold leading-tight">
          When do you <span className="serif-accent text-primary">want your brief?</span>
        </h1>
        <p className="mt-2 text-sm text-muted">Nuzio will have your brief ready and waiting each morning.</p>

        <div className="mt-7 flex justify-center gap-2">
          {['AM', 'PM'].map((x) => (
            <button
              key={x}
              type="button"
              onClick={() => {
                const slot = TIME_SLOTS.find((t) => t.value === selected);
                const opposite = TIME_SLOTS.filter((t) => t.ap === x);
                setSelected((opposite.find((t) => t.label === slot?.label) || opposite[Math.floor(opposite.length / 2)]).value);
              }}
              className={`w-28 rounded-full border py-2.5 text-sm font-semibold transition-all ${
                ap === x ? 'border-primary bg-primary text-white shadow-glow-sm' : 'border-line bg-card text-muted'
              }`}
            >
              {x}
            </button>
          ))}
        </div>

        <div className="mt-4 max-h-64 overflow-y-auto no-scrollbar rounded-2xl border border-line bg-card p-2">
          {TIME_SLOTS.map((t) => {
            const isSel = t.value === selected;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setSelected(t.value)}
                className={`tap flex w-full items-center justify-center rounded-xl py-2 font-mono text-sm transition-all ${
                  isSel ? 'bg-primary/20 font-semibold text-ink' : 'text-muted hover:text-ink'
                }`}
              >
                {t.label}
                <span className={`ml-1 text-[10px] ${isSel ? 'text-primary' : 'text-muted'}`}>{t.ap}</span>
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-center font-mono text-[10px] text-muted">· TIMEZONE: {timezone}</p>
      </motion.div>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md px-6 pb-8">
        <Button full size="lg" loading={saving} onClick={onContinue}>
          Continue →
        </Button>
      </div>
    </div>
  );
}
