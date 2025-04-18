import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Follows } from "../models/followFollower.model.js";

const follow = asyncHandler(async (req, res) => {
  const { followTo, follower } = req.params;
  const ispresent = await Follows.find({
    $and: [{ followTo: followTo }, { follower: follower }],
  });
  console.log(ispresent);
  if (ispresent.length != 0) {
    throw new ApiError(409, "already following");
  }
  const data = await Follows.create({ followTo, follower });
  return res
    .status(200)
    .json(new ApiResponse(200, data, "followed successfully"));
});

const unfollow = asyncHandler(async (req, res) => {
  const { followTo, follower } = req.params;
  const ispresent = await Follows.find({
    $and: [{ followTo: followTo }, { follower: follower }],
  });
  if (ispresent.length == 0) {
    throw new ApiError(400, "does not present");
  }
  const data = await Follows.findOneAndDelete({
    $and: [{ followTo: followTo }, { follower: follower }],
  });
  return res
    .status(200)
    .json(new ApiResponse(200, data, "unfollowed successfully"));
});
export { follow, unfollow };
