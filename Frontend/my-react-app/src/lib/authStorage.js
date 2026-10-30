const STORAGE_KEY = "user";

// The user id is the primary key of the users table. It is normalised to a
// positive integer so consumers can compare it directly, and reset to null when
// a caller only has partial data (e.g. the login payload, which omits it).
const normalizeId = (id) => {
  if (id === null || id === undefined || id === "") {
    return null;
  }

  const numericId = Number(id);

  return Number.isInteger(numericId) && numericId > 0 ? numericId : null;
};

// Only non-sensitive profile fields are kept in localStorage. The session itself
// lives in the HttpOnly access_token cookie, which JavaScript cannot read.
export const saveStoredUser = ({ id, name, email, role } = {}) => {
  const user = {
    id: normalizeId(id),
    name: name ?? "",
    email: email ?? "",
    role: role ?? "user",
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

  return user;
};

export const getStoredUser = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// Convenience reader for code that only needs the current user's id.
// Returns null for signed-out visitors and for sessions stored before the id
// was persisted; those are refreshed by ProtectedRoute on the next page load.
export const getStoredUserId = () => getStoredUser()?.id ?? null;

export const clearStoredUser = () => {
  localStorage.removeItem(STORAGE_KEY);
};
