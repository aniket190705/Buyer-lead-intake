export interface Buyer {
  id: string
  fullName: string
  phone: string
  email: string | null
  city: string
  propertyType: string
  bhk: string | null
  purpose: string
  budgetMin: number | null  // Note: number, not BigInt (after serialization)
  budgetMax: number | null  // Note: number, not BigInt (after serialization)
  timeline: string
  source: string
  status: string
  notes: string | null
  tags: string
  ownerId: string
  createdAt: Date
  updatedAt: Date
  owner: {
    name: string | null
    email: string
  }
}
