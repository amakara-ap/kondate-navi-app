import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Smartphone,
  CheckCircle2,
  RefreshCw,
  Copy,
  ExternalLink,
  Sparkles,
  Wifi,
  X,
  Camera,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface SmartphoneSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoReceived: (imageBase64: string, mimeType: string, preferences: any) => void;
}

export const SmartphoneSyncModal: React.FC<SmartphoneSyncModalProps> = ({
  isOpen,
  onClose,
  onPhotoReceived,
}) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [syncUrl, setSyncUrl] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [sessionStatus, setSessionStatus] = useState<"waiting" | "connected" | "uploaded">("waiting");
  const [isPolling, setIsPolling] = useState<boolean>(false);

  // Initialize session when modal opens
  useEffect(() => {
    if (!isOpen) {
      setSessionId(null);
      setSyncUrl("");
      setSessionStatus("waiting");
      return;
    }

    let isMounted = true;

    async function initSession() {
      try {
        const res = await fetch("/api/sync/create-session", { method: "POST" });
        const data = await res.json();
        if (isMounted && data.sessionId) {
          setSessionId(data.sessionId);
          // Build absolute URL for smartphone
          const origin = window.location.origin;
          const url = `${origin}?sync_session=${data.sessionId}`;
          setSyncUrl(url);
          setIsPolling(true);
        }
      } catch (err) {
        console.error("Failed to init sync session:", err);
      }
    }

    initSession();

    return () => {
      isMounted = false;
      setIsPolling(false);
    };
  }, [isOpen]);

  // Polling for smartphone photo upload
  useEffect(() => {
    if (!isOpen || !sessionId || !isPolling) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/sync/status/${sessionId}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "connected" && sessionStatus === "waiting") {
          setSessionStatus("connected");
        }

        if (data.status === "uploaded" && data.imageData) {
          setSessionStatus("uploaded");
          setIsPolling(false);
          // Trigger recipe analysis in PC main app
          onPhotoReceived(
            data.imageData,
            data.mimeType || "image/jpeg",
            data.preferences || {}
          );
          onClose();
        }
      } catch (err) {
        console.warn("Polling status error:", err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isOpen, sessionId, isPolling, sessionStatus, onPhotoReceived, onClose]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(syncUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = syncUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      console.warn("Copy link error:", e);
    }
  };

  const handleOpenInNewTab = () => {
    if (syncUrl) {
      window.open(syncUrl, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-white">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl text-white">
                スマホカメラと連動する
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                QRコードを読み取って、スマホで食材を撮影
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Indicator */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-3 h-3 rounded-full ${
                  sessionStatus === "connected"
                    ? "bg-blue-500 animate-pulse"
                    : sessionStatus === "uploaded"
                    ? "bg-emerald-500"
                    : "bg-amber-500 animate-ping"
                }`}
              />
              <span className="text-xs font-bold text-stone-800">
                {sessionStatus === "connected"
                  ? "スマホが接続されました！撮影してください"
                  : sessionStatus === "uploaded"
                  ? "写真を受信しました！解析を開始します..."
                  : "スマホからの接続を待機中..."}
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-stone-400">
              ID: {sessionId?.slice(0, 10)}
            </span>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
            <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-stone-200 shrink-0 flex items-center justify-center">
              {syncUrl ? (
                <QRCodeSVG
                  value={syncUrl}
                  size={160}
                  level="M"
                  includeMargin={false}
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center text-stone-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                </div>
              )}
            </div>

            <div className="space-y-2.5 text-left text-xs sm:text-sm text-stone-600">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  1
                </span>
                <p>スマホの標準カメラで左のQRコードをスキャンします。</p>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  2
                </span>
                <p>スマホ画面でスーパーの食材を撮影して「送信」を押します。</p>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  3
                </span>
                <p className="font-semibold text-emerald-900">
                  撮影した写真が自動でこのPC画面に届き、レシピ提案が始まります！
                </p>
              </div>
            </div>
          </div>

          {/* Direct URL Share / Test Options */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-500 font-semibold">
              <span>またはURLを直接開く / LINE等で共有:</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={syncUrl}
                className="flex-1 bg-stone-100 text-stone-700 border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono select-all outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
              >
                {isCopied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>コピー済</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>コピー</span>
                  </>
                )}
              </button>
              <button
                onClick={handleOpenInNewTab}
                className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 rounded-xl text-xs font-bold transition-colors shrink-0"
                title="新しいタブでテスト開く"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="flex items-center gap-2 text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              専用の一時接続セッションで安全に連動します。撮影した食材写真のみがPCに直接転送されます。
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
