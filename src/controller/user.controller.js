import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../model/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt, { decode } from "jsonwebtoken";
import mongoose from "mongoose";

// get user details from frontend
// validation - not empty
// check if user already exists: username, email
// check for images, check for avatar
// upload them to cloudinary, avatar
// create user object - create entry in db
// remove password and refresh token field from response
// check for user creation
// return res

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(
        404,
        `Token generation failed: User not found for userId ${userId}`,
      );
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    if (!accessToken || !refreshToken) {
      throw new ApiError(
        500,
        `Token generation failed: Access token or refresh token was not generated for userId ${userId}`,
      );
    }

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("generateAccessAndRefereshTokens error:", error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      500,
      `Token generation failed: ${error?.message || "Unknown database/token error"}`,
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  if ([fullname, email, username, password].some((field) => !field?.trim())) {
    throw new ApiError(
      400,
      "Registration failed: fullname, email, username and password are required",
    );
  }

  const existingUser = await User.findOne({
    $or: [
      { email: email.toLowerCase().trim() },
      { username: username.toLowerCase().trim() },
    ],
  });

  if (existingUser) {
    throw new ApiError(
      409,
      "Registration failed: User with this email or username already exists",
    );
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Registration failed: Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar?.url) {
    throw new ApiError(
      500,
      "Registration failed: Avatar upload to Cloudinary failed",
    );
  }

  let coverImage;

  if (coverImageLocalPath) {
    coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage?.url) {
      throw new ApiError(
        500,
        "Registration failed: Cover image upload to Cloudinary failed",
      );
    }
  }

  let user;

  try {
    user = await User.create({
      fullname: fullname.trim(),
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password,
    });
  } catch (error) {
    console.error("registerUser database error:", error);

    throw new ApiError(
      500,
      `Registration failed while creating user: ${
        error?.message || "Unknown database error"
      }`,
    );
  }

  if (!user) {
    throw new ApiError(
      500,
      "Registration failed: User was not created in database",
    );
  }

  const UserCreated = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!UserCreated) {
    throw new ApiError(
      500,
      `Registration failed: User was created but could not be fetched using id ${user._id}`,
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, UserCreated, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { fullname, email, password, username } = req.body;

  if (!username?.trim() && !email?.trim()) {
    throw new ApiError(400, "Login failed: Username or email is required");
  }

  if (!password) {
    throw new ApiError(400, "Login failed: Password is required");
  }

  const user = await User.findOne({
    $or: [
      ...(username?.trim()
        ? [{ username: username.toLowerCase().trim() }]
        : []),
      ...(email?.trim() ? [{ email: email.toLowerCase().trim() }] : []),
    ],
  });

  if (!user) {
    throw new ApiError(401, "Login failed: Invalid username/email or password");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Login failed: Invalid username/email or password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id,
  );

  const loggedIn = await User.findById(user.id).select(
    "-password -refreshToken",
  );

  if (!loggedIn) {
    throw new ApiError(
      500,
      `Login failed: User disappeared after token generation. userId: ${user._id}`,
    );
  }

  const Option = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, Option)
    .cookie("refreshToken", refreshToken, Option)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedIn,
          accessToken,
          refreshToken,
        },
        "User logged in Successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Logout failed: Authenticated user was not found");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    },
  );

  if (!user) {
    throw new ApiError(
      404,
      `Logout failed: User not found for userId ${req.user._id}`,
    );
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refrshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token failed: Refresh token is missing");
  }

  try {
    const decodeToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodeToken?._id);

    if (!user) {
      throw new ApiError(
        401,
        "Refresh token failed: User associated with refresh token was not found",
      );
    }

    if (!user.refreshToken) {
      throw new ApiError(
        401,
        "Refresh token failed: No refresh token is stored for this user",
      );
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(
        401,
        "Refresh token failed: Refresh token does not match the token stored in database",
      );
    }

    const option = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user._id,
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, option)
      .cookie("refreshToken", refreshToken, option)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken,
          },
          "Access token Refreshed",
        ),
      );
  } catch (error) {
    console.error("refrshAccessToken error:", error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      401,
      `Refresh token failed: ${
        error?.message || "Invalid or expired refresh token"
      }`,
    );
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(
      400,
      "Password change failed: Old password and new password are required",
    );
  }

  if (oldPassword === newPassword) {
    throw new ApiError(
      400,
      "Password change failed: New password must be different from old password",
    );
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(
      404,
      `Password change failed: User not found for userId ${req.user?._id}`,
    );
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(
      400,
      "Password change failed: Old password is incorrect",
    );
  }

  user.password = newPassword;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(
      401,
      "Current user fetch failed: User is not authenticated",
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname?.trim() && !email?.trim()) {
    throw new ApiError(
      400,
      "Account update failed: At least fullname or email is required",
    );
  }

  const updateData = {};

  if (fullname?.trim()) {
    updateData.fullname = fullname.trim();
  }

  if (email?.trim()) {
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
      _id: { $ne: req.user._id },
    });

    if (existingUser) {
      throw new ApiError(
        409,
        "Account update failed: Email is already registered by another user",
      );
    }

    updateData.email = email.toLowerCase().trim();
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    },
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(
      404,
      `Account update failed: User not found for userId ${req.user?._id}`,
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user,
        "account details has been updated successfully",
      ),
    );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar update failed: Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar?.url) {
    throw new ApiError(
      500,
      "Avatar update failed: Cloudinary did not return an avatar URL",
    );
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      avatar: avatar.url,
    },
    {
      new: true,
      runValidators: true,
    },
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(
      404,
      `Avatar update failed: User not found for userId ${req.user?._id}`,
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "avatar has been updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(
      400,
      "Cover image update failed: Cover image file is required",
    );
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage?.url) {
    throw new ApiError(
      500,
      "Cover image update failed: Cloudinary did not return a cover image URL",
    );
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      coverImage: coverImage.url,
    },
    {
      new: true,
      runValidators: true,
    },
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(
      404,
      `Cover image update failed: User not found for userId ${req.user?._id}`,
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, user, "coverImage has been updated successfully"),
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(
      400,
      "Channel profile fetch failed: Username is missing",
    );
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase().trim(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user?._id, "$subscribers.subscriber"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(
      404,
      `Channel profile fetch failed: Channel '${username}' does not exist`,
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully"),
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  if (!user?.length) {
    throw new ApiError(
      404,
      `Watch history fetch failed: User not found for userId ${req.user._id}`,
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0]?.watchHistory || [],
        "Watch history fetched successfully",
      ),
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refrshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
