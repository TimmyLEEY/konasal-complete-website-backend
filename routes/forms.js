import express from "express";
import Form from "../models/Form.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Submit form (any logged-in user)
router.post("/", async (req, res) => {
  try {
    const { userId, formType, data } = req.body;

    if (!userId || !formType || !data) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newForm = await Form.create({ userId, formType, data });
    res.status(201).json(newForm);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all submissions (admin only)
router.get("/", protectAdmin, async (req, res) => {
  try {
    const forms = await Form.find()
      .populate("userId", "name email") // populate user info
      .sort({ submittedAt: -1 });
    res.json(forms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a form by ID (admin only)
router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    const form = await Form.findByIdAndDelete(req.params.id);
    if (!form) return res.status(404).json({ error: "Form not found" });
    res.json({ message: "Form deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
