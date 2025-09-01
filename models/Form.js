import mongoose from "mongoose";

const FormSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  formType: { type: String, required: true }, // "checkbox" or "input"
  data: { type: Object, required: true },
  submittedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Form", FormSchema);
