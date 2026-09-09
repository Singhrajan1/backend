import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPlaylist,
  getAllPlaylist,
  getPlaylistId,
  updatePlaylistDetails,
  deletingPlaylist,
  deleteSpecificVideo,
  addVideoToPlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();

router.route("/").post(verifyJWT, createPlaylist);

router.route("/user/:userId").get(getAllPlaylist);

router
  .route("/:playlistId")
  .get(getPlaylistId)
  .patch(verifyJWT, updatePlaylistDetails)
  .delete(verifyJWT, deletingPlaylist);

router.route("/:playlistId/videos/:videoId")
  .post(verifyJWT, addVideoToPlaylist)
  .delete(verifyJWT, deleteSpecificVideo);

export default router;