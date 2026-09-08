import React from "react";
import { PackageOpen, Snowflake, Refrigerator, Sparkles, AlertCircle, Lightbulb } from "lucide-react";
import { Recipe } from "../types";

interface FoodStorageTipsProps {
  recipe: Recipe;
}

export const FoodStorageTips: React.FC<FoodStorageTipsProps> = ({ recipe }) => {
  const getIngredientTips = () => {
    const title = recipe.title;
    const mainList = recipe.mainIngredients.map((i) => i.name).join(" ");

    if (/こんにゃく|蒟蒻|しらたき/.test(title + mainList)) {
      return {
        title: "こんにゃく・しらたきの保存・下ごしらえ豆知識",
        fridge: "使いかけのこんにゃくは清潔なタッパーに入れ、水を張って冷蔵庫へ。2〜3日に一度水を替えれば約1週間持ちます。",
        freeze: "※ こんにゃくは冷凍すると水分が抜けてスポンジ状になりますが、実はこの「冷凍こんにゃく」は解凍してお肉代わりに炒めるとタレが染み込み絶品です！",
        prep: "スプーンでちぎるか格子状に細かく隠し包丁を入れると、表面積が増えて味染みが抜群に良くなります。",
      };
    }

    if (/豚|肉|牛|鶏|ひき肉/.test(title + mainList)) {
      return {
        title: "お肉の美味しさを保つ冷蔵・冷凍テクニック",
        fridge: "パックのままではなく、ドリップ（水分）をキッチンペーパーで拭き取り、ラップで空気が入らないようピッチリ包んでチルド室へ（2〜3日）。",
        freeze: "1回分ずつ小分けにしてラップし、金属トレイに乗せて急速冷凍するとドリップが出ず旨味が凝縮します（約1ヶ月保存可能）。",
        prep: "調理前に下味（酒・醤油・生姜など）を揉み込んでから冷凍する「下味冷凍」をしておくと、解凍後そのまま焼くだけで柔らかくジューシーに仕上がります。",
      };
    }

    if (/魚|鮭|サバ|鯛|タラ/.test(title + mainList)) {
      return {
        title: "魚の生臭さを消して長持ちさせる保存テク",
        fridge: "表面の水分をキッチンペーパーで拭き取り、少量の酒か塩を振ってからラップで包むと、生臭さの原因となるトリメチルアミンを抑えられます。",
        freeze: "切り身にみりん醤油や味噌を塗って「漬け魚」にしてから冷凍すると、パサつかず冷凍焼けも防げます（約3週間）。",
        prep: "焼く直前に塩を振って5分置き、浮き出た余分な水分を拭き取ると、皮がパリッと香ばしく仕上がります。",
      };
    }

    // Default Vegetables
    return {
      title: "野菜の鮮度を長持ちさせる保存テクニック",
      fridge: "キャベツやレタスなどの葉物野菜は、芯の部分につまようじを3本刺すか芯をくり抜いて濡らしたペーパーを詰めると、成長が止まり2倍長持ちします。",
      freeze: "きのこ類（しめじ・えのき・椎茸）は石づきを取って冷凍用保存袋で冷凍すると、細胞が壊れてグアニル酸（旨味成分）が約3倍にアップします！",
      prep: "野菜は水気をしっかり切ってから炒めることで、水っぽくならずシャキシャキの歯ごたえが残ります。",
    };
  };

  const tips = getIngredientTips();

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-stone-900">
            {tips.title}
          </h3>
          <p className="text-xs text-stone-600 font-medium">余った食材の長持ち保存法 & 旨味アップのコツ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Refrigerator */}
        <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-1">
          <span className="font-extrabold text-sky-800 flex items-center gap-1">
            <Refrigerator className="w-3.5 h-3.5 text-sky-600" />
            冷蔵保存のコツ
          </span>
          <p className="text-stone-700 leading-relaxed font-medium">
            {tips.fridge}
          </p>
        </div>

        {/* Freezer */}
        <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-1">
          <span className="font-extrabold text-indigo-800 flex items-center gap-1">
            <Snowflake className="w-3.5 h-3.5 text-indigo-600" />
            冷凍保存・旨味UP
          </span>
          <p className="text-stone-700 leading-relaxed font-medium">
            {tips.freeze}
          </p>
        </div>

        {/* Preparation */}
        <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-1">
          <span className="font-extrabold text-amber-800 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            下ごしらえの裏ワザ
          </span>
          <p className="text-stone-700 leading-relaxed font-medium">
            {tips.prep}
          </p>
        </div>
      </div>
    </div>
  );
};
