import express from "express";
import { 
  registerUser, 
  loginUser, 
  forgotPassword, 
  resetPassword 
} from "../controllers/authController.js";

const router = express.Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);  // ✅ add
router.post("/reset-password", resetPassword);    // ✅ add

export default router;
