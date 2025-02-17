import { Document, Schema, model, models } from 'mongoose';

export interface IEvent extends Document {
  _id: string;
  title: string;
  description?: string;
  location?: string;
  isOnline: boolean;
  isHybrid: boolean;
  imageUrl: string;
  startDateTime: Date;
  endDateTime: Date;
  createdAt: Date;
  updatedAt: Date;
  price: string;
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
    description: { type: String },
    location: { type: String },
    isOnline: { type: Boolean, default: false },
    isHybrid: { type: Boolean, default: false },
    imageUrl: { type: String, required: true },
    startDateTime: { type: Date, required: true, default: Date.now },
    endDateTime: { type: Date, required: true, default: Date.now },
    price: { type: String },
    currency: { type: String, required: true },
    isFree: { type: Boolean, default: false },
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
