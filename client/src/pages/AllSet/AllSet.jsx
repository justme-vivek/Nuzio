import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import NuzioLogo from "../../components/NuzioLogo/NuzioLogo.jsx";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import {
  PROFESSIONS,
  INTERESTS,
  formatTime12,
  storiesForDuration,
} from "../../constants/onboarding.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useVoices } from "../../hooks/useNews.js";
import { useGenerateBriefing } from "../../hooks/useBriefing.js";
import { patchMe } from "../../services/user.api.js";
import { apiErrorMessage } from "../../services/api.js";

const PHASES = [
  "Fetching the latest stories…",
  "Reading your interests…",
  "Summarising with AI…",
  "Recording with your narrator…",
  "Almost ready…",
];

export default function AllSet() {
  const navigate = useNavigate();
  const { user, preferences, setUser } = useAuth();
  const { data: voices = [] } = useVoices();
  const generate = useGenerateBriefing();
  const [phase, setPhase] = useState("idle"); // idle | generating | error
  const [err, setErr] = useState("");
  const [phaseIdx, setPhaseIdx] = useState(0);

  const start = async () => {
    setPhase("generating");
    setPhaseIdx(0);
    const timer = setInterval(
      () => setPhaseIdx((i) => Math.min(i + 1, PHASES.length - 1)),
      4500,
    );
    try {
      const updatedUser = await patchMe({ onboardingCompleted: true });
      setUser(updatedUser);
      await generate.mutateAsync({});
      sessionStorage.setItem("nuzio_autoplay", "1");
      clearInterval(timer);
      navigate("/app");
    } catch (e) {
      clearInterval(timer);
      setErr(apiErrorMessage(e, "Briefing generation failed"));
      setPhase("error");
    }
  };

  const prof = PROFESSIONS.find((p) => p.id === preferences?.profession);
  const voice = voices.find((v) => v.key === preferences?.voiceKey) || {
    name: "Aria",
    accent: "British",
  };
  const interests = preferences?.interests || [];

  const SUMMARY_ROWS = [
    { icon: "💼", label: "Profession", value: prof?.label || "—" },
    {
      icon: "🎯",
      label: "Interests",
      value:
        interests.length > 0
          ? `${interests
              .map((i) => INTERESTS.find((x) => x.id === i)?.label || i)
              .slice(0, 2)
              .join(
                ", ",
              )}${interests.length > 2 ? ` +${interests.length - 2}` : ""}`
          : "—",
    },
    {
      icon: "🎙️",
      label: "Voice",
      value: `${voice.name} — ${voice.accent}, warm`,
    },
    {
      icon: "⏱️",
      label: "Length",
      value: `${storiesForDuration(preferences?.briefingDuration || 5)} stories · ~${preferences?.briefingDuration || 5} min`,
    },
    {
      icon: "🔔",
      label: "Delivery",
      value: `Daily at ${formatTime12(preferences?.briefingTime)}`,
    },
  ];

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 pb-32 pt-10">
      <div className="flex items-center justify-between">
        <NuzioLogo size="sm" />
        <span className="font-mono text-[11px] tracking-[0.2em] text-accent">
          ALL SET
        </span>
      </div>

      {phase === "generating" ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-1 flex-col items-center justify-center text-center"
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 -m-10 rounded-full bg-primary/25 blur-3xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-primary/40 bg-card shadow-glow">
              <NuzioLogo size="md" showWordmark={false} animated />
            </div>
          </div>
          <p className="text-lg font-semibold">Crafting your first brief…</p>
          <p className="mt-2 text-sm text-muted">{PHASES[phaseIdx]}</p>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            Usually takes under a minute
          </p>
        </motion.div>
      ) : phase === "error" ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-1 flex-col items-center justify-center text-center"
        >
          <p className="text-lg font-semibold text-danger">
            Something went wrong
          </p>
          <p className="mt-2 max-w-xs text-sm text-muted">{err}</p>
          <div className="mt-8 w-full space-y-2.5">
            <Button full size="lg" onClick={start}>
              Try again
            </Button>
            <Button full variant="ghost" onClick={() => navigate("/app")}>
              Skip for now
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mt-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-mint/15">
              <CheckCircle2 size={30} className="text-mint" />
            </div>
            <h1 className="text-3xl font-bold">
              You're ready,{" "}
              <span className="serif-accent text-accent">
                {(user?.name || "friend").split(" ")[0]}.
              </span>
            </h1>
            <p className="mt-3 text-sm text-muted">
              Your first brief will be ready tomorrow at{" "}
              {formatTime12(preferences?.briefingTime)}. We're already
              gathering.
            </p>
          </div>

          <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
            · Your brief profile
          </p>
          <Card className="mt-3 divide-y divide-line">
            {SUMMARY_ROWS.map((row) => (
              <div
                key={row.label}
                className="flex items-center gap-3 px-4 py-3.5"
              >
                <span className="text-base">{row.icon}</span>
                <div className="flex-1">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
                    {row.label}
                  </p>
                  <p className="text-sm font-medium">{row.value}</p>
                </div>
                <CheckCircle2 size={15} className="text-accent" />
              </div>
            ))}
          </Card>
        </motion.div>
      )}

      {phase === "idle" && (
        <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md px-6 pb-8">
          <Button full size="lg" variant="gradient" onClick={start}>
            Start listening →
          </Button>
        </div>
      )}
    </div>
  );
}
