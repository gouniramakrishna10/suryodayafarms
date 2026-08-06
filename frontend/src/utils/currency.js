/**
 * Standardized Currency Formatting Utility for Suryodaya Farms
 * Ensures exact 2 decimal places with mathematical rounding.
 * Prevents floating point errors like ₹1960.36000000000001.
 */

/**
 * Returns formatted price string with 2 decimal places (e.g., "1960.36", "179.00").
 * @param {number|string} val 
 * @returns {string}
 */
export const formatPrice = (val) => {
  const num = Number(val);
  if (isNaN(num) || val === null || val === undefined) {
    return '0.00';
  }
  const rounded = (Math.round((num + Number.EPSILON) * 100) / 100).toFixed(2);
  return rounded;
};

/**
 * Returns formatted currency string with ₹ symbol and 2 decimal places (e.g., "₹1960.36", "₹179.00").
 * @param {number|string} val 
 * @returns {string}
 */
export const formatCurrency = (val) => {
  return `₹${formatPrice(val)}`;
};

export default formatCurrency;
