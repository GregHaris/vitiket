import { z } from 'zod';

export const eventFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters' })
    .max(1500, { message: 'Description must be less than 1500 characters' }),
  locationType: z.enum(['Virtual', 'Physical', 'Hybrid']),
  location: z.string().optional(),
  coordinates: z.string().optional(),
  imageUrl: z.string().min(1, { message: 'Image URL is required' }),
  startDateTime: z.date(),
  endDateTime: z.date(),
  categoryId: z.string().min(1, { message: 'Category is required' }),
  typeId: z.string().min(1, { message: 'Type is required' }),
  currency: z.string().min(1, { message: 'Currency is required' }),
  isFree: z.boolean().optional().default(false),
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
