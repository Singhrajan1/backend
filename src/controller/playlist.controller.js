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

const userPlaylist = asyncHandler(async (req, res) => {
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

  const playlist = await Playlist.findById(playlistId).populate(
    "owner",
    "fullname username avatar",
  ).populate("videos")

  if(!playlist){
    throw new ApiError(404,"Playlist does'nt exist")
  }

  return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Succussfully fetched the playlist"))
});

export { userPlaylist, getAllPlaylist, getPlaylistId };
