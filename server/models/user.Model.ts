require("dotenv").config();
import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { NextFunction } from "express";

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  isVerified: boolean;
  courses: Array<{ courseId: string }>;
  comparePassword: (password: string) => Promise<boolean>;
  SignAccessToken : () => String;
  SignRefreshToken : () => String;


}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      validate: {
        validator: (value: string) => emailRegex.test(value),
        message: "Invalid email",
      },
    },
    password: {
      type: String,
      select: false,
    },
    avatar: {
      type: {
        public_id: String,
        url: String,
      },
    },
    role: {
      type: String,
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    courses: [
      {
        courseId: String,
      },
    ],
  },
  { timestamps: true }
);

// sign Acess Token

userSchema.methods.SignAccessToken = function () {
  return jwt.sign({id:this._id}, process.env.ACCESS_TOKEN || "")
  
}

// sign Refresh Token

userSchema.methods.SignRefreshToken = function () {
  return jwt.sign({id:this._id}, process.env.REFRESH_TOKEN || "")
  
}



// Hash password before saving
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.model<IUser>("User", userSchema);

export default UserModel;
