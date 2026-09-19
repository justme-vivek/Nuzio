import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import StepHeader from '../../components/StepHeader/StepHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import { INTERESTS, MAX_INTERESTS } from '../../constants/onboarding.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../components/ui/Toast.jsx';
import { apiErrorMessage } from '../../services/api.js';

export default function Interests() {
  const navigate = useNavigate();
  const { preferences, patchPreferences } = useAuth();
  const { toast } = useToast();
  const [selected, setSelected] = useState(preferences?.interests || []);
  const [saving, setSaving] = useState(false);

  const toggle = (id) => {
    setSelected((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= MAX_INTERESTS) return cur;
      return [...cur, id];
    });
  };

  const onContinue = async () => {
    if (!selected.length) return;
    setSaving(true);
    try {
      await patchPreferences({ interests: selected });
      navigate('/voice');
    } catch (err) {
      toast(apiErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const atMax = selected.length >= MAX_INTERESTS;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 pb-32 pt-7">
      <StepHeader step={1} total={5} />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-10">
        <h1 className="text-3xl font-bold leading-tight">
          What moves <span className="serif-accent text-primary">your world?</span>
        </h1>
        <p className="mt-2 text-sm text-muted">
          Pick up to {MAX_INTERESTS} interests.{' '}
          <span className="ml-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary">
            {selected.length}/{MAX_INTERESTS}
          </span>
        </p>

        <div className="mt-8 flex flex-wrap gap-2.5">
          {INTERESTS.map((i) => {
            const isSel = selected.includes(i.id);
            return (
              <button
                key={i.id}
                type="button"
                onClick={() => toggle(i.id)}
                disabled={!isSel && atMax}
                className={`tap inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-all ${
                  isSel
                    ? 'border-primary bg-primary/15 text-ink shadow-glow-sm'
                    : 'border-line bg-card text-muted hover:border-primary/40 hover:text-ink'
                } ${!isSel && atMax ? 'opacity-40' : ''}`}
              >
                <span>{i.icon}</span>
                {i.label}
                {isSel && <span className="text-accent">✓</span>}
              </button>
            );
          })}
        </div>
      </motion.div>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md px-6 pb-8">
        <Button full size="lg" disabled={!selected.length} loading={saving} onClick={onContinue}>
          Continue →
        </Button>
      </div>
    </div>
  );
}
