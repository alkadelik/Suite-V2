/**
 * API Key state.
 *
 * The Public API key endpoints do not exist yet, so this composable stands in
 * for them: it holds the key in module scope (so it survives navigation within
 * a session) and mimics the request lifecycle the TanStack Query hooks will
 * expose. When the backend lands, replace the bodies of `generate` and
 * `regenerate` with `useMutation` calls in `../api.ts` and drop
 * `simulateRequest` — the component API is deliberately identical.
 */
import { computed, ref } from "vue"
import { API_KEY_PREFIX } from "../constants"
import type { TApiKey } from "../types"

/** Latency stand-in so loading states are exercised while the endpoint is missing. */
const FAKE_LATENCY_MS = 600

const apiKey = ref<TApiKey | null>(null)
const isGenerating = ref(false)

/** Generate a random secret locally. The real key will be minted server-side. */
function mintKey(): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  const secret = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("")
  return `${API_KEY_PREFIX}_${secret}`
}

function simulateRequest(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, FAKE_LATENCY_MS))
}

export function useApiKey() {
  const hasApiKey = computed(() => Boolean(apiKey.value))

  async function generate(): Promise<TApiKey> {
    isGenerating.value = true
    try {
      await simulateRequest()
      const created: TApiKey = {
        uid: crypto.randomUUID(),
        key: mintKey(),
        created_at: new Date().toISOString(),
      }
      apiKey.value = created
      return created
    } finally {
      isGenerating.value = false
    }
  }

  /** Replace the current key. The previous secret stops working immediately. */
  async function regenerate(): Promise<TApiKey> {
    return generate()
  }

  return { apiKey, hasApiKey, isGenerating, generate, regenerate }
}
