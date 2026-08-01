/**
 * Parses product weight string (e.g. "100g", "500 gm", "1 kg", "2.5 Liters") into kilograms.
 * Falls back to 0.5 kg if parsing fails or weight is not defined.
 */
export const parseWeightToKG = (weightStr) => {
  if (!weightStr) return 0.5; // Default to 500g if undefined/null
  const normalized = weightStr.toLowerCase().replace(/\s+/g, '');
  const numMatch = normalized.match(/^(\d+(?:\.\d+)?)/);
  if (!numMatch) return 0.5;
  const value = parseFloat(numMatch[1]);
  
  if (normalized.includes('kg') || normalized.includes('kilo') || (normalized.includes('l') && !normalized.includes('ml'))) {
    return value;
  }
  if (normalized.includes('g') || normalized.includes('gm') || normalized.includes('ml')) {
    return value / 1000;
  }
  // Fallback for cases like "500" or similar without units
  return value >= 10 ? value / 1000 : value;
};

/**
 * Formats weight in KG into a clean human-readable display string.
 * Examples:
 * - 0.25 -> "250 g"
 * - 0.75 -> "750 g"
 * - 1.0  -> "1 KG"
 * - 1.25 -> "1.25 KG"
 * - 2.0  -> "2 KG"
 * - 3.5  -> "3.5 KG"
 */
export const formatWeightDisplay = (weightInKg) => {
  if (weightInKg === undefined || weightInKg === null || isNaN(weightInKg)) return '0 g';
  const kg = Math.max(parseFloat(weightInKg), 0);
  if (kg < 1) {
    const grams = Math.round(kg * 1000);
    return `${grams} g`;
  }
  const formatted = Number.isInteger(kg) ? kg.toString() : parseFloat(kg.toFixed(2)).toString();
  return `${formatted} KG`;
};
