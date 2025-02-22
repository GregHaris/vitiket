import { z } from 'zod';

export const eventFormSchema = z
  .object({
    title: z
      .string()
      .min(3, { message: 'Title must be at least 3 characters' }),
    description: z
      .string()
      .min(10, { message: 'Description must be at least 10 characters' })
      .max(1500, { message: 'Description must be less than 1500 characters' }),
    locationType: z.enum(['Virtual', 'Physical', 'Hybrid']),
    location: z.string().optional(),
    coordinates: z.string().optional(),
    imageUrl: z.string().min(1, { message: 'Image URL is required' }),
    startDate: z.date(),
    endDate: z.date(),
    startTime: z.date(),
    endTime: z.date(),
    categoryId: z.string().min(1, { message: 'Category is required' }),
    typeId: z.string().min(1, { message: 'Type is required' }),
    currency: z.string().min(1, { message: 'Currency is required' }),
    isFree: z.boolean().optional().default(false),
    url: z.string().optional(),
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
    quantity: z
      .number()
      .nullable()
      .optional()
      .transform((val) => (val === null || val === undefined ? null : val)),
    priceCategories: z
      .array(
        z.object({
          name: z.string().min(1, { message: 'Category name is required' }),
          price: z.string().min(1, { message: 'Price is required' }),
        })
      )
      .optional(),
  })
  .refine(
    (data) => {
      // Validate URL for Virtual or Hybrid events
      if (data.locationType === 'Virtual' || data.locationType === 'Hybrid') {
        return z.string().url().safeParse(data.url).success;
      }
      return true;
    },
    {
      message: 'Invalid URL',
      path: ['url'],
    }
  )
  .refine(
    (data) => {
      // Validate website URL if provided
      if (data.contactDetails.website) {
        return z.string().url().safeParse(data.contactDetails.website).success;
      }
      return true;
    },
    {
      message: 'Invalid website URL',
      path: ['contactDetails', 'website'],
    }
  )
  .refine(
    (data) => {
      // Validate that end date is after or equal to start date
      const startDate = new Date(
        data.startDate.getFullYear(),
        data.startDate.getMonth(),
        data.startDate.getDate()
      );
      const endDate = new Date(
        data.endDate.getFullYear(),
        data.endDate.getMonth(),
        data.endDate.getDate()
      );

      return endDate >= startDate;
    },
    {
      message: 'End date must be after or equal to start date',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      // Validate that end time is after start time if the dates are the same
      const startDate = new Date(
        data.startDate.getFullYear(),
        data.startDate.getMonth(),
        data.startDate.getDate()
      );
      const endDate = new Date(
        data.endDate.getFullYear(),
        data.endDate.getMonth(),
        data.endDate.getDate()
      );

      if (startDate.getTime() === endDate.getTime()) {
        const startTime = new Date(
          0,
          0,
          0,
          data.startTime.getHours(),
          data.startTime.getMinutes()
        );
        const endTime = new Date(
          0,
          0,
          0,
          data.endTime.getHours(),
          data.endTime.getMinutes()
        );

        return endTime >= startTime;
      }

      return true;
    },
    {
      message: 'End time must be after start time on the same day',
      path: ['endTime'],
    }
  );

export type eventFormValues = z.infer<typeof eventFormSchema>;
