import { z } from 'zod'

// Base docket schema for form validation
export const docketSchema = z
  .object({
    date: z.date({ required_error: 'Date is required' }),
    isDocketNumberAuto: z.boolean().default(true), // Field for the checkbox
    docketNumber: z.string().optional(), // Field for manual docket number input
    driverRegNumber: z.string().optional(),
    customerId: z.string().min(1, { message: 'Customer ID is required' }),
    productId: z
      .number()
      .int()
      .positive({ message: 'Product ID must be a positive integer' }),
    orderNumber: z.string().min(1, { message: 'Order number is required' }),
    deliveryAddress: z.string().optional(),
    inspectedBy: z.string().optional(),
    deliveredBy: z.string().optional(),
    weight: z
      .number()
      .nullable()
      .refine((weight) => weight !== null && weight > 0, {
        message: 'Weight must be greater than 0'
      }),
    receivedBy: z.string().optional(),
    price: z.number({ required_error: 'Price is required' })
  })
  .refine(
    (data) => {
      // If auto-increment is OFF, a manual docket number must be provided.
      if (!data.isDocketNumberAuto) {
        return !!data.docketNumber && data.docketNumber.length > 0
      }
      return true
    },
    {
      message: 'Docket number is required for manual entry.',
      path: ['docketNumber'] // Apply error to the docketNumber field
    }
  )

// Type for form data (client-side)
export type DocketFormData = z.infer<typeof docketSchema>
