/**
 * Scaler utility for recalculating ingredient quantities based on servings.
 */

export function scaleAmount(
  baseAmount: number,
  baseServings: number,
  targetServings: number
): number {
  if (!baseServings || baseServings <= 0) return baseAmount;
  const ratio = targetServings / baseServings;
  return baseAmount * ratio;
}

export function formatScaledAmount(
  baseAmount: number,
  baseServings: number,
  targetServings: number,
  unit: string
): string {
  // If unit is "少々", "適量", "お好みで", no numerical calculation needed
  const nonNumericUnits = ["少々", "適量", "お好みで", "ひとつまみ", "各適量"];
  if (nonNumericUnits.some(u => unit.includes(u))) {
    if (targetServings >= 4 && unit === "少々") {
      return "やや多めに";
    }
    return unit;
  }

  const scaled = scaleAmount(baseAmount, baseServings, targetServings);

  // Formatting fractions or clean decimals
  if (scaled <= 0) return "0";

  // Common fraction formats for 1/2, 1/4, 1/3, 3/4
  if (Math.abs(scaled - 0.5) < 0.02) return "1/2";
  if (Math.abs(scaled - 0.25) < 0.02) return "1/4";
  if (Math.abs(scaled - 0.75) < 0.02) return "3/4";
  if (Math.abs(scaled - 0.33) < 0.03) return "1/3";
  if (Math.abs(scaled - 0.67) < 0.03) return "2/3";
  if (Math.abs(scaled - 1.5) < 0.02) return "1と1/2";
  if (Math.abs(scaled - 2.5) < 0.02) return "2と1/2";

  // If it's a whole number or close to it
  if (Math.abs(scaled - Math.round(scaled)) < 0.05) {
    return `${Math.round(scaled)}`;
  }

  // Round to 1 decimal place
  return `${Math.round(scaled * 10) / 10}`;
}
