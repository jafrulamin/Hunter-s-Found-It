import { useEffect, useState, useMemo, useContext } from "react";
import { useNavigate, Link } from "react-router";
import apiFetch from "../api";
import { AuthContext } from "../context/AuthContext";
import { initials, timeAgo, cloudinaryThumb } from "../utils";

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [segment, setSegment] = useState("all");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    async function load() {
      if (!user) return;
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch("/api/posts/user/me");
        setPosts(data);
      } catch (err) {
        setError(err.message || "Could not load your posts");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const counts = useMemo(() => {
    return {
      all: posts.length,
      active: posts.filter((p) => !p.resolved).length,
      resolved: posts.filter((p) => p.resolved).length,
    };
  }, [posts]);

  const filtered = useMemo(() => {
    if (segment === "active") return posts.filter((p) => !p.resolved);
    if (segment === "resolved") return posts.filter((p) => p.resolved);
    return posts;
  }, [posts, segment]);

  function badgeClasses(type) {
    if (type === "lost") return "bg-red-100 text-red-700";
    if (type === "found") return "bg-green-100 text-green-700";
    return "bg-gray-100 text-gray-700";
  }

  async function handleDelete(postId) {
    const ok = window.confirm("Delete this post? This cannot be undone.");
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

  async function handleToggleResolved(post) {
    const willResolve = !post.resolved;
    const ok = window.confirm(
      willResolve
        ? "Mark this post as resolved? It will be hidden from the feed."
        : "Mark this post as not resolved? It will appear on the feed again."
    );
    if (!ok) return;

    setBusyId(post._id);
    try {
      const updated = await apiFetch("/api/posts/" + post._id, {
        method: "PATCH",
        body: JSON.stringify({ resolved: willResolve }),
      });
      setPosts((old) => old.map((p) => (p._id === post._id ? updated : p)));
    } catch (err) {
      alert(err.message || "Could not update post");
    } finally {
      setBusyId(null);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-sm text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold">
          {initials(user.name)}
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {user.name || user.email}
          </h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      <div className="mb-2">
        <h2 className="text-xl font-bold tracking-tight">My Posts</h2>
        <p className="text-sm text-gray-500">
          Manage your lost and found posts.
        </p>
      </div>

      <div className="mb-6">
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
            onClick={() => setSegment("active")}
            className={
              "flex-1 text-sm py-1.5 rounded-full font-medium " +
              (segment === "active"
                ? "bg-white shadow text-blue-700"
                : "text-gray-600")
            }
          >
            Active ({counts.active})
          </button>
          <button
            onClick={() => setSegment("resolved")}
            className={
              "flex-1 text-sm py-1.5 rounded-full font-medium " +
              (segment === "resolved"
                ? "bg-white shadow text-green-700"
                : "text-gray-600")
            }
          >
            Resolved ({counts.resolved})
          </button>
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
              <div className="h-40 bg-gray-100 rounded-xl mb-3 animate-pulse" />
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2 animate-pulse" />
              <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <p className="text-gray-500 mb-4">
            {segment === "all"
              ? "You haven't created any posts yet."
              : segment === "active"
              ? "You don't have any active posts."
              : "You don't have any resolved posts."}
          </p>
          {segment === "all" && (
            <Link
              to="/create-post"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              {posts.length === 0 ? "Create your first post" : "Create post"}
            </Link>
          )}
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 gap-6">
          {filtered.map((post) => {
            const isBusy = busyId === post._id;

            return (
              <article
                key={post._id}
                onClick={() => navigate("/post/" + post._id)}
                className={
                  "break-inside-avoid mb-6 inline-block w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow " +
                  (post.resolved ? "opacity-70" : "")
                }
              >
                {post.imageUrl && (
                  <div className="w-full overflow-hidden rounded-xl mb-3 bg-gray-100">
                    <img
                      src={cloudinaryThumb(post.imageUrl)}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-48 object-cover block"
                    />
                  </div>
                )}

                <div className="flex justify-between items-start mb-1.5 gap-2">
                  <h3 className="font-bold text-base leading-snug">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={
                        "px-2 py-0.5 rounded text-xs font-semibold uppercase " +
                        badgeClasses(post.type)
                      }
                    >
                      {post.type}
                    </span>
                    {post.resolved && (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                        Resolved
                      </span>
                    )}
                  </div>
                </div>

                {post.location && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <span>📍</span>
                    <span>{post.location}</span>
                  </div>
                )}

                <p className="text-sm text-gray-700 mt-2 mb-3 line-clamp-3">
                  {post.description}
                </p>

                <div className="flex justify-between items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500">
                    {timeAgo(post.createdAt)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      to={"/edit-post/" + post._id}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleResolved(post);
                      }}
                      disabled={isBusy}
                      className={
                        "text-sm hover:underline disabled:opacity-50 " +
                        (post.resolved
                          ? "text-gray-600"
                          : "text-green-700")
                      }
                    >
                      {post.resolved ? "Unresolve" : "Resolve"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(post._id);
                      }}
                      disabled={isBusy}
                      className="text-sm text-red-600 hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
