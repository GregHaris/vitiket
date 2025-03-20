import { Document, Schema, model, models } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  events: string[];
  orders: string[];
  subaccountCode?: string;
  businessName?: string;
  bankName?: string;
  bankDetails?: {
    accountNumber: string;
    accountName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    firstName: { type: String },
    lastName: { type: String },
    events: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
    orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
    subaccountCode: { type: String, required: false },
    businessName: { type: String },
    bankName: { type: String },
    bankDetails: {
      accountNumber: { type: String },
      accountName: { type: String },
    },
  },
  { timestamps: true }
);

export default models.User || model('User', UserSchema);
