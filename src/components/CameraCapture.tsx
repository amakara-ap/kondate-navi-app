import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  Flame,
  Clock,
  Globe,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Smartphone,
  QrCode,
  Check,
  Search,
  ChevronRight,
  ChevronDown,
  Layers,
  Info,
} from "lucide-react";
import { SAMPLE_PRESETS, PANTRY_STAPLES, SampleIngredientPreset } from "../data/sampleImages";
import { QRCodeSVG } from "qrcode.react";

export interface IngredientCategoryGroup {
  id: string;
  categoryName: string;
  emoji: string;
  description: string;
  items: string[];
}

export const INGREDIENT_CATEGORIES_DATA: IngredientCategoryGroup[] = [
  {
    id: "western_sauces_roux",
    categoryName: "カレー・シチュー・洋風ソース・ルー",
    emoji: "🍛",
    description: "カレールー・カレー粉・ホワイトシチュー・デミグラス・トマトソース・コンソメ等",
    items: [
      "カレールー",
      "カレー粉",
      "ホワイトシチュールー",
      "デミグラスソース",
      "トマトソース（トマト缶）",
      "コンソメ（顆粒/固形）",
      "ブイヨン",
      "ハヤシライスのルー",
      "ホワイトソース（ベシャメル）",
      "ケチャップ",
      "ウスターソース",
      "オイスターソース",
      "めんつゆ",
      "ポン酢",
      "白だし",
    ],
  },
  {
    id: "chicken",
    categoryName: "鶏肉（部位別）",
    emoji: "🍗",
    description: "部位で食感と旨味が変わる人気肉",
    items: ["鶏もも肉", "鶏むね肉", "手羽先", "手羽元", "ささみ", "鶏ひき肉"],
  },
  {
    id: "pork",
    categoryName: "豚肉（部位別）",
    emoji: "🥓",
    description: "ビタミンB1豊富で炒め物・煮物に万能",
    items: ["豚ロース", "豚バラ肉", "豚こま切れ・切り落とし", "豚肩ロース", "豚ひき肉", "豚ヒレ肉"],
  },
  {
    id: "beef",
    categoryName: "牛肉（部位別）",
    emoji: "🥩",
    description: "コクと旨味満点のごちそう肉",
    items: ["牛ロース", "牛バラ・カルビ", "牛タン", "牛ハラミ", "牛こま切れ", "牛ひき肉"],
  },
  {
    id: "processed_meat",
    categoryName: "加工肉（ハム・ウインナー等）",
    emoji: "🌭",
    description: "旨味が凝縮！朝食・炒め物・スープにすぐ使える",
    items: [
      "あらびきウインナー",
      "ポークソーセージ",
      "ロースハム",
      "ハーフベーコン",
      "ブロックベーコン",
      "サラダチキン",
      "フランクフルト",
      "焼豚（チャーシュー）",
    ],
  },
  {
    id: "noodles",
    categoryName: "茹で麺・麺類（そば・うどん等）",
    emoji: "🍜",
    description: "スーパーの定番茹で麺・生麺で手軽に大満足",
    items: [
      "焼きそば（茹で麺）",
      "うどん（茹で麺）",
      "そば（茹で麺）",
      "中華麺・ラーメン",
      "冷凍うどん",
      "パスタ・スパゲッティ",
      "そうめん・素麺",
    ],
  },
  {
    id: "seafood",
    categoryName: "魚介類（海鮮17種）",
    emoji: "🐟",
    description: "魚・貝・甲殻類の旬の海の幸",
    items: [
      "サケ（鮭・サーモン）",
      "サバ（鯖）",
      "ブリ（鰤）",
      "カツオ（鰹）",
      "マグロ（鮪）",
      "アジ（鯵）",
      "イワシ（鰯）",
      "タイ（鯛）",
      "ヒラメ（平目）",
      "タコ（蛸）",
      "イカ（烏賊）",
      "エビ（海老）",
      "カニ（蟹）",
      "アサリ（浅蜊）",
      "ホタテ（帆立）",
      "しじみ（蜆）",
      "カキ（牡蠣）",
    ],
  },
  {
    id: "mushrooms",
    categoryName: "きのこ類",
    emoji: "🍄",
    description: "出汁と香りを引き立てる低カロリー食材",
    items: ["しいたけ", "しめじ", "まいたけ", "えのき", "エリンギ", "マッシュルーム"],
  },
  {
    id: "tofu_konjac",
    categoryName: "こんにゃく・豆腐・加工品",
    emoji: "🧈",
    description: "板こんにゃく・白滝・油揚げ・豆腐等のヘルシー伝統食材",
    items: [
      "板こんにゃく",
      "白滝（しらたき）",
      "糸こんにゃく",
      "絹ごし豆腐",
      "木綿豆腐",
      "うすあげ（油揚げ）",
      "きざみあげ",
      "厚揚げ（生揚げ）",
      "ちくわ",
      "カニカマ",
      "納豆",
      "豆乳",
    ],
  },
  {
    id: "vegetables",
    categoryName: "野菜（葉物・根菜・常備菜）",
    emoji: "🥬",
    description: "ビタミン・食物繊維をプラス",
    items: [
      "キャベツ",
      "白菜",
      "玉ねぎ",
      "長ネギ",
      "人参",
      "もやし",
      "じゃがいも",
      "大根",
      "トマト",
      "ナス",
      "ピーマン",
      "ブロッコリー",
      "ほうれん草",
      "小松菜",
      "レタス",
      "きゅうり",
      "ごぼう",
      "れんこん",
      "山芋（長芋）",
    ],
  },
  {
    id: "egg_dairy",
    categoryName: "卵・乳製品",
    emoji: "🥚",
    description: "コクと栄養をプラス",
    items: ["卵", "ピザ用チーズ", "牛乳", "バター"],
  },
];

