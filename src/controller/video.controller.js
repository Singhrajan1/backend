import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../model/video.model.js";
import { isValidObjectId } from "mongoose";

// Video Controller Workflow
// 1. Upload video and thumbnail to Cloudinary
// 2. Roll back Cloudinary uploads if any upload fails
// 3. Create and save video details in MongoDB
// 4. Get a single video using its videoId
// 5. Delete a video after checking ownership
// 6. Remove video and thumbnail from Cloudinary before deleting the database record
// 7. Get all published videos with search, filtering, sorting and pagination
// 8. Search videos by title and return matching videos

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video and thumbnail are both required");
  }

  const videoUpload = await uploadOnCloudinary(videoLocalPath);

  if (!videoUpload?.url || !videoUpload?.public_id) {
    throw new ApiError(500, "Failed to upload the video");
  }

  let thumbnailUpload;

  try {
    thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnailUpload?.url || !thumbnailUpload?.public_id) {
      throw new Error("Thumbnail upload failed");
    }
  } catch (error) {
    console.error("Thumbnail upload failed:", error);

    try {
      await deleteFromCloudinary(videoUpload.public_id, "video");
    } catch (cleanupError) {
      console.error("Video rollback failed:", cleanupError);
    }

    throw new ApiError(
      500,
      "Failed to upload thumbnail. Video upload was rolled back",
    );
  }

  let video;

  try {
    video = await Video.create({
      title: title.trim(),
      description: description.trim(),

      videoFile: videoUpload.url,
      videoFilePublicId: videoUpload.public_id,

      thumbnail: thumbnailUpload.url,
      thumbnailPublicId: thumbnailUpload.public_id,

      duration: videoUpload.duration,

      owner: req.user._id,
    });
  } catch (error) {
    console.error("Video creation failed:", error);

    try {
      await deleteFromCloudinary(videoUpload.public_id, "video");

      await deleteFromCloudinary(thumbnailUpload.public_id, "image");
    } catch (cleanupError) {
      console.error("Cloudinary rollback failed:", cleanupError);
    }

    throw new ApiError(500, "Failed to create video in database");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId)
    .populate("owner", "fullname username avatar")
    .lean();

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video found successfully"));
});

const removeVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  try {
    await deleteFromCloudinary(video.videoFilePublicId, "video");

    await deleteFromCloudinary(video.thumbnailPublicId, "image");
  } catch (error) {
    console.error("Cloudinary cleanup failed:", error);

    throw new ApiError(500, "Failed to delete video files from Cloudinary");
  }

  const deletedVideo = await Video.findByIdAndDelete(videoId);

  if (!deletedVideo) {
    throw new ApiError(500, "Failed to delete the video from database");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Video deleted successfully"));
});

const getAllVideo = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const filter = {
    isPublished: true,
  };

  // Filter by user
  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid user ID");
    }

    filter.owner = userId;
  }

  // Search by video title
  if (query.trim()) {
    filter.title = {
      $regex: query.trim(),
      $options: "i",
    };
  }

  // Allowed fields for sorting
  const allowedSortFields = ["createdAt", "title", "views", "duration"];

  if (!allowedSortFields.includes(sortBy)) {
    throw new ApiError(400, "Invalid sort field");
  }

  // Pagination
  const pageNumber = Math.max(1, parseInt(page, 10) || 1);

  const limitNumber = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

  const skip = (pageNumber - 1) * limitNumber;

  // Sorting
  const sortOrder = sortType === "asc" ? 1 : -1;

  const [videos, totalVideos] = await Promise.all([
    Video.find(filter)
      .populate("owner", "fullname username avatar")
      .sort({
        [sortBy]: sortOrder,
      })
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    Video.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalVideos / limitNumber);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        totalVideos,
        totalPages,
        currentPage: pageNumber,

        hasNextPage: pageNumber < totalPages,

        hasPreviousPage: pageNumber > 1,
      },
      "Videos fetched successfully",
    ),
  );
});

export { publishVideo, getVideoById, removeVideo, getAllVideo };
