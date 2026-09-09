import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { generateSmartRecipes, detectIngredientsFromImageBuffer } from "./src/utils/recipeGenerator";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser limits for base64 image uploads
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Using fallback recipe generator.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Fallback recipes when offline or API key missing
const fallbackAnalysis = {
  detectedIngredients: [
    { name: "豚バラ肉", category: "meat", confidence: "high" },
    { name: "キャベツ", category: "vegetable", confidence: "high" },
    { name: "長ネギ", category: "vegetable", confidence: "medium" },
    { name: "人参", category: "vegetable", confidence: "medium" }
  ],
  analysisComment: "豚肉と新鮮なキャベツ・野菜が検出されました。ビタミンB群と食物繊維が豊富で、炒め物や煮込みに最適な組み合わせです！",
  recipes: [
    {
      id: "rec_fallback_1",
      title: "豚バラとキャベツのこってり味噌マヨ炒め",
      subtitle: "ご飯が何杯でも進む！10分で作れるスタミナ定番おかず",
      description: "ジューシーな豚バラ肉の旨味が甘みたっぷりのキャベツに染み込む、コク深い味噌マヨ味のスピード炒め物です。",
      cookingTimeMinutes: 12,
      difficulty: "簡単",
      cuisineType: "和風",
      tags: ["フライパン1つ", "ご飯が進む", "ビタミンB1豊富", "時短"],
      baseServings: 2,
      mainIngredients: [
        { name: "豚バラ薄切り肉", baseAmount: 200, unit: "g", note: "ひと口大にカット" },
        { name: "キャベツ", baseAmount: 0.25, unit: "玉 (約200g)", note: "ざく切り" },
        { name: "長ネギ", baseAmount: 0.5, unit: "本", note: "斜め薄切り" },
        { name: "人参", baseAmount: 0.3, unit: "本", note: "短冊切り" }
      ],
      seasonings: [
        { name: "味噌", baseAmount: 1.5, unit: "大さじ" },
        { name: "マヨネーズ", baseAmount: 1.5, unit: "大さじ" },
        { name: "醤油", baseAmount: 1, unit: "小さじ" },
        { name: "みりん", baseAmount: 1, unit: "大さじ" },
        { name: "おろしにんにく", baseAmount: 0.5, unit: "小さじ", isPantryStaple: true },
        { name: "ごま油", baseAmount: 1, unit: "小さじ", isPantryStaple: true }
      ],
      steps: [
        { stepNumber: 1, instruction: "キャベツはざく切り、豚バラ肉は4cm幅に切り、長ネギは斜め薄切り、人参は短冊切りにします。" },
        { stepNumber: 2, instruction: "小さめのボウルで味噌、マヨネーズ、醤油、みりん、おろしにんにくをよく混ぜ合わせておきます。" },
        { stepNumber: 3, instruction: "フライパンにごま油を中火で熱し、豚肉を炒めて色が変わったら人参・長ネギを加えます。", timerMinutes: 3 },
        { stepNumber: 4, instruction: "キャベツを加えて強火でサッと炒め合わせ、キャベツが少ししんなりしたら合わせ調味料を回し入れ、全体に手早く絡めて完成です！", timerMinutes: 2 }
      ],
      nutritionPerServing: {
        calories: 420,
        protein: 18.5,
        fat: 32.0,
        carbohydrates: 12.4,
        saltEquivalent: 1.8,
        highlights: "豚肉のビタミンB1とキャベツのビタミンU（キャベジン）で胃腸を労りつつ疲労回復に効果的です。"
      },
      chefTips: "キャベツは強火で短時間で炒めるとシャキシャキ感が残り、水っぽくなりません。"
    },
    {
      id: "rec_fallback_2",
      title: "豚肉とキャベツの重ね蒸し 和風ポン酢仕立て",
      subtitle: "油を使わずヘルシー！鍋に重ねてほったらかし調理",
      description: "豚肉の脂とキャベツの水分だけで蒸し上げる究極の簡単ヘルシーレシピ。さっぱりポン酢でペロリと食べられます。",
      cookingTimeMinutes: 15,
      difficulty: "簡単",
      cuisineType: "和風",
      tags: ["油不使用", "低カロリー", "ほったらかし", "ヘルシー"],
      baseServings: 2,
      mainIngredients: [
        { name: "豚バラまたは豚ロース薄切り肉", baseAmount: 180, unit: "g" },
        { name: "キャベツ", baseAmount: 0.3, unit: "玉 (約250g)" },
        { name: "長ネギ", baseAmount: 0.5, unit: "本", note: "小口切り" }
      ],
      seasonings: [
        { name: "料理酒", baseAmount: 2, unit: "大さじ" },
        { name: "和風顆粒だし", baseAmount: 0.5, unit: "小さじ" },
        { name: "塩・黒こしょう", baseAmount: 1, unit: "少々", isPantryStaple: true },
        { name: "ポン酢しょうゆ", baseAmount: 2, unit: "大さじ", note: "仕上げ用" },
        { name: "白いりごま", baseAmount: 1, unit: "小さじ", isPantryStaple: true }
      ],
      steps: [
        { stepNumber: 1, instruction: "キャベツは一口大にちぎるかざく切りにします。豚肉は長さを半分に切ります。" },
        { stepNumber: 2, instruction: "フライパンまたは浅型の鍋に、キャベツと豚肉を交互に敷き詰めます。" },
        { stepNumber: 3, instruction: "料理酒と和風顆粒だし、塩こしょうを全体に回しかけ、フタをして弱中火で蒸し焼きにします。", timerMinutes: 10, tip: "フタの隙間から湯気が出て豚肉に火が通るまで蒸します。" },
        { stepNumber: 4, instruction: "小口切りの長ネギと白ごまを散らし、ポン酢しょうゆを添えて熱々をいただきます。" }
      ],
      nutritionPerServing: {
        calories: 310,
        protein: 19.8,
        fat: 21.5,
        carbohydrates: 8.6,
        saltEquivalent: 1.4,
        highlights: "蒸すことで豚肉の余分な脂が落ち、低カロリーながら満足感抜群。水溶性ビタミンも逃さず摂取できます。"
      },
      chefTips: "白ワインやレモン汁を少し足すと洋風のワイン蒸しにもアレンジできます。"
    },
    {
      id: "rec_fallback_3",
      title: "豚肉とキャベツの本格回鍋肉（ホイコーロー）",
      subtitle: "シャキシャキ野菜と甜麺醤の香ばしい中華の王道",
      description: "甜麺醤（または赤味噌）と豆板醤をきかせたコク旨な特製ダレ。シャキシャキのキャベツの甘みが引き立ちます。",
      cookingTimeMinutes: 15,
      difficulty: "普通",
      cuisineType: "中華",
      tags: ["本格中華", "野菜たっぷり", "お弁当にも"],
      baseServings: 2,
      mainIngredients: [
        { name: "豚バラ薄切り肉", baseAmount: 200, unit: "g" },
        { name: "キャベツ", baseAmount: 0.25, unit: "玉" },
        { name: "長ネギ", baseAmount: 0.5, unit: "本" },
        { name: "人参", baseAmount: 0.3, unit: "本" }
      ],
      seasonings: [
        { name: "甜麺醤（または味噌）", baseAmount: 1.5, unit: "大さじ" },
        { name: "豆板醤", baseAmount: 0.5, unit: "小さじ", note: "辛さはお好みで調整" },
        { name: "醤油", baseAmount: 1, unit: "大さじ" },
        { name: "酒", baseAmount: 1, unit: "大さじ" },
        { name: "砂糖", baseAmount: 1, unit: "小さじ" },
        { name: "おろし生姜・にんにく", baseAmount: 0.5, unit: "小さじ" }
      ],
      steps: [
        { stepNumber: 1, instruction: "キャベツは大きめの乱切り、豚肉は一口大、人参は薄切り、長ネギは乱切りにします。" },
        { stepNumber: 2, instruction: "調味料（甜麺醤、豆板醤、醤油、酒、砂糖、生姜、にんにく）を小鉢で混ぜ合わせます。" },
        { stepNumber: 3, instruction: "フライパンで豚肉を香ばしく炒めて一度取り出し、同じ油でキャベツと人参を強火で1分半サッと炒めます。", timerMinutes: 2 },
        { stepNumber: 4, instruction: "豚肉をフライパンに戻し、合わせ調味料を一気に加えて強火で手早く炒め絡めます。", timerMinutes: 1 }
      ],
      nutritionPerServing: {
        calories: 395,
        protein: 17.2,
        fat: 28.5,
        carbohydrates: 14.8,
        saltEquivalent: 2.1,
        highlights: "発酵調味料の深いコクとビタミンC・Eの抗酸化作用で免疫力アップが期待できます。"
      },
      chefTips: "野菜を先に強火で短時間炒めてから肉とタレを合わせるのが、中華屋さんのシャキシャキ食感の秘訣です。"
    },
    {
      id: "rec_fallback_4",
      title: "具だくさん食べる豚汁 ほっこり生姜味噌仕立て",
      subtitle: "豚肉とキャベツの旨味が溶け出す！身体の芯から温まる満足おかず汁",
      description: "たっぷりのキャベツと豚肉をごま油で炒めてから煮込むことで、コクと甘みが格段にアップするごちそう豚汁です。",
      cookingTimeMinutes: 18,
      difficulty: "簡単",
      cuisineType: "和風",
      tags: ["温活・身体ポカポカ", "具だくさんスープ", "栄養満点", "作り置き"],
      baseServings: 2,
      mainIngredients: [
        { name: "豚バラ薄切り肉", baseAmount: 150, unit: "g", note: "一口大に切る" },
        { name: "キャベツ", baseAmount: 0.2, unit: "玉 (約150g)", note: "ざく切り" },
        { name: "人参", baseAmount: 0.5, unit: "本", note: "いちょう切り" },
        { name: "長ネギ", baseAmount: 0.5, unit: "本", note: "小口切り" }
      ],
      seasonings: [
        { name: "味噌", baseAmount: 2, unit: "大さじ" },
        { name: "和風顆粒だし", baseAmount: 1, unit: "小さじ" },
        { name: "水", baseAmount: 450, unit: "ml" },
        { name: "おろし生姜", baseAmount: 0.5, unit: "小さじ", isPantryStaple: true },
        { name: "ごま油", baseAmount: 1, unit: "小さじ", isPantryStaple: true }
      ],
      steps: [
        { stepNumber: 1, instruction: "鍋にごま油を熱し、豚肉と人参を中火で2分ほど炒めます。" },
        { stepNumber: 2, instruction: "水と和風顆粒だしを加え、煮立ったらアクを取り、キャベツを加えて弱火で6分煮ます。", timerMinutes: 6 },
        { stepNumber: 3, instruction: "火を弱めて味噌を溶き入れ、おろし生姜と長ネギを加えてひと煮立ち直前に火を止めます。" }
      ],
      nutritionPerServing: {
        calories: 245,
        protein: 14.2,
        fat: 16.8,
        carbohydrates: 10.5,
        saltEquivalent: 1.9,
        highlights: "生姜のショウガオールと豚肉のビタミンB群で血行促進・代謝アップを促します。"
      },
      chefTips: "具材を先にごま油でサッと炒めるのが、スープに深いコクを出す最大のポイントです。"
    },
    {
      id: "rec_fallback_5",
      title: "豚肉とキャベツの甘辛スタミナ温玉のせ丼",
      subtitle: "10分でがっつり大満足！とろ〜り温玉が絡む極上スピード丼",
      description: "甘辛い醤油みりんダレをしっかり絡めた豚肉と千切りキャベツをご飯にのせ、卵をトッピングした絶品どんぶりです。",
      cookingTimeMinutes: 10,
      difficulty: "簡単",
      cuisineType: "和風",
      tags: ["丼もの", "がっつり男子飯", "時短10分", "スタミナ満点"],
      baseServings: 2,
      mainIngredients: [
        { name: "豚バラ肉（またはこま切れ）", baseAmount: 200, unit: "g" },
        { name: "キャベツ", baseAmount: 0.25, unit: "玉", note: "太めの千切り" },
        { name: "温かいご飯", baseAmount: 360, unit: "g (どんぶり2杯分)" },
        { name: "温泉卵（または生卵）", baseAmount: 2, unit: "個" }
      ],
      seasonings: [
        { name: "醤油", baseAmount: 2, unit: "大さじ" },
        { name: "みりん", baseAmount: 2, unit: "大さじ" },
        { name: "砂糖", baseAmount: 1, unit: "小さじ" },
        { name: "酒", baseAmount: 1, unit: "大さじ" },
        { name: "おろしにんにく", baseAmount: 0.5, unit: "小さじ", isPantryStaple: true },
        { name: "白いりごま・一味唐辛子", baseAmount: 1, unit: "適量" }
      ],
      steps: [
        { stepNumber: 1, instruction: "合わせ調味料（醤油、みりん、砂糖、酒、にんにく）を混ぜておきます。" },
        { stepNumber: 2, instruction: "フライパンで豚肉を香ばしく焼き、色が変わったらタレを加えて煮絡めます。", timerMinutes: 3 },
        { stepNumber: 3, instruction: "どんぶりに温かいご飯を盛り、千切りキャベツを敷き詰めて豚肉をタレごとのせます。" },
        { stepNumber: 4, instruction: "中央に温泉卵を落とし、白ごまとお好みで一味唐辛子を振って完成です。" }
      ],
      nutritionPerServing: {
        calories: 580,
        protein: 23.5,
        fat: 25.0,
        carbohydrates: 65.0,
        saltEquivalent: 2.2,
        highlights: "豚肉×卵の高たんぱくコンビネーションで、運動後や疲れた日のエネルギー補給に最適です。"
      },
      chefTips: "ご飯の上に生の千切りキャベツをたっぷり敷くと、タレが染みてシャキシャキの美味しさを楽しめます。"
    }
  ],
  ad_insertion_index: 2
};

