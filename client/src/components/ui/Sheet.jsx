import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function Sheet({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-3xl border border-line bg-card p-5 pb-8 shadow-card"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                className="tap rounded-full border border-line p-1.5 text-muted hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto no-scrollbar">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
