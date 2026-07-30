import mongoose, { schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const userSchema = new schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required!"],
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, "Password is required!"],
    },
    refreshToken: {
      type: String,
    },  
    watchHistroy: {
      type: Schema.Types.ObjectId,
      Ref: "Video",
    },
    coverImage: {
      type: String,
    },
    avatar: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
