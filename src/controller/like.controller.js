import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { isValidObjectId } from "mongoose";
import { Comment } from "../model/comments.model.js";
import { Post } from "../model/post.model.js";
import { Video } from "../model/video.model.js";
import { Like } from "../model/likes.model.js";


const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video Id");
  }

  const videoExists = await Video.exists({ _id: videoId });

  if (!videoExists) {
    throw new ApiError(404, "Video not found");
  }

  const likedBy = req.user._id;

  const existingVideoLike = await Like.findOne({
    likedBy,
    video: videoId
  });

  if (existingVideoLike) {
    await existingVideoLike.deleteOne();

    return res
      .status(200)
      .json(
        new ApiResponse(200, { liked: false }, "Successfully unliked the video")
      );
  }

  try {
    await Like.create({ likedBy, video: videoId });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "Video already liked");
    }
    throw error;
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { liked: true }, "User has successfully liked this video")
    );
});


const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment Id");
  }

  const commentExists = await Comment.exists({ _id: commentId });

  if (!commentExists) {
    throw new ApiError(404, "Comment not found");
  }

  const likedBy = req.user._id;

  const existingCommentLike = await Like.findOne({
    likedBy,
    comment: commentId
  });

  if (existingCommentLike) {
    await existingCommentLike.deleteOne();

    return res
      .status(200)
      .json(
        new ApiResponse(200, { liked: false }, "Successfully unliked the comment")
      );
  }

  try {
    await Like.create({ likedBy, comment: commentId });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "Comment already liked");
    }
    throw error;
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { liked: true }, "User has successfully liked this comment")
    );
});


const togglePostLike = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid post Id");
  }

  const postExists = await Post.exists({ _id: postId });

  if (!postExists) {
    throw new ApiError(404, "Post not found");
  }

  const likedBy = req.user._id;

  const existingPostLike = await Like.findOne({
    likedBy,
    post: postId
  });

  if (existingPostLike) {
    await existingPostLike.deleteOne();

    return res
      .status(200)
      .json(
        new ApiResponse(200, { liked: false }, "Successfully unliked the Post")
      );
  }

  try {
    await Like.create({ likedBy, post: postId });
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "Post already liked");
    }
    throw error;
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { liked: true }, "User has successfully liked this Post")
    );
});


const getVideoLikesCount = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video Id");
  }

  const videoExists = await Video.exists({ _id: videoId });

  if (!videoExists) {
    throw new ApiError(404, "Video not found");
  }

  const count = await Like.countDocuments({ video: videoId });

  return res
    .status(200)
    .json(new ApiResponse(200, { count }, "Video likes count fetched successfully"));
});


const getCommentLikesCount = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment Id");
  }

  const commentExists = await Comment.exists({ _id: commentId });

  if (!commentExists) {
    throw new ApiError(404, "Comment not found");
  }

  const count = await Like.countDocuments({ comment: commentId });

  return res
    .status(200)
    .json(new ApiResponse(200, { count }, "Comment likes count fetched successfully"));
});


const getPostLikesCount = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid post Id");
  }

  const postExists = await Post.exists({ _id: postId });

  if (!postExists) {
    throw new ApiError(404, "Post not found");
  }

  const count = await Like.countDocuments({ post: postId });

  return res
    .status(200)
    .json(new ApiResponse(200, { count }, "Post likes count fetched successfully"));
});


const isVideoLikedByUser = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video Id");
  }

  const likedBy = req.user._id;

  const existingVideoLike = await Like.findOne({ likedBy, video: videoId });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { liked: !!existingVideoLike }, "Video like status fetched successfully")
    );
});


const isCommentLikedByUser = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment Id");
  }

  const likedBy = req.user._id;

  const existingCommentLike = await Like.findOne({ likedBy, comment: commentId });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { liked: !!existingCommentLike }, "Comment like status fetched successfully")
    );
});


const isPostLikedByUser = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid post Id");
  }

  const likedBy = req.user._id;

  const existingPostLike = await Like.findOne({ likedBy, post: postId });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { liked: !!existingPostLike }, "Post like status fetched successfully")
    );
});


export {
  toggleVideoLike,
  toggleCommentLike,
  togglePostLike,
  getVideoLikesCount,
  getCommentLikesCount,
  getPostLikesCount,
  isVideoLikedByUser,
  isCommentLikedByUser,
  isPostLikedByUser
};


/*this marks the end of the controller and route journey and lets move to the next part where 
 i will add kafka and redis and multiple other things in this learning project make use of all the things i am using */