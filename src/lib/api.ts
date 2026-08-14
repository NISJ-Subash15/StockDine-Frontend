const getApiBaseUrl = (): string => {
  let envUrl = "";
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) {
    envUrl = import.meta.env.VITE_API_URL.trim();
  } else if (typeof process !== "undefined" && process.env && process.env.VITE_API_URL) {
    envUrl = process.env.VITE_API_URL.trim();
  }

  if (envUrl) {
    let clean = envUrl.replace(/\/+$/, "");
    if (!clean.endsWith("/api")) {
      clean = `${clean}/api`;
    }
    return clean;
  }

  if (typeof window !== "undefined" && window.location) {
    const host = window.location.hostname;
    const protocol = window.location.protocol === "https:" ? "https:" : "http:";

    // If local dev environment (localhost, 127.0.0.1, or local IP)
    if (host === "localhost" || host === "127.0.0.1" || host.startsWith("192.168.") || host.startsWith("172.")) {
      return `${protocol}//${host}:5000/api`;
    }
    // Deployed production environment (Vercel, Netlify, Render, Railway)
    return `/api`;
  }
  return "http://localhost:5000/api";
};

export const formatImageUrl = (url?: string): string => {
  if (!url) return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  const baseUrl = getApiBaseUrl().replace(/\/api\/?$/, "");
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

// Helper function to get token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("stockdine_token");
  }
  return null;
};

// Generic fetch wrapper
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const primaryUrl = `${baseUrl}${cleanEndpoint}`;

  // Helper to execute fetch request
  const doFetch = async (targetUrl: string) => {
    const response = await fetch(targetUrl, {
      ...options,
      headers,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const err: any = new Error(data.message || `API Error: ${response.status}`);
      err.status = response.status;
      throw err;
    }
    return data as T;
  };

  try {
    return await doFetch(primaryUrl);
  } catch (error: any) {
    const isNetworkErr = error.name === "TypeError" || error.message?.includes("fetch") || error.message?.includes("NetworkError");

    // If primary attempt returned 404 or network failure, attempt fallback URLs for localhost / 127.0.0.1 backend
    const fallbackUrls: string[] = [];
    if (!primaryUrl.includes("localhost:5000")) {
      fallbackUrls.push(`http://localhost:5000/api${cleanEndpoint}`);
    }
    if (!primaryUrl.includes("127.0.0.1:5000")) {
      fallbackUrls.push(`http://127.0.0.1:5000/api${cleanEndpoint}`);
    }

    for (const fallbackUrl of fallbackUrls) {
      try {
        return await doFetch(fallbackUrl);
      } catch (fbErr: any) {
        // Continue trying fallback URLs if status was 404 or network failure
        if (fbErr.status !== 404 && fbErr.status !== undefined && fbErr.name !== "TypeError") {
          throw fbErr; // Re-throw non-404 business errors (e.g. 400 Bad Request, 401 Unauthorized)
        }
      }
    }

    if (isNetworkErr) {
      const friendlyErr: any = new Error("Unable to connect to StockDine services. Please ensure the backend server is running on http://localhost:5000.");
      friendlyErr.status = 503;
      throw friendlyErr;
    }

    console.error(`❌ API Fetch Error [${options.method || "GET"} ${primaryUrl}]:`, error.message || error);
    throw error;
  }
}

