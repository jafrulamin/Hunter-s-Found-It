import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams, Link } from "react-router";
import apiFetch from "../api";
import { AuthContext } from "../context/AuthContext";
import { initials, timeAgo } from "../utils";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch("/api/posts/" + id);
        setPost(data);
      } catch (err) {
        setError(err.message || "Could not load post");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function badgeClasses(type) {
    if (type === "lost") return "bg-red-100 text-red-700";
    if (type === "found") return "bg-green-100 text-green-700";
    return "bg-gray-100 text-gray-700";
  }

  async function handleDelete() {
    const ok = window.confirm("Delete this post? This cannot be undone.");
    if (!ok) return;
    setBusy(true);
    try {
      await apiFetch("/api/posts/" + id, { method: "DELETE" });
      navigate("/");
    } catch (err) {
      alert(err.message || "Could not delete post");
      setBusy(false);
    }
  }

  async function handleResolve() {
    const willResolve = !post.resolved;
    const ok = window.confirm(
      willResolve
        ? "Mark this post as resolved? It will be hidden from the feed."
        : "Mark this post as not resolved? It will appear on the feed again."
    );
    if (!ok) return;
    setBusy(true);
    try {
      const updated = await apiFetch("/api/posts/" + id, {
        method: "PATCH",
        body: JSON.stringify({ resolved: willResolve }),
      });
      setPost({ ...updated, userEmail: post.userEmail });
    } catch (err) {
      alert(err.message || "Could not update post");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 text-sm text-gray-500">
        Loading...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error || "Post not found"}
        </div>
        <Link to="/" className="text-sm text-blue-600 hover:underline">
          ← Back to feed
        </Link>
      </div>
    );
  }

  const isOwner = user && post.userId && user.id === post.userId;
  const mailtoSubject = encodeURIComponent("About your post: " + post.title);
  const mailtoHref = post.userEmail
    ? "mailto:" + post.userEmail + "?subject=" + mailtoSubject
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-4">
        <Link to="/" className="text-sm text-blue-600 hover:underline">
          ← Back to feed
        </Link>
      </div>

      <article className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {post.imageUrl && (
          <div className="w-full bg-gray-100">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full max-h-[480px] object-contain"
            />
          </div>
        )}

        <div className="p-5 sm:p-6">
          <div className="flex justify-between items-start gap-3 mb-3">
            <h1 className="text-2xl font-bold leading-tight">{post.title}</h1>
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
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
              <span>📍</span>
              <span>{post.location}</span>
            </div>
          )}

          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed mb-6">
            {post.description}
          </p>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold shrink-0">
                {initials(post.userName)}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold leading-tight truncate">
                  {post.userName}
                </div>
                <div className="text-xs text-gray-500 leading-tight">
                  Posted {timeAgo(post.createdAt)}
                </div>
              </div>
            </div>

            {!isOwner && post.userEmail && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
                <div className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-1">
                  Contact
                </div>
                <a
                  href={mailtoHref}
                  className="text-sm text-blue-700 hover:underline break-all"
                >
                  ✉ {post.userEmail}
                </a>
                <p className="text-xs text-gray-600 mt-1">
                  Reach out to the poster to coordinate retrieval or report a
                  match.
                </p>
              </div>
            )}
          </div>

          {isOwner && (
            <div className="flex flex-wrap gap-2 mt-2 pt-4 border-t border-gray-200">
              <Link
                to={"/edit-post/" + post._id}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 text-sm font-medium"
              >
                Edit
              </Link>
              <button
                onClick={handleResolve}
                disabled={busy}
                className={
                  "px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 " +
                  (post.resolved
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-green-600 text-white hover:bg-green-700")
                }
              >
                {post.resolved ? "Mark as not resolved" : "Mark as resolved"}
              </button>
              <button
                onClick={handleDelete}
                disabled={busy}
                className="px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 text-sm font-medium disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
