const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["lost", "found"],
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  location: {
    type: String,
    default: "",
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  userName: {
    type: String,
    required: true,
  },

  anonymous: {
    type: Boolean,
    default: false,
  },

  resolved: {
    type: Boolean,
    default: false,
  },

  imageUrl: {
    type: String,
    default: "",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", postSchema);
