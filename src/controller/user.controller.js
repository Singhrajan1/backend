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


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}
 
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

    const existingUser = await User.findOne({
        $or: [{email},{username}]
    })

    if(existingUser){
        throw new ApiError(409,"User with this email or username already exists")
    }

    // console.log(req.files);`

    const avatarLocalPath = req.files?.avatar[0]?.path;

    // const coverImageLocalPath  = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar field should not be empty")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    
    if(!avatar) throw new ApiError(400,"avatar file is required")
        
    const user = await User.create({
        fullname,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        username : username.toLowerCase(),
        email,
        password
    })
    console.log(user)

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


const loginUser = asyncHandler(async(req , res)=>{
    const {fullname,email,passowrd} = req.body

    if(!username && !email){
        throw new ApiError(400 , "username or emai is required" )
    }

    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(404 , "User dose not required")
    }
    
    const isPasswordValid = await user.isPasswordCorrect(passowrd)

    if(!isPasswordValid){
        throw new ApiError(401,"User credential is wrong")
    }

    const{accessToken,refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedIn = await User.findById(user.id)
    .select("-password - refreshToken")

    const Option = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken , option)
    .cookie("refreshToken", refreshToken , option)
    new ApiResponse(
        200,
        {
            user: accessToken , loggedIn , refreshToken
        },
        "User logged in Successfully"
    )


})



export {registerUser}