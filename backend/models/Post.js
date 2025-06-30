const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    content: String,
    imageUrl: String,
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dislikedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [commentSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);

