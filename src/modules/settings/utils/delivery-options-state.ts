export type DeliveryView = "automatic" | "manual"

export interface DeliveryFormState {
  allow_pickup: boolean
  delivery_enabled: boolean
  manual_delivery_enabled: boolean
  express_delivery_enabled: boolean
}

export interface StoreDeliveryDetails {
  pickup_location?: string | null
  delivery_enabled?: boolean | null
  manual_delivery_enabled?: boolean | null
  express_delivery_enabled?: boolean | null
}

export const getStoreDeliveryValues = (storeDetails: StoreDeliveryDetails): DeliveryFormState => {
  const pickupLocation = storeDetails.pickup_location
  const hasPickup = typeof pickupLocation === "string" ? pickupLocation.trim() !== "" : false

  return {
    allow_pickup: hasPickup,
    delivery_enabled: storeDetails.delivery_enabled || false,
    manual_delivery_enabled: storeDetails.manual_delivery_enabled || false,
    express_delivery_enabled: storeDetails.express_delivery_enabled || false,
  }
}

const getViewFromValues = (values: DeliveryFormState): DeliveryView => {
  return values.manual_delivery_enabled ? "manual" : "automatic"
}

const isDirty = (
  field: keyof DeliveryFormState,
  form: DeliveryFormState,
  originalValues: DeliveryFormState,
): boolean => {
  return form[field] !== originalValues[field]
}

export const syncDeliveryFormState = ({
  previousForm,
  previousOriginalValues,
  previousCurrentDeliveryView,
  nextStoreDetails,
}: {
  previousForm: DeliveryFormState
  previousOriginalValues: DeliveryFormState
  previousCurrentDeliveryView: DeliveryView
  nextStoreDetails: StoreDeliveryDetails
}): {
  form: DeliveryFormState
  originalValues: DeliveryFormState
  currentDeliveryView: DeliveryView
} => {
  const nextOriginalValues = getStoreDeliveryValues(nextStoreDetails)
  const nextForm = {
    allow_pickup: isDirty("allow_pickup", previousForm, previousOriginalValues)
      ? previousForm.allow_pickup
      : nextOriginalValues.allow_pickup,
    delivery_enabled: isDirty("delivery_enabled", previousForm, previousOriginalValues)
      ? previousForm.delivery_enabled
      : nextOriginalValues.delivery_enabled,
    manual_delivery_enabled: isDirty(
      "manual_delivery_enabled",
      previousForm,
      previousOriginalValues,
    )
      ? previousForm.manual_delivery_enabled
      : nextOriginalValues.manual_delivery_enabled,
    express_delivery_enabled: isDirty(
      "express_delivery_enabled",
      previousForm,
      previousOriginalValues,
    )
      ? previousForm.express_delivery_enabled
      : nextOriginalValues.express_delivery_enabled,
  }

  const previousOriginalView = getViewFromValues(previousOriginalValues)
  const deliveryToggleDirty =
    isDirty("delivery_enabled", previousForm, previousOriginalValues) ||
    isDirty("manual_delivery_enabled", previousForm, previousOriginalValues)
  const viewDirty = previousCurrentDeliveryView !== previousOriginalView

  let currentDeliveryView = getViewFromValues(nextOriginalValues)

  if (deliveryToggleDirty) {
    currentDeliveryView = getViewFromValues(nextForm)
  } else if (viewDirty) {
    currentDeliveryView = previousCurrentDeliveryView
  }

  return {
    form: nextForm,
    originalValues: nextOriginalValues,
    currentDeliveryView,
  }
}
