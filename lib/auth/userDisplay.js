export function getUserDisplay(user) {
  const metadata = user?.user_metadata || user?.raw_user_meta_data || {};
  const email = user?.email || metadata.email || "";

  return {
    id: user?.id || "",
    name:
      metadata.full_name ||
      metadata.name ||
      email.split("@")[0] ||
      "Athlete",
    email,
    avatar: metadata.avatar_url || metadata.picture || metadata.avatar || null,
    joined: user?.created_at
      ? new Date(user.created_at).toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric",
        })
      : "",
  };
}
