import { z } from 'zod'

export const buyerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name must be less than 80 characters'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15, 'Phone must be less than 15 digits'),
  city: z.enum(['CHANDIGARH', 'MOHALI', 'ZIRAKPUR', 'PANCHKULA', 'OTHER']),
  propertyType: z.enum(['APARTMENT', 'VILLA', 'PLOT', 'OFFICE', 'RETAIL']),
  bhk: z.enum(['STUDIO', 'ONE', 'TWO', 'THREE', 'FOUR']).optional(),
  purpose: z.enum(['BUY', 'RENT']),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  timeline: z.enum(['ZERO_TO_THREE_MONTHS', 'THREE_TO_SIX_MONTHS', 'MORE_THAN_SIX_MONTHS', 'EXPLORING']),
  source: z.enum(['WEBSITE', 'REFERRAL', 'WALK_IN', 'CALL', 'OTHER']),
  status: z.enum(['NEW', 'QUALIFIED', 'CONTACTED', 'VISITED', 'NEGOTIATION', 'CONVERTED', 'DROPPED']).optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  tags: z.string().optional()
}).refine((data) => {
  if (['APARTMENT', 'VILLA'].includes(data.propertyType) && !data.bhk) {
    return false
  }
  return true
}, {
  message: "BHK is required for Apartment/Villa",
  path: ["bhk"]
}).refine((data) => {
  if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
    return false
  }
  return true
}, {
  message: "Budget max must be greater than budget min",
  path: ["budgetMax"]
})

export type BuyerFormData = z.infer<typeof buyerSchema>
