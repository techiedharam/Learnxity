import { app } from "./app";
require('dotenv').config();
import { v2 as cloudinary } from 'cloudinary';
import connectDB from "./config/db";
const port = process.env.PORT || 5000;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY,
});

app.listen(port, async () => {
  await connectDB()
  console.log(`Learnxity webApp Server is running on http://localhost:${port}`);
});
