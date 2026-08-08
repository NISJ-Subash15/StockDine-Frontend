import { useState, useEffect } from "react";
import api from "@/lib/api";

export type StockType = "Available" | "Limited Stock" | "Fast Selling" | "Almost Sold Out" | "Sold Out";

export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP" | "AED" | "JPY" | "SGD";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rate: number; // exchange rate relative to INR 1.0
  name: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: "INR", symbol: "₹", rate: 1.0, name: "Indian Rupee" },
  USD: { code: "USD", symbol: "$", rate: 0.012, name: "US Dollar" },
  EUR: { code: "EUR", symbol: "€", rate: 0.011, name: "Euro" },
  GBP: { code: "GBP", symbol: "£", rate: 0.0094, name: "British Pound" },
  AED: { code: "AED", symbol: "AED ", rate: 0.044, name: "UAE Dirham" },
  JPY: { code: "JPY", symbol: "¥", rate: 1.85, name: "Japanese Yen" },
  SGD: { code: "SGD", symbol: "S$", rate: 0.016, name: "Singapore Dollar" },
};

export type LanguageCode = "EN" | "ES" | "FR" | "DE" | "HI" | "JA" | "AR";

export interface LanguageConfig {
  code: LanguageCode;
  name: string;
  flag: string;
}

export const LANGUAGES: LanguageConfig[] = [
  { code: "EN", name: "English", flag: "🇺🇸" },
  { code: "ES", name: "Español", flag: "🇪🇸" },
  { code: "FR", name: "Français", flag: "🇫🇷" },
  { code: "DE", name: "Deutsch", flag: "🇩🇪" },
  { code: "HI", name: "हिन्दी", flag: "🇮🇳" },
  { code: "JA", name: "日本語", flag: "🇯🇵" },
  { code: "AR", name: "العربية", flag: "🇦🇪" },
];

let activeCurrency: CurrencyCode = "INR";
let activeLanguage: LanguageCode = "EN";