const RECIPE_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    ad_insertion_index: {
      type: Type.INTEGER,
      description: "アプリがレシピリスト内にネイティブ広告を挿入するべき0から始まるインデックス。常に「2」（3番目のレシピの後）を指定します。",
    },
    detectedIngredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "食材の名前 (例: 豚バラ肉, キャベツ, トマト)" },
          category: {
            type: Type.STRING,
            description: "食材のカテゴリ: 'meat', 'vegetable', 'fish', 'dairy_egg', 'grain', 'seasoning', 'other'",
          },
          confidence: { type: Type.STRING, description: "'high', 'medium', 'low'" },
        },
        required: ["name", "category"],
      },
      description: "写真から認識された食材リスト",
    },
    analysisComment: {
      type: Type.STRING,
      description: "認識された食材の特徴や相性に関する温かいコメント・アドバイス",
    },
    recipes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "ユニークなID (例: rec_1)" },
          title: { type: Type.STRING, description: "魅力的な料理名" },
          subtitle: { type: Type.STRING, description: "料理の特徴や魅力を表すサブタイトル" },
          description: { type: Type.STRING, description: "料理の簡単な説明" },
          cookingTimeMinutes: { type: Type.INTEGER, description: "調理時間の目安 (分)" },
          difficulty: { type: Type.STRING, description: "'簡単', '普通', '少し本格的'" },
          cuisineType: { type: Type.STRING, description: "'和風', '洋風', '中華', 'エスニック', 'その他'" },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "タグ (例: '時短', 'フライパン1つ', '低カロリー', '作り置き')",
          },
          baseServings: {
            type: Type.INTEGER,
            description: "基準となる人数 (基本は 2 人前を基準として数値を記載)",
          },
          mainIngredients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "食材名" },
                baseAmount: { type: Type.NUMBER, description: "基準人数分の数量 (数値のみ、例: 200, 0.5, 2)" },
                unit: { type: Type.STRING, description: "単位 (例: 'g', '個', '本', '枚', '丁', '袋')" },
                note: { type: Type.STRING, description: "下処理メモなど (例: '一口大にカット')" },
                isPantryStaple: { type: Type.BOOLEAN, description: "一般的な常備品かどうか" },
              },
              required: ["name", "baseAmount", "unit"],
            },
            description: "主材料リスト",
          },
          seasonings: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "調味料名 (例: 醤油, みりん, 味噌, 塩こしょう)" },
                baseAmount: { type: Type.NUMBER, description: "基準人数分の数量 (数値のみ、例: 1, 1.5, 0.5)" },
                unit: { type: Type.STRING, description: "単位 (例: '大さじ', '小さじ', '少々', '適量', 'g', 'ml')" },
                note: { type: Type.STRING, description: "調味料の補足" },
                isPantryStaple: { type: Type.BOOLEAN, description: "常備調味料かどうか" },
              },
              required: ["name", "baseAmount", "unit"],
            },
            description: "調味料リスト",
          },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                stepNumber: { type: Type.INTEGER, description: "手順番号 (1, 2, 3...)" },
                instruction: { type: Type.STRING, description: "手順の分かりやすい説明" },
                timerMinutes: { type: Type.INTEGER, description: "タイマーが必要な場合の分数 (任意)" },
                tip: { type: Type.STRING, description: "この手順でのコツや注意点" },
              },
              required: ["stepNumber", "instruction"],
            },
            description: "作り方の手順",
          },
          nutritionPerServing: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.INTEGER, description: "1人前あたりのカロリー (kcal)" },
              protein: { type: Type.NUMBER, description: "1人前あたりのたんぱく質 (g)" },
              fat: { type: Type.NUMBER, description: "1人前あたりの脂質 (g)" },
              carbohydrates: { type: Type.NUMBER, description: "1人前あたりの炭水化物 (g)" },
              saltEquivalent: { type: Type.NUMBER, description: "1人前あたりの食塩相当量 (g)" },
              highlights: { type: Type.STRING, description: "栄養面でのポイント・健康効果解説" },
            },
            required: ["calories", "protein", "fat", "carbohydrates", "saltEquivalent"],
            description: "1人前あたりの栄養情報",
          },
          chefTips: { type: Type.STRING, description: "プロのアドバイスや美味しく仕上げるコツ、保存方法" },
        },
        required: [
          "id",
          "title",
          "subtitle",
          "description",
          "cookingTimeMinutes",
          "difficulty",
          "cuisineType",
          "tags",
          "baseServings",
          "mainIngredients",
          "seasonings",
          "steps",
          "nutritionPerServing",
          "chefTips",
        ],
      },
      description: "提案する厳選された合計5通りのレシピリスト",
    },
  },
  required: ["detectedIngredients", "recipes", "analysisComment", "ad_insertion_index"],
};

