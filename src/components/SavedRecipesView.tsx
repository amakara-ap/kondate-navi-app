import React, { useState } from "react";
import { Bookmark, Trash2, ArrowRight, UtensilsCrossed, Clock, Flame, History, AlertTriangle, X } from "lucide-react";
import { Recipe } from "../types";

interface SavedRecipesViewProps {
  savedRecipes: Recipe[];
  recentRecipes?: Recipe[];
  onSelectRecipe: (recipe) => void;
  onRemoveRecipe: (recipeId: string) => void;
  onClearRecent?: () => void;
  onGoToCamera: () => void;
}

export const SavedRecipesView: React.FC<SavedRecipesViewProps> = ({
  savedRecipes,
  recentRecipes = [],
  onSelectRecipe,
  onRemoveRecipe,
  onClearRecent,
  onGoToCamera,
}) => {
  const [activeTab, setActiveTab] = useState<"saved" | "recent">("saved");
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
  const [showClearRecentConfirm, setShowClearRecentConfirm] = useState(false);

  const displayList = activeTab === "saved" ? savedRecipes : recentRecipes;

  const handleConfirmDelete = () => {
    if (recipeToDelete) {
      onRemoveRecipe(recipeToDelete.id);
      setRecipeToDelete(null);
    }
  };

  const handleConfirmClearRecent = () => {
    if (onClearRecent) {
      onClearRecent();
      setShowClearRecentConfirm(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Tab Switcher & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900">
            {activeTab === "saved" ? "お気に入り保存したレシピ" : "最近チェックしたレシピ履歴"}
          </h2>
          <p className="text-xs text-stone-500">
            {activeTab === "saved"
              ? `${savedRecipes.length} 件のレシピをブックマーク中`
              : `直近閲覧したレシピ ${recentRecipes.length} 件`}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center bg-stone-100 p-1 rounded-2xl border border-stone-200">
          <button
            type="button"
            onClick={() => setActiveTab("saved")}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
              activeTab === "saved"
                ? "bg-white text-emerald-800 shadow-2xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>保存済み ({savedRecipes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("recent")}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
              activeTab === "recent"
                ? "bg-white text-emerald-800 shadow-2xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>閲覧履歴 ({recentRecipes.length})</span>
          </button>
        </div>
      </div>

      {displayList.length === 0 ? (
        <div className="w-full max-w-2xl mx-auto py-12 px-4 text-center space-y-4 bg-white rounded-3xl border border-stone-200">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            {activeTab === "saved" ? (
              <Bookmark className="w-8 h-8" />
            ) : (
              <History className="w-8 h-8" />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-stone-900">
              {activeTab === "saved"
                ? "保存されたレシピはありません"
                : "閲覧したレシピ履歴はありません"}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
              {activeTab === "saved"
                ? "提案されたレシピ詳細画面で「レシピ保存」を押すと、いつでもここから見返すことができます。"
                : "食材を撮影してレシピを開くと、自動的にここに記録されます。"}
            </p>
          </div>
          <button
            type="button"
            onClick={onGoToCamera}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold rounded-2xl transition-all shadow-sm inline-flex items-center gap-2 active:scale-95"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>食材を撮影してレシピを探す</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === "recent" && onClearRecent && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowClearRecentConfirm(true)}
                className="text-xs text-stone-500 hover:text-red-600 font-bold transition-colors"
              >
                閲覧履歴をクリア
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayList.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => onSelectRecipe(recipe)}
                className="bg-white rounded-3xl border border-stone-200 hover:border-emerald-500 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.99]"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                      {recipe.cuisineType}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs text-stone-500 font-medium">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>約 {recipe.cookingTimeMinutes}分</span>
                      </div>
                      {activeTab === "saved" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRecipeToDelete(recipe);
                          }}
                          className="text-stone-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="保存から削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-stone-900 group-hover:text-emerald-800 transition-colors text-base leading-snug">
                      {recipe.title}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                      {recipe.subtitle || recipe.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-amber-700 font-bold">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{recipe.nutritionPerServing.calories} kcal / 1人前</span>
                  </div>
                  <span className="text-emerald-700 font-extrabold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    詳細・分量を見る
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Delete Saved Recipe */}
      {recipeToDelete && (
        <div
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setRecipeToDelete(null)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-stone-100 space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => setRecipeToDelete(null)}
                className="text-stone-400 hover:text-stone-600 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-stone-900">
                お気に入りから削除しますか？
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                「<span className="font-bold text-stone-800">{recipeToDelete.title}</span>」をお気に入り保存から削除します。
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRecipeToDelete(null)}
                className="flex-1 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>削除する</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Clear Recent History */}
      {showClearRecentConfirm && (
        <div
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowClearRecentConfirm(false)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-stone-100 space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => setShowClearRecentConfirm(false)}
                className="text-stone-400 hover:text-stone-600 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-stone-900">
                閲覧履歴をクリアしますか？
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                これまでにチェックしたレシピの閲覧履歴がすべて削除されます。
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearRecentConfirm(false)}
                className="flex-1 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleConfirmClearRecent}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>クリアする</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
