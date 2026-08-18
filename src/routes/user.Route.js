import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refrshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  updateAccountDetails,
} from "../controller/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser,
);

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyUser, logoutUser);
router.route("/refreshToken").post(refrshAccessToken);
router.route("/change-password").post(verifyUser, changeCurrentPassword);
router.route("/current-user").get(verifyUser, getCurrentUser);
router.route("/update-account").patch(verifyUser, updateAccountDetails);

router
  .route("/avatar")
  .patch(verifyUser, upload.single("avatar"), updateUserAvatar);
router
  .route("/cover-image")
  .patch(verifyUser, upload.single("coverImage"), updateUserCoverImage);

router.route("/c/:username").get(verifyUser, getUserChannelProfile);
router.route("/history").get(verifyUser, getWatchHistory);
// console.log(registerUser)

export default router;