// Schema for live/quick ingredient & OCR package detection
const QUICK_DETECT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    detectedName: {
      type: Type.STRING,
      description: "特定された主要食材・商品名（例: 板こんにゃく、豚バラ肉、焼きそば麺、生鮭、油揚げ 等）",
    },
    category: {
      type: Type.STRING,
      description: "meat | fish | vegetable | processed | other",
    },
    allDetected: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "画像から検出されたすべての食材・商品名",
    },
    ocrText: {
      type: Type.STRING,
      description: "パッケージ・ラベル・シールから読み取った主要な印刷文字（例: 天然水仕込み 板こんにゃく）",
    },
    confidence: {
      type: Type.STRING,
      description: "high | medium | low",
    },
  },
  required: ["detectedName", "allDetected", "category"],
};

// API Endpoint 0: Quick Live Ingredient & Package OCR Recognition
app.post("/api/quick-detect-ingredient", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "画像データが提供されていません。" });
    }

    let cleanBase64 = "";
    let finalMimeType = mimeType || "image/jpeg";

    if (typeof imageBase64 === "string" && (imageBase64.startsWith("http://") || imageBase64.startsWith("https://"))) {
      try {
        const fetchRes = await fetch(imageBase64);
        const arrayBuf = await fetchRes.arrayBuffer();
        cleanBase64 = Buffer.from(arrayBuf).toString("base64");
        finalMimeType = fetchRes.headers.get("content-type") || "image/jpeg";
      } catch (fetchErr) {
        console.warn("Failed to fetch image URL for quick detect:", fetchErr);
        return res.json({
          detectedName: "食材写真",
          category: "other",
          allDetected: ["食材写真"],
          confidence: "low",
          ocrText: "",
        });
      }
    } else if (typeof imageBase64 === "string") {
      cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    }

    const ai = getGeminiClient();
    if (!ai) {
      const visualIngredients = cleanBase64 ? detectIngredientsFromImageBuffer(cleanBase64) : ["食材写真"];
      const primary = visualIngredients[0] || "食材写真";
      return res.json({
        detectedName: primary,
        category: "other",
        allDetected: visualIngredients,
        confidence: "medium",
        ocrText: "",
      });
    }

    const prompt = `あなたは食材・食品パッケージのマルチモーダルOCRおよび画像認識の最高峰エキスパートです。
提供された画像に写っている食材、または【食品パッケージに書かれた商品名（毛筆体・行書体・墨文字・筆文字ロゴ・和風デザインフォント・ラベルシール・値札・印字）】を正確に読み取り、主役となる食材・商品名を特定してください。

【文字認識・筆文字・デザイン書体の最重要方針】
1. 日本の伝統食品や加工食品（例: 「板こんにゃく」「こんにゃく」「生芋こんにゃく」「白滝」「しらたき」「きざみあげ」「うすあげ」「油揚げ」「厚揚げ」「絹ごし豆腐」「木綿豆腐」「あらびきウインナー」「ロースハム」「ベーコン」「焼きそば」「うどん」「そば」「ラーメン」「納豆」「ちくわ」「はんぺん」「かまぼこ」など）は、パッケージに毛筆体や崩し字、個性的な筆文字ロゴで大きく印刷されていることが非常に多いです。書体の癖に関わらず文字の筆跡と文脈を正確に解読してください。
2. パッケージに印刷されている副見出し（例: 「天然水仕込み」「国産」「おでん・煮物に」「サッと水洗いするだけで」等）や、袋の中に写っている中身の質感・外見（例: 黒い粒の入った半透明の板状こんにゃく等）からも総合的に食品名を特定してください。
3. スーパーの精肉・鮮魚・カット野菜の値札ラベルシール（例: 「豚バラ肉」「豚ロース生姜焼き用」「牛肩ロース」「牛カルビ」「真鯛切り身」「生鮭」「カットキャベツ」等）の印字文字も高精度に解読してください。
4. 主役となる食材名（例: 「板こんにゃく」「豚バラ肉」「あらびきウインナー」「焼きそば麺」等）を detectedName として返してください。決して適当な「卵」などの無関係な食材を返さないでください。`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: [
        {
          inlineData: {
            mimeType: finalMimeType || "image/jpeg",
            data: cleanBase64,
          },
        },
        {
          text: prompt,
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: QUICK_DETECT_SCHEMA,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from Gemini API");
    }

    const parsedData = JSON.parse(responseText);
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error in quick-detect-ingredient:", error?.message || error);
    res.json({
      detectedName: "食材写真",
      category: "other",
      allDetected: ["食材写真"],
      confidence: "low",
      ocrText: "",
    });
  }
});

