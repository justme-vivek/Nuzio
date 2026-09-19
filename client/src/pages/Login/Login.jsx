import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NuzioLogo from '../../components/NuzioLogo/NuzioLogo.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../components/ui/Toast.jsx';
import { apiErrorMessage } from '../../services/api.js';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const { toast } = useToast();
  const btnRef = useRef(null);
  const [busy, setBusy] = useState(false);

  // Already signed in? move on.
  useEffect(() => {
    if (user) navigate('/profession', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    if (!window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        setBusy(true);
        try {
          await login(response.credential);
          navigate('/profession', { replace: true });
        } catch (err) {
          toast(apiErrorMessage(err, 'Google sign-in failed'), 'error');
        } finally {
          setBusy(false);
        }
      },
      ux_mode: 'popup',
    });

    if (btnRef.current) {
      btnRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        width: 300,
      });
    }
  }, [GOOGLE_CLIENT_ID, login, navigate, toast]);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-8 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 -m-12 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-line bg-card shadow-glow">
          <NuzioLogo size="lg" showWordmark={false} animated />
        </div>
      </div>

      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold leading-tight">
        Good morning.
        <br />
        <span className="serif-accent text-primary">News on go.</span>
      </motion.h1>

      <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
        Personalised audio news for Indian professionals — curated every morning.
      </p>

      <div className="mt-12 flex min-h-[52px] w-full items-center justify-center">
        {GOOGLE_CLIENT_ID ? (
          <div ref={btnRef} className={busy ? 'pointer-events-none opacity-50' : ''} />
        ) : (
          <div className="rounded-2xl border border-line bg-card p-4 text-left text-xs text-muted">
            <p className="mb-1 font-semibold text-ink">Google sign-in needs one config value</p>
            <p>
              Add your OAuth client ID to <code className="font-mono text-primary">client/.env</code> as{' '}
              <code className="font-mono text-primary">VITE_GOOGLE_CLIENT_ID</code>
              <br />
              (console.cloud.google.com → Credentials → OAuth client ID → Web application).
            </p>
          </div>
        )}
      </div>

      <p className="mt-8 text-[11px] leading-relaxed text-muted">
        By continuing you agree to our <span className="underline">Terms</span> &{' '}
        <span className="underline">Privacy Policy</span>.
      </p>
    </div>
  );
}
