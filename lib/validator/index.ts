import { z } from 'zod';

export const eventFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 3 characters' })
    .max(1500, { message: 'Description must be less than 1500 characters' }),
  locationType: z.enum(['Online', 'In-Person', 'Hybrid']),
  location: z.string().optional().default(''),
  coordinates: z.string().optional().default(''),
  imageUrl: z.string(),
  startDateTime: z.date(),
  endDateTime: z.date(),
  categoryId: z.string(),
  typeId: z.string(),
  currency: z.string(),
  onlinePrice: z.string().optional(),
  inPersonPrice: z.string().optional(),
  isFree: z.boolean(),
  url: z.string().url({ message: 'Invalid URL' }).optional(),
  contactDetails: z.object({
    phoneNumber: z
      .string()
      .min(10, { message: 'Phone number must be at least 10 characters' }),
    email: z.string().email({ message: 'Invalid email address' }),
    website: z.string().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    x: z.string().optional(),
  }),
  priceCategories: z
    .array(
      z.object({
        name: z.string().min(1, { message: 'Category name is required' }),
        price: z.string().min(1, { message: 'Price is required' }),
      })
    )
    .optional(),
});

export type eventFormValues = z.infer<typeof eventFormSchema>;
