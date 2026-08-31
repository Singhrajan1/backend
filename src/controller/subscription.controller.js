// Subscription Controller Workflow
// 1. Subscribe to a user's channel
// 2. Validate the channel/user ID
// 3. Check whether the channel/user exists
// 4. Prevent a user from subscribing to their own channel
// 5. Prevent duplicate subscriptions
// 6. Create a new subscription
// 7. Unsubscribe from a user's channel
// 8. Validate the subscription/channel ID
// 9. Check whether the subscription exists
// 10. Verify that the current user is the subscriber
// 11. Delete the subscription
// 12. Get all subscribers of a channel
// 13. Get all channels subscribed to by a user
// 14. Get the subscriber count of a channel
// 15. Check whether the current user has subscribed to a channel

import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../model/user.model";
import { Subscription } from "../model/subscription.model";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const subscriber = req.user._id;
  if (req.user._id.equals(channelId)) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  const channelExists = await User.findById(channelId);
  if (!channelExists) {
    throw new ApiError(404, "Channel not found");
  }

  const existingSubscribion = await Subscription.findOne({
    subscriber,
    channel: channelId
  });

  if (existingSubscribion) {
    await Subscription.findByIdAndDelete(existingSubscribion._id);

    return res
      .status(200)
      .json(new ApiResponse(200, { subscribed: false }, "Successfully unsubscribed to this channel"));
  }

  await Subscription.create({
    subscriber,
    channel: channelId
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { subscribed: true }, "Successfully subscribed"));
});

export { toggleSubscription };

const getSubscriptionChannels = asyncHandler(async(req,res)=>{
  const {loggesIn} = req.user._id

  
})