// About Cloudinary URL transformations:
// Cloudinary lets us resize and re-encode images on the fly by adding a
// transformation segment to the URL between "/upload/" and the file id.
// For example, the original URL
//     https://res.cloudinary.com/<cloud>/image/upload/abcd1234.jpg
// can be turned into a 900x500 cropped, auto-format, auto-quality version:
//     https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto,c_fill,w_900,h_500/abcd1234.jpg
// The frontend uses a small cloudinaryThumb() helper to insert
// "f_auto,q_auto,c_fill,w_900,h_500/" so feed images stay small and fast.

const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const auth = require("../middleware/auth");

const router = express.Router();

// Use memory storage so we can stream the buffer straight to Cloudinary
// instead of writing to disk first.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

router.post("/", auth, upload.single("image"), function (req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file was uploaded" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "hunters-foundit" },
      function (error, result) {
        if (error) {
          console.log("cloudinary error:", error.message);
          return res.status(500).json({ message: "Upload failed" });
        }
        return res.json({ imageUrl: result.secure_url });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (err) {
    console.log("upload error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
