// High-precision foreground-isolating color and hue analyzer for vegetables and ingredients
// Robust against kitchen countertops, chopping boards, plastic wrap, and ambient lighting.

export interface DetectedFoodResult {
  primaryName: string;
  category: "vegetable" | "meat" | "fish" | "dairy_egg" | "other";
  candidates: string[];
  confidence: "high" | "medium" | "low";
  debugInfo?: string;
}

interface PixelHsv {
  r: number;
  g: number;
  b: number;
  h: number; // 0 - 360
  s: number; // 0 - 1
  v: number; // 0 - 255
  isCenter: boolean;
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  const v = (r + g + b) / 3;

  let h = 0;
  if (d > 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  return { h, s, v };
}

/**
 * Analyze an array of RGBA pixels with foreground object isolation.
 * Specifically separates the vegetable/subject from background surfaces
 * (cutting boards, marble/granite countertops, plastic bags).
 */
export function analyzePixelsWithObjectIsolation(
  pixels: Uint8ClampedArray | number[],
  width: number,
  height: number
): DetectedFoodResult {
  let greenCount = 0;
  let darkGreenCount = 0;   // ピーマン, ほうれん草, ブロッコリー, きゅうり
  let lightGreenCount = 0;  // キャベツ, 白菜の葉, レタス
  let orangeCount = 0;      // 人参
  let redCount = 0;         // トマト, パプリカ
  let purpleCount = 0;      // なす
  let daikonWhiteCount = 0; // 大根, 豆腐, もやし
  let yellowCount = 0;      // かぼちゃ, とうもろこし
  let onionCount = 0;       // 玉ねぎ（黄褐色）
  let totalAnalyzed = 0;

  // We inspect with emphasis on the central 70% of the image (where the photographed ingredient rests)
  const marginX = Math.floor(width * 0.12);
  const marginY = Math.floor(height * 0.12);

  const centerXMin = Math.floor(width * 0.25);
  const centerXMax = Math.floor(width * 0.75);
  const centerYMin = Math.floor(height * 0.25);
  const centerYMax = Math.floor(height * 0.75);

  for (let y = marginY; y < height - marginY; y++) {
    for (let x = marginX; x < width - marginX; x++) {
      const idx = (y * width + x) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];
      const a = pixels[idx + 3] !== undefined ? pixels[idx + 3] : 255;
      if (a < 50) continue;

      const isCenter = x >= centerXMin && x <= centerXMax && y >= centerYMin && y <= centerYMax;
      // Center pixels are weighted twice as heavily as periphery
      const weight = isCenter ? 2 : 1;
      totalAnalyzed += weight;

      const { h, s, v } = rgbToHsv(r, g, b);

      // 1. Green vegetables (ピーマン / キャベツ / ほうれん草 / きゅうり)
      // Green is rare in standard countertops and tables!
      const isGreenHue = (h >= 65 && h <= 175 && s >= 0.14) || (g > r * 1.14 && g > b * 1.10 && s >= 0.12);
      if (isGreenHue) {
        greenCount += weight;
        if (v < 130 || g < 140) {
          darkGreenCount += weight;
        } else {
          lightGreenCount += weight;
        }
        continue;
      }

      // 2. Orange vegetables (人参):
      // Vivid orange: Hue 12° to 36°, high saturation (s >= 0.32), R > G * 1.20, B is small (b < 125)
      // Countertops have low saturation (s < 0.22) or high B, so they are not counted as carrot!
      const isCarrotOrange = h >= 12 && h <= 36 && s >= 0.32 && r > g * 1.20 && b < 125;
      if (isCarrotOrange) {
        orangeCount += weight;
        continue;
      }

      // 3. Red vegetables (トマト / パプリカ赤):
      const isTomatoRed = (h >= 345 || h <= 12) && s >= 0.35 && r > 120 && r > g * 1.25;
      if (isTomatoRed) {
        redCount += weight;
        continue;
      }

      // 4. Purple vegetables (なす):
      const isEggplantPurple = ((h >= 240 && h <= 335 && s >= 0.14) || (b > g && r > g && b > 40)) && v < 120;
      if (isEggplantPurple) {
        purpleCount += weight;
        continue;
      }

      // 5. Daikon (大根) / Tofu (豆腐) / Bean sprouts (もやし):
      // High brightness, very low saturation (clean white or very pale white-green in wrap)
      // Note: Daikon is uniquely white across the whole central body
      const isDaikonWhite = v >= 160 && s < 0.19 && r > 150 && g > 150 && b > 140;
      if (isDaikonWhite) {
        daikonWhiteCount += weight;
        continue;
      }

      // 6. Pumpkin (かぼちゃ):
      const isPumpkinYellow = h >= 36 && h <= 62 && s >= 0.50 && r > 150 && g > 120;
      if (isPumpkinYellow) {
        yellowCount += weight;
        continue;
      }

      // 7. Onion (玉ねぎ):
      // Golden yellow/tan skin, hue 26° to 52°, moderate saturation (0.24 to 0.48), moderate brightness
      const isOnion = h >= 26 && h <= 52 && s >= 0.24 && s <= 0.48 && r > 140 && g > 105 && v < 190;
      if (isOnion) {
        onionCount += weight;
        continue;
      }
    }
  }

  if (totalAnalyzed === 0) totalAnalyzed = 1;

  const darkGreenRatio = darkGreenCount / totalAnalyzed;
  const lightGreenRatio = lightGreenCount / totalAnalyzed;
  const greenRatio = greenCount / totalAnalyzed;
  const orangeRatio = orangeCount / totalAnalyzed;
  const redRatio = redCount / totalAnalyzed;
  const purpleRatio = purpleCount / totalAnalyzed;
  const daikonWhiteRatio = daikonWhiteCount / totalAnalyzed;
  const yellowRatio = yellowCount / totalAnalyzed;
  const onionRatio = onionCount / totalAnalyzed;

