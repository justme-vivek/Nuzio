import { Outlet } from 'react-router-dom';
import AppHeader from '../components/AppHeader/AppHeader.jsx';
import BottomNav from '../components/BottomNav/BottomNav.jsx';

export default function AppLayout() {
  return (
    <div className="min-h-screen pb-28">
      <AppHeader />
      <main className="mx-auto mt-6 max-w-md px-5">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
