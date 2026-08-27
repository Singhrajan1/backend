import { Router } from "express";
import {
  publishVideo,
  getVideoById,
  removeVideo,
} from "../controller/video.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").post(
  verifyUser,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishVideo,
);

router.route("/:videoId").get(getVideoById).delete(verifyUser, removeVideo);

export default router;
