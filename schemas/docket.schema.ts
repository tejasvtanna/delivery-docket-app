import { z } from 'zod'

// Base docket schema for form validation
export const docketSchema = z.object({
  date: z.date({ required_error: 'Date is required' }),
  driverRegNumber: z.string().optional(),
  customerId: z.string().min(1, { message: 'Customer ID is required' }),
  productId: z
    .number()
    .int()
    .positive({ message: 'Product ID must be a positive integer' }),
  orderNumber: z.string().min(1, { message: 'Order number is required' }),
  docketNumber: z.string().min(1, { message: 'Docket number is required' }),
  deliveryAddress: z.string().optional(),
  inspectedBy: z.string().optional(),
  deliveredBy: z.string().optional(),
  firstWeight: z.number().optional(),
  secondWeight: z.number().optional(),
  thirdWeight: z.number().optional(),
  receivedBy: z.string().optional(),
  price: z.number({ required_error: 'Price is required' }), // Required Float
  status: z.number().int() // Required Int
})

// Type for form data (client-side)
export type DocketFormData = z.infer<typeof docketSchema>

// Optional: Schema for server-side DB operations (with ID, createdAt, updatedAt)
export const docketDbSchema = docketSchema.extend({
  id: z.number().int().positive({ message: 'ID must be a positive integer' }),
  createdAt: z.date(),
  updatedAt: z.date()
})

// Type for DB operations
export type DocketDbData = z.infer<typeof docketDbSchema>
