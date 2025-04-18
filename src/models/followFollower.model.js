import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    followTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Follows = mongoose.model("Follows", followSchema);
