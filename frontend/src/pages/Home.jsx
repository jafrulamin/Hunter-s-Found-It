import { useEffect, useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router";
import apiFetch from "../api";
import { AuthContext } from "../context/AuthContext";

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (!parts[0]) return "?";
  const first = parts[0][0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

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

function cloudinaryThumb(url) {
  if (!url) return "";
  if (url.indexOf("/upload/") === -1) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto,c_fill,w_900,h_500/");
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [segment, setSegment] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  const [busyId, setBusyId] = useState(null);

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

  useEffect(() => {
    loadPosts();
  }, []);

  const counts = useMemo(() => {
    const active = posts.filter((p) => !p.resolved);
    return {
      all: active.length,
      lost: active.filter((p) => p.type === "lost").length,
      found: active.filter((p) => p.type === "found").length,
    };
  }, [posts]);

  const filtered = useMemo(() => {
    let list = posts.filter((p) => !p.resolved);

    if (segment !== "all") {
      list = list.filter((p) => p.type === segment);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const t = (p.title || "").toLowerCase();
        const d = (p.description || "").toLowerCase();
        const l = (p.location || "").toLowerCase();
        return t.indexOf(q) !== -1 || d.indexOf(q) !== -1 || l.indexOf(q) !== -1;
      });
    }

    const sorted = [...list];
    if (sortBy === "alpha") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return sorted;
  }, [posts, segment, searchQuery, sortBy]);

  function badgeClasses(type) {
    if (type === "lost") return "bg-red-100 text-red-700";
    if (type === "found") return "bg-green-100 text-green-700";
    return "bg-gray-100 text-gray-700";
  }

  async function handleDelete(postId) {
    const ok = window.confirm(
      "Delete this post? This cannot be undone."
    );
    if (!ok) return;

    setBusyId(postId);
    try {
      await apiFetch("/api/posts/" + postId, { method: "DELETE" });
      setPosts((old) => old.filter((p) => p._id !== postId));
    } catch (err) {
      alert(err.message || "Could not delete post");
    } finally {
      setBusyId(null);
    }
  }

  async function handleResolve(postId) {
    const ok = window.confirm(
      "Mark this post as resolved? It will be hidden from the feed."
    );
    if (!ok) return;

    setBusyId(postId);
    try {
      const updated = await apiFetch("/api/posts/" + postId, {
        method: "PATCH",
        body: JSON.stringify({ resolved: true }),
      });
      setPosts((old) => old.map((p) => (p._id === postId ? updated : p)));
    } catch (err) {
      alert(err.message || "Could not update post");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Feed</h1>
        <p className="text-sm text-gray-500">
          Search the latest lost and found posts.
        </p>
      </div>

      <div className="sticky top-16 z-10 bg-[#f8fafc] py-3 mb-4 border-b border-gray-200">
        <div className="flex flex-col gap-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by item or location"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-2">
            <div className="flex bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setSegment("all")}
                className={
                  "flex-1 text-sm py-1.5 rounded-full font-medium " +
                  (segment === "all"
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-600")
                }
              >
                All ({counts.all})
              </button>
              <button
                onClick={() => setSegment("lost")}
                className={
                  "flex-1 text-sm py-1.5 rounded-full font-medium " +
                  (segment === "lost"
                    ? "bg-white shadow text-red-700"
                    : "text-gray-600")
                }
              >
                Lost ({counts.lost})
              </button>
              <button
                onClick={() => setSegment("found")}
                className={
                  "flex-1 text-sm py-1.5 rounded-full font-medium " +
                  (segment === "found"
                    ? "bg-white shadow text-green-700"
                    : "text-gray-600")
                }
              >
                Found ({counts.found})
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="latest">Latest</option>
              <option value="alpha">A to Z</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              onClick={loadPosts}
              className="text-sm text-blue-600 hover:underline"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="columns-1 sm:columns-2 gap-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="break-inside-avoid mb-6 inline-block w-full bg-white border border-gray-200 rounded-2xl p-4"
            >
              <div className="h-44 bg-gray-100 rounded-xl mb-3 animate-pulse" />
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-2 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded w-full mb-2 animate-pulse" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-500">
          No posts found.
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 gap-6">
          {filtered.map((post) => {
            const isOwner = user && post.userId && user.id === post.userId;
            const isBusy = busyId === post._id;

            return (
              <article
                key={post._id}
                className="break-inside-avoid mb-6 inline-block w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
              >
                {post.imageUrl && (
                  <div className="w-full overflow-hidden rounded-xl mb-3 bg-gray-100">
                    <img
                      src={cloudinaryThumb(post.imageUrl)}
                      alt={post.title}
                      loading="lazy"
                      className="w-full aspect-video object-cover block"
                    />
                  </div>
                )}

                <div className="flex justify-between items-start mb-1.5 gap-2">
                  <h2 className="font-bold text-base leading-snug">
                    {post.title}
                  </h2>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={
                        "px-2 py-0.5 rounded text-xs font-semibold uppercase " +
                        badgeClasses(post.type)
                      }
                    >
                      {post.type}
                    </span>
                    {isOwner && (
                      <button
                        onClick={() => handleDelete(post._id)}
                        disabled={isBusy}
                        title="Delete"
                        className="text-gray-400 hover:text-red-600 disabled:opacity-50 text-lg leading-none"
                      >
                        🗑
                      </button>
                    )}
                  </div>
                </div>

                {post.location && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <span>📍</span>
                    <span>{post.location}</span>
                  </div>
                )}

                <p className="text-sm text-gray-700 mt-2 mb-3 line-clamp-2">
                  {post.description}
                </p>

                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold shrink-0">
                      {initials(post.userName)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold leading-tight truncate">
                        {post.userName}
                      </div>
                      <div className="text-xs text-gray-500 leading-tight">
                        {timeAgo(post.createdAt)}
                      </div>
                    </div>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => handleResolve(post._id)}
                      disabled={isBusy}
                      title="Mark as resolved"
                      className="text-gray-400 hover:text-green-600 disabled:opacity-50 text-xl leading-none"
                    >
                      ✓
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
