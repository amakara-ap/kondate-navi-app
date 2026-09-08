import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Eye,
  Timer,
  CheckCircle2,
  Sparkles,
  Lightbulb,
  Maximize2,
  Sun,
  RotateCcw,
} from "lucide-react";
import { Recipe, RecipeStep } from "../types";

interface CookingStepModalProps {
  recipe: Recipe;
  servings: number;
  isOpen: boolean;
  onClose: () => void;
  onStartTimer: (minutes: number, label: string) => void;
}

export const CookingStepModal: React.FC<CookingStepModalProps> = ({
  recipe,
  servings,
  isOpen,
  onClose,
  onStartTimer,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [wakeLockActive, setWakeLockActive] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const wakeLockRef = useRef<any>(null);

  // Request screen wake lock when entering cooking mode
  useEffect(() => {
    if (!isOpen) return;

    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
          setWakeLockActive(true);
          wakeLockRef.current.addEventListener("release", () => {
            setWakeLockActive(false);
          });
        }
      } catch (err) {
        console.warn("Wake lock request failed:", err);
      }
    };

    requestWakeLock();

    return () => {
      if (wakeLockRef.current) {
        try {
          wakeLockRef.current.release();
        } catch {}
        wakeLockRef.current = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen]);

  // Handle Speech Synthesis
  const handleSpeakStep = (text: string) => {
    if (!("speechSynthesis" in window)) {
      alert("お使いのブラウザは音声読み上げに対応していません。");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const steps = recipe.steps || [];
  const currentStep = steps[currentStepIndex] || {
    stepNumber: 1,
    instruction: "手順はありません",
  };

  const toggleStepDone = (idx: number) => {
    setCompletedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex flex-col justify-between text-white animate-fadeIn">
      {/* Top Bar */}
      <div className="p-4 sm:p-6 border-b border-stone-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-md shrink-0">
            🍳
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full">
                クッキングモード ({servings}人前)
              </span>
              {wakeLockActive && (
                <span className="text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-400" />
                  <span>画面スリープ防止ON</span>
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-black text-stone-100 truncate mt-0.5">
              {recipe.title}
            </h2>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
          title="閉じる"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Step Body (Large & Easy to Read from a distance) */}
      <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full px-5 py-6 space-y-6 overflow-y-auto">
        {/* Step Progress Pills */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (window.speechSynthesis) window.speechSynthesis.cancel();
                setIsSpeaking(false);
                setCurrentStepIndex(idx);
              }}
              className={`h-2.5 rounded-full transition-all ${
                currentStepIndex === idx
                  ? "w-8 bg-emerald-500 shadow-sm shadow-emerald-500/50"
                  : completedSteps[idx]
                  ? "w-4 bg-emerald-800"
                  : "w-2.5 bg-stone-700 hover:bg-stone-600"
              }`}
              title={`手順 ${idx + 1}`}
            />
          ))}
        </div>

        {/* Current Step Card */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl sm:text-5xl font-black text-emerald-400 font-mono">
                0{currentStep.stepNumber}
              </span>
              <span className="text-sm font-bold text-stone-400">
                / 全 {steps.length} 工程
              </span>
            </div>

            {/* Read aloud button */}
            <button
              type="button"
              onClick={() => handleSpeakStep(`手順${currentStep.stepNumber}。${currentStep.instruction}`)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                isSpeaking
                  ? "bg-amber-500 text-stone-950 animate-pulse font-black"
                  : "bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700"
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>停止</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>音声で聞く</span>
                </>
              )}
            </button>
          </div>

          {/* Large text instruction */}
          <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-stone-100 leading-relaxed sm:leading-snug">
            {currentStep.instruction}
          </p>

          {/* Tips inside step if available */}
          {currentStep.tip && (
            <div className="bg-amber-950/70 border border-amber-700/60 p-4 rounded-2xl flex items-start gap-3 text-amber-200">
              <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-xs font-black text-amber-300">調理のコツ:</span>
                <p className="text-xs sm:text-sm font-medium leading-relaxed">
                  {currentStep.tip}
                </p>
              </div>
            </div>
          )}

          {/* Timer button if step has a timer */}
          {currentStep.timerMinutes && (
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  onStartTimer(
                    currentStep.timerMinutes || 3,
                    `${recipe.title} (手順${currentStep.stepNumber})`
                  )
                }
                className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-black text-sm rounded-2xl shadow-lg flex items-center gap-2 active:scale-95 transition-all"
              >
                <Timer className="w-5 h-5" />
                <span>{currentStep.timerMinutes}分タイマーをスタート</span>
              </button>
            </div>
          )}
        </div>

        {/* Step Checkbox */}
        <button
          type="button"
          onClick={() => toggleStepDone(currentStepIndex)}
          className={`w-full py-3.5 px-5 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2.5 transition-all border ${
            completedSteps[currentStepIndex]
              ? "bg-emerald-950 text-emerald-300 border-emerald-700"
              : "bg-stone-900/90 text-stone-300 border-stone-800 hover:bg-stone-800"
          }`}
        >
          <CheckCircle2
            className={`w-5 h-5 ${
              completedSteps[currentStepIndex] ? "text-emerald-400" : "text-stone-500"
            }`}
          />
          <span>
            {completedSteps[currentStepIndex]
              ? `手順 ${currentStep.stepNumber} は完了済み`
              : `手順 ${currentStep.stepNumber} を完了済みにする`}
          </span>
        </button>
      </div>

      {/* Bottom Step Controller */}
      <div className="p-4 sm:p-6 border-t border-stone-800 bg-stone-900/95 flex items-center justify-between gap-4 max-w-3xl mx-auto w-full">
        <button
          type="button"
          onClick={() => {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setCurrentStepIndex((prev) => Math.max(0, prev - 1));
          }}
          disabled={currentStepIndex === 0}
          className="px-5 py-3.5 rounded-2xl bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-stone-200 font-extrabold text-sm sm:text-base flex items-center gap-2 transition-all active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>前へ</span>
        </button>

        <span className="text-xs sm:text-sm font-bold text-stone-400">
          手順 {currentStepIndex + 1} / {steps.length}
        </span>

        {currentStepIndex < steps.length - 1 ? (
          <button
            type="button"
            onClick={() => {
              if (window.speechSynthesis) window.speechSynthesis.cancel();
              setIsSpeaking(false);
              setCompletedSteps((prev) => ({ ...prev, [currentStepIndex]: true }));
              setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
            }}
            className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
          >
            <span>次へ進む</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-500 text-stone-950 font-black text-sm sm:text-base flex items-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <span>🎉 調理完了！</span>
          </button>
        )}
      </div>
    </div>
  );
};
