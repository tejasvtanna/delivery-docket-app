// src/schemas/product.schemas.ts
import { z } from 'zod'

// Base product schema for form validation
export const productSchema = z.object({
  name: z.string().min(1, { message: 'Product name is required' }),
  basePrice: z.number({ message: 'Base Price is required' }),
  prices: z.record(
    z.string(), // customerId
    z.number().optional() // Customer-specific price, undefined if not set
  )
})

// Type for form data (client-side)
export type ProductFormData = z.infer<typeof productSchema>

// Optional: Schema for server-side DB operations (if you add validation later)
export const productDbSchema = productSchema.extend({
  id: z.number().int().positive() // Add DB-specific fields if needed
})

// Type for DB operations
export type ProductDbData = z.infer<typeof productDbSchema>
