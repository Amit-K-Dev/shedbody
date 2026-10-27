
export async function checkBadges(userId, streak) {
  const { ProfileRepository } = await import("@/lib/repositories/ProfileRepository.js");
  const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
  
  const adapter = new D1Adapter();
  try {
    adapter._checkDb();
  } catch {
    return;
  }
  
  const profileRepo = new ProfileRepository(adapter);

  // Check for 7 days
  if (streak >= 7) {
    await profileRepo.awardBadge(userId, "7-day-streak");
  }

  // Check for 30 days
  if (streak >= 30) {
    await profileRepo.awardBadge(userId, "30-day-streak");
  }
}
