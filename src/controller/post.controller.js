import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary";
import { Post } from "../model/post.model";
import { isValidObjectId } from "mongoose";

const createPost = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, "Post content is required");
  }

  const imageLocalPath = req.file?.path;

  let imageUpload;

  if (imageLocalPath) {
    imageUpload = await uploadOnCloudinary(imageLocalPath);

    if (!imageUpload?.url || !imageUpload?.public_id) {
      throw new ApiError(500, "Failed to upload the image");
    }
  }

  let post;

  try {
    post = await Post.create({
      content: content.trim(),

      image: imageUpload
        ? {
            url: imageUpload.url,
            publicId: imageUpload.public_id,
          }
        : undefined,

      owner: req.user._id,
    });
  } catch (error) {
    console.error("Post creation failed:", error);

    if (imageUpload?.public_id) {
      try {
        await deleteFromCloudinary(imageUpload.public_id, "image");
      } catch (err) {
        console.error("Image rollback failed:",err);
      }
    }

    throw new ApiError(500, "Failed to create post in database");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, post, "Post created successfully"));
});

const getUserPosts = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const posts = await Post.find({ owner: userId })
    .populate("owner", "fullname username avatar")
    .sort({ createdAt: -1 })
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, posts, "Posts fetched successfully"));
});

const updatePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid post ID");
  }

  if (!content?.trim()) {
    throw new ApiError(400, "Post content is required");
  }

  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (post.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this post");
  }

  const imageLocalPath = req.file?.path;

  let imageUpload;

  if (imageLocalPath) {
    imageUpload = await uploadOnCloudinary(imageLocalPath);

    if (!imageUpload?.url || !imageUpload?.public_id) {
      throw new ApiError(500, "Failed to upload the new image");
    }
  }

  post.content = content.trim();

  if (imageUpload) {
    if (post.image?.publicId) {
      await deleteFromCloudinary(post.image.publicId, "image");
    }

    post.image = {
      url: imageUpload.url,
      publicId: imageUpload.public_id,
    };
  }

  const updatedPost = await post.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPost, "Post updated successfully"));
});

const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid post ID");
  }

  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (post.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this post");
  }

  if (post.image?.publicId) {
    try {
      await deleteFromCloudinary(post.image.publicId, "image");
    } catch (error) {
      console.error("Cloudinary cleanup failed:", error);

      throw new ApiError(
        500,
        "Failed to delete post image from Cloudinary",
      );
    }
  }

  const deletedPost = await Post.findByIdAndDelete(postId);

  if (!deletedPost) {
    throw new ApiError(500, "Failed to delete the post from database");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Post deleted successfully"));
});

export {
  createPost,
  getUserPosts,
  updatePost,
  deletePost,
}
