const mongoose = require("mongoose")
require('dotenv').config();

const dbUrl: string = process.env.MONGO_URL || '';

const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log("DB Connected Successfully !")
  } catch (error: any) {
    console.error('MongoDB connection error:', error.message);
  }
}

export default connectDB;
