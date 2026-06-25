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
export const logout = async () => {
  const accessToken = getAccessToken();
 
  if (accessToken) {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.warn("Logout request failed (clearing local session anyway):", error.message);
    }
  }
 
  clearTokens();
};
 