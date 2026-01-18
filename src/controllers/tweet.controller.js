import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const content = req.body.content;

  if (!content) {
    throw new ApiError(400, "Tweet content is required");
  }

  const owner = req.user._id;

  const tweet = await Tweet.create({
    content,
    owner,
  });

  console.log(tweet);

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid userId");
  }

  const tweets = await Tweet.find({
    owner: userId,
  }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "user tweets fetched successfully"));
});

const getAllTweets = asyncHandler(async (req, res) => {
  const tweets = await Tweet.aggregate([
    {
      $sort: {
        createdAt: -1
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1
            }
          }
        ]
      }
    },
    {
      $addFields: {
        owner: {
          $first: "$ownerDetails"
        }
      }
    },
    // Lookup likes to see if liked by current user?
    // For simplicity, let's just fetch tweets first. Optimizing for likes usually requires more aggregation.
    // I'll add simple lookup for likes count if possible or just return basic data.
    // The user wants "like those tweets".
    // I should probably add isLiked field.
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "likes"
      }
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, "$likes.likedBy"] },
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        ownerDetails: 0,
        likes: 0
      }
    }
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "All tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const tweetId = req.params?.tweetId;
  const newTweet = req.body.content;

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(401, "tweetId is not valid");
  }

  if (!newTweet) {
    throw new ApiError(400, "Updated tweet is missing");
  }

  const tweetFind = await Tweet.findById(tweetId);

  if (!tweetFind) {
    throw new ApiError(400, "Tweet is not found");
  }

  if (!tweetFind.owner.equals(req.user?._id)) {
    throw new ApiError(401, "User mismatched ERROR");
  }

  tweetFind.content = newTweet;
  await tweetFind.save();

  return res
    .status(200)
    .json(new ApiResponse(200, tweetFind, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const tweetId = req.params?.tweetId;

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(401, "tweetId is not valid");
  }

  const tweetFind = await Tweet.findById(tweetId);

  if (!tweetFind) {
    throw new ApiError(400, "Tweet is not present");
  }

  if (!tweetFind.owner.equals(req.user?._id)) {
    throw new ApiError(401, "User mismatched ERROR");
  }

  const afterDelete = await tweetFind.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, afterDelete, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet, getAllTweets };
