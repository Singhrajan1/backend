import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
  toggleVideoLike,
  toggleCommentLike,
  togglePostLike,
  getVideoLikesCount,
  getCommentLikesCount,
  getPostLikesCount,
  isVideoLikedByUser,
  isCommentLikedByUser,
  isPostLikedByUser,
} from "../controller/like.controller.js";

const router = Router();

router.route("/toggle/video/:videoId").post(verifyJWT, toggleVideoLike);

router.route("/toggle/comment/:commentId").post(verifyJWT, toggleCommentLike);

router.route("/toggle/post/:postId").post(verifyJWT, togglePostLike);

router.route("/count/video/:videoId").get(getVideoLikesCount);

router.route("/count/comment/:commentId").get(getCommentLikesCount);

router.route("/count/post/:postId").get(getPostLikesCount);

router.route("/status/video/:videoId").get(verifyJWT, isVideoLikedByUser);

router.route("/status/comment/:commentId").get(verifyJWT, isCommentLikedByUser);

router.route("/status/post/:postId").get(verifyJWT, isPostLikedByUser);

export default router;