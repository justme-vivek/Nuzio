import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import NuzioLogo from '../NuzioLogo/NuzioLogo.jsx';
import NotificationsPanel from '../NotificationsPanel/NotificationsPanel.jsx';

export default function AppHeader() {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <>
      <header className="mx-auto flex max-w-md items-center justify-between px-5 pt-5">
        <NuzioLogo size="sm" />
        <div className="flex items-center gap-2">
          <Link
            to="/app/discover"
            className="tap flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card text-muted transition-colors hover:text-ink"
          >
            <Search size={16} />
          </Link>
          <button
            type="button"
            onClick={() => setNotifOpen(true)}
            className="tap relative flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card text-muted transition-colors hover:text-ink"
          >
            <Bell size={16} />
          </button>
        </div>
      </header>
      <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}
