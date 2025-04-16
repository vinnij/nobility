import { z } from 'zod'

export const navigationItemSchema = z.object({
  label: z.string().min(1, "Label is required"),
  url: z.string(),
  order: z.number().int().min(0),
})

export type NavigationItem = z.infer<typeof navigationItemSchema> & { id: string }
