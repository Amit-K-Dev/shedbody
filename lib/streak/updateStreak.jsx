
export async function updateStreak(userId) {
  const { ProfileRepository } = await import("@/lib/repositories/ProfileRepository.js");
  const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
  
  const adapter = new D1Adapter();
  try {
    adapter._checkDb();
  } catch {
    return 0;
  }
  
  const profileRepo = new ProfileRepository(adapter);
  const newStreak = await profileRepo.processStreak(userId);
  return newStreak;
}
