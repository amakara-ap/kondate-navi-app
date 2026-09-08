import React from "react";
import { Camera, Bookmark, Sparkles, UtensilsCrossed, Download, ArrowLeft, ShieldCheck } from "lucide-react";

interface NavbarProps {
  currentView: "camera" | "recipes" | "detail" | "saved";
  savedCount: number;
  onNavigate: (view: "camera" | "recipes" | "detail" | "saved") => void;
  onReset: () => void;
  hasActiveRecipes: boolean;
  onOpenInstallModal?: () => void;
  onOpenPrivacyModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  savedCount,
  onNavigate,
  onReset,
  hasActiveRecipes,
  onOpenInstallModal,
  onOpenPrivacyModal,
}) => {
  const handleBackClick = () => {
    if (currentView === "detail") {
      onNavigate("recipes");
    } else {
      onNavigate("camera");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-xs">
      <div className="max-w-5xl mx-auto px-2.5 sm:px-6">
        {/* Row 1: Brand Title Bar & Action Buttons */}
        <div className="h-12 sm:h-14 flex items-center justify-between gap-1 sm:gap-2">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            {/* Quick Back Button on Top Left when not on Home/Camera */}
            {currentView !== "camera" && (
              <button
                type="button"
                id="nav-quick-back-btn"
                onClick={handleBackClick}
                className="px-2.5 py-1.5 text-xs font-bold text-stone-800 bg-stone-100 hover:bg-emerald-100 hover:text-emerald-900 border border-stone-200 rounded-xl flex items-center gap-1 transition-all active:scale-95 shrink-0 mr-0.5"
                title={currentView === "detail" ? "レシピ一覧に戻る" : "食材入力・撮影画面に戻る"}
              >
                <ArrowLeft className="w-4 h-4 text-emerald-700" />
                <span className="font-extrabold text-xs">戻る</span>
              </button>
            )}

            {/* Brand Title */}
            <button
              id="nav-brand-button"
              onClick={onReset}
              className="flex items-center gap-1.5 sm:gap-2 text-left group focus:outline-none min-w-0 shrink"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-500 flex items-center justify-center text-white shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                <UtensilsCrossed className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                <span className="font-black text-stone-900 tracking-tight text-sm sm:text-base whitespace-nowrap">
                  食材カメラ献立ナビ
                </span>
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[9px] sm:text-[10px] font-extrabold px-1 sm:px-1.5 py-0.5 rounded-md shadow-2xs shrink-0">
                  AI
                </span>
              </div>
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Install App Button */}
            {onOpenInstallModal && (
              <button
                type="button"
                id="nav-install-app-btn"
                onClick={onOpenInstallModal}
                className="px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
                title="スマホのホーム画面に追加してアプリとして使う"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="hidden xs:inline text-[11px] sm:text-xs">アプリ保存</span>
                <span className="xs:hidden text-[10px]">保存</span>
              </button>
            )}

            {/* Favorite / Bookmarks Button */}
            <button
              id="nav-saved-top-btn"
              onClick={() => onNavigate("saved")}
              className={`px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold rounded-xl flex items-center gap-1 transition-all whitespace-nowrap shrink-0 ${
                currentView === "saved"
                  ? "bg-amber-500 text-white shadow-2xs"
                  : "text-stone-700 hover:text-stone-900 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/70"
              }`}
              title="保存したお気に入りレシピ"
            >
              <Bookmark className={`w-3.5 h-3.5 shrink-0 ${currentView === "saved" ? "text-white" : "text-amber-600"}`} />
              <span className="hidden xs:inline text-[11px] sm:text-xs">お気に入り</span>
              <span className="xs:hidden text-[10px]">好物</span>
              {savedCount > 0 && (
                <span
                  className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-none shrink-0 ${
                    currentView === "saved"
                      ? "bg-white text-amber-700"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {savedCount}
                </span>
              )}
            </button>

            {/* Privacy & Legal Guide Button (Essential for App Store Review) */}
            {onOpenPrivacyModal && (
              <button
                type="button"
                id="nav-privacy-btn"
                onClick={onOpenPrivacyModal}
                className="p-1.5 sm:px-2 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-200/80 rounded-xl flex items-center gap-1 transition-colors shrink-0"
                title="安心・安全の規約 & プライバシーポリシー"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="hidden sm:inline text-[11px] font-bold">規約</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Clean Navigation Tabs */}
        <div className="flex items-center gap-1 pb-1.5 pt-0.5 border-t border-stone-100 overflow-x-auto">
          {/* Camera / Input Tab Button */}
          <button
            id="nav-camera-btn"
            onClick={() => onNavigate("camera")}
            className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
              currentView === "camera"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-stone-700 hover:text-stone-900 bg-stone-100/90 hover:bg-stone-200"
            }`}
          >
            <Camera className="w-3.5 h-3.5 shrink-0" />
            <span>食材を撮影・入力</span>
          </button>

          {/* Active Recipe List Button */}
          {hasActiveRecipes && (
            <button
              id="nav-back-to-recipes-btn"
              onClick={() => onNavigate("recipes")}
              className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
                currentView === "recipes"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>提案レシピ一覧</span>
            </button>
          )}

          {/* If viewing a detail recipe */}
          {currentView === "detail" && (
            <button
              id="nav-detail-tab-btn"
              onClick={() => onNavigate("detail")}
              className="flex-1 sm:flex-initial px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl bg-teal-700 text-white shadow-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 shrink-0" />
              <span>レシピ調理中</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};


