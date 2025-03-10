import { Schema, model, models } from 'mongoose';

export interface IUser {
  _id: string;
  clerkId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
  role: string;
  businessName?: string;
  subaccountCode?: string;
  bankName?: string;
  bankDetails?: {
    bankCode?: string;
    accountNumber?: string;
  };
}

const UserSchema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  subaccountCode: { type: String },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  role: { type: String, default: 'user' },
  businessName: { type: String },
  bankName: { type: String },
  bankDetails: {
    bankCode: { type: String },
    accountNumber: { type: String },
  },
});

const User = models.User || model('User', UserSchema);

export default User;
