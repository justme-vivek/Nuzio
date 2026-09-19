import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Splash from '../pages/Splash/Splash.jsx';
import Language from '../pages/Language/Language.jsx';
import Login from '../pages/Login/Login.jsx';
import Profession from '../pages/Profession/Profession.jsx';
import Interests from '../pages/Interests/Interests.jsx';
import Voice from '../pages/Voice/Voice.jsx';
import BriefingTime from '../pages/BriefingTime/BriefingTime.jsx';
import Notifications from '../pages/Notifications/Notifications.jsx';
import AllSet from '../pages/AllSet/AllSet.jsx';
import Home from '../pages/Home/Home.jsx';
import Discover from '../pages/Discover/Discover.jsx';
import Saved from '../pages/Saved/Saved.jsx';
import Settings from '../pages/Settings/Settings.jsx';
import Billing from '../pages/Billing/Billing.jsx';
import AppLayout from '../layouts/AppLayout.jsx';
import { useAuth } from '../hooks/useAuth.js';

function SplashGate() {
  const { status, user } = useAuth();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1700);
    return () => clearTimeout(t);
  }, []);
  if (!ready || status === 'loading') return <Splash />;
  if (status === 'guest') return <Navigate to="/language" replace />;
  return <Navigate to={user?.onboardingCompleted ? '/app' : '/profession'} replace />;
}

function RequireAuth({ children }) {
  const { status } = useAuth();
  if (status === 'loading') return <Splash />;
  if (status === 'guest') return <Navigate to="/language" replace />;
  return children;
}

function RequireOnboarded({ children }) {
  const { user, status } = useAuth();
  if (status === 'loading') return <Splash />;
  if (!user?.onboardingCompleted) return <Navigate to="/profession" replace />;
  return children;
}

function OnboardGate({ children }) {
  // Once onboarding is complete, push users into the app.
  const { user, status } = useAuth();
  if (status === 'loading') return <Splash />;
  if (user?.onboardingCompleted) return <Navigate to="/app" replace />;
  return children;
}

function AuthGate({ children }) {
  // Language/Login screens: signed-in + onboarded users go straight to the app.
  const { user, status } = useAuth();
  if (status === 'loading') return <Splash />;
  if (user?.onboardingCompleted) return <Navigate to="/app" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SplashGate />} />
      <Route path="/language" element={<AuthGate><Language /></AuthGate>} />
      <Route path="/login" element={<AuthGate><Login /></AuthGate>} />

      <Route path="/profession" element={<RequireAuth><OnboardGate><Profession /></OnboardGate></RequireAuth>} />
      <Route path="/interests" element={<RequireAuth><OnboardGate><Interests /></OnboardGate></RequireAuth>} />
      <Route path="/voice" element={<RequireAuth><OnboardGate><Voice /></OnboardGate></RequireAuth>} />
      <Route path="/time" element={<RequireAuth><OnboardGate><BriefingTime /></OnboardGate></RequireAuth>} />
      <Route path="/notifications" element={<RequireAuth><OnboardGate><Notifications /></OnboardGate></RequireAuth>} />
      <Route path="/all-set" element={<RequireAuth><OnboardGate><AllSet /></OnboardGate></RequireAuth>} />

      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<RequireOnboarded><Home /></RequireOnboarded>} />
        <Route path="discover" element={<RequireOnboarded><Discover /></RequireOnboarded>} />
        <Route path="saved" element={<RequireOnboarded><Saved /></RequireOnboarded>} />
        <Route path="settings" element={<RequireOnboarded><Settings /></RequireOnboarded>} />
        <Route path="billing" element={<RequireOnboarded><Billing /></RequireOnboarded>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
