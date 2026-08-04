import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError, apiError} from "../utils/apiError.js"
import {User} from "../model/user.model.js"


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
})

export {registerUser}