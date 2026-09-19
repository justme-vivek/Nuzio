import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, CreditCard, Palette, Volume2, Bell, LogOut, Sun, Moon } from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Toggle from '../../components/ui/Toggle.jsx';
import SettingsFieldSheet from './SettingsFieldSheet.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useSaved } from '../../hooks/useNews.js';
import { useToast } from '../../components/ui/Toast.jsx';

export default function Settings() {
  const navigate = useNavigate();
  const { user, preferences, patchPreferences, logout } = useAuth();
  const { data: saved = [] } = useSaved();
  const { toast } = useToast();

  const [field, setField] = useState(null);
  const pref = preferences || {};
  const theme = pref.theme || 'dark';

  const setTheme = (t) => patchPreferences({ theme: t }).catch(() => toast('Could not save theme', 'error'));
  const setNested = (key, partial) =>
    patchPreferences({ [key]: partial }).catch(() => toast('Could not save preference', 'error'));

  const onLogout = async () => {
    await logout();
    navigate('/language');
  };

  const rows = [
    { key: 'language', label: 'Language', value: pref.language === 'hi' ? 'हिन्दी' : 'English' },
    { key: 'profession', label: 'Profession', value: pref.profession || '—' },
    { key: 'interests', label: 'Interests', value: (pref.interests || []).length ? `${pref.interests.length} selected` : '—' },
    { key: 'voice', label: 'Narrator', value: (pref.voiceKey || 'aria').replace(/^\w/, (c) => c.toUpperCase()) },
    { key: 'duration', label: 'Brief length', value: `${pref.briefingDuration || 5} min` },
    { key: 'time', label: 'Briefing time', value: pref.briefingTime || '07:00' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">
          Settings <span className="serif-accent text-primary">& preferences</span>
        </h1>
        <p className="mt-1 text-sm text-muted">Tune your morning.</p>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="h-12 w-12 rounded-full border border-line object-cover" />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-lg font-bold text-primary">
              {(user?.name || 'N')[0]}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{user?.name}</p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => navigate('/app/saved')} className="tap rounded-2xl border border-line bg-card p-4 text-left">
          <Bookmark size={16} className="mb-2 text-primary" />
          <p className="text-sm font-medium">Saved stories</p>
          <p className="text-xs text-muted">{saved.length} saved</p>
        </button>
        <button type="button" onClick={() => navigate('/app/billing')} className="tap rounded-2xl border border-line bg-card p-4 text-left">
          <CreditCard size={16} className="mb-2 text-primary" />
          <p className="text-sm font-medium">Plan & billing</p>
          <p className="text-xs text-muted">Free · upgrade soon</p>
        </button>
      </div>

      <Card className="divide-y divide-line">
        <p className="flex items-center gap-2 px-4 pt-3.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          <Palette size={12} /> Appearance
        </p>
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm">Theme</span>
          <div className="flex gap-1 rounded-full border border-line p-1">
            {[
              { id: 'dark', icon: Moon },
              { id: 'light', icon: Sun },
            ].map(({ id, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTheme(id)}
                className={`tap flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs capitalize transition-colors ${
                  theme === id ? 'bg-primary text-white' : 'text-muted'
                }`}
              >
                <Icon size={13} /> {id}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="divide-y divide-line">
        <p className="flex items-center gap-2 px-4 pt-3.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          <Palette size={12} /> Personalization
        </p>
        {rows.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setField(r.key)}
            className="tap flex w-full items-center justify-between px-4 py-3.5 text-left"
          >
            <span className="text-sm">{r.label}</span>
            <span className="text-sm text-muted">{r.value} ›</span>
          </button>
        ))}
      </Card>

      <Card className="divide-y divide-line">
        <p className="flex items-center gap-2 px-4 pt-3.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          <Volume2 size={12} /> Audio & location
        </p>
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm">Auto-advance stories</span>
          <Toggle checked={pref.audio?.autoAdvance ?? true} onChange={(v) => setNested('audio', { autoAdvance: v })} />
        </div>
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm">Offline mode</span>
          <Toggle checked={pref.audio?.offlineMode ?? false} onChange={(v) => setNested('audio', { offlineMode: v })} />
        </div>
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm">Location for local news</span>
          <Toggle checked={pref.locationEnabled ?? false} onChange={(v) => patchPreferences({ locationEnabled: v })} />
        </div>
      </Card>

      <Card className="divide-y divide-line">
        <p className="flex items-center gap-2 px-4 pt-3.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          <Bell size={12} /> Notifications
        </p>
        {[
          { key: 'morningBrief', label: 'Morning brief ready' },
          { key: 'breakingStory', label: 'Breaking stories' },
          { key: 'weeklyDigest', label: 'Weekly digest' },
        ].map((n) => (
          <div key={n.key} className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm">{n.label}</span>
            <Toggle checked={pref.notifications?.[n.key] ?? true} onChange={(v) => setNested('notifications', { [n.key]: v })} />
          </div>
        ))}
      </Card>

      <Button full variant="danger" onClick={onLogout}>
        <LogOut size={15} /> Log out
      </Button>

      <SettingsFieldSheet field={field} onClose={() => setField(null)} />
    </div>
  );
}
