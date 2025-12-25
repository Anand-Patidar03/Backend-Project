import {asyncHandler} from  "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler( async (req,res) => {
    

    const {username,email,fullName,password} = req.body
    console.log(username);
    console.log(email);
    console.log(fullName);
    console.log(password);

    // if(fullName === "")
    // {
    //     throw new ApiError(400,"Full name is required");
    // }   
    
    if([fullName,email,username,password].some((field) => field?.trim() === ""))
    {
        throw new ApiError(400,"All field are required")
        
    }

    const existedUser = User.findOne({
        $or:[{username},{email}]
    })
    
    if(existedUser)
    {
        throw new ApiError(409,"User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath)
    {
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar)
    {
        throw new ApiError(400,"Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })

    const isPresent = await User.findById(user._id).select(
        "-password -refreshToken"
    ) 

    if(!isPresent)
    {
        throw new ApiError(500,"Cannot register due to some problem !!")       
    }

    return res.status(201).json(
        new ApiResponse(200,isPresent,"User registered successfully !!")
    )
})

export {registerUser}