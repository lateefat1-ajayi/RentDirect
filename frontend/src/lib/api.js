const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token"); // assuming token is stored here
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${API_BASE}${endpoint}`;
  console.log("API Request:", url, { headers, options });

  try {
    const res = await fetch(url, { ...options, headers });
    console.log("API Response status:", res.status);
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      
      // Handle suspended account
      if (errorData.code === "ACCOUNT_SUSPENDED") {
        // Clear user data and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/auth/login?message=suspended";
        return;
      }
      
      // Handle token expiration - only for specific token errors
      if (res.status === 401 && (errorData.message?.includes("token failed") || errorData.message?.includes("expired"))) {
        // Clear expired token and redirect to login (without message)
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/auth/login";
        return;
      }
      
      throw new Error(errorData.message || "API request failed");
    }
    return await res.json();
  } catch (err) {
    console.error("API Error:", err.message);
    throw err;
  }
}

// Helper for uploading files (multipart/form-data)
export async function apiUpload(endpoint, formData, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: options.method || "POST",
      body: formData,
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      
      // Handle suspended account
      if (errorData.code === "ACCOUNT_SUSPENDED") {
        // Clear user data and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/auth/login?message=suspended";
        return;
      }
      
      // Handle token expiration - only for specific token errors
      if (res.status === 401 && (errorData.message?.includes("token failed") || errorData.message?.includes("expired"))) {
        // Clear expired token and redirect to login (without message)
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/auth/login";
        return;
      }
      
      throw new Error(errorData.message || "Upload failed");
    }

    return await res.json();
  } catch (err) {
    console.error("Upload API Error:", err.message);
    throw err;
  }
}
