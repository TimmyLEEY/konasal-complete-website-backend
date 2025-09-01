import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import formsRoutes from "./routes/forms.js"
import ebookRoutes from "./routes/ebookRoutes.js";



dotenv.config();
connectDB();

const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true, // if you use cookies/auth headers
}));
app.use(express.json());


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/forms", formsRoutes);
app.use("/api/ebook", ebookRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
