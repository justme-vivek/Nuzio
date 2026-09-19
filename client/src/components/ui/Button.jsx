import { motion } from 'framer-motion';

const VARIANTS = {
  primary:
    'bg-gradient-to-r from-primary to-primary2 text-white shadow-glow-sm hover:shadow-glow disabled:from-muted disabled:to-muted disabled:shadow-none',
  gradient:
    'bg-gradient-to-r from-accent via-mint to-accent text-[#052e2b] font-semibold shadow-[0_0_30px_rgba(45,212,191,0.35)] disabled:from-muted disabled:via-muted disabled:to-muted',
  outline: 'border border-line bg-card text-ink hover:border-primary/50',
  ghost: 'text-muted hover:text-ink',
  danger: 'border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20',
};

const SIZES = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-6 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={disabled || loading}
      className={`tap inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
        VARIANTS[variant] || VARIANTS.primary
      } ${SIZES[size] || SIZES.md} ${full ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </motion.button>
  );
}
