import { useState } from 'react';
import { DURATIONS, PROFESSIONS, INTERESTS, MAX_INTERESTS, TIME_SLOTS } from '../../constants/onboarding.js';
import Sheet from '../../components/ui/Sheet.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useVoices } from '../../hooks/useNews.js';
import { useToast } from '../../components/ui/Toast.jsx';
import { apiErrorMessage } from '../../services/api.js';

export default function SettingsFieldSheet({ field, onClose }) {
  const { preferences, patchPreferences } = useAuth();
  const { data: voices = [] } = useVoices();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const pref = preferences || {};

  if (!field) return <Sheet open={false} onClose={onClose} />;

  const save = async (payload) => {
    setSaving(true);
    try {
      await patchPreferences(payload);
      onClose();
    } catch (err) {
      toast(apiErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const titles = {
    language: 'Language',
    profession: 'Profession',
    interests: `Interests (max ${MAX_INTERESTS})`,
    voice: 'Narrator voice',
    duration: 'Brief length',
    time: 'Briefing time',
  };

  const draftInterests = pref.interests || [];

  return (
    <Sheet open onClose={onClose} title={titles[field]}>
      {field === 'language' && (
        <div className="space-y-2.5">
          {[
            { id: 'en', label: 'English' },
            { id: 'hi', label: 'हिन्दी' },
          ].map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => save({ language: l.id })}
              className={`tap w-full rounded-2xl border p-3.5 text-left text-sm font-medium ${
                pref.language === l.id ? 'border-primary bg-primary/10' : 'border-line bg-card2'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}

      {field === 'profession' && (
        <div className="grid grid-cols-2 gap-2.5">
          {PROFESSIONS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => save({ profession: p.id })}
              className={`tap rounded-2xl border px-3 py-2.5 text-left text-xs font-medium ${
                pref.profession === p.id ? 'border-primary bg-primary/10' : 'border-line bg-card2'
              }`}
            >
              {p.icon} {p.label}
            </button>
          ))}
        </div>
      )}

      {field === 'interests' && (
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((i) => {
            const isSel = draftInterests.includes(i.id);
            return (
              <button
                key={i.id}
                type="button"
                onClick={() => {
                  const next = isSel
                    ? draftInterests.filter((x) => x !== i.id)
                    : draftInterests.length >= MAX_INTERESTS
                      ? draftInterests
                      : [...draftInterests, i.id];
                  save({ interests: next });
                }}
                disabled={!isSel && draftInterests.length >= MAX_INTERESTS}
                className={`tap rounded-full border px-3 py-2 text-xs ${
                  isSel ? 'border-primary bg-primary/15 text-ink' : 'border-line bg-card2 text-muted'
                } disabled:opacity-40`}
              >
                {i.icon} {i.label}
              </button>
            );
          })}
        </div>
      )}

      {field === 'voice' && (
        <div className="space-y-2.5">
          {voices.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => save({ voiceKey: v.key })}
              className={`tap flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left ${
                pref.voiceKey === v.key ? 'border-primary bg-primary/10' : 'border-line bg-card2'
              }`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 font-bold text-primary">
                {v.name[0]}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">{v.name}</span>
                <span className="block text-xs text-muted">{v.description}</span>
              </span>
              {pref.voiceKey === v.key && <span className="text-accent">✓</span>}
            </button>
          ))}
        </div>
      )}

      {field === 'duration' && (
        <div className="flex gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => save({ briefingDuration: d })}
              className={`tap flex-1 rounded-full border py-2.5 text-sm ${
                Number(pref.briefingDuration || 5) === d ? 'border-primary bg-primary/15' : 'border-line bg-card2 text-muted'
              }`}
            >
              {d} min
            </button>
          ))}
        </div>
      )}

      {field === 'time' && (
        <div className="space-y-3">
          <input
            type="time"
            defaultValue={pref.briefingTime || '07:00'}
            onChange={(e) => e.target.value && save({ briefingTime: e.target.value })}
            className="w-full rounded-2xl border border-line bg-card2 px-4 py-3 text-center font-mono text-lg outline-none focus:border-primary/60"
          />
          <div className="flex flex-wrap gap-2">
            {TIME_SLOTS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => save({ briefingTime: t.value })}
                className={`tap rounded-full border px-3 py-1.5 font-mono text-xs ${
                  pref.briefingTime === t.value ? 'border-primary bg-primary/15 text-ink' : 'border-line bg-card2 text-muted'
                }`}
              >
                {t.label} {t.ap}
              </button>
            ))}
          </div>
        </div>
      )}

      {saving && <p className="mt-3 text-center text-xs text-muted">Saving…</p>}
    </Sheet>
  );
}
