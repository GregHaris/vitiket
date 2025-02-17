import { z } from 'zod';

export const eventFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 3 characters' })
    .max(1500, { message: 'Description must be less than 1500 characters' }),
  location: z
    .string()
    .min(3, { message: 'Location must be at least 3 characters' })
    .max(200, { message: 'Location must be less than 200 characters' }),
  imageUrl: z.string(),
  startDateTime: z.date(),
  endDateTime: z.date(),
  categoryId: z.string(),
  typeId: z.string(),
  price: z.string(),
  currency: z.string(),
  isFree: z.boolean(),
  url: z.string().url({ message: 'Invalid URL' }),
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
});

export type eventFormValues = z.infer<typeof eventFormSchema>;
