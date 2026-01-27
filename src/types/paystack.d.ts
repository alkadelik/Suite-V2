export {}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string
        email: string
        amount: number | string
        currency?: string
        metadata?: {
          custom_fields?: Array<{
            display_name: string
            variable_name: string
            value: string
          }>
        }
        callback: (response: { reference: string }) => void
        onClose?: () => void
      }) => {
        openIframe: () => void
      }
    }
  }
}
