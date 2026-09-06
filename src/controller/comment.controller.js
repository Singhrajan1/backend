import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { isValidObjectId } from "mongoose";
import { Comment } from "../model/comments.model";
import { Post } from "../model/post.model";
import { Video } from "../model/video.model";
import { asyncHandler } from "../utils/asyncHandler";

// const createComment = asyncHandler(async (req, res) => {
//   const { content } = req.body;
//   const { videoId, postId } = req.params;

//   if (!content || !content.trim()) {
//     throw new ApiError(400, "Comment content is required");
//   }

//   if (!videoId && !postId) {
//     throw new ApiError(400, "Video Id or Post Id is required");
//   }

//   if (videoId && postId) {
//     throw new ApiError(400, "Comment cannot belong to both video and post");
//   }

//   if (videoId && !isValidObjectId(videoId)) {
//     throw new ApiError(400, "Invalid video Id");
//   }
//   d
//   if (postId && !isValidObjectId(postId)) {
//     throw new ApiError(400, "Invalid post Id");
//   }

//   const commentData = {
//     content: content.trim(),
//     owner: req.user._id
//   };

//   if (videoId) {
//     const videoExists = await Video.exists({ _id: videoId });

//     if (!videoExists) {
//       throw new ApiError(404, "Video not found");
//     }

//     commentData.video = videoId;
//   }

//   if (postId) {
//     const postExists = await Post.exists({ _id: postId });

//     if (!postExists) {
//       throw new ApiError(404, "Post not found");
//     }

//     commentData.post = postId;
//   }

//   const comment = await Comment.create(commentData);

//   return res
//     .status(201)
//     .json(
//       new ApiResponse(
//         201,
//         comment,
//         "Successfully created a Comment"
//       )
//     );
// });


// const getVideoComments = asyncHandler(async (req, res) => {

//     const { videoId } = req.params;

//     if (!isValidObjectId(videoId)) {
//         throw new ApiError(400, "Invalid videoId");
//     }

//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;

//     if (page < 1 || limit < 1) {
//         throw new ApiError(400, "Invalid page or limit");
//     }

//     const skip = (page - 1) * limit;

//     const comment = await Comment.find({ video: videoId })
//         .populate("owner", "username avatar")
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .lean();

//     return res
//         .status(200)
//         .json(
//             new ApiResponse(
//                 200,
//                 {
//                     comment,
//                     page,
//                     limit
//                 },
//                 "Successfully fetched comments"
//             )
//         );
// });

// const getPostComments = asyncHandler(async (req, res) => {
//       const { postId } = req.params;

//     if (!isValidObjectId(postId)) {
//         throw new ApiError(400, "Invalid postId");
//     }

//     const page = Number(req.query.page) || 1;
//     const limit = Math.min(Number(req.query.limit) || 10,50);

//     if (page < 1 || limit < 1) {
//         throw new ApiError(400, "Invalid page or limit");
//     }

//     const skip = (page - 1) * limit;

//     const comment = await Comment.find({ post:postId })
//         .populate("owner", "username avatar")
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit)
//         .lean();

//     return res
//         .status(200)
//         .json(
//             new ApiResponse(
//                 200,
//                 {
//                     comment,
//                     page,
//                     limit
//                 },
//                 "Successfully fetched comments"
//             )
//         );
// });

const getComments = async (filter, skip, limit) => {
  return await Comment.find(filter)
    .populate("owner", "username avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

const createComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId, postId } = req.params;

  if (!content || !content.trim()) {
    throw new ApiError(400, "Comment content is required");
  }

  if (!videoId && !postId) {
    throw new ApiError(400, "Video Id or Post Id is required");
  }

  if (videoId && postId) {
    throw new ApiError(
      400,
      "Comment cannot belong to both video and post"
    );
  }

  if (videoId && !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video Id");
  }

  if (postId && !isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid post Id");
  }

  const commentData = {
    content: content.trim(),
    owner: req.user._id
  };

  if (videoId) {
    const videoExists = await Video.exists({
      _id: videoId
    });

    if (!videoExists) {
      throw new ApiError(404, "Video not found");
    }

    commentData.video = videoId;
  }

  if (postId) {
    const postExists = await Post.exists({
      _id: postId
    });

    if (!postExists) {
      throw new ApiError(404, "Post not found");
    }

    commentData.post = postId;
  }

  const comment = await Comment.create(commentData);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        comment,
        "Successfully created a Comment"
      )
    );
});

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 10, 50);

  if (page < 1 || limit < 1) {
    throw new ApiError(400, "Invalid page or limit");
  }

  const skip = (page - 1) * limit;

  const comments = await getComments(
    { video: videoId },
    skip,
    limit
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          comments,
          page,
          limit
        },
        "Successfully fetched comments"
      )
    );
});

const getPostComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!isValidObjectId(postId)) {
    throw new ApiError(400, "Invalid postId");
  }

  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 10, 50);

  if (page < 1 || limit < 1) {
    throw new ApiError(400, "Invalid page or limit");
  }

  const skip = (page - 1) * limit;

  const comments = await getComments(
    { post: postId },
    skip,
    limit
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          comments,
          page,
          limit
        },
        "Successfully fetched comments"
      )
    );
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment Id");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Comment cannot be empty");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (req.user._id.toString() !== comment.owner.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to make changes to the comment"
    );
  }

  comment.content = content.trim();

  const updatedComment = await comment.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedComment,
        "Successfully updated the comment"
      )
    );
});


const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment Id");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (req.user._id.toString() !== comment.owner.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to delete this comment"
    );
  }

  const deletedComment = await Comment.findByIdAndDelete(commentId);

  if (!deletedComment) {
    throw new ApiError(
      500,
      "Something went wrong while deleting the comment"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        deletedComment,
        "Successfully deleted the comment"
      )
    );
});

export { createComment, getVideoComments, getPostComments, updateComment, deleteComment };

