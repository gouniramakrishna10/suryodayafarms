/**
 * Utility functions for responsive card grid balancing.
 * Desktop: 3 columns | Tablet: 2 columns | Mobile: 1 column
 * 
 * Rules:
 * 1. If total items perfectly fill grid: keep normal layout.
 * 2. If 2 cards remain in a 3-column layout: keep all (flexbox justify-center centers the 2 remaining cards).
 * 3. If 1 card remains (orphan card): remove/hide the single leftover card to avoid visual unbalance.
 */

export function getBalanced3ColCards(items = []) {
  if (!items || !Array.isArray(items) || items.length === 0) return [];
  if (items.length % 3 === 1 && items.length > 1) {
    return items.slice(0, items.length - 1);
  }
  return items;
}

export function getBalanced2ColCards(items = []) {
  if (!items || !Array.isArray(items) || items.length === 0) return [];
  if (items.length % 2 !== 0 && items.length > 1) {
    return items.slice(0, items.length - 1);
  }
  return items;
}
