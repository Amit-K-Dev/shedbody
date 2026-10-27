
export async function addXP(userId, amount) {
  const { ProfileRepository } = await import("@/lib/repositories/ProfileRepository.js");
  const { D1Adapter } = await import("@/lib/repositories/D1Adapter.js");
  
  const adapter = new D1Adapter();
  try {
    adapter._checkDb();
  } catch {
    return null;
  }
  
  const profileRepo = new ProfileRepository(adapter);
  const result = await profileRepo.addXP(userId, amount);
  return result;
}
