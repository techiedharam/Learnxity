require('dotenv').config();
import mongoose, { Document, Model, Schema, } from 'mongoose'
import jwt from 'jsonwebtoken'
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
  // comparePassword: (password: string) => Promise<boolean>;
  SignAccessToken: () => string,
  SignRefreshToken: () => string,
}

const userSchema: Schema<IUser> = new mongoose.Schema({
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
    // required: [true, "Please enter your password"], - social auth doesn't need password
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

userSchema.methods.SignAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || '', {
    expiresIn: "5m"
  });
};
userSchema.methods.SignRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || '', {
    expiresIn: "7d"
  });
};

const userModel: Model<IUser> = mongoose.model("User", userSchema);

export default userModel;