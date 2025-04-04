import mongoose, { Schema } from "mongoose";

const TokenSchema = new Schema({
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  expiresAt: { type: Number, required: true },
  provider: { type: String, required: true, default: "zoho" },
  updatedAt: { type: Date, default: Date.now },
});

const Token = mongoose.models.Token || mongoose.model("Token", TokenSchema);
export default Token;
