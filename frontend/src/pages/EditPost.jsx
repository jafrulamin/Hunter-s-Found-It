// EditPost.jsx
// Lets the owner of a post edit its fields. Loads the post by id from the URL,
// pre-fills the form, and PATCHes /api/posts/:id on submit.

import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams, Link } from "react-router";
import apiFetch from "../api";
import { AuthContext } from "../context/AuthContext";

export default function EditPost() {
  const navigate = useNavigate();
  const { id } = useParams(); // post id from the URL
  const { user, loading: authLoading } = useContext(AuthContext);

  // Form state
  const [type, setType] = useState("lost");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [resolved, setResolved] = useState(false);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect if not signed in (after auth has finished loading)
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  // Load the post by id and pre-fill the form
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const post = await apiFetch("/api/posts/" + id);
        setType(post.type);
        setTitle(post.title || "");
        setLocation(post.location || "");
        setDescription(post.description || "");
        setResolved(!!post.resolved);

        // Make sure the logged-in user owns this post — if not, send them home
        if (user && post.userId !== user.id) {
          setError("You can only edit your own posts.");
        }
      } catch (err) {
        setError(err.message || "Could not load post");
      } finally {
        setLoading(false);
      }
    }
    if (user) load();
  }, [id, user]);

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
      await apiFetch("/api/posts/" + id, {
        method: "PATCH",
        body: JSON.stringify({
          type: type,
          title: title.trim(),
          description: description.trim(),
          location: location.trim(),
          resolved: resolved,
        }),
      });
      navigate("/profile");
    } catch (err) {
      setError(err.message || "Failed to update post.");
      setSubmitting(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-sm text-gray-500">
        Loading...
      </div>
    );
  }

  if (!user) return null; // redirect is happening

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
        Edit Post
      </h1>
      <p className="text-sm text-gray-500 mb-4">
        Update the details of your post.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex justify-between items-center gap-2">
          <span>{error}</span>
          <Link
            to="/profile"
            className="text-blue-600 hover:underline text-xs whitespace-nowrap"
          >
            Back to Profile
          </Link>
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
            rows={4}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </label>

        {/* Resolved toggle */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={resolved}
            onChange={(e) => setResolved(e.target.checked)}
            className="h-4 w-4 text-blue-600"
          />
          <span className="text-sm text-gray-700">Mark as resolved</span>
        </label>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate("/profile")}
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
            {submitting ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
