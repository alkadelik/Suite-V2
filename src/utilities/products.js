/**
 * Calculates the total quantity of a product based on its SKUs.
 *
 * @param {Object} prod - The product object.
 * @param {Array<{qty: number}>} [prod.sku] - An array of SKU objects, each with a qty (quantity).
 * @param {number} [prod.total_stock] - The total stock of the product (used if no SKUs are present).
 * @returns {number} The total quantity of the product.
 */
export const getProdSkuQty = (prod) => {
  if (!prod.sku || !prod.sku.length) return prod.total_stock || 0;
  return prod.sku.reduce((acc, curr) => acc + (curr.qty || 0), 0);
};