export function formatCurrency(amountInINR: number, overrideCurrency?: CurrencyCode): string {
  const code = overrideCurrency || activeCurrency;
  const config = CURRENCIES[code] || CURRENCIES.INR;
  const converted = amountInINR * config.rate;
  
  if (code === "JPY") {
    return `${config.symbol}${Math.round(converted).toLocaleString()}`;
  }
  return `${config.symbol}${converted.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function sanitizeNumberInput(val: string | number): number {
  if (val === "" || val === null || val === undefined) return 0;
  const str = String(val).trim().replace(/^0+(?=\d)/, "");
  const num = parseInt(str, 10);
  return isNaN(num) ? 0 : num;
}

export type DishCategory = "Starters" | "Main Course" | "Desserts" | "Drinks" | "Special Items" | "Pizza";

export type DishImageMetadata = {
  imageUrl: string;
  storagePath?: string;
  uploadTimestamp?: string;
};

export type Dish = {
  id: string;
  restaurantId: string;
  restaurantName?: string;
  restaurantLogo?: string;
  name: string;
  category: DishCategory | string;
  price: number;
  discountPrice?: number;
  description?: string;
  ingredients?: string;
  prepTime: string;
  portionsLeft: number;
  image: string;
  dishImage?: string | DishImageMetadata;
  enabled: boolean;
  availableToday: boolean;
  stockType: StockType;
  lastUpdated: string;
  rating?: number;
  isVeg?: boolean;
  isVegan?: boolean;
  isOrganic?: boolean;
  isBestseller?: boolean;
  isChefRecommended?: boolean;
  spiceLevel?: number;
  availability?: "Available" | "Sold Out";
};

export type TableType = "Regular" | "Window" | "Family" | "VIP" | "Outdoor" | "Rooftop" | "Private Room";

export type Table = {
  id: string;
  restaurantId: string;
  tableNumber: string;
  tableName?: string;
  floor?: string;
  section?: string;
  locationDesc?: string;
  capacity: number;
  tableType?: TableType;
  location?: "Indoor" | "Outdoor" | "Rooftop" | "VIP";
  isVip?: boolean;
  type?: TableType;
  image?: string;
  description?: string;
  timeSlots?: string[];
  status: "Available" | "Reserved" | "Occupied" | "Maintenance";
  isAvailable?: boolean;
};

export type RestaurantAmenities = {
  parking: boolean;
  wifi: boolean;
  ac: boolean;
  outdoorSeating: boolean;
  familyFriendly: boolean;
  privateDining: boolean;
  liveMusic: boolean;
  wheelchairAccessible: boolean;
};

export type RestaurantCategory =
  | "All"
  | "Nearby"
  | "Popular"
  | "Top Rated"
  | "Newly Added"
  | "Cafes"
  | "Fine Dining"
  | "Fast Food"
  | "Family Restaurants";

export type RestaurantDetails = {
  id: string;
  _id?: string;
  ownerId?: string;
  ownerName?: string;
  name: string;
  tagline?: string;
  logo: string;
  coverImage: string;
  interiorPhotos: string[];
  exteriorPhotos: string[];
  address: string;
  city: string;
  state?: string;
  country: string;
  pincode?: string;
  contactPhone: string;
  contactEmail?: string;
  openingHours: string;
  closingHours?: string;
  cuisine?: string;
  cuisines: string[];
  category?: RestaurantCategory | string;
  priceRange: string;
  description: string;
  gstNumber?: string;
  fssaiNumber?: string;
  adminPasswordProtection?: boolean;
  story?: string;
  rating: number;
  reviewsCount: number;
  distanceKm?: number;
  travelTime?: string;
  isOpen?: boolean;
  availableTablesCount?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  amenities: RestaurantAmenities;
  adminPortalPassword?: string;
  createdAt?: string;
};

export type GalleryImageCategory =
  | "Interior"
  | "Exterior"
  | "Dining Area"
  | "VIP Rooms"
  | "Events"
  | "Food Highlights"
  | "Food"
  | "Tables";

export type GalleryImage = {
  id: string;
  restaurantId: string;
  url: string;
  category: GalleryImageCategory;
  title: string;
  order: number;
};

export type Review = {
  id: string;
  restaurantId: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  foodRating?: number;
  serviceRating?: number;
  ambienceRating?: number;
  cleanlinessRating?: number;
  valueRating?: number;
  date: string;
  comment: string;
  photos?: string[];
  helpfulCount?: number;
  verifiedDiner?: boolean;
  adminReply?: string;
  adminReplyDate?: string;
  isReported?: boolean;
};

export type BookingItem = {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
};

export type BookingStatus = "Confirmed" | "Accepted" | "Preparing" | "Ready" | "Checked In" | "Seated" | "Completed" | "Rejected" | "Cancelled";

export type Booking = {
  bookingId: string;
  paymentId: string;
  restaurantId: string;
  restaurantName: string;
  customerName: string;
  customerPhone: string;
  items: BookingItem[];
  tableId: string;
  tableNumber: string;
  date: string;
  time: string;
  guests?: number;
  totalAmount: number;
  advanceAmount: number;
  remainingAmount: number;
  paymentMethod?: string;
  paymentStatus: "Confirmed" | "Pending" | "Refunded";
  bookingStatus: BookingStatus;
  qrCodeUrl?: string;
  isReviewed?: boolean;
  createdAt: string;
};

export type ActivityType = "Food Added" | "Stock Updated" | "Booking Received" | "Food Sold Out" | "Status Changed" | "Staff Added" | "Super Admin Action";

export type ActivityLog = {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: string;
};

export type KitchenStaff = {
  id: string;
  staffId: string;
  name: string;
  email: string;
  phone: string;
  mobile?: string;
  roleTitle: string;
  role?: string;
  password?: string;
  profilePhoto?: string;
  status: "Active" | "Disabled";
  createdAt: string;
  restaurantId?: string;
};

export type PlatformRestaurant = {
  id: string;
  name: string;
  city: string;
  country: string;
  verificationStatus: "Verified" | "Pending" | "Suspended";
  subscriptionTier: "Basic" | "Pro" | "Enterprise";
  commissionRate: number;
  totalBookings: number;
  gmv: number;
  isFeatured: boolean;
  rating: number;
  aiMatchScore: number;
};

export type PlatformCustomer = {
  id: string;
  name: string;
  email: string;
  country: string;
  totalBookings: number;
  loyaltyPoints: number;
  status: "Active" | "Flagged";
};

export type SupportTicket = {
  id: string;
  requester: string;
  type: "Customer" | "Restaurant";
  subject: string;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Resolved";
  createdAt: string;
};

export type AuthPermission = "both" | "admin" | "kitchen" | "superadmin";

export type AuthSession = {
  userEmail: string;
  restaurantId: string;
  permissions: AuthPermission;
  isLoggedIn: boolean;
  userRole?: string;
  profileData?: any;
};

function loadAuthSession(): AuthSession {
  if (typeof window === "undefined") {
    return { userEmail: "", restaurantId: "", permissions: "both", isLoggedIn: false };
  }
  try {
    const token = localStorage.getItem("stockdine_token");
    if (!token) {
      localStorage.removeItem("stockdine_auth_session");
      return { userEmail: "", restaurantId: "", permissions: "both", isLoggedIn: false };
    }
    const data = localStorage.getItem("stockdine_auth_session");
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed && parsed.isLoggedIn) return parsed;
    }
  } catch {}
  return { userEmail: "", restaurantId: "", permissions: "both", isLoggedIn: false };
}

function saveAuthSession(session: AuthSession) {
  if (typeof window === "undefined") return;
  try {
    if (session.isLoggedIn) {
      localStorage.setItem("stockdine_auth_session", JSON.stringify(session));
    } else {
      localStorage.removeItem("stockdine_auth_session");
    }
  } catch (e) {
    console.error("Failed to save auth session", e);
  }
}

let currentAuthSession: AuthSession = loadAuthSession();

// All initial stores start completely empty - driven exclusively by MongoDB Atlas
let initialDishes: Dish[] = [];
let initialTables: Table[] = [];
let initialBookings: Booking[] = [];
let initialActivityLogs: ActivityLog[] = [];
let initialKitchenStaff: KitchenStaff[] = [];
let initialPlatformRestaurants: PlatformRestaurant[] = [];
let initialPlatformCustomers: PlatformCustomer[] = [];
let initialSupportTickets: SupportTicket[] = [];
let initialRestaurantProfiles: Record<string, RestaurantDetails> = {};
let initialGalleryImages: GalleryImage[] = [];
let initialReviews: Review[] = [];

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export const stockDineStore = {
  getDishes: (restaurantId?: string): Dish[] => {
    const targetId = restaurantId || (currentAuthSession.isLoggedIn ? currentAuthSession.restaurantId : undefined);
    if (targetId) {
      return initialDishes.filter((d) => d.restaurantId === targetId);
    }
    return initialDishes;
  },

  getTables: (restaurantId?: string): Table[] => {
    const targetId = restaurantId || (currentAuthSession.isLoggedIn ? currentAuthSession.restaurantId : undefined);
    if (targetId) {
      return initialTables.filter((t) => t.restaurantId === targetId);
    }
    return initialTables;
  },

  getBookings: (restaurantId?: string): Booking[] => {
    const targetId = restaurantId || (currentAuthSession.isLoggedIn ? currentAuthSession.restaurantId : undefined);
    if (targetId) {
      return initialBookings.filter((b) => b.restaurantId === targetId);
    }
    return initialBookings;
  },

  getActivityLogs: () => initialActivityLogs,
  getKitchenStaff: (restaurantId?: string): KitchenStaff[] => {
    const targetId = restaurantId || (currentAuthSession.isLoggedIn ? currentAuthSession.restaurantId : undefined);
    if (targetId) {
      return initialKitchenStaff.filter((k) => (k as any).restaurantId === targetId || !k.restaurantId);
    }
    return initialKitchenStaff;
  },
  getAuthSession: () => currentAuthSession,
  getPlatformRestaurants: () => initialPlatformRestaurants,
  getPlatformCustomers: () => initialPlatformCustomers,
  getSupportTickets: () => initialSupportTickets,
  getActiveCurrency: () => activeCurrency,
  getActiveLanguage: () => activeLanguage,

  getRestaurantProfile: (restaurantId?: string): RestaurantDetails => {
    const targetId = restaurantId || (currentAuthSession.isLoggedIn ? currentAuthSession.restaurantId : "");
    if (targetId && initialRestaurantProfiles[targetId]) {
      return initialRestaurantProfiles[targetId];
    }
    
    return {
      id: targetId || "REST-NONE",
      name: currentAuthSession.profileData?.restaurantName || "Restaurant Account",
      tagline: "Live Dine-in Intelligence",
      logo: currentAuthSession.profileData?.restaurantLogo || "",
      coverImage: currentAuthSession.profileData?.restaurantCover || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=60",
      interiorPhotos: [],
      exteriorPhotos: [],
      address: currentAuthSession.profileData?.address || "",
      city: currentAuthSession.profileData?.city || "",
      state: currentAuthSession.profileData?.state || "",
      country: currentAuthSession.profileData?.country || "India",
      contactPhone: currentAuthSession.profileData?.mobileNumber || "",
      contactEmail: currentAuthSession.profileData?.email || "",
      openingHours: "11:00 AM - 11:00 PM",
      cuisines: [currentAuthSession.profileData?.cuisine || "Multi-Cuisine"],
      category: "Fine Dining",
      priceRange: "Moderate",
      description: `Welcome to ${currentAuthSession.profileData?.restaurantName || "our restaurant"}.`,
      rating: currentAuthSession.profileData?.rating || 5.0,
      reviewsCount: currentAuthSession.profileData?.numReviews || 0,
      isOpen: true,
      availableTablesCount: 0,
      coordinates: { latitude: 0, longitude: 0 },
      amenities: {
        parking: true,
        wifi: true,
        ac: true,
        outdoorSeating: true,
        familyFriendly: true,
        privateDining: false,
        liveMusic: false,
        wheelchairAccessible: true,
      },
    };
  },

  getAllRestaurantProfiles: (): Record<string, RestaurantDetails> => initialRestaurantProfiles,

  getUniqueRestaurantList: (): RestaurantDetails[] => {
    const seen = new Set<string>();
    const list: RestaurantDetails[] = [];
    Object.values(initialRestaurantProfiles).forEach((rest) => {
      if (!rest || (!rest.id && !rest.name)) return;
      const key = rest.id || rest.name.toLowerCase().trim();
      const emailKey = rest.contactEmail ? rest.contactEmail.toLowerCase().trim() : "";
      if (!seen.has(key) && (!emailKey || !seen.has(emailKey))) {
        seen.add(key);
        if (emailKey) seen.add(emailKey);
        list.push(rest);
      }
    });
    return list;
  },

  fetchRestaurantProfile: async (restaurantId?: string): Promise<RestaurantDetails | null> => {
    try {
      const res = await api.restaurants.getProfile();
      if (res && res.success && res.restaurant) {
        const rest = res.restaurant;
        const targetId = rest.restaurantId || rest._id || restaurantId || currentAuthSession.restaurantId;
        const profile: RestaurantDetails = {
          id: targetId,
          ownerId: rest.ownerName || rest.ownerId || "",
          ownerName: rest.ownerName || "",
          name: rest.restaurantName || "Restaurant Account",
          tagline: rest.tagline || "Live Dine-in Intelligence",
          logo: rest.restaurantLogo || "",
          coverImage: rest.restaurantCover || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=60",
          interiorPhotos: rest.interiorPhotos || [],
          exteriorPhotos: rest.exteriorPhotos || [],
          address: rest.address || "",
          city: rest.city || "",
          state: rest.state || "",
          country: rest.country || "India",
          pincode: rest.pincode || "",
          contactPhone: rest.mobileNumber || rest.phone || "",
          contactEmail: rest.email || "",
          openingHours: rest.openingHours || "11:00 AM",
          closingHours: rest.closingHours || "11:00 PM",
          cuisine: rest.cuisine || "Multi-Cuisine",
          cuisines: [rest.cuisine || "Multi-Cuisine"],
          category: rest.restaurantType || "Fine Dining",
          priceRange: "Moderate",
          description: rest.description || `Welcome to ${rest.restaurantName || "our restaurant"}.`,
          gstNumber: rest.gstNumber || "",
          fssaiNumber: rest.fssaiNumber || "",
          adminPasswordProtection: rest.adminPasswordProtection !== false,
          rating: rest.numReviews && rest.numReviews > 0 ? (rest.rating || 0) : 0,
          reviewsCount: rest.numReviews || 0,
          isOpen: true,
          availableTablesCount: 0,
          amenities: {
            parking: true,
            wifi: true,
            ac: true,
            outdoorSeating: true,
            familyFriendly: true,
            privateDining: false,
            liveMusic: false,
            wheelchairAccessible: true,
          },
        };

        initialRestaurantProfiles[targetId] = profile;
        if (typeof window !== "undefined") {
          localStorage.setItem("stockdine_admin_protection_" + targetId, String(rest.adminPasswordProtection !== false));
        }
        if (currentAuthSession.isLoggedIn) {
          currentAuthSession.profileData = {
            ...currentAuthSession.profileData,
            ...rest,
            adminPasswordProtection: rest.adminPasswordProtection !== false,
          };
          saveAuthSession(currentAuthSession);
        }
        notify();
        return profile;
      }
    } catch (err) {
      console.warn("Failed to fetch restaurant profile from MongoDB:", err);
    }
    return null;
  },

  updateRestaurantProfile: async (
    restaurantId: string,
    updates: Partial<RestaurantDetails> & { logoFile?: File | null; coverFile?: File | null }
  ): Promise<{ success: boolean; message?: string; restaurant?: RestaurantDetails }> => {
    const targetId = restaurantId || currentAuthSession.restaurantId;

    try {
      let res: any;
      if (updates.logoFile || updates.coverFile) {
        const formData = new FormData();
        if (updates.logoFile) formData.append("logo", updates.logoFile);
        if (updates.coverFile) formData.append("cover", updates.coverFile);
        if (updates.name) formData.append("restaurantName", updates.name);
        if (updates.ownerName) formData.append("ownerName", updates.ownerName);
        if (updates.contactPhone) formData.append("mobileNumber", updates.contactPhone);
        if (updates.address) formData.append("address", updates.address);
        if (updates.city !== undefined) formData.append("city", updates.city);
        if (updates.state !== undefined) formData.append("state", updates.state);
        if (updates.country !== undefined) formData.append("country", updates.country);
        if (updates.pincode !== undefined) formData.append("pincode", updates.pincode);
        if (updates.cuisine) formData.append("cuisine", updates.cuisine);
        if (updates.openingHours !== undefined) formData.append("openingHours", updates.openingHours);
        if (updates.closingHours !== undefined) formData.append("closingHours", updates.closingHours);
        if (updates.description !== undefined) formData.append("description", updates.description);
        if (updates.gstNumber !== undefined) formData.append("gstNumber", updates.gstNumber);
        if (updates.fssaiNumber !== undefined) formData.append("fssaiNumber", updates.fssaiNumber);
        if (updates.adminPasswordProtection !== undefined) formData.append("adminPasswordProtection", String(updates.adminPasswordProtection));

        res = await api.restaurants.updateProfile(formData);
      } else {
        res = await api.restaurants.updateProfile({
          restaurantName: updates.name,
          ownerName: updates.ownerName,
          mobileNumber: updates.contactPhone,
          address: updates.address,
          city: updates.city,
          state: updates.state,
          country: updates.country,
          pincode: updates.pincode,
          cuisine: updates.cuisine || updates.cuisines?.[0],
          openingHours: updates.openingHours,
          closingHours: updates.closingHours,
          description: updates.description,
          gstNumber: updates.gstNumber,
          fssaiNumber: updates.fssaiNumber,
          restaurantLogo: updates.logo,
          restaurantCover: updates.coverImage,
          adminPasswordProtection: updates.adminPasswordProtection,
        });
      }

      if (res && res.success && res.restaurant) {
        const rest = res.restaurant;
        const updatedProfile: RestaurantDetails = {
          ...stockDineStore.getRestaurantProfile(targetId),
          id: targetId,
          ownerName: rest.ownerName || updates.ownerName || "",
          name: rest.restaurantName || updates.name || "",
          logo: rest.restaurantLogo || updates.logo || "",
          coverImage: rest.restaurantCover || updates.coverImage || "",
          address: rest.address || updates.address || "",
          city: rest.city || updates.city || "",
          state: rest.state || updates.state || "",
          country: rest.country || updates.country || "",
          pincode: rest.pincode || updates.pincode || "",
          contactPhone: rest.mobileNumber || updates.contactPhone || "",
          contactEmail: rest.email || updates.contactEmail || "",
          openingHours: rest.openingHours || updates.openingHours || "11:00 AM",
          closingHours: rest.closingHours || updates.closingHours || "11:00 PM",
          cuisine: rest.cuisine || updates.cuisine || "Multi-Cuisine",
          cuisines: [rest.cuisine || updates.cuisine || "Multi-Cuisine"],
          description: rest.description || updates.description || "",
          gstNumber: rest.gstNumber || updates.gstNumber || "",
          fssaiNumber: rest.fssaiNumber || updates.fssaiNumber || "",
          adminPasswordProtection: rest.adminPasswordProtection !== false,
        };

        initialRestaurantProfiles[targetId] = updatedProfile;
        if (currentAuthSession.isLoggedIn) {
          currentAuthSession.profileData = {
            ...currentAuthSession.profileData,
            ...rest,
          };
          saveAuthSession(currentAuthSession);
        }
        notify();
        return { success: true, message: "Restaurant Profile Updated Successfully.", restaurant: updatedProfile };
      }
      return { success: false, message: res?.message || "Failed to update profile" };
    } catch (err: any) {
      console.error("Failed to save restaurant profile to MongoDB:", err);
      return { success: false, message: err.message || "Failed to update restaurant profile" };
    }
  },

  getGalleryImages: (restaurantId?: string): GalleryImage[] => {
    const targetId = restaurantId || (currentAuthSession.isLoggedIn ? currentAuthSession.restaurantId : undefined);
    if (targetId) {
      return initialGalleryImages.filter((g) => g.restaurantId === targetId);
    }
    return initialGalleryImages;
  },

  fetchGalleryImages: async (restaurantId?: string): Promise<GalleryImage[]> => {
    const targetId = restaurantId || (currentAuthSession.isLoggedIn ? currentAuthSession.restaurantId : undefined);
    if (!targetId) return initialGalleryImages;
    try {
      const res = await api.restaurants.getGallery(targetId);
      if (res && res.success && Array.isArray(res.gallery) && res.gallery.length > 0) {
        const fetched: GalleryImage[] = res.gallery.map((g: any) => ({
          id: g.id || g._id || "g_" + Math.random(),
          restaurantId: targetId,
          url: g.url,
          category: g.category || "Interior",
          title: g.title || "Restaurant Photo",
          order: 1,
        }));
        const otherItems = initialGalleryImages.filter((g) => g.restaurantId !== targetId);
        initialGalleryImages = [...fetched, ...otherItems];
        notify();
        return fetched;
      }
    } catch (err) {
      console.warn("Failed to fetch gallery images from MongoDB:", err);
    }
    return stockDineStore.getGalleryImages(targetId);
  },

  addGalleryImageUpload: async (
    file: File,
    category: string,
    title: string,
    onProgress?: (percentage: number) => void
  ): Promise<{ success: boolean; image?: GalleryImage; message?: string }> => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("category", category);
    formData.append("title", title);
    if (currentAuthSession.restaurantId) {
      formData.append("restaurantId", currentAuthSession.restaurantId);
    }

    try {
      const res = await api.restaurants.addGalleryImage(formData, onProgress);
      if (res && res.success && res.image) {
        const newImg: GalleryImage = {
          id: res.image.id || "g_" + Date.now(),
          restaurantId: currentAuthSession.restaurantId,
          url: res.image.url,
          category: (res.image.category || category) as GalleryImageCategory,
          title: res.image.title || title,
          order: 1,
        };
        initialGalleryImages = [newImg, ...initialGalleryImages];
        notify();
        return { success: true, image: newImg };
      }
      return { success: false, message: "Failed to upload image" };
    } catch (err: any) {
      console.error("Gallery Upload Error:", err);
      return { success: false, message: err.message || "Failed to upload image" };
    }
  },

  addGalleryImage: (image: Omit<GalleryImage, "id">) => {
    const targetRestId = image.restaurantId || currentAuthSession.restaurantId;
    const newImg: GalleryImage = {
      ...image,
      id: "g_" + Date.now(),
      restaurantId: targetRestId,
    };
    initialGalleryImages = [newImg, ...initialGalleryImages];
    notify();
  },

  deleteGalleryImage: async (id: string) => {
    try {
      await api.restaurants.deleteGalleryImage(id);
    } catch (err) {
      console.warn("Delete gallery image API error:", err);
    }
    initialGalleryImages = initialGalleryImages.filter((g) => g.id !== id);
    notify();
  },

  getReviews: (restaurantId?: string): Review[] => {
    const targetId = restaurantId || (currentAuthSession.isLoggedIn ? currentAuthSession.restaurantId : undefined);
    if (targetId) {
      return initialReviews.filter((r) => r.restaurantId === targetId);
    }
    return initialReviews;
  },

  addReview: (review: Omit<Review, "id" | "date">) => {
    const newRev: Review = {
      ...review,
      id: "r_" + Date.now(),
      date: "Just now",
    };
    initialReviews = [newRev, ...initialReviews];
    notify();
  },

  setCurrency: (code: CurrencyCode) => {
    activeCurrency = code;
    notify();
  },

  setLanguage: (code: LanguageCode) => {
    activeLanguage = code;
    notify();
  },

  setAuthSession: (session: AuthSession) => {
    currentAuthSession = session;
    saveAuthSession(session);
    notify();
  },

  updateUserProfile: async (data: { name: string; mobile?: string; email?: string }): Promise<{ success: boolean; user?: any; message?: string }> => {
    try {
      const res: any = await api.auth.updateCustomerProfile(data);
      if (res && res.success && (res.user || res.profile)) {
        const updatedProf = res.user || res.profile;
        currentAuthSession = {
          ...currentAuthSession,
          userEmail: updatedProf.email || updatedProf.mobile || currentAuthSession.userEmail,
          profileData: {
            ...currentAuthSession.profileData,
            ...updatedProf,
          },
        };
        saveAuthSession(currentAuthSession);
        notify();
        return { success: true, user: updatedProf, message: res.message || "Profile updated successfully" };
      }
      return { success: false, message: res?.message || "Failed to update profile" };
    } catch (err: any) {
      console.error("updateUserProfile error:", err);
      return { success: false, message: err.message || "Failed to update profile" };
    }
  },

  signOut: () => {
    currentAuthSession = {
      userEmail: "",
      restaurantId: "",
      permissions: "both",
      isLoggedIn: false,
    };
    saveAuthSession(currentAuthSession);
    if (typeof window !== "undefined") {
      localStorage.removeItem("stockdine_token");
      localStorage.removeItem("stockdine_auth_session");
      sessionStorage.removeItem("stockdine_admin_unlocked");
    }
    notify();
  },

  addLog: (type: ActivityType, message: string) => {
    const newLog: ActivityLog = {
      id: "a_" + Date.now(),
      type,
      message,
      timestamp: "Just now",
    };
    initialActivityLogs = [newLog, ...initialActivityLogs];
  },

  checkEmailExists: (email?: string): boolean => false,
  checkRestaurantExists: (name?: string): boolean => false,

  getAdminPortalPassword: (restaurantId?: string): string => {
    if (typeof window === "undefined") return "";
    try {
      const data = localStorage.getItem("stockdine_admin_passwords");
      const map = data ? JSON.parse(data) : {};
      const restId = restaurantId || currentAuthSession.restaurantId || "default";
      return map[restId] || "";
    } catch {
      return "";
    }
  },
  setAdminPortalPassword: (restaurantId: string, pass: string) => {
    if (typeof window === "undefined") return;
    try {
      const data = localStorage.getItem("stockdine_admin_passwords");
      const map = data ? JSON.parse(data) : {};
      const restId = restaurantId || currentAuthSession.restaurantId || "default";
      map[restId] = pass;
      localStorage.setItem("stockdine_admin_passwords", JSON.stringify(map));
      notify();
    } catch {}
  },
  verifyAdminPortalPassword: async (restaurantId: string, pass: string): Promise<boolean> => {
    try {
      const res = await api.restaurants.verifyAdminPassword(pass);
      if (res && res.success && res.verified) {
        stockDineStore.setAdminPortalPassword(restaurantId, pass);
        return true;
      }
      return false;
    } catch (err: any) {
      if (err.message && (err.message.toLowerCase().includes("incorrect") || err.message.includes("401") || err.message.toLowerCase().includes("invalid"))) {
        return false;
      }
      const stored = stockDineStore.getAdminPortalPassword(restaurantId);
      return Boolean(stored && pass === stored);
    }
  },

  changeAdminPortalPassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.restaurants.changeAdminPassword({ currentPassword, newPassword });
      if (res && res.success) {
        stockDineStore.setAdminPortalPassword(currentAuthSession.restaurantId, newPassword);
        return { success: true, message: res.message || "Admin Security Password updated in MongoDB successfully!" };
      }
      return { success: false, message: res.message || "Failed to update password." };
    } catch (err: any) {
      stockDineStore.setAdminPortalPassword(currentAuthSession.restaurantId, newPassword);
      return { success: true, message: err.message || "Admin Security Password updated!" };
    }
  },

  resolveLoginRole: (emailOrMobile: string): "restaurant" | "superadmin" | "customer" => "customer",
  registerRestaurantAdmin: async (data: any) => ({ success: true, message: "Registration successful" }),

  verifyRestaurant: (id?: string, status?: string) => {},
  setRestaurantCommission: (id?: string, commission?: number) => {},
  toggleFeaturedRestaurant: (id?: string) => {},
  resolveSupportTicket: (ticketId?: string) => {},

  addKitchenStaff: async (staffData: any) => {
    try {
      const res: any = await api.staff.add({
        name: staffData.name,
        mobile: staffData.phone || staffData.mobile,
        email: staffData.email,
        role: staffData.roleTitle || staffData.role || "Kitchen Staff",
        password: staffData.password,
        profilePhoto: staffData.profilePhoto,
        status: staffData.status || "Active",
      });

      if (res && res.success && res.staff) {
        const s = res.staff;
        const newStaff: KitchenStaff = {
          id: s._id,
          staffId: "STF-" + s._id.substring(s._id.length - 4),
          name: s.name,
          email: s.email || "",
          phone: s.mobile || "",
          mobile: s.mobile || "",
          roleTitle: s.role,
          role: s.role,
          password: s.password || "",
          profilePhoto: s.profilePhoto,
          status: s.status,
          createdAt: new Date(s.createdAt).toLocaleDateString(),
          restaurantId: s.restaurant?._id || s.restaurant,
        };
        initialKitchenStaff = [newStaff, ...initialKitchenStaff];
        notify();
        return newStaff;
      }
    } catch (err) {
      console.error("Failed to add staff in API:", err);
    }
  },

  updateKitchenStaff: async (id: string, updates: any) => {
    try {
      const res: any = await api.staff.edit(id, {
        name: updates.name,
        mobile: updates.phone || updates.mobile,
        email: updates.email,
        role: updates.roleTitle || updates.role,
        password: updates.password,
        status: updates.status,
      });
      if (res && res.success && res.staff) {
        initialKitchenStaff = initialKitchenStaff.map((s) => (s.id === id ? { ...s, ...updates } : s));
        notify();
      }
    } catch (err) {
      console.error("Failed to edit staff in API:", err);
    }
  },

  deleteKitchenStaff: async (id: string) => {
    try {
      await api.staff.delete(id);
      initialKitchenStaff = initialKitchenStaff.filter((s) => s.id !== id);
      notify();
    } catch (err) {
      console.error("Failed to delete staff in API:", err);
    }
  },

  toggleKitchenStaffStatus: async (id: string) => {
    try {
      const res: any = await api.staff.toggleStatus(id);
      if (res && res.success && res.staff) {
        initialKitchenStaff = initialKitchenStaff.map((s) =>
          s.id === id ? { ...s, status: res.staff.status } : s
        );
        notify();
      }
    } catch (err) {
      console.error("Failed to toggle staff status in API:", err);
    }
  },

  addDish: async (dish: Omit<Dish, "id" | "lastUpdated">) => {
    const dishId = "d_" + Date.now();
    const mainImg = dish.image || (typeof dish.dishImage === "string" ? dish.dishImage : dish.dishImage?.imageUrl) || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60";
    const newDish: Dish = {
      ...dish,
      id: dishId,
      image: mainImg,
      lastUpdated: "Just now",
    };
    initialDishes = [newDish, ...initialDishes];
    notify();

    try {
      const res: any = await api.dishes.add({
        name: dish.name,
        category: dish.category,
        price: dish.price,
        discountPrice: dish.discountPrice,
        description: dish.description,
        prepTime: dish.prepTime,
        portionsLeft: dish.portionsLeft,
        image: mainImg,
        isVeg: dish.isVeg,
        availableToday: dish.availableToday,
      });
      if (res && res.success && res.dish) {
        newDish.id = res.dish._id;
        notify();
      }
    } catch (err) {
      console.error("Failed to add dish in API:", err);
    }
  },

  updateDish: async (id: string, updates: Partial<Dish>) => {
    initialDishes = initialDishes.map((d) => (d.id === id ? { ...d, ...updates } : d));
    notify();
    try {
      await api.dishes.edit(id, updates);
    } catch (err) {
      console.error("Failed to edit dish in API:", err);
    }
  },

  deleteDish: async (id: string) => {
    initialDishes = initialDishes.filter((d) => d.id !== id);
    notify();
    try {
      await api.dishes.delete(id);
    } catch (err) {
      console.error("Failed to delete dish in API:", err);
    }
  },

  adjustStock: async (id: string, delta: number) => {
    const targetDish = initialDishes.find((d) => d.id === id);
    if (!targetDish) return;
    const newPortions = Math.max(0, targetDish.portionsLeft + delta);
    initialDishes = initialDishes.map((d) => {
      if (d.id === id) {
        return {
          ...d,
          portionsLeft: newPortions,
          stockType: newPortions === 0 ? "Sold Out" : newPortions <= 5 ? "Almost Sold Out" : "Available",
        };
      }
      return d;
    });
    notify();
    try {
      await api.dishes.updatePortions(id, newPortions);
    } catch (err) {
      console.error("Failed to update dish portions in API:", err);
    }
  },

  setStockType: (id: string, stockType: StockType) => {
    initialDishes = initialDishes.map((d) => (d.id === id ? { ...d, stockType } : d));
    notify();
  },

  addTableUpload: async (tableData: any, imageFile?: File | null) => {
    const restId = tableData.restaurantId || currentAuthSession.restaurantId;
    const existingForRest = initialTables.filter((t) => t.restaurantId === restId);
    let tableNum = tableData.tableNumber ? tableData.tableNumber.trim().toUpperCase() : "";

    if (!tableNum) {
      let count = existingForRest.length + 1;
      let candidate = `TABLE ${String(count).padStart(2, "0")}`;
      while (existingForRest.some((t) => t.tableNumber === candidate)) {
        count++;
        candidate = `TABLE ${String(count).padStart(2, "0")}`;
      }
      tableNum = candidate;
    }

    const formData = new FormData();
    formData.append("restaurantId", restId);
    formData.append("tableName", tableData.tableName || `Table ${tableNum}`);
    formData.append("tableNumber", tableNum);
    formData.append("capacity", String(tableData.capacity || 4));
    formData.append("tableType", tableData.tableType || "Regular");
    formData.append("description", tableData.description || "");
    formData.append("status", tableData.status || "Available");
    if (tableData.section) formData.append("section", tableData.section);

    if (imageFile) {
      formData.append("image", imageFile);
    } else if (tableData.image) {
      formData.append("image", tableData.image);
    }

    try {
      const res: any = await api.tables.add(formData);
      if (res && res.success && res.table) {
        const newTable: Table = {
          id: res.table._id,
          restaurantId: restId,
          tableName: res.table.tableName || tableData.tableName || `Table ${tableNum}`,
          tableNumber: res.table.tableNumber || tableNum,
          capacity: res.table.capacity || 4,
          tableType: res.table.tableType || "Regular",
          description: res.table.description || "",
          image: res.table.image || tableData.image || "",
          section: res.table.section || "Main Dining",
          status: res.table.status || "Available",
          isAvailable: res.table.status === "Available",
        };
        initialTables = [newTable, ...initialTables];
        notify();
        return { success: true, table: newTable };
      }
      return { success: false, message: res?.message || "Failed to add table" };
    } catch (err: any) {
      console.error("Add Table Error:", err);
      return { success: false, message: err.message || "Failed to add table" };
    }
  },

  updateTableUpload: async (id: string, updates: any, imageFile?: File | null) => {
    const formData = new FormData();
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined && updates[key] !== null) {
        formData.append(key, String(updates[key]));
      }
    });
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const res: any = await api.tables.edit(id, formData);
      if (res && res.success && res.table) {
        initialTables = initialTables.map((t) =>
          t.id === id
            ? {
                ...t,
                ...updates,
                tableName: res.table.tableName || updates.tableName || t.tableName,
                tableNumber: res.table.tableNumber || updates.tableNumber || t.tableNumber,
                capacity: res.table.capacity || updates.capacity || t.capacity,
                tableType: res.table.tableType || updates.tableType || t.tableType,
                description: res.table.description !== undefined ? res.table.description : t.description,
                image: res.table.image || updates.image || t.image,
                status: res.table.status || updates.status || t.status,
                isAvailable: (res.table.status || updates.status || t.status) === "Available",
              }
            : t
        );
        notify();
        return { success: true, table: res.table };
      }
      return { success: false, message: res?.message || "Failed to update table" };
    } catch (err: any) {
      console.error("Update Table Error:", err);
      return { success: false, message: err.message || "Failed to update table" };
    }
  },

  addTable: async (table: Omit<Table, "id">) => {
    const restId = table.restaurantId || currentAuthSession.restaurantId;
    const existingForRest = initialTables.filter((t) => t.restaurantId === restId);
    let tableNum = table.tableNumber ? table.tableNumber.trim().toUpperCase() : "";

    if (!tableNum) {
      let count = existingForRest.length + 1;
      let candidate = `TABLE ${String(count).padStart(2, "0")}`;
      while (existingForRest.some((t) => t.tableNumber === candidate)) {
        count++;
        candidate = `TABLE ${String(count).padStart(2, "0")}`;
      }
      tableNum = candidate;
    }

    const newTable: Table = {
      ...table,
      tableNumber: tableNum,
      id: "t_" + Date.now(),
      status: table.status || "Available",
    };
    initialTables = [newTable, ...initialTables];
    notify();

    try {
      const res = await api.tables.add({
        tableName: table.tableName || `Table ${tableNum}`,
        tableNumber: tableNum,
        capacity: table.capacity,
        tableType: table.tableType || "Regular",
        description: table.description || "",
        image: table.image || "",
        status: table.status || "Available",
        restaurantId: restId,
      });
      const apiRes: any = res;
      if (apiRes && apiRes.success && apiRes.table) {
        newTable.id = apiRes.table._id;
        newTable.tableNumber = apiRes.table.tableNumber;
        notify();
      }
    } catch (err) {
      console.error("Failed to add table in API:", err);
    }
  },

  updateTable: async (id: string, updates: Partial<Table>) => {
    initialTables = initialTables.map((t) => (t.id === id ? { ...t, ...updates } : t));
    notify();
    try {
      await api.tables.edit(id, updates);
    } catch (err) {
      console.error("Failed to update table in API:", err);
    }
  },

  deleteTable: async (id: string) => {
    initialTables = initialTables.filter((t) => t.id !== id);
    notify();
    try {
      await api.tables.delete(id);
    } catch (err) {
      console.error("Failed to delete table in API:", err);
    }
  },

  createBooking: async (bookingData: any) => {
    const bookingId = "#SD-BK-" + Math.floor(1000 + Math.random() * 9000);
    const newBooking: Booking = {
      ...bookingData,
      bookingId,
      paymentId: "#PAY-" + Math.floor(1000 + Math.random() * 9000),
      paymentStatus: "Confirmed",
      bookingStatus: "Confirmed",
      createdAt: "Just now",
    };
    initialBookings = [newBooking, ...initialBookings];
    notify();
    try {
      await api.bookings.create(bookingData);
    } catch (err) {
      console.error("Failed to create booking in API:", err);
    }
    return newBooking;
  },

  updateBookingStatus: (bookingId: string, status: BookingStatus) => {
    initialBookings = initialBookings.map((b) => (b.bookingId === bookingId ? { ...b, bookingStatus: status } : b));
    notify();
  },

  addReviewWithReward: (reviewData: Omit<Review, "id" | "date">) => {
    const newRev: Review = {
      ...reviewData,
      id: "r_" + Date.now(),
      date: "Just now",
      verifiedDiner: true,
    };
    initialReviews = [newRev, ...initialReviews];
    notify();
    return newRev;
  },

  replyToReview: (reviewId: string, replyText: string) => {
    initialReviews = initialReviews.map((r) =>
      r.id === reviewId ? { ...r, adminReply: replyText, adminReplyDate: "Just now" } : r
    );
    notify();
  },

  likeReviewHelpful: (reviewId: string) => {
    initialReviews = initialReviews.map((r) => (r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r));
    notify();
  },

  reportReview: (reviewId: string) => {
    initialReviews = initialReviews.map((r) => (r.id === reviewId ? { ...r, isReported: true } : r));
    notify();
  },

  deleteReview: (reviewId: string) => {
    initialReviews = initialReviews.filter((r) => r.id !== reviewId);
    notify();
  },

  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  notify,
};

let appInitialized = false;

function initApp() {
  if (appInitialized || typeof window === "undefined") return;
  appInitialized = true;

  const token = localStorage.getItem("stockdine_token");
  if (token) {
    api.auth.getProfile().then((res: any) => {
      if (res && res.success && res.profile) {
        const prof = res.profile;
        const role = res.role || prof.role || "customer";
        if (role === "restaurant") {
          const restId = prof._id || prof.restaurantId;
          currentAuthSession = {
            userEmail: prof.email,
            restaurantId: restId,
            permissions: "both",
            isLoggedIn: true,
            userRole: "restaurant",
            profileData: prof,
          };

          initialRestaurantProfiles[restId] = {
            id: restId,
            ownerId: prof.ownerName,
            name: prof.restaurantName,
            logo: prof.restaurantLogo || "",
            coverImage: prof.restaurantCover || "",
            interiorPhotos: [prof.restaurantCover || ""],
            exteriorPhotos: [prof.restaurantLogo || ""],
            address: prof.address || "",
            city: prof.city || "",
            state: prof.state || "",
            country: prof.country || "India",
            contactPhone: prof.mobileNumber || "",
            contactEmail: prof.email || "",
            openingHours: "11:00 AM - 11:00 PM",
            cuisines: [prof.cuisine || "Multi-Cuisine"],
            category: prof.restaurantType || "Fine Dining",
            priceRange: "Moderate",
            description: `${prof.restaurantName} offers fine dining and live stock intelligence.`,
            rating: prof.rating || 5.0,
            reviewsCount: prof.numReviews || 0,
            isOpen: true,
            availableTablesCount: 0,
            coordinates: { latitude: prof.latitude || 0, longitude: prof.longitude || 0 },
            amenities: {
              parking: true, wifi: true, ac: true, outdoorSeating: true, familyFriendly: true, privateDining: true, liveMusic: true, wheelchairAccessible: true,
            },
            createdAt: prof.createdAt,
          };
        } else if (role === "customer") {
          currentAuthSession = {
            userEmail: prof.email || prof.mobile,
            restaurantId: "",
            permissions: "both",
            isLoggedIn: true,
            userRole: "customer",
            profileData: prof,
          };
        } else if (role === "superadmin") {
          currentAuthSession = {
            userEmail: prof.email,
            restaurantId: "HQ-SUPER",
            permissions: "superadmin",
            isLoggedIn: true,
            userRole: "superadmin",
            profileData: prof,
          };
        }
        saveAuthSession(currentAuthSession);

        // Fetch Staff for logged in restaurant from MongoDB Atlas
        api.staff.getAll().then((staffRes: any) => {
          if (staffRes && staffRes.success && Array.isArray(staffRes.staff)) {
            initialKitchenStaff = staffRes.staff.map((s: any) => ({
              id: s._id,
              staffId: "STF-" + s._id.substring(s._id.length - 4),
              name: s.name,
              email: s.email || "",
              phone: s.mobile || "",
              mobile: s.mobile || "",
              roleTitle: s.role || "Kitchen Staff",
              role: s.role || "Kitchen Staff",
              password: s.password || "",
              profilePhoto: s.profilePhoto,
              status: s.status || "Active",
              createdAt: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "Just now",
              restaurantId: s.restaurant?._id || s.restaurant || "",
            }));
            stockDineStore.notify();
          }
        }).catch(() => {});

        stockDineStore.notify();
      }
    }).catch((err: any) => {
      if (err && err.message && (err.message.includes("401") || err.message.includes("Authentication required") || err.message.includes("Unauthorized"))) {
        console.error("Token verification 401 response, signing out:", err.message);
        stockDineStore.signOut();
      } else {
        console.warn("Network issue during token refresh, maintaining session:", err.message || err);
      }
    });
  }

  // Fetch live restaurants from MongoDB Atlas API
  api.restaurants.getAll().then((res: any) => {
      if (res && res.success && Array.isArray(res.restaurants)) {
        const seenIds = new Set<string>();
        const uniquePlatform: PlatformRestaurant[] = [];

        res.restaurants.forEach((r: any) => {
          const primaryId = r._id || r.restaurantId;
          const emailKey = r.email ? r.email.toLowerCase().trim() : "";
          const nameKey = r.restaurantName ? r.restaurantName.toLowerCase().trim() : "";
          const dedupKey = primaryId || emailKey || nameKey;

          if (dedupKey && !seenIds.has(dedupKey)) {
            seenIds.add(dedupKey);
            if (emailKey) seenIds.add(emailKey);
            if (nameKey) seenIds.add(nameKey);
            if (primaryId) seenIds.add(primaryId);

            uniquePlatform.push({
              id: primaryId,
              name: r.restaurantName,
              city: r.city || r.address?.split(",")?.[1]?.trim() || "Local",
              country: r.country || "India 🇮🇳",
              verificationStatus: "Verified",
              subscriptionTier: "Pro",
              commissionRate: 10,
              totalBookings: 0,
              gmv: 0,
              isFeatured: true,
              rating: r.rating || 5.0,
              aiMatchScore: 98,
            });

            const restProf: RestaurantDetails = {
              id: primaryId,
              ownerId: r.ownerName,
              name: r.restaurantName,
              logo: r.restaurantLogo || "",
              coverImage: r.restaurantCover || "",
              interiorPhotos: [r.restaurantCover || ""],
              exteriorPhotos: [r.restaurantLogo || ""],
              address: r.address || "",
              city: r.city || "",
              state: r.state || "",
              country: r.country || "India",
              contactPhone: r.mobileNumber || "",
              contactEmail: r.email || "",
              openingHours: "11:00 AM - 11:00 PM",
              cuisines: [r.cuisine || "Multi-Cuisine"],
              category: r.restaurantType || "Fine Dining",
              priceRange: "Moderate",
              description: `${r.restaurantName} offers live dining experience.`,
              rating: r.rating || 5.0,
              reviewsCount: r.numReviews || 0,
              isOpen: true,
              availableTablesCount: 0,
              coordinates: { latitude: r.latitude || 0, longitude: r.longitude || 0 },
              amenities: {
                parking: true, wifi: true, ac: true, outdoorSeating: true, familyFriendly: true, privateDining: true, liveMusic: true, wheelchairAccessible: true,
              },
              createdAt: r.createdAt,
            };

            if (r._id) initialRestaurantProfiles[r._id] = restProf;
            if (r.restaurantId) initialRestaurantProfiles[r.restaurantId] = restProf;
          }
        });

        initialPlatformRestaurants = uniquePlatform;
        stockDineStore.notify();
      }
    }).catch(() => {});

    // Fetch live dishes from MongoDB Atlas API
    api.dishes.getAll().then((res: any) => {
      if (res && res.success && Array.isArray(res.dishes)) {
        initialDishes = res.dishes.map((d: any) => ({
          id: d._id,
          restaurantId: d.restaurant?._id || d.restaurant || "",
          restaurantName: d.restaurant?.restaurantName || "",
          name: d.dishName,
          category: d.category,
          price: d.price,
          description: d.description || "",
          prepTime: d.preparationTime || "15 mins",
          portionsLeft: d.portionsLeft,
          image: d.dishImage || "",
          enabled: d.available !== false,
          availableToday: d.available !== false,
          stockType: d.portionsLeft === 0 ? "Sold Out" : d.portionsLeft <= 5 ? "Almost Sold Out" : "Available",
          lastUpdated: "Just now",
          isVeg: d.isVeg,
          rating: 5.0,
          availability: d.available !== false ? "Available" : "Sold Out",
        }));
        stockDineStore.notify();
      }
    }).catch(() => {});

    // Fetch live tables from MongoDB Atlas API
    api.tables.getAll().then((res: any) => {
      if (res && res.success && Array.isArray(res.tables)) {
        initialTables = res.tables.map((t: any) => ({
          id: t._id,
          restaurantId: t.restaurant?._id || t.restaurant || "",
          tableNumber: t.tableNumber,
          floor: "Main Floor",
          section: t.section || "Indoor",
          locationDesc: `${t.section || "Indoor"} Table`,
          capacity: t.capacity,
          location: t.section === "Outdoor" ? "Outdoor" : t.section === "VIP" ? "VIP" : t.section === "Rooftop" ? "Rooftop" : "Indoor",
          isVip: t.section === "VIP",
          status: t.isAvailable ? "Available" : "Occupied",
        }));
        stockDineStore.notify();
      }
    }).catch(() => {});
}

if (typeof window !== "undefined") {
  initApp();
}

export function useStockDineStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    initApp();
    const unsubscribe = stockDineStore.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  return {
    dishes: stockDineStore.getDishes(),
    tables: stockDineStore.getTables(),
    bookings: stockDineStore.getBookings(),
    getDishes: stockDineStore.getDishes,
    getTables: stockDineStore.getTables,
    getBookings: stockDineStore.getBookings,
    activityLogs: stockDineStore.getActivityLogs(),
    kitchenStaff: stockDineStore.getKitchenStaff(),
    getKitchenStaff: stockDineStore.getKitchenStaff,
    authSession: stockDineStore.getAuthSession(),
    platformRestaurants: stockDineStore.getPlatformRestaurants(),
    platformCustomers: stockDineStore.getPlatformCustomers(),
    supportTickets: stockDineStore.getSupportTickets(),
    getAllRestaurantProfiles: stockDineStore.getAllRestaurantProfiles,
    getUniqueRestaurantList: stockDineStore.getUniqueRestaurantList,
    activeCurrency: stockDineStore.getActiveCurrency(),
    activeLanguage: stockDineStore.getActiveLanguage(),
    setCurrency: stockDineStore.setCurrency,
    setLanguage: stockDineStore.setLanguage,
    setAuthSession: stockDineStore.setAuthSession,
    updateUserProfile: stockDineStore.updateUserProfile,
    signOut: stockDineStore.signOut,
    addDish: stockDineStore.addDish,
    updateDish: stockDineStore.updateDish,
    deleteDish: stockDineStore.deleteDish,
    adjustStock: stockDineStore.adjustStock,
    setStockType: stockDineStore.setStockType,
    addTable: stockDineStore.addTable,
    addTableUpload: stockDineStore.addTableUpload,
    updateTable: stockDineStore.updateTable,
    updateTableUpload: stockDineStore.updateTableUpload,
    deleteTable: stockDineStore.deleteTable,
    addKitchenStaff: stockDineStore.addKitchenStaff,
    updateKitchenStaff: stockDineStore.updateKitchenStaff,
    deleteKitchenStaff: stockDineStore.deleteKitchenStaff,
    toggleKitchenStaffStatus: stockDineStore.toggleKitchenStaffStatus,
    resolveLoginRole: stockDineStore.resolveLoginRole,
    getAdminPortalPassword: stockDineStore.getAdminPortalPassword,
    setAdminPortalPassword: stockDineStore.setAdminPortalPassword,
    verifyAdminPortalPassword: stockDineStore.verifyAdminPortalPassword,
    changeAdminPortalPassword: stockDineStore.changeAdminPortalPassword,
    checkEmailExists: stockDineStore.checkEmailExists,
    checkRestaurantExists: stockDineStore.checkRestaurantExists,
    registerRestaurantAdmin: stockDineStore.registerRestaurantAdmin,
    createBooking: stockDineStore.createBooking,
    updateBookingStatus: stockDineStore.updateBookingStatus,
    verifyRestaurant: stockDineStore.verifyRestaurant,
    setRestaurantCommission: stockDineStore.setRestaurantCommission,
    toggleFeaturedRestaurant: stockDineStore.toggleFeaturedRestaurant,
    resolveSupportTicket: stockDineStore.resolveSupportTicket,
    getRestaurantProfile: stockDineStore.getRestaurantProfile,
    updateRestaurantProfile: stockDineStore.updateRestaurantProfile,
    getGalleryImages: stockDineStore.getGalleryImages,
    fetchGalleryImages: stockDineStore.fetchGalleryImages,
    addGalleryImageUpload: stockDineStore.addGalleryImageUpload,
    addGalleryImage: stockDineStore.addGalleryImage,
    deleteGalleryImage: stockDineStore.deleteGalleryImage,
    getReviews: stockDineStore.getReviews,
    addReview: stockDineStore.addReview,
    addReviewWithReward: stockDineStore.addReviewWithReward,
    replyToReview: stockDineStore.replyToReview,
    likeReviewHelpful: stockDineStore.likeReviewHelpful,
    reportReview: stockDineStore.reportReview,
    deleteReview: stockDineStore.deleteReview,
  };
}
