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
      throw new Error(errorData.message || "Upload failed");
    }

    return await res.json();
  } catch (err) {
    console.error("Upload API Error:", err.message);
    throw err;
  }
}