interface CameraCaptureProps {
  onAnalyzeImage: (imageBase64: string, mimeType: string, preferences: any) => Promise<void>;
  onAnalyzeText: (ingredients: string[], preferences: any) => Promise<void>;
  isLoading: boolean;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onAnalyzeImage,
  onAnalyzeText,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<"camera" | "manual">("camera");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [capturedMimeType, setCapturedMimeType] = useState<string>("image/jpeg");
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  // Preferences
  const [timePreference, setTimePreference] = useState<string>("all");
  const [cuisinePreference, setCuisinePreference] = useState<string>("all");
  const [moodPreference, setMoodPreference] = useState<string>("all");

  // Manual & staple ingredients
  const [customIngredients, setCustomIngredients] = useState<string[]>([]);
  const [newIngredientInput, setNewIngredientInput] = useState<string>("");
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("chicken");
  const [detectedIngredientTag, setDetectedIngredientTag] = useState<string>("");
  const [isQuickDetecting, setIsQuickDetecting] = useState<boolean>(false);
  const [detectedOcrInfo, setDetectedOcrInfo] = useState<{
    detectedName: string;
    ocrText?: string;
    confidence?: string;
    allDetected?: string[];
  } | null>(null);

  // Default: ALL pantry staples are checked (available) initially
  const [selectedStaples, setSelectedStaples] = useState<string[]>(() =>
    PANTRY_STAPLES.map((staple) => staple.name)
  );

  // User-added custom seasonings (e.g. oyster sauce, ponzu, ketchup, etc.)
  const [customStaples, setCustomStaples] = useState<string[]>([]);
  const [newStapleInput, setNewStapleInput] = useState<string>("");

