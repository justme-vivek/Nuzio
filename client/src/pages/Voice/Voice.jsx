import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import StepHeader from "../../components/StepHeader/StepHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import VoiceCard from "../../components/VoiceCard/VoiceCard.jsx";
import { DURATIONS, storiesForDuration } from "../../constants/onboarding.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useVoices } from "../../hooks/useNews.js";
import { useToast } from "../../components/ui/Toast.jsx";
import { apiErrorMessage, API_URL } from "../../services/api.js";

export default function Voice() {
  const navigate = useNavigate();
  const { preferences, patchPreferences } = useAuth();
  const { toast } = useToast();
  const { data: voices = [], isLoading } = useVoices();

  const [selectedKey, setSelectedKey] = useState(
    preferences?.voiceKey || "aria",
  );
  const [duration, setDuration] = useState(preferences?.briefingDuration || 5);
  const [saving, setSaving] = useState(false);
  const previewAudioRef = useRef(null);
  const [previewLoading, setPreviewLoading] = useState(null);
  const [previewPlayingKey, setPreviewPlayingKey] = useState(null);

  const selected = voices.find((v) => v.key === selectedKey) || voices[0];

  const stopPreview = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    setPreviewPlayingKey(null);
  };

  const onPreview = async (voice) => {
    try {
      if (previewPlayingKey === voice.key) return stopPreview();
      stopPreview();
      setPreviewLoading(voice.key);
      const token = localStorage.getItem("nuzio_token");
      const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";
      const res = await fetch(
        `${API_URL}/voices/${voice.id}/preview${tokenQuery}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error("preview failed");
      const blob = await res.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      previewAudioRef.current = audio;
      audio.onended = () => setPreviewPlayingKey(null);
      await audio.play();
      setPreviewPlayingKey(voice.key);
    } catch {
      toast("Voice preview unavailable right now", "error");
      setPreviewPlayingKey(null);
    } finally {
      setPreviewLoading(null);
    }
  };

  const onContinue = async () => {
    if (!selected) return;
    setSaving(true);
    stopPreview();
    try {
      await patchPreferences({
        voiceKey: selected.key,
        briefingDuration: Number(duration),
      });
      navigate("/time");
    } catch (err) {
      toast(apiErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 pb-32 pt-7">
      <StepHeader step={2} total={5} />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-10"
      >
        <h1 className="text-3xl font-bold leading-tight">
          Pick a{" "}
          <span className="serif-accent text-primary">narrator voice.</span>
        </h1>
        <p className="mt-2 text-sm text-muted">
          Tap ▶ to hear a 10-second sample.
        </p>

        <div className="mt-7 space-y-3">
          {isLoading && (
            <div className="h-20 animate-pulse rounded-2xl border border-line bg-card" />
          )}
          {voices.map((v) => (
            <VoiceCard
              key={v.key}
              voice={v}
              selected={selectedKey === v.key}
              previewLoading={previewLoading === v.key}
              previewPlaying={previewPlayingKey === v.key}
              onSelect={() => setSelectedKey(v.key)}
              onPreview={() => onPreview(v)}
            />
          ))}
          {!isLoading && !voices.length && (
            <div className="rounded-2xl border border-line bg-card p-4 text-sm text-muted">
              No voices loaded — the API server is not reachable or voices
              failed to seed.
            </div>
          )}
        </div>

        <p className="mt-9 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          · Brief length
        </p>
        <h2 className="mt-1.5 text-xl font-bold">
          How long is{" "}
          <span className="serif-accent text-primary">your morning?</span>
        </h2>
        <p className="mt-1 text-xs text-muted">Set your ideal brief length.</p>

        <div className="mt-4 flex gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDuration(d)}
              className={`tap flex-1 rounded-full border py-2.5 text-sm font-medium transition-all ${
                duration === d
                  ? "border-primary bg-primary/15 text-ink shadow-glow-sm"
                  : "border-line bg-card text-muted hover:border-primary/40"
              }`}
            >
              {d} min
            </button>
          ))}
        </div>
      </motion.div>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md px-6 pb-8">
        <Button full size="lg" loading={saving} onClick={onContinue}>
          Continue with {selected?.name || "Aria"} ·{" "}
          {storiesForDuration(Number(duration))} stories →
        </Button>
      </div>
    </div>
  );
}
