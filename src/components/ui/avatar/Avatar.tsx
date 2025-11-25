import React, { useState } from "react";

export const getInitials = (name = "") => {
  const parts = (name || "").trim().split(" ").filter(Boolean);
  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

interface AvatarProps {
  src?: string;
  alt?: string;
  nameForInitials?: string;
  size?: number; // px
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  nameForInitials,
  size = 40,
  className = "",
}) => {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  const dim = `${size}px`;
  const initials = getInitials(nameForInitials || alt || "").trim() || "U";

  if (showImage) {
    return (
      <img
        src={src}
        alt={alt || "User avatar"}
        className={`rounded-full object-cover ${className}`}
        style={{ width: dim, height: dim }}
        onError={() => setFailed(true)}
        loading="lazy"
      />
    );
  }
  return (
    <div
     className="rounded-full flex items-center justify-center border border-black/40 dark:border-white/40 bg-neutral-100 dark:bg-transparent  text-neutral-900 dark:text-neutral-100"
      style={{ width: dim, height: dim }}
      aria-label={alt || "User avatar"}
      role="img"
    >
      <span className="font-medium text-sm">{initials}</span>
    </div>
  );
};

export default Avatar;
