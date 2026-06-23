// Reads an auth token regardless of which storage it was saved in.
// "Remember me" checked -> localStorage. Unchecked -> sessionStorage.
export const getAccessToken = () =>
  localStorage.getItem("access_token") || sessionStorage.getItem("access_token");

export const getRefreshToken = () =>
  localStorage.getItem("refresh_token") || sessionStorage.getItem("refresh_token");

export const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
};