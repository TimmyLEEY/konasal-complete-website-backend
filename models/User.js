import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
   role: { type: String, default: "user" },
    resetToken: { type: String },
  resetTokenExpiry: { type: Date }
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
