import { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes.jsx';
import { useAuth } from './hooks/useAuth.js';

export default function App() {
  const { preferences } = useAuth();

  useEffect(() => {
    document.documentElement.classList.toggle('theme-light', preferences?.theme === 'light');
  }, [preferences?.theme]);

  return <AppRoutes />;
}
