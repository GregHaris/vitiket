import { ReactNode } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { currencySymbols } from '@/constants';
import { eventFormValues } from '@/lib/validator';
import { IEvent } from '@/lib/database/models/event.model';

// ====== USER PARAMS
export type CreateUserParams = {
  clerkId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  image: string;
  role: string;
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
    subtitle?: string;
    description: string;
    locationType: 'Virtual' | 'Physical' | 'Hybrid';
    location?: string;
    coordinates?: string;
    imageUrl: string;
    startDate: Date;
    endDate: Date;
    startTime: Date;
    endTime: Date;
    typeId: string;
    categoryId: string;
    priceCategories?: PriceCategory[];
    quantity?: number | null;
    isFree?: boolean;
    url?: string;
    status?: 'draft' | 'published';
  };
  contactDetails: {
    email: string;
    phoneNumber?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
    x?: string;
    linkedin?: string;
  };
  path: string;
};

export type UpdateEventParams = {
  userId: string;
  event: {
    _id: string;
    title: string;
    subtitle?: string;
    imageUrl: string;
    description: string;
    locationType: 'Virtual' | 'Physical' | 'Hybrid';
    location?: string;
    coordinates?: string;
    startDate: Date;
    endDate: Date;
    startTime: Date;
    endTime: Date;
    typeId: string;
    categoryId: string;
    priceCategories?: PriceCategory[];
    quantity?: number | null;
    isFree?: boolean;
    url?: string;
    status?: 'draft' | 'published';
  };
  contactDetails: {
    email: string;
    phoneNumber?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
    x?: string;
    linkedin?: string;
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
  subtitle?: string;
  description: string;
  priceCategories?: PriceCategory[];
  quantity?: number | null;
  isFree?: boolean;
  imageUrl: string;
  locationType: 'Virtual' | 'Physical' | 'Hybrid';
  location?: string;
  coordinates?: string;
  startDate: Date;
  endDate: Date;
  startTime: Date;
  endTime: Date;
  url?: string;
  organizer: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  type: {
    _id: string;
    name: string;
    color: string;
  };
  category: {
    _id: string;
    name: string;
    color: string;
  };
  status: 'draft' | 'published';
  contactDetails: {
    email: string;
    phoneNumber?: string;
    website?: string;
    instagram?: string;
    facebook?: string;
    x?: string;
    linkedin?: string;
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
  currency: string;
  priceCategory?: {
    name: string;
    price: string;
  };
  quantity: number;
};

export type CreateOrderParams = {
  stripeId: string;
  eventId: string;
  buyerId: string;
  totalAmount: string;
  currency: string;
  priceCategory?: {
    name: string;
    price: string;
  };
  quantity: number;
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

export type EventFormProps = {
  userId: string;
  type: 'Create' | 'Update';
  event?: IEvent;
  eventId?: string;
};

export type PaginationProps = {
  page: number | string;
  totalPages: number;
  urlParamName?: string;
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

export type DatePickerProps = {
  name: 'startDate' | 'endDate';
  label: string;
  placeholder: string;
};

export type TimePickerProps = {
  name: 'startTime' | 'endTime';
  label: string;
  placeholder: string;
};

export type UrlProps = {
  name: 'url';
  label: string;
  placeholder?: string;
};

export type LocationProps = {
  locationType: string;
  form: UseFormReturn<eventFormValues>;
};

export type MapInputProps = {
  value: { location: string; coordinates: string };
  onChange: (value: { location: string; coordinates: string }) => void;
};

export type PriceCategory = {
  name: string;
  price: string;
};

export type IsFreeCheckboxProps = {
  onCheckedChange: (checked: boolean) => void;
};

export type AddImageProps = {
  setFiles: (files: File[]) => void;
};

export type TooltipProps = {
  content: string;
  children: ReactNode;
};

export type EventMapProps = {
  coordinates: string;
  destinationInfo: string;
};

export type CurrencyKey = keyof typeof currencySymbols;

export type CardProps = {
  event: IEvent;
  hasOrderLink?: boolean;
  hidePrice?: boolean;
};

export type PriceCardsProps = {
  event: IEvent;
  currencySymbol: string;
};

export type PriceCardUIProps = {
  title: string;
  price: string;
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  currencySymbol?: string;
};

export type ContactDetails = {
  email?: string;
  phoneNumber?: string;
  website?: string;
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  x?: string;
};

export type ContactHostProps = {
  contactDetails: ContactDetails;
};

export type ManageTypeAndCategoryProps = {
  _id: string;
  name: string;
  color: string;
};

export type CheckoutButtonProps = {
  event: IEvent;
};

export interface CheckoutDetailsProps {
  event: IEvent;
  quantity: number;
  totalPrice: number;
  selectedTickets: { [key: string]: number };
  onCloseDialog: () => void;
}

export type UserInfoInputProps = {
  name: 'email' | 'confirmEmail' | 'firstName' | 'lastName';
  placeholder: string;
  label: string;
  required?: boolean;
};

export interface Bank {
  name: string;
  code: string;
  active: boolean;
  country: string;
  currency: string;
}
