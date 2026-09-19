import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import NuzioLogo from '../NuzioLogo/NuzioLogo.jsx';
import ProgressBar from '../ProgressBar/ProgressBar.jsx';

export default function StepHeader({ step = 0, total = 5, skipTo = null }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <NuzioLogo size="sm" />
        {skipTo && (
          <Link
            to={skipTo}
            className="tap flex items-center gap-0.5 font-mono text-[11px] tracking-[0.2em] text-muted transition-colors hover:text-ink"
          >
            SKIP <ChevronRight size={13} />
          </Link>
        )}
      </div>
      <ProgressBar step={step} total={total} />
    </div>
  );
}
