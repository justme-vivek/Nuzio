// Global audio engine: one <audio> for everything.
// - Briefing mode: single MP3 (GridFS stream with Range support); story jumps
//   seek to the server-computed startSec of each story.
// - Story mode: 30-second AI clips from Discover/Saved.
// - Session restore: last briefing + position + speed persist in localStorage.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import api, { API_URL } from "../lib/axios.js";

export const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const audioRef = useRef(null);
  const srcRef = useRef("");
  const pendingSeek = useRef(null);
  const [state, setState] = useState({
    mode: null, // 'briefing' | 'story'
    briefing: null,
    story: null,
    playing: false,
    loading: false,
    currentTime: 0,
    duration: 0,
    speed: 1,
    ended: false,
    error: null,
  });
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const el = new Audio();
    el.preload = "auto";
    el.crossOrigin = "anonymous";
    audioRef.current = el;

    const onTime = () =>
      setState((s) =>
        Math.abs(el.currentTime - s.currentTime) > 0.2
          ? { ...s, currentTime: el.currentTime, ended: false }
          : s,
      );
    const onMeta = () => {
      setState((s) => ({ ...s, duration: el.duration || 0 }));
      if (pendingSeek.current != null) {
        try {
          el.currentTime = pendingSeek.current;
        } catch {
          // not seekable yet
        }
        pendingSeek.current = null;
      }
    };
    const onPlay = () =>
      setState((s) => ({ ...s, playing: true, ended: false }));
    const onPause = () => setState((s) => ({ ...s, playing: false }));
    const onEnded = () =>
      setState((s) => ({ ...s, playing: false, ended: true }));
    const onError = () =>
      setState((s) => ({
        ...s,
        playing: false,
        error: "Audio stream unavailable",
      }));

    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("durationchange", onMeta);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    el.addEventListener("error", onError);

    // Restore last session (paused at saved position).
    try {
      const saved = JSON.parse(localStorage.getItem("nuzio_audio") || "null");
      if (saved?.speed && SPEEDS.includes(saved.speed)) {
        el.playbackRate = saved.speed;
        setState((s) => ({ ...s, speed: saved.speed }));
      }
      if (saved?.briefingId) {
        api
          .get(`/briefings/${saved.briefingId}`)
          .then(({ data }) => {
            const b = data?.briefing;
            if (b?.status === "ready" && b.audioFileId) {
              const token = localStorage.getItem("nuzio_token");
              const src = `${API_URL}/audio/${b.audioFileId}${token ? `?token=${encodeURIComponent(token)}` : ""}`;
              srcRef.current = src;
              el.src = src;
              pendingSeek.current = saved.time || 0;
              setState((s) => ({
                ...s,
                mode: "briefing",
                briefing: b,
                currentTime: saved.time || 0,
              }));
            }
          })
          .catch(() => {});
      }
    } catch {
      // ignore corrupt storage
    }

    return () => {
      try {
        el.pause();
      } catch {
        // ignore
      }
    };
  }, []);

  // Persist position/speed every 3s.
  useEffect(() => {
    const timer = setInterval(() => {
      const s = stateRef.current;
      try {
        localStorage.setItem(
          "nuzio_audio",
          JSON.stringify({
            briefingId: s.briefing?.id || null,
            time: s.currentTime || 0,
            speed: s.speed || 1,
          }),
        );
      } catch {
        // ignore
      }
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const playBriefing = useCallback(
    async (briefing, { storyIndex = 0, autoplay = true } = {}) => {
      const el = audioRef.current;
      if (!el || !briefing?.audioFileId) return;
      const token = localStorage.getItem("nuzio_token");
      const src = `${API_URL}/audio/${briefing.audioFileId}${token ? `?token=${encodeURIComponent(token)}` : ""}`;
      const needsLoad = srcRef.current !== src;
      setState((s) => ({
        ...s,
        mode: "briefing",
        briefing,
        story: null,
        loading: needsLoad,
        error: null,
        ended: false,
      }));

      if (needsLoad) {
        srcRef.current = src;
        pendingSeek.current = briefing.stories?.[storyIndex]?.startSec ?? 0;
        el.src = src;
        el.load();
      } else {
        const start = briefing.stories?.[storyIndex]?.startSec;
        if (start != null) {
          try {
            el.currentTime = start;
          } catch {
            // ignore
          }
        }
      }
      el.playbackRate = stateRef.current.speed;
      if (autoplay) {
        try {
          await el.play();
        } catch {
          // autoplay blocked - user can press play
        }
      }
      setState((s) => ({ ...s, loading: false }));
    },
    [],
  );

  const playStory = useCallback(
    async ({ audioFileId, title = "", subtitle = "" }) => {
      const el = audioRef.current;
      if (!el || !audioFileId) return;
      const token = localStorage.getItem("nuzio_token");
      const src = `${API_URL}/audio/${audioFileId}${token ? `?token=${encodeURIComponent(token)}` : ""}`;
      const needsLoad = srcRef.current !== src;
      setState((s) => ({
        ...s,
        mode: "story",
        story: { audioFileId, title, subtitle },
        loading: needsLoad,
        error: null,
        ended: false,
      }));

      if (needsLoad) {
        srcRef.current = src;
        pendingSeek.current = 0;
        el.src = src;
        el.load();
      } else {
        try {
          el.currentTime = 0;
        } catch {
          // ignore
        }
      }
      el.playbackRate = stateRef.current.speed;
      try {
        await el.play();
      } catch {
        // ignore
      }
      setState((s) => ({ ...s, loading: false }));
    },
    [],
  );

  const toggle = useCallback(async () => {
    const el = audioRef.current;
    if (!el || !el.src) return;
    if (el.paused) {
      try {
        await el.play();
      } catch {
        // ignore
      }
    } else {
      el.pause();
    }
  }, []);

  const seekTo = useCallback((sec) => {
    const el = audioRef.current;
    if (!el || !el.src) return;
    const d = el.duration || 0;
    el.currentTime = Math.max(0, Math.min(sec, d ? d - 0.25 : sec));
    setState((s) => ({ ...s, currentTime: el.currentTime, ended: false }));
  }, []);

  const seekFraction = useCallback(
    (f) => {
      const el = audioRef.current;
      if (el?.duration) seekTo(f * el.duration);
    },
    [seekTo],
  );

  const setSpeed = useCallback((speed) => {
    const el = audioRef.current;
    if (el) el.playbackRate = speed;
    setState((s) => ({ ...s, speed }));
  }, []);

  const cycleSpeed = useCallback(() => {
    const idx = SPEEDS.indexOf(stateRef.current.speed);
    setSpeed(SPEEDS[(idx + 1) % SPEEDS.length] || 1);
  }, [setSpeed]);

  const activeStoryIndex = useMemo(() => {
    if (state.mode !== "briefing" || !state.briefing) return -1;
    let idx = -1;
    (state.briefing.stories || []).forEach((s, i) => {
      if (
        typeof s.startSec === "number" &&
        state.currentTime + 0.15 >= s.startSec
      )
        idx = i;
    });
    return idx;
  }, [state.mode, state.briefing, state.currentTime]);

  const jumpStory = useCallback(
    (dir) => {
      const s = stateRef.current;
      if (s.mode !== "briefing" || !s.briefing) return;
      const stories = s.briefing.stories || [];
      const withStart = stories
        .map((st, i) => ({ i, start: st.startSec }))
        .filter((x) => typeof x.start === "number");
      if (!withStart.length) return;

      const cur = activeStoryIndex;
      let target;
      if (dir > 0) {
        target = withStart.find((x) => x.i > cur) || withStart[0];
      } else {
        if (cur >= 0 && s.currentTime - (stories[cur]?.startSec ?? 0) > 4) {
          seekTo(stories[cur].startSec + 0.05); // restart current story first
          return;
        }
        target =
          [...withStart].reverse().find((x) => x.i < cur) || withStart[0];
      }
      seekTo(target.start + 0.05);
    },
    [activeStoryIndex, seekTo],
  );

  const nextStory = useCallback(() => jumpStory(1), [jumpStory]);
  const prevStory = useCallback(() => jumpStory(-1), [jumpStory]);

  const value = useMemo(
    () => ({
      ...state,
      activeStoryIndex,
      speeds: SPEEDS,
      playBriefing,
      playStory,
      toggle,
      seekTo,
      seekFraction,
      setSpeed,
      cycleSpeed,
      nextStory,
      prevStory,
    }),
    [
      state,
      activeStoryIndex,
      playBriefing,
      playStory,
      toggle,
      seekTo,
      seekFraction,
      setSpeed,
      cycleSpeed,
      nextStory,
      prevStory,
    ],
  );

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
}

export function useAudioContext() {
  const ctx = useContext(AudioContext);
  if (!ctx)
    throw new Error("useAudioContext must be used inside <AudioProvider>");
  return ctx;
}
