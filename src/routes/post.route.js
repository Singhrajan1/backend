import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createPost,
  getUserPosts,
  updatePost,
  deletePost,
} from "../controllers/post.controller.js";

const router = Router();

router.route("/").post(verifyJWT, upload.single("image"), createPost);
router.route("/user/:userId").get(getUserPosts); // public — no verifyJWT
router.route("/:postId")
  .patch(verifyJWT, upload.single("image"), updatePost)
  .delete(verifyJWT, deletePost);

export default router;