export function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (!parts[0]) return "?";
  const first = parts[0][0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function timeAgo(createdAt) {
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

export function cloudinaryThumb(url) {
  if (!url) return "";
  if (url.indexOf("/upload/") === -1) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto,c_fill,w_900,h_500/");
}
