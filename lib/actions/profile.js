"use server";

import { ProfileRepository } from "@/lib/repositories/ProfileRepository.js";
import { D1Adapter } from "@/lib/repositories/D1Adapter.js";
import { getUser } from "@/lib/auth/getUser.js";
import { logger, classifyError, pseudonymizeId } from "../observability/logger.js";

function safeErrorDetails(error, operation, userId = null) {
  const classification = classifyError(error);
  const rawCode = error?.code || classification?.code || "DATABASE_ERROR";
  const code =
    typeof rawCode === "string" && rawCode.length < 50 && !rawCode.includes("@") && !rawCode.includes(" ")
      ? rawCode
      : "DATABASE_ERROR";
  const details = {
    operation,
    code,
    category: classification?.category || "DATABASE_ERROR",
  };
  if (userId) {
    const userRef = pseudonymizeId(userId);
    if (userRef) details.userRef = userRef;
  }
  return details;
}

export async function getHeaderProfile(userId) {
  const user = await getUser();

  if (!user) {
    return null;
  }

  // Security enforcement: client-supplied userId must match the authenticated session
  if (userId && userId !== user.id) {
    throw new Error("Unauthorized: Cross-tenant profile access is prohibited.");
  }
  const uid = user.id;

  try {
    const adapter = new D1Adapter();
    const repo = new ProfileRepository(adapter);
    const profile = await repo.getPublicProfile(uid);
    if (profile) {
      return {
        role: profile.role || "user",
        avatar_url: profile.avatar_url || null,
        user: { id: user.id, email: user.email, name: user.name || user.email },
      };
    }
  } catch (e) {
    logger.warn("D1_READ_ERROR", safeErrorDetails(e, "getHeaderProfile", uid));
  }

  return {
    role: "user",
    avatar_url: null,
    user: { id: user.id, email: user.email, name: user.name || user.email },
  };
}

export async function updateGlobalReminderSettings(enabled, time) {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const adapter = new D1Adapter();
    const repo = new ProfileRepository(adapter);
    await repo.updateReminderSettings(user.id, enabled, time);
    return { success: true };
  } catch (d1Err) {
    logger.error("UPDATE_REMINDER_SETTINGS_FAILED", safeErrorDetails(d1Err, "updateGlobalReminderSettings", user.id));
    throw d1Err;
  }
}
