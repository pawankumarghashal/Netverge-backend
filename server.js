
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import postRoutes from "./routes/posts.routes.js"
import userRoutes from "./routes/user.routes.js"
import fs from "fs";



dotenv.config();


const app = express();
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads", { recursive: true });
}
app.use(cors());
app.use(express.json());


app.use(postRoutes)
app.use(userRoutes);
app.use(express.static("uploads"))


const start = async () => {
    
    const connectDB = await mongoose.connect(process.env.MONGO_URL)
   


    app.listen(process.env.PORT || 9090, () => {
    console.log(`server is running on port ${process.env.PORT || 9090}`);
});

 
}

start();