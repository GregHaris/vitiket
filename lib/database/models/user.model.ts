import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    firstName: { type: String },
    lastName: { type: String },
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    subaccountCode: { type: String, required: false },
    businessName: { type: String },
    bankName: { type: String },
    bankDetails: {
      accountNumber: { type: String },
      accountName: { type: String },
    },
    stripeId: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
