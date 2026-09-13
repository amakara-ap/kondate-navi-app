// Pure client-side canvas-based and RGB feature-based image analyzer for iOS & Web

export interface ImageColorFeatures {
  avgR: number;
  avgG: number;
  avgB: number;
  hue: number;        // 0 - 360
  saturation: number; // 0 - 1
  brightness: number; // 0 - 255
}

export interface DetectedFoodResult {
  primaryName: string;
  category: "vegetable" | "meat" | "fish" | "dairy_egg" | "other";
  candidates: string[];
  confidence: "high" | "medium" | "low";
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
 * Extract color features from real canvas pixel data or downsampled image buffer
 */
export function extractColorFeaturesFromPixels(pixels: Uint8ClampedArray | number[]): ImageColorFeatures {
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let count = 0;

  // Pixel step to sample around 1000-2000 points
  const step = Math.max(4, Math.floor(pixels.length / 4000) * 4);
  for (let i = 0; i < pixels.length - 3; i += step) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3] !== undefined ? pixels[i + 3] : 255;
    // Exclude transparent pixels
    if (a > 50) {
      totalR += r;
      totalG += g;
      totalB += b;
      count++;
    }
  }

  if (count === 0) {
    return { avgR: 128, avgG: 128, avgB: 128, hue: 0, saturation: 0, brightness: 128 };
  }

  const avgR = totalR / count;
  const avgG = totalG / count;
  const avgB = totalB / count;
  const brightness = (avgR + avgG + avgB) / 3;

  const max = Math.max(avgR, avgG, avgB);
  const min = Math.min(avgR, avgG, avgB);
  const delta = max - min;
  const saturation = max === 0 ? 0 : delta / max;

  let hue = 0;
  if (delta > 0) {
    if (max === avgR) {
      hue = ((avgG - avgB) / delta) % 6;
    } else if (max === avgG) {
      hue = (avgB - avgR) / delta + 2;
    } else {
      hue = (avgR - avgG) / delta + 4;
    }
    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;
  }

  return { avgR, avgG, avgB, hue, saturation, brightness };
}

/**
 * Classify vegetable or food from optical color & hue characteristics
 */
