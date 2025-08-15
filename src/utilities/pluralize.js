/**
 * Pluralizes a given text based on a count.
 * Adds an "s" to the text if the count is greater than 1.
 *
 * @param {string} text - The text to pluralize.
 * @param {number} [count=0] - The count to determine pluralization. Defaults to 0.
 * @returns {string} The pluralized text.
 */
export const pluralize = (text, count = 0) => {
  return Number(count) > 1 ? `${text}s` : text;
};
