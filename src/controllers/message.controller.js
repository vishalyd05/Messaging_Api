import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Message } from "../models/message.model.js";
import mongoose from "mongoose";

const sendMessage = asyncHandler(async (req, res) => {
  const { sender, receiver } = req.params;
  const { content } = req.body;
  const data = await Message.create({ sender, receiver, content });
  res.status(200).json(new ApiResponse(data, "message sent"));
});

const allMessages = asyncHandler(async (req, res) => {
  const data = await Message.find();
  res.status(200).json(new ApiResponse(data, "fetched messaged"));
});

const getMessages = asyncHandler(async (req, res) => {
  const { sender, receiver } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  if (
    !mongoose.Types.ObjectId.isValid(sender) ||
    !mongoose.Types.ObjectId.isValid(receiver)
  ) {
    return res.status(400).json({ error: "Invalid sender or receiver ID" });
  }

  try {
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            {
              sender: new mongoose.Types.ObjectId(sender),
              receiver: new mongoose.Types.ObjectId(receiver),
            },
            {
              sender: new mongoose.Types.ObjectId(receiver),
              receiver: new mongoose.Types.ObjectId(sender),
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "_id",
          as: "senderDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "receiver",
          foreignField: "_id",
          as: "receiverDetails",
        },
      },
      { $unwind: "$senderDetails" },
      { $unwind: "$receiverDetails" },
      {
        $project: {
          id: "$_id",
          content: 1,
          sender: {
            id: "$senderDetails._id",
            name: "$senderDetails.name",
            email: "$senderDetails.email",
          },
          receiver: {
            id: "$receiverDetails._id",
            name: "$receiverDetails.name",
            email: "$receiverDetails.email",
          },
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const totalMessages = await Message.countDocuments({
      $or: [
        {
          sender: new mongoose.Types.ObjectId(sender),
          receiver: new mongoose.Types.ObjectId(receiver),
        },
        {
          sender: new mongoose.Types.ObjectId(receiver),
          receiver: new mongoose.Types.ObjectId(sender),
        },
      ],
    });

    res.status(200).json(
      new ApiResponse(
        {
          messages,
          pagination: {
            page,
            limit,
            total: totalMessages,
            totalPages: Math.ceil(totalMessages / limit),
          },
        },
        "Messages retrieved successfully"
      )
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

export { sendMessage, allMessages, getMessages };