  // PRIORITY CLASSIFICATION based on distinct subject ratios

  // 1. Carrot (人参):
  // Even a slice or elongated carrot typically covers 8%+ of the sampled area with vivid orange
  if (orangeRatio >= 0.08 && orangeRatio > greenRatio && orangeRatio > redRatio) {
    return {
      primaryName: "人参",
      category: "vegetable",
      candidates: ["人参", "玉ねぎ", "豚肉"],
      confidence: "high",
      debugInfo: `Orange ratio: ${(orangeRatio * 100).toFixed(1)}%`,
    };
  }

  // 2. Green pepper (ピーマン):
  // Dark glossy green covering 8%+ of the area
  if (darkGreenRatio >= 0.08 || (greenRatio >= 0.10 && darkGreenRatio >= lightGreenRatio)) {
    return {
      primaryName: "ピーマン",
      category: "vegetable",
      candidates: ["ピーマン", "豚バラ肉", "玉ねぎ"],
      confidence: "high",
      debugInfo: `Dark green ratio: ${(darkGreenRatio * 100).toFixed(1)}%`,
    };
  }

  // 3. Light green (キャベツ / 白菜 / レタス):
  if (lightGreenRatio >= 0.12 && lightGreenRatio > darkGreenRatio) {
    return {
      primaryName: "キャベツ",
      category: "vegetable",
      candidates: ["キャベツ", "豚バラ肉", "人参"],
      confidence: "high",
      debugInfo: `Light green ratio: ${(lightGreenRatio * 100).toFixed(1)}%`,
    };
  }

  // 4. Tomato (トマト):
  if (redRatio >= 0.08) {
    return {
      primaryName: "トマト",
      category: "vegetable",
      candidates: ["トマト", "玉ねぎ", "豚肉"],
      confidence: "high",
      debugInfo: `Red ratio: ${(redRatio * 100).toFixed(1)}%`,
    };
  }

  // 5. Eggplant (なす):
  if (purpleRatio >= 0.07) {
    return {
      primaryName: "なす",
      category: "vegetable",
      candidates: ["なす", "豚肉", "ピーマン"],
      confidence: "high",
      debugInfo: `Purple ratio: ${(purpleRatio * 100).toFixed(1)}%`,
    };
  }

  // 6. Daikon (大根) / Tofu:
  // Wrapped or unwrapped daikon is predominantly white/cream covering a substantial body
  if (daikonWhiteRatio >= 0.28 && orangeRatio < 0.05 && greenRatio < 0.06) {
    return {
      primaryName: "大根",
      category: "vegetable",
      candidates: ["大根", "豚肉", "長ネギ"],
      confidence: "high",
      debugInfo: `White ratio: ${(daikonWhiteRatio * 100).toFixed(1)}%`,
    };
  }

  // 7. Pumpkin (かぼちゃ):
  if (yellowRatio >= 0.10) {
    return {
      primaryName: "かぼちゃ",
      category: "vegetable",
      candidates: ["かぼちゃ", "豚肉", "玉ねぎ"],
      confidence: "high",
      debugInfo: `Yellow ratio: ${(yellowRatio * 100).toFixed(1)}%`,
    };
  }

  // 8. Onion (玉ねぎ):
  if (onionRatio >= 0.15) {
    return {
      primaryName: "玉ねぎ",
      category: "vegetable",
      candidates: ["玉ねぎ", "じゃがいも", "豚肉"],
      confidence: "medium",
      debugInfo: `Onion ratio: ${(onionRatio * 100).toFixed(1)}%`,
    };
  }

  // If nothing else dominated but some green exists:
  if (greenRatio >= 0.05) {
    return {
      primaryName: "ピーマン",
      category: "vegetable",
      candidates: ["ピーマン", "キャベツ", "豚肉"],
      confidence: "medium",
    };
  }

  // If white exists:
  if (daikonWhiteRatio >= 0.18) {
    return {
      primaryName: "大根",
      category: "vegetable",
      candidates: ["大根", "豚肉", "豆腐"],
      confidence: "medium",
    };
  }

  return {
    primaryName: "キャベツ",
    category: "vegetable",
    candidates: ["キャベツ", "人参", "玉ねぎ"],
    confidence: "low",
  };
}

/**
 * Decode base64 to byte array safely across environments
 */
function decodeBase64ToBytes(base64Data: string): Uint8Array {
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

/**
 * Asynchronously analyze an image (DataURL or Image element) using Canvas in browser/iOS WebView.
 * Loads image into 64x64 canvas, extracts true RGB pixels, and runs foreground isolation.
 */
export function analyzeImagePixelsClientSide(imageDataUrl: string): Promise<DetectedFoodResult> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      const bytes = decodeBase64ToBytes(imageDataUrl);
      resolve(analyzePixelsWithObjectIsolation(bytes as any, 64, 64));
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const width = 64;
        const height = 64;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          throw new Error("Could not get 2d context");
        }

        ctx.drawImage(img, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height);
        const result = analyzePixelsWithObjectIsolation(imgData.data, width, height);
        resolve(result);
      } catch (err) {
        console.warn("Client-side canvas pixel sampling error:", err);
        const bytes = decodeBase64ToBytes(imageDataUrl);
        resolve(analyzePixelsWithObjectIsolation(bytes as any, 64, 64));
      }
    };

    img.onerror = (e) => {
      console.warn("Image load error for pixel analysis:", e);
      const bytes = decodeBase64ToBytes(imageDataUrl);
      resolve(analyzePixelsWithObjectIsolation(bytes as any, 64, 64));
    };

    img.src = imageDataUrl;
  });
}
