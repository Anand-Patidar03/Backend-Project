import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessandRefreshToken = async function (userID) {
  try {
    const user = await User.findById(userID);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    console.log("ACCESS_SECRET:", process.env.ACCESS_TOKEN_SECRET);
    console.log("ACCESS_EXP:", process.env.ACCESS_TOKEN_EXPIRY);
    console.log("REFRESH_SECRET:", process.env.REFRESH_TOKEN_SECRET);
    console.log("REFRESH_EXP:", process.env.REFRESH_TOKEN_EXPIRY);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken(); //did change see it if not run

   
    

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something error occured while generating access and refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;
  // console.log(username);
  // console.log(email);
  // console.log(fullName);
  // console.log(password);

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All field are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // console.log(req.files);

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required mandatory");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const isPresent = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!isPresent) {
    throw new ApiError(500, "Cannot register due to some problem !!");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, isPresent, "User registered successfully !!"));
});

const loginUser = asyncHandler(async (req, res) => {
  //req body -> data
  //username or email
  //find the user
  //password check
  //accesss and refresh token

  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "username/email is required");
  }

  const isUserThere = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!isUserThere) {
    throw new ApiError(404, "User does not exist");
  }

  const checkpwd = await isUserThere.isPwdCorrect(password);

  if (!checkpwd) {
    throw new ApiError(401, "Password is incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessandRefreshToken(
    isUserThere._id
  );

  const loggedInUser = await User.findById(isUserThere._id).
  select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User successfully logged in"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req,res) => {
  const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken)
  {
     throw new ApiError(401,"Unauthorized request")
  }

  const decodeToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  )

  const user = await User.findById(decodeToken?._id)

  if(!user)
  {
    throw new ApiError(401,"refresh token not found it is invalid")
  }

  if(incomingRefreshToken !== user?.refreshToken)
  {
    throw new ApiError(401,"Refresh Token is expired")
  }

  const options = {
    httpOnly : true,
    secure : true
  }

  const {accessToken , newRefreshToken} =  await generateAccessandRefreshToken(user?._id)

  return res. 
          status(200)
          .cookie("accessToken",accessToken,options)
          .cookie("refreshToken",newRefreshToken,options)
          .json(
            new ApiResponse(
              200,
              {
                accessToken,refreshToken : "newRefreshToken"
              },
              "refresh token now renewed"
            )
          )
})

export { registerUser, loginUser, logoutUser ,refreshAccessToken};
