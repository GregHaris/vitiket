import { ReactNode } from 'react';
import { UseFormReturn, Control,} from 'react-hook-form';

// ====== USER PARAMS
export type CreateUserParams = {
  clerkId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  image: string;
};

export type UpdateUserParams = {
  firstName: string;
  lastName: string;
  username: string;
  image: string;
};

// ====== EVENT PARAMS
export type CreateEventParams = {
  userId: string;
  event: {
    title: string;
    description: string;
    locationType: 'Virtual' | 'Physical' | 'Hybrid';
    location?: string;
    coordinates?: string;
    imageUrl: string;
    startDateTime: Date;
    endDateTime: Date;
    typeId: string;
    categoryId: string;
    priceCategories?: PriceCategory[];
    quantity?: number | null;
    isFree?: boolean;
    url?: string;
  };
  contactDetails: {
    phoneNumber: string;
    email: string;
    website?: string;
    instagram?: string;
    facebook?: string;
    x?: string;
  };
  path: string;
};

export type UpdateEventParams = {
  userId: string;
  event: {
    _id: string;
    title: string;
    imageUrl: string;
    description: string;
    locationType: 'Virtual' | 'Physical' | 'Hybrid';
    location?: string;
    coordinates?: string;
    startDateTime: Date;
    endDateTime: Date;
    typeId: string;
    categoryId: string;
    priceCategories?: PriceCategory[];
    quantity?: number | null;
    isFree?: boolean;
    url?: string;
  };
  contactDetails: {
    phoneNumber: string;
    email: string;
    website?: string;
    instagram?: string;
    facebook?: string;
    x?: string;
  };
  path: string;
};

export type DeleteEventParams = {
  eventId: string;
  path: string;
};

export type GetAllEventsParams = {
  query: string;
  category: string;
  limit: number;
  page: number;
  location: string;
};

export type GetEventsByUserParams = {
  userId: string;
  limit?: number;
  page: number;
};

export type GetRelatedEventsByCategoryParams = {
  categoryId: string;
  eventId: string;
  limit?: number;
  page: number | string;
};

export type GetRelatedEventsByTypeParams = {
  categoryId: string;
  eventId: string;
  limit?: number;
  page: number | string;
};

export type Event = {
  _id: string;
  title: string;
  description: string;
  priceCategories?: PriceCategory[];
  quantity?: number | null;
  isFree?: boolean;
  imageUrl: string;
  locationType: 'Virtual' | 'Physical' | 'Hybrid';
  location?: string;
  coordinates?: string;
  startDateTime: Date;
  endDateTime: Date;
  url?: string;
  organizer: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  type: {
    _id: string;
    name: string;
  };
  category: {
    _id: string;
    name: string;
  };
  contactDetails: {
    phoneNumber: string;
    email: string;
    website?: string;
    instagram?: string;
    facebook?: string;
    x?: string;
  };
};

// ====== CATEGORY PARAMS
export type CreateCategoryParams = {
  categoryName: string;
};

// ====== TYPE PARAMS
export type CreateTypeParams = {
  typeName: string;
};

// ====== ORDER PARAMS
export type CheckoutOrderParams = {
  eventTitle: string;
  eventId: string;
  price: string;
  isFree: boolean;
  buyerId: string;
};

export type CreateOrderParams = {
  stripeId: string;
  eventId: string;
  buyerId: string;
  totalAmount: string;
  createdAt: Date;
};

export type GetOrdersByEventParams = {
  eventId: string;
  searchString: string;
};

export type GetOrdersByUserParams = {
  userId: string | null;
  limit?: number;
  page: string | number | null;
};

// ====== URL QUERY PARAMS
export type UrlQueryParams = {
  params: string;
  key: string;
  value: string | null;
};

export type RemoveUrlQueryParams = {
  params: string;
  keysToRemove: string[];
};

export type SearchParamProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export type DropdownProps = {
  value: string;
  onChange: (value: string) => void;
};

export type TypeProps = {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type FormSectionProps = {
  title?: string;
  description?: string;
  children: ReactNode;
};

export type DateTimePickerProps = {
  name: string;
  label: string;
  placeholder: string;
};

export type UrlProps = {
  name: string;
  label: string;
  placeholder?: string;
};

export type LocationProps = {
  locationType: string;
  form: UseFormReturn<any>;
};

export type MapInputProps = {
  value: { location: string; coordinates: string };
  onChange: (value: { location: string; coordinates: string }) => void;
};

export type PriceCategoriesInputProps = {
  control: Control<any>;
};

export type PriceCategory = {
  name: string;
  price: string;
};
