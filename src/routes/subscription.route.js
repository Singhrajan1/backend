import { Router } from "express";
import { verifyJWT, optionalVerifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleSubscription,
  getSubscribedChannels,
  getUserChannelSubscribers,
} from "../controller/subscription.controller.js";

const router = Router();

router.route("/toggle/:channelId").post(verifyJWT, toggleSubscription);
router.route("/subscribed-channels").get(verifyJWT, getSubscribedChannels);

// Public / private internally (count vs list) — optionalVerifyJWT allows guests to get subscriber count
router.route("/subscribers/:channelId").get(optionalVerifyJWT, getUserChannelSubscribers);

export default router;