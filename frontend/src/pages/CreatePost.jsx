// CreatePost.jsx
// Form for creating a new lost/found post. Lets users optionally upload one image.

import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router";
import apiFetch from "../api";
import { AuthContext } from "../context/AuthContext";

// 5 MB max file size on the client side
const MAX_BYTES = 5 * 1024 * 1024;

// Helper to upload an image file to /api/upload.
// We can't use apiFetch here because apiFetch sets Content-Type: application/json,
// and FormData needs the browser to set its own multipart Content-Type.
async function uploadImage(file) {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("image", file);

  const baseUrl = import.meta.env.VITE_API_URL || "";

  const response = await fetch(baseUrl + "/api/upload", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Upload failed");
  }
  return data.imageUrl;
}

export default function CreatePost() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);

  // Form state
  const [type, setType] = useState("lost");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [anonymous, setAnonymous] = useState(false);

  // Image state
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // UI state
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // When the user picks a file, validate it and show a preview
  function handleFileChange(e) {
    setError("");
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setImageFile(null);
      setPreviewUrl("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be 5 MB or smaller.");
      return;
    }
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function clearImage() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(null);
    setPreviewUrl("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!description.trim()) {
      setError("Description is required.");
      return;
    }

    setSubmitting(true);
    try {
      
      let imageUrl = "";
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      
      await apiFetch("/api/posts", {
        method: "POST",
        body: JSON.stringify({
          type: type,
          title: title.trim(),
          description: description.trim(),
          location: location.trim(),
          anonymous: anonymous,
          imageUrl: imageUrl,
        }),
      });

      
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to create post.");
      setSubmitting(false);
    }
  }

  // If we're still figuring out who the user is, show a simple loading line
  if (authLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-sm text-gray-500">
        Checking sign in status...
      </div>
    );
  }

  // If the user is not logged in, prompt them to sign in
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-2">Sign in required</h2>
          <p className="text-sm text-gray-500 mb-4">
            You need to be signed in to create a post.
          </p>
          <div className="flex gap-2">
            <Link
              to="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Go to Sign In
            </Link>
            <Link
              to="/"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
            >
              Back to Feed
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
        Create a Post
      </h1>
      <p className="text-sm text-gray-500 mb-4">
        Add a clear title, location, and details. Optional: add one photo (≤ 5
        MB).
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4"
      >
        {/* Lost / Found toggle */}
        <div className="flex bg-gray-100 rounded-full p-1 max-w-xs">
          <button
            type="button"
            onClick={() => setType("lost")}
            className={
              "flex-1 text-sm py-1.5 rounded-full font-medium " +
              (type === "lost"
                ? "bg-white shadow text-red-700"
                : "text-gray-600")
            }
          >
            Lost
          </button>
          <button
            type="button"
            onClick={() => setType("found")}
            className={
              "flex-1 text-sm py-1.5 rounded-full font-medium " +
              (type === "found"
                ? "bg-white shadow text-green-700"
                : "text-gray-600")
            }
          >
            Found
          </button>
        </div>

        {/* Title */}
        <label className="block">
          <span className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Black North Face backpack"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </label>

        {/* Location */}
        <label className="block">
          <span className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </span>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Hunter College Library, 3rd floor"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </label>

        {/* Description */}
        <label className="block">
          <span className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Include color, brand, stickers, where you last saw it, and any helpful details"
            rows={4}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </label>

        {/* Anonymous toggle */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="h-4 w-4 text-blue-600"
          />
          <span className="text-sm text-gray-700">Post anonymously</span>
        </label>

        {/* Image picker */}
        <div>
          <span className="block text-sm font-medium text-gray-700 mb-1">
            Photo (optional)
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-700
                       file:mr-3 file:py-1.5 file:px-3
                       file:rounded-md file:border file:border-gray-300
                       file:bg-gray-50 file:text-gray-700
                       hover:file:bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            JPEG/PNG/WebP recommended, ≤ 5 MB.
          </p>
        </div>

        {/* Image preview */}
        {previewUrl && (
          <div className="border border-gray-200 rounded-md p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold">Preview</span>
              <button
                type="button"
                onClick={clearImage}
                className="text-xs text-gray-500 hover:text-red-600"
              >
                ✕ Remove
              </button>
            </div>
            <img
              src={previewUrl}
              alt="Selected preview"
              className="max-h-72 rounded-md object-contain"
            />
            <p className="text-xs text-gray-500 mt-2">
              This is a local preview. The image will be uploaded when you
              submit the post.
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate("/")}
            disabled={submitting}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
          >
            {submitting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
