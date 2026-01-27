// import { toast } from "@/composables/useToast"
import { toast } from "@/composables/useToast"
import { TCustomer } from "@modules/customers/types"

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
  shipping_price: number
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
    amount: shippingInfo?.shipping_price * 100, // Convert to kobo
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
      resolve()
      return
    }

    const script = document.createElement("script")
    script.src = "https://js.paystack.co/v1/inline.js"
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Failed to load Paystack script"))

    document.head.appendChild(script)
  })
}

export const getCustomerName = (
  customer: TCustomer | null | undefined,
  fallback = "Unknown Anonymous",
) => {
  const { first_name, last_name } = customer || {}
  return ((first_name || "") + " " + (last_name || "")).trim() || fallback
}
