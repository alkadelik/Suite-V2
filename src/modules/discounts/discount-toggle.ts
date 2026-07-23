export interface DiscountTogglePayload {
  name: string
  is_enabled: boolean
}

/** Build the explicit status body accepted by the published discount PATCH contract. */
export function buildDiscountTogglePayload(
  name: string,
  isEnabled: boolean,
): DiscountTogglePayload {
  if (!name.trim()) throw new Error("Discount name is required")
  return { name, is_enabled: isEnabled }
}