export const api = {
  // Authentication
  auth: {
    restaurantSignup: (formData: FormData | object) =>
      formData instanceof FormData
        ? apiFetch("/auth/signup", { method: "POST", body: formData })
        : apiFetch("/auth/signup", { method: "POST", body: JSON.stringify(formData) }),

    customerSignup: (data: object) =>
      apiFetch<{ success: boolean; token: string; user: any; message?: string }>("/auth/customer/signup", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    login: (credentials: object) =>
      apiFetch<{ success: boolean; token: string; user: any; role: string; message?: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),

    customerLogin: (credentials: object) =>
      apiFetch<{ success: boolean; token: string; user: any; role: string; message?: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),

    forgotPassword: (data: { email: string }) =>
      apiFetch<{ success: boolean; message: string; resetToken?: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    resetPassword: (data: { token: string; newPassword: string; confirmPassword?: string }) =>
      apiFetch<{ success: boolean; message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword?: string }) =>
      apiFetch<{ success: boolean; message: string }>("/auth/change-password", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    sendOtp: (data: { mobile: string; isSignup?: boolean }) =>
      apiFetch<{ success: boolean; message: string; otp?: string }>("/auth/customer/send-otp", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    verifyOtp: (data: { mobile: string; otp: string; name?: string }) =>
      apiFetch<{ success: boolean; token: string; user: any; message: string }>("/auth/customer/verify-otp", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    updateCustomerProfile: (data: { name?: string; mobile?: string; email?: string; avatar?: string; profilePhoto?: string }) =>
      apiFetch<{ success: boolean; user: any; profile: any; message: string }>("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    getProfile: () => apiFetch<{ success: boolean; role: string; profile: any; user: any }>("/auth/profile"),
    me: () => apiFetch<{ success: boolean; role: string; profile: any; user: any }>("/auth/me"),
  },

  // Super Admin Endpoints
  superAdmin: {
    login: (credentials: { email: string; password: string }) =>
      apiFetch<{ success: boolean; token: string; user: any; message?: string }>("/superadmin/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    getStats: () => apiFetch<{ success: boolean; stats: any }>("/superadmin/dashboard-stats"),
    getUsers: () => apiFetch<{ success: boolean; count: number; users: any[] }>("/superadmin/users"),
    updateUserRole: (id: string, role: string) =>
      apiFetch<{ success: boolean; message: string; user: any }>(`/superadmin/users/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      }),
    deleteUser: (id: string) =>
      apiFetch<{ success: boolean; message: string }>(`/superadmin/users/${id}`, { method: "DELETE" }),
    getRestaurants: () => apiFetch<{ success: boolean; count: number; restaurants: any[] }>("/superadmin/restaurants"),
    approveRestaurant: (id: string) =>
      apiFetch<{ success: boolean; message: string }>(`/superadmin/restaurants/${id}/approve`, { method: "PATCH" }),
    rejectRestaurant: (id: string) =>
      apiFetch<{ success: boolean; message: string }>(`/superadmin/restaurants/${id}/reject`, { method: "PATCH" }),
    deleteRestaurant: (id: string) =>
      apiFetch<{ success: boolean; message: string }>(`/superadmin/restaurants/${id}`, { method: "DELETE" }),
    getBookings: () => apiFetch<{ success: boolean; count: number; bookings: any[] }>("/superadmin/bookings"),
    updateBookingStatus: (id: string, status: string) =>
      apiFetch<{ success: boolean; message: string }>(`/superadmin/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    getPayments: () => apiFetch<{ success: boolean; analytics: any }>("/superadmin/payments"),
    getReviews: () => apiFetch<{ success: boolean; count: number; reviews: any[] }>("/superadmin/reviews"),
    deleteReview: (id: string) =>
      apiFetch<{ success: boolean; message: string }>(`/superadmin/reviews/${id}`, { method: "DELETE" }),
    getCrm: () => apiFetch<{ success: boolean; count: number; tickets: any[] }>("/superadmin/crm"),
    updateCrm: (id: string, data: object) =>
      apiFetch<{ success: boolean; message: string }>(`/superadmin/crm/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    getSettings: () => apiFetch<{ success: boolean; settings: any }>("/superadmin/settings"),
    updateSettings: (data: object) =>
      apiFetch<{ success: boolean; message: string; settings: any }>("/superadmin/settings", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  // Customers
  customers: {
    getProfile: () => apiFetch<{ success: boolean; customer: any }>("/customers/profile"),
    updateProfile: (data: object) => apiFetch("/customers/profile", { method: "PUT", body: JSON.stringify(data) }),
    getBookings: () => apiFetch("/customers/bookings"),
    getFavourites: () => apiFetch("/customers/favourites"),
    toggleFavourite: (restaurantId: string) => apiFetch(`/customers/favourites/${restaurantId}`, { method: "POST" }),
  },

  // Restaurants
  restaurants: {
    getAll: (params?: { search?: string; cuisine?: string; city?: string; state?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return apiFetch(`/restaurants${query ? `?${query}` : ""}`);
    },

    getById: (id: string) => apiFetch(`/restaurants/${id}`),

    getProfile: () => apiFetch<{ success: boolean; restaurant: any }>("/restaurants/profile"),

    getImages: (id: string) => apiFetch(`/restaurants/${id}/images`),

    getDashboardStats: () => apiFetch("/restaurant/dashboard"),

    updateProfile: (formData: FormData | object) =>
      formData instanceof FormData
        ? apiFetch("/restaurants/profile", { method: "PUT", body: formData })
        : apiFetch("/restaurants/profile", { method: "PUT", body: JSON.stringify(formData) }),

    verifyAdminPassword: (adminPassword: string) =>
      apiFetch<{ success: boolean; verified: boolean; message?: string }>("/restaurants/verify-admin-password", {
        method: "POST",
        body: JSON.stringify({ adminPassword }),
      }),

    changeAdminPassword: (data: { currentPassword?: string; newPassword: string }) =>
      apiFetch<{ success: boolean; message: string }>("/restaurants/change-admin-password", {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    getGallery: (restaurantId: string) =>
      apiFetch<{ success: boolean; gallery: Array<{ id?: string; _id?: string; url: string; category: string; title: string; createdAt: string }> }>(
        `/restaurants/${restaurantId}/gallery`
      ),

    addGalleryImage: (
      formData: FormData,
      onProgress?: (percentage: number) => void
    ): Promise<{ success: boolean; image: { id: string; url: string; category: string; title: string } }> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const baseUrl = getApiBaseUrl();
        xhr.open("POST", `${baseUrl}/restaurants/gallery`);

        const token = getAuthToken();
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }

        if (xhr.upload && onProgress) {
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              onProgress(percent);
            }
          };
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const json = JSON.parse(xhr.responseText);
              resolve(json);
            } catch (err) {
              reject(new Error("Invalid server response"));
            }
          } else {
            try {
              const json = JSON.parse(xhr.responseText);
              reject(new Error(json.message || "Failed to upload gallery image"));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        };

        xhr.onerror = () => reject(new Error("Network error during image upload"));
        xhr.send(formData);
      });
    },

    deleteGalleryImage: (imageId: string) =>
      apiFetch<{ success: boolean; message: string }>(`/restaurants/gallery/${imageId}`, {
        method: "DELETE",
      }),
  },

  // Staff Management
  staff: {
    getAll: (restaurantId?: string) =>
      apiFetch(`/staff${restaurantId ? `?restaurantId=${restaurantId}` : ""}`),

    add: (formData: FormData | object) =>
      formData instanceof FormData
        ? apiFetch("/staff", { method: "POST", body: formData })
        : apiFetch("/staff", { method: "POST", body: JSON.stringify(formData) }),

    edit: (id: string, formData: FormData | object) =>
      formData instanceof FormData
        ? apiFetch(`/staff/${id}`, { method: "PUT", body: formData })
        : apiFetch(`/staff/${id}`, { method: "PUT", body: JSON.stringify(formData) }),

    delete: (id: string) => apiFetch(`/staff/${id}`, { method: "DELETE" }),

    toggleStatus: (id: string) => apiFetch(`/staff/${id}/status`, { method: "PATCH" }),
  },

  // Dishes
  dishes: {
    getAll: (params?: { restaurantId?: string; category?: string; search?: string; vegOnly?: string | boolean; availableOnly?: string | boolean }) => {
      const query = new URLSearchParams(params as any).toString();
      return apiFetch(`/dishes${query ? `?${query}` : ""}`);
    },

    getById: (id: string) => apiFetch(`/dishes/${id}`),

    add: (formData: FormData | object) =>
      formData instanceof FormData
        ? apiFetch("/dishes", { method: "POST", body: formData })
        : apiFetch("/dishes", { method: "POST", body: JSON.stringify(formData) }),

    edit: (id: string, formData: FormData | object) =>
      formData instanceof FormData
        ? apiFetch(`/dishes/${id}`, { method: "PUT", body: formData })
        : apiFetch(`/dishes/${id}`, { method: "PUT", body: JSON.stringify(formData) }),

    delete: (id: string) => apiFetch(`/dishes/${id}`, { method: "DELETE" }),

    updatePortions: (id: string, portionsLeft: number) =>
      apiFetch(`/dishes/${id}/portions`, {
        method: "PATCH",
        body: JSON.stringify({ portionsLeft }),
      }),

    toggleStatus: (id: string, available: boolean) =>
      apiFetch(`/dishes/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ available }),
      }),
  },

  // Bookings
  bookings: {
    create: (data: object) =>
      apiFetch("/bookings", { method: "POST", body: JSON.stringify(data) }),

    getMyBookings: () => apiFetch("/bookings/my-bookings"),

    getById: (id: string) => apiFetch(`/bookings/${id}`),

    cancel: (id: string) => apiFetch(`/bookings/${id}/cancel`, { method: "PATCH" }),
  },

  // Kitchen
  kitchen: {
    getOrders: () => apiFetch("/kitchen/orders"),

    updateStatus: (id: string, status: string) =>
      apiFetch(`/kitchen/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
  },

  // Tables
  tables: {
    getAll: (restaurantId?: string) =>
      apiFetch(`/tables${restaurantId ? `?restaurantId=${restaurantId}` : ""}`),

    add: (data: FormData | object) =>
      data instanceof FormData
        ? apiFetch("/tables", { method: "POST", body: data })
        : apiFetch("/tables", { method: "POST", body: JSON.stringify(data) }),

    hold: (data: object) => apiFetch("/tables/hold", { method: "POST", body: JSON.stringify(data) }),

    edit: (id: string, data: FormData | object) =>
      data instanceof FormData
        ? apiFetch(`/tables/${id}`, { method: "PUT", body: data })
        : apiFetch(`/tables/${id}`, { method: "PUT", body: JSON.stringify(data) }),

    delete: (id: string) => apiFetch(`/tables/${id}`, { method: "DELETE" }),

    toggleAvailability: (id: string, statusOrAvailable: string | boolean) =>
      apiFetch(`/tables/${id}/availability`, {
        method: "PATCH",
        body: JSON.stringify(
          typeof statusOrAvailable === "string"
            ? { status: statusOrAvailable }
            : { isAvailable: statusOrAvailable }
        ),
      }),
  },

  // Reviews
  reviews: {
    add: (data: object) => apiFetch("/reviews", { method: "POST", body: JSON.stringify(data) }),

    getByRestaurant: (restaurantId: string) => apiFetch(`/reviews/restaurant/${restaurantId}`),

    getFeatured: () => apiFetch<{ success: boolean; reviews: any[] }>("/reviews/featured"),

    reply: (id: string, reply: string) =>
      apiFetch(`/reviews/${id}/reply`, {
        method: "PATCH",
        body: JSON.stringify({ reply }),
      }),
  },

  // Intelligent Search
  search: {
    query: (q: string) => apiFetch<{ success: boolean; results: { dishes: any[]; restaurants: any[]; cuisines: string[] } }>(`/search?q=${encodeURIComponent(q)}`),
  },

  // QR Code
  qr: {
    getRestaurantQR: (restaurantId: string) => apiFetch(`/qr/restaurant/${restaurantId}`),

    scanCheckin: (bookingId?: string, qrPayload?: string) =>
      apiFetch("/qr/checkin", {
        method: "POST",
        body: JSON.stringify({ bookingId, qrPayload }),
      }),
  },

  // Super Admin
  admin: {
    getRestaurants: () => apiFetch("/admin/restaurants"),
    approveRestaurant: (id: string) => apiFetch(`/admin/restaurants/${id}/approve`, { method: "PATCH" }),
    rejectRestaurant: (id: string) => apiFetch(`/admin/restaurants/${id}/reject`, { method: "PATCH" }),
    deleteRestaurant: (id: string) => apiFetch(`/admin/restaurants/${id}`, { method: "DELETE" }),
    getCustomers: () => apiFetch("/admin/customers"),
    deleteCustomer: (id: string) => apiFetch(`/admin/customers/${id}`, { method: "DELETE" }),
    getAnalytics: () => apiFetch("/admin/analytics"),
  },

  superAdmin: {
    login: (credentials: object) =>
      apiFetch<{ success: boolean; token: string; user: any; role?: string; message?: string }>("/superadmin/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    getStats: () => apiFetch<{ success: boolean; stats: any }>("/superadmin/dashboard-stats"),
    getUsers: () => apiFetch<{ success: boolean; users: any[] }>("/superadmin/users"),
    updateUserRole: (id: string, role: string) =>
      apiFetch<{ success: boolean; message: string; user?: any }>(`/superadmin/users/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      }),
    deleteUser: (id: string) => apiFetch<{ success: boolean; message: string }>(`/superadmin/users/${id}`, { method: "DELETE" }),
    getRestaurants: () => apiFetch<{ success: boolean; restaurants: any[] }>("/superadmin/restaurants"),
    approveRestaurant: (id: string) => apiFetch<{ success: boolean; message: string }>(`/superadmin/restaurants/${id}/approve`, { method: "PATCH" }),
    rejectRestaurant: (id: string) => apiFetch<{ success: boolean; message: string }>(`/superadmin/restaurants/${id}/reject`, { method: "PATCH" }),
    deleteRestaurant: (id: string) => apiFetch<{ success: boolean; message: string }>(`/superadmin/restaurants/${id}`, { method: "DELETE" }),
    getBookings: () => apiFetch<{ success: boolean; bookings: any[] }>("/superadmin/bookings"),
    updateBookingStatus: (id: string, status: string) =>
      apiFetch<{ success: boolean; message: string }>(`/superadmin/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    getPayments: () => apiFetch<{ success: boolean; analytics: any }>("/superadmin/payments"),
    getReviews: () => apiFetch<{ success: boolean; reviews: any[] }>("/superadmin/reviews"),
    deleteReview: (id: string) => apiFetch<{ success: boolean; message: string }>(`/superadmin/reviews/${id}`, { method: "DELETE" }),
    getCrm: () => apiFetch<{ success: boolean; tickets: any[] }>("/superadmin/crm"),
    updateCrmTicket: (id: string, data: object) =>
      apiFetch<{ success: boolean; ticket: any }>(`/superadmin/crm/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    getSettings: () => apiFetch<{ success: boolean; settings: any }>("/superadmin/settings"),
    updateSettings: (data: object) =>
      apiFetch<{ success: boolean; message: string; settings: any }>("/superadmin/settings", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },
};

export default api;
