import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import StepHeader from '../../components/StepHeader/StepHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import { PROFESSIONS } from '../../constants/onboarding.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../components/ui/Toast.jsx';
import { apiErrorMessage } from '../../services/api.js';

export default function Profession() {
  const navigate = useNavigate();
  const { preferences, patchPreferences } = useAuth();
  const { toast } = useToast();
  const [selected, setSelected] = useState(preferences?.profession || '');
  const [saving, setSaving] = useState(false);

  const onContinue = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await patchPreferences({ profession: selected });
      navigate('/interests');
    } catch (err) {
      toast(apiErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 pb-32 pt-7">
      <StepHeader step={0} total={5} />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-10">
        <h1 className="text-3xl font-bold leading-tight">
          What's your <span className="serif-accent text-primary">profession?</span>
        </h1>
        <p className="mt-2 text-sm text-muted">We'll tune every brief to what actually moves your day.</p>

        <div className="mt-8 grid grid-cols-2 gap-2.5">
          {PROFESSIONS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected(p.id)}
              className={`tap flex items-center gap-2 rounded-2xl border px-3.5 py-3 text-left text-[13px] font-medium transition-all ${
                selected === p.id
                  ? 'border-primary bg-primary/15 text-ink shadow-glow-sm'
                  : 'border-line bg-card text-muted hover:border-primary/40 hover:text-ink'
              }`}
            >
              <span className="text-base">{p.icon}</span>
              <span className="flex-1">{p.label}</span>
              {selected === p.id && <span className="text-accent">✓</span>}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md px-6 pb-8">
        <Button full size="lg" disabled={!selected} loading={saving} onClick={onContinue}>
          Continue →
        </Button>
      </div>
    </div>
  );
}
