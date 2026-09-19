import { NavLink } from 'react-router-dom';
import { Home, Compass, Bookmark, Settings } from 'lucide-react';

const TABS = [
  { to: '/app', label: 'Home', icon: Home, end: true },
  { to: '/app/discover', label: 'Discover', icon: Compass },
  { to: '/app/saved', label: 'Saved', icon: Bookmark },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-line bg-bg/90 px-6 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 backdrop-blur-lg">
      <div className="flex items-center justify-between">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `tap flex flex-col items-center gap-1 px-3 py-1 transition-colors ${
                isActive ? 'text-primary' : 'text-muted hover:text-ink'
              }`
            }
          >
            <Icon size={20} strokeWidth={2.2} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
