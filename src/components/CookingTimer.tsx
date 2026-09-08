import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Bell, X, Volume2 } from "lucide-react";

interface CookingTimerProps {
  initialMinutes: number;
  label?: string;
  onClose: () => void;
}

export const CookingTimer: React.FC<CookingTimerProps> = ({
  initialMinutes,
  label = "調理タイマー",
  onClose,
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setTimeLeft(initialMinutes * 60);
    setTotalSeconds(initialMinutes * 60);
    setIsRunning(true);
    setIsFinished(false);
  }, [initialMinutes]);

  const playBeep = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Play chime sequence
      const freqs = [587.33, 880, 1174.66]; // D5, A5, D6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.15 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.15);
        osc.stop(ctx.currentTime + idx * 0.15 + 0.45);
      });
    } catch (e) {
      console.warn("Audio chime could not play:", e);
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            playBeep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  const toggleRun = () => {
    if (isFinished) {
      setTimeLeft(totalSeconds);
      setIsFinished(false);
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const resetTimer = () => {
    setTimeLeft(totalSeconds);
    setIsRunning(false);
    setIsFinished(false);
  };

  return (
    <div
      id="cooking-timer-bar"
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 rounded-2xl shadow-xl border p-4 max-w-sm w-[calc(100vw-2rem)] sm:w-80 transition-all ${
        isFinished
          ? "bg-amber-500 text-white border-amber-600 animate-bounce"
          : "bg-stone-900 text-white border-stone-800"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-300">
          <Bell className="w-3.5 h-3.5 text-amber-400" />
          <span className="truncate max-w-[180px]">{label}</span>
        </div>
        <button
          id="close-timer-btn"
          onClick={onClose}
          className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-baseline justify-between mb-3">
        <div className="font-mono font-black text-3xl sm:text-4xl tracking-tight">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
        <div className="text-xs text-stone-400 font-medium">
          {isFinished ? "時間になりました！" : isRunning ? "計測中..." : "一時停止中"}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden mb-3">
        <div
          className="bg-amber-400 h-full transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          id="toggle-timer-btn"
          onClick={toggleRun}
          className={`flex-1 py-2 px-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all ${
            isFinished
              ? "bg-white text-amber-700 hover:bg-amber-100"
              : isRunning
              ? "bg-amber-500 hover:bg-amber-600 text-stone-950"
              : "bg-emerald-500 hover:bg-emerald-600 text-white"
          }`}
        >
          {isFinished ? (
            <>
              <RotateCcw className="w-4 h-4" />
              もう一度
            </>
          ) : isRunning ? (
            <>
              <Pause className="w-4 h-4" />
              一時停止
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              再開
            </>
          )}
        </button>

        <button
          id="reset-timer-btn"
          onClick={resetTimer}
          className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
          title="リセット"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          id="test-sound-btn"
          onClick={playBeep}
          className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
          title="音をテスト"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
