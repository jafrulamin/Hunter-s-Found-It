

import { useEffect, useState } from "react";
import apiFetch from "../api";

// Get the first letter of the first word + first letter of the last word.
// Used for the small circle avatar next to a poster's name.
function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (!parts[0]) return "?";
  const first = parts[0][0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

// Turn a date into "5m ago", "2h ago", "3d ago", etc.
function timeAgo(createdAt) {
  if (!createdAt) return "";
  const ms = new Date(createdAt).getTime();
  const diff = Date.now() - ms;
  if (diff < 60000) return "just now";
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return minutes + "m ago";
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + "h ago";
  const days = Math.floor(hours / 24);
  if (days < 7) return days + "d ago";
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return weeks + "w ago";
  const months = Math.floor(days / 30);
  if (months < 12) return months + "mo ago";
  const years = Math.floor(days / 365);
  return years + "y ago";
}

export default function Home() {
  // Data + UI state
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load all posts when the component first mounts
  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch("/api/posts");
        setPosts(data);
      } catch (err) {
        setError(err.message || "Could not load posts");
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  // Color classes for the lost/found badge
  function badgeClasses(type) {
    if (type === "lost") return "bg-red-100 text-red-700";
    if (type === "found") return "bg-green-100 text-green-700";
    return "bg-gray-100 text-gray-700";
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Heading */}
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Feed</h1>
        <p className="text-sm text-gray-500">
          The latest lost and found posts.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="text-sm text-gray-500">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-500">
          No posts yet. Be the first to post!
        </div>
      ) : (
        // Use CSS columns for a simple masonry layout
        <div className="columns-1 sm:columns-2 gap-6">
          {posts.map((post) => (
            <article
              key={post._id}
              className="break-inside-avoid mb-6 inline-block w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
            >
              {/* Image (if any) */}
              {post.imageUrl && (
                <div className="w-full overflow-hidden rounded-xl mb-3 bg-gray-100">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    loading="lazy"
                    className="w-full aspect-video object-cover block"
                  />
                </div>
              )}

              {/* Title + type badge */}
              <div className="flex justify-between items-start mb-1.5 gap-2">
                <h2 className="font-bold text-base leading-snug">
                  {post.title}
                </h2>
                <span
                  className={
                    "px-2 py-0.5 rounded text-xs font-semibold uppercase " +
                    badgeClasses(post.type)
                  }
                >
                  {post.type}
                </span>
              </div>

              {/* Location */}
              {post.location && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <span>📍</span>
                  <span>{post.location}</span>
                </div>
              )}

              {/* Description */}
              <p className="text-sm text-gray-700 mt-2 mb-3">
                {post.description}
              </p>

              {/* Footer: avatar + name + time */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold shrink-0">
                  {initials(post.userName)}
                </div>
                <div>
                  <div className="text-sm font-semibold leading-tight">
                    {post.userName}
                  </div>
                  <div className="text-xs text-gray-500 leading-tight">
                    {timeAgo(post.createdAt)}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
