import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { CameraCapture } from "./components/CameraCapture";
import { RecipeCard } from "./components/RecipeCard";
import { RecipeDetailView } from "./components/RecipeDetailView";
import { SavedRecipesView } from "./components/SavedRecipesView";
import { CookingTimer } from "./components/CookingTimer";
import { SmartphoneCapturePortal } from "./components/SmartphoneCapturePortal";
import { InstallPwaModal } from "./components/InstallPwaModal";
import { NativeAdCard } from "./components/NativeAdCard";
import { PrivacyTermsModal } from "./components/PrivacyTermsModal";
import { Recipe, AnalysisResult, DetectedIngredient } from "./types";
import { Sparkles, Utensils, AlertCircle, ArrowLeft, RefreshCw, Layers, CheckCircle2 } from "lucide-react";
import { generateSmartRecipes, detectIngredientsFromImageBuffer } from "./utils/recipeGenerator";

export default function App() {
  // Check if opened as smartphone camera portal via QR code or direct sync URL
  const [mobileSyncSessionId, setMobileSyncSessionId] = useState<string | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("sync_session");
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState<"camera" | "recipes" | "detail" | "saved">("camera");
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [privacyModalState, setPrivacyModalState] = useState<{
    isOpen: boolean;
    defaultTab: "privacy" | "terms" | "support";
  }>({
    isOpen: false,
    defaultTab: "privacy",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Timer state
  const [timerState, setTimerState] = useState<{
    isOpen: boolean;
    minutes: number;
    label: string;
  }>({
    isOpen: false,
    minutes: 3,
    label: "調理タイマー",
  });

  // Local storage for saved recipes
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>(() => {
    try {
      const stored = localStorage.getItem("shokuzai_camera_saved_recipes");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Local storage for recent recipes history
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>(() => {
    try {
      const stored = localStorage.getItem("shokuzai_camera_recent_recipes");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("shokuzai_camera_saved_recipes", JSON.stringify(savedRecipes));
    } catch (e) {
      console.warn("Could not persist saved recipes:", e);
    }
  }, [savedRecipes]);

  useEffect(() => {
    try {
      localStorage.setItem("shokuzai_camera_recent_recipes", JSON.stringify(recentRecipes));
    } catch (e) {
      console.warn("Could not persist recent recipes:", e);
    }
  }, [recentRecipes]);

  // Ensure scroll position always resets to top when changing views or generating recipes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const frameId = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    return () => cancelAnimationFrame(frameId);
  }, [currentView, analysisResult]);

  // Handle image analysis API call
  const handleAnalyzeImage = async (
    imageBase64: string,
    mimeType: string,
    preferences: any
  ) => {
    setIsLoading(true);
    setErrorMessage(null);

    let gotResult = false;
    // 1. If backend API is reachable (Web browser mode with server), try it with timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch("/api/analyze-food-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          preferences,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok && data && data.recipes && data.recipes.length > 0) {
        setAnalysisResult(data);
        setCurrentView("recipes");
        window.scrollTo({ top: 0, behavior: "smooth" });
        gotResult = true;
      } else if (data && data.fallback && data.fallback.recipes && data.fallback.recipes.length > 0) {
        setAnalysisResult(data.fallback);
        setCurrentView("recipes");
        window.scrollTo({ top: 0, behavior: "smooth" });
        gotResult = true;
      }
    } catch (apiErr) {
      console.log("Remote analysis unavailable (running on iOS device/offline), using on-device generator:", apiErr);
    }

    if (gotResult) {
      setIsLoading(false);
      return;
    }

    // 2. Instant on-device smart generator (works 100% reliably on iPhone in TestFlight, offline, and supermarkets)
    try {
      let detectedCandidates: string[] = [];
      if (preferences?.detectedHint) {
        detectedCandidates.push(preferences.detectedHint);
      }
      if (preferences?.customIngredients && preferences.customIngredients.length > 0) {
        detectedCandidates.push(...preferences.customIngredients);
      }

      // If no tag was chosen yet, extract from image color buffer
      if (detectedCandidates.length === 0) {
        const guessed = detectIngredientsFromImageBuffer(imageBase64);
        if (guessed && guessed.length > 0) {
          detectedCandidates = guessed;
        }
      }

      const localResult = generateSmartRecipes(detectedCandidates, preferences);
      setAnalysisResult(localResult);
      setCurrentView("recipes");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (fallbackErr: any) {
      console.error("Local recipe generation error:", fallbackErr);
      setErrorMessage("レシピの生成に失敗しました。もう一度お試しください。");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle text-based recipe generation
  const handleAnalyzeText = async (ingredients: string[], preferences: any) => {
    setIsLoading(true);
    setErrorMessage(null);

    let gotResult = false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch("/api/generate-recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients,
          preferences,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok && data && data.recipes && data.recipes.length > 0) {
        setAnalysisResult(data);
        setCurrentView("recipes");
        window.scrollTo({ top: 0, behavior: "smooth" });
        gotResult = true;
      } else if (data && data.fallback && data.fallback.recipes && data.fallback.recipes.length > 0) {
        setAnalysisResult(data.fallback);
        setCurrentView("recipes");
        window.scrollTo({ top: 0, behavior: "smooth" });
        gotResult = true;
      }
    } catch (apiErr) {
      console.log("Remote text generation unavailable, using on-device generator:", apiErr);
    }

    if (gotResult) {
      setIsLoading(false);
      return;
    }

    // High-performance on-device smart generator
    try {
      const localResult = generateSmartRecipes(ingredients, preferences);
      setAnalysisResult(localResult);
      setCurrentView("recipes");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (fallbackErr: any) {
      console.error("Local recipe generation error:", fallbackErr);
      setErrorMessage("レシピの生成に失敗しました。もう一度お試しください。");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setCurrentView("detail");
    // Add to recent recipes history (limit to 20 without duplicates)
    setRecentRecipes((prev) => {
      const filtered = prev.filter((r) => r.id !== recipe.id);
      return [recipe, ...filtered].slice(0, 20);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearRecent = () => {
    setRecentRecipes([]);
  };

  const handleToggleSave = (recipe: Recipe) => {
    const exists = savedRecipes.some((r) => r.id === recipe.id);
    if (exists) {
      setSavedRecipes(savedRecipes.filter((r) => r.id !== recipe.id));
    } else {
      setSavedRecipes([recipe, ...savedRecipes]);
    }
  };

  const handleRemoveSavedRecipe = (recipeId: string) => {
    setSavedRecipes(savedRecipes.filter((r) => r.id !== recipeId));
  };

  const handleStartTimer = (minutes: number, label: string) => {
    setTimerState({
      isOpen: true,
      minutes,
      label,
    });
  };

  const handleResetToCamera = () => {
    setCurrentView("camera");
    setSelectedRecipe(null);
    setErrorMessage(null);
  };

  // If user opened QR code link on smartphone, render dedicated mobile capture camera portal
  if (mobileSyncSessionId) {
    return <SmartphoneCapturePortal sessionId={mobileSyncSessionId} />;
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col selection:bg-emerald-200">
      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        savedCount={savedRecipes.length}
        onNavigate={(view) => {
          setCurrentView(view);
          if (view === "camera") {
            setSelectedRecipe(null);
          }
        }}
        onReset={handleResetToCamera}
        hasActiveRecipes={!!analysisResult && analysisResult.recipes.length > 0}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenPrivacyModal={() => setPrivacyModalState({ isOpen: true, defaultTab: "privacy" })}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Error Alert Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-900">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-bold">お知らせ</p>
              <p className="text-xs text-red-700">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* View 1: Camera & Input Stage */}
        {currentView === "camera" && (
          <CameraCapture
            onAnalyzeImage={handleAnalyzeImage}
            onAnalyzeText={handleAnalyzeText}
            isLoading={isLoading}
            errorMessage={errorMessage}
          />
        )}

        {/* View 2: Recipe Suggestions List */}
        {currentView === "recipes" && analysisResult && (
          <div className="space-y-6">
            {/* Top Navigation Back Bar */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                id="recipes-top-back-btn"
                onClick={() => setCurrentView("camera")}
                className="px-4 py-2 bg-white hover:bg-emerald-50 text-stone-800 hover:text-emerald-900 border border-stone-200 hover:border-emerald-300 font-extrabold text-xs sm:text-sm rounded-2xl shadow-2xs flex items-center gap-2 transition-all active:scale-95 group"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-700 group-hover:-translate-x-0.5 transition-transform" />
                <span>← 食材の撮影・入力画面に戻る</span>
              </button>

              <span className="text-xs font-bold text-stone-500 hidden sm:inline">
                全 {analysisResult.recipes.length} 品の献立
              </span>
            </div>

            {/* Top Analysis Feedback Bar */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-stone-900">
                      検出された食材とおすすめレシピ
                    </h2>
                    <p className="text-xs text-stone-500">
                      {analysisResult.recipes.length} 通りの献立をご提案しました（タップで詳しい分量・手順・タイマー）
                    </p>
                  </div>
                </div>

                <button
                  id="reanalyze-btn"
                  onClick={() => setCurrentView("camera")}
                  className="px-3.5 py-2 text-xs font-extrabold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-emerald-100 hover:text-emerald-900 border border-stone-200 rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                  <span>食材を選び直す</span>
                </button>
              </div>

              {/* Detected Ingredients Badges */}
              {analysisResult.detectedIngredients && analysisResult.detectedIngredients.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    写真・指定から認識した食材:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.detectedIngredients.map((ing, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        {ing.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dietitian's Comment */}
              {analysisResult.analysisComment && (
                <div className="bg-amber-50/80 border border-amber-200/80 p-3.5 rounded-2xl flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-950 font-medium leading-relaxed">
                    {analysisResult.analysisComment}
                  </p>
                </div>
              )}
            </div>

            {/* Recipe Cards Grid with Native In-Feed Ad Insertion */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {analysisResult.recipes.map((recipe, index) => {
                const adIndex = analysisResult.ad_insertion_index ?? 2;
                return (
                  <React.Fragment key={recipe.id}>
                    <RecipeCard
                      recipe={recipe}
                      onSelect={handleSelectRecipe}
                      index={index}
                    />
                    {index === adIndex && (
                      <NativeAdCard
                        key="native-ad-in-feed-slot"
                        variant="in-feed"
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Bottom Return to Camera / Input Action */}
            <div className="bg-gradient-to-r from-emerald-50 via-stone-50 to-amber-50 rounded-3xl border border-emerald-200/80 p-6 text-center space-y-3">
              <p className="text-xs sm:text-sm font-bold text-stone-700">
                お好みのレシピは見つかりましたか？他の食材でもレシピを提案できます。
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  id="recipes-bottom-back-btn"
                  onClick={() => {
                    setCurrentView("camera");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm rounded-2xl shadow-sm hover:shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>← 食材入力・撮影画面に戻る</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View 3: Recipe Detail & Dynamic Scaler */}
        {currentView === "detail" && selectedRecipe && (
          <RecipeDetailView
            recipe={selectedRecipe}
            onBack={() => setCurrentView("recipes")}
            onStartTimer={handleStartTimer}
            isSaved={savedRecipes.some((r) => r.id === selectedRecipe.id)}
            onToggleSave={handleToggleSave}
          />
        )}

        {/* View 4: Saved Recipes & History View */}
        {currentView === "saved" && (
          <SavedRecipesView
            savedRecipes={savedRecipes}
            recentRecipes={recentRecipes}
            onSelectRecipe={handleSelectRecipe}
            onRemoveRecipe={handleRemoveSavedRecipe}
            onClearRecent={handleClearRecent}
            onGoToCamera={handleResetToCamera}
          />
        )}
      </main>

      {/* Floating Cooking Timer Widget */}
      {timerState.isOpen && (
        <CookingTimer
          initialMinutes={timerState.minutes}
          label={timerState.label}
          onClose={() => setTimerState({ ...timerState, isOpen: false })}
        />
      )}

      {/* PWA Direct Smartphone Install Modal */}
      <InstallPwaModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Privacy Policy & Terms of Service Modal (App Store Guideline 5.1.1) */}
      <PrivacyTermsModal
        isOpen={privacyModalState.isOpen}
        defaultTab={privacyModalState.defaultTab}
        onClose={() => setPrivacyModalState({ ...privacyModalState, isOpen: false })}
      />

      {/* Footer */}
      <footer className="border-t border-stone-200/80 bg-white py-6 text-center text-xs text-stone-500 mt-auto">
        <div className="max-w-5xl mx-auto px-4 space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
            <button
              type="button"
              id="footer-privacy-btn"
              onClick={() => setPrivacyModalState({ isOpen: true, defaultTab: "privacy" })}
              className="text-stone-600 hover:text-emerald-800 font-bold hover:underline transition-colors"
            >
              プライバシーポリシー
            </button>
            <span className="text-stone-300">|</span>
            <button
              type="button"
              id="footer-terms-btn"
              onClick={() => setPrivacyModalState({ isOpen: true, defaultTab: "terms" })}
              className="text-stone-600 hover:text-emerald-800 font-bold hover:underline transition-colors"
            >
              利用規約・免責事項
            </button>
            <span className="text-stone-300">|</span>
            <button
              type="button"
              id="footer-support-btn"
              onClick={() => setPrivacyModalState({ isOpen: true, defaultTab: "support" })}
              className="text-stone-600 hover:text-emerald-800 font-bold hover:underline transition-colors"
            >
              サポート・運営情報
            </button>
          </div>

          <p className="font-semibold text-stone-700">
            食材カメラ献立ナビ — AIで毎日の献立作りと買い物をスマートに
          </p>
          <p className="text-[11px] text-stone-400">
            ※ 栄養成分やカロリー表示は一般的な調理法に基づく推定値です。目安としてご活用ください。
          </p>
          <p className="text-[10px] text-stone-400 pt-1">
            © 2026 食材カメラ献立ナビ. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
