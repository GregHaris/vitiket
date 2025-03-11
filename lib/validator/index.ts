import { z } from 'zod';

export const eventFormSchema = z
  .object({
    title: z
      .string()
      .min(3, { message: 'Title must be at least 3 characters' }),
    subtitle: z.string().optional(),
    description: z
      .string()
      .min(10, { message: 'Description must be at least 10 characters' })
      .max(2000, { message: 'Description must be less than 1500 characters' }),
    location: z.string().optional(),
    locationType: z.enum(['Virtual', 'Physical', 'Hybrid']),
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
      email: z
        .string()
        .min(1, { message: 'Email is required' })
        .email({ message: 'Invalid email address' }),
      phoneNumber: z
        .string()
        .optional()
        .superRefine((val, ctx) => {
          if (val && val.length > 0 && val.length < 10) {
            ctx.addIssue({
              code: z.ZodIssueCode.too_small,
              minimum: 10,
              type: 'string',
              inclusive: true,
              message: 'Phone number must be at least 10 characters',
            });
          }
        }),
      website: z.string().optional(),
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      x: z.string().optional(),
      linkedin: z.string().optional(),
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
        if (!data.url) {
          return false;
        }
        return z.string().url().safeParse(data.url).success;
      }
      return true;
    },
    {
      message: 'URL is required and must be a valid URL',
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

export const checkoutFormSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z
      .string()
      .nonempty({ message: 'Email is required' })
      .email('Invalid email address'),
    confirmEmail: z
      .string()
      .nonempty({ message: 'Confirm email is required' })
      .email('Invalid email address'),
    paymentMethod: z.enum(['card', 'googlePay', 'applePay']),
  })
  .refine((data) => data.email === data.confirmEmail, {
    message: 'Emails do not match',
    path: ['confirmEmail'],
  });

export type checkoutFormValues = z.infer<typeof checkoutFormSchema>;

export const paymentDetailsSchema = z.object({
  businessName: z
    .string()
    .min(3, { message: 'Business name must be at least 3 characters' }),
  bankName: z.string().min(1, { message: 'Bank name is required' }),
  accountName: z.string().min(1, { message: 'Account name is required' }),
  accountNumber: z
    .string()
    .min(10, { message: 'Account number must be at least 10 characters' })
    .max(10, { message: 'Account number must be 10 characters' }),
});

export type PaymentDetailsValues = z.infer<typeof paymentDetailsSchema>;
