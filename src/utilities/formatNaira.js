/**
 * Formats a numeric value into Nigerian Naira currency.
 *
 * @param {number} value - The amount in Naira.
 * @param {boolean} [showKobo=false] - Whether to show kobo (fractional digits).
 * @returns {string} - Formatted Naira string.
 */
export const formatNaira = (value = 0, showKobo = false) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: showKobo ? 2 : 0,
    maximumFractionDigits: showKobo ? 2 : 0,
  }).format(value);
};

/**
 * Formats a numeric value into a shortened (truncated) Nigerian Naira string.
 * For example: 1,000,000 becomes ₦1.00M.
 *
 * @param {number} value - The amount in Naira.
 * @returns {string} - Truncated Naira string with suffix (K, M, B).
 */
export const formatNairaTruncated = (value = 0) => {
  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const currencySymbol = formatter.format(0).slice(0, 1);

  if (value >= 1000000000) {
    return `${currencySymbol}${(value / 1000000000).toFixed(2)}B`; // Billions, 2 decimal places
  } else if (value >= 1000000) {
    return `${currencySymbol}${(value / 1000000).toFixed(2)}M`; // Millions, 2 decimal places
  } else if (value >= 100000) {
    return `${currencySymbol}${(value / 1000).toFixed(1)}K`; // Thousands (6-digit), 1 decimal place
  }
  return formatter.format(value);
};