// API Endpoint 1: Analyze Food Image & Generate Recipes
app.post("/api/analyze-food-image", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", preferences = {} } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "画像データが提供されていません。" });
    }

    // Handle both data URI / raw base64 and HTTP image URLs (e.g., sample presets)
    let cleanBase64 = "";
    let finalMimeType = mimeType || "image/jpeg";

    if (typeof imageBase64 === "string" && (imageBase64.startsWith("http://") || imageBase64.startsWith("https://"))) {
      try {
        const fetchRes = await fetch(imageBase64);
        const arrayBuf = await fetchRes.arrayBuffer();
        cleanBase64 = Buffer.from(arrayBuf).toString("base64");
        finalMimeType = fetchRes.headers.get("content-type") || "image/jpeg";
      } catch (fetchErr) {
        console.warn("Failed to fetch image URL, using smart recipe generator:", fetchErr);
        const dynamicResult = generateSmartRecipes([], preferences);
        return res.json(dynamicResult);
      }
    } else if (typeof imageBase64 === "string") {
      cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    }

    const visualIngredients = cleanBase64 ? detectIngredientsFromImageBuffer(cleanBase64) : [];

    const ai = getGeminiClient();
    if (!ai) {
      const dynamicResult = generateSmartRecipes(visualIngredients, preferences);
      return res.json(dynamicResult);
    }

    const preferenceText = [
      preferences.time ? `調理時間希望: ${preferences.time}` : "",
      preferences.cuisine ? `料理ジャンル希望: ${preferences.cuisine}` : "",
      preferences.mood ? `テーマ/気分: ${preferences.mood}` : "",
      preferences.customIngredients && preferences.customIngredients.length > 0 ? `指定食材: ${preferences.customIngredients.join(", ")}` : "",
      preferences.staples && preferences.staples.length > 0 ? `家にある調味料（厳守）: ${preferences.staples.join(", ")}` : "",
      preferences.detectedHint ? `ユーザー確認済みの主役食材: ${preferences.detectedHint}` : "",
    ]
      .filter(Boolean)
      .join(", ");

    const prompt = `あなたは一流の料理研究家兼管理栄養士です。
提供された画像に写っている食材、および【スーパーの食品パックに貼られた値札ラベル・商品名シール・パッケージ印刷文字（例: 「カレールー」「カレー粉」「ホワイトシチュールー」「デミグラスソース」「トマトソース（トマト缶）」「コンソメ」「ブイヨン」「板こんにゃく」「白滝」「豚バラうす切り」「豚ロース生姜焼き用」「牛肩ロース」「牛カルビ」「真鯛切り身」「生鮭」「カットキャベツ」「ロースハム」「ハーフベーコン」「あらびきウインナー」「ソーセージ」「サラダチキン」「焼きそば（茹で麺）」「うどん」「そば」「中華麺・ラーメン」「きざみあげ」「うすあげ（油揚げ）」「あつあげ」「ちくわ」「カニカマ」「絹ごし豆腐」等）】をOCR・マルチモーダル画像認識し、商品名・部位名・食材名を高精度に読み取って特定してください。

【文字認識・筆文字・デザイン書体の最重要方針】
- 日本の伝統食品や加工食品、調味料・ルー（例: 「カレールー」「カレー粉」「ホワイトシチュールー」「デミグラスソース」「トマト缶」「コンソメ」「板こんにゃく」「白滝」「きざみあげ」「うすあげ」「油揚げ」「厚揚げ」「絹ごし豆腐」「木綿豆腐」「あらびきウインナー」「ロースハム」「ベーコン」「焼きそば」「うどん」「そば」「ラーメン」「納豆」など）は、パッケージに個性的なフォントや筆文字ロゴで大きく印刷されていることが多いです。正確に品名を解読してください。
- 外見から判別しにくい生の切り身や生肉、カット野菜、加工肉・加工食品・麺類、ルー・調味料でも、ラベルやパッケージに印字・貼付されている文字情報（品名、商品名、部位名、用途）を最優先で解読し、正確な食材名（例: 「カレールー」「カレー粉」「ホワイトシチュー」「デミグラスソース」「トマトソース」「コンソメ」「ブイヨン」「豚バラ肉」「サラダチキン」等）としてdetectedIngredientsに認識してください。
- 複数種類の食材やラベルが写っている場合は、写っているすべての食材を漏らさずリストアップしてください。

その食材を主役に、日本の家庭で手軽かつ美味しく作れるレシピを【厳選された合計5種類（5通り）】提案してください。

【最重要！王道・定番料理の最優先原則】
★「カレールー」「カレー粉」「ホワイトシチュー（シチュールー）」「デミグラスソース」「トマトソース（トマト缶）」「コンソメ」「ブイヨン」等のルー・洋風ソース・調味料が指定または認識された場合、あるいは肉・玉ねぎ・人参・じゃがいも等の定番具材が揃っている場合は、奇をてらわずに【誰もが一番食べたい王道・定番の代表レシピ】を必ず第1品目（トップ）に提案してください！
  - カレールー/カレー粉がある場合 → 【第1品目は必ず『おうちの王道定番カレー（ポークカレー/チキンカレー/ビーフカレー/キーマカレー等）』】を提案し、2品目以降にドライカレー、カレーうどん、焼きカレードリア、カレースープ等の魅力的なバリエーションを展開すること。決してカレーそのものを除外しないでください。
  - ホワイトシチュールーがある場合 → 【第1品目は必ず『王道のホワイトクリームシチュー』】、続いてパングラタン、クリーム煮込み、スープ等。
  - デミグラスソースがある場合 → 【第1品目は必ず『洋食屋さんの王道ハヤシライス』または『本格デミグラス煮込みハンバーグ/ビーフシチュー』】。
  - トマトソース/トマト缶がある場合 → 【第1品目は必ず『鶏肉と野菜の王道トマト煮込み（カチャトーラ）』または『濃厚トマトパスタ』】。
  - コンソメ/ブイヨンがある場合 → 【第1品目は必ず『お肉/ウインナーと野菜の王道ポトフ』または『具だくさんコンソメスープ』】。

【重要要件】
1. ラベルやパッケージから読み取った正確な食材名（およびユーザー指定食材）を、すべてのレシピのmainIngredientsに必ず100%活用してください。
2. 加工肉（ハム、ベーコン、ウインナー等）や麺類、ルー・調味料（カレールー、シチュー、デミグラス、トマトソース、コンソメ、ブイヨン等）が写っている場合は、その特性を最大限に活かした美味しいレシピを提案してください。
3. 必ず【5種類】のレシピオブジェクトを配列として出力してください。
4. 人数（何人前）の計算を正確に行うため、食材・調味料の「baseAmount」（数値のみ）と「unit」（単位）を明確に分けて定義してください。基準人数は「baseServings: 2」（2人前）として数値を入力してください。
5. 1人前あたりのカロリー（kcal）、たんぱく質（g）、脂質（g）、炭水化物（g）、食塩相当量（g）を管理栄養士の観点から正確に算出して記載してください。
6. 調理手順（steps）は初心者でもわかりやすく、火加減や目安時間を明記してください。煮込みや蒸し焼きのタイマー分数も指定してください。
7. 調味料は、ユーザーが指定した家にある調味料（${preferences.staples && preferences.staples.length > 0 ? preferences.staples.join(", ") : "一般的な基本調味料"}）を最優先・厳守で使用してください。
8. 【広告挿入用インデックスの指定（ad_insertion_index）】: アプリ側で5つのレシピの「3番目と4番目のレシピの間」にネイティブ広告（PR）を動的に、かつ自然に挿入できるよう、出力するJSONのルート階層に必ず "ad_insertion_index": 2（0から数えて3番目の要素の直後）を含めて出力してください。
${preferenceText ? `【ユーザーの希望条件】: ${preferenceText}` : ""}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: [
        {
          inlineData: {
            mimeType: finalMimeType || "image/jpeg",
            data: cleanBase64,
          },
        },
        {
          text: prompt,
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: RECIPE_RESPONSE_SCHEMA,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Gemini APIから空の応答が返されました。");
    }

    const parsedData = JSON.parse(responseText);
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error analyzing image with Gemini API:", error?.message || error);
    const cleanBase64 = (req.body?.imageBase64 || "").replace(/^data:image\/\w+;base64,/, "");
    const visualIngredients = cleanBase64 ? detectIngredientsFromImageBuffer(cleanBase64) : [];
    
    const dynamicResult = generateSmartRecipes(visualIngredients, req.body?.preferences || {});
    res.json({
      ...dynamicResult,
      isOfflineMode: true,
      analysisComment: `${dynamicResult.analysisComment}（※AI高速推奨モードで生成）`,
    });
  }
});

// API Endpoint 2: Generate Recipes from Text Ingredients
app.post("/api/generate-recipes", async (req, res) => {
  try {
    const { ingredients = [], preferences = {} } = req.body;

    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ error: "食材が入力されていません。" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      const dynamicResult = generateSmartRecipes(ingredients, preferences);
      return res.json(dynamicResult);
    }

    const preferenceText = [
      preferences.time ? `調理時間希望: ${preferences.time}` : "",
      preferences.cuisine ? `料理ジャンル希望: ${preferences.cuisine}` : "",
      preferences.mood ? `テーマ/気分: ${preferences.mood}` : "",
      preferences.staples && preferences.staples.length > 0 ? `家にある調味料（厳守）: ${preferences.staples.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join(", ");

    const prompt = `あなたは一流の料理研究家兼管理栄養士です。
ユーザーが指定した以下の【指定食材】をすべて使って、日本の家庭で作れる美味しいレシピを【厳選された合計5種類（5通り）】提案してください。

【指定食材（必須）】: ${ingredients.join(", ")}
${preferenceText ? `【ユーザーの希望条件】: ${preferenceText}` : ""}

【最重要！王道・定番料理の最優先原則】
★「カレールー」「カレー粉」「ホワイトシチュー（シチュールー）」「デミグラスソース」「トマトソース（トマト缶）」「コンソメ」「ブイヨン」等のルー・洋風ソース・調味料が指定食材または調味料に含まれる場合、あるいは肉・玉ねぎ・人参・じゃがいも等の定番カレー/シチュー食材が含まれる場合は、奇をてらわずに【誰もが一番食べたい王道・定番の代表レシピ】を必ず第1品目（トップ）に提案してください！
  - カレールー/カレー粉がある場合 → 【第1品目は必ず『おうちの王道定番カレー（ポークカレー/チキンカレー/ビーフカレー/キーマカレー等）』】を提案し、2品目以降にドライカレー、カレーうどん、焼きカレードリア、カレースープ等の魅力的なバリエーションを展開すること。決してカレーそのものを除外しないでください。
  - ホワイトシチュールーがある場合 → 【第1品目は必ず『王道のホワイトクリームシチュー』】、続いてパングラタン、クリーム煮込み、スープ等。
  - デミグラスソースがある場合 → 【第1品目は必ず『洋食屋さんの王道ハヤシライス』または『本格デミグラス煮込みハンバーグ/ビーフシチュー』】。
  - トマトソース/トマト缶がある場合 → 【第1品目は必ず『鶏肉と野菜の王道トマト煮込み（カチャトーラ）』または『濃厚トマトパスタ』】。
  - コンソメ/ブイヨンがある場合 → 【第1品目は必ず『お肉/ウインナーと野菜の王道ポトフ』または『具だくさんコンソメスープ』】。

【最重要・厳守要件】
1. 指定された食材（${ingredients.join(", ")}）は、提案する【すべてのレシピ】のmainIngredientsおよびdetectedIngredientsに必ず100%反映させてください。勝手に別の食材に変えたり省略してはいけません（例: 山芋、豚バラ肉、キャベツ、こんにゃく、カレールー等）。
2. 調味料は、ユーザーが指定した家にある調味料（${preferences.staples && preferences.staples.length > 0 ? preferences.staples.join(", ") : "一般的な基本調味料"}）のみを最優先・厳守で活用してください。ユーザーが持っていない調味料を必須材料にしないでください。
3. 必ず【5種類】のレシピオブジェクトを配列として出力してください。
4. 人数（何人前）の計算を正確に行うため、食材・調味料の「baseAmount」（数値のみ）と「unit」（単位）を明確に分けて定義してください。基準人数は「baseServings: 2」（2人前）として数値を入力してください。
5. 1人前あたりのカロリー（kcal）、たんぱく質（g）、脂質（g）、炭水化物（g）、食塩相当量（g）を管理栄養士の視点で正確に算出して記載してください。
6. 調理手順（steps）は初心者でもわかりやすく、火加減や目安時間を明記してください。煮込みや蒸し焼きのタイマー分数も指定してください。
7. 【広告挿入用インデックスの指定（ad_insertion_index）】: アプリ側で5つのレシピの「3番目と4番目のレシピの間」にネイティブ広告（PR）を動的に、かつ自然に挿入できるよう、出力するJSONのルート階層に必ず "ad_insertion_index": 2（0から数えて3番目の要素の直後）を含めて出力してください。`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RECIPE_RESPONSE_SCHEMA,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Gemini APIから空の応答が返されました。");
    }

    const parsedData = JSON.parse(responseText);
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error generating recipes with Gemini API:", error?.message || error);
    const dynamicResult = generateSmartRecipes(req.body?.ingredients || [], req.body?.preferences || {});
    res.json({
      ...dynamicResult,
      isOfflineMode: true,
      analysisComment: `${dynamicResult.analysisComment}（※AI高速推奨モードで生成）`,
    });
  }
});