  // Live Multimodal AI OCR & Package Detection
  const performLiveDetection = async (imageBase64: string, mimeType: string = "image/jpeg") => {
    setIsQuickDetecting(true);
    setDetectedOcrInfo(null);
    try {
      const res = await fetch("/api/quick-detect-ingredient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.detectedName && data.detectedName !== "食材写真") {
          setDetectedIngredientTag(data.detectedName);
          setDetectedOcrInfo(data);
        } else if (data.allDetected && data.allDetected.length > 0) {
          setDetectedIngredientTag(data.allDetected[0]);
          setDetectedOcrInfo(data);
        }
      }
    } catch (err) {
      console.warn("Live package detection request failed:", err);
    } finally {
      setIsQuickDetecting(false);
    }
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize smartphone rear camera when camera tab is active
  useEffect(() => {
    if (activeTab === "camera" && !capturedPreview) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [activeTab, facingMode, capturedPreview]);

  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("ブラウザのカメラ機能が非対応です。写真撮影ボタンまたはアルバム選択をご利用ください。");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setCameraStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch((err) => console.warn("Video play error:", err));
      }
    } catch (err: any) {
      console.warn("Camera start error:", err);
      setCameraError(
        err.name === "NotAllowedError"
          ? "カメラへのアクセスが許可されていません。「写真撮影・アルバムから選択」ボタンを押すか、ブラウザのカメラ設定をご確認ください。"
          : "カメラを自動起動できませんでした。下の「写真を撮影する」ボタンからスマホカメラを起動してください。"
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

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Capture frame from active video element
  const handleShutterClick = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

    setCapturedPreview(dataUrl);
    setCapturedMimeType("image/jpeg");
    setDetectedIngredientTag("");
    stopCamera();
    performLiveDetection(dataUrl, "image/jpeg");
  };

  // Handle mobile native camera or file upload
  const handleNativeImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const mime = file.type || "image/jpeg";
        setCapturedPreview(result);
        setCapturedMimeType(mime);
        setDetectedIngredientTag("");
        stopCamera();
        performLiveDetection(result, mime);
      }
    };
    reader.readAsDataURL(file);
  };

  // Select sample supermarket ingredients preset
  const handleSelectPreset = (preset: SampleIngredientPreset) => {
    const primary = preset.ingredients[0] || preset.name.split("&")[0].trim();
    setCapturedPreview(preset.imageUrl);
    setCapturedMimeType("image/jpeg");
    setDetectedIngredientTag(primary);
    setDetectedOcrInfo({
      detectedName: primary,
      ocrText: preset.description,
      confidence: "high",
      allDetected: preset.ingredients,
    });
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedPreview(null);
    setCapturedMimeType("image/jpeg");
    setDetectedIngredientTag("");
    setDetectedOcrInfo(null);
    if (activeTab === "camera") {
      startCamera();
    }
  };

  const toggleStaple = (staple: string) => {
    if (selectedStaples.includes(staple)) {
      setSelectedStaples(selectedStaples.filter((s) => s !== staple));
    } else {
      setSelectedStaples([...selectedStaples, staple]);
    }
  };

  const handleAddCustomStaple = (stapleName?: string) => {
    const nameToAdd = (stapleName || newStapleInput).trim();
    if (nameToAdd) {
      if (!customStaples.includes(nameToAdd)) {
        setCustomStaples([...customStaples, nameToAdd]);
      }
      if (!selectedStaples.includes(nameToAdd)) {
        setSelectedStaples([...selectedStaples, nameToAdd]);
      }
      if (!stapleName) {
        setNewStapleInput("");
      }
    }
  };

  const handleRemoveCustomStaple = (stapleName: string) => {
    setCustomStaples(customStaples.filter((s) => s !== stapleName));
    setSelectedStaples(selectedStaples.filter((s) => s !== stapleName));
  };

  const handleAddCustomIngredient = () => {
    if (newIngredientInput.trim()) {
      setCustomIngredients([...customIngredients, newIngredientInput.trim()]);
      setNewIngredientInput("");
    }
  };

  const handleRemoveCustomIngredient = (index: number) => {
    setCustomIngredients(customIngredients.filter((_, i) => i !== index));
  };

  // Trigger AI analysis with preferences
  const buildPreferences = () => {
    return {
      time: timePreference !== "all" ? timePreference : undefined,
      cuisine: cuisinePreference !== "all" ? cuisinePreference : undefined,
      mood: moodPreference !== "all" ? moodPreference : undefined,
      staples: selectedStaples,
      customIngredients: activeTab === "manual" ? customIngredients : undefined,
      detectedHint: activeTab === "camera" && capturedPreview ? detectedIngredientTag : undefined,
    };
  };

  const handleAnalyze = async () => {
    if (activeTab === "manual") {
      let finalIngredients = [...customIngredients];
      if (newIngredientInput.trim()) {
        const trimmed = newIngredientInput.trim();
        if (!finalIngredients.includes(trimmed)) {
          finalIngredients.push(trimmed);
          setCustomIngredients(finalIngredients);
        }
        setNewIngredientInput("");
      }
      if (finalIngredients.length === 0) return;
      await onAnalyzeText(finalIngredients, {
        time: timePreference !== "all" ? timePreference : undefined,
        cuisine: cuisinePreference !== "all" ? cuisinePreference : undefined,
        mood: moodPreference !== "all" ? moodPreference : undefined,
        staples: selectedStaples,
        customIngredients: finalIngredients,
      });
    } else if (capturedPreview) {
      await onAnalyzeImage(capturedPreview, capturedMimeType, buildPreferences());
    }
  };

  const handleAddPresetIngredient = (name: string) => {
    if (!customIngredients.includes(name)) {
      setCustomIngredients([...customIngredients, name]);
    }
  };

  const appUrl = typeof window !== "undefined" ? window.location.href.split("?")[0] : "";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5">
      {/* Mobile Shopping Top Banner - Soft, appetizing culinary pastel design with scattered food illustrations */}
      <div className="bg-gradient-to-br from-amber-50/95 via-rose-50/80 via-emerald-50/75 to-teal-50/90 text-stone-900 rounded-3xl p-5 sm:p-7 shadow-xs relative overflow-hidden border border-amber-200/70">
        {/* Soft subtle glowing ambient spheres */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 -mb-10 w-44 h-44 bg-rose-200/35 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-36 h-36 bg-emerald-200/30 rounded-full blur-xl pointer-events-none" />

        {/* Scattered background floating food illustrations / badges */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-45 sm:opacity-55">
          <span className="absolute -top-1 left-4 text-3xl rotate-12 drop-shadow-xs">🍅</span>
          <span className="absolute top-3 left-1/3 text-2xl -rotate-12 drop-shadow-xs">🥚</span>
          <span className="absolute top-10 right-24 text-3xl rotate-6 drop-shadow-xs">🥩</span>
          <span className="absolute -bottom-2 left-16 text-3xl rotate-45 drop-shadow-xs">🥕</span>
          <span className="absolute bottom-3 left-1/2 text-2xl -rotate-6 drop-shadow-xs">🥦</span>
          <span className="absolute top-1/3 right-8 text-3xl -rotate-12 drop-shadow-xs">🐟</span>
          <span className="absolute bottom-5 right-36 text-2xl rotate-12 drop-shadow-xs">🍄</span>
          <span className="absolute top-2 right-1/3 text-xl -rotate-45 drop-shadow-xs">🧅</span>
          <span className="absolute bottom-1 right-10 text-2xl rotate-6 drop-shadow-xs">🥑</span>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-2.5 max-w-xl">
            {/* Colorful top tag badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-amber-300/80 text-xs font-black text-amber-900 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>スーパー買い物中・スマホ専用スキャナー</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900">
              特売の食材をスマホでパッと撮影！
            </h1>

            <p className="text-stone-700 text-xs sm:text-sm leading-relaxed font-medium">
              肉・魚・野菜を写すだけで、AIが作れる献立を即座に提案。
              作りたい人数に合わせて食材・調味料の量と1人前のカロリーを自動計算します。
            </p>

            {/* Scattered colorful mini ingredient badges */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { emoji: "🥚", label: "たまご", bg: "bg-amber-100/90 text-amber-900 border-amber-300/70" },
                { emoji: "🥩", label: "豚肉・鶏肉", bg: "bg-rose-100/90 text-rose-900 border-rose-300/70" },
                { emoji: "🐟", label: "鮭・魚", bg: "bg-sky-100/90 text-sky-900 border-sky-300/70" },
                { emoji: "🥬", label: "キャベツ", bg: "bg-emerald-100/90 text-emerald-900 border-emerald-300/70" },
                { emoji: "🍅", label: "トマト", bg: "bg-red-100/90 text-red-900 border-red-300/70" },
                { emoji: "🥕", label: "にんじん", bg: "bg-orange-100/90 text-orange-900 border-orange-300/70" },
              ].map((item, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border shadow-2xs ${item.bg}`}
                >
                  <span>{item.emoji}</span>
                  <span>{item.label}</span>
                </span>
              ))}
            </div>
          </div>

          {/* QR Code trigger for desktop users to scan with their phone */}
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="px-3.5 py-2.5 bg-white hover:bg-stone-50 border border-stone-300/80 text-stone-800 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 shadow-xs active:scale-98"
          >
            <Smartphone className="w-4 h-4 text-emerald-700" />
            <span>スマホで開く（QR）</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation: 2 Clear, Purpose-Built Tabs */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-1.5 flex gap-1.5 sm:gap-2 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab("camera")}
          className={`flex-1 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
            activeTab === "camera"
              ? "bg-emerald-700 text-white shadow-xs"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          }`}
        >
          <Camera className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">📸 写真でスキャン（撮影・アルバム）</span>
          <span className="sm:hidden">📸 写真でスキャン</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("manual")}
          className={`flex-1 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
            activeTab === "manual"
              ? "bg-emerald-700 text-white shadow-xs"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">✏️ 食材を手入力・ストック指定</span>
          <span className="sm:hidden">✏️ 手入力・食材選択</span>
        </button>
      </div>

      {/* Capture / Input Section */}
      <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-xs space-y-6">
        {/* Tab 1: Photo Scanner (Live Camera + Native Cam + Album) */}
        {activeTab === "camera" ? (
          <div className="space-y-4">
            {capturedPreview ? (
              /* State A: Photo captured review */
              <div className="relative aspect-4/3 sm:aspect-16/9 max-w-xl mx-auto rounded-2xl overflow-hidden bg-black border border-stone-200 shadow-inner">
                <img
                  src={capturedPreview}
                  alt="撮影した食材"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>食材写真をセットしました</span>
                </div>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="absolute bottom-3 right-3 bg-stone-900/80 hover:bg-stone-900 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>撮り直す・別の写真</span>
                </button>
              </div>
            ) : (
              /* State B: Live camera stream on smartphone */
              <div className="space-y-3">
                <div className="relative aspect-4/3 sm:aspect-16/9 max-w-xl mx-auto rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 shadow-md flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Supermarket Viewfinder Overlay */}
                  <div className="absolute inset-4 sm:inset-6 border-2 border-dashed border-white/50 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                    <div className="flex justify-between items-center">
                      <span className="bg-black/60 backdrop-blur text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                        🏷️ パッケージ・ラベルシール・食材を枠内に
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="bg-black/60 backdrop-blur text-white/90 text-[11px] font-medium px-3 py-1 rounded-full">
                        商品名や肉・魚・野菜・茹で麺・加工肉を撮影
                      </span>
                    </div>
                  </div>

                  {/* Camera error fallback or direct native shutter */}
                  {cameraError && (
                    <div className="absolute inset-0 bg-stone-900/95 p-6 flex flex-col items-center justify-center text-center space-y-4 z-20">
                      <AlertCircle className="w-10 h-10 text-amber-400" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white">
                          スマホカメラを起動
                        </p>
                        <p className="text-xs text-stone-300 max-w-xs leading-relaxed">
                          下のボタンを押すとスマホのカメラが起動し、スーパーの食材を直接撮影できます。
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-950/50"
                      >
                        <Camera className="w-5 h-5" />
                        <span>スマホカメラで撮影する</span>
                      </button>
                    </div>
                  )}

                  {/* Shutter controls overlay */}
                  {!cameraError && (
                    <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 z-10">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-11 h-11 rounded-full bg-black/60 backdrop-blur text-white hover:bg-black/80 flex items-center justify-center transition-colors shadow-md"
                        title="アルバムから選択"
                      >
                        <Upload className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={handleShutterClick}
                        className="w-16 h-16 rounded-full bg-white text-emerald-800 p-1.5 shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-4 border-emerald-600"
                        title="シャッターを押す"
                      >
                        <div className="w-11 h-11 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                          <Camera className="w-5 h-5" />
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={toggleCameraFacing}
                        className="w-11 h-11 rounded-full bg-black/60 backdrop-blur text-white hover:bg-black/80 flex items-center justify-center transition-colors shadow-md"
                        title="カメラ切替"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Direct Action Buttons for Smartphone Camera & Library */}
                <div className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto pt-1">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors border border-stone-200"
                  >
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <span>スマホ標準カメラで撮影</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors border border-stone-200"
                  >
                    <Upload className="w-4 h-4 text-emerald-700" />
                    <span>アルバムの写真を選択</span>
                  </button>
                </div>

                {/* Packaging & Label OCR Assistance Notice */}
                <div className="max-w-xl mx-auto bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed text-amber-950">
                    <span className="font-bold block text-amber-900 mb-0.5">🏷️ パッケージの商品名シール・印字文字も自動認識！</span>
                    生肉パック・魚の切り身・カット野菜の値札シールや、加工肉（ハム・ベーコン・ウインナー・サラダチキン）、茹で麺（そば・うどん・焼きそば・ラーメン）、油揚げ（うすあげ・きざみあげ・あつあげ）などのパッケージをそのまま撮影してもAIが商品名を正確に読み取ります。
                  </div>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        ) : (
          /* Tab 2: Manual Ingredients Input (Dedicated, Supermarket Stock Optimized) */
          <div className="space-y-5 max-w-2xl mx-auto">
            {/* Free text input box */}
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1.5">
                使いたい食材・冷蔵庫の残り・特売品を入力（自由入力）:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newIngredientInput}
                  onChange={(e) => setNewIngredientInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomIngredient();
                    }
                  }}
                  placeholder="例: 鶏むね肉、ウインナー、焼きそば（茹で麺）、うすあげ、豚バラ、絹ごし豆腐..."
                  className="flex-1 px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none placeholder:text-stone-400"
                />
                <button
                  type="button"
                  onClick={handleAddCustomIngredient}
                  className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shrink-0 shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>追加</span>
                </button>
              </div>
            </div>

            {/* Quick supermarket staple shortcut chips (Includes 絹ごし豆腐, 加工肉, 茹で麺 and popular essentials) */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-stone-600 block flex items-center gap-1">
                <span>🛒 ワンタップで追加（スーパーの特売・人気食材）:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: "カレールー", emoji: "🍛" },
                  { name: "カレー粉", emoji: "🍛" },
                  { name: "ホワイトシチュールー", emoji: "🍲" },
                  { name: "デミグラスソース", emoji: "🥘" },
                  { name: "トマトソース（トマト缶）", emoji: "🥫" },
                  { name: "コンソメ", emoji: "🥣" },
                  { name: "ブイヨン", emoji: "🍲" },
                  { name: "豚バラ肉", emoji: "🥓" },
                  { name: "豚こま切れ", emoji: "🥓" },
                  { name: "鶏もも肉", emoji: "🍗" },
                  { name: "鶏むね肉", emoji: "🍗" },
                  { name: "牛こま切れ", emoji: "🥩" },
                  { name: "あらびきウインナー", emoji: "🌭" },
                  { name: "ロースハム", emoji: "🥓" },
                  { name: "ハーフベーコン", emoji: "🥓" },
                  { name: "サラダチキン", emoji: "🍗" },
                  { name: "玉ねぎ", emoji: "🧅" },
                  { name: "じゃがいも", emoji: "🥔" },
                  { name: "人参", emoji: "🥕" },
                  { name: "キャベツ", emoji: "🥬" },
                  { name: "板こんにゃく", emoji: "🟫" },
                  { name: "白滝（しらたき）", emoji: "🍜" },
                  { name: "焼きそば（茹で麺）", emoji: "🍜" },
                  { name: "うどん（茹で麺）", emoji: "🍜" },
                  { name: "うすあげ（油揚げ）", emoji: "🧈" },
                  { name: "きざみあげ", emoji: "🧈" },
                  { name: "絹ごし豆腐", emoji: "🧈" },
                  { name: "木綿豆腐", emoji: "🧈" },
                  { name: "鮭（サケ）", emoji: "🐟" },
                  { name: "サバ", emoji: "🐟" },
                  { name: "しめじ", emoji: "🍄" },
                  { name: "しいたけ", emoji: "🍄" },
                  { name: "もやし", emoji: "🌱" },
                  { name: "山芋（長芋）", emoji: "🥔" },
                  { name: "卵", emoji: "🥚" },
                  { name: "白菜", emoji: "🥬" },
                ].map((item) => {
                  const isAlreadyAdded = customIngredients.includes(item.name);
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => handleAddPresetIngredient(item.name)}
                      disabled={isAlreadyAdded}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                        isAlreadyAdded
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold opacity-70 cursor-default"
                          : "bg-stone-50 hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 border border-stone-200 hover:border-emerald-300 active:scale-95"
                      }`}
                    >
                      <span>{item.emoji}</span>
                      <span>{item.name}</span>
                      {isAlreadyAdded ? (
                        <Check className="w-3 h-3 text-emerald-700" />
                      ) : (
                        <Plus className="w-3 h-3 text-stone-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed Cut & Variety Selector by Category */}
            <div className="bg-stone-50/90 border border-stone-200/90 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-black text-stone-900">
                    部位・種類から詳しく選ぶ（鶏・豚・牛・魚介17種・きのこ・豆腐）:
                  </span>
                </div>
                <span className="text-[10px] text-stone-500">
                  タップで食材リストに追加
                </span>
              </div>

              {/* Category switcher pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {INGREDIENT_CATEGORIES_DATA.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryTab(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                      selectedCategoryTab === cat.id
                        ? "bg-emerald-700 text-white shadow-xs scale-102"
                        : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.categoryName}</span>
                  </button>
                ))}
              </div>

              {/* Active Category items list */}
              {(() => {
                const currentGroup =
                  INGREDIENT_CATEGORIES_DATA.find((g) => g.id === selectedCategoryTab) ||
                  INGREDIENT_CATEGORIES_DATA[0];
                return (
                  <div className="pt-1 space-y-2">
                    <p className="text-[11px] text-stone-500 font-medium">
                      {currentGroup.description}（{currentGroup.items.length}種類）:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {currentGroup.items.map((itemName) => {
                        const isSelected = customIngredients.includes(itemName);
                        return (
                          <button
                            key={itemName}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setCustomIngredients(customIngredients.filter((c) => c !== itemName));
                              } else {
                                handleAddPresetIngredient(itemName);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                              isSelected
                                ? "bg-emerald-600 text-white shadow-2xs ring-2 ring-emerald-500/30"
                                : "bg-white text-stone-700 hover:text-emerald-900 border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                            }`}
                          >
                            <span>{currentGroup.emoji}</span>
                            <span>{itemName}</span>
                            {isSelected ? (
                              <Check className="w-3 h-3 text-white" />
                            ) : (
                              <Plus className="w-3 h-3 text-stone-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Added ingredient tags */}
            {customIngredients.length > 0 ? (
              <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-950 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>献立に使う指定食材（{customIngredients.length}品）:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setCustomIngredients([])}
                    className="text-[11px] text-stone-500 hover:text-rose-600 underline font-semibold"
                  >
                    すべてクリア
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {customIngredients.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-300 text-emerald-900 rounded-xl text-xs font-black shadow-2xs"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomIngredient(idx)}
                        className="text-emerald-700 hover:text-rose-600 transition-colors p-0.5"
                        title="削除"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-500 text-center py-3 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                上の部位・種類一覧やワンタップボタンを押すか、食材名を入力して追加してください。
              </p>
            )}
          </div>
        )}

        {/* Hidden inputs for native mobile camera & album */}
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleNativeImageChange}
          accept="image/*"
          capture="environment"
          className="hidden"
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleNativeImageChange}
          accept="image/*"
          className="hidden"
        />

        {/* Recognized ingredient confirmation & quick switcher when photo is present */}
        {activeTab === "camera" && capturedPreview && (
          <div className="bg-gradient-to-br from-emerald-50/95 via-teal-50/90 to-amber-50/80 border border-emerald-300/90 rounded-3xl p-4 sm:p-5 space-y-3.5 max-w-xl mx-auto shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="text-xs font-black text-stone-900">
                  写真・パッケージから認識された主役食材:
                </span>
              </div>

              {isQuickDetecting ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-white border border-emerald-300 px-3 py-1 rounded-xl shadow-2xs animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>AIが文字・食材を解読中...</span>
                </span>
              ) : (
                <span className="text-sm font-black text-emerald-900 bg-white border-2 border-emerald-500 px-3.5 py-1 rounded-xl shadow-xs flex items-center gap-1.5">
                  <span>✨</span>
                  <span>{detectedIngredientTag || "食材写真"}</span>
                </span>
              )}
            </div>

            {/* Packaging OCR text badge */}
            {detectedOcrInfo?.ocrText && !isQuickDetecting && (
              <div className="text-[11px] bg-white/90 border border-emerald-200/90 rounded-xl px-3 py-2 text-stone-800 flex items-start gap-2 shadow-2xs">
                <span className="font-bold text-emerald-800 shrink-0">🏷️ 読み取った文字:</span>
                <span className="font-semibold text-stone-800 leading-snug">
                  {detectedOcrInfo.ocrText}
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <p className="text-[11px] text-stone-600 font-medium leading-relaxed">
                ※ 毛筆体やデザイン書体もAIが自動認識しました。別の食材に修正・変更したい場合は下のボタンで1タップ切り替え可能です。
              </p>
              
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { key: "板こんにゃく", label: "🟫 板こんにゃく" },
                  { key: "白滝（しらたき）", label: "🍜 しらたき・糸こん" },
                  { key: "あらびきウインナー", label: "🌭 ウインナー・ハム" },
                  { key: "焼きそば（茹で麺）", label: "🍜 焼きそば（茹で麺）" },
                  { key: "うどん（茹で麺）", label: "🍜 うどん（茹で麺）" },
                  { key: "うすあげ（油揚げ）", label: "🧈 油揚げ・きざみあげ" },
                  { key: "絹ごし豆腐", label: "🧈 絹ごし豆腐" },
                  { key: "豚バラ肉", label: "🥓 豚バラ肉" },
                  { key: "豚ロース", label: "🥓 豚ロース" },
                  { key: "鶏もも肉", label: "🍗 鶏もも肉" },
                  { key: "鶏むね肉", label: "🍗 鶏むね肉" },
                  { key: "牛肉", label: "🥩 牛肉" },
                  { key: "鮭・魚", label: "🐟 魚介・鮭" },
                  { key: "キャベツ", label: "🥬 キャベツ" },
                  { key: "きのこ", label: "🍄 きのこ" },
                  { key: "卵", label: "🥚 卵" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setDetectedIngredientTag(item.key);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      detectedIngredientTag === item.key
                        ? "bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-600/30 scale-102"
                        : "bg-white text-stone-700 border border-stone-200 hover:bg-emerald-50 hover:text-emerald-900"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick manual edit input if user wants something specific */}
            <div className="pt-2 border-t border-emerald-200/60 flex items-center gap-2">
              <input
                type="text"
                value={detectedIngredientTag}
                onChange={(e) => setDetectedIngredientTag(e.target.value)}
                placeholder="直接食材名を入力して修正（例: 生芋板こんにゃく）"
                className="flex-1 px-3 py-1.5 bg-white border border-emerald-200 rounded-xl text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-emerald-600"
              />
              <span className="text-[10px] text-stone-500 font-medium shrink-0">
                主役食材として確定
              </span>
            </div>
          </div>
        )}

        {/* Quick Shopping Condition Filters */}
        <div className="border-t border-stone-200 pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-stone-800 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
              <span>献立のご希望条件（任意）</span>
            </h3>
            <span className="text-[11px] text-stone-500 font-medium">
              売り場で迷ったときのおまかせ設定
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Time Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>調理時間の目安</span>
              </label>
              <select
                value={timePreference}
                onChange={(e) => setTimePreference(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium text-stone-800 outline-none focus:border-emerald-600 focus:bg-white"
              >
                <option value="all">指定なし (おまかせ)</option>
                <option value="10分以内の超時短">10分以内の超時短スピード料理</option>
                <option value="15〜20分のお手軽">15〜20分のお手軽献立</option>
                <option value="じっくり煮込み・メイン">じっくり煮込み・ごちそう</option>
              </select>
            </div>

            {/* Cuisine Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-600 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-stone-400" />
                <span>ジャンル・味付け</span>
              </label>
              <select
                value={cuisinePreference}
                onChange={(e) => setCuisinePreference(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium text-stone-800 outline-none focus:border-emerald-600 focus:bg-white"
              >
                <option value="all">指定なし (バランス重視)</option>
                <option value="和風・定番">和風・ほっこり定番</option>
                <option value="洋風・カフェ風">洋風・カフェ風</option>
                <option value="中華・スタミナ">中華・スタミナ炒め</option>
                <option value="エスニック・スパイシー">エスニック・カレー風味</option>
              </select>
            </div>

            {/* Mood / Health Filter */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-600 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-stone-400" />
                <span>健康・テーマ</span>
              </label>
              <select
                value={moodPreference}
                onChange={(e) => setMoodPreference(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-medium text-stone-800 outline-none focus:border-emerald-600 focus:bg-white"
              >
                <option value="all">指定なし</option>
                <option value="高タンパク・低脂質">高タンパク・ヘルシー</option>
                <option value="野菜たっぷり・食物繊維">野菜たっぷり摂りたい</option>
                <option value="子どもも喜ぶ味付け">子どもが喜ぶ味付け</option>
                <option value="おつまみ・晩酌">晩酌のおつまみ</option>
              </select>
            </div>
          </div>

            {/* Pantry Staples Toggle & Manual Seasoning Addition */}
            <div className="space-y-3 pt-1 bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-[11px] font-extrabold text-stone-800 flex items-center gap-1">
                  <span>🧂 家にある基本調味料（初期はすべて「有る」状態）:</span>
                </span>
                <span className="text-[10px] text-stone-500 font-medium">
                  ※ 家に無い調味料をタップして消去できます
                </span>
              </div>

              {/* Default Staples list */}
              <div className="flex flex-wrap gap-1.5">
                {PANTRY_STAPLES.map((staple) => {
                  const isChecked = selectedStaples.includes(staple.name);
                  return (
                    <button
                      key={staple.name}
                      type="button"
                      onClick={() => toggleStaple(staple.name)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                        isChecked
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs"
                          : "bg-stone-200/70 text-stone-400 border border-stone-300 line-through opacity-70"
                      }`}
                    >
                      <span>{staple.icon}</span>
                      <span>{staple.name}</span>
                      {isChecked ? (
                        <Check className="w-3 h-3 text-emerald-700" />
                      ) : (
                        <X className="w-3 h-3 text-stone-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* User-added Custom Seasonings */}
              {customStaples.length > 0 && (
                <div className="pt-1 border-t border-stone-200/80">
                  <span className="text-[10px] font-bold text-amber-900 block mb-1.5">
                    ✨ 手入力で追加した調味料:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {customStaples.map((staple) => {
                      const isChecked = selectedStaples.includes(staple);
                      return (
                        <div
                          key={staple}
                          className={`inline-flex items-center rounded-xl text-xs font-bold transition-all border ${
                            isChecked
                              ? "bg-amber-100/90 text-amber-950 border-amber-300 shadow-2xs"
                              : "bg-stone-200/70 text-stone-400 border-stone-300 line-through opacity-70"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleStaple(staple)}
                            className="px-2.5 py-1 flex items-center gap-1"
                          >
                            <span>🥄</span>
                            <span>{staple}</span>
                            {isChecked ? (
                              <Check className="w-3 h-3 text-amber-800" />
                            ) : (
                              <X className="w-3 h-3 text-stone-400" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomStaple(staple)}
                            className="pr-2 pl-0.5 py-1 text-stone-400 hover:text-rose-600 transition-colors"
                            title="削除"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Manual Seasoning Input Form */}
              <div className="pt-2 border-t border-stone-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>家にある調味料を手入力で追加:</span>
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newStapleInput}
                    onChange={(e) => setNewStapleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustomStaple();
                      }
                    }}
                    placeholder="例: オイスターソース、ポン酢、豆板醤、ケチャップ..."
                    className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-800 placeholder-stone-400 outline-none focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCustomStaple()}
                    disabled={!newStapleInput.trim()}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>追加</span>
                  </button>
                </div>

                {/* Quick Add Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] text-stone-400 font-medium">よくある調味料:</span>
                  {[
                    "ポン酢",
                    "めんつゆ",
                    "オイスターソース",
                    "ケチャップ",
                    "バター",
                    "豆板醤",
                    "白だし",
                    "ウスターソース",
                    "カレー粉",
                    "コンソメ",
                  ].map((presetName) => (
                    <button
                      key={presetName}
                      type="button"
                      onClick={() => handleAddCustomStaple(presetName)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                        customStaples.includes(presetName)
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold"
                          : "bg-white text-stone-600 border-stone-200 hover:border-emerald-400 hover:text-emerald-700"
                      }`}
                    >
                      + {presetName}
                    </button>
                  ))}
                </div>
              </div>
            </div>
        </div>

        {/* Big Action Submit Button */}
        <div className="pt-2">
          <button
            type="button"
            id="analyze-submit-button"
            onClick={handleAnalyze}
            disabled={
              isLoading ||
              (!capturedPreview && activeTab !== "manual") ||
              (activeTab === "manual" && customIngredients.length === 0)
            }
            className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white text-base sm:text-lg font-black rounded-2xl shadow-md hover:shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>AIが食材を解析して5種類のレシピを作成中...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
                <span className="hidden sm:inline">この食材でレシピ5種類を提案する（人数・調味料・カロリー計算）</span>
                <span className="sm:hidden text-sm sm:text-base font-black">厳選レシピ5品をAI提案（分量・カロリー計算）</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* QR Code Modal for opening directly on smartphone */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-stone-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <Smartphone className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-stone-900">
                スマホで開いてホーム画面に追加
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                スマホのカメラでQRコードを読み取ると、スマホ上で直接起動できます。「ホーム画面に追加」することで、ストアアプリのようにダウンロードして使えます。
              </p>
            </div>

            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex items-center justify-center">
              <QRCodeSVG value={appUrl} size={180} level="M" />
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 text-left space-y-1">
              <p className="font-bold text-stone-800">📲 ホーム画面への追加方法:</p>
              <p>・iPhone: Safariの「共有」➔「ホーム画面に追加」</p>
              <p>・Android: Chromeメニュー「︙」➔「アプリをインストール」</p>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
