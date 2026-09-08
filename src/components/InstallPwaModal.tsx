import React, { useState, useEffect } from "react";
import {
  Smartphone,
  Download,
  Share2,
  PlusSquare,
  CheckCircle2,
  X,
  Sparkles,
  Layers,
  Zap,
  ArrowRight,
} from "lucide-react";

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "other">("ios");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Detect OS
    const ua = navigator.userAgent || "";
    if (/iPhone|iPad|iPod/i.test(ua)) {
      setDeviceType("ios");
    } else if (/Android/i.test(ua)) {
      setDeviceType("android");
    } else {
      setDeviceType("other");
    }

    // Check if already in standalone display mode
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    // Capture Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">
                スマホにアプリを直接保存
              </h3>
              <p className="text-xs text-emerald-100">
                ホーム画面に追加してアプリとして使用
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection for iOS vs Android */}
        <div className="p-4 bg-stone-50 border-b border-stone-100 flex gap-2">
          <button
            onClick={() => setDeviceType("ios")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              deviceType === "ios"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-stone-200 text-stone-700 hover:bg-stone-300"
            }`}
          >
            iPhone (Safari) の場合
          </button>
          <button
            onClick={() => setDeviceType("android")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              deviceType === "android"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-stone-200 text-stone-700 hover:bg-stone-300"
            }`}
          >
            Android (Chrome) の場合
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {isInstalled ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-sm font-bold text-emerald-900">
                すでにスマホのホーム画面にインストールされています！
              </p>
              <p className="text-xs text-emerald-700">
                ホーム画面のアプリアイコンから直接起動してお使いいただけます。
              </p>
            </div>
          ) : deviceType === "ios" ? (
            /* iPhone Safari instructions */
            <div className="space-y-3">
              <p className="text-xs font-bold text-stone-800">
                iPhoneのSafariで開いて、たった2ステップで追加できます：
              </p>

              <div className="flex items-start gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="w-7 h-7 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  1
                </div>
                <div className="text-xs text-stone-700 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-stone-900">
                    画面下の <Share2 className="w-4 h-4 text-blue-600 inline" /> 「共有ボタン」をタップ
                  </p>
                  <p className="text-stone-500 text-[11px]">
                    Safariブラウザの画面下部中央にある上矢印の四角アイコンを押します。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="w-7 h-7 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  2
                </div>
                <div className="text-xs text-stone-700 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-stone-900">
                    <PlusSquare className="w-4 h-4 text-stone-700 inline" /> 「ホーム画面に追加」を選択
                  </p>
                  <p className="text-stone-500 text-[11px]">
                    メニューを少し下にスクロールして「ホーム画面に追加」➔ 右上の「追加」をタップ。
                  </p>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  ホーム画面に「献立ナビ」アイコンが追加され、次回からストアのアプリ同様に全画面で即座に起動できます！
                </span>
              </div>
            </div>
          ) : (
            /* Android instructions */
            <div className="space-y-3">
              <p className="text-xs font-bold text-stone-800">
                Android (Chrome) での追加方法：
              </p>

              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>ワンタップでアプリをインストール</span>
                </button>
              )}

              <div className="flex items-start gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="w-7 h-7 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  1
                </div>
                <div className="text-xs text-stone-700 space-y-1">
                  <p className="font-bold text-stone-900">
                    Chrome右上のメニュー「︙」をタップ
                  </p>
                  <p className="text-stone-500 text-[11px]">
                    ブラウザ右上の3点リーダーアイコンを押します。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="w-7 h-7 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  2
                </div>
                <div className="text-xs text-stone-700 space-y-1">
                  <p className="font-bold text-stone-900">
                    「アプリをインストール」または「ホーム画面に追加」
                  </p>
                  <p className="text-stone-500 text-[11px]">
                    確認ダイアログで「インストール」を押すとスマホに追加されます。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Benefits */}
          <div className="pt-2 border-t border-stone-100 space-y-1 text-[11px] text-stone-500">
            <p className="font-bold text-stone-700">💡 ホーム画面に追加するメリット:</p>
            <p>・スーパーの店頭でブラウザのアドレスバーなしの全画面で高速起動</p>
            <p>・お気に入りレシピや買い物リストを素早く確認可能</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-stone-700 hover:text-stone-900 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
