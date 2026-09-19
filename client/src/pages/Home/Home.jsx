import { useState } from "react";
import {
  useTodayBriefing,
  useGenerateBriefing,
} from "../../hooks/useBriefing.js";
import BriefingCard from "../../components/BriefingCard/BriefingCard.jsx";
import Button from "../../components/ui/Button.jsx";
import Chip from "../../components/ui/Chip.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import HomeStoryRow from "./HomeStoryRow.jsx";
import { useAudioPlayer } from "../../hooks/useAudioPlayer.js";
import {
  greetingFor,
  CATEGORY_LABELS,
  formatTime12,
  storiesForDuration,
} from "../../constants/onboarding.js";
import { useAuth } from "../../hooks/useAuth.js";

const GEN_MESSAGES = [
  "Fetching today’s headlines from GDELT…",
  "Matching stories to your interests…",
  "Summarising with Gemini…",
  "Recording the audio with your narrator…",
];

export default function Home() {
  const { user, preferences } = useAuth();
  const { data, isLoading } = useTodayBriefing();
  const generate = useGenerateBriefing();
  const audio = useAudioPlayer();
  const [filter, setFilter] = useState("all");

  const briefing = data?.briefing;
  const firstName = (user?.name || "friend").split(" ")[0];
  const stories = briefing?.status === "ready" ? briefing.stories || [] : [];
  const cats = [...new Set(stories.map((s) => s.category).filter(Boolean))];
  const visible =
    filter === "all" ? stories : stories.filter((s) => s.category === filter);

  const dateLabel = new Date()
    .toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    })
    .toUpperCase();

  return (
    <div className="space-y-6">
      {stories.length > 0 && (
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <Chip
            label="All"
            selected={filter === "all"}
            onClick={() => setFilter("all")}
          />
          {cats.map((c) => (
            <Chip
              key={c}
              label={CATEGORY_LABELS[c] || c}
              selected={filter === c}
              onClick={() => setFilter(c)}
            />
          ))}
        </div>
      )}

      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          {dateLabel} · MORNING BRIEF
        </p>
        <h1 className="mt-1.5 text-[26px] font-bold leading-tight">
          {greetingFor()}, {firstName} —{" "}
          <span className="serif-accent font-normal text-muted">
            {briefing?.status === "ready"
              ? `${stories.length} things.`
              : "your brief."}
          </span>
        </h1>
        {briefing?.status === "ready" && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" />
            Audio live · Voice: {briefing.voiceKey} · {stories.length} stories ·
            ~{briefing.duration} min
          </div>
        )}
      </div>

      {isLoading && (
        <div className="h-64 animate-pulse rounded-3xl border border-line bg-card" />
      )}

      {!isLoading && (!briefing || briefing.status === "failed") && (
        <div className="rounded-3xl border border-line bg-card p-6 text-center">
          <p className="text-2xl">🎧</p>
          <h2 className="mt-2 font-semibold">
            {briefing?.status === "failed"
              ? "Brief generation failed"
              : "No brief yet today"}
          </h2>
          <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted">
            {briefing?.status === "failed"
              ? briefing.error || "Something interrupted your brief. Try again."
              : "Your next scheduled brief arrives at your morning time — or grab one now."}
          </p>
          <Button
            className="mt-5"
            full
            loading={generate.isPending}
            onClick={() => generate.mutate({})}
          >
            {briefing?.status === "failed"
              ? "Try again"
              : "Generate my brief now"}
          </Button>
          {generate.isError && (
            <p className="mt-3 text-xs text-danger">
              {generate.error?.response?.data?.error ||
                "Generation failed — check server config (AI key, network)."}
            </p>
          )}
        </div>
      )}

      {!isLoading && briefing?.status === "generating" && (
        <div className="rounded-3xl border border-line bg-card p-6 text-center">
          <div className="mx-auto mb-4 w-fit">
            <Spinner size={30} />
          </div>
          <h2 className="font-semibold">Crafting your brief…</h2>
          <p className="mt-1.5 text-sm text-muted">
            {
              GEN_MESSAGES[
                Math.min(
                  3,
                  Math.floor((Date.now() / 15000) % GEN_MESSAGES.length),
                )
              ]
            }
          </p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            {storiesForDuration(preferences?.briefingDuration || 5)} stories ·
            Voice: {preferences?.voiceKey || "aria"} ·{" "}
            {formatTime12(preferences?.briefingTime)} scheduled daily
          </p>
        </div>
      )}

      {!isLoading && briefing?.status === "ready" && (
        <>
          <BriefingCard briefing={briefing} />
          <div className="space-y-2">
            {visible.map((s) => (
              <HomeStoryRow
                key={`${s.title}-${s.startSec ?? "x"}-${s.index ?? stories.indexOf(s)}`}
                story={s}
                globalIndex={stories.indexOf(s)}
                briefing={briefing}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
