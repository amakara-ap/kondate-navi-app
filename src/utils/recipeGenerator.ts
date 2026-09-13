import { Recipe, AnalysisResult, DetectedIngredient } from "../types";
import { extractColorFeaturesFromPixels, classifyFoodFromColorFeatures } from "./imageAnalyzer";

// Cross-platform helper to decode base64 to byte array in both Node.js and browser/Capacitor
function decodeBase64Bytes(base64Data: string): Uint8Array {
  try {
    const raw = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;
    if (typeof Buffer !== "undefined") {
      return Buffer.from(raw, "base64");
    }
    const binaryString = atob(raw);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch {
    return new Uint8Array(0);
  }
}

// Detect likely ingredients from image buffer properties (color distribution, brightness, saturation)
export function detectIngredientsFromImageBuffer(base64Data: string): string[] {
  try {
    const buffer = decodeBase64Bytes(base64Data);
    if (buffer.length < 200) return ["人参", "大根", "豚肉"];

    const features = extractColorFeaturesFromPixels(buffer as any);
    const classification = classifyFoodFromColorFeatures(features);

    if (classification.candidates && classification.candidates.length > 0) {
      return classification.candidates;
    }
    return [classification.primaryName, "豚肉", "キャベツ"];
  } catch (e) {
    console.warn("Failed to sample image buffer:", e);
    return ["人参", "大根", "豚肉"];
  }
}

// Categorize raw ingredient name into food category
function categorizeIngredient(name: string): "meat" | "fish" | "vegetable" | "dairy_egg" | "grain" | "seasoning" | "other" {
  const lower = name.toLowerCase();
  if (/ハム|ベーコン|ウインナー|ソーセージ|サラダチキン|チャーシュー|焼豚|フランクフルト|豚|鶏|牛|チキン|ポーク|ビーフ|肉|ささみ|手羽|ひき肉|挽肉|ロース|バラ|ヒレ|ハラミ|タン|カルビ/.test(lower)) {
    return "meat";
  }
  if (/魚|鮭|サーモン|サバ|鯖|ブリ|鰤|カツオ|鰹|マグロ|鮪|アジ|鯵|イワシ|鰯|タイ|鯛|ヒラメ|平目|タコ|蛸|イカ|烏賊|エビ|海老|カニ|蟹|アサリ|浅蜊|ホタテ|帆立|しじみ|蜆|カキ|牡蠣|海鮮|ツナ|たら|タラ|しらす|ちくわ|カニカマ|かまぼこ/.test(lower)) {
    return "fish";
  }
  if (/卵|たまご|タマゴ|チーズ|牛乳|ヨーグルト|生クリーム|バター/.test(lower)) {
    return "dairy_egg";
  }
  if (/そば|蕎麦|うどん|焼きそば|焼そば|ラーメン|中華麺|パスタ|スパゲッティ|そうめん|素麺|麺|ご飯|ごはん|米/.test(lower)) {
    return "grain";
  }
  if (/こんにゃく|蒟蒻|コンニャク|しらたき|白滝|糸こんにゃく|板こんにゃく/.test(lower)) {
    return "other";
  }
  if (/キャベツ|白菜|玉ねぎ|長ネギ|ネギ|人参|にんじん|もやし|じゃがいも|大根|トマト|ナス|なす|ピーマン|ブロッコリー|ほうれん草|小松菜|レタス|きゅうり|ごぼう|れんこん|山芋|長芋|とろろ|大和芋|しいたけ|しめじ|まいたけ|えのき|エリンギ|マッシュルーム|きのこ|アボカド|ニラ|オクラ|ズッキーニ|かぼちゃ|南瓜|アスパラ|パプリカ|豆苗|水菜|大葉|しそ/.test(lower)) {
    return "vegetable";
  }
  if (/ソース|お好み焼きソース|マヨネーズ|小麦粉|薄力粉|片栗粉|醤油|味噌|みりん|酒|砂糖|塩|こしょう|胡椒|ごま油|サラダ油|オリーブ油|ポン酢|めんつゆ|オイスターソース|ケチャップ|豆板醤|甜麺醤|白だし|カレー粉|カレールー|カレー|ホワイトシチュールー|ホワイトシチュー|シチュールー|シチュー|クリームシチュー|デミグラス|デミグラスソース|ハヤシ|ハヤシライス|トマトソース|トマト缶|コンソメ|ブイヨン|ホワイトソース|鶏がら|和風だし|わさび|からし/.test(lower)) {
    return "seasoning";
  }
  return "other";
}

// Generate realistic nutrition for a recipe
function estimateNutrition(
  title: string,
  mains: Array<{ name: string; baseAmount: number; unit: string }>,
  seasonings: Array<{ name: string; baseAmount: number; unit: string }>
) {
  let calories = 140;
  let protein = 5;
  let fat = 5;
  let carbs = 8;
  let salt = 1.0;

  for (const m of mains) {
    const n = m.name;
    if (/ウインナー|ソーセージ/.test(n)) {
      calories += 180;
      protein += 8;
      fat += 16;
      salt += 0.7;
    } else if (/ベーコン/.test(n)) {
      calories += 190;
      protein += 9;
      fat += 17;
      salt += 0.8;
    } else if (/ハム/.test(n)) {
      calories += 110;
      protein += 14;
      fat += 6;
      salt += 0.8;
    } else if (/サラダチキン/.test(n)) {
      calories += 105;
      protein += 22;
      fat += 1.5;
      salt += 0.6;
    } else if (/うどん|そば|焼きそば|ラーメン|麺/.test(n)) {
      calories += 240;
      carbs += 50;
      protein += 6;
      salt += 0.3;
    } else if (/油揚げ|うすあげ|きざみあげ/.test(n)) {
      calories += 110;
      protein += 7;
      fat += 9;
    } else if (/厚揚げ/.test(n)) {
      calories += 135;
      protein += 10;
      fat += 9;
    } else if (/豚バラ|牛バラ|カルビ/.test(n)) {
      calories += 220;
      protein += 14;
      fat += 19;
    } else if (/豚|牛/.test(n)) {
      calories += 170;
      protein += 16;
      fat += 12;
    } else if (/鶏むね|ささみ/.test(n)) {
      calories += 110;
      protein += 22;
      fat += 2;
    } else if (/鶏/.test(n)) {
      calories += 160;
      protein += 18;
      fat += 9;
    } else if (/鮭|サバ|ブリ|魚/.test(n)) {
      calories += 150;
      protein += 18;
      fat += 8;
    } else if (/エビ|イカ|タコ|アサリ|ホタテ/.test(n)) {
      calories += 70;
      protein += 14;
      fat += 1;
    } else if (/卵/.test(n)) {
      calories += 75;
      protein += 6.5;
      fat += 5.5;
      carbs += 0.5;
    } else if (/山芋|長芋|じゃがいも|さつまいも/.test(n)) {
      calories += 50;
      protein += 1.5;
      carbs += 11;
    } else if (/豆腐|厚揚げ|納豆/.test(n)) {
      calories += 85;
      protein += 8;
      fat += 5;
      carbs += 2;
    } else {
      calories += 25;
      carbs += 4;
    }
  }

  for (const s of seasonings) {
    if (/マヨネーズ/.test(s.name)) {
      calories += 80;
      fat += 9;
    } else if (/油|バター/.test(s.name)) {
      calories += 70;
      fat += 8;
    } else if (/ソース|ケチャップ|みりん|砂糖|小麦粉/.test(s.name)) {
      calories += 35;
      carbs += 8;
      salt += 0.4;
    } else if (/醤油|味噌|めんつゆ|塩/.test(s.name)) {
      salt += 0.7;
    }
  }

  if (/丼|ご飯/.test(title)) {
    calories += 250;
    carbs += 55;
    protein += 4;
  }

  return {
    calories: Math.round(calories),
    protein: Number(protein.toFixed(1)),
    fat: Number(fat.toFixed(1)),
    carbohydrates: Math.round(carbs),
    saltEquivalent: Number(Math.min(3.5, Math.max(0.8, salt)).toFixed(1)),
  };
}

// Generate fully customized recipes from exact input ingredients and exact available seasonings
export function generateSmartRecipes(
  inputIngredients: string[] = [],
  preferences: {
    time?: string;
    cuisine?: string;
    mood?: string;
    extraIngredients?: string;
    staples?: string[];
    customIngredients?: string[];
    detectedHint?: string;
  } = {}
): AnalysisResult {
  // Collect all unique input ingredients, respecting order
  const rawList: string[] = [
    ...(preferences.detectedHint ? [preferences.detectedHint] : []),
    ...(preferences.customIngredients || []),
    ...inputIngredients,
  ].filter(Boolean);

  const seen = new Set<string>();
  const allInputs: string[] = [];
  for (const item of rawList) {
    const trimmed = item.trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      allInputs.push(trimmed);
    }
  }

  // If no ingredients provided, default to common shopping ingredients
  if (allInputs.length === 0) {
    allInputs.push("豚バラ肉", "キャベツ", "卵");
  }

  // Build detected ingredients with category metadata
  const detectedIngredients: DetectedIngredient[] = allInputs.map((name) => ({
    name,
    category: categorizeIngredient(name),
    confidence: "high",
  }));

  // Build analysis comment acknowledging ALL exact input ingredients
  const ingredientNames = allInputs.join("・");
  const analysisComment = `「${ingredientNames}」が認識されました！食材の旨味と栄養バランスを最大限に活かし、ご指定の調味料と調理法で簡単に作れる厳選5通りの献立をご提案します。`;

  // Parse available seasonings
  const rawStaples: string[] = (preferences.staples && preferences.staples.length > 0)
    ? preferences.staples
    : ["サラダ油", "マヨネーズ", "醤油", "酒", "みりん", "砂糖", "塩・こしょう", "ごま油"];

  const hasStaple = (pattern: RegExp) => rawStaples.some((s) => pattern.test(s));

  const hasSauce = hasStaple(/ソース|お好み焼きソース|ウスター|中濃/);
  const hasMayo = hasStaple(/マヨネーズ|マヨ/);
  const hasFlour = hasStaple(/小麦粉|薄力粉|お好み焼き粉|片栗粉/);
  const hasOil = hasStaple(/サラダ油|油|ごま油|オリーブ/);
  const hasSoySauce = hasStaple(/醤油|しょうゆ/);
  const hasMiso = hasStaple(/味噌|みそ/);
  const hasMirin = hasStaple(/みりん|味醂/);
  const hasSake = hasStaple(/酒|料理酒/);
  const hasSugar = hasStaple(/砂糖|さとう/);
  const hasSaltPepper = hasStaple(/塩|こしょう|胡椒/);
  const hasPonzu = hasStaple(/ポン酢|ぽん酢/);
  const hasMentsuyu = hasStaple(/めんつゆ|麺つゆ/);
  const hasOyster = hasStaple(/オイスターソース|オイスター/);
  const hasKetchup = hasStaple(/ケチャップ/);
  const hasDashi = hasStaple(/だし|和風顆粒だし|白だし/);
  const hasGarlicGinger = hasStaple(/にんにく|生姜|しょうが/);
  const hasChickenStock = hasStaple(/鶏がら|鶏ガラスープ/);
  const hasButter = hasStaple(/バター/);
  const hasDoubanjiang = hasStaple(/豆板醤|コチュジャン|唐辛子/);
  const hasCurry = hasStaple(/カレー粉|カレールー/);
  const hasConsomme = hasStaple(/コンソメ|ブイヨン/);
  const hasTomatoStaple = hasStaple(/トマトソース|トマト缶/);
  const hasDemiglaceStaple = hasStaple(/デミグラス/);
  const hasWhiteStewStaple = hasStaple(/ホワイトシチュー|シチュールー/);

  // Helper to construct seasonings list based on availability
  const buildSeasoningList = (idealList: Array<{ name: string; baseAmount: number; unit: string; preferred?: boolean }>) => {
    const list: Array<{ name: string; baseAmount: number; unit: string; isPantryStaple?: boolean }> = [];
    for (const item of idealList) {
      list.push({
        name: item.name,
        baseAmount: item.baseAmount,
        unit: item.unit,
        isPantryStaple: true,
      });
    }
    return list;
  };

  // Identify key ingredient types in user input
  const searchStr = allInputs.join(" ").toLowerCase();
  const hasYam = /山芋|長芋|とろろ|大和芋/.test(searchStr);
  const hasPork = /豚|ポーク|バラ|ロース/.test(searchStr);
  const hasBeef = /牛|ビーフ|カルビ|ハラミ|タン/.test(searchStr);
  const hasChicken = /鶏|チキン|ささみ|手羽|むね|もも/.test(searchStr);
  const hasFish = /魚|鮭|サーモン|サバ|鯖|ブリ|鰤|カツオ|鰹|マグロ|鮪|アジ|鯵|イワシ|鰯|タイ|鯛|ヒラメ|平目|タコ|蛸|イカ|烏賊|エビ|海老|カニ|蟹|アサリ|浅蜊|ホタテ|帆立|しじみ|蜆|カキ|牡蠣/.test(searchStr);
  const hasCabbage = /キャベツ|白菜/.test(searchStr);
  const hasEgg = /卵|たまご/.test(searchStr);
  const hasTofu = /豆腐|とうふ|厚揚げ|納豆/.test(searchStr);

  const mainMeatOrProtein = allInputs.find((i) => categorizeIngredient(i) === "meat" || categorizeIngredient(i) === "fish") || "豚肉（または鶏肉）";
  const primaryVeg = allInputs.find((i) => categorizeIngredient(i) === "vegetable") || allInputs[0] || "キャベツ";
  // If user only scanned a vegetable, prioritize that scanned vegetable as the primary hero ingredient!
  const heroIngredient = allInputs[0] || primaryVeg;
  const secondaryIngredient = allInputs.find((i) => i !== heroIngredient) || (categorizeIngredient(heroIngredient) === "vegetable" ? mainMeatOrProtein : "キャベツ");
  const otherIngredients = allInputs.filter((i) => i !== heroIngredient && i !== secondaryIngredient);

  let recipes: Recipe[] = [];

  // Check for specialized sauces and roux matches
  const hasCurryMatch = /カレールー|カレー粉|カレー/.test(searchStr) || (preferences.customIngredients && preferences.customIngredients.some((i) => /カレールー|カレー粉|カレー/.test(i)));
  const hasWhiteStewMatch = /ホワイトシチュー|シチュールー|クリームシチュー|シチュー/.test(searchStr) || (preferences.customIngredients && preferences.customIngredients.some((i) => /ホワイトシチュー|シチュールー|シチュー/.test(i)));
  const hasDemiglaceMatch = /デミグラス|デミグラスソース|ハヤシ|ハヤシライス/.test(searchStr) || (preferences.customIngredients && preferences.customIngredients.some((i) => /デミグラス|ハヤシ/.test(i)));
  const hasTomatoSauceMatch = /トマトソース|トマト缶/.test(searchStr) || (preferences.customIngredients && preferences.customIngredients.some((i) => /トマトソース|トマト缶/.test(i)));
  const hasConsommeMatch = /コンソメ|ブイヨン/.test(searchStr) || (preferences.customIngredients && preferences.customIngredients.some((i) => /コンソメ|ブイヨン/.test(i)));

  if (hasCurryMatch) {
    // SPECIAL MATCH: CURRY / CURRY ROUX / CURRY POWDER (王道カレー最優先)
    const meatName = allInputs.find((i) => categorizeIngredient(i) === "meat") || "豚肉（または鶏肉・牛肉）";
    const onionName = allInputs.find((i) => /玉ねぎ|たまねぎ/.test(i)) || "玉ねぎ";
    const potatoName = allInputs.find((i) => /じゃがいも|ポテト/.test(i)) || "じゃがいも";
    const carrotName = allInputs.find((i) => /人参|にんじん/.test(i)) || "人参";
    const curryItemName = allInputs.find((i) => /カレールー|カレー粉|カレー/.test(i)) || "カレールー";

    // Recipe 1: 旨味凝縮！おうちの王道定番カレー
    const c1Mains = [
      { name: meatName, baseAmount: 200, unit: "g", note: "一口大にカット" },
      { name: onionName, baseAmount: 1, unit: "個 (約200g)", note: "くし形切り（しっかり炒めて甘みを引き出す）" },
      { name: potatoName, baseAmount: 2, unit: "個 (約250g)", note: "乱切り（面取りすると煮崩れ防止）" },
      { name: carrotName, baseAmount: 1, unit: "本 (約120g)", note: "乱切り" },
    ];
    const c1Seasonings = buildSeasoningList([
      { name: curryItemName, baseAmount: 4, unit: "皿分 (約80g)" },
      { name: "水", baseAmount: 600, unit: "ml" },
      { name: hasOil ? "サラダ油" : "油", baseAmount: 1, unit: "大さじ" },
      { name: hasButter ? "バター（隠し味）" : (hasSoySauce ? "醤油（隠し味）" : "塩・こしょう"), baseAmount: 1, unit: "小さじ" },
    ]);

    // Recipe 2: スパイス香る 絶品ドライキーマカレー 温玉のせ
    const c2Mains = [
      { name: meatName, baseAmount: 180, unit: "g", note: "粗みじん切りまたはひき肉" },
      { name: onionName, baseAmount: 1, unit: "個", note: "みじん切り" },
      { name: carrotName, baseAmount: 0.5, unit: "本", note: "みじん切り" },
      { name: "卵（温玉または生卵）", baseAmount: 2, unit: "個" },
    ];
    const c2Seasonings = buildSeasoningList([
      { name: curryItemName, baseAmount: 2, unit: "皿分 (またはカレー粉大さじ1.5)" },
      { name: hasKetchup ? "ケチャップ" : "醤油", baseAmount: 1.5, unit: "大さじ" },
      { name: hasSauce ? "ウスターソース（中濃ソース）" : "醤油", baseAmount: 1, unit: "大さじ" },
      { name: hasOil ? "サラダ油" : "油", baseAmount: 1, unit: "大さじ" },
    ]);

    // Recipe 3: 出汁が決め手！お蕎麦屋さん風 和風カレーうどん
    const c3Mains = [
      { name: "うどん（茹で麺または冷凍麺）", baseAmount: 2, unit: "玉" },
      { name: meatName, baseAmount: 120, unit: "g", note: "食べやすくカット" },
      { name: onionName, baseAmount: 0.5, unit: "個", note: "薄切り" },
    ];
    const c3Seasonings = buildSeasoningList([
      { name: curryItemName, baseAmount: 2, unit: "かけ (約40g)" },
      { name: hasMentsuyu ? "めんつゆ（3倍濃縮）" : (hasSoySauce ? "醤油・みりん" : "和風顆粒だし"), baseAmount: 3, unit: "大さじ" },
      { name: hasDashi ? "和風顆粒だし" : "水", baseAmount: 1, unit: "小さじ" },
      { name: "水", baseAmount: 500, unit: "ml" },
      { name: hasFlour ? "水溶き片栗粉" : "片栗粉", baseAmount: 1, unit: "大さじ" },
    ]);

    // Recipe 4: チーズとろ〜り 濃厚焼きカレードリア
    const c4Mains = [
      { name: "温かいご飯", baseAmount: 300, unit: "g (2膳分)" },
      { name: meatName, baseAmount: 140, unit: "g" },
      { name: onionName, baseAmount: 0.5, unit: "個" },
      { name: "ピザ用とろけるチーズ", baseAmount: 60, unit: "g" },
      { name: "卵", baseAmount: 2, unit: "個" },
    ];
    const c4Seasonings = buildSeasoningList([
      { name: curryItemName, baseAmount: 2, unit: "かけ (またはカレー粉大さじ1)" },
      { name: hasButter ? "バター" : "サラダ油", baseAmount: 1, unit: "大さじ" },
      { name: hasKetchup ? "ケチャップ" : "塩・こしょう", baseAmount: 1, unit: "大さじ" },
    ]);

    // Recipe 5: 具だくさん カレー風味のスパイシー野菜炒め
    const c5Mains = [
      { name: meatName, baseAmount: 160, unit: "g" },
      { name: potatoName, baseAmount: 1, unit: "個", note: "細切り" },
      { name: onionName, baseAmount: 0.5, unit: "個", note: "薄切り" },
      { name: carrotName, baseAmount: 0.5, unit: "本", note: "短冊切り" },
    ];
    const c5Seasonings = buildSeasoningList([
      { name: curryItemName, baseAmount: 1, unit: "かけ（刻む）またはカレー粉大さじ1" },
      { name: hasSoySauce ? "醤油" : "めんつゆ", baseAmount: 1, unit: "大さじ" },
      { name: hasOil ? "サラダ油" : "油", baseAmount: 1, unit: "大さじ" },
      { name: hasSaltPepper ? "塩・こしょう" : "塩", baseAmount: 1, unit: "少々" },
    ]);

    recipes = [
      {
        id: "rec_curry_1",
        title: `じっくり煮込んだ旨味凝縮！おうちの王道定番${meatName}カレー`,
        subtitle: `ゴロゴロ野菜とお肉のコクが溶け出す！誰もが大好きな日本の国民食`,
        description: `香ばしく炒めた${meatName}と${onionName}の甘み、ホクホクの${potatoName}がカレールーと一体になった、不動の人気を誇る王道カレーライスです。`,
        cookingTimeMinutes: 25,
        difficulty: "普通",
        cuisineType: "洋風",
        tags: ["王道定番", "国民食", "大満足", "煮込み料理", "作り置き"],
        baseServings: 2,
        mainIngredients: c1Mains,
        seasonings: c1Seasonings,
        steps: [
          { stepNumber: 1, instruction: `${meatName}、${potatoName}、${carrotName}は一口大に切り、${onionName}はくし形に切ります。` },
          { stepNumber: 2, instruction: `厚手の鍋に油を熱し、${onionName}が透き通るまで炒め、${meatName}、${carrotName}、${potatoName}を加えて全体に油が回るまで中火で炒めます。`, timerMinutes: 5 },
          { stepNumber: 3, instruction: `水を加えて沸騰させ、丁寧にアクを取り除いた後、フタをして弱火〜中火で具材が柔らかくなるまで煮込みます。`, timerMinutes: 15 },
          { stepNumber: 4, instruction: `いったん火を止め、${curryItemName}を割り入れてよく溶かします。` },
          { stepNumber: 5, instruction: `再び弱火にかけ、時々かき混ぜながらとろみがつくまで煮込み、温かいご飯にかけて完成です！`, timerMinutes: 5 },
        ],
        nutritionPerServing: { calories: 580, protein: 22.4, fat: 19.8, carbohydrates: 78.5, saltEquivalent: 2.6, highlights: "ターメリックやクミンなどのスパイス効果で新陳代謝を活発にし、疲労回復を強力にサポート。" },
        chefTips: "玉ねぎをしっかり炒めることで甘みとコクが段違いにアップします。最後に醤油やバターを隠し味に少量加えると深みが増します。",
      },
      {
        id: "rec_curry_2",
        title: `フライパンで12分！スパイス香る絶品ドライキーマカレー 温玉のせ`,
        subtitle: `煮込み時間いらずのスピード調理！旨味がギュッと詰まった濃厚カレー`,
        description: `みじん切りにした野菜と${meatName}をフライパンで香ばしく炒め煮にした、ジューシーで濃厚なドライカレーです。とろとろ温玉を絡めて召し上がれ。`,
        cookingTimeMinutes: 12,
        difficulty: "簡単",
        cuisineType: "洋風",
        tags: ["時短12分", "フライパン1つ", "温玉のせ", "大人気"],
        baseServings: 2,
        mainIngredients: c2Mains,
        seasonings: c2Seasonings,
        steps: [
          { stepNumber: 1, instruction: `${onionName}と${carrotName}はみじん切りにし、${meatName}は粗みじん切り（またはひき肉）にします。` },
          { stepNumber: 2, instruction: `フライパンに油を熱し、${onionName}と${meatName}をしっかり炒めて水分を飛ばします。`, timerMinutes: 4 },
          { stepNumber: 3, instruction: `刻んだ${curryItemName}、ケチャップ、ウスターソースを加えて中火で手早く炒め合わせます。`, timerMinutes: 3 },
          { stepNumber: 4, instruction: `ご飯の上に盛り付け、中央にくぼみを作って温玉をのせて完成です。` },
        ],
        nutritionPerServing: { calories: 520, protein: 21.0, fat: 17.5, carbohydrates: 72.0, saltEquivalent: 2.3, highlights: "卵の良質たんぱく質と野菜のビタミンが効率よく摂取できます。" },
        chefTips: "野菜の水分をしっかり飛ばしてから調味料を加えることで、味がぼやけず濃厚に仕上がります。",
      },
      {
        id: "rec_curry_3",
        title: `お出汁が香る！お蕎麦屋さん風 和風出汁カレーうどん`,
        subtitle: `カレールーと和風だしの絶妙なハーモニー！最後の一滴まで飲み干したい一杯`,
        description: `鰹と昆布の和風だしにカレールーを溶かし込み、とろみをつけた熱々のカレーつゆがうどんにしっかり絡む絶品うどんです。`,
        cookingTimeMinutes: 12,
        difficulty: "簡単",
        cuisineType: "和風",
        tags: ["麺類", "和風だし", "身体ポカポカ", "つゆだく"],
        baseServings: 2,
        mainIngredients: c3Mains,
        seasonings: c3Seasonings,
        steps: [
          { stepNumber: 1, instruction: `鍋に水とめんつゆ、和風だしを入れて中火にかけ、${meatName}と${onionName}を加えて煮ます。`, timerMinutes: 4 },
          { stepNumber: 2, instruction: `火を弱めて${curryItemName}を溶かし入れ、水溶き片栗粉を加えてとろみをつけます。`, timerMinutes: 2 },
          { stepNumber: 3, instruction: `別の鍋で温めたうどんを器によそい、熱々のカレーつゆをたっぷり注ぎます。` },
        ],
        nutritionPerServing: { calories: 460, protein: 18.2, fat: 12.0, carbohydrates: 68.0, saltEquivalent: 3.2, highlights: "温かいスープとうどんの消化吸収の良さで、体を芯から温めます。" },
        chefTips: "カレールーを入れる前にしっかり出汁を煮立たせておくと、だしの香りが引き立ちます。",
      },
      {
        id: "rec_curry_4",
        title: `チーズとろ〜り！香ばし濃厚焼きカレードリア`,
        subtitle: `トースターでこんがり焼くだけ！香ばしい焦げ目とチーズがたまらない`,
        description: `ご飯の上にカレーとたっぷりのチーズ、卵をのせてオーブンやトースターでこんがり焼き上げた門司港名物風のごちそうドリアです。`,
        cookingTimeMinutes: 15,
        difficulty: "簡単",
        cuisineType: "洋風",
        tags: ["チーズ", "トースター調理", "熱々とろ〜り", "ごちそう"],
        baseServings: 2,
        mainIngredients: c4Mains,
        seasonings: c4Seasonings,
        steps: [
          { stepNumber: 1, instruction: `耐熱皿にバターを薄く塗り、温かいご飯を平らに敷きます。` },
          { stepNumber: 2, instruction: `カレーをご飯の上に広げ、中央にくぼみを作って卵を割り落とします。` },
          { stepNumber: 3, instruction: `ピザ用チーズをたっぷり散らし、オーブントースターでチーズに焼き色がつくまで焼きます。`, timerMinutes: 8 },
        ],
        nutritionPerServing: { calories: 590, protein: 24.5, fat: 22.0, carbohydrates: 74.0, saltEquivalent: 2.8, highlights: "チーズのカルシウムと良質たんぱく質が加わり、栄養満点。" },
        chefTips: "卵の黄身につまようじで1箇所穴を開けておくと、トースター内での破裂を防げます。",
      },
      {
        id: "rec_curry_5",
        title: `${meatName}と野菜の香ばしスパイシー カレーソテー`,
        subtitle: `ご飯にもお酒にも合う！10分で作れるスパイシーな炒めおかず`,
        description: `刻んだカレールーまたはカレー粉を調味料として活用し、${meatName}とお野菜の甘みを引き立てた手軽なメイン炒め物です。`,
        cookingTimeMinutes: 10,
        difficulty: "簡単",
        cuisineType: "洋風",
        tags: ["時短10分", "フライパン1つ", "お弁当にも", "ご飯が進む"],
        baseServings: 2,
        mainIngredients: c5Mains,
        seasonings: c5Seasonings,
        steps: [
          { stepNumber: 1, instruction: `具材を食べやすい大きさに切ります。` },
          { stepNumber: 2, instruction: `フライパンに油を熱し、${meatName}を炒めて色が変わったら野菜を加えて強火で炒めます。`, timerMinutes: 4 },
          { stepNumber: 3, instruction: `刻んだ${curryItemName}と醤油を加え、全体にスパイシーな香りが広がるまで手早く炒め合わせます。`, timerMinutes: 2 },
        ],
        nutritionPerServing: { calories: 340, protein: 18.0, fat: 18.5, carbohydrates: 24.0, saltEquivalent: 1.8, highlights: "野菜の食物繊維とスパイスの抗酸化作用で免疫力アップ。" },
        chefTips: "ルーは細かく包丁で刻んでおくと、炒め物にダマにならず綺麗に絡みます。",
      },
    ];
  } else if (hasWhiteStewMatch) {
    // SPECIAL MATCH: WHITE STEW / CREAM STEW ROUX (王道ホワイトシチュー最優先)
    const meatName = allInputs.find((i) => categorizeIngredient(i) === "meat") || "鶏もも肉（または豚肉）";
    const onionName = allInputs.find((i) => /玉ねぎ|たまねぎ/.test(i)) || "玉ねぎ";
    const potatoName = allInputs.find((i) => /じゃがいも|ポテト/.test(i)) || "じゃがいも";
    const carrotName = allInputs.find((i) => /人参|にんじん/.test(i)) || "人参";
    const stewItemName = allInputs.find((i) => /ホワイトシチュー|シチュールー|シチュー/.test(i)) || "ホワイトシチュールー";

    const s1Mains = [
      { name: meatName, baseAmount: 200, unit: "g", note: "一口大にカット" },
      { name: potatoName, baseAmount: 2, unit: "個", note: "乱切り" },
      { name: onionName, baseAmount: 1, unit: "個", note: "くし形切り" },
      { name: carrotName, baseAmount: 1, unit: "本", note: "乱切り" },
      { name: "牛乳", baseAmount: 150, unit: "ml", note: "仕上げに加えてまろやかに" },
    ];
    const s1Seasonings = buildSeasoningList([
      { name: stewItemName, baseAmount: 4, unit: "皿分 (約80g)" },
      { name: "水", baseAmount: 500, unit: "ml" },
      { name: hasButter ? "バター" : "サラダ油", baseAmount: 1, unit: "大さじ" },
      { name: hasSaltPepper ? "塩・こしょう" : "塩", baseAmount: 1, unit: "少々" },
    ]);

    recipes = [
      {
        id: "rec_stew_1",
        title: `コクと甘みたっぷり！お肉とゴロゴロ野菜の王道ホワイトクリームシチュー`,
        subtitle: `牛乳とルーでとろ〜りクリーミー！子どもから大人まで大好きな冬のごちそう`,
        description: `ジューシーな${meatName}と甘みたっぷりの${onionName}、ホクホク${potatoName}をミルクとシチュールーで優しく煮込んだ王道のホワイトシチューです。`,
        cookingTimeMinutes: 25,
        difficulty: "普通",
        cuisineType: "洋風",
        tags: ["王道定番", "クリーミー", "ごちそう", "身体ポカポカ", "煮込み"],
        baseServings: 2,
        mainIngredients: s1Mains,
        seasonings: s1Seasonings,
        steps: [
          { stepNumber: 1, instruction: `${meatName}、${potatoName}、${carrotName}、${onionName}を食べやすい一口大に切ります。` },
          { stepNumber: 2, instruction: `鍋にバターを熱し、${meatName}と野菜を焦がさないように中弱火でじっくり炒めます。`, timerMinutes: 4 },
          { stepNumber: 3, instruction: `水を加えて沸騰させ、アクを取りながら弱火で具材が柔らかくなるまで煮込みます。`, timerMinutes: 12 },
          { stepNumber: 4, instruction: `いったん火を止め、${stewItemName}を溶かし入れ、牛乳を加えて弱火で5分ほどとろみがつくまで煮ます。`, timerMinutes: 5 },
        ],
        nutritionPerServing: { calories: 420, protein: 21.5, fat: 18.0, carbohydrates: 42.0, saltEquivalent: 2.1, highlights: "牛乳のカルシウムとたんぱく質、根菜のビタミンA・Cで栄養バランス満点。" },
        chefTips: "野菜を炒める時は焼き色をつけず、じっくり汗をかかせるように炒めると真っ白で綺麗に仕上がります。",
      },
      {
        id: "rec_stew_2",
        title: `とろ〜り濃厚！ホワイトシチューの熱々パングラタン`,
        subtitle: `食パンを器にしてトースターで焼くだけ！カフェ風の贅沢リメイク`,
        description: `くり抜いた食パンに濃厚なホワイトシチューをたっぷり注ぎ、チーズを乗せてこんがり焼き上げた絶品グラタンです。`,
        cookingTimeMinutes: 15,
        difficulty: "簡単",
        cuisineType: "洋風",
        tags: ["トースター調理", "カフェ風", "チーズとろ〜り", "おしゃれ"],
        baseServings: 2,
        mainIngredients: [
          { name: "食パン（厚切り）", baseAmount: 2, unit: "枚" },
          { name: meatName, baseAmount: 120, unit: "g" },
          { name: onionName, baseAmount: 0.5, unit: "個" },
          { name: "ピザ用チーズ", baseAmount: 50, unit: "g" },
        ],
        seasonings: buildSeasoningList([
          { name: stewItemName, baseAmount: 2, unit: "かけ" },
          { name: "牛乳", baseAmount: 150, unit: "ml" },
          { name: "水", baseAmount: 100, unit: "ml" },
        ]),
        steps: [
          { stepNumber: 1, instruction: `フライパンで具材を炒めて水とシチュールー、牛乳を加えて濃厚なシチューを作ります。`, timerMinutes: 5 },
          { stepNumber: 2, instruction: `食パンの中央をスプーンで押し込んでくぼみを作り、シチューを流し入れます。` },
          { stepNumber: 3, instruction: `チーズを散らし、トースターでこんがり焦げ目がつくまで焼きます。`, timerMinutes: 6 },
        ],
        nutritionPerServing: { calories: 480, protein: 19.0, fat: 20.0, carbohydrates: 54.0, saltEquivalent: 2.4, highlights: "香ばしいパンと濃厚なシチューがマッチして満足感抜群。" },
        chefTips: "食パンの底に穴が開かないよう、スプーンの背で優しく押し込むのがコツです。",
      },
      {
        id: "rec_stew_3",
        title: `フライパンで作る ${meatName}の濃厚ホワイトクリーム煮込み`,
        subtitle: `15分でできる本格洋食メイン！ご飯にもバゲットにも相性抜群`,
        description: `フライパンで香ばしくソテーした${meatName}にシチューソースを煮絡めた、時短で作れる本格クリーム煮込みです。`,
        cookingTimeMinutes: 15,
        difficulty: "簡単",
        cuisineType: "洋風",
        tags: ["時短15分", "フライパン1つ", "ごちそうメイン", "濃厚"],
        baseServings: 2,
        mainIngredients: s1Mains.slice(0, 4),
        seasonings: s1Seasonings,
        steps: [
          { stepNumber: 1, instruction: `${meatName}は一口大に切り、塩こしょうをふります。` },
          { stepNumber: 2, instruction: `フライパンで${meatName}を皮目から香ばしく焼き、野菜を加えて炒めます。`, timerMinutes: 5 },
          { stepNumber: 3, instruction: `水とルー、牛乳を加えてフタをし、中弱火で煮詰めます。`, timerMinutes: 6 },
        ],
        nutritionPerServing: { calories: 390, protein: 22.0, fat: 17.5, carbohydrates: 34.0, saltEquivalent: 2.0, highlights: "良質たんぱく質がたっぷり摂れるヘルシーなごちそう。" },
        chefTips: "お肉をしっかり焼き付けてから煮込むと、香ばしさがソースに移ってプロの味に！",
      },
      {
        id: "rec_stew_4",
        title: `とろとろ卵のホワイトシチューオムライス`,
        subtitle: `ケチャップライスの酸味とクリームシチューの甘みが絶品コラボ`,
        description: `ふわとろ卵で包んだチキンライスに、熱々のホワイトシチューをたっぷりかけた洋食屋さんの人気メニューです。`,
        cookingTimeMinutes: 15,
        difficulty: "普通",
        cuisineType: "洋風",
        tags: ["オムライス", "洋食屋さん", "大人気", "ワンプレート"],
        baseServings: 2,
        mainIngredients: [
          { name: "温かいご飯", baseAmount: 300, unit: "g" },
          { name: "卵", baseAmount: 3, unit: "個" },
          { name: meatName, baseAmount: 100, unit: "g" },
          { name: onionName, baseAmount: 0.5, unit: "個" },
        ],
        seasonings: buildSeasoningList([
          { name: stewItemName, baseAmount: 2, unit: "かけ" },
          { name: "牛乳", baseAmount: 150, unit: "ml" },
          { name: hasKetchup ? "ケチャップ" : "ソース", baseAmount: 2, unit: "大さじ" },
          { name: hasButter ? "バター" : "油", baseAmount: 1, unit: "大さじ" },
        ]),
        steps: [
          { stepNumber: 1, instruction: `小鍋でシチュールーと牛乳、水（100ml）を煮溶かしてシチューソースを作ります。`, timerMinutes: 4 },
          { stepNumber: 2, instruction: `フライパンで具材とご飯、ケチャップを炒めてチキンライスを作り、器に盛ります。`, timerMinutes: 4 },
          { stepNumber: 3, instruction: `半熟オムレツを焼き、ライスにのせてシチューソースをたっぷりかけます。` },
        ],
        nutritionPerServing: { calories: 530, protein: 20.5, fat: 19.0, carbohydrates: 68.0, saltEquivalent: 2.4, highlights: "卵とお肉のたんぱく質に、炭水化物が効率よく補給できます。" },
        chefTips: "卵は強火で一気に半熟に焼き上げると、ふわとろ食感になります。",
      },
      {
        id: "rec_stew_5",
        title: `ほっこり温まる 具だくさん食べるホワイトミルクスープ`,
        subtitle: `優しいミルクのコクで朝食にも夜食にも！野菜の栄養がたっぷり`,
        description: `シチュールーを軽やかに溶かしてスープ仕立てにした、身体に優しいミルクスープです。`,
        cookingTimeMinutes: 12,
        difficulty: "簡単",
        cuisineType: "洋風",
        tags: ["ミルクスープ", "優しい味わい", "温活", "朝食にも"],
        baseServings: 2,
        mainIngredients: s1Mains.slice(0, 4),
        seasonings: s1Seasonings,
        steps: [
          { stepNumber: 1, instruction: `野菜とお肉を小さめの角切りにします。` },
          { stepNumber: 2, instruction: `鍋で炒めて水を加え、柔らかくなるまで煮ます。`, timerMinutes: 5 },
          { stepNumber: 3, instruction: `ルーを1〜2かけと牛乳を加えて軽くとろみがつくまで温めます。`, timerMinutes: 3 },
        ],
        nutritionPerServing: { calories: 280, protein: 15.0, fat: 12.0, carbohydrates: 28.0, saltEquivalent: 1.6, highlights: "消化に良く、冷えた体を温めるヘルシーなスープです。" },
        chefTips: "野菜を小さめに切ることで、火通りが早くなり10分程度で完成します。",
      },
    ];
  } else if (hasDemiglaceMatch) {
    // SPECIAL MATCH: DEMIGLACE SAUCE / HAYASHI RICE (デミグラスソース・ハヤシライス最優先)
    const beefOrMeat = allInputs.find((i) => categorizeIngredient(i) === "meat") || "牛こま切れ肉（または豚肉）";
    const onionName = allInputs.find((i) => /玉ねぎ|たまねぎ/.test(i)) || "玉ねぎ";
    const shimejiName = allInputs.find((i) => /しめじ|きのこ|マッシュルーム/.test(i)) || "しめじ（マッシュルーム）";

    recipes = [
      {
        id: "rec_demi_1",
        title: `濃厚コク旨！洋食屋さんの王道デミグラスハヤシライス`,
        subtitle: `じっくり炒めた玉ねぎとお肉の旨味！デミグラスソースの贅沢な味わい`,
        description: `香ばしく炒めた${beefOrMeat}と甘みたっぷりの${onionName}、きのこに濃厚なデミグラスソースが絡む、本格洋食のハヤシライスです。`,
        cookingTimeMinutes: 20,
        difficulty: "普通",
        cuisineType: "洋風",
        tags: ["王道定番", "デミグラス", "ごちそう", "洋食屋さん", "大人気"],
        baseServings: 2,
        mainIngredients: [
          { name: beefOrMeat, baseAmount: 200, unit: "g", note: "食べやすい大きさに切る" },
          { name: onionName, baseAmount: 1.5, unit: "個", note: "薄切り（しっかり炒めてコクを出す）" },
          { name: shimejiName, baseAmount: 1, unit: "パック (約100g)", note: "石づきを取って小房に分ける" },
        ],
        seasonings: buildSeasoningList([
          { name: "デミグラスソース（缶/パック）", baseAmount: 1, unit: "缶 (約290g)" },
          { name: "赤ワイン（または料理酒）", baseAmount: 2, unit: "大さじ" },
          { name: "水", baseAmount: 150, unit: "ml" },
          { name: hasButter ? "バター" : "サラダ油", baseAmount: 1.5, unit: "大さじ" },
          { name: hasKetchup ? "ケチャップ" : "醤油", baseAmount: 1, unit: "大さじ" },
        ]),
        steps: [
          { stepNumber: 1, instruction: `フライパンにバターを熱し、${onionName}がきつね色になるまで中火でじっくり炒めます。`, timerMinutes: 6 },
          { stepNumber: 2, instruction: `${beefOrMeat}と${shimejiName}を加え、肉の色が変わるまで炒め、赤ワイン（酒）を回し入れます。`, timerMinutes: 3 },
          { stepNumber: 3, instruction: `デミグラスソース、水、ケチャップを加え、弱火で時々混ぜながらとろみがつくまで煮込みます。`, timerMinutes: 8 },
          { stepNumber: 4, instruction: `温かいご飯の上にかけて完成です！` },
        ],
        nutritionPerServing: { calories: 560, protein: 23.0, fat: 20.5, carbohydrates: 69.0, saltEquivalent: 2.2, highlights: "牛肉の鉄分とビタミンB12、デミグラスの豊かなコクでスタミナ補給に最適。" },
        chefTips: "玉ねぎをしっかり炒めて甘みを引き出すのが、レストランのような深いコクを出す最大の秘訣です。",
      },
      {
        id: "rec_demi_2",
        title: `特製デミグラス仕立ての 濃厚煮込みハンバーグ / ソテー`,
        subtitle: `肉汁とデミグラスソースが一体に！ふっくらジューシーなごちそうおかず`,
        description: `表面を香ばしく焼いたお肉をデミグラスソースでじっくり煮込み、中まで旨味を閉じ込めた絶品おかずです。`,
        cookingTimeMinutes: 20,
        difficulty: "普通",
        cuisineType: "洋風",
        tags: ["煮込みハンバーグ", "ごちそう", "肉汁たっぷり", "大人気"],
        baseServings: 2,
        mainIngredients: [
          { name: beefOrMeat, baseAmount: 220, unit: "g" },
          { name: onionName, baseAmount: 1, unit: "個" },
          { name: shimejiName, baseAmount: 1, unit: "パック" },
        ],
        seasonings: buildSeasoningList([
          { name: "デミグラスソース", baseAmount: 150, unit: "g" },
          { name: "水", baseAmount: 100, unit: "ml" },
          { name: hasButter ? "バター" : "油", baseAmount: 1, unit: "大さじ" },
          { name: hasKetchup ? "ケチャップ" : "醤油", baseAmount: 1, unit: "大さじ" },
        ]),
        steps: [
          { stepNumber: 1, instruction: `お肉と野菜をフライパンで香ばしく焼き色がつくまで焼きます。`, timerMinutes: 5 },
          { stepNumber: 2, instruction: `デミグラスソース、水、調味料を加え、フタをして弱火でじっくり煮込みます。`, timerMinutes: 10 },
          { stepNumber: 3, instruction: `フタを取り、ソースにとろみがつくまで煮詰めてお皿に盛ります。` },
        ],
        nutritionPerServing: { calories: 450, protein: 24.0, fat: 22.0, carbohydrates: 26.0, saltEquivalent: 2.1, highlights: "高たんぱくで鉄分豊富。育ち盛りの子どもにも大人気です。" },
        chefTips: "ソースを煮詰める時は焦げ付かないよう弱火でゆっくりヘラで混ぜてください。",
      },
      {
        id: "rec_demi_3",
        title: `洋食屋さんの極上 デミグラスオムライス`,
        subtitle: `ふわとろ卵と濃厚デミグラスソースの贅沢なマリアージュ`,
        description: `バター香るライスにふわふわ半熟オムレツをのせ、温めた濃厚デミグラスソースをたっぷりかけた贅沢な一品です。`,
        cookingTimeMinutes: 15,
        difficulty: "普通",
        cuisineType: "洋風",
        tags: ["オムライス", "ふわとろ", "デミグラス", "カフェ風"],
        baseServings: 2,
        mainIngredients: [
          { name: "温かいご飯", baseAmount: 300, unit: "g" },
          { name: "卵", baseAmount: 3, unit: "個" },
          { name: beefOrMeat, baseAmount: 100, unit: "g" },
          { name: onionName, baseAmount: 0.5, unit: "個" },
        ],
        seasonings: buildSeasoningList([
          { name: "デミグラスソース", baseAmount: 150, unit: "g" },
          { name: hasButter ? "バター" : "油", baseAmount: 1.5, unit: "大さじ" },
          { name: hasSaltPepper ? "塩・こしょう" : "塩", baseAmount: 1, unit: "少々" },
        ]),
        steps: [
          { stepNumber: 1, instruction: `小鍋でデミグラスソースを温めておきます。` },
          { stepNumber: 2, instruction: `フライパンで具材とご飯をバターで香ばしく炒め、器に盛ります。`, timerMinutes: 4 },
          { stepNumber: 3, instruction: `溶き卵をフライパンで手早く半熟に焼き、ご飯の上にのせてデミグラスソースをかけます。` },
        ],
        nutritionPerServing: { calories: 540, protein: 21.0, fat: 19.5, carbohydrates: 70.0, saltEquivalent: 2.3, highlights: "卵のビタミンとデミグラスのエネルギーで元気が出る一皿。" },
        chefTips: "ソースに少しバターを溶かすと、ツヤと風味が一層引き立ちます。",
      },
      {
        id: "rec_demi_4",
        title: `デミグラスとチーズの濃厚 焼きカレードリア風グラタン`,
        subtitle: `あつあつチーズとデミグラスが香ばしい！トースターで簡単`,
        description: `ご飯の上にデミグラスソースとお肉、とろけるチーズをのせて香ばしく焼き上げたグラタン風ドリアです。`,
        cookingTimeMinutes: 15,
        difficulty: "簡単",
        cuisineType: "洋風",
        tags: ["トースター調理", "チーズ", "濃厚", "簡単"],
        baseServings: 2,
        mainIngredients: [
          { name: "温かいご飯", baseAmount: 300, unit: "g" },
          { name: beefOrMeat, baseAmount: 120, unit: "g" },
          { name: "ピザ用チーズ", baseAmount: 60, unit: "g" },
        ],
        seasonings: buildSeasoningList([
          { name: "デミグラスソース", baseAmount: 150, unit: "g" },
          { name: hasButter ? "バター" : "油", baseAmount: 1, unit: "大さじ" },
        ]),
        steps: [
          { stepNumber: 1, instruction: `お肉をフライパンで炒めてデミグラスソースと合わせます。`, timerMinutes: 3 },
          { stepNumber: 2, instruction: `耐熱皿にご飯を敷き、デミグラスミートをのせてチーズを散らします。` },
          { stepNumber: 3, instruction: `トースターでチーズが溶けて焼き色がつくまで焼きます。`, timerMinutes: 7 },
        ],
        nutritionPerServing: { calories: 510, protein: 22.0, fat: 19.0, carbohydrates: 62.0, saltEquivalent: 2.2, highlights: "チーズのカルシウムと良質たんぱく質で栄養補給。" },
        chefTips: "ご飯に軽くバターと塩コショウを混ぜておくと、さらに美味しくなります。",
      },
      {
        id: "rec_demi_5",
        title: `${beefOrMeat}と${onionName}のデミグラスコク旨ソテー`,
        subtitle: `10分で作れる極上おかず！お弁当のおかずにもぴったり`,
        description: `お肉と玉ねぎを強火で香ばしくソテーし、デミグラスソースを絡めたスピーディーなおかずです。`,
        cookingTimeMinutes: 10,
        difficulty: "簡単",
        cuisineType: "洋風",
        tags: ["時短10分", "フライパン1つ", "ご飯が進む", "お弁当"],
        baseServings: 2,
        mainIngredients: [
          { name: beefOrMeat, baseAmount: 200, unit: "g" },
          { name: onionName, baseAmount: 1, unit: "個" },
        ],
        seasonings: buildSeasoningList([
          { name: "デミグラスソース", baseAmount: 4, unit: "大さじ" },
          { name: hasSoySauce ? "醤油" : "塩", baseAmount: 1, unit: "小さじ" },
          { name: hasOil ? "サラダ油" : "油", baseAmount: 1, unit: "大さじ" },
        ]),
        steps: [
          { stepNumber: 1, instruction: `玉ねぎはくし形に切り、お肉を食べやすい大きさに切ります。` },
          { stepNumber: 2, instruction: `フライパンで玉ねぎとお肉を強火で炒めます。`, timerMinutes: 4 },
          { stepNumber: 3, instruction: `デミグラスソースと醤油を加えて手早く炒め絡めます。`, timerMinutes: 1 },
        ],
        nutritionPerServing: { calories: 360, protein: 21.0, fat: 18.0, carbohydrates: 20.0, saltEquivalent: 1.8, highlights: "短時間調理で肉のジューシーさをキープ。" },
        chefTips: "仕上げに強火でサッと照りを出すのがポイントです。",
      },
    ];
  } else if (hasTomatoSauceMatch) {
    // SPECIAL MATCH: TOMATO SAUCE / TOMATO CAN (トマトソース・トマト煮込み最優先)
    const chickenOrMeat = allInputs.find((i) => categorizeIngredient(i) === "meat") || "鶏もも肉（または豚肉）";
    const onionName = allInputs.find((i) => /玉ねぎ|たまねぎ/.test(i)) || "玉ねぎ";
    const tomatoItemName = allInputs.find((i) => /トマトソース|トマト缶|トマト/.test(i)) || "トマトソース（トマト缶）";

    recipes = [
      {
        id: "rec_tomato_1",
        title: `じっくり煮込んだ 鶏肉とごろごろ野菜の王道カチャトーラ（完熟トマト煮込み）`,
        subtitle: `完熟トマトの爽やかな酸味とお肉の旨味！オリーブ油とハーブ香るイタリアン`,
        description: `香ばしく焼き色をつけた${chickenOrMeat}と${onionName}をトマトソースでコトコト煮込み、素材の旨味を凝縮させた王道イタリアン煮込みです。`,
        cookingTimeMinutes: 20,
        difficulty: "普通",
        cuisineType: "洋風",
        tags: ["王道定番", "トマト煮込み", "カチャトーラ", "高たんぱく", "ヘルシー"],
        baseServings: 2,
        mainIngredients: [
          { name: chickenOrMeat, baseAmount: 250, unit: "g", note: "一口大にカット" },
          { name: onionName, baseAmount: 1, unit: "個", note: "薄切り" },
          { name: "ピーマンまたはしめじ", baseAmount: 2, unit: "個", note: "乱切り" },
        ],
        seasonings: buildSeasoningList([
          { name: tomatoItemName, baseAmount: 1, unit: "缶 (約400g)" },
          { name: hasConsomme ? "コンソメ" : "和風顆粒だし", baseAmount: 1, unit: "個 (顆粒小さじ1.5)" },
          { name: hasOil ? "オリーブ油（またはサラダ油）" : "油", baseAmount: 1, unit: "大さじ" },
          { name: hasGarlicGinger ? "おろしにんにく" : "塩・こしょう", baseAmount: 1, unit: "小さじ" },
          { name: hasSaltPepper ? "塩・こしょう" : "塩", baseAmount: 1, unit: "少々" },
        ]),
        steps: [
          { stepNumber: 1, instruction: `${chickenOrMeat}は一口大に切り、塩こしょうを軽くふります。野菜も食べやすくカットします。` },
          { stepNumber: 2, instruction: `鍋にオリーブ油とにんにくを熱し、${chickenOrMeat}の皮目をパリッと香ばしく焼き、野菜を加えて炒めます。`, timerMinutes: 5 },
          { stepNumber: 3, instruction: `${tomatoItemName}とコンソメを加え、フタをして弱火でコトコト煮込みます。`, timerMinutes: 12 },
          { stepNumber: 4, instruction: `フタを取り、ソースがとろりとするまで煮詰めて完成です。` },
        ],
        nutritionPerServing: { calories: 360, protein: 25.0, fat: 16.0, carbohydrates: 18.0, saltEquivalent: 2.0, highlights: "トマトのリコピンによる抗酸化作用と、鶏肉の良質たんぱく質で美肌と疲労回復に効果的。" },
        chefTips: "鶏肉の皮目をしっかり焼き付けてからトマトを加えることで、余分な油が落ちて香ばしさが倍増します。",
      },
      {
        id: "rec_tomato_2",
        title: `にんにく香る 濃厚トマトソースパスタ`,
        subtitle: `フライパン1つで絶品！トマトの甘みと旨味が麺に絡む本格派`,
        description: `にんにくとオリーブ油の香りを移したトマトソースにパスタを絡めた、シンプルながら奥深い味わいの定番パスタです。`,
        cookingTimeMinutes: 15,
        difficulty: "簡単",
        cuisineType: "洋風",
        tags: ["パスタ", "フライパン1つ", "にんにく香る", "イタリアン"],
        baseServings: 2,
        mainIngredients: [
          { name: "パスタ（スパゲッティ）", baseAmount: 180, unit: "g" },
          { name: chickenOrMeat, baseAmount: 120, unit: "g" },
          { name: onionName, baseAmount: 0.5, unit: "個" },
        ],
        seasonings: buildSeasoningList([
          { name: tomatoItemName, baseAmount: 200, unit: "g" },
          { name: hasConsomme ? "コンソメ" : "塩", baseAmount: 1, unit: "小さじ" },
          { name: hasOil ? "オリーブ油" : "サラダ油", baseAmount: 1.5, unit: "大さじ" },
        ]),
        steps: [
          { stepNumber: 1, instruction: `パスタをたっぷりのお湯で表示時間より1分短く茹でます。` },
          { stepNumber: 2, instruction: `フライパンで具材を炒め、${tomatoItemName}とコンソメを加えて煮立たせます。`, timerMinutes: 4 },
          { stepNumber: 3, instruction: `茹で上がったパスタと茹で汁大さじ2を加えて手早くソースと乳化させます。` },
        ],
        nutritionPerServing: { calories: 480, protein: 21.0, fat: 12.5, carbohydrates: 72.0, saltEquivalent: 2.2, highlights: "パスタの糖質とトマトのビタミンで効率的なエネルギーチャージ。" },
        chefTips: "茹で汁を少量加えてソースとしっかり混ぜ合わせる（乳化させる）ことで、パスタにソースが絡みます。",
      },
      {
        id: "rec_tomato_3",
        title: `旨味が溶け出す 具だくさん食べるミネストローネ`,
        subtitle: `角切り野菜とトマトの優しいスープ！身体が芯から喜ぶ栄養満点汁`,
        description: `お肉とお野菜を角切りにしてコトコト煮込んだ、食べるスープの代表格。温朝食や夕食のメインにも最適です。`,
        cookingTimeMinutes: 15,
        difficulty: "簡単",
        cuisineType: "洋風",
        tags: ["ミネストローネ", "野菜たっぷり", "温活", "ヘルシー"],
        baseServings: 2,
        mainIngredients: [
          { name: chickenOrMeat, baseAmount: 120, unit: "g" },
          { name: onionName, baseAmount: 1, unit: "個" },
          { name: "キャベツまたはじゃがいも", baseAmount: 100, unit: "g" },
        ],
        seasonings: buildSeasoningList([
          { name: tomatoItemName, baseAmount: 200, unit: "g" },
          { name: "水", baseAmount: 300, unit: "ml" },
          { name: hasConsomme ? "コンソメ" : "和風顆粒だし", baseAmount: 1, unit: "個" },
        ]),
        steps: [
          { stepNumber: 1, instruction: `具材をすべて1cm角のさいの目切りにします。` },
          { stepNumber: 2, instruction: `鍋でオリーブ油を熱して具材を炒め、トマト缶と水、コンソメを加えます。`, timerMinutes: 4 },
          { stepNumber: 3, instruction: `フタをして弱火で野菜が柔らかくなるまで煮込みます。`, timerMinutes: 8 },
        ],
        nutritionPerServing: { calories: 240, protein: 16.0, fat: 9.0, carbohydrates: 22.0, saltEquivalent: 1.8, highlights: "野菜の食物繊維とビタミンを余すことなく摂取できます。" },
        chefTips: "翌朝に温め直すと、さらに野菜の甘みが溶け出して美味しくなります。",
      },
      {
        id: "rec_tomato_4",
        title: `とろけるチーズとトマトの 包み蒸し焼き`,
        subtitle: `ホイルやフライパンで包んで蒸すだけ！肉汁とチーズがトマトと絡み合う`,
        description: `ジューシーなお肉にトマトソースととろけるチーズを重ねて蒸し焼きにした、簡単＆豪華なメインディッシュです。`,
        cookingTimeMinutes: 12,
        difficulty: "簡単",
        cuisineType: "洋風",
        tags: ["チーズ", "蒸し焼き", "フライパン1つ", "簡単"],
        baseServings: 2,
        mainIngredients: [
          { name: chickenOrMeat, baseAmount: 200, unit: "g" },
          { name: onionName, baseAmount: 0.5, unit: "個" },
          { name: "ピザ用チーズ", baseAmount: 50, unit: "g" },
        ],
        seasonings: buildSeasoningList([
          { name: tomatoItemName, baseAmount: 4, unit: "大さじ" },
          { name: hasSaltPepper ? "塩・こしょう" : "塩", baseAmount: 1, unit: "少々" },
        ]),
        steps: [
          { stepNumber: 1, instruction: `フライパンにお肉と玉ねぎを並べ、塩こしょうをふります。` },
          { stepNumber: 2, instruction: `上にトマトソースとチーズをのせ、フタをして中弱火で蒸し焼きにします。`, timerMinutes: 8 },
          { stepNumber: 3, instruction: `チーズがとろけてお肉に火が通ったら完成です。` },
        ],
        nutritionPerServing: { calories: 340, protein: 24.0, fat: 18.0, carbohydrates: 12.0, saltEquivalent: 1.7, highlights: "低糖質＆高たんぱくでダイエット中にもおすすめ。" },
        chefTips: "フタを開けずに蒸気を閉じ込めることで、お肉がしっとり柔らかく仕上がります。",
      },
      {
        id: "rec_tomato_5",
        title: `ジューシーお肉と野菜の トマトチーズ焼き`,
        subtitle: `耐熱皿に並べてトースターでこんがり！香ばしい焼き目が食欲をそそる`,
        description: `ソテーした具材にトマトソースとチーズをかけてトースターで香ばしく焼き上げたグラタン風の主菜です。`,
        cookingTimeMinutes: 15,
        difficulty: "簡単",
        cuisineType: "洋風",
        tags: ["トースター調理", "チーズ焼き", "香ばしい", "お弁当にも"],
        baseServings: 2,
        mainIngredients: [
          { name: chickenOrMeat, baseAmount: 180, unit: "g" },
          { name: onionName, baseAmount: 0.5, unit: "個" },
          { name: "ピザ用チーズ", baseAmount: 50, unit: "g" },
        ],
        seasonings: buildSeasoningList([
          { name: tomatoItemName, baseAmount: 4, unit: "大さじ" },
          { name: hasOil ? "オリーブ油" : "油", baseAmount: 1, unit: "大さじ" },
        ]),
        steps: [
          { stepNumber: 1, instruction: `具材をフライパンでサッと炒めて耐熱皿に移します。`, timerMinutes: 3 },
          { stepNumber: 2, instruction: `トマトソースをかけ、チーズをたっぷり散らします。` },
          { stepNumber: 3, instruction: `トースターでチーズに焼き色がつくまで焼きます。`, timerMinutes: 7 },
        ],
        nutritionPerServing: { calories: 350, protein: 23.0, fat: 19.0, carbohydrates: 14.0, saltEquivalent: 1.8, highlights: "カルシウムと良質たんぱく質が同時にチャージできます。" },
        chefTips: "具材をあらかじめ炒めておくことで、トースターの焼き時間だけでジューシーに完成します。",
      },
    ];
  } else if (hasConsommeMatch) {
    // SPECIAL MATCH: CONSOMME / BOUILLON (コンソメ・ブイヨン・ポトフ最優先)
    const meatOrSausage = allInputs.find((i) => categorizeIngredient(i) === "meat") || "あらびきウインナー（または鶏肉・豚肉）";
    const cabbageOrVeg = allInputs.find((i) => /キャベツ|白菜|玉ねぎ/.test(i)) || "キャベツ（玉ねぎ）";
    const carrotOrPotato = allInputs.find((i) => /人参|じゃがいも|大根/.test(i)) || "人参（じゃがいも）";
    const consommeItem = allInputs.find((i) => /コンソメ|ブイヨン/.test(i)) || "コンソメ（ブイヨン）";

    recipes = [
      {
        id: "rec_consomme_1",
        title: `素材の旨味が溶け出す！${meatOrSausage}とゴロゴロ野菜の王道ポトフ`,
        subtitle: `コトコト煮込むだけで絶品スープ！お肉と野菜の甘みが凝縮されたフランスの伝統家庭料理`,
        description: `大きく切ったお野菜とジューシーな${meatOrSausage}をコンソメスープでじっくり煮込み、素材本来の旨味と甘みを存分に引き出した王道ポトフです。`,
        cookingTimeMinutes: 20,
        difficulty: "簡単",
        cuisineType: "洋風",
        tags: ["王道定番", "ポトフ", "身体ポカポカ", "野菜たっぷり", "煮込み"],
        baseServings: 2,
        mainIngredients: [
          { name: meatOrSausage, baseAmount: 160, unit: "g", note: "ウインナーは切り込み、お肉は大きめ一口大" },
          { name: cabbageOrVeg, baseAmount: 200, unit: "g", note: "大きめのくし形切り（芯を残すと崩れない）" },
          { name: carrotOrPotato, baseAmount: 180, unit: "g", note: "大きめの乱切り" },
        ],
        seasonings: buildSeasoningList([
          { name: consommeItem, baseAmount: 2, unit: "個 (顆粒小さじ2)" },
          { name: "水", baseAmount: 600, unit: "ml" },
          { name: hasSaltPepper ? "塩・こしょう" : "塩", baseAmount: 1, unit: "少々" },
          { name: hasOil ? "オリーブ油（またはサラダ油）" : "油", baseAmount: 1, unit: "小さじ" },
        ]),
        steps: [
          { stepNumber: 1, instruction: `野菜は大きめのくし形や乱切りにし、${meatOrSausage}には斜めに浅く切り込みを入れます。` },
          { stepNumber: 2, instruction: `鍋に水と${consommeItem}、野菜を入れて中火にかけ、沸騰したら弱火にしてアクを取ります。`, timerMinutes: 5 },
          { stepNumber: 3, instruction: `${meatOrSausage}を加え、フタをして弱火で具材が柔らかくなるまで煮込みます。`, timerMinutes: 12 },
          { stepNumber: 4, instruction: `塩・こしょうで味を調え、器にスープごと盛り付けます。お好みで粒マスタードを添えてどうぞ。` },
        ],
        nutritionPerServing: { calories: 320, protein: 16.5, fat: 16.0, carbohydrates: 26.0, saltEquivalent: 2.1, highlights: "野菜のビタミンやミネラルが溶け出したスープごと飲めるため、栄養吸収率が抜群です。" },
        chefTips: "野菜を大きめに切って煮崩れを防ぎ、弱火でじっくり煮ることでスープが濁らず澄んだプロの仕上がりになります。",
      },
      {
        id: "rec_consomme_2",
        title: `ほっこり温まる 具だくさん野菜とふんわり卵のコンソメスープ`,
        subtitle: `10分でサッと完成！朝食や夕食の汁物にぴったりな優しい味わい`,
        description: `細切り野菜とお肉の旨味に、溶き卵をふんわり流し込んだ栄養満点のコンソメスープです。`,
        cookingTimeMinutes: 10,
        difficulty: "簡単",
        cuisineType: "洋風",
        tags: ["時短10分", "スープ", "卵とじ", "朝食にも"],
        baseServings: 2,
        mainIngredients: [
          { name: meatOrSausage, baseAmount: 100, unit: "g" },
          { name: cabbageOrVeg, baseAmount: 120, unit: "g" },
          { name: "卵", baseAmount: 2, unit: "個", note: "溶き卵" },
        ],
        seasonings: buildSeasoningList([
          { name: consommeItem, baseAmount: 1.5, unit: "個" },
          { name: "水", baseAmount: 500, unit: "ml" },
          { name: hasSaltPepper ? "黒こしょう" : "塩", baseAmount: 1, unit: "少々" },
        ]),
        steps: [
          { stepNumber: 1, instruction: `具材を薄切りや短冊切りにします。` },
          { stepNumber: 2, instruction: `鍋に水とコンソメ、具材を入れて煮立たせ、中火で3分煮ます。`, timerMinutes: 3 },
          { stepNumber: 3, instruction: `しっかり沸騰しているところに溶き卵を回し入れ、火を止めてフタをします。`, timerMinutes: 1 },
        ],
        nutritionPerServing: { calories: 190, protein: 13.0, fat: 11.0, carbohydrates: 9.0, saltEquivalent: 1.8, highlights: "低カロリーながらたんぱく質がしっかり摂れる温活スープ。" },
        chefTips: "卵を入れる直前にスープをしっかり沸騰させると、卵がふわっと花のように広がります。",
      },
      {
        id: "rec_consomme_3",
        title: `香ばしガーリックコンソメ仕立ての ${meatOrSausage}ソテー`,
        subtitle: `コンソメの旨味がガツンと効く！ご飯もお酒も止まらない絶品おかず`,
        description: `コンソメを調味料として直接まぶして炒め、素材の旨味をガツンと引き出したスパイシーソテーです。`,
        cookingTimeMinutes: 10,
        difficulty: "簡単",
        cuisineType: "洋風",
        tags: ["時短10分", "フライパン1つ", "おつまみ", "香ばしい"],
        baseServings: 2,
        mainIngredients: [
          { name: meatOrSausage, baseAmount: 180, unit: "g" },
          { name: cabbageOrVeg, baseAmount: 150, unit: "g" },
        ],
        seasonings: buildSeasoningList([
          { name: consommeItem, baseAmount: 1, unit: "小さじ (顆粒または細かく砕く)" },
          { name: hasButter ? "バター" : "サラダ油", baseAmount: 1, unit: "大さじ" },
          { name: hasGarlicGinger ? "にんにく" : "黒こしょう", baseAmount: 0.5, unit: "小さじ" },
        ]),
        steps: [
          { stepNumber: 1, instruction: `具材を食べやすい大きさに切ります。` },
          { stepNumber: 2, instruction: `フライパンにバターとにんにくを熱し、具材を強火で炒めます。`, timerMinutes: 4 },
          { stepNumber: 3, instruction: `砕いたコンソメと黒こしょうをふり入れ、全体に手早く炒め絡めます。`, timerMinutes: 1 },
        ],
        nutritionPerServing: { calories: 290, protein: 16.0, fat: 20.0, carbohydrates: 10.0, saltEquivalent: 1.7, highlights: "コンソメの旨味が野菜の甘みを引き立て、美味しく野菜が摂れます。" },
        chefTips: "コンソメ顆粒を直接炒め物に使うと、味がボヤけずパンチのある仕上がりになります。",
      },
      {
        id: "rec_consomme_4",
        title: `コンソメバター香る 旨味たっぷり洋風ピラフ炒め`,
        subtitle: `フライパンで10分！冷ご飯がごちそう洋食ピラフに大変身`,
        description: `ご飯と具材をバターとコンソメで香ばしく炒めた、子どもにも大人気のピラフ風炒めご飯です。`,
        cookingTimeMinutes: 12,
        difficulty: "簡単",
        cuisineType: "洋風",
        tags: ["ピラフ", "フライパン1つ", "大人気", "10分飯"],
        baseServings: 2,
        mainIngredients: [
          { name: "温かいご飯", baseAmount: 320, unit: "g" },
          { name: meatOrSausage, baseAmount: 120, unit: "g" },
          { name: carrotOrPotato, baseAmount: 60, unit: "g", note: "みじん切り" },
        ],
        seasonings: buildSeasoningList([
          { name: consommeItem, baseAmount: 1.5, unit: "小さじ" },
          { name: hasButter ? "バター" : "油", baseAmount: 1.5, unit: "大さじ" },
          { name: hasSaltPepper ? "塩・こしょう" : "塩", baseAmount: 1, unit: "少々" },
        ]),
        steps: [
          { stepNumber: 1, instruction: `具材を小さめのみじん切りまたは角切りにします。` },
          { stepNumber: 2, instruction: `フライパンでバターを溶かし、具材を炒めて火を通します。`, timerMinutes: 3 },
          { stepNumber: 3, instruction: `ご飯とコンソメを加え、パラパラになるよう手早く炒め合わせます。`, timerMinutes: 3 },
        ],
        nutritionPerServing: { calories: 460, protein: 14.0, fat: 15.0, carbohydrates: 66.0, saltEquivalent: 1.9, highlights: "炭水化物と脂質・たんぱく質のバランスが良くエネルギー補給に最適。" },
        chefTips: "ご飯を入れたらヘラで切るように炒めると、お米が潰れずパラッと仕上がります。",
      },
      {
        id: "rec_consomme_5",
        title: `コンソメ出汁が染みる ${meatOrSausage}と野菜の洋風蒸し煮`,
        subtitle: `フライパンに重ねて蒸すだけ！油控えめで素材の旨味をそのまま味わう`,
        description: `フライパンに具材を重ねてコンソメスープで蒸し焼きにした、ヘルシーで素材の甘みが際立つ一品です。`,
        cookingTimeMinutes: 12,
        difficulty: "簡単",
        cuisineType: "洋風",
        tags: ["蒸し煮", "ヘルシー", "油控えめ", "時短"],
        baseServings: 2,
        mainIngredients: [
          { name: meatOrSausage, baseAmount: 160, unit: "g" },
          { name: cabbageOrVeg, baseAmount: 180, unit: "g" },
        ],
        seasonings: buildSeasoningList([
          { name: consommeItem, baseAmount: 1, unit: "個" },
          { name: "水", baseAmount: 100, unit: "ml" },
          { name: hasSaltPepper ? "黒こしょう" : "塩", baseAmount: 1, unit: "少々" },
        ]),
        steps: [
          { stepNumber: 1, instruction: `フライパンに野菜を敷き、その上に${meatOrSausage}を並べます。` },
          { stepNumber: 2, instruction: `水100mlと砕いたコンソメを全体に回しかけ、フタをして中火で蒸し煮にします。`, timerMinutes: 7 },
          { stepNumber: 3, instruction: `器に盛り、黒こしょうをふっていただきます。` },
        ],
        nutritionPerServing: { calories: 230, protein: 14.0, fat: 14.0, carbohydrates: 12.0, saltEquivalent: 1.6, highlights: "蒸すことで余分な脂を落とし、野菜のビタミンをキープ。" },
        chefTips: "蒸し汁にも旨味がたっぷり出ているので、器に汁ごと盛り付けてください。",
      },
    ];
  } else if (hasYam && (hasPork || hasBeef || hasChicken || mainMeatOrProtein) && hasCabbage) {
    const yamName = allInputs.find((i) => /山芋|長芋|とろろ|大和芋/.test(i)) || "山芋";
    const cabbageName = allInputs.find((i) => /キャベツ|白菜/.test(i)) || "キャベツ";
    const meatName = mainMeatOrProtein;

    // Recipe 1: ふわとろお好み焼き
    const rec1Mains = [
      { name: meatName, baseAmount: 180, unit: "g", note: "一口大または短冊切り" },
      { name: cabbageName, baseAmount: 200, unit: "g (約1/4玉)", note: "粗みじん切りまたは千切り" },
      { name: yamName, baseAmount: 150, unit: "g", note: "皮をむいてすりおろす" },
      { name: "卵（あれば）", baseAmount: 2, unit: "個" },
    ];
    const rec1Seasonings = buildSeasoningList([
      { name: hasFlour ? "小麦粉（薄力粉）" : "片栗粉", baseAmount: 3, unit: "大さじ" },
      { name: hasSauce ? "お好み焼きソース" : (hasSoySauce ? "醤油・みりん" : "特製ソース"), baseAmount: 2, unit: "大さじ" },
      { name: hasMayo ? "マヨネーズ" : "お好みのタレ", baseAmount: 1.5, unit: "大さじ" },
      { name: hasOil ? (rawStaples.find((s) => /油/.test(s)) || "サラダ油") : "サラダ油", baseAmount: 1, unit: "大さじ" },
      { name: hasDashi ? "和風顆粒だし" : "塩・こしょう", baseAmount: 0.5, unit: "小さじ" },
    ]);
    const rec1Nutrition = estimateNutrition("お好み焼き", rec1Mains, rec1Seasonings);

    // Recipe 2: とん平焼き
    const rec2Mains = [
      { name: meatName, baseAmount: 160, unit: "g", note: "一口大にカット" },
      { name: cabbageName, baseAmount: 180, unit: "g", note: "太めの千切り" },
      { name: yamName, baseAmount: 120, unit: "g", note: "千切りまたはすりおろし" },
      { name: "卵", baseAmount: 2, unit: "個", note: "溶き卵にしてふんわり焼く" },
    ];
    const rec2Seasonings = buildSeasoningList([
      { name: hasSauce ? "お好み焼きソース" : "特製ソース", baseAmount: 2, unit: "大さじ" },
      { name: hasMayo ? "マヨネーズ" : "マヨネーズ", baseAmount: 1.5, unit: "大さじ" },
      { name: hasOil ? "サラダ油" : "油", baseAmount: 1, unit: "大さじ" },
      { name: hasSaltPepper ? "塩・こしょう" : "塩", baseAmount: 1, unit: "少々" },
    ]);
    const rec2Nutrition = estimateNutrition("とん平焼き", rec2Mains, rec2Seasonings);

    // Recipe 3: ふんわり山芋鉄板焼き
    const rec3Mains = [
      { name: yamName, baseAmount: 200, unit: "g", note: "すりおろしてふんわり生地に" },
      { name: meatName, baseAmount: 150, unit: "g", note: "カリッと香ばしく炒める" },
      { name: cabbageName, baseAmount: 150, unit: "g", note: "細切り" },
    ];
    const rec3Seasonings = buildSeasoningList([
      { name: hasSauce ? "お好み焼きソース" : (hasSoySauce ? "醤油" : "ソース"), baseAmount: 1.5, unit: "大さじ" },
      { name: hasMayo ? "マヨネーズ" : "マヨネーズ", baseAmount: 1, unit: "大さじ" },
      { name: hasOil ? "サラダ油" : "油", baseAmount: 1, unit: "大さじ" },
      { name: hasDashi ? "和風顆粒だし" : "塩", baseAmount: 0.5, unit: "小さじ" },
    ]);
    const rec3Nutrition = estimateNutrition("鉄板焼き", rec3Mains, rec3Seasonings);

    // Recipe 4: 香ばしマヨネーズソテー
    const rec4Mains = [
      { name: meatName, baseAmount: 200, unit: "g", note: "一口大" },
      { name: yamName, baseAmount: 150, unit: "g", note: "1cm厚さの半月切り（皮付きでも美味）" },
      { name: cabbageName, baseAmount: 150, unit: "g", note: "ざく切り" },
    ];
    const rec4Seasonings = buildSeasoningList([
      { name: hasMayo ? "マヨネーズ（炒め用＆味付け）" : "サラダ油", baseAmount: 2, unit: "大さじ" },
      { name: hasSoySauce ? "醤油" : (hasSauce ? "お好み焼きソース" : "塩・こしょう"), baseAmount: 1, unit: "大さじ" },
      { name: hasSaltPepper ? "黒こしょう" : "塩", baseAmount: 1, unit: "少々" },
    ]);
    const rec4Nutrition = estimateNutrition("ソテー", rec4Mains, rec4Seasonings);

    // Recipe 5: 山芋巻き キャベツ蒸し添え
    const rec5Mains = [
      { name: meatName, baseAmount: 180, unit: "g (薄切り肉8枚)", note: "山芋を巻く" },
      { name: yamName, baseAmount: 160, unit: "g", note: "拍子木切り（棒状）" },
      { name: cabbageName, baseAmount: 150, unit: "g", note: "敷き詰めて一緒に蒸し焼き" },
    ];
    const rec5Seasonings = buildSeasoningList([
      { name: hasSauce ? "お好み焼きソース" : (hasSoySauce ? "醤油・みりん" : "特製ソース"), baseAmount: 2, unit: "大さじ" },
      { name: hasMayo ? "マヨネーズ" : "マヨネーズ", baseAmount: 1, unit: "大さじ" },
      { name: hasOil ? "サラダ油" : "油", baseAmount: 1, unit: "小さじ" },
    ]);
    const rec5Nutrition = estimateNutrition("山芋巻き", rec5Mains, rec5Seasonings);

    recipes = [
      {
        id: "rec_yam_1",
        title: `${meatName}と${cabbageName}・${yamName}の極上ふわとろお好み焼き`,
        subtitle: `すりおろし${yamName}で驚きのふわふわ食感！家にあるソースとマヨで絶品`,
        description: `すりおろした${yamName}をたっぷり生地に加えることで、まるでお店のような極上のふわとろ食感に仕上がります。香ばしく焼いた${meatName}と甘い${cabbageName}の相性が抜群です。`,
        cookingTimeMinutes: 15,
        difficulty: "簡単",
        cuisineType: "和風",
        tags: ["フライパン1つ", "ふわとろ食感", "人気定番", "ごちそう"],
        baseServings: 2,
        mainIngredients: rec1Mains,
        seasonings: rec1Seasonings,
        steps: [
          { stepNumber: 1, instruction: `${cabbageName}は粗みじん切り、${yamName}は皮をむいてすりおろします。${meatName}は一口大に切ります。` },
          { stepNumber: 2, instruction: `ボウルにすりおろした${yamName}、卵、小麦粉、だしの素を混ぜ合わせ、${cabbageName}を加えてサックリと空気を含ませるように混ぜます。` },
          { stepNumber: 3, instruction: `フライパンに油を中火で熱し、生地を丸く流し入れ、上に${meatName}を並べてフタをし、中弱火で蒸し焼きにします。`, timerMinutes: 4 },
          { stepNumber: 4, instruction: `裏返してフタをし、さらに${meatName}がカリッとするまで香ばしく焼き上げます。`, timerMinutes: 4 },
          { stepNumber: 5, instruction: `お皿に盛り、ソースとマヨネーズをたっぷりかけて完成です！` },
        ],
        nutritionPerServing: { ...rec1Nutrition, highlights: `${yamName}のムチンとビタミンB群が疲労回復を促進し、胃腸の調子を整えます。` },
        chefTips: "生地を混ぜすぎないことと、フタをして蒸し焼きにするのがふわふわに膨らむ最大の秘訣です。",
      },
      {
        id: "rec_yam_2",
        title: `${yamName}と${meatName}・${cabbageName}のカリッと香ばし とん平焼き`,
        subtitle: `10分で作れる居酒屋人気メニュー！甘辛ソースとマヨネーズがたまらない`,
        description: `シャキシャキの${cabbageName}とホクホク${yamName}、ジューシーな${meatName}を香ばしく炒め、薄焼き卵でふんわり包んだスピードおかずです。`,
        cookingTimeMinutes: 12,
        difficulty: "簡単",
        cuisineType: "和風",
        tags: ["時短10分", "フライパン1つ", "おつまみにも", "高たんぱく"],
        baseServings: 2,
        mainIngredients: rec2Mains,
        seasonings: rec2Seasonings,
        steps: [
          { stepNumber: 1, instruction: `${cabbageName}と${yamName}は千切りにし、${meatName}は一口大に切ります。` },
          { stepNumber: 2, instruction: `フライパンに油を熱し、${meatName}を炒めて色が変わったら${yamName}と${cabbageName}を加え、強火でサッと炒めて一度お皿に取り出します。`, timerMinutes: 3 },
          { stepNumber: 3, instruction: `同じフライパンに溶き卵を流し入れ、半熟状になったら炒めた具材を中央に乗せて包み込みます。`, timerMinutes: 2 },
          { stepNumber: 4, instruction: `お皿に盛り付け、ソースとマヨネーズをかけて熱々をいただきます。` },
        ],
        nutritionPerServing: { ...rec2Nutrition, highlights: "卵とお肉の良質たんぱく質に、山芋の消化酵素アミラーゼが加わり消化に優しい一品。" },
        chefTips: "卵は半熟のうちに火を止めて具材を包むと、しっとりジューシーに仕上がります。",
      },
      {
        id: "rec_yam_3",
        title: `${meatName}と${cabbageName}のふんわり${yamName}鉄板焼き ソースマヨ仕立て`,
        subtitle: `すりおろし${yamName}をグラタン風に香ばしく焼き上げる絶品おかず`,
        description: `すりおろした${yamName}の生地に炒めた${meatName}と${cabbageName}を合わせ、フライパンで両面こんがり焼き上げます。スプーンですくって食べる新食感の美味しさです。`,
        cookingTimeMinutes: 12,
        difficulty: "簡単",
        cuisineType: "和風",
        tags: ["スプーンで食べる", "熱々フワフワ", "子供にも人気", "野菜たっぷり"],
        baseServings: 2,
        mainIngredients: rec3Mains,
        seasonings: rec3Seasonings,
        steps: [
          { stepNumber: 1, instruction: `${yamName}はすりおろし、${cabbageName}は千切り、${meatName}は小さめの一口大に切ります。` },
          { stepNumber: 2, instruction: `フライパンで${meatName}と${cabbageName}を中火で2分炒めて軽く塩を振ります。` },
          { stepNumber: 3, instruction: `すりおろし${yamName}を上から一気に流し入れ、弱中火でフタをして蒸し焼きにします。`, timerMinutes: 4 },
          { stepNumber: 4, instruction: `底が香ばしく固まったら火を止め、ソースとマヨネーズをかけてスプーンでいただきます。` },
        ],
        nutritionPerServing: { ...rec3Nutrition, highlights: `${yamName}に含まれる食物繊維とカリウムが塩分の排出を助け、むくみを予防します。` },
        chefTips: "フライパンのまま食タクに出すと、最後までアツアツのふわふわ食感が楽しめます。",
      },
      {
        id: "rec_yam_4",
        title: `ジューシー${meatName}と角切り${yamName}・${cabbageName}の香ばしマヨソテー`,
        subtitle: `シャキホク食感がクセになる！マヨネーズのコクが絡むご飯が進むおかず`,
        description: `${yamName}を角切り・短冊にして炒めることで、すりおろしとは異なるホクホク＆シャキシャキの歯ごたえを堪能できます。マヨネーズのコクと香ばしさが絶妙です。`,
        cookingTimeMinutes: 10,
        difficulty: "簡単",
        cuisineType: "和風",
        tags: ["シャキシャキ食感", "時短10分", "ご飯が進む", "簡単炒め"],
        baseServings: 2,
        mainIngredients: rec4Mains,
        seasonings: rec4Seasonings,
        steps: [
          { stepNumber: 1, instruction: `${yamName}は皮をむいて1cm角または短冊切り、${cabbageName}はざく切り、${meatName}は一口大に切ります。` },
          { stepNumber: 2, instruction: `フライパンにマヨネーズ大さじ1を熱し、${meatName}と${yamName}を入れて中火でこんがり焼き色がつくまで炒めます。`, timerMinutes: 4 },
          { stepNumber: 3, instruction: `${cabbageName}を加え、強火でサッと炒め合わせ、残りのマヨネーズとお好みの味付けで仕上げます。`, timerMinutes: 2 },
        ],
        nutritionPerServing: { ...rec4Nutrition, highlights: "油の代わりにマヨネーズで炒めることで旨味とコクが具材にしっかりコーティングされます。" },
        chefTips: "山芋は強火で焼き目をつけると、表面はカリッと中はホクホクに仕上がります。",
      },
      {
        id: "rec_yam_5",
        title: `${meatName}のシャキシャキ${yamName}巻き ${cabbageName}蒸し添え`,
        subtitle: `お肉の旨味を吸った山芋がジューシー！見た目も華やかなごちそう巻き`,
        description: `棒状に切った${yamName}に${meatName}をくるりと巻き、フライパンに敷き詰めた${cabbageName}と一緒に蒸し焼きにします。一口食べると肉汁と山芋の甘みが溢れます。`,
        cookingTimeMinutes: 14,
        difficulty: "普通",
        cuisineType: "和風",
        tags: ["お弁当にも", "ごちそう感", "蒸し焼きヘルシー", "彩り"],
        baseServings: 2,
        mainIngredients: rec5Mains,
        seasonings: rec5Seasonings,
        steps: [
          { stepNumber: 1, instruction: `${yamName}は7〜8cmの棒状（拍子木切り）に切り、${meatName}でしっかりと巻きつけます。` },
          { stepNumber: 2, instruction: `フライパンの底にざく切りの${cabbageName}を敷き詰め、その上に巻き終わりを下にして肉巻きを並べます。` },
          { stepNumber: 3, instruction: `フタをして中火にかけ、蒸気が出てきたら弱中火で蒸し焼きにします。`, timerMinutes: 6 },
          { stepNumber: 4, instruction: `フタを取り、ソースとマヨネーズ（または醤油ダレ）を回しかけて香ばしく絡めます。` },
        ],
        nutritionPerServing: { ...rec5Nutrition, highlights: "お肉の脂がキャベツと山芋にしみ込み、調味料控えめでも大満足の味わいになります。" },
        chefTips: "肉の巻き終わりを下にして焼き始めることで、爪楊枝を使わなくても綺麗にまとまります。",
      },
    ];
  } else if (/そば|蕎麦|うどん|焼きそば|焼そば|ラーメン|中華麺/.test(searchStr)) {
    // SPECIAL MATCH 2: Noodles / 茹で麺 (焼きそば、うどん、そば、ラーメン)
    const noodleName = allInputs.find((i) => /そば|蕎麦|うどん|焼きそば|焼そば|ラーメン|中華麺/.test(i)) || "茹で麺";
    const meatOrProtein = allInputs.find((i) => i !== noodleName && (categorizeIngredient(i) === "meat" || categorizeIngredient(i) === "fish" || /あげ|豆腐/.test(i))) || "豚肉・具材";
    const vegName = allInputs.find((i) => i !== noodleName && i !== meatOrProtein) || "キャベツ・野菜";

    const isYakisoba = /焼きそば|焼そば/.test(noodleName);
    const isUdon = /うどん/.test(noodleName);
    const isSoba = /そば|蕎麦/.test(noodleName);

    const noodleTypeLabel = isYakisoba ? "焼きそば" : (isUdon ? "うどん" : (isSoba ? "そば" : "麺"));

    // Recipe 1: 王道の香ばし炒め麺
    const n1Mains = [
      { name: noodleName, baseAmount: 2, unit: "玉 (袋)", note: "軽くほぐしておく" },
      { name: meatOrProtein, baseAmount: 150, unit: "g", note: "一口大" },
      { name: vegName, baseAmount: 180, unit: "g", note: "ざく切り" },
    ];
    const n1Seasonings = buildSeasoningList([
      { name: isYakisoba ? (hasSauce ? "焼きそばソース" : "中濃ソース") : (hasSoySauce ? "醤油・めんつゆ" : "特製タレ"), baseAmount: 2.5, unit: "大さじ" },
      { name: hasOil ? "サラダ油" : "油", baseAmount: 1, unit: "大さじ" },
      { name: hasSaltPepper ? "塩・こしょう" : "塩", baseAmount: 1, unit: "少々" },
      { name: hasMayo ? "マヨネーズ（トッピング）" : "青のり", baseAmount: 1, unit: "大さじ" },
    ]);

    // Recipe 2: 具だくさん出汁つゆ麺
    const n2Mains = [
      { name: noodleName, baseAmount: 2, unit: "玉 (袋)" },
      { name: meatOrProtein, baseAmount: 140, unit: "g", note: "食べやすくカット" },
      { name: vegName, baseAmount: 140, unit: "g" },
    ];
    const n2Seasonings = buildSeasoningList([
      { name: hasMentsuyu ? "めんつゆ" : (hasSoySauce ? "醤油・みりん" : "和風だし"), baseAmount: 3, unit: "大さじ" },
      { name: hasDashi ? "和風顆粒だし" : "だし", baseAmount: 1, unit: "小さじ" },
      { name: "水", baseAmount: 500, unit: "ml" },
      { name: hasGarlicGinger ? "生姜（おろし）" : "七味唐辛子", baseAmount: 0.5, unit: "小さじ" },
    ]);

    // Recipe 3: 濃厚あんかけ麺 / スタミナ麺
    const n3Mains = [
      { name: noodleName, baseAmount: 2, unit: "玉 (袋)" },
      { name: meatOrProtein, baseAmount: 150, unit: "g" },
      { name: vegName, baseAmount: 150, unit: "g" },
    ];
    const n3Seasonings = buildSeasoningList([
      { name: hasSoySauce ? "醤油" : "めんつゆ", baseAmount: 2, unit: "大さじ" },
      { name: hasSake ? "酒・みりん" : "水", baseAmount: 1.5, unit: "大さじ" },
      { name: hasFlour ? "片栗粉（とろみ用）" : "水溶き小麦粉", baseAmount: 1, unit: "大さじ" },
      { name: hasOil ? "ごま油" : "サラダ油", baseAmount: 1, unit: "小さじ" },
    ]);

    // Recipe 4: ふんわり卵とじ麺
    const n4Mains = [
      { name: noodleName, baseAmount: 2, unit: "玉 (袋)" },
      { name: meatOrProtein, baseAmount: 120, unit: "g" },
      { name: vegName, baseAmount: 120, unit: "g" },
      { name: "卵", baseAmount: 2, unit: "個", note: "溶き卵" },
    ];
    const n4Seasonings = buildSeasoningList([
      { name: hasMentsuyu ? "めんつゆ（または白だし）" : "醤油・みりん", baseAmount: 2.5, unit: "大さじ" },
      { name: hasDashi ? "和風顆粒だし" : "水", baseAmount: 1, unit: "小さじ" },
      { name: "水", baseAmount: 400, unit: "ml" },
    ]);

    // Recipe 5: スタミナそばめし風・パリパリ麺焼き
    const n5Mains = [
      { name: noodleName, baseAmount: 2, unit: "玉 (袋)", note: "細かく切るか平らに広げて焼く" },
      { name: meatOrProtein, baseAmount: 150, unit: "g" },
      { name: vegName, baseAmount: 150, unit: "g" },
    ];
    const n5Seasonings = buildSeasoningList([
      { name: hasSauce ? "ソース" : (hasSoySauce ? "醤油" : "塩・こしょう"), baseAmount: 2, unit: "大さじ" },
      { name: hasMayo ? "マヨネーズ" : "油", baseAmount: 1, unit: "大さじ" },
      { name: hasOil ? "サラダ油" : "油", baseAmount: 1, unit: "大さじ" },
    ]);

    recipes = [
      {
        id: "rec_noodle_1",
        title: `${meatOrProtein}と${vegName}の香ばし特製${noodleTypeLabel}`,
        subtitle: `フライパン1つで10分完成！具材の旨味が麺にしっかり絡む人気定番`,
        description: `スーパーの茹で麺${noodleName}を活用し、${meatOrProtein}のコクと${vegName}の甘みを引き出した絶品炒め麺です。`,
        cookingTimeMinutes: 10,
        difficulty: "簡単",
        cuisineType: "和風",
        tags: ["時短10分", "フライパン1つ", "茹で麺活用", "人気定番"],
        baseServings: 2,
        mainIngredients: n1Mains,
        seasonings: n1Seasonings,
        steps: [
          { stepNumber: 1, instruction: `${meatOrProtein}と${vegName}を食べやすい大きさに切ります。${noodleName}は電子レンジで30秒温めるか、軽くほぐします。` },
          { stepNumber: 2, instruction: `フライパンに油を熱し、${meatOrProtein}を炒めて色が変わったら${vegName}を加えて強火でサッと炒めます。`, timerMinutes: 3 },
          { stepNumber: 3, instruction: `ほぐした${noodleName}を加え、水を大さじ2程度回し入れてフタをし、中火で蒸し焼きにします。`, timerMinutes: 2 },
          { stepNumber: 4, instruction: `フタを取り、調味料を一気に加えて強火で手早く炒め絡め、器に盛ります。` },
        ],
        nutritionPerServing: { ...estimateNutrition(noodleTypeLabel, n1Mains, n1Seasonings), highlights: "糖質とたんぱく質を同時にチャージでき、短時間でエネルギー補給が可能です。" },
        chefTips: "麺を炒める前にレンジで少し温めておくと、千切れずモチモチに仕上がります。",
      },
      {
        id: "rec_noodle_2",
        title: `具だくさん${meatOrProtein}と${vegName}のあったか出汁つゆ${noodleTypeLabel}`,
        subtitle: "お出汁が染み渡る！コトコト煮込んだ具材で身体ポカポカ",
        description: `${meatOrProtein}とお野菜から出た自然のお出汁がスープに溶け込み、最後の一滴まで飲み干したくなる優しい味わいです。`,
        cookingTimeMinutes: 12,
        difficulty: "簡単",
        cuisineType: "和風",
        tags: ["身体ポカポカ", "つゆだく", "消化に良い", "定番麺"],
        baseServings: 2,
        mainIngredients: n2Mains,
        seasonings: n2Seasonings,
        steps: [
          { stepNumber: 1, instruction: `鍋に水と調味料を入れて火にかけ、煮立ったら${meatOrProtein}と${vegName}を加えて煮込みます。`, timerMinutes: 4 },
          { stepNumber: 2, instruction: `${noodleName}を鍋に直接加え、ひと煮立ちさせて麺を温めます。`, timerMinutes: 2 },
          { stepNumber: 3, instruction: `器に盛り付け、熱々のおつゆをたっぷり注いで完成です。` },
        ],
        nutritionPerServing: { ...estimateNutrition("つゆ麺", n2Mains, n2Seasonings), highlights: "温かいスープで胃腸を温め、消化吸収を助けるヘルシーな一杯です。" },
        chefTips: "お肉を先にサッと煮てアクを取ることで、澄んだ美味しいお出汁になります。",
      },
      {
        id: "rec_noodle_3",
        title: `${meatOrProtein}と${vegName}のとろみ旨塩あんかけ${noodleTypeLabel}`,
        subtitle: "熱々のとろみが麺に絡んで冷めにくい！大満足ごちそう麺",
        description: `具材たっぷりのとろみあんが${noodleName}にしっかり絡む、中華風のごちそうあんかけ麺です。`,
        cookingTimeMinutes: 14,
        difficulty: "簡単",
        cuisineType: "中華",
        tags: ["あんかけ", "熱々", "満足感", "野菜たっぷり"],
        baseServings: 2,
        mainIngredients: n3Mains,
        seasonings: n3Seasonings,
        steps: [
          { stepNumber: 1, instruction: `${noodleName}は耐熱皿に入れ、電子レンジで温めて器によそっておきます。` },
          { stepNumber: 2, instruction: `フライパンで${meatOrProtein}と${vegName}を炒め、調味料と水を加えてひと煮立ちさせます。`, timerMinutes: 3 },
          { stepNumber: 3, instruction: `水溶き片栗粉を回し入れてしっかりとろみをつけ、${noodleName}の上からたっぷりかけます。` },
        ],
        nutritionPerServing: { ...estimateNutrition("あんかけ麺", n3Mains, n3Seasonings), highlights: "とろみによって熱が逃げず、野菜の食物繊維もたっぷりと摂取できます。" },
        chefTips: "とろみをつけた後は1分ほどしっかり沸騰させると、時間が経ってもとろみが緩みません。",
      },
      {
        id: "rec_noodle_4",
        title: `ふんわり卵とじ${meatOrProtein}と${vegName}の黄金${noodleTypeLabel}`,
        subtitle: "優しい卵のコクが包み込む！夜食や忙しいお昼にぴったりの一品",
        description: `溶き卵をふんわり流し込み、具材の旨味と麺を優しく包んだ栄養バランス抜群の献立です。`,
        cookingTimeMinutes: 10,
        difficulty: "簡単",
        cuisineType: "和風",
        tags: ["卵とじ", "優しい味わい", "高たんぱく", "スピード飯"],
        baseServings: 2,
        mainIngredients: n4Mains,
        seasonings: n4Seasonings,
        steps: [
          { stepNumber: 1, instruction: `小鍋につゆと具材を入れて中火で煮立て、${noodleName}を加えます。`, timerMinutes: 3 },
          { stepNumber: 2, instruction: `煮立っているところに溶き卵を菜箸に伝わせて細く流し入れ、火を止めフタをして蒸らします。`, timerMinutes: 1 },
          { stepNumber: 3, instruction: `器によそい、ふんわり半熟卵の状態でいただきます。` },
        ],
        nutritionPerServing: { ...estimateNutrition("卵とじ麺", n4Mains, n4Seasonings), highlights: "卵とお肉の良質たんぱく質が効率よく補給できます。" },
        chefTips: "卵を入れる時はしっかり沸騰させてから火を止めると、ふわふわの花が咲いたように仕上がります。",
      },
      {
        id: "rec_noodle_5",
        title: `${meatOrProtein}と${vegName}のパリッと香ばし焼き${noodleTypeLabel}`,
        subtitle: "両面カリッと焼き上げた麺に具材をトッピング！食感が楽しいアレンジ",
        description: `麺をフライパンで押し付けながら両面カリカリに焼き上げ、香ばしさを極限まで高めた絶品アレンジです。`,
        cookingTimeMinutes: 12,
        difficulty: "簡単",
        cuisineType: "和風",
        tags: ["カリカリ食感", "おつまみにも", "香ばしい", "新定番"],
        baseServings: 2,
        mainIngredients: n5Mains,
        seasonings: n5Seasonings,
        steps: [
          { stepNumber: 1, instruction: `フライパンに多めの油を熱し、${noodleName}を丸く広げてヘラで押し付けながら両面をカリッと焼き、お皿に取り出します。`, timerMinutes: 5 },
          { stepNumber: 2, instruction: `同じフライパンで${meatOrProtein}と${vegName}を炒め、調味料で味付けします。`, timerMinutes: 3 },
          { stepNumber: 3, instruction: `カリカリに焼いた${noodleName}の上に具材をのせて完成です。` },
        ],
        nutritionPerServing: { ...estimateNutrition("焼き麺", n5Mains, n5Seasonings), highlights: "香ばしい焼き目による風味で、食欲がそそられます。" },
        chefTips: "麺を焼く時はあまり触らず、じっくり中火で焼き色をつけるのがカリカリの秘訣です。",
      },
    ];
  } else if (/こんにゃく|蒟蒻|コンニャク|しらたき|白滝|糸こん/.test(searchStr)) {
    // SPECIALIZED KONJAC (板こんにゃく・糸こんにゃく・しらたき) RECIPE ENGINE
    const konjacName = allInputs.find((i) => /こんにゃく|蒟蒻|コンニャク|しらたき|白滝|糸こん/.test(i)) || "板こんにゃく";
    const otherProtein = allInputs.find((i) => i !== konjacName && (categorizeIngredient(i) === "meat" || categorizeIngredient(i) === "fish" || /あげ|豆腐/.test(i))) || "豚バラ肉（または鶏肉）";
    const otherVeg = allInputs.find((i) => i !== konjacName && i !== otherProtein) || "長ネギ・大根・きのこ";

    // Recipe 1: ピリ辛ごま油香る 甘辛雷こんにゃく（雷炒め）
    const k1Mains = [
      { name: konjacName, baseAmount: 1, unit: "枚 (約250g)", note: "手やスプーンで一口大にちぎる" },
      { name: "長ネギまたは薬味ねぎ", baseAmount: 0.5, unit: "本", note: "小口切り" },
    ];
    const k1Seasonings = buildSeasoningList([
      { name: hasSoySauce ? "醤油" : (hasMentsuyu ? "めんつゆ" : "特製タレ"), baseAmount: 1.5, unit: "大さじ" },
      { name: hasMirin ? "みりん" : (hasSugar ? "砂糖" : "酒"), baseAmount: 1, unit: "大さじ" },
      { name: hasSugar ? "砂糖" : "みりん", baseAmount: 0.5, unit: "大さじ" },
      { name: hasOil ? "ごま油（またはサラダ油）" : "油", baseAmount: 1, unit: "大さじ" },
      { name: "白いりごま・一味唐辛子", baseAmount: 1, unit: "少々", preferred: true },
    ]);

    // Recipe 2: 味が染み込む！具材とこんにゃくのほっこり甘辛煮物
    const k2Mains = [
      { name: konjacName, baseAmount: 1, unit: "枚 (約250g)", note: "スプーンでちぎるか格子状に隠し包丁" },
      { name: otherProtein, baseAmount: 150, unit: "g", note: "一口大" },
      { name: otherVeg, baseAmount: 120, unit: "g", note: "乱切り" },
    ];
    const k2Seasonings = buildSeasoningList([
      { name: hasSoySauce ? "醤油" : "めんつゆ", baseAmount: 2, unit: "大さじ" },
      { name: hasMirin ? "みりん" : "砂糖", baseAmount: 1.5, unit: "大さじ" },
      { name: hasSake ? "酒" : "水", baseAmount: 1.5, unit: "大さじ" },
      { name: hasDashi ? "和風顆粒だし" : "だし", baseAmount: 1, unit: "小さじ" },
      { name: "水", baseAmount: 200, unit: "ml" },
    ]);

    // Recipe 3: カリッと香ばしガーリック醤油ステーキ
    const k3Mains = [
      { name: konjacName, baseAmount: 1, unit: "枚 (約250g)", note: "両面に格子状の切り込みを入れて厚切り" },
      { name: "大葉・青ねぎ（あれば）", baseAmount: 2, unit: "枚", note: "トッピング" },
    ];
    const k3Seasonings = buildSeasoningList([
      { name: hasSoySauce ? "醤油" : "ポン酢", baseAmount: 1.5, unit: "大さじ" },
      { name: hasMirin ? "みりん" : "砂糖", baseAmount: 1, unit: "大さじ" },
      { name: hasGarlicGinger ? "にんにく（すりおろしまたはスライス）" : "生姜", baseAmount: 0.5, unit: "小さじ" },
      { name: hasOil ? "ごま油またはバター" : "サラダ油", baseAmount: 1, unit: "大さじ" },
      { name: hasSaltPepper ? "黒こしょう" : "塩", baseAmount: 1, unit: "少々" },
    ]);

    // Recipe 4: 具だくさん食べるあったか具材汁（豚汁・けんちん汁風）
    const k4Mains = [
      { name: konjacName, baseAmount: 0.5, unit: "枚 (約130g)", note: "短冊切りまたはちぎり" },
      { name: otherProtein, baseAmount: 100, unit: "g", note: "細切れ" },
      { name: otherVeg, baseAmount: 150, unit: "g", note: "いちょう切り" },
    ];
    const k4Seasonings = buildSeasoningList([
      { name: hasMiso ? "味噌" : (hasSoySauce ? "醤油" : "めんつゆ"), baseAmount: 2, unit: "大さじ" },
      { name: hasDashi ? "和風顆粒だし" : "だし", baseAmount: 1, unit: "小さじ" },
      { name: "水", baseAmount: 450, unit: "ml" },
      { name: hasOil ? "ごま油（炒め用）" : "油", baseAmount: 1, unit: "小さじ" },
    ]);

    // Recipe 5: 香ばし味噌田楽風 こく旨味噌焼き
    const k5Mains = [
      { name: konjacName, baseAmount: 1, unit: "枚 (約250g)", note: "三角または長方形にカットして隠し包丁" },
    ];
    const k5Seasonings = buildSeasoningList([
      { name: hasMiso ? "味噌" : "醤油", baseAmount: 2, unit: "大さじ" },
      { name: hasSugar ? "砂糖" : (hasMirin ? "みりん" : "酒"), baseAmount: 1.5, unit: "大さじ" },
      { name: hasMirin ? "みりん" : "酒", baseAmount: 1, unit: "大さじ" },
      { name: hasSake ? "酒" : "水", baseAmount: 1, unit: "大さじ" },
      { name: "白いりごま", baseAmount: 1, unit: "小さじ", preferred: true },
    ]);

    recipes = [
      {
        id: "rec_konjac_1",
        title: `ピリ辛ごま油香る ${konjacName}の甘辛雷炒め（雷こんにゃく）`,
        subtitle: "フライパンでパチパチ炒めて旨味凝縮！低カロリーで大満足の常備菜",
        description: `${konjacName}を手やスプーンでちぎることで断面が凸凹になり、香ばしい甘辛ダレが驚くほどよく絡みます。ごま油の香りと一味のピリ辛さがアクセントの絶品おかずです。`,
        cookingTimeMinutes: 10,
        difficulty: "簡単",
        cuisineType: "和風",
        tags: ["超低カロリー", "食物繊維たっぷり", "おつまみ", "作り置き", "時短10分"],
        baseServings: 2,
        mainIngredients: k1Mains,
        seasonings: k1Seasonings,
        steps: [
          { stepNumber: 1, instruction: `${konjacName}はスプーンで一口大にちぎり、熱湯で2分下茹でしてザルにあげ、しっかり水気を切ります（アク抜き済みなら水洗いのみでOK）。` },
          { stepNumber: 2, instruction: `油を引かないフライパンにこんにゃくを入れ、中火でパチパチと音が鳴るまで水分を飛ばすように乾煎りします。`, timerMinutes: 3, tip: "しっかり乾煎りして表面の水分を飛ばすことで味がギュッと染み込みます。" },
          { stepNumber: 3, instruction: `ごま油を回し入れて全体に馴染ませ、調味料（醤油、みりん、砂糖）を一気に加えます。` },
          { stepNumber: 4, instruction: `汁気がなくなるまで強火で手早く炒め煮にし、仕上げに白ごまと一味唐辛子を振って完成です！`, timerMinutes: 2 },
        ],
        nutritionPerServing: { calories: 65, protein: 1.2, fat: 3.5, carbohydrates: 7.8, saltEquivalent: 1.1, highlights: "こんにゃくの主成分グルコマンナン（食物繊維）が豊富で、ほぼノンカロリーなのに抜群の満腹感。" },
        chefTips: "包丁で切るのではなく、スプーンでちぎるとタレが絡む表面積が倍増します！",
      },
      {
        id: "rec_konjac_2",
        title: `味がじゅわっと染み込む！${otherProtein}と${konjacName}のほっこり甘辛煮物`,
        subtitle: "素材の旨味を出汁ごと煮含める！冷めても美味しい定番おふくろの味",
        description: `${otherProtein}のジューシーなコクと和風出汁が${konjacName}の芯までじっくり染み込んだ優しい煮物。ご飯のおかずにも晩酌にも最適です。`,
        cookingTimeMinutes: 15,
        difficulty: "簡単",
        cuisineType: "和風",
        tags: ["おふくろの味", "味染み", "ヘルシー", "お弁当にも"],
        baseServings: 2,
        mainIngredients: k2Mains,
        seasonings: k2Seasonings,
        steps: [
          { stepNumber: 1, instruction: `${konjacName}は格子状に隠し包丁を入れて一口大に切り、下茹でします。${otherProtein}と${otherVeg}も食べやすい大きさに切ります。` },
          { stepNumber: 2, instruction: `鍋に少量の油を熱し、${otherProtein}と${konjacName}、${otherVeg}を中火で2分ほど炒めます。` },
          { stepNumber: 3, instruction: `水、和風だし、酒、みりん、醤油を加え、落とし蓋をして弱中火で煮込みます。`, timerMinutes: 8 },
          { stepNumber: 4, instruction: `煮汁が少なくなってきたら落とし蓋を外し、強火でサッと照りを出して火を止めます。一度冷ますとさらに味が染みます。` },
        ],
        nutritionPerServing: { calories: 195, protein: 14.5, fat: 11.2, carbohydrates: 8.6, saltEquivalent: 1.6, highlights: "良質なたんぱく質とこんにゃくの食物繊維が腸内環境を整え、代謝をサポートします。" },
        chefTips: "格子状に細かく隠し包丁を入れておくと、短時間の煮込みでも中まで味がしっかり染み込みます。",
      },
      {
        id: "rec_konjac_3",
        title: `香ばしガーリック醤油仕立て ${konjacName}の極上ヘルシーステーキ`,
        subtitle: "切り込みを入れてカリッと焼き上げる！お肉に負けない満足感と香ばしさ",
        description: `表面に細かく格子状の切り込みを入れ、にんにく醤油とごま油（またはバター）でカリッと香ばしく焼き上げたステーキ。低カロリーで罪悪感ゼロのごちそうです。`,
        cookingTimeMinutes: 10,
        difficulty: "簡単",
        cuisineType: "和風",
        tags: ["ダイエット", "香ばしステーキ", "時短10分", "満足感抜群"],
        baseServings: 2,
        mainIngredients: k3Mains,
        seasonings: k3Seasonings,
        steps: [
          { stepNumber: 1, instruction: `${konjacName}は両面に深さ3mm程度の格子状の切り込みを入れ、食べやすい厚切り（4〜6等分）にカットします。` },
          { stepNumber: 2, instruction: `フライパンに油とすりおろしにんにくを弱火で熱し、香りが立ったら${konjacName}を並べ入れます。` },
          { stepNumber: 3, instruction: `中火でヘラで押し付けながら両面をこんがりきつね色になるまでしっかり焼き色をつけます。`, timerMinutes: 4 },
          { stepNumber: 4, instruction: `醤油とみりんを鍋肌から回し入れ、香ばしいタレをスプーンでかけながらこんにゃくに絡めて完成です！` },
        ],
        nutritionPerServing: { calories: 78, protein: 1.5, fat: 4.2, carbohydrates: 6.8, saltEquivalent: 1.2, highlights: "にんにくのアリシンが代謝を高め、低糖質・低脂質で夜遅くの食事にも安心です。" },
        chefTips: "ヘラでしっかりフライパンに押し付けながら焼くと、表面がカリッと香ばしく仕上がります。",
      },
      {
        id: "rec_konjac_4",
        title: `具だくさん${otherProtein}と${konjacName}のあったか食べる具だくさん汁`,
        subtitle: "出汁と味噌が身体の芯まで染み渡る！これ1杯で栄養満点の温活メニュー",
        description: `${otherProtein}の旨味と${konjacName}のプリッとした食感が楽しい具だくさんのお汁。温かい出汁が胃腸を優しく温めます。`,
        cookingTimeMinutes: 12,
        difficulty: "簡単",
        cuisineType: "和風",
        tags: ["食べるスープ", "身体ポカポカ", "具だくさん", "温活"],
        baseServings: 2,
        mainIngredients: k4Mains,
        seasonings: k4Seasonings,
        steps: [
          { stepNumber: 1, instruction: `${konjacName}は短冊切り、${otherProtein}と${otherVeg}も小さめに切ります。` },
          { stepNumber: 2, instruction: `鍋にごま油を熱して具材をサッと炒め、水を加えて煮立たせます。`, timerMinutes: 3 },
          { stepNumber: 3, instruction: `和風だしを加え、弱火で野菜が柔らかくなるまで煮込みます。`, timerMinutes: 5 },
          { stepNumber: 4, instruction: `火を弱めて味噌を溶き入れ、ひと煮立ちする直前で火を止めます。お好みで七味唐辛子を添えます。` },
        ],
        nutritionPerServing: { calories: 155, protein: 11.8, fat: 8.5, carbohydrates: 7.2, saltEquivalent: 1.5, highlights: "発酵食品の味噌とこんにゃくの食物繊維でダブルの腸活効果が得られます。" },
        chefTips: "具材を煮る前にごま油で炒めることで、スープに深いコクと香りが生まれます。",
      },
      {
        id: "rec_konjac_5",
        title: `香ばし味噌田楽風 ${konjacName}のこってり甘辛味噌焼き`,
        subtitle: "甘辛特製味噌が香ばしく絡む！昔ながらのホッとする美味しさ",
        description: `温めた${konjacName}に、味噌・みりん・砂糖を練り上げた特製甘辛田楽味噌をとろりとかけた香ばしい一品。素朴ながら箸が止まらない味わいです。`,
        cookingTimeMinutes: 10,
        difficulty: "簡単",
        cuisineType: "和風",
        tags: ["伝統和食", "味噌田楽", "時短10分", "ホッとする味"],
        baseServings: 2,
        mainIngredients: k5Mains,
        seasonings: k5Seasonings,
        steps: [
          { stepNumber: 1, instruction: `${konjacName}は三角または四角に切り、両面に浅く隠し包丁を入れてお湯で温めておきます。` },
          { stepNumber: 2, instruction: `小鍋またはレンジで味噌、砂糖、みりん、酒をよく練り混ぜ、弱火でとろみがつくまで練り上げます。`, timerMinutes: 2 },
          { stepNumber: 3, instruction: `水気をしっかり切った${konjacName}を皿に並べ、熱々の甘辛特製味噌をたっぷりかけます。` },
          { stepNumber: 4, instruction: `仕上げに白ごまをふって香ばしくいただきます。トースターで軽く焼いても絶品です。` },
        ],
        nutritionPerServing: { calories: 88, protein: 2.8, fat: 1.8, carbohydrates: 14.5, saltEquivalent: 1.4, highlights: "大豆発酵イソフラボンとこんにゃくの相乗効果で、美容と健康を強力にサポートします。" },
        chefTips: "田楽味噌に少しすりごまや生姜を混ぜると、さらに風味豊かなプロの味になります。",
      },
    ];
  } else if (hasTofu) {
    // SPECIALIZED TOFU (絹ごし豆腐・木綿豆腐・厚揚げ) RECIPE ENGINE
    const tofuName = allInputs.find((i) => /豆腐|とうふ|厚揚げ|絹|木綿/.test(i)) || "絹ごし豆腐";
    const otherMeat = allInputs.find((i) => i !== tofuName && categorizeIngredient(i) === "meat") || "豚ひき肉（または豚こま切れ肉）";
    const otherVeg = allInputs.find((i) => i !== tofuName && i !== otherMeat) || "長ネギ（または玉ねぎ）";

    // Recipe 1: 旨味たっぷり！本格四川風麻婆豆腐（オイスターソース仕立て）
    const t1Mains = [
      { name: tofuName, baseAmount: 1, unit: "丁 (約300g)", note: "さいの目切り（軽く水切り）" },
      { name: otherMeat, baseAmount: 120, unit: "g", note: "ひき肉または細切り" },
      { name: "長ネギ", baseAmount: 0.5, unit: "本", note: "みじん切り" },
    ];
    const t1Seasonings = buildSeasoningList([
      { name: hasOyster ? "オイスターソース" : (hasSoySauce ? "醤油" : "味噌"), baseAmount: 1.5, unit: "大さじ" },
      { name: hasDoubanjiang ? "豆板醤" : (hasMiso ? "味噌" : "醤油"), baseAmount: 1, unit: "小さじ" },
      { name: hasSoySauce ? "醤油" : "めんつゆ", baseAmount: 1, unit: "大さじ" },
      { name: hasChickenStock ? "鶏ガラスープの素" : "和風だし", baseAmount: 1, unit: "小さじ" },
      { name: "水", baseAmount: 150, unit: "ml" },
      { name: "片栗粉（水溶き片栗粉）", baseAmount: 1, unit: "大さじ" },
      { name: hasOil ? "ごま油（またはサラダ油）" : "油", baseAmount: 1, unit: "大さじ" },
    ]);

    // Recipe 2: 絶品！甘辛すき焼き風 ごちそう肉豆腐
    const t2Mains = [
      { name: tofuName, baseAmount: 1, unit: "丁 (約300g)", note: "大きめのひと口大に切る" },
      { name: otherMeat, baseAmount: 150, unit: "g", note: "食べやすく切る" },
      { name: "玉ねぎまたは長ネギ", baseAmount: 0.5, unit: "個", note: "くし形切りまたは斜め切り" },
    ];
    const t2Seasonings = buildSeasoningList([
      { name: hasSoySauce ? "醤油" : (hasMentsuyu ? "めんつゆ" : "調味タレ"), baseAmount: 2.5, unit: "大さじ" },
      { name: hasMirin ? "みりん" : "砂糖", baseAmount: 2, unit: "大さじ" },
      { name: hasSugar ? "砂糖" : "みりん", baseAmount: 1, unit: "大さじ" },
      { name: hasSake ? "料理酒" : "水", baseAmount: 2, unit: "大さじ" },
      { name: hasDashi ? "和風だしの素" : "だし汁", baseAmount: 0.5, unit: "小さじ" },
      { name: "水", baseAmount: 100, unit: "ml" },
    ]);

    // Recipe 3: カリッと香ばしい！豆腐ステーキ キノコとオイスターソースの旨味あんかけ
    const t3Mains = [
      { name: tofuName, baseAmount: 1, unit: "丁 (約300g)", note: "水切りして厚めの4等分に切る" },
      { name: "きのこ類（しめじ・えのき・椎茸）", baseAmount: 80, unit: "g", note: "石づきを取ってほぐす" },
      { name: "長ネギまたは薬味ねぎ", baseAmount: 0.3, unit: "本", note: "小口切り" },
    ];
    const t3Seasonings = buildSeasoningList([
      { name: hasOyster ? "オイスターソース" : (hasSoySauce ? "醤油" : "ポン酢"), baseAmount: 1.5, unit: "大さじ" },
      { name: hasSoySauce ? "醤油" : "めんつゆ", baseAmount: 1, unit: "大さじ" },
      { name: hasMirin ? "みりん" : "砂糖", baseAmount: 1, unit: "大さじ" },
      { name: "片栗粉（まぶし用＆あんかけ用）", baseAmount: 1.5, unit: "大さじ" },
      { name: hasOil ? "サラダ油（またはごま油）" : "油", baseAmount: 1.5, unit: "大さじ" },
      { name: "水", baseAmount: 100, unit: "ml" },
    ]);

    // Recipe 4: 身体の芯から温まる！豆腐とキャベツ・野菜の具だくさん中華とろみスープ
    const t4Mains = [
      { name: tofuName, baseAmount: 0.5, unit: "丁 (約150g)", note: "一口大の角切りまたは手でちぎる" },
      { name: "キャベツまたは白菜", baseAmount: 100, unit: "g", note: "ざく切り" },
      { name: "卵", baseAmount: 1, unit: "個", note: "溶きほぐす" },
    ];
    const t4Seasonings = buildSeasoningList([
      { name: hasChickenStock ? "鶏ガラスープの素" : "和風だし", baseAmount: 1, unit: "大さじ" },
      { name: hasSoySauce ? "醤油" : "塩", baseAmount: 1, unit: "小さじ" },
      { name: hasOyster ? "オイスターソース（コク出し）" : "みりん", baseAmount: 0.5, unit: "小さじ" },
      { name: "水溶き片栗粉", baseAmount: 1, unit: "大さじ" },
      { name: hasOil ? "ごま油（仕上げ）" : "油", baseAmount: 0.5, unit: "小さじ" },
      { name: "水", baseAmount: 400, unit: "ml" },
      { name: "塩・こしょう", baseAmount: 1, unit: "少々" },
    ]);

    // Recipe 5: 豆腐のふんわりヘルシーお好み焼き風（粉少なめ・糖質オフ）
    const t5Mains = [
      { name: tofuName, baseAmount: 0.5, unit: "丁 (約150g)", note: "泡立て器やスプーンでなめらかに潰す" },
      { name: "キャベツ", baseAmount: 120, unit: "g", note: "千切りまたはみじん切り" },
      { name: "卵", baseAmount: 1, unit: "個" },
      { name: "片栗粉または小麦粉", baseAmount: 2, unit: "大さじ", note: "つなぎ用" },
    ];
    const t5Seasonings = buildSeasoningList([
      { name: hasDashi ? "和風顆粒だし" : "鶏ガラスープの素", baseAmount: 1, unit: "小さじ" },
      { name: hasSauce ? "お好み焼きソース（または中濃ソース）" : (hasPonzu ? "ポン酢" : "醤油"), baseAmount: 2, unit: "大さじ" },
      { name: hasMayo ? "マヨネーズ" : "ごま油", baseAmount: 1, unit: "大さじ" },
      { name: hasOil ? "サラダ油" : "油", baseAmount: 1, unit: "大さじ" },
      { name: "かつお節・青のり", baseAmount: 1, unit: "適量", preferred: true },
    ]);

    recipes = [
      {
        id: "rec_tofu_1",
        title: `コク旨！本格四川風 ${tofuName}の麻婆豆腐`,
        subtitle: `${hasOyster ? "オイスターソースの深いコク！" : ""}ご飯が進む王道中華メインおかず`,
        description: `滑らかな${tofuName}に豚肉の旨味と特製合わせダレがしっかり絡む絶品麻婆豆腐。辛さとコクのバランスが抜群で食卓の主役にぴったりです。`,
        cookingTimeMinutes: 12,
        difficulty: "簡単",
        cuisineType: "中華",
        tags: ["本格中華", "高たんぱく", "ご飯が進む", "オイスターソース"],
        baseServings: 2,
        mainIngredients: t1Mains,
        seasonings: t1Seasonings,
        steps: [
          { stepNumber: 1, instruction: `${tofuName}は2cm角に切ります。フライパンに油を熱し、みじん切りの長ネギと肉を中火で色が変わるまで炒めます。`, timerMinutes: 3 },
          { stepNumber: 2, instruction: `調味料（オイスターソース、醤油、豆板醤または味噌、鶏ガラ、水）を加え、煮立ったら${tofuName}を静かに入れます。`, timerMinutes: 2 },
          { stepNumber: 3, instruction: `弱火で2〜3分煮込み、豆腐の芯まで味を染み込ませます。`, timerMinutes: 3, tip: "豆腐が崩れないよう、木べらで優しく底を押すように動かします。" },
          { stepNumber: 4, instruction: `一度火を止め、水溶き片栗粉を回し入れて素早く混ぜます。再度強火にかけてとろみをつけ、仕上げにごま油を垂らして完成です。`, timerMinutes: 1 },
        ],
        nutritionPerServing: { calories: 230, protein: 17.5, fat: 12.8, carbohydrates: 9.6, saltEquivalent: 1.8, highlights: "大豆イソフラボンと良質なたんぱく質が凝縮。低糖質でヘルシーながら満足感の高い一品です。" },
        chefTips: "豆腐を沸騰したお湯で1分サッと下茹でするか、レンジで1分加熱して水気を切っておくと、煮崩れず味がしっかり絡みます！",
      },
      {
        id: "rec_tofu_2",
        title: `味がしみしみ！${tofuName}と${otherMeat}の甘辛すき焼き風肉豆腐`,
        subtitle: "10分で味がしっかり染み込む！ホッとする日本の家庭料理",
        description: `じゅわっと煮汁が溢れる${tofuName}と、甘辛いタレを吸ったお肉・野菜がたまらない肉豆腐。温泉卵やすき焼き風の生卵をつけても最高です。`,
        cookingTimeMinutes: 15,
        difficulty: "簡単",
        cuisineType: "和風",
        tags: ["すき焼き風", "家庭の味", "煮込み10分", "栄養満点"],
        baseServings: 2,
        mainIngredients: t2Mains,
        seasonings: t2Seasonings,
        steps: [
          { stepNumber: 1, instruction: `鍋または深めのフライパンに調味料（醤油、みりん、砂糖、酒、和風だし、水）を合わせ、中火でひと煮立ちさせます。` },
          { stepNumber: 2, instruction: `玉ねぎ（または長ネギ）と${tofuName}を並べ入れ、落としブタ（またはアルミホイル）をして中弱火で5分煮込みます。`, timerMinutes: 5 },
          { stepNumber: 3, instruction: `空いたスペースにお肉を広げ入れ、火が通るまでさらに2〜3分サッと煮ます。`, timerMinutes: 3, tip: "お肉を後から加えることで、お肉が硬くならず柔らかく仕上がります。" },
          { stepNumber: 4, instruction: `火を止めて2〜3分置くと、余熱で豆腐の中まで味がぐんぐん染み込みます。器に盛り付けて完成です。` },
        ],
        nutritionPerServing: { calories: 265, protein: 19.2, fat: 13.5, carbohydrates: 14.8, saltEquivalent: 1.9, highlights: "低カロリーで良質なたんぱく質がたっぷり。野菜の食物繊維とお肉のビタミンB群も同時に摂取できます。" },
        chefTips: "火を止めた後の「少し冷ます時間」に味がぎゅっと染み込みます。食べる直前に再度温めると絶品！",
      },
      {
        id: "rec_tofu_3",
        title: `外カリ中ふわ！${tofuName}ステーキ キノコと特製あんかけ`,
        subtitle: "片栗粉をまぶして焼くだけ！お店のようなごちそう豆腐料理",
        description: `片栗粉をまぶしてフライパンで香ばしく焼いた${tofuName}に、旨味たっぷりのキノコあんかけをとろ〜りかけた絶品メイン。`,
        cookingTimeMinutes: 12,
        difficulty: "簡単",
        cuisineType: "和風",
        tags: ["外カリ中ふわ", "時短12分", "ヘルシー主菜", "旨味たっぷり"],
        baseServings: 2,
        mainIngredients: t3Mains,
        seasonings: t3Seasonings,
        steps: [
          { stepNumber: 1, instruction: `${tofuName}をキッチンペーパーで包んで軽く水気を拭き、全体に薄く片栗粉をまぶします。` },
          { stepNumber: 2, instruction: `フライパンに多めの油を中火で熱し、豆腐を並べて全面にこんがり香ばしい焼き色がつくまで焼き、皿に取り出します。`, timerMinutes: 5 },
          { stepNumber: 3, instruction: `同じフライパンできのこをサッと炒め、水と合わせ調味料（オイスターソース、醤油、みりん）を加えて煮立てます。`, timerMinutes: 2 },
          { stepNumber: 4, instruction: `水溶き片栗粉でとろみをつけ、焼きたての豆腐ステーキの上に熱々のあんをたっぷりかけます。` },
        ],
        nutritionPerServing: { calories: 195, protein: 12.6, fat: 9.8, carbohydrates: 13.2, saltEquivalent: 1.5, highlights: "きのこの食物繊維と大豆たんぱく質の相乗効果で、腸内環境を整えながら満足感を維持できます。" },
        chefTips: "片栗粉を焼く直前に手早くまぶすことで、水分を吸わずカリッとした衣に焼き上がります。",
      },
      {
        id: "rec_tofu_4",
        title: `ほっこり温活！${tofuName}とシャキシャキ野菜の中華とろみ卵スープ`,
        subtitle: "包丁いらずで5分！胃腸に優しく身体の芯から温まる満足スープ",
        description: `ふわふわの溶き卵と滑らかな${tofuName}がたっぷり入った具だくさんスープ。優しい中華出汁とごま油の香りが食欲をそそります。`,
        cookingTimeMinutes: 8,
        difficulty: "簡単",
        cuisineType: "中華",
        tags: ["温活", "5分即席", "胃腸に優しい", "食物繊維"],
        baseServings: 2,
        mainIngredients: t4Mains,
        seasonings: t4Seasonings,
        steps: [
          { stepNumber: 1, instruction: `小鍋に水と鶏ガラスープの素、醤油、オイスターソースを入れ、ざく切りキャベツを加えて中火で煮立てます。`, timerMinutes: 3 },
          { stepNumber: 2, instruction: `${tofuName}を手で一口大にちぎりながら（またはスプーンですくいながら）加え、ひと煮立ちさせます。`, timerMinutes: 2 },
          { stepNumber: 3, instruction: `水溶き片栗粉を加えてとろみをつけた後、スープをかき混ぜながら溶き卵を回し入れ、ふわっと浮き上がったら火を止めます。` },
          { stepNumber: 4, instruction: `仕上げにごま油と塩こしょうをふって熱々をいただきます。` },
        ],
        nutritionPerServing: { calories: 135, protein: 9.4, fat: 6.8, carbohydrates: 7.2, saltEquivalent: 1.3, highlights: "水溶性ビタミンと大豆レシチンをスープごと丸ごと摂取でき、疲れた日の夜食や朝食にも最適です。" },
        chefTips: "卵を入れる前にスープに軽くとろみをつけておくことで、卵が沈まずふわふわの花が咲いたように仕上がります。",
      },
      {
        id: "rec_tofu_5",
        title: `粉少なめ！${tofuName}のふんわりヘルシーお好み焼き風`,
        subtitle: "小麦粉わずかで驚きのふわふわ食感！罪悪感ゼロの糖質オフごはん",
        description: `潰した${tofuName}に卵と千切りキャベツを混ぜてこんがり焼くだけ。山芋を入れたかのようなふわふわ食感で大満足のおいしさです。`,
        cookingTimeMinutes: 10,
        difficulty: "簡単",
        cuisineType: "和風",
        tags: ["糖質オフ", "罪悪感ゼロ", "ふわふわ食感", "フライパン1つ"],
        baseServings: 2,
        mainIngredients: t5Mains,
        seasonings: t5Seasonings,
        steps: [
          { stepNumber: 1, instruction: `ボウルに${tofuName}を入れ、泡立て器でなめらかになるまで潰します。卵、だしの素、片栗粉（または小麦粉）を加えてよく混ぜ合わせます。` },
          { stepNumber: 2, instruction: `キャベツを加えてスプーンでさっくりと混ぜ合わせます。` },
          { stepNumber: 3, instruction: `フライパンに油を熱し、生地を流し入れて丸く整え、フタをして弱中火で3〜4分蒸し焼きにします。`, timerMinutes: 4 },
          { stepNumber: 4, instruction: `ひっくり返してさらに2〜3分焼き、お皿に盛ってソース、マヨネーズ、かつお節をトッピングします。`, timerMinutes: 3 },
        ],
        nutritionPerServing: { calories: 185, protein: 11.8, fat: 9.5, carbohydrates: 12.0, saltEquivalent: 1.4, highlights: "主原料が大豆と野菜なのでカロリー・糖質を大幅カット！遅い時間の夜ご飯にも安心です。" },
        chefTips: "ひっくり返す時はお皿やフタをフライパンにかぶせてスライドさせると、崩れず綺麗に裏返せます。",
      },
    ];
  } else {
    // GENERAL DYNAMIC SYNTHESIS ENGINE
    // Works dynamically for any meat, seafood, vegetable, or tofu combination while using ONLY the user's available seasonings
    // p1 is the hero ingredient scanned or selected, p2 is the complementary ingredient
    const p1Name = heroIngredient;
    const p2Name = secondaryIngredient;
    const extraNames = otherIngredients.slice(0, 2);

    const formatMains = (amounts: number[]) => {
      const list = [
        { name: p1Name, baseAmount: amounts[0] || 180, unit: "g", note: "一口大" },
        { name: p2Name, baseAmount: amounts[1] || 150, unit: "g", note: "食べやすい大きさに切る" },
      ];
      extraNames.forEach((name, idx) => {
        list.push({ name, baseAmount: amounts[2 + idx] || 80, unit: "g", note: "適宜カット" });
      });
      return list;
    };

    // Recipe 1: 王道メイン炒め / ソテー
    const r1Mains = formatMains([200, 180, 80, 80]);
    const r1Seasonings = buildSeasoningList([
      { name: hasSauce ? "お好み焼きソース" : (hasSoySauce ? "醤油" : (hasMiso ? "味噌" : "塩・こしょう")), baseAmount: 1.5, unit: "大さじ" },
      { name: hasMayo ? "マヨネーズ" : (hasMirin ? "みりん" : "酒"), baseAmount: 1, unit: "大さじ" },
      { name: hasOil ? "サラダ油（またはごま油）" : "油", baseAmount: 1, unit: "大さじ" },
      { name: hasGarlicGinger ? "にんにく/生姜" : "塩・こしょう", baseAmount: 0.5, unit: "小さじ" },
    ]);

    // Recipe 2: さっぱり重ね蒸し / ヘルシースープ
    const r2Mains = formatMains([160, 200, 60, 60]);
    const r2Seasonings = buildSeasoningList([
      { name: hasPonzu ? "ポン酢" : (hasSoySauce ? "醤油" : (hasSauce ? "特製ソース" : "塩")), baseAmount: 2, unit: "大さじ" },
      { name: hasSake ? "料理酒" : "水", baseAmount: 2, unit: "大さじ" },
      { name: hasDashi ? "和風顆粒だし" : "塩・こしょう", baseAmount: 0.5, unit: "小さじ" },
    ]);

    // Recipe 3: コク旨特製炒め / スタミナ焼き
    const r3Mains = formatMains([190, 160, 70, 70]);
    const r3Seasonings = buildSeasoningList([
      { name: hasMiso ? "味噌" : (hasOyster ? "オイスターソース" : (hasSauce ? "お好み焼きソース" : "醤油")), baseAmount: 1.5, unit: "大さじ" },
      { name: hasSugar ? "砂糖" : (hasMirin ? "みりん" : "マヨネーズ"), baseAmount: 1, unit: "小さじ" },
      { name: hasOil ? "ごま油（またはサラダ油）" : "サラダ油", baseAmount: 1, unit: "大さじ" },
      { name: hasDoubanjiang ? "豆板醤" : "黒こしょう", baseAmount: 0.5, unit: "小さじ" },
    ]);

    // Recipe 4: 具だくさん食べるスープ / ほっこり煮込み
    const r4Mains = formatMains([150, 150, 60, 60]);
    const r4Seasonings = buildSeasoningList([
      { name: hasMiso ? "味噌" : (hasMentsuyu ? "めんつゆ" : (hasSoySauce ? "醤油" : "和風顆粒だし")), baseAmount: 1.5, unit: "大さじ" },
      { name: hasDashi ? "和風顆粒だし" : "水", baseAmount: 1, unit: "小さじ" },
      { name: "水", baseAmount: 450, unit: "ml" },
      { name: hasGarlicGinger ? "生姜" : "ごま油", baseAmount: 0.5, unit: "小さじ" },
    ]);

    // Recipe 5: 特製スタミナ丼 / ワンプレート
    const r5Mains = [
      ...formatMains([180, 140, 60, 60]),
      { name: "温かいご飯", baseAmount: 360, unit: "g (2杯分)" },
      { name: "卵（あれば）", baseAmount: 2, unit: "個" },
    ];
    const r5Seasonings = buildSeasoningList([
      { name: hasSoySauce ? "醤油" : (hasSauce ? "ソース" : (hasMentsuyu ? "めんつゆ" : "マヨネーズ")), baseAmount: 2, unit: "大さじ" },
      { name: hasMirin ? "みりん" : (hasSugar ? "砂糖" : "酒"), baseAmount: 1.5, unit: "大さじ" },
      { name: hasOil ? "サラダ油" : "油", baseAmount: 1, unit: "大さじ" },
      { name: hasMayo ? "マヨネーズ（トッピング）" : "塩・こしょう", baseAmount: 1, unit: "大さじ" },
    ]);

    recipes = [
      {
        id: "rec_dyn_1",
        title: `${p1Name}と${p2Name}の香ばしスピード炒め`,
        subtitle: `10分で完成！${allInputs.slice(0, 3).join("と")}の旨味が広がる王道メイン`,
        description: `ジューシーな${p1Name}のコクと${p2Name}の甘みがマッチする手軽な炒め物です。手元にある調味料でパパッと短時間で仕上がります。`,
        cookingTimeMinutes: 12,
        difficulty: "簡単",
        cuisineType: "和風",
        tags: ["フライパン1つ", "時短10分", "ご飯が進む", "人気定番"],
        baseServings: 2,
        mainIngredients: r1Mains,
        seasonings: r1Seasonings,
        steps: [
          { stepNumber: 1, instruction: `${p1Name}と${p2Name}を食べやすい一口大にカットします。` },
          { stepNumber: 2, instruction: `フライパンに油を中火で熱し、${p1Name}を炒めて色が変わるまで火を通します。`, timerMinutes: 3 },
          { stepNumber: 3, instruction: `${p2Name}を加えて強火でサッと炒め合わせ、合わせ調味料を回し入れて手早く絡めます。`, timerMinutes: 2 },
        ],
        nutritionPerServing: { ...estimateNutrition("炒め物", r1Mains, r1Seasonings), highlights: `${p1Name}の良質なたんぱく質と${p2Name}のビタミンが効率よく摂取できます。` },
        chefTips: "野菜は強火で短時間炒めることで水分が出ず、シャキシャキの食感に仕上がります。",
      },
      {
        id: "rec_dyn_2",
        title: `${p1Name}と${p2Name}の旨味重ね蒸し ヘルシー仕立て`,
        subtitle: "油控えめで素材の旨味凝縮！鍋やフライパンに重ねて蒸すだけ",
        description: `素材自身の水分とお出汁でじっくり蒸し上げるため、余分な油を使わずとってもヘルシー。${p1Name}の旨味が野菜全体に染み渡ります。`,
        cookingTimeMinutes: 14,
        difficulty: "簡単",
        cuisineType: "和風",
        tags: ["ヘルシー", "ほったらかし", "油控えめ", "低カロリー"],
        baseServings: 2,
        mainIngredients: r2Mains,
        seasonings: r2Seasonings,
        steps: [
          { stepNumber: 1, instruction: `フライパンまたは鍋の底に${p2Name}を敷き詰め、その上に${p1Name}を広げて並べます。` },
          { stepNumber: 2, instruction: `調味料を全体に回しかけ、フタをして中弱火で蒸し焼きにします。`, timerMinutes: 7 },
          { stepNumber: 3, instruction: `火が通ったらお皿に盛り、熱々を召し上がってください。` },
        ],
        nutritionPerServing: { ...estimateNutrition("蒸し物", r2Mains, r2Seasonings), highlights: "蒸す調理法により水溶性ビタミンや栄養素が逃げにくく、身体に優しい献立です。" },
        chefTips: "フタをぴったり閉めて弱火で蒸気を閉じ込めるのがジューシーに仕上げるポイントです。",
      },
      {
        id: "rec_dyn_3",
        title: `特製${p1Name}と${p2Name}のこってりコク旨ソテー`,
        subtitle: "ご飯が何杯でも進む！香ばしいタレがしっかり絡む満足おかず",
        description: `調味料の香ばしさと${p1Name}のジューシーさが食欲を刺激するスタミナおかず。お弁当のおかずにもぴったりです。`,
        cookingTimeMinutes: 12,
        difficulty: "簡単",
        cuisineType: "和風",
        tags: ["コク旨", "ご飯が進む", "お弁当にも", "がっつり"],
        baseServings: 2,
        mainIngredients: r3Mains,
        seasonings: r3Seasonings,
        steps: [
          { stepNumber: 1, instruction: `具材をそれぞれ食べやすい大きさに切り、合わせ調味料を小鉢で混ぜておきます。` },
          { stepNumber: 2, instruction: `フライパンに油を熱し、${p1Name}をこんがり香ばしく焼き色がつくまで炒めます。`, timerMinutes: 3 },
          { stepNumber: 3, instruction: `${p2Name}を加えて炒め合わせ、調味料を一気に加えて煮絡めます。`, timerMinutes: 2 },
        ],
        nutritionPerServing: { ...estimateNutrition("コク旨炒め", r3Mains, r3Seasonings), highlights: "たんぱく質と野菜の食物繊維が豊富で、日々の体力づくりに最適なバランスです。" },
        chefTips: "タレを加える前に余分な脂をキッチンペーパーで軽く拭き取ると、味がスッキリ絡みます。",
      },
      {
        id: "rec_dyn_4",
        title: `具だくさん${p1Name}と${p2Name}のほっこり食べるごちそうスープ`,
        subtitle: `素材の出汁が溶け出す！身体の芯から温まる満足おかず汁`,
        description: `たっぷりの具材をコトコト煮込んだ栄養満点の食べるスープ。これ1杯で野菜とお肉の栄養をしっかりチャージできます。`,
        cookingTimeMinutes: 15,
        difficulty: "簡単",
        cuisineType: "和風",
        tags: ["食べるスープ", "温活・身体ポカポカ", "栄養満点", "作り置き"],
        baseServings: 2,
        mainIngredients: r4Mains,
        seasonings: r4Seasonings,
        steps: [
          { stepNumber: 1, instruction: `鍋に少量の油を熱し、${p1Name}と${p2Name}を中火で軽く炒めます。` },
          { stepNumber: 2, instruction: `水を加えて煮立たせ、アクを取り除いて弱火で煮込みます。`, timerMinutes: 5 },
          { stepNumber: 3, instruction: `調味料を溶き入れ、ひと煮立ちさせて火を止めます。` },
        ],
        nutritionPerServing: { ...estimateNutrition("スープ", r4Mains, r4Seasonings), highlights: "スープに溶け出したビタミンやミネラルも余すことなく摂取できる温活メニューです。" },
        chefTips: "具材を煮る前に油でサッと炒めておくことで、スープにコクとまろやかさが出ます。",
      },
      {
        id: "rec_dyn_5",
        title: `絶品${p1Name}と${p2Name}の特製スタミナ丼`,
        subtitle: "10分でサッと作れる！タレがご飯に染み込むごちそうワンプレート",
        description: `香ばしく炒め煮にした具材をつゆごと熱々のご飯の上に乗せたボリューム満点丼。ランチや忙しい日の夕食に最適です。`,
        cookingTimeMinutes: 10,
        difficulty: "簡単",
        cuisineType: "和風",
        tags: ["丼もの", "10分飯", "がっつり", "大満足"],
        baseServings: 2,
        mainIngredients: r5Mains,
        seasonings: r5Seasonings,
        steps: [
          { stepNumber: 1, instruction: `フライパンで${p1Name}と${p2Name}を香ばしく炒めます。`, timerMinutes: 3 },
          { stepNumber: 2, instruction: `特製タレを加えて強火で煮絡めます。`, timerMinutes: 2 },
          { stepNumber: 3, instruction: `どんぶりに温かいご飯をよそい、具材をつゆごとのせ、お好みで卵やマヨネーズをトッピングします。` },
        ],
        nutritionPerServing: { ...estimateNutrition("丼", r5Mains, r5Seasonings), highlights: "エネルギー代謝を助ける炭水化物とたんぱく質が同時に補給でき、元気が湧いてきます。" },
        chefTips: "ご飯の上に乗せる直前に強火でタレを煮詰めて照りを出すと、まるでお店のような仕上がりに！",
      },
    ];
  }

  return {
    detectedIngredients,
    recipes,
    analysisComment,
    ad_insertion_index: 2,
  };
}
