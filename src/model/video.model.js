import mongoose, { schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String,
      reuired: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      Ref: "User",
    },
    duration: {
      type: Number,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
    },
    title: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    desciption: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
