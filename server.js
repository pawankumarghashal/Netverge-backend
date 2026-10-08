
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import postRoutes from "./routes/posts.routes.js"
import userRoutes from "./routes/user.routes.js"




dotenv.config();


const app = express();
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