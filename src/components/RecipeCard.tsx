import React from "react";
import { Clock, Flame, ChefHat, Sparkles, ChevronRight, Award, Utensils } from "lucide-react";
import { Recipe } from "../types";

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
  index: number;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelect, index }) => {
  const difficultyColors = {
    簡単: "bg-emerald-100 text-emerald-800 border-emerald-200",
    普通: "bg-amber-100 text-amber-800 border-amber-200",
    少し本格的: "bg-indigo-100 text-indigo-800 border-indigo-200",
  };

  const cuisineColors = {
    和風: "bg-orange-50 text-orange-800 border-orange-200",
    洋風: "bg-sky-50 text-sky-800 border-sky-200",
    中華: "bg-red-50 text-red-800 border-red-200",
    エスニック: "bg-amber-50 text-amber-800 border-amber-200",
    その他: "bg-stone-50 text-stone-800 border-stone-200",
  };

  return (
    <div
      id={`recipe-card-${recipe.id}`}
      onClick={() => onSelect(recipe)}
      className="group bg-white rounded-3xl border border-stone-200/90 hover:border-emerald-500/70 p-6 sm:p-7 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden"
    >
      {/* Top Banner Accent */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-black flex items-center justify-center shadow-xs">
              {index + 1}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                cuisineColors[recipe.cuisineType] || "bg-stone-100 text-stone-700"
              }`}
            >
              {recipe.cuisineType}
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                difficultyColors[recipe.difficulty] || "bg-stone-100 text-stone-700"
              }`}
            >
              {recipe.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 bg-stone-100 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-stone-500" />
            <span>約 {recipe.cookingTimeMinutes} 分</span>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1">
          <h3 className="font-extrabold text-stone-900 text-lg sm:text-xl group-hover:text-emerald-700 transition-colors leading-snug">
            {recipe.title}
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 font-medium line-clamp-2">
            {recipe.subtitle || recipe.description}
          </p>
        </div>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Key Ingredients Summary */}
        <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/80 space-y-1.5">
          <div className="text-[11px] font-bold text-stone-500 flex items-center gap-1">
            <Utensils className="w-3 h-3 text-emerald-600" />
            <span>主な食材:</span>
          </div>
          <div className="text-xs text-stone-800 font-semibold flex flex-wrap gap-x-2 gap-y-1">
            {recipe.mainIngredients.slice(0, 4).map((ing, idx) => (
              <span key={idx} className="after:content-[','] last:after:content-['']">
                {ing.name}
              </span>
            ))}
            {recipe.mainIngredients.length > 4 && (
              <span className="text-stone-600 font-normal">
                他 {recipe.mainIngredients.length - 4} 品
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Nutrition & Action */}
      <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
        {/* Calorie pill */}
        <div className="flex items-baseline gap-1">
          <span className="text-[11px] font-semibold text-stone-600">1人前:</span>
          <span className="text-base font-black text-amber-700">
            {recipe.nutritionPerServing.calories}
          </span>
          <span className="text-[11px] font-bold text-amber-900">kcal</span>
        </div>

        {/* Action Button */}
        <button
          id={`select-recipe-btn-${recipe.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(recipe);
          }}
          className="px-4 py-2 bg-emerald-50 text-emerald-800 group-hover:bg-emerald-700 group-hover:text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1 transition-all shadow-2xs"
        >
          <span>分量・作り方を見る</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
