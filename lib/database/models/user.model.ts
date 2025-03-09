import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  paystackAccountCode: { type: String },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  role: { type: String, default: 'user' },
});

const User = models.User || model('User', UserSchema);

export default User;
