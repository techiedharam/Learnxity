import mongoose, { Document, Model, Schema, } from 'mongoose'
import bcrypt from "bcryptjs"

const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IUser extends Document {
  name: string,
  email: string,
  password: string,
  avatar: {
    public_id: string,
    url: string
  };
  role: string,
  isVerified: Boolean,
  courses: Array<{ courseId: string }>;
  comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema: Schema<IUser> = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name "]
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    validate: {
      validator: function (value: string) {
        return emailRegexPattern.test(value)
      },
      message: "Please enter a valid email"
    },
    unique: true
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [6, "Password must be atleast 6 character"],
    select: false
  },
  avatar: {
    public_id: String,
    url: String,
  },
  role: {
    type: String,
    default: "user"
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  courses: [
    {
      courseId: String,

    }
  ],
}, { timestamps: true })

const userModel: Model<IUser> = mongoose.model("User", UserSchema);

export default userModel;