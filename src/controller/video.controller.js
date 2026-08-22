import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { User } from "../model/user.model";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary";
import { Video } from "../model/video.model";

//upload a video to the cloudinary using fs and multer
//check whether the video is uploaded or not
//remove video
//get All the video user has updated

const publishVideo = asyncHandler(async (req, res) => {
  const { title, discription } = req.body;

  if ([title, discription].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "title and discription are required");
  }

  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!(videoLocalPath || thumnailLocalPath)) {
    throw new ApiError(400, "video and thumbnail both are required");
  }

  const videoUpload = await uploadOnCloudinary(videoLocalPath);

  if (!videoUpload?.url) {
    throw new ApiError(500, "Failed to upload the video");
  }

  let thumbnailUpload;
  try {
    thumbnailUpload = await uploadOnCloudinary(thumnailLocalPath);
    if (!thumbnailUpload?.url) {
      throw new ApiError(500, "Failed to upload the thumbnail");
    }
  } catch (error) {
    console.error("thumbnail upload failed", error);
    await deleteFromCloudinary(videoUpload.public_id, "video");
    throw new ApiError(
      500,
      "failed to upload the thumbnail so we have to roll back the video upload also",
    );
  }

  const video = await Video.create({
        title,
        description,
        videoFile: videoUpload.url,
        videoFilePublicId: videoUpload.public_id,
        thumbnail: thumbnailUpload.url,
        thumbnailPublicId: thumbnailUpload.public_id,
        duration: videoUpload.duration,
        owner: req.user._id,
    });

    if(!video){
        throw new ApiError(500,"Something has gone wrong while uploading the video")
    }

    return res.status(200).json(new ApiResponse(200,"video uploaded successfully"))
});

export {publishVideo}
