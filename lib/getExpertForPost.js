import { experts } from "@/lib/experts";
import { categoryExpertMap } from "@/lib/expertMapping";

export function getExpertForPost(post) {
  if (!post) return null;

  const targetExpertId = post.reviewedBy || categoryExpertMap[post.category];

  if (!targetExpertId) return null;

  return experts.find((e) => e.id === targetExpertId) || null;
}
