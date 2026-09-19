import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import Sheet from '../ui/Sheet.jsx';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../../services/user.api.js';
import { relativeTime } from '../../utils/time.js';

const TYPE_META = {
  morning_brief: { icon: '☀️', label: 'Morning brief' },
  breaking_story: { icon: '⚡', label: 'Breaking' },
  weekly_digest: { icon: '📰', label: 'Weekly digest' },
};

export default function NotificationsPanel({ open, onClose }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    enabled: open,
    refetchInterval: open ? 15_000 : false,
  });

  const markAll = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
  const markOne = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const items = data?.notifications || [];
  const unread = data?.unread || 0;

  return (
    <Sheet open={open} onClose={onClose} title={`Notifications${unread ? ` · ${unread} new` : ''}`}>
      {items.length === 0 && (
        <p className="py-8 text-center text-sm text-muted">Nothing here yet — your first brief notification will land soon.</p>
      )}

      <div className="space-y-2">
        {items.map((n) => {
          const meta = TYPE_META[n.type] || TYPE_META.morning_brief;
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => !n.read && markOne.mutate(n.id)}
              className={`tap flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-colors ${
                n.read ? 'border-line bg-card' : 'border-primary/30 bg-primary/5'
              }`}
            >
              <span className="text-lg leading-none">{meta.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{n.title}</span>
                <span className="block truncate text-xs text-muted">{n.message}</span>
                <span className="mt-1 block font-mono text-[10px] text-muted">{relativeTime(n.createdAt)}</span>
              </span>
              {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>

      {unread > 0 && (
        <button
          type="button"
          onClick={() => markAll.mutate()}
          className="tap mt-4 flex w-full items-center justify-center gap-1.5 rounded-full border border-line py-2.5 text-sm text-muted hover:text-ink"
        >
          <Sparkles size={14} /> Mark all as read
        </button>
      )}
    </Sheet>
  );
}
