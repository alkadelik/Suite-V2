import type { TOrder, TShipbubbleShipment, TShipmentRow } from "../../types"

/**
 * Static, non-charging example used by the Shipments walkthrough. The tour never
 * hits ShipBubble or Paystack — it walks through this pre-filled sample so the
 * merchant can learn the flow without creating a real shipment.
 *
 * `status` flips to the "created" state once the tour passes the success step.
 */
export const SHIPMENT_TOUR_CREATED_STATUS = "shipment_created"
export const SHIPMENT_TOUR_TRACKING_NUMBER = "TRK-293847"

export function buildShipmentTourRow(status = "awaiting_shipment"): TShipmentRow {
  const order = {
    uid: "tour-order",
    order_number: "20424520016",
    coupon: null,
    courier: "tour-courier",
    courier_name: "Fez Delivery",
    created_at: "2026-01-31T09:00:00Z",
    order_date: "2026-01-31T09:00:00Z",
    customer: "tour-customer",
    customer_email: "adanna.okafor@example.com",
    customer_phone: "+2348123456789",
    customer_name: "Adanna Okafor",
    customer_address: "Ikeja City Mall, Ikeja, Lagos",
    delivery_address: "Ikeja City Mall, Ikeja, Lagos",
    delivery_fee: "350000",
    delivery_method: "shipbubble",
    delivery_payment_option: "merchant",
    discount_amount: "0",
    fulfilment_method: "delivery",
    fulfilment_status: "unfulfilled",
    items: [
      {
        uid: "tour-item",
        variant: "tour-variant",
        variant_name: "Default",
        variant_sku: "SKU-TOUR",
        product_name: "Women's Elegant Floral Off-Shoulder Single...",
        popup_inventory: null,
        quantity: 15,
        unit_price: "586666",
        total_price: "8800000",
        fulfilment_status: "unfulfilled",
        qty_fulfilled: 0,
        notes: "",
        product_images: [],
      },
    ],
    location: "tour-location",
    location_name: "Ijesati Warehouse, Ebute Meta",
    memos_count: 0,
    outstanding_balance: 0,
    payment_status: "paid",
    rate: "tour-rate",
    source: "internal",
    store: "tour-store",
    store_name: "Smile Socks",
    subtotal: "8800000",
    total_amount: 8800000,
    tax_amount: "0",
    tax_rate_used: "0",
    total_paid: 8800000,
    tracking_number: SHIPMENT_TOUR_TRACKING_NUMBER,
    user: "tour-user",
    user_name: "Addie Peters",
    is_voided: false,
  } as unknown as TOrder

  const shipment = {
    uid: "tour-shipment",
    shipbubble_order_id: "PD-20424520016",
    order,
    merchant_name: "Smile Socks",
    courier: {
      name: "Fez Delivery",
      email: "support@fezdelivery.co",
      phone: "+2348000000000",
      courier_name: "Fez Delivery",
    },
    price: "300000",
    service_charge: "50000",
    total_shipping_cost: "350000",
    prepaid_delivery_fee: "0",
    fee_variance: "0",
    variance_type: "none",
    status,
    tracking_url: status === "awaiting_shipment" ? null : "https://shipbubble.com/track/0011223344",
    waybill_document_url: null,
    tracking_data: null,
    last_status_update: null,
    quote_expires_at: "2026-02-05T09:00:00Z",
    quote_status: "active",
    quote_hours_remaining: 149,
    is_suite_order: true,
    pickup_date: "2026-01-31T09:00:00Z",
    delivery_estimate: "2026-01-31T09:00:00Z",
    created_at: "2026-01-31T09:00:00Z",
  } as unknown as TShipbubbleShipment

  return {
    uid: "tour-shipment-row",
    order_number: order.order_number,
    customer_name: order.customer_name || "Adanna Okafor",
    courier: shipment.courier,
    fee: shipment.total_shipping_cost,
    amount: order.total_amount,
    date: shipment.delivery_estimate || shipment.created_at,
    status,
    order,
    shipment,
    delivery_estimate: shipment.delivery_estimate || null,
  }
}
