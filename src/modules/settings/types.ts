export type TLocation = {
  id: number
  name: string
  address: string
  phone: string
  membersCount: number
  status: "Active" | "Archived"
}

export type TLocationFormData = {
  name: string
  address: string
}
