import { TChipColor } from "./types"

export const getRoleColor = (roleUid: string): TChipColor => {
  const roleColors: Record<string, TChipColor> = {
    "126f5db1-c952-4bcd-b08f-df518a0fa064": "blue", //growth manager
    "bc64d1cc-2251-4f25-b103-6df3559939b4": "purple", //inventory
    "ecfdc6a2-683b-4da4-982f-6f5291edc0b8": "warning", //manager
    "24dcc075-3eea-42ed-9613-fdefd4a8ffc0": "success", //production
    "ad3a2bd7-2c8d-4639-9432-1c0efe722374": "primary", //finance
    "829fe16b-443d-4f9d-9d97-45a9b3ddbd4a": "alt", //assistant
    "6deeb4a0-e166-465c-ac11-c037bea9c293": "primary", //owner
    "e0a6d897-0a2d-41f0-bf3b-d063ee2887b3": "pink", //sales and fulfilment
  }
  return roleColors[roleUid] || "primary"
}
