import { motion } from 'framer-motion';
import NuzioLogo from '../../components/NuzioLogo/NuzioLogo.jsx';

export default function Splash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-8 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative mb-6"
      >
        <div className="absolute inset-0 -m-16 rounded-full bg-primary/25 blur-3xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-line bg-card shadow-glow">
          <NuzioLogo size="lg" showWordmark={false} animated />
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6 }}
        className="text-2xl font-bold tracking-tight"
      >
        Nuzio <span className="text-primary">AI</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="serif-accent mt-2 text-xl text-muted"
      >
        News on go
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-16 font-mono text-[10px] uppercase tracking-[0.25em] text-muted"
      >
        · Curates your brief…
      </motion.p>
    </div>
  );
}
