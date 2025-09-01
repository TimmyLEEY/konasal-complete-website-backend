import mongoose from "mongoose";

const ebookLeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  otherInfo: { type: String }
}, { timestamps: true }); // gives createdAt field

export default mongoose.model("EbookLead", ebookLeadSchema);
