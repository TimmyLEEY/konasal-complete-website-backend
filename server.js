import dotenv from "dotenv";
dotenv.config();
import express from "express";


import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import formsRoutes from "./routes/forms.js"
import ebookRoutes from "./routes/ebookRoutes.js";





connectDB();

const allowedOrigins = [
  'http://localhost:3000',                       // local frontend
  'https://konasalinsurance.netlify.app'        // deployed frontend
];

const app = express();
app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (like Postman)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true  // if using cookies or auth headers
}));
app.use(express.json());


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/forms", formsRoutes);
app.use("/api/ebook", ebookRoutes);


const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
