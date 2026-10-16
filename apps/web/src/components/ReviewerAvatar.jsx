import { useState } from "react";
import { API_URL } from "../config";

// Small, square, face-centred version of the photo. Cloudinary links get a
// 96px thumbnail instead of the full-size original.
const avatarUrl = (path, size = 96) => {
  if (!path) return "";
  if (path.startsWith("/uploads/")) return `${API_URL}${path}`;
  if (path.includes("res.cloudinary.com") && path.includes("/upload/")) {
    return path.replace(
      "/upload/",
      `/upload/w_${size},h_${size},c_fill,g_face,f_auto,q_auto/`
    );
  }
  return path;
};

function ReviewerAvatar({ name, src, className = "h-10 w-10 text-sm" }) {
  const [failed, setFailed] = useState(false);
  const url = avatarUrl(src);

  if (!url || failed) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-full bg-[#F7E7EE] font-bold text-[#B85E83] ${className}`}
      >
        {(name || "?").charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={name ? `${name}'s profile photo` : "Profile photo"}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-full object-cover ${className}`}
    />
  );
}

export default ReviewerAvatar;