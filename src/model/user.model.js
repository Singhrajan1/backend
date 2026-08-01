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

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
  return jwt.sign({
    _id=this._id,
    email=this.email,
    fullname=this.fullname,
    username=this.username
  },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

userSchema.methods.generateAccessToken = function () {
  return jwt.sign({
    _id=this._id,
  },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

export const User = mongoose.model("User", userSchema);
