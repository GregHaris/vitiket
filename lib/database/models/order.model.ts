import { Schema, model, models, Document } from 'mongoose';

export interface IOrder extends Document {
  createdAt: Date;
  stripeId?: string;
  totalAmount: string;
  currency: string;
  event: {
    _id: string;
    title: string;
  };
  buyer: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  buyerEmail: string;
  paymentMethod: 'paystack' | 'card' | 'googlePay' | 'applePay';
  quantity: number;
}

export type IOrderItem = {
  _id: string;
  totalAmount: string;
  createdAt: Date;
  eventTitle: string;
  eventId: string;
  buyer: string;
  buyerEmail: string;
  currency: string;
  paymentMethod: 'paystack' | 'card' | 'googlePay' | 'applePay';
  quantity: number;
};

const OrderSchema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  stripeId: {
    type: String,
    unique: true,
    required: false,
  },
  totalAmount: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
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
    required: true,
  },
  buyerEmail: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['paystack', 'card', 'googlePay', 'applePay'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
});

const Order = models.Order || model('Order', OrderSchema);

export default Order;
