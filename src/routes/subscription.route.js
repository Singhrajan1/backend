import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleSubscription,
  getSubscribedChannels,
  getUserChannelSubscribers,
} from "../controllers/subscription.controller.js";

const router = Router();

router.route("/toggle/:channelId").post(verifyJWT, toggleSubscription);
router.route("/subscribed-channels").get(verifyJWT, getSubscribedChannels);

// This one is mixed public/private internally (count vs list) — verifyJWT still needed
// so req.user exists when the requester IS the owner; anonymous users will crash here
// unless your verifyJWT allows guests through. See note below the code.
router.route("/subscribers/:channelId").get(verifyJWT, getUserChannelSubscribers);

export default router;