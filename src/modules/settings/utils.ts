import { TChipColor } from "@modules/shared/types"

export const getPlanColor = (planName: string): TChipColor => {
  const planColors: Record<string, TChipColor> = {
    Burst: "purple",
    Bloom: "blue",
    Bud: "success",
  }
  return planColors[planName] || "primary"
}
