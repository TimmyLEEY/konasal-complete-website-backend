import express from "express";
import EbookLead from "../models/EbookLead.js";

const router = express.Router();

// Submit eBook form
router.post("/", async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    // Check if email already exists
    const existingLead = await EbookLead.findOne({ email });
    if (existingLead) {
      return res.status(409).json({ message: "This email has already been submitted!" }); // 409 Conflict
    }

    // Create new lead
    const newLead = await EbookLead.create({ name, email, phone });

    res.status(201).json({ 
      message: "Thank you! Your information has been submitted.", 
      lead: newLead 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
});

router.get("/", async (req, res) => {
  try {
    const leads = await EbookLead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch eBook leads." });
  }
});

// Delete a lead by ID (Admin only)
router.delete("/:id", async (req, res) => {
  try {
    const lead = await EbookLead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json({ message: "Lead deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete lead." });
  }
});

export default router;
