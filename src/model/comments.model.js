import mongoose, { Schema } from "mongoose";

const commentsSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

commentsSchema.index({ video: 1 });
commentsSchema.index({ post: 1 });

export const Comment = mongoose.model("Comment", commentsSchema);