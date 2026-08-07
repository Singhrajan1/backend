import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiError.js"
import {User} from "../model/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/apiResponse.js"

    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
 
const registerUser= asyncHandler( async(req,res) => {
   const{fullname,email,username,password}=req.body
   console.log("email: ",email);

//    if(fullname == ""){
//         throw new ApiError(400,"fullname is required")
//    }
    if(
        [fullname , email , username , password].some((field) =>field?.trim() === "")
    ){
        throw new ApiError(400,"All field is required");
    }

    const existingUser = User.findOne({
        $or: [{email},{username}]
    })

    if(existingUser){
        throw new ApiError(409,"User with this email or username already exists")
    }

    console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;

    // const coverImageLocalPath  = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar field should not be empty")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar) throw new ApiError(400,"avatar file is required")

    const user = await User.create({
        fullname,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        username : username.toLowerCase(),
        email,
        password
    })

    const UserCreated =  await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!UserCreated){
        throw new ApiError(500,"Something want error")
    }

    return  res.status(200).json(
        new ApiResponse(200,UserCreated,"User registered successfully")
    )

})

export {registerUser}