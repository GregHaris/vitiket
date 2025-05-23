import { Schema, model, models, Document } from 'mongoose';
import { IEvent } from './event.model';

export interface IOrder extends Document {
  _id: string;
  createdAt: Date;
  event: IEvent;
  totalAmount: string;
  currency: 'NGN';
  buyer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  buyerEmail: string;
  firstName: string;
  lastName: string;
  paymentMethod: 'paystack' | 'none';
  quantity: number;
  priceCategories?: { name: string; price: string; quantity: number }[];
}

export type IOrderItem = {
  _id?: string;
  totalAmount: string;
  createdAt: Date;
  eventTitle: string;
  eventId: string;
  buyer: string;
  buyerEmail: string;
  currency: 'NGN';
  paymentMethod: 'paystack' | 'none'; 
  quantity: number;
};

const OrderSchema = new Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now,
    },
    totalAmount: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      enum: ['NGN'], 
      required: true,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    buyerEmail: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['paystack', 'none'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    priceCategories: [
      {
        name: { type: String, required: true },
        price: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    reference: { type: String, unique: true },
    paymentStatus: { type: String, default: 'pending' },
  },
  { strict: false }
);

const Order = models.Order || model('Order', OrderSchema);

export default Order;
