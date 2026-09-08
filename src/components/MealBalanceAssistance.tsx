import React from "react";
import { Utensils, Sparkles, Soup, Salad, ShieldAlert, HeartHandshake, CheckCircle2, BookmarkPlus } from "lucide-react";
import { Recipe } from "../types";

interface MealBalanceAssistanceProps {
  recipe: Recipe;
}

export const MealBalanceAssistance: React.FC<MealBalanceAssistanceProps> = ({ recipe }) => {
  // Determine suitable side dish & soup based on recipe characteristics
  const getSideDishPairing = () => {
    const title = recipe.title;
    const cuisine = recipe.cuisineType;

    if (/こんにゃく|蒟蒻|しらたき/.test(title)) {
      return {
        side: "シャキシャキキャベツと海苔のナムル（または豚しゃぶサラダ）",
        sideTime: "3分",
        soup: "豆腐とわかめのお吸い物（または具だくさん豚汁）",
        soupTime: "5分",
        nutritionBenefit: "こんにゃくの食物繊維に、ミネラル・たんぱく質を補い理想の栄養バランスに！",
        tips: "こんにゃくの食物繊維（グルコマンナン）は吸水性が高いため、温かい汁物と一緒に摂ることで満腹感が持続し、お腹の調子を整えます。",
      };
    }

    if (/豚|肉|ステーキ|照り焼き|生姜焼き|カツ|ハンバーグ/.test(title)) {
      return {
        side: "トマトときゅうりの和風塩昆布和え（または千切りキャベツのレモンマリネ）",
        sideTime: "3分",
        soup: "大根と油揚げの合わせ味噌汁",
        soupTime: "5分",
        nutritionBenefit: "お肉の脂っこさをさっぱり野菜が中和し、ビタミンC・カリウムでむくみ予防！",
        tips: "肉料理のタンパク質・脂質には、カリウムと酵素を多く含む生野菜や海藻の副菜を合わせると消化吸収が格段にスムーズになります。",
      };
    }

    if (/魚|鮭|サバ|ブリ|鯛|タラ|刺身/.test(title)) {
      return {
        side: "ほうれん草・小松菜のごま和え（またはきんぴらごぼう）",
        sideTime: "4分",
        soup: "根菜たっぷり豚汁または豆腐となめこの味噌汁",
        soupTime: "6分",
        nutritionBenefit: "魚の良質なオメガ3脂肪酸（EPA/DHA）に緑黄色野菜の鉄分・カロテンをプラス！",
        tips: "魚料理には緑黄色野菜（βカロテン・鉄分）や根菜の副菜を組み合わせると、抗酸化作用と骨の健康サポートが倍増します。",
      };
    }

    if (/パスタ|洋風|グラタン|ソテー/.test(cuisine + title)) {
      return {
        side: "グリーンサラダ（玉ねぎドレッシング）",
        sideTime: "3分",
        soup: "コーンスープまたは野菜たっぷりコンソメスープ",
        soupTime: "5分",
        nutritionBenefit: "洋風メニューに不足しがちな食物繊維と水分を補う黄金トリオ！",
        tips: "オリーブオイルやチーズを使った洋食には、さっぱりした酸味のあるドレッシングのサラダが相性抜群です。",
      };
    }

    // Default Japanese / General balance
    return {
      side: "きゅうりとちくわの酢の物（または無限ピーマン）",
      sideTime: "3分",
      soup: "豆腐と長ネギのホッとするお味噌汁",
      soupTime: "4分",
      nutritionBenefit: "主菜の旨味を引き立てる、王道の和食一汁二菜バランス！",
      tips: "主菜に合わせた簡単な副菜1品と汁物を添えるだけで、血糖値の急上昇を抑え、満足度が大幅にアップします。",
    };
  };

  const pairing = getSideDishPairing();

  return (
    <div className="bg-gradient-to-br from-emerald-50/80 via-teal-50/60 to-stone-50 border border-emerald-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-stone-900">
              栄養士が選ぶ「一汁二菜」おすすめの組み合わせ
            </h3>
            <p className="text-xs text-stone-600 font-medium">
              この主菜に合わせると献立の栄養バランスが完璧になる副菜＆汁物
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Recommended Side Dish */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200/70 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
              <Salad className="w-3.5 h-3.5 text-emerald-600" />
              おすすめ副菜（小鉢）
            </span>
            <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
              時短 {pairing.sideTime}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-extrabold text-stone-900 leading-snug">
            {pairing.side}
          </p>
        </div>

        {/* Recommended Soup */}
        <div className="bg-white p-4 rounded-2xl border border-teal-200/70 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-teal-800 flex items-center gap-1.5">
              <Soup className="w-3.5 h-3.5 text-teal-600" />
              おすすめ汁物（スープ）
            </span>
            <span className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
              約 {pairing.soupTime}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-extrabold text-stone-900 leading-snug">
            {pairing.soup}
          </p>
        </div>
      </div>

      {/* Nutrition Benefit Callout */}
      <div className="bg-emerald-100/60 border border-emerald-200 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-emerald-950 font-medium leading-relaxed">
        <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-black text-emerald-900 mr-1">栄養バランス効果:</span>
          <span>{pairing.nutritionBenefit}</span>
          <p className="text-[11px] text-emerald-800 mt-1">{pairing.tips}</p>
        </div>
      </div>
    </div>
  );
};
