// Two endpoints at `/api/*` (not the app's usual `/api/v2`): `GET /api/me`
// (once per session) and `POST /api/flags` (idempotent).

import baseApi from "@/composables/baseApi"

const apiBase = (import.meta.env.VITE_API_BASE_URL as string) + "/api"

export interface MeResponse {
  created_at: string
  onboarding_complete: boolean
  flags: string[]
}

type MeEnvelope = MeResponse | { data: MeResponse }

function unwrap(payload: MeEnvelope): MeResponse {
  return "data" in payload ? payload.data : payload
}

export async function fetchMe(): Promise<MeResponse> {
  const { data } = await baseApi.get<MeEnvelope>("/me", { baseURL: apiBase })
  const me = unwrap(data)
  return {
    created_at: me.created_at,
    onboarding_complete: Boolean(me.onboarding_complete),
    flags: Array.isArray(me.flags) ? me.flags : [],
  }
}

export async function postFlag(key: string): Promise<void> {
  await baseApi.post("/flags", { key }, { baseURL: apiBase })
}
