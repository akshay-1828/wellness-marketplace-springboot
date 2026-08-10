import { getUserDashboard } from "./practitionerService";

let cachedUserId = null;

export const getCurrentUserId = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    cachedUserId = null;
    localStorage.removeItem("userId");
    throw new Error("Not authenticated");
  }

  if (cachedUserId) return cachedUserId;

  const stored = localStorage.getItem("userId");
  if (stored) {
    const parsed = Number(stored);
    if (Number.isFinite(parsed) && parsed > 0) {
      cachedUserId = parsed;
      return cachedUserId;
    }
  }

  const response = await getUserDashboard();
  const id = response?.data?.userProfile?.id;
  if (!id) {
    throw new Error("Unable to resolve current user id");
  }

  cachedUserId = id;
  localStorage.setItem("userId", String(id));
  return cachedUserId;
};