// In-memory sync sessions for phone-to-PC camera linkage
interface SyncSession {
  id: string;
  createdAt: number;
  status: "waiting" | "connected" | "uploaded";
  imageData?: string;
  mimeType?: string;
  preferences?: any;
}

const syncSessions = new Map<string, SyncSession>();

// Cleanup stale sessions every 10 mins
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of syncSessions.entries()) {
    if (now - session.createdAt > 30 * 60 * 1000) {
      syncSessions.delete(id);
    }
  }
}, 10 * 60 * 1000);

// API: Create sync session (Called by PC)
app.post("/api/sync/create-session", (req, res) => {
  const sessionId = "sync_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  syncSessions.set(sessionId, {
    id: sessionId,
    createdAt: Date.now(),
    status: "waiting",
  });
  res.json({ sessionId, status: "waiting" });
});

// API: Check sync session status (Called by PC polling)
app.get("/api/sync/status/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const session = syncSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ error: "セッションが見つかりません。期限切れの可能性があります。" });
  }
  res.json({
    status: session.status,
    hasImage: !!session.imageData,
    imageData: session.imageData,
    mimeType: session.mimeType,
    preferences: session.preferences,
  });
});

// API: Upload image from smartphone (Called by Phone)
app.post("/api/sync/upload-photo", (req, res) => {
  const { sessionId, imageBase64, mimeType = "image/jpeg", preferences = {} } = req.body;
  if (!sessionId || !imageBase64) {
    return res.status(400).json({ error: "sessionId と imageBase64 が必要です。" });
  }

  const session = syncSessions.get(sessionId);
  if (!session) {
    // If not found, create it anyway so mobile upload doesn't fail
    syncSessions.set(sessionId, {
      id: sessionId,
      createdAt: Date.now(),
      status: "uploaded",
      imageData: imageBase64,
      mimeType,
      preferences,
    });
    return res.json({ success: true, status: "uploaded" });
  }

  session.status = "uploaded";
  session.imageData = imageBase64;
  session.mimeType = mimeType;
  session.preferences = preferences;
  syncSessions.set(sessionId, session);

  res.json({ success: true, status: "uploaded" });
});

// API: Ping connected from smartphone
app.post("/api/sync/connect", (req, res) => {
  const { sessionId } = req.body;
  if (sessionId && syncSessions.has(sessionId)) {
    const s = syncSessions.get(sessionId)!;
    if (s.status === "waiting") {
      s.status = "connected";
    }
  }
  res.json({ success: true });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === "true" ? false : undefined,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
