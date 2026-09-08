import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Smartphone,
  Check,
  Send,
  Zap,
} from "lucide-react";

interface SmartphoneCapturePortalProps {
  sessionId: string;
}

export const SmartphoneCapturePortal: React.FC<SmartphoneCapturePortalProps> = ({
  sessionId,
}) => {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [capturedMimeType, setCapturedMimeType] = useState<string>("image/jpeg");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Preference selections on phone
  const [timePref, setTimePref] = useState<string>("all");
  const [cuisinePref, setCuisinePref] = useState<string>("all");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Notify server that smartphone has connected to this session
  useEffect(() => {
    fetch("/api/sync/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    }).catch((err) => console.warn("Failed to notify connect:", err));
  }, [sessionId]);

  // Start phone camera on mount
  useEffect(() => {
    if (!capturedPreview && !uploadSuccess) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [facingMode, capturedPreview, uploadSuccess]);

  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("カメラAPIが非対応です。下のファイル選択をご利用ください。");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => console.warn("Video play error:", err));
      }
    } catch (err: any) {
      console.warn("Mobile camera error:", err);
      setCameraError(
        err.name === "NotAllowedError"
          ? "カメラへのアクセスがブロックされています。ブラウザの設定でカメラを許可するか、「アルバム・ファイルから選択」をお使いください。"
          : "カメラを起動できませんでした。「アルバム・ファイルから選択」から写真を選択してください。"
      );
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
    setCapturedPreview(dataUrl);
    setCapturedMimeType("image/jpeg");
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string;
      if (result) {
        setCapturedPreview(result);
        setCapturedMimeType(file.type || "image/jpeg");
        stopCamera();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendToPC = async () => {
    if (!capturedPreview) return;
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const preferences = {
        time: timePref !== "all" ? timePref : undefined,
        cuisine: cuisinePref !== "all" ? cuisinePref : undefined,
      };

      const res = await fetch("/api/sync/upload-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          imageBase64: capturedPreview,
          mimeType: capturedMimeType,
          preferences,
        }),
      });

      if (!res.ok) {
        throw new Error("PCへの送信に失敗しました。もう一度お試しください。");
      }

      setUploadSuccess(true);
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMessage(err.message || "送信エラーが発生しました。");
    } finally {
      setIsUploading(false);
    }
  };

  if (uploadSuccess) {
    return (
      <div className="min-h-screen bg-stone-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black mb-2 text-white">
          PC画面へ送信完了！
        </h1>
        <p className="text-stone-300 text-sm max-w-sm mb-8 leading-relaxed">
          撮影した食材の写真がPCに届きました。PC画面側でAIがレシピの解析と栄養・調味料計算を行っています。
        </p>

        <button
          onClick={() => {
            setUploadSuccess(false);
            setCapturedPreview(null);
          }}
          className="px-6 py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-2xl text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <Camera className="w-4 h-4" />
          <span>別の食材をもう一度撮る</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="p-4 bg-stone-900/90 backdrop-blur border-b border-stone-800 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">
              スマホ連動カメラ
            </h1>
            <p className="text-[10px] text-emerald-400 font-medium mt-0.5">
              PC画面と同期接続中
            </p>
          </div>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 text-[11px] font-mono font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>LIVE</span>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 p-4 flex flex-col justify-between space-y-4">
        {/* Error notice */}
        {errorMessage && (
          <div className="p-3 bg-red-900/50 border border-red-700 rounded-xl text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Viewfinder / Preview */}
        <div className="relative aspect-4/3 w-full bg-black rounded-3xl overflow-hidden border border-stone-800 shadow-2xl flex items-center justify-center">
          {capturedPreview ? (
            <img
              src={capturedPreview}
              alt="撮影した食材"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Guides */}
              <div className="absolute inset-4 border-2 border-dashed border-white/30 rounded-2xl pointer-events-none flex items-center justify-center">
                <span className="text-[11px] font-bold px-3 py-1 bg-black/60 backdrop-blur rounded-full text-white/80">
                  スーパーの食材を枠内に収めてください
                </span>
              </div>
            </>
          )}

          {/* Camera Error Fallback */}
          {cameraError && !capturedPreview && (
            <div className="absolute inset-0 bg-stone-900/95 p-6 flex flex-col items-center justify-center text-center space-y-4 z-20">
              <AlertCircle className="w-10 h-10 text-amber-400" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-stone-200">
                  カメラが起動できませんでした
                </p>
                <p className="text-[11px] text-stone-400 leading-relaxed max-w-xs">
                  {cameraError}
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>写真・アルバムから選ぶ</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Options (Optional Preferences) */}
        <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-stone-400 font-bold">
            <span>ご希望条件（任意）:</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-stone-400 block mb-1">調理時間</label>
              <select
                value={timePref}
                onChange={(e) => setTimePref(e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 text-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="all">指定なし (おまかせ)</option>
                <option value="10分以内">10分以内の超時短</option>
                <option value="15〜20分">15〜20分程度</option>
                <option value="じっくり">じっくり煮込み</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-stone-400 block mb-1">ジャンル</label>
              <select
                value={cuisinePref}
                onChange={(e) => setCuisinePref(e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 text-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="all">指定なし (おまかせ)</option>
                <option value="和風">和風・ほっこり</option>
                <option value="洋風">洋風・カフェ風</option>
                <option value="中華">中華・スタミナ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 pb-6 space-y-3">
          {capturedPreview ? (
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setCapturedPreview(null);
                  startCamera();
                }}
                disabled={isUploading}
                className="flex-1 py-3.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>撮り直す</span>
              </button>

              <button
                type="button"
                onClick={handleSendToPC}
                disabled={isUploading}
                className="flex-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/40 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>PCへ送信中...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>この写真をPCへ送る</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Album file pick */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-14 h-14 rounded-2xl bg-stone-800 border border-stone-700 text-stone-300 flex flex-col items-center justify-center gap-0.5 hover:bg-stone-700 transition-colors shrink-0"
                title="ライブラリから選択"
              >
                <Upload className="w-5 h-5" />
                <span className="text-[9px]">アルバム</span>
              </button>

              {/* Shutter Button */}
              <button
                type="button"
                onClick={handleCapturePhoto}
                className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black rounded-2xl text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
              >
                <Camera className="w-5 h-5" />
                <span>シャッターを押す</span>
              </button>

              {/* Camera Facing switch */}
              <button
                type="button"
                onClick={() => setFacingMode((p) => (p === "environment" ? "user" : "environment"))}
                className="w-14 h-14 rounded-2xl bg-stone-800 border border-stone-700 text-stone-300 flex flex-col items-center justify-center gap-0.5 hover:bg-stone-700 transition-colors shrink-0"
                title="カメラ切替"
              >
                <RefreshCw className="w-5 h-5" />
                <span className="text-[9px]">切替</span>
              </button>
            </div>
          )}

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
        </div>
      </main>
    </div>
  );
};
