import mongoose, { schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObejectId,
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObejectId,
      ref: "User",
    },
  },
  { timestamp: true },
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);
