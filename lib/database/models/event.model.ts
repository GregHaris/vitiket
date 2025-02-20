import { Document, Schema, model, models } from 'mongoose';

export interface IEvent extends Document {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  location?: string;
  coordinates?: string;
  locationType: 'Online' | 'In-Person' | 'Hybrid';
  startDateTime: Date;
  endDateTime: Date;
  createdAt: Date;
  updatedAt: Date;
  onlinePrice: string;
  inPersonPrice: string;
  priceCategories: { name: string; price: string }[];
  currency: string;
  isFree: boolean;
  url?: string;
  type: { _id: string; name: string };
  category: { _id: string; name: string };
  organizer: { _id: string; firstName: string; lastName: string };
  contactDetails: {
    phoneNumber: string;
    email: string;
    website?: string;
    instagram?: string;
    facebook?: string;
    x?: string;
  };
}

const EventSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    locationType: {
      type: String,
      enum: ['Online', 'In-Person', 'Hybrid'],
      required: true,
    },
    location: { type: String },
    coordinates: { type: String },
    imageUrl: { type: String, required: true },
    startDateTime: { type: Date, required: true, default: Date.now },
    endDateTime: { type: Date, required: true, default: Date.now },
    onlinePrice: { type: String },
    inPersonPrice: { type: String },
    isFree: { type: Boolean, default: false },
    priceCategories: [
      {
        name: { type: String, required: true },
        price: { type: String, required: true },
      },
    ],
    currency: { type: String, required: true },
    url: { type: String },
    type: { type: Schema.Types.ObjectId, ref: 'Type' },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    organizer: { type: Schema.Types.ObjectId, ref: 'User' },
    contactDetails: {
      phoneNumber: { type: String, required: true },
      email: { type: String, required: true },
      website: { type: String },
      instagram: { type: String },
      facebook: { type: String },
      x: { type: String },
    },
  },
  { timestamps: true }
);

const Event = models.Event || model<IEvent>('Event', EventSchema);

export default Event;
