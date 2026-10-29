const STORAGE_KEY = "user";

// Only non-sensitive profile fields are kept in localStorage. The session itself
// lives in the HttpOnly access_token cookie, which JavaScript cannot read.
export const saveStoredUser = ({ name, email, role } = {}) => {
  const user = {
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

export const clearStoredUser = () => {
  localStorage.removeItem(STORAGE_KEY);
};
