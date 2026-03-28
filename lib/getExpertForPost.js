import { experts } from "@/lib/experts";
import { categoryExpertMap } from "@/lib/expertMapping";

// Smart Resolver function
export function getExpertForPost(post) {
  // Manual override (highest priority)
  if (post.reviewedBy) {
    return experts.find((e) => e.id === post.reviewedBy);
  }

  // Auto assign based on category
  const expertId = categoryExpertMap[post.category];

  return experts.find((e) => e.id === expertId);
}
