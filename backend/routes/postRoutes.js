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

router.post("/", auth, async function (req, res) {
  try {
    const { type, title, description, location, anonymous, imageUrl } =
      req.body;

    if (!type || !title || !description) {
      return res
        .status(400)
        .json({ message: "type, title, and description are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const displayName = anonymous ? "Anonymous" : user.name;

    const newPost = new Post({
      type: type,
      title: title.trim(),
      description: description.trim(),
      location: location ? location.trim() : "",
      userId: user._id,
      userName: displayName,
      anonymous: !!anonymous,
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

module.exports = router;
