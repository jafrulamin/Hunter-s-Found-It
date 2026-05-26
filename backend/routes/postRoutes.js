const express = require("express");
const Post = require("../models/Post");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", async function (req, res) {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    return res.json(posts);
  } catch (err) {
    console.log("get posts error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/user/me", auth, async function (req, res) {
  try {
    const posts = await Post.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    return res.json(posts);
  } catch (err) {
    console.log("my posts error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async function (req, res) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const postObj = post.toObject();
    const owner = await User.findById(post.userId);
    if (owner) {
      postObj.userEmail = owner.email;
    }
    return res.json(postObj);
  } catch (err) {
    console.log("get post error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/", auth, async function (req, res) {
  try {
    const { type, title, description, location, imageUrl } = req.body;

    if (!type || !title || !description) {
      return res
        .status(400)
        .json({ message: "type, title, and description are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newPost = new Post({
      type: type,
      title: title.trim(),
      description: description.trim(),
      location: location ? location.trim() : "",
      userId: user._id,
      userName: user.name,
      imageUrl: imageUrl || "",
      resolved: false,
    });

    await newPost.save();
    return res.status(201).json(newPost);
  } catch (err) {
    console.log("create post error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:id", auth, async function (req, res) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const { title, description, location, resolved, type } = req.body;
    if (title !== undefined) post.title = title.trim();
    if (description !== undefined) post.description = description.trim();
    if (location !== undefined) post.location = location.trim();
    if (resolved !== undefined) post.resolved = !!resolved;
    if (type !== undefined) post.type = type;

    await post.save();
    return res.json(post);
  } catch (err) {
    console.log("update post error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", auth, async function (req, res) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await Post.findByIdAndDelete(req.params.id);
    return res.json({ message: "Post deleted" });
  } catch (err) {
    console.log("delete post error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
