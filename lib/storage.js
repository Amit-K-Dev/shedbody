export const isClient = () => typeof window !== "undefined";

// Safe Get
export const getStorage = (key, defaultValue = []) => {
  if (!isClient()) return defaultValue;

  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// Safe Set
export const setStorage = (key, value) => {
  if (!isClient) return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

// App-Specific Helpers
export const getPlans = () => getStorage("plans", []);
export const savePlans = (data) => setStorage("plans", data);

export const getProgress = () => getStorage("progress", []);
export const saveProgress = (data) => setStorage("progress", data);

export const saveUserProfile = (data) => setStorage("userProfile", data);
export const getUserProfile = () => getStorage("userProfile", null);
