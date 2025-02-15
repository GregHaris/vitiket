// ====== EVENT PARAMS
export type CreateEventParams = {
  userId: string;
  event: {
    title: string;
    description?: string;
    location?: string;
    imageUrl: string;
    startDateTime: Date;
    endDateTime: Date;
    categoryId: string;
    price: number;
    currency: string;  
    isFree: boolean;
    url?: string;
    contactDetails: {
      phoneNumber: string;
      email: string;
      website?: string;
      instagram?: string;
      facebook?: string;
      x?: string;
    };
  };
  path: string;
};

export type UpdateEventParams = {
  userId: string;
  event: {
    _id: string;
    title: string;
    description?: string;
    location?: string;
    imageUrl: string;
    startDateTime: Date;
    endDateTime: Date;
    categoryId: string;
    price: number;
    currency: string;  
    isFree: boolean;
    url?: string;
    contactDetails: {
      phoneNumber: string;
      email: string;
      website?: string;
      instagram?: string;
      facebook?: string;
      x?: string;
    };
  };
  path: string;
};

export type Event = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  isFree: boolean;
  imageUrl: string;
  location?: string;
  startDateTime: Date;
  endDateTime: Date;
  url?: string;
  organizer: {
    _id: string;
    firstName: string;
    lastName: string;
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
