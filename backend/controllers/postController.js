const Post = require("../models/Post");
const mongoose = require("mongoose");

// GET all posts
exports.getAll = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};


exports.create = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Post content is required" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized. User not found in request." });
    }

    const imageUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : null;

    const newPost = new Post({
      content,
      imageUrl,
      createdBy: req.user._id,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};



exports.like = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user.id; // assuming you get user ID from a decoded JWT

    // Check if user already liked the post
    if (post.likedBy.includes(userId)) {
      return res.status(400).json({ message: "You have already liked this post" });
    }

    post.likes += 1;
    post.likedBy.push(userId);
    await post.save();

    res.json({ likes: post.likes, dislikes: post.dislikes });
  } catch (err) {
    res.status(500).json({ message: "Failed to like post" });
  }
};




exports.dislike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user.id; 

    // Check if user already disliked the post
    if (post.dislikedBy.includes(userId)) {
      return res.status(400).json({ message: "You have already disliked this post" });
    }

    post.dislikes += 1;
    post.dislikedBy.push(userId);
    await post.save();

    res.json({ likes: post.likes, dislikes: post.dislikes });
  } catch (err) {
    res.status(500).json({ message: "Failed to dislike post" });
  }
};


// REMOVE post 
exports.remove = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

   if (post.createdBy.toString() !== req.user._id.toString()) {
  return res.status(403).json({ message: "You are not authorized to delete this post" });
}

    await post.deleteOne();

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};


// UPDATE post with ownership check (NEW)
exports.update = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.createdBy.toString() !== req.user._id) {
      return res.status(403).json({ message: "You are not authorized to update this post" });
    }

    post.content = content || post.content;
    await post.save();

    res.status(200).json({ message: "Post updated", post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update post" });
  }
};

// ADD COMMENT
exports.addComment = async (req, res) => {
  const { text } = req.body;
  const { postId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ error: "Invalid post ID" });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const newComment = { text };
    post.comments.push(newComment);
    await post.save();

    res.status(201).json(post.comments[post.comments.length - 1]);
  } catch (err) {
    console.error("Failed to add comment:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
};


// EDIT COMMENT
exports.editComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const { text } = req.body;

  if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(commentId)) {
    return res.status(400).json({ error: "Invalid ID(s)" });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    comment.text = text;
    await post.save();

    res.json({ message: "Comment updated", comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to edit comment" });
  }
};

// DELETE COMMENT
exports.deleteComment = async (req, res) => {
  const { postId, commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(commentId)) {
    return res.status(400).json({ error: "Invalid ID(s)" });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    post.comments.pull(commentId);
    await post.save();

    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete comment" });
  }
};