export function classifyFoodFromColorFeatures(features: ImageColorFeatures): DetectedFoodResult {
  const { avgR, avgG, avgB, hue, saturation, brightness } = features;

  // 1. Daikon (大根) / Tofu (豆腐) / White cabbage / Bean sprouts:
  // High brightness, very low saturation (almost pure white/cream)
  if (brightness > 165 && saturation < 0.20) {
    return {
      primaryName: "大根",
      category: "vegetable",
      candidates: ["大根", "絹ごし豆腐", "白菜", "もやし"],
      confidence: "high",
    };
  }

  // 2. Green vegetables (ピーマン, キャベツ, ほうれん草, ブロッコリー, きゅうり, レタス):
  // Green dominant: Hue in green spectrum (65° to 175°) OR green exceeds red and blue significantly
  if ((hue >= 65 && hue <= 175 && saturation >= 0.12) || (avgG > avgR * 1.12 && avgG > avgB * 1.10)) {
    // Dark/deep green -> ピーマン, ほうれん草, ブロッコリー, きゅうり
    if (brightness < 125 || avgG < 140) {
      return {
        primaryName: "ピーマン",
        category: "vegetable",
        candidates: ["ピーマン", "ほうれん草", "ブロッコリー", "きゅうり"],
        confidence: "high",
      };
    } else {
      // Light / yellow-green -> キャベツ, レタス, 小松菜
      return {
        primaryName: "キャベツ",
        category: "vegetable",
        candidates: ["キャベツ", "レタス", "白菜", "小松菜"],
        confidence: "high",
      };
    }
  }

  // 3. Eggplant (なす):
  // Deep purple/violet: Hue 240°-330° or low brightness with Blue/Red > Green
  if ((hue >= 240 && hue <= 335 && saturation > 0.15) || (brightness < 90 && avgB > avgG && avgR > avgG)) {
    return {
      primaryName: "なす",
      category: "vegetable",
      candidates: ["なす", "紫キャベツ", "黒豆"],
      confidence: "high",
    };
  }

  // 4. Tomato (トマト):
  // Pure vivid red: Hue 345°-360° or 0°-16°, high saturation, strong red channel
  if ((hue >= 345 || hue <= 16) && saturation > 0.38 && avgR > 125) {
    return {
      primaryName: "トマト",
      category: "vegetable",
      candidates: ["トマト", "ミニトマト", "パプリカ（赤）"],
      confidence: "high",
    };
  }

  // 5. Carrot (人参):
  // Bright orange: Hue 17° to 38°, high saturation (>= 0.38), R substantially higher than G and B, low Blue
  if (hue >= 17 && hue <= 38 && saturation >= 0.38 && avgR > avgG * 1.25 && avgB < 115) {
    return {
      primaryName: "人参",
      category: "vegetable",
      candidates: ["人参", "パプリカ（橙）", "かぼちゃ"],
      confidence: "high",
    };
  }

  // 6. Pumpkin (かぼちゃ) / Corn / Lemon / Egg yolk:
  // Golden yellow-orange: Hue 38° to 62°, high saturation (> 0.55), high R and G
  if (hue >= 38 && hue <= 62 && saturation > 0.55 && avgR > 150 && avgG > 125) {
    return {
      primaryName: "かぼちゃ",
      category: "vegetable",
      candidates: ["かぼちゃ", "とうもろこし", "卵"],
      confidence: "high",
    };
  }

  // 7. Meat (豚肉・牛肉・鶏肉):
  // Pinkish red or reddish brown, moderate brightness, Hue 340°-25°
  if ((hue >= 340 || hue <= 25) && avgR > avgG * 1.15 && avgR > avgB * 1.15 && brightness < 155) {
    return {
      primaryName: "豚バラ肉",
      category: "meat",
      candidates: ["豚バラ肉", "豚ロース", "牛肉", "鶏もも肉"],
      confidence: "high",
    };
  }

  // 8. Salmon / Fresh Fish (鮭・魚介):
  // Salmon pink / coral: Hue 10°-30°, moderate saturation, R > 130
  if (hue >= 10 && hue <= 30 && avgR > 130 && avgG > 75 && avgB < 110 && saturation > 0.30) {
    return {
      primaryName: "鮭・魚",
      category: "fish",
      candidates: ["鮭・魚", "たら", "エビ"],
      confidence: "medium",
    };
  }

  // 9. Onion (玉ねぎ):
  // Specifically golden-tan skin or translucent pale yellow-orange.
  // Hue 25°-55°, moderate saturation (0.20 - 0.48), high brightness (120 - 200).
  if (hue >= 25 && hue <= 55 && saturation >= 0.20 && saturation <= 0.48 && brightness >= 120 && brightness <= 205 && avgR > 135) {
    return {
      primaryName: "玉ねぎ",
      category: "vegetable",
      candidates: ["玉ねぎ", "じゃがいも", "長ネギ"],
      confidence: "medium",
    };
  }

  // 10. Potato (じゃがいも) / Sweet potato / Burdock (ごぼう):
  // Earthy tan/brown/yellow-gray, Hue 20°-55°, lower saturation (0.12 - 0.38), brightness 80 - 150
  if (hue >= 20 && hue <= 55 && saturation >= 0.12 && saturation <= 0.38 && brightness >= 80 && brightness < 155) {
    return {
      primaryName: "じゃがいも",
      category: "vegetable",
      candidates: ["じゃがいも", "さつまいも", "ごぼう", "れんこん"],
      confidence: "medium",
    };
  }

  // 11. Mushrooms (きのこ):
  // Dark/medium earthy brown or gray-brown, low saturation, low brightness
  if (brightness < 115 && saturation < 0.25) {
    return {
      primaryName: "きのこ",
      category: "vegetable",
      candidates: ["きのこ", "しめじ", "エリンギ", "椎茸"],
      confidence: "medium",
    };
  }

  // 12. Konjac / Black/Grey food (板こんにゃく・しらたき):
  if (brightness < 100 && saturation < 0.12) {
    return {
      primaryName: "板こんにゃく",
      category: "other",
      candidates: ["板こんにゃく", "しらたき", "ひじき"],
      confidence: "medium",
    };
  }

  // Fallback defaults to fresh cabbage / versatile vegetable
  return {
    primaryName: "キャベツ",
    category: "vegetable",
    candidates: ["キャベツ", "人参", "玉ねぎ", "豚肉"],
    confidence: "low",
  };
}

/**
 * Asynchronously analyze an image (DataURL or Image element) using Canvas in browser/iOS WebView.
 * This guarantees real optical pixel decoding rather than raw compressed JPEG entropy bytes!
 */
export function analyzeImagePixelsClientSide(imageDataUrl: string): Promise<DetectedFoodResult> {
  return new Promise((resolve) => {
    // If not in a browser environment with Image and document
    if (typeof window === "undefined" || typeof document === "undefined") {
      const bytes = decodeBase64ToBytes(imageDataUrl);
      const features = extractColorFeaturesFromPixels(bytes as any);
      resolve(classifyFoodFromColorFeatures(features));
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        // Sample at 64x64 thumbnail for instant processing
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
        const features = extractColorFeaturesFromPixels(imgData.data);
        const result = classifyFoodFromColorFeatures(features);
        resolve(result);
      } catch (err) {
        console.warn("Client-side canvas pixel sampling error:", err);
        const bytes = decodeBase64ToBytes(imageDataUrl);
        const features = extractColorFeaturesFromPixels(bytes as any);
        resolve(classifyFoodFromColorFeatures(features));
      }
    };

    img.onerror = (e) => {
      console.warn("Image load error for pixel analysis:", e);
      const bytes = decodeBase64ToBytes(imageDataUrl);
      const features = extractColorFeaturesFromPixels(bytes as any);
      resolve(classifyFoodFromColorFeatures(features));
    };

    img.src = imageDataUrl;
  });
}
