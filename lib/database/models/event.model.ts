import { Document, Schema, model, models } from 'mongoose';

export interface IEvent extends Document {
  _id: string;
  title: string;
  subtitle?: string;
  description: string;
  imageUrl: string;
  location?: string;
  coordinates?: string;
  locationType: 'Virtual' | 'Physical' | 'Hybrid';
  startDate: Date;
  endDate: Date;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
  priceCategories?: { name: string; price: string }[];
  quantity?: number | null;
  currency: 'NGN';
  isFree?: boolean;
  url?: string;
  type: { _id: string; name: string; color: string };
  category: { _id: string; name: string; color: string };
  organizer: { _id: string; firstName: string; lastName: string };
  contactDetails: {
    email: string;
    website?: string;
    phoneNumber?: string;
    instagram?: string;
    facebook?: string;
    x?: string;
    linkedin?: string;
  };
  status: 'draft' | 'published';
}

const EventSchema = new Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String, required: true },
    locationType: {
      type: String,
      enum: ['Virtual', 'Physical', 'Hybrid'],
      required: true,
    },
    location: { type: String },
    coordinates: { type: String },
    imageUrl: { type: String, required: true },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date, required: true, default: Date.now },
    startTime: { type: Date, required: true, default: Date.now },
    endTime: { type: Date, required: true, default: Date.now },
    isFree: { type: Boolean, default: false },
    priceCategories: [
      {
        name: { type: String, required: true, trim: true },
        price: { type: String, required: true, trim: true },
      },
    ],
    quantity: { type: Number, default: null },
    currency: { type: String, enum: ['NGN'], required: true },
    url: { type: String },
    type: { type: Schema.Types.ObjectId, ref: 'Type' },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    organizer: { type: Schema.Types.ObjectId, ref: 'User' },
    contactDetails: {
      email: { type: String, required: true },
      website: { type: String },
      phoneNumber: { type: String },
      instagram: { type: String },
      facebook: { type: String },
      x: { type: String },
      linkedin: { type: String },
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

const Event = models.Event || model<IEvent>('Event', EventSchema);

export default Event;
