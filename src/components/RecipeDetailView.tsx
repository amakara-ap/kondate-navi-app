import React, { useState } from "react";
import {
  Users,
  Clock,
  Flame,
  CheckSquare,
  Square,
  Bookmark,
  Share2,
  Copy,
  Check,
  ChevronLeft,
  Timer,
  Lightbulb,
  Heart,
  Scale,
  Sparkles,
  ShoppingBag,
  Info,
  Play,
  Printer,
  Send,
  MessageCircle,
} from "lucide-react";
import { Recipe } from "../types";
import { formatScaledAmount } from "../utils/scaler";
import { CookingStepModal } from "./CookingStepModal";
import { MealBalanceAssistance } from "./MealBalanceAssistance";
import { FoodStorageTips } from "./FoodStorageTips";
import { NativeAdCard } from "./NativeAdCard";

interface RecipeDetailViewProps {
  recipe: Recipe;
  onBack: () => void;
  onStartTimer: (minutes: number, label: string) => void;
  isSaved: boolean;
  onToggleSave: (recipe: Recipe) => void;
}

export const RecipeDetailView: React.FC<RecipeDetailViewProps> = ({
  recipe,
  onBack,
  onStartTimer,
  isSaved,
  onToggleSave,
}) => {
  // Target servings state (default to 2 or recipe's baseServings)
  const [servings, setServings] = useState<number>(recipe.baseServings || 2);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isShoppingListCopied, setIsShoppingListCopied] = useState<boolean>(false);
  const [isShoppingMode, setIsShoppingMode] = useState<boolean>(false);
  const [isCookingModalOpen, setIsCookingModalOpen] = useState<boolean>(false);

  const handleServingChange = (delta: number) => {
    setServings((prev) => Math.max(1, Math.min(12, prev + delta)));
  };

  const handleSetServings = (val: number) => {
    setServings(val);
  };

  const toggleIngredientCheck = (name: string) => {
    setCheckedIngredients((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleStepCompleted = (stepNum: number) => {
    setCompletedSteps((prev) => ({ ...prev, [stepNum]: !prev[stepNum] }));
  };

  // Copy shopping list only (excluding pantry staples) for LINE / Memo
  const handleCopyShoppingList = async () => {
    const neededItems = recipe.mainIngredients
      .map((ing) => {
        const scaled = formatScaledAmount(ing.baseAmount, recipe.baseServings, servings, ing.unit);
        return `・${ing.name}：${scaled} ${ing.unit}${ing.note ? ` (${ing.note})` : ""}`;
      })
      .join("\n");

    const neededSeasonings = recipe.seasonings
      .filter((s) => !s.isPantryStaple)
      .map((s) => {
        const scaled = formatScaledAmount(s.baseAmount, recipe.baseServings, servings, s.unit);
        return `・${s.name}：${scaled} ${s.unit}`;
      })
      .join("\n");

    const text = `🛒【買い物メモ】${recipe.title} (${servings}人前)\n\n■ 必要な食材:\n${neededItems}${
      neededSeasonings ? `\n\n■ 買い足す調味料:\n${neededSeasonings}` : ""
    }\n\n※ 食材カメラ献立ナビAIより作成`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      }
      setIsShoppingListCopied(true);
      setTimeout(() => setIsShoppingListCopied(false), 2000);
    } catch {
      setIsShoppingListCopied(true);
      setTimeout(() => setIsShoppingListCopied(false), 2000);
    }
  };

  // Open LINE Share with shopping items
  const handleShareToLine = () => {
    const neededItems = recipe.mainIngredients
      .map((ing) => {
        const scaled = formatScaledAmount(ing.baseAmount, recipe.baseServings, servings, ing.unit);
        return `・${ing.name}：${scaled} ${ing.unit}`;
      })
      .join("\n");

    const text = `🛒【買い物メモ】${recipe.title} (${servings}人前)\n${neededItems}\n\n買ってきてほしい食材リストです！`;
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
    window.open(lineUrl, "_blank");
  };

  const handleCopyRecipe = async () => {
    const mainList = recipe.mainIngredients
      .map(
        (ing) =>
          `・${ing.name}: ${formatScaledAmount(
            ing.baseAmount,
            recipe.baseServings,
            servings,
            ing.unit
          )} ${ing.unit}${ing.note ? ` (${ing.note})` : ""}`
      )
      .join("\n");

    const seasonList = recipe.seasonings
      .map(
        (s) =>
          `・${s.name}: ${formatScaledAmount(
            s.baseAmount,
            recipe.baseServings,
            servings,
            s.unit
          )} ${s.unit}${s.note ? ` (${s.note})` : ""}`
      )
      .join("\n");

    const stepList = recipe.steps
      .map((st) => `${st.stepNumber}. ${st.instruction}`)
      .join("\n");

    const text = `【${recipe.title}】(${servings}人前)\n\n■ 1人前あたり: 約${recipe.nutritionPerServing.calories}kcal (P:${recipe.nutritionPerServing.protein}g / F:${recipe.nutritionPerServing.fat}g / C:${recipe.nutritionPerServing.carbohydrates}g)\n\n■ 主材料 (${servings}人前):\n${mainList}\n\n■ 調味料 (${servings}人前):\n${seasonList}\n\n■ 作り方:\n${stepList}\n\n■ プロのコツ:\n${recipe.chefTips}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.warn("Clipboard copy failed, but proceeding gracefully:", err);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button
          id="detail-back-button"
          onClick={onBack}
          className="px-4 py-2.5 text-xs sm:text-sm font-extrabold text-stone-800 hover:text-emerald-900 bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 rounded-2xl flex items-center gap-2 transition-all shadow-2xs active:scale-95 group"
        >
          <ChevronLeft className="w-4 h-4 text-emerald-700 group-hover:-translate-x-0.5 transition-transform" />
          <span>← 提案レシピ一覧に戻る</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Print Recipe Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 text-xs sm:text-sm font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
            title="レシピを印刷 / PDF保存"
          >
            <Printer className="w-4 h-4 text-stone-600" />
            <span className="hidden sm:inline">印刷</span>
          </button>

          <button
            id="detail-copy-btn"
            onClick={handleCopyRecipe}
            className="px-3 py-2 text-xs sm:text-sm font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
            title="レシピテキストをコピー"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-bold">コピー完了</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-stone-500" />
                <span className="hidden sm:inline">テキスト共有</span>
              </>
            )}
          </button>

          <button
            id="detail-save-btn"
            onClick={() => onToggleSave(recipe)}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-2xs ${
              isSaved
                ? "bg-amber-500 text-white hover:bg-amber-600"
                : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
            <span>{isSaved ? "保存済み" : "レシピ保存"}</span>
          </button>
        </div>
      </div>

      {/* Main Recipe Header Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
              {recipe.cuisineType}
            </span>
            <span className="text-xs font-bold px-3 py-1 bg-stone-100 text-stone-700 rounded-full">
              難易度: {recipe.difficulty}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 bg-stone-100 px-3 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>調理時間: 約 {recipe.cookingTimeMinutes} 分</span>
            </div>
          </div>

          {/* Cooking Mode Big Launcher Button */}
          <button
            type="button"
            id="start-handsfree-cooking-btn"
            onClick={() => setIsCookingModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs sm:text-sm font-black rounded-2xl shadow-md hover:shadow-lg flex items-center gap-2 transition-all active:scale-95 animate-pulse-subtle"
            title="画面スリープ防止・大型ステップ・音声読み上げで調理を開始"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>🍳 クッキングモード（スリープ防止・音声付）</span>
          </button>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight leading-snug">
            {recipe.title}
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-medium">
            {recipe.description || recipe.subtitle}
          </p>
        </div>

        {recipe.tags && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {recipe.tags.map((t) => (
              <span
                key={t}
                className="text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2.5 py-0.5 rounded-md"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ⭐ KEY USER REQUIREMENT 1: SERVINGS SELECTOR & REAL-TIME INGREDIENTS / SEASONINGS SCALER */}
      <div className="bg-white rounded-3xl border-2 border-emerald-500/80 p-6 sm:p-8 shadow-md space-y-6">
        {/* Servings Control Header */}
        <div className="bg-emerald-50/80 -m-6 sm:-m-8 p-6 sm:p-8 rounded-t-3xl border-b border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-700" />
              <h2 className="text-lg sm:text-xl font-black text-stone-900">
                何人前作りますか？
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-600">
              人数を変更すると、すべての食材・調味料の必要量がリアルタイムに再計算されます。
            </p>
          </div>

          {/* Stepper + Quick Buttons */}
          <div className="flex flex-col items-start sm:items-end gap-2">
            <div className="inline-flex items-center bg-white border-2 border-emerald-600 rounded-2xl p-1 shadow-sm">
              <button
                id="decrease-servings-btn"
                onClick={() => handleServingChange(-1)}
                disabled={servings <= 1}
                className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 disabled:opacity-30 disabled:cursor-not-allowed text-stone-800 font-bold text-lg flex items-center justify-center transition-colors"
                title="1人前減らす"
              >
                -
              </button>
              <div className="px-5 text-center min-w-[90px]">
                <span className="text-2xl font-black text-emerald-800">{servings}</span>
                <span className="text-xs font-bold text-stone-600 ml-1">人前</span>
              </div>
              <button
                id="increase-servings-btn"
                onClick={() => handleServingChange(1)}
                disabled={servings >= 12}
                className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-lg flex items-center justify-center transition-colors"
                title="1人前増やす"
              >
                +
              </button>
            </div>

            {/* Quick preset buttons */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => handleSetServings(num)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                    servings === num
                      ? "bg-emerald-800 text-white"
                      : "bg-white text-stone-600 hover:bg-emerald-100 border border-stone-200"
                  }`}
                >
                  {num}人前
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Shopping Mode Toggle & Quick Share Toolbar */}
        <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-stone-900">
              材料リスト（{servings}人前分量）
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick LINE Share of needed groceries */}
            <button
              type="button"
              id="share-shopping-line-btn"
              onClick={handleShareToLine}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#06C755]/10 hover:bg-[#06C755]/20 text-[#05963f] border border-[#06C755]/30 flex items-center gap-1.5 transition-colors shadow-2xs"
              title="LINEで買い物食材リストを送信"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>LINEに買い物送信</span>
            </button>

            {/* Copy Shopping Memo */}
            <button
              type="button"
              id="copy-shopping-memo-btn"
              onClick={handleCopyShoppingList}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 flex items-center gap-1.5 transition-colors shadow-2xs"
              title="買い物リストテキストをコピー"
            >
              {isShoppingListCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">メモコピー完了</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                  <span>買い物メモコピー</span>
                </>
              )}
            </button>

            {/* Interactive Checklist Toggle */}
            <button
              id="toggle-shopping-mode-btn"
              onClick={() => setIsShoppingMode(!isShoppingMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                isShoppingMode
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
              <span>{isShoppingMode ? "買い物チェック中" : "売り場チェック"}</span>
            </button>
          </div>
        </div>

        {/* Scaled Ingredients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Ingredients */}
          <div className="space-y-3 bg-stone-50/70 p-5 rounded-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                主材料・野菜・肉（{servings}人前）
              </span>
              <span className="text-[11px] text-stone-500">数量</span>
            </div>

            <ul className="space-y-2.5">
              {recipe.mainIngredients.map((ing, idx) => {
                const scaledText = formatScaledAmount(
                  ing.baseAmount,
                  recipe.baseServings,
                  servings,
                  ing.unit
                );
                const isChecked = !!checkedIngredients[`main_${idx}`];

                return (
                  <li
                    key={idx}
                    onClick={() => isShoppingMode && toggleIngredientCheck(`main_${idx}`)}
                    className={`flex items-center justify-between gap-3 text-sm transition-all ${
                      isShoppingMode ? "cursor-pointer select-none" : ""
                    } ${isChecked ? "opacity-40 line-through" : ""}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isShoppingMode && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleIngredientCheck(`main_${idx}`);
                          }}
                          className="text-emerald-700 shrink-0"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-700" />
                          ) : (
                            <Square className="w-4 h-4 text-stone-400" />
                          )}
                        </button>
                      )}
                      <span className="font-bold text-stone-800 truncate">{ing.name}</span>
                      {ing.note && (
                        <span className="text-[11px] text-stone-600 hidden sm:inline">
                          ({ing.note})
                        </span>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-stone-900 text-sm">{scaledText}</span>
                      <span className="text-xs text-stone-600 ml-1 font-medium">{ing.unit}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Seasonings & Condiments */}
          <div className="space-y-3 bg-stone-50/70 p-5 rounded-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <span className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                調味料・合わせダレ（{servings}人前）
              </span>
              <span className="text-[11px] text-stone-500">分量</span>
            </div>

            <ul className="space-y-2.5">
              {recipe.seasonings.map((s, idx) => {
                const scaledText = formatScaledAmount(
                  s.baseAmount,
                  recipe.baseServings,
                  servings,
                  s.unit
                );
                const isChecked = !!checkedIngredients[`seasoning_${idx}`];

                return (
                  <li
                    key={idx}
                    onClick={() => isShoppingMode && toggleIngredientCheck(`seasoning_${idx}`)}
                    className={`flex items-center justify-between gap-3 text-sm transition-all ${
                      isShoppingMode ? "cursor-pointer select-none" : ""
                    } ${isChecked ? "opacity-40 line-through" : ""}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isShoppingMode && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleIngredientCheck(`seasoning_${idx}`);
                          }}
                          className="text-amber-700 shrink-0"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-amber-700" />
                          ) : (
                            <Square className="w-4 h-4 text-stone-400" />
                          )}
                        </button>
                      )}
                      <span className="font-bold text-stone-800 truncate">{s.name}</span>
                      {s.note && (
                        <span className="text-[11px] text-stone-600 hidden sm:inline">
                          ({s.note})
                        </span>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-extrabold text-stone-900 text-sm">{scaledText}</span>
                      <span className="text-xs text-stone-600 ml-1 font-medium">{s.unit}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* ⭐ KEY USER REQUIREMENT 2: NUTRITION & CALORIES PER SERVING (1人前あたりのカロリー・栄養情報) */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-stone-900">
                1人前あたりの栄養成分・カロリー
              </h2>
              <p className="text-xs text-stone-700">管理栄養士視点の推定値</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-2xl shadow-sm flex items-baseline gap-1.5">
            <span className="text-xs font-bold">エネルギー</span>
            <span className="text-2xl font-black">{recipe.nutritionPerServing.calories}</span>
            <span className="text-xs font-bold">kcal</span>
          </div>
        </div>

        {/* Nutritional Breakdown Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Protein */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1">
            <span className="text-[11px] font-bold text-stone-500 block">たんぱく質 (P)</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-emerald-800">
                {recipe.nutritionPerServing.protein}
              </span>
              <span className="text-xs text-stone-500 font-bold">g</span>
            </div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full"
                style={{
                  width: `${Math.min(100, (recipe.nutritionPerServing.protein / 30) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Fat */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1">
            <span className="text-[11px] font-bold text-stone-500 block">脂質 (F)</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-amber-800">
                {recipe.nutritionPerServing.fat}
              </span>
              <span className="text-xs text-stone-500 font-bold">g</span>
            </div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-600 h-full rounded-full"
                style={{ width: `${Math.min(100, (recipe.nutritionPerServing.fat / 30) * 100)}%` }}
              />
            </div>
          </div>

          {/* Carbohydrates */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1">
            <span className="text-[11px] font-bold text-stone-500 block">炭水化物 (C)</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-sky-800">
                {recipe.nutritionPerServing.carbohydrates}
              </span>
              <span className="text-xs text-stone-500 font-bold">g</span>
            </div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-sky-600 h-full rounded-full"
                style={{
                  width: `${Math.min(100, (recipe.nutritionPerServing.carbohydrates / 60) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Salt */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1">
            <span className="text-[11px] font-bold text-stone-500 block">食塩相当量</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-stone-800">
                {recipe.nutritionPerServing.saltEquivalent}
              </span>
              <span className="text-xs text-stone-500 font-bold">g</span>
            </div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-stone-600 h-full rounded-full"
                style={{
                  width: `${Math.min(100, (recipe.nutritionPerServing.saltEquivalent / 3.0) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Nutrition Highlights Note */}
        {recipe.nutritionPerServing.highlights && (
          <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-2xl flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-xs font-extrabold text-emerald-900">栄養ポイント:</span>
              <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                {recipe.nutritionPerServing.highlights}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Step-by-Step Cooking Guide (作り方手順) */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-extrabold text-stone-900">作り方・手順</h2>
          <span className="text-xs text-stone-500">タップして完了チェック</span>
        </div>

        <div className="space-y-4">
          {recipe.steps.map((step) => {
            const isDone = !!completedSteps[step.stepNumber];

            return (
              <div
                key={step.stepNumber}
                onClick={() => toggleStepCompleted(step.stepNumber)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                  isDone
                    ? "bg-emerald-50/50 border-emerald-300 opacity-70"
                    : "bg-stone-50/50 border-stone-200 hover:border-stone-300"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStepCompleted(step.stepNumber);
                    }}
                    className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 transition-colors ${
                      isDone
                        ? "bg-emerald-600 text-white"
                        : "bg-stone-200 text-stone-800 hover:bg-stone-300"
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : step.stepNumber}
                  </button>

                  <div className="space-y-2 flex-1">
                    <p
                      className={`text-sm sm:text-base font-medium leading-relaxed ${
                        isDone ? "text-stone-500 line-through" : "text-stone-900"
                      }`}
                    >
                      {step.instruction}
                    </p>

                    {step.tip && (
                      <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200/60 p-2.5 rounded-xl flex items-start gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{step.tip}</span>
                      </div>
                    )}

                    {step.timerMinutes && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartTimer(
                            step.timerMinutes || 3,
                            `${recipe.title} (手順${step.stepNumber})`
                          );
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                      >
                        <Timer className="w-3.5 h-3.5 text-amber-400" />
                        <span>{step.timerMinutes}分タイマーを開始</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chef Tips & Advice */}
      {recipe.chefTips && (
        <div className="bg-amber-50/80 rounded-3xl border border-amber-200 p-6 sm:p-7 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
            <Lightbulb className="w-4 h-4 text-amber-700" />
            <span>美味しく仕上げるプロのコツ & 保存方法</span>
          </div>
          <p className="text-xs sm:text-sm text-amber-950 leading-relaxed font-medium">
            {recipe.chefTips}
          </p>
        </div>
      )}

      {/* ⭐ 1汁2菜・バランス献立アシスト (副菜・スープのサジェスト) */}
      <MealBalanceAssistance recipe={recipe} />

      {/* ⭐ 食材の保存・下ごしらえ豆知識 */}
      <FoodStorageTips recipe={recipe} />

      {/* ⭐ 調理完了後のスポンサー/ネイティブPR広告枠 */}
      <NativeAdCard variant="detail-bottom" />

      {/* Bottom Navigation Back Section */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 text-center space-y-3 shadow-xs">
        <p className="text-xs sm:text-sm font-bold text-stone-600">
          調理が終わったら、他の提案メニューやお気に入りの献立もチェックしてみましょう。
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            id="detail-bottom-back-btn"
            onClick={onBack}
            className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-sm hover:shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>← 提案レシピ一覧に戻る</span>
          </button>
        </div>
      </div>

      {/* Hands-Free Cooking Mode Modal (Screen Wake Lock, Big Steps, Voice Aloud) */}
      <CookingStepModal
        recipe={recipe}
        servings={servings}
        isOpen={isCookingModalOpen}
        onClose={() => setIsCookingModalOpen(false)}
        onStartTimer={onStartTimer}
      />
    </div>
  );
};
