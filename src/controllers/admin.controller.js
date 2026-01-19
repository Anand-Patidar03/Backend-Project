import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select("-password -refreshToken -forgotPasswordToken");

    return res
        .status(200)
        .json(new ApiResponse(200, users, "All users fetched successfully"));
});

const toggleBlockUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user._id.toString() === req.user._id.toString()) {
        throw new ApiError(400, "You cannot block yourself");
    }

    user.isBlocked = !user.isBlocked;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isBlocked: user.isBlocked },
                `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`
            )
        );
});

export { getAllUsers, toggleBlockUser };
