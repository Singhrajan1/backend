// Playlist Controller Workflow
// 1. Create a new playlist for the authenticated user
// 2. Validate playlist details such as name and description
// 3. Check whether the playlist can be created successfully
// 4. Get all playlists created by a specific user
// 5. Get a single playlist using its playlistId
// 6. Verify playlist ownership before updating or deleting it
// 7. Update playlist details such as name and description
// 8. Delete a playlist after checking ownership
// 9. Add a video to a playlist after validating playlist and video
// 10. Prevent the same video from being added multiple times
// 11. Remove a video from a playlist
// 12. Get playlist details along with its videos

import { isValidObjectId } from "mongoose";
import { Playlist } from "../model/playlist.model";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Video } from "../model/video.model";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || name.trim() === "") {
    throw new ApiError(400, "name field in required to create a playlist");
  }

  const playlist = await Playlist.create({
    name: name.trim(),
    description: description?.trim() || "",
    owner: req.user._id,
  });

  if (!playlist) {
    throw new ApiError(
      500,
      "Something went wrong while creating the playlist!",
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Succussfully created a Playlist"));
});

const getAllPlaylist = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user Id");
  }

  const playlists = await Playlist.find({
    owner: userId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlists, "Successfully fetched all the playlist"),
    );
});

const getPlaylistId = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist Id");
  }

  const playlist = await Playlist.findById(playlistId)
    .populate("owner", "fullname username avatar")
    .populate("videos");

  if (!playlist) {
    throw new ApiError(404, "Playlist does'nt exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Succussfully fetched the playlist"));
});
const updatePlaylistDetails = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const { playlistId } = req.params;


  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }

  // FIX: allow name OR description to be updated

  if (
    (name === undefined || name === null) &&
    (description === undefined || description === null)
  ) {
    throw new ApiError(
      400,

      "Atleast one of the field is required for the update",
    );
  }

  if (name !== undefined && name.trim() === "") {
    throw new ApiError(400, "Playlist name cannot be empty");
  }

  const existingPlaylist = await Playlist.findById(playlistId);

  if (!existingPlaylist) {
    throw new ApiError(404, "Playlist doesn't exist");
  }

  if (existingPlaylist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to make any changes in playlist",
    );
  }

  // FIX: update only fields that were actually provided

  const updateData = {};

  if (name !== undefined) {
    updateData.name = name.trim();
  }

  if (description !== undefined) {
    updateData.description = description.trim();
  }

  const playlist = await Playlist.findByIdAndUpdate(playlistId, updateData, {
    new: true,

    runValidators: true,
  });

  if (!playlist) {
    throw new ApiError(
      500,

      "Something went wrong updating the details of the playlist",
    );
  }

  return res

    .status(200)

    .json(
      new ApiResponse(
        200,

        playlist,

        "Successfully updated the playlist details",
      ),
    );
});

const deletingPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }

  const existingPlaylist = await Playlist.findById(playlistId);

  if (!existingPlaylist) {
    throw new ApiError(404, "playlist not found");
  }

  if (existingPlaylist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "you are not authorized to delete the playlist");
  }

  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

  if (!deletedPlaylist) {
    throw new ApiError(500, "Something went wrong while deleting the playlist");
  }

  return res

    .status(200)

    .json(
      new ApiResponse(
        200,

        deletedPlaylist,

        "Successfully deleted the Playlist",
      ),
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "videoId or playlistId are Invalid!");
  }

  const existingPlaylist = await Playlist.findById(playlistId);

  if (!existingPlaylist) {
    throw new ApiError(404, "Playlist not found");
  }

  const existingVideo = await Video.findById(videoId);

  if (!existingVideo) {
    throw new ApiError(404, "Video not found");
  }

  if (existingPlaylist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,

      "you are not authorrised to make changes to the playlist",
    );
  }

  const updatePlaylist = await Playlist.findByIdAndUpdate(
    playlistId,

    { $addToSet: { videos: videoId } },

    { new: true },
  );

  if (!updatePlaylist) {
    throw new ApiError(500, "Something went wrong while updating the playlist");
  }

  return res

    .status(200)

    .json(
      new ApiResponse(
        200,

        updatePlaylist,

        "Succussfully video has been added to the playlist",
      ),
    );
});

const deleteSpecificVideo = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,

      "You are not authorized to make any changes to this playlist",
    );
  }

  // FIX: check whether the video is actually inside the playlist

  const videoExists = playlist.videos.some(
    (video) => video.toString() === videoId,
  );

  if (!videoExists) {
    throw new ApiError(
      404,

      "Video is not present in this playlist",
    );
  }

  // FIX: findByIdAndUpdate returns the updated playlist

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,

    { $pull: { videos: videoId } },

    {
      new: true,

      runValidators: true,
    },
  );

  if (!updatedPlaylist) {
    throw new ApiError(
      500,

      "Something went wrong while deleting specific video from the playlist",
    );
  }

  return res

    .status(200)

    .json(
      new ApiResponse(
        200,

        updatedPlaylist,

        "Successfully deleted specific video from the playlist",
      ),
    );
});

export {
  createPlaylist,
  getAllPlaylist,
  getPlaylistId,
  updatePlaylistDetails,
  deletingPlaylist,
  deleteSpecificVideo,
  addVideoToPlaylist,
};
