export interface SampleIngredientPreset {
  id: string;
  name: string;
  categoryName: string;
  description: string;
  ingredients: string[];
  imageUrl: string;
}

export const SAMPLE_PRESETS: SampleIngredientPreset[] = [
  {
    id: "sample_curry_pork_potato",
    name: "豚肉 & じゃがいも & 人参 & 玉ねぎ & カレールー",
    categoryName: "王道カレー・煮込み",
    description: "おうちごはんの不動のNo.1人気！旨味たっぷり王道の具だくさんポークカレー食材。",
    ingredients: ["豚肉（こま切れ・角切り）", "じゃがいも", "玉ねぎ", "人参", "カレールー", "カレー粉"],
    imageUrl: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "sample_white_stew_chicken",
    name: "鶏もも肉 & じゃがいも & 人参 & 玉ねぎ & ホワイトシチュー",
    categoryName: "洋風・シチュー",
    description: "コクと甘みたっぷり！子どもから大人まで大好きな濃厚クリーミーなホワイトシチュー食材。",
    ingredients: ["鶏もも肉", "じゃがいも", "玉ねぎ", "人参", "牛乳", "ホワイトシチュールー", "ブイヨン"],
    imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "sample_demiglace_beef_onion",
    name: "牛こま肉 & 玉ねぎ & しめじ & デミグラスソース",
    categoryName: "洋食・ごちそう",
    description: "洋食屋さんの本格ハヤシライスやビーフシチュー、煮込みハンバーグが作れる贅沢セット。",
    ingredients: ["牛こま切れ肉", "玉ねぎ", "しめじ", "デミグラスソース", "バター", "赤ワイン（料理酒）"],
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "sample_tomato_chicken_consomme",
    name: "鶏もも肉 & トマトソース（トマト缶） & 玉ねぎ & コンソメ",
    categoryName: "イタリアン・煮込み",
    description: "完熟トマトの酸味と鶏肉の旨味が溶け出すチキントマト煮込み（カチャトーラ）食材。",
    ingredients: ["鶏もも肉", "トマトソース（トマト缶）", "玉ねぎ", "ピーマン", "コンソメ", "オリーブ油", "にんにく"],
    imageUrl: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "sample_pork_cabbage",
    name: "豚バラ肉 & キャベツ & 人参",
    categoryName: "定番肉野菜",
    description: "スーパーの特売で買いやすい鉄板の組み合わせ。炒め物や重ね蒸しに最適！",
    ingredients: ["豚バラ薄切り肉", "キャベツ", "人参", "長ネギ"],
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "sample_konjac_pork",
    name: "板こんにゃく & 豚バラ肉 & 長ネギ",
    categoryName: "こんにゃく・加工品",
    description: "食物繊維豊富で低カロリーな板こんにゃく。甘辛雷炒めやガーリックステーキ、煮物に！",
    ingredients: ["板こんにゃく", "豚バラ肉", "長ネギ", "ごま油"],
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "sample_sausage_potaufeu",
    name: "あらびきウインナー & キャベツ & 人参 & コンソメ",
    categoryName: "洋風・スープ",
    description: "ウインナーのジューシーな旨味と野菜の甘みが溶け出すほっこり温まる王道ポトフ食材。",
    ingredients: ["あらびきウインナー", "キャベツ", "人参", "じゃがいも", "コンソメ（ブイヨン）"],
    imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "sample_sausage_yakisoba_cabbage",
    name: "ウインナー & 焼きそば（茹で麺） & キャベツ",
    categoryName: "加工肉・茹で麺",
    description: "スーパーの定番加工肉と3食入り焼きそば茹で麺。香ばしいソース焼きそばに！",
    ingredients: ["あらびきウインナー", "焼きそば（茹で麺）", "キャベツ", "人参"],
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "sample_salmon_mushrooms",
    name: "生鮭切り身 & しめじ & バター & レモン",
    categoryName: "魚・きのこ",
    description: "DHAやEPA豊富な秋鮭ときのこのホイル焼き・ムニエルが作れるセット。",
    ingredients: ["生鮭の切り身", "しめじ", "玉ねぎ", "バター", "レモン"],
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "sample_tofu_mince",
    name: "木綿豆腐 & 豚ひき肉 & ニラ & 長ネギ",
    categoryName: "ヘルシー・中華",
    description: "植物性＆動物性たんぱく質が両方摂れる麻婆豆腐やそぼろ炒め食材。",
    ingredients: ["木綿豆腐", "豚ひき肉", "ニラ", "長ネギ", "生姜"],
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
  }
];

export const PANTRY_STAPLES = [
  { name: "カレールー", icon: "🍛" },
  { name: "カレー粉", icon: "🍛" },
  { name: "ホワイトシチュールー", icon: "🍲" },
  { name: "デミグラスソース", icon: "🥘" },
  { name: "トマトソース（トマト缶）", icon: "🥫" },
  { name: "コンソメ", icon: "🥣" },
  { name: "ブイヨン", icon: "🍲" },
  { name: "ケチャップ", icon: "🍅" },
  { name: "ウスター/中濃ソース", icon: "🍶" },
  { name: "オリーブ油", icon: "🫒" },
  { name: "バター", icon: "🧈" },
  { name: "醤油", icon: "🍶" },
  { name: "酒", icon: "🍶" },
  { name: "みりん", icon: "🍯" },
  { name: "砂糖", icon: "🧂" },
  { name: "味噌", icon: "🥣" },
  { name: "塩・こしょう", icon: "🧂" },
  { name: "ごま油", icon: "🫒" },
  { name: "サラダ油", icon: "🌻" },
  { name: "マヨネーズ", icon: "🥚" },
  { name: "にんにく/生姜", icon: "🧄" },
  { name: "鶏がらスープの素", icon: "🍲" },
  { name: "和風顆粒だし", icon: "🐟" },
  { name: "めんつゆ", icon: "🍶" },
  { name: "ポン酢", icon: "🍋" },
  { name: "オイスターソース", icon: "🦪" }
];
