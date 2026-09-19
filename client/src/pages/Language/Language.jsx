import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import StepHeader from '../../components/StepHeader/StepHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import Toggle from '../../components/ui/Toggle.jsx';
import Card from '../../components/ui/Card.jsx';
import OnboardingLayout from '../../layouts/OnboardingLayout.jsx';
import { useAuth } from '../../hooks/useAuth.js';

const LANGUAGES = [
  { id: 'en', label: 'English', sub: 'British-flavored · English', flag: '🇬🇧' },
  { id: 'hi', label: 'हिन्दी', sub: 'हिंदी में सुविधा जल्द आ रही है', flag: '🇮🇳' },
];

export default function Language() {
  const navigate = useNavigate();
  const { patchPreferences } = useAuth();
  const [language, setLanguage] = useState('en');
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  const onContinue = async () => {
    setSaving(true);
    try {
      await patchPreferences({ language, locationEnabled });
      navigate('/login');
    } catch {
      // Still proceed - preferences save best-effort
      navigate('/login');
    } finally {
      setSaving(false);
    }
  };

  return (
    <OnboardingLayout>
      <StepHeader step={0} total={5} />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-10">
        <h1 className="text-3xl font-bold leading-tight">
          Choose your <span className="serif-accent text-primary">language</span>
        </h1>
        <p className="mt-2 text-sm text-muted">Select the language for your daily brief.</p>

        <div className="mt-8 space-y-3">
          {LANGUAGES.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLanguage(l.id)}
              className={`tap flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
                language === l.id ? 'border-primary bg-primary/10 shadow-glow-sm' : 'border-line bg-card'
              }`}
            >
              <span className="text-2xl">{l.flag}</span>
              <span className="flex-1">
                <span className="block font-semibold">{l.label}</span>
                <span className="block text-xs text-muted">{l.sub}</span>
              </span>
              <span
                className={`h-4 w-4 rounded-full border-2 ${
                  language === l.id ? 'border-primary bg-primary' : 'border-muted'
                }`}
              />
            </button>
          ))}
        </div>

        <Card className="mt-5 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <MapPin size={18} />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium">Enable Location</p>
              <p className="text-xs text-muted">Get relevant news, tailored by your city.</p>
              <p className="mt-0.5 font-mono text-[10px] text-muted">
                {locationEnabled ? '· ALLOWED' : '· NOT ALLOWED'}
              </p>
            </div>
            <Toggle checked={locationEnabled} onChange={setLocationEnabled} />
          </div>
        </Card>
      </motion.div>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md px-6 pb-8">
        <Button full size="lg" loading={saving} onClick={onContinue}>
          Continue →
        </Button>
      </div>
    </OnboardingLayout>
  );
}
