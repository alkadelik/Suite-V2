// import { toast } from "@/composables/useToast"
import { toast } from "@/composables/useToast"
import { TCustomer } from "@modules/customers/types"
import { TOrder, TOrderCourier, TShipbubbleShipment, TShipmentRow } from "./types"

export const createOrderRef = (storeId: number, cartItemCount: number, refType = 2) => {
  // const refType = "2"; // '1' for purchase by customer, '2' for sale added by merchant
  const randInt = Math.floor(Math.random() * 9999) + 1000 // Ensures 4-digit random number

  const today = new Date()
  const year = today.getFullYear().toString().slice(-2)
  const month = (today.getMonth() + 1).toString().padStart(2, "0") // Ensure 2-digit format
  const day = today.getDate().toString().padStart(2, "0")

  const storeIdFormatted = storeId.toString().padStart(4, "0") // Supports up to 9999 stores
  const cartCountFormatted = cartItemCount.toString().padStart(2, "0") // Ensure 2-digit format

  return `${refType}${storeIdFormatted}${month}${day}${cartCountFormatted}${year}${randInt}`
}

interface PayStackShippingInfo {
  customer_name: string
  customer_email: string
  shipping_price: string
  shipping_address: string
}

interface PayStackResponse {
  reference: string
}

// shippingInfo - customer's name, email, shipping price
export const handlePayStackPayment = (
  shippingInfo: PayStackShippingInfo,
  onSuccess: (res: PayStackResponse) => void = () => {},
) => {
  const apiKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY

  if (!apiKey) {
    console.error("PayStack API key is not configured")
    toast.error("Payment system configuration error. Please contact support.")
    return
  }

  if (!window.PaystackPop) {
    console.error("PayStack script not loaded")
    toast.error("Payment system not available. Please refresh the page and try again.")
    return
  }

  const handler = window.PaystackPop.setup({
    key: apiKey,
    email: shippingInfo?.customer_email,
    amount: shippingInfo?.shipping_price,
    currency: "NGN",
    metadata: {
      custom_fields: [
        {
          display_name: "Customer Name",
          variable_name: "customer_name",
          value: `${shippingInfo?.customer_name}`,
        },
        {
          display_name: "Shipping Address",
          variable_name: "shipping_address",
          value: `${shippingInfo?.shipping_address}`,
        },
      ],
    },
    callback: function (response: PayStackResponse) {
      onSuccess(response)
    },
    onClose: function () {
      toast.info("Payment modal closed.")
    },
  })

  handler.openIframe()
}

export const loadPaystackScript = () => {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve(undefined)
      return
    }

    const script = document.createElement("script")
    script.src = "https://js.paystack.co/v1/inline.js"
    script.async = true
    script.onload = () => resolve(undefined)
    script.onerror = () => reject(new Error("Failed to load Paystack script"))

    document.head.appendChild(script)
  })
}

/**
 * Normalize a ShipBubble shipment into the row shape the shipments table and the
 * shipment details drawer both read. Shared so the orders page can open the same
 * drawer from a plain order without duplicating the mapping.
 */
export const toShipmentRow = (shipment: TShipbubbleShipment): TShipmentRow => ({
  uid: shipment.uid,
  order_number: shipment.order?.order_number || "-",
  customer_name: shipment.order?.customer_name || "Unknown Anonymous",
  courier: (shipment.order?.courier as TOrderCourier) || shipment.courier || null,
  fee: shipment.total_shipping_cost,
  amount: shipment.order?.total_amount ?? 0,
  date: shipment.delivery_estimate || shipment.created_at,
  status: shipment.status,
  order: shipment.order,
  shipment,
  delivery_estimate: shipment.delivery_estimate || null,
})

/** The order is set to ship with ShipBubble, booked or not */
export const isShipbubbleOrder = (order: TOrder | null | undefined) =>
  order?.delivery_method === "shipbubble"

/**
 * The shipment has actually been booked with ShipBubble — until then the order only
 * carries a quote, and there is no shipment record to open.
 */
export const isShipmentBooked = (order: TOrder | null | undefined) =>
  !!order?.shipping_details?.shipbubble_order_id

export const getCustomerName = (
  customer: TCustomer | null | undefined,
  fallback = "Unknown Anonymous",
) => {
  const { first_name, last_name } = customer || {}
  return ((first_name || "") + " " + (last_name || "")).trim() || fallback
}
