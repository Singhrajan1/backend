import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createComment,
  getVideoComments,
  getPostComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = Router();

router.route("/video/:videoId").post(verifyJWT, createComment).get(getVideoComments);
router.route("/post/:postId").post(verifyJWT, createComment).get(getPostComments);
router.route("/:commentId")
  .patch(verifyJWT, updateComment)
  .delete(verifyJWT, deleteComment);

export default router;