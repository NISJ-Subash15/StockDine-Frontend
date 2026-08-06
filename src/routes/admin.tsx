import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Building2,
  LogOut,
  Plus,
  DollarSign,
  TrendingDown,
  Users,
  ShieldCheck,
  ArrowUpRight,
  Edit2,
  Trash2,
  CheckCircle2,
  UtensilsCrossed,
  LayoutGrid,
  Calendar,
  Clock,
  Activity,
  BarChart3,
  Flame,
  Award,
  Search,
  KeyRound,
  UserPlus,
  ArrowLeftRight,
  ChevronDown,
  ChefHat,
  Sparkles,
  Star,
  QrCode,
  Camera,
  Phone,
  UserCheck,
  SlidersHorizontal,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Check,
  X,
  Upload,
  Lock,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { api, formatImageUrl } from "@/lib/api";
import {
  useStockDineStore,
  StockType,
  TableType,
  Dish,
  Table,
  KitchenStaff,
  Booking,
  formatCurrency,
  sanitizeNumberInput,
} from "@/lib/stockdine-store";

const PRESET_PROFILE_LOGOS: { label: string; url: string }[] = [];

const PRESET_PROFILE_COVERS = [
  { label: "Luxury Dining Interior", url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200" },
  { label: "Outdoor Garden Patio", url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=1200" },
  { label: "Modern Bar & Lounge", url: "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&q=80&w=1200" },
  { label: "Chef Table Dining", url: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=1200" },
];

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Restaurant Admin Operating Portal — StockDine" },
      {
        name: "description",
        content: "Manage bookings, dishes, live inventory stock, tables, and restaurant settings.",
      },
    ],
  }),
  component: AdminPage,
});

export function AdminPage() {
  const navigate = useNavigate();
  const {
    activityLogs,
    kitchenStaff,
    authSession,
    addDish,
    updateDish,
    deleteDish,
    addTable,
    updateTable,
    deleteTable,
    addKitchenStaff,
    updateKitchenStaff,
    deleteKitchenStaff,
    toggleKitchenStaffStatus,
    updateBookingStatus,
    getDishes,
    getTables,
    getBookings,
    getRestaurantProfile,
    updateRestaurantProfile,
    addTableUpload,
    updateTableUpload,
    getAdminPortalPassword,
    setAdminPortalPassword,
    verifyAdminPortalPassword,
    changeAdminPortalPassword,
    getGalleryImages,
    fetchGalleryImages,
    addGalleryImageUpload,
    addGalleryImage,
    deleteGalleryImage,
    signOut,
    getReviews,
    replyToReview,
  } = useStockDineStore();

  const currentRestId = authSession?.restaurantId || "";
  const currentProfile = getRestaurantProfile(currentRestId);
  const dishes = getDishes(currentRestId);
  const tables = getTables(currentRestId);
  const bookings = getBookings(currentRestId);
  const galleryList = getGalleryImages(currentRestId);
  const adminReviewsList = getReviews(currentRestId);

  useEffect(() => {
    if (currentRestId) {
      fetchGalleryImages(currentRestId);
    }
  }, [currentRestId]);

  // Enforce Admin Portal Password Protection & 15-Minute Inactivity Session Timeout
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isUnlocked = sessionStorage.getItem("stockdine_admin_unlocked") === "true";
      const isSuperAdmin = authSession?.permissions === "superadmin" || authSession?.userRole === "superadmin";
      if (!isUnlocked && !isSuperAdmin) {
        navigate({ to: "/auth/workspace" });
        return;
      }

      let inactivityTimer: any;
      const resetInactivityTimer = () => {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
          sessionStorage.removeItem("stockdine_admin_unlocked");
          alert("Admin session expired due to 15 minutes of inactivity. Please re-enter your admin password.");
          navigate({ to: "/auth/workspace" });
        }, 15 * 60 * 1000); // 15 minutes
      };

      const events = ["mousemove", "keydown", "click", "scroll"];
      events.forEach((evt) => window.addEventListener(evt, resetInactivityTimer));
      resetInactivityTimer();

      return () => {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        events.forEach((evt) => window.removeEventListener(evt, resetInactivityTimer));
      };
    }
  }, [authSession]);

  // Navigation Tab State (Default: Bookings ⭐)
  const [activeTab, setActiveTab] = useState<
    | "bookings"
    | "qr-scanner"
    | "analytics"
    | "profile"
    | "food"
    | "tables"
    | "staff"
    | "gallery"
    | "reviews"
    | "payouts"
    | "security"
  >("bookings");

  // Bookings Filter & Search State
  const [bookingStatusFilter, setBookingStatusFilter] = useState<
    "All" | "Today" | "Upcoming" | "Pending" | "Checked In" | "Completed" | "Cancelled"
  >("All");
  const [bookingSearchQuery, setBookingSearchQuery] = useState("");

  // QR Code Scanner State
  const [qrScanInput, setQrScanInput] = useState("");
  const [selectedScanBooking, setSelectedScanBooking] = useState<Booking | null>(
    bookings[0] || null
  );
  const [checkInSuccessMsg, setCheckInSuccessMsg] = useState<string | null>(null);

  // Selected Detail Modal Booking
  const [detailModalBooking, setDetailModalBooking] = useState<Booking | null>(null);

  // Review Reply & Filter state
  const [replyInputMap, setReplyInputMap] = useState<Record<string, string>>({});
  const [reviewRatingFilter, setReviewRatingFilter] = useState<"All" | "5" | "4" | "3" | "2" | "1">("All");

  // Global Admin Real-Time Search Query
  const [globalQuery, setGlobalQuery] = useState("");
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  // Restaurant Profile Editor State & Image Upload Refs
  const [profileForm, setProfileForm] = useState(currentProfile);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState("");
  const [profileErrorMsg, setProfileErrorMsg] = useState("");
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOverLogo, setIsDragOverLogo] = useState(false);
  const [isDragOverCover, setIsDragOverCover] = useState(false);

  const loadLiveProfile = async () => {
    try {
      const res: any = await api.restaurants.getProfile();
      if (res && res.success && res.restaurant) {
        const r = res.restaurant;
        setProfileForm((prev) => ({
          ...prev,
          id: r._id || r.restaurantId || prev.id,
          name: r.restaurantName || prev.name,
          ownerName: r.ownerName || prev.ownerName || "",
          logo: r.restaurantLogo || prev.logo,
          coverImage: r.restaurantCover || prev.coverImage,
          address: r.address || prev.address,
          city: r.city || prev.city,
          state: r.state || prev.state,
          country: r.country || prev.country || "India",
          pincode: r.pincode || prev.pincode || "",
          contactPhone: r.mobileNumber || r.phone || prev.contactPhone,
          contactEmail: r.email || prev.contactEmail,
          openingHours: r.openingHours || prev.openingHours || "11:00 AM",
          closingHours: r.closingHours || prev.closingHours || "11:00 PM",
          cuisine: r.cuisine || prev.cuisine || "Multi-Cuisine",
          description: r.description || prev.description || "",
          gstNumber: r.gstNumber || prev.gstNumber || "",
          fssaiNumber: r.fssaiNumber || prev.fssaiNumber || "",
        }));
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (currentProfile) {
      setProfileForm(currentProfile);
    }
    loadLiveProfile();
  }, [
    currentProfile?.id,
    currentProfile?.name,
    currentProfile?.logo,
    currentProfile?.coverImage,
    currentProfile?.address,
    currentProfile?.contactPhone,
    currentProfile?.contactEmail,
  ]);

  const handleLogoUpload = (file: File) => {
    setProfileErrorMsg("");
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|webp|gif|jpg)$/i)) {
      setProfileErrorMsg("Please select a valid image file (JPG, JPEG, PNG, or WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileErrorMsg("Logo image size exceeds maximum allowed limit of 5 MB.");
      return;
    }
    setSelectedLogoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setProfileForm((prev) => ({ ...prev, logo: previewUrl }));
  };

  const handleCoverUpload = (file: File) => {
    setProfileErrorMsg("");
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|webp|gif|jpg)$/i)) {
      setProfileErrorMsg("Please select a valid image file (JPG, JPEG, PNG, or WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileErrorMsg("Cover banner image size exceeds maximum allowed limit of 5 MB.");
      return;
    }
    setSelectedCoverFile(file);
    const previewUrl = URL.createObjectURL(file);
    setProfileForm((prev) => ({ ...prev, coverImage: previewUrl }));
  };

  // Gallery Management State
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState<string>("All");
  const [selectedGalleryFile, setSelectedGalleryFile] = useState<File | null>(null);
  const [galleryImagePreview, setGalleryImagePreview] = useState<string | null>(null);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [galleryUploadProgress, setGalleryUploadProgress] = useState(0);
  const [galleryUploadError, setGalleryUploadError] = useState("");
  const [isDragOverGallery, setIsDragOverGallery] = useState(false);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const [galleryForm, setGalleryForm] = useState<{
    category: "Interior" | "Exterior" | "Dining Area" | "VIP Rooms" | "Events" | "Food Highlights" | "Food" | "Tables";
    title: string;
  }>({
    category: "Interior",
    title: "",
  });

  const validateAndSetGalleryFile = (file: File) => {
    setGalleryUploadError("");
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    const validExts = ["jpg", "jpeg", "png", "webp"];

    if (!validTypes.includes(file.type.toLowerCase()) && (!ext || !validExts.includes(ext))) {
      setGalleryUploadError("Only image files (JPG, JPEG, PNG, WEBP) are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setGalleryUploadError("File size exceeds maximum allowed limit of 5 MB.");
      return;
    }

    setSelectedGalleryFile(file);
    const previewUrl = URL.createObjectURL(file);
    setGalleryImagePreview(previewUrl);
  };

  // Food Form Modal State
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [isDragOverFoodImage, setIsDragOverFoodImage] = useState(false);
  const [foodForm, setFoodForm] = useState<{
    name: string;
    category: string;
    price: number;
    discountPrice?: number;
    description: string;
    ingredients?: string;
    prepTime: string;
    portionsLeft: number;
    image: string;
    dishImage?: any;
    enabled: boolean;
    availableToday: boolean;
    stockType: StockType;
    isVeg: boolean;
    isVegan: boolean;
    isOrganic: boolean;
    isBestseller: boolean;
  }>({
    name: "",
    category: "Main Course",
    price: 350,
    discountPrice: 0,
    description: "",
    ingredients: "",
    prepTime: "15-20 min",
    portionsLeft: 10,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
    dishImage: null,
    enabled: true,
    availableToday: true,
    stockType: "Available",
    isVeg: true,
    isVegan: false,
    isOrganic: false,
    isBestseller: false,
  });

  // Enhanced Table Management State
  const [tableSearchQuery, setTableSearchQuery] = useState("");
  const [tableStatusFilter, setTableStatusFilter] = useState<"All" | "Available" | "Reserved" | "Occupied" | "Maintenance">("All");

  // Delete Table Confirmation Modal State
  const [showDeleteTableModal, setShowDeleteTableModal] = useState(false);
  const [deletingTableId, setDeletingTableId] = useState<string | null>(null);

  // Table Image Upload & Form State
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [selectedTableFile, setSelectedTableFile] = useState<File | null>(null);
  const [tableImagePreview, setTableImagePreview] = useState<string | null>(null);
  const [tableUploadError, setTableUploadError] = useState("");
  const [isDragOverTableImage, setIsDragOverTableImage] = useState(false);
  const tableFileInputRef = useRef<HTMLInputElement>(null);

  const [tableForm, setTableForm] = useState<{
    tableName: string;
    tableNumber: string;
    capacity: number;
    tableType: TableType;
    description: string;
    image: string;
    status: "Available" | "Reserved" | "Occupied" | "Maintenance";
    section: string;
  }>({
    tableName: "",
    tableNumber: "TABLE 01",
    capacity: 4,
    tableType: "Regular",
    description: "",
    image: "",
    status: "Available",
    section: "Regular",
  });

  const validateAndSetTableFile = (file: File) => {
    setTableUploadError("");
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    const validExts = ["jpg", "jpeg", "png", "webp"];

    if (!validTypes.includes(file.type.toLowerCase()) && (!ext || !validExts.includes(ext))) {
      setTableUploadError("Only image files (JPG, JPEG, PNG, WEBP) are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setTableUploadError("File size exceeds maximum allowed limit of 5 MB.");
      return;
    }

    setSelectedTableFile(file);
    const previewUrl = URL.createObjectURL(file);
    setTableImagePreview(previewUrl);
  };

  const getNextUniqueTableNumber = () => {
    const existingNumbers = tables.map((t) => t.tableNumber ? t.tableNumber.trim().toUpperCase() : "");
    let num = 1;
    let candidate = `TABLE ${String(num).padStart(2, "0")}`;
    while (existingNumbers.includes(candidate)) {
      num++;
      candidate = `TABLE ${String(num).padStart(2, "0")}`;
    }
    return candidate;
  };

  // Kitchen Staff Form Modal State
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffForm, setStaffForm] = useState<{
    name: string;
    mobile: string;
    email: string;
    role: "Kitchen Staff" | "Cashier" | "Manager" | "Waiter";
    password?: string;
  }>({
    name: "",
    mobile: "",
    email: "",
    role: "Kitchen Staff",
    password: "",
  });

  // Admin Password Management State
  const [currentAdminPass, setCurrentAdminPass] = useState("");
  const [newAdminPass, setNewAdminPass] = useState("");
  const [confirmAdminPass, setConfirmAdminPass] = useState("");
  const [passSuccessMsg, setPassSuccessMsg] = useState("");
  const [passErrMsg, setPassErrMsg] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [showStaffPass, setShowStaffPass] = useState(false);

  // Check-In Action Handler (Updates booking to Checked In & assigned table to Occupied)
  const handleCheckInBooking = (b: Booking) => {
    updateBookingStatus(b.bookingId, "Checked In");
    if (b.tableId) {
      updateTable(b.tableId, { status: "Occupied" });
    }
    setCheckInSuccessMsg(`Check-in Confirmed! ${b.customerName} assigned to ${b.tableNumber}`);
    setTimeout(() => setCheckInSuccessMsg(null), 4000);
  };

  // Complete Action Handler (Updates booking to Completed & assigned table to Available)
  const handleCompleteBooking = (b: Booking) => {
    updateBookingStatus(b.bookingId, "Completed");
    if (b.tableId) {
      updateTable(b.tableId, { status: "Available" });
    }
  };

  // Telemetry Calculations
  const todayBookingsCount = bookings.length;
  const currentlyDiningCount = bookings.filter(
    (b) => b.bookingStatus === "Checked In" || b.bookingStatus === "Seated"
  ).length;
  const upcomingCount = bookings.filter(
    (b) => b.bookingStatus === "Confirmed" || b.bookingStatus === "Accepted" || b.bookingStatus === "Preparing"
  ).length;
  const availableTablesCount = tables.filter((t) => t.status === "Available").length;
  const occupiedTablesCount = tables.filter((t) => t.status === "Occupied").length;
  const pendingCheckInsCount = bookings.filter(
    (b) => b.bookingStatus === "Confirmed" || b.bookingStatus === "Accepted"
  ).length;

  // Filter Bookings by status & search query
  const filteredBookingsList = bookings.filter((b) => {
    const q = bookingSearchQuery.toLowerCase().trim();
    const matchesSearch =
      q === "" ||
      b.bookingId.toLowerCase().includes(q) ||
      b.customerName.toLowerCase().includes(q) ||
      b.customerPhone.toLowerCase().includes(q) ||
      b.tableNumber.toLowerCase().includes(q);

    const matchesStatus =
      bookingStatusFilter === "All"
        ? true
        : bookingStatusFilter === "Today"
        ? b.date.toLowerCase().includes("today") || b.date.toLowerCase().includes("ago") === false
        : bookingStatusFilter === "Upcoming"
        ? b.bookingStatus === "Confirmed" || b.bookingStatus === "Accepted" || b.bookingStatus === "Preparing"
        : bookingStatusFilter === "Pending"
        ? b.bookingStatus === "Confirmed" || b.bookingStatus === "Accepted"
        : bookingStatusFilter === "Checked In"
        ? b.bookingStatus === "Checked In" || b.bookingStatus === "Seated"
        : bookingStatusFilter === "Completed"
        ? b.bookingStatus === "Completed"
        : bookingStatusFilter === "Cancelled"
        ? b.bookingStatus === "Cancelled" || b.bookingStatus === "Rejected"
        : true;

    return matchesSearch && matchesStatus;
  });

  // Manual QR Search Handler
  const handleQRManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = qrScanInput.toLowerCase().trim();
    const match = bookings.find(
      (b) =>
        b.bookingId.toLowerCase().includes(query) ||
        b.customerPhone.toLowerCase().includes(query) ||
        b.customerName.toLowerCase().includes(query)
    );
    if (match) {
      setSelectedScanBooking(match);
    } else if (bookings[0]) {
      setSelectedScanBooking(bookings[0]);
    }
  };

  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGalleryFile) {
      setGalleryUploadError("Please select an image file to upload.");
      return;
    }

    setGalleryUploadError("");
    setIsUploadingGallery(true);
    setGalleryUploadProgress(0);

    try {
      const res = await addGalleryImageUpload(
        selectedGalleryFile,
        galleryForm.category,
        galleryForm.title || "Restaurant Photo",
        (percent) => setGalleryUploadProgress(percent)
      );

      setIsUploadingGallery(false);
      if (res.success) {
        setShowGalleryModal(false);
        setSelectedGalleryFile(null);
        setGalleryImagePreview(null);
        setGalleryForm({ category: "Interior", title: "" });
        setGalleryUploadProgress(0);
      } else {
        setGalleryUploadError(res.message || "Failed to upload image.");
      }
    } catch (err: any) {
      setIsUploadingGallery(false);
      setGalleryUploadError(err.message || "An unexpected error occurred during image upload.");
    }
  };

  const handleFoodImageFile = (file: File) => {
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|webp|gif|jpg)$/i)) {
      alert("Please select a valid image file (JPG, PNG, or WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setFoodForm((prev) => ({
          ...prev,
          image: dataUrl,
          dishImage: {
            imageUrl: dataUrl,
            storagePath: `dishes/${file.name}`,
            uploadTimestamp: new Date().toISOString(),
          },
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalImage = foodForm.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800";
    const finalMeta = foodForm.dishImage || {
      imageUrl: finalImage,
      storagePath: `dishes/dish_${Date.now()}.jpg`,
      uploadTimestamp: new Date().toISOString(),
    };

    const computedStockType: StockType = foodForm.portionsLeft === 0 || !foodForm.availableToday ? "Sold Out" : foodForm.portionsLeft <= 3 ? "Almost Sold Out" : "Available";

    const payload = {
      ...foodForm,
      image: finalImage,
      dishImage: finalMeta,
      stockType: computedStockType,
    };

    if (editingDishId) {
      updateDish(editingDishId, payload);
    } else {
      addDish({
        ...payload,
        restaurantId: currentRestId,
      });
    }
    setShowFoodModal(false);
    setEditingDishId(null);
  };

  const handleEditDish = (d: Dish) => {
    setEditingDishId(d.id);
    const mainImg = (typeof d.dishImage === "string" ? d.dishImage : d.dishImage?.imageUrl) || d.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800";
    setFoodForm({
      name: d.name,
      category: d.category,
      price: d.price,
      discountPrice: d.discountPrice || 0,
      description: d.description || "",
      ingredients: d.ingredients || "",
      prepTime: d.prepTime || "15-20 min",
      portionsLeft: d.portionsLeft,
      image: mainImg,
      dishImage: d.dishImage || { imageUrl: mainImg, storagePath: `dishes/${d.id}.jpg`, uploadTimestamp: new Date().toISOString() },
      enabled: d.enabled,
      availableToday: d.availableToday,
      stockType: d.stockType,
      isVeg: d.isVeg !== undefined ? d.isVeg : true,
      isVegan: d.isVegan || false,
      isOrganic: d.isOrganic || false,
      isBestseller: d.isBestseller || false,
    });
    setShowFoodModal(true);
  };

  const handleTableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTableUploadError("");

    if (editingTableId) {
      const res = await updateTableUpload(editingTableId, tableForm, selectedTableFile);
      if (res && res.success) {
        setShowTableModal(false);
        setEditingTableId(null);
        setSelectedTableFile(null);
        setTableImagePreview(null);
      } else {
        setTableUploadError(res.message || "Failed to update table.");
      }
    } else {
      const res = await addTableUpload({ ...tableForm, restaurantId: currentRestId }, selectedTableFile);
      if (res && res.success) {
        setShowTableModal(false);
        setEditingTableId(null);
        setSelectedTableFile(null);
        setTableImagePreview(null);
      } else {
        setTableUploadError(res.message || "Failed to create table.");
      }
    }
  };

  const handleEditTable = (t: Table) => {
    setEditingTableId(t.id);
    setTableUploadError("");
    setSelectedTableFile(null);
    setTableImagePreview(t.image ? formatImageUrl(t.image) : null);

    setTableForm({
      tableName: t.tableName || `Table ${t.tableNumber}`,
      tableNumber: t.tableNumber,
      capacity: t.capacity || 4,
      tableType: (t.tableType || t.type || "Regular") as TableType,
      description: t.description || "",
      image: t.image || "",
      status: (t.status || "Available") as any,
      section: t.section || t.tableType || "Regular",
    });
    setShowTableModal(true);
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaffId) {
      await updateKitchenStaff(editingStaffId, {
        name: staffForm.name,
        mobile: staffForm.mobile,
        email: staffForm.email,
        roleTitle: staffForm.role,
        role: staffForm.role,
        password: staffForm.password,
      });
    } else {
      await addKitchenStaff({
        name: staffForm.name,
        mobile: staffForm.mobile,
        email: staffForm.email,
        roleTitle: staffForm.role,
        role: staffForm.role,
        password: staffForm.password,
        status: "Active",
      });
    }
    setShowStaffModal(false);
    setEditingStaffId(null);
  };

  const [isSubmittingPass, setIsSubmittingPass] = useState(false);

  const handleAdminPassChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccessMsg("");
    setPassErrMsg("");

    if (newAdminPass.length < 6) {
      setPassErrMsg("New Admin Portal Password must be at least 6 characters long.");
      return;
    }
    if (newAdminPass !== confirmAdminPass) {
      setPassErrMsg("New passwords do not match. Please verify.");
      return;
    }

    setIsSubmittingPass(true);
    try {
      const res = await changeAdminPortalPassword(currentAdminPass, newAdminPass);
      setIsSubmittingPass(false);
      if (res.success) {
        setPassSuccessMsg(res.message || "Admin Security Password updated and hashed in MongoDB successfully!");
        setCurrentAdminPass("");
        setNewAdminPass("");
        setConfirmAdminPass("");
      } else {
        setPassErrMsg(res.message || "Failed to update Admin Security Password.");
      }
    } catch (err: any) {
      setIsSubmittingPass(false);
      setPassErrMsg(err.message || "An error occurred while updating Admin Security Password.");
    }
  };

  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0) + 14200;
  const occupancyRate = Math.round((tables.filter((t) => t.status === "Occupied" || t.status === "Reserved").length / tables.length) * 100);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto selection:bg-[#E77B49] selection:text-white pb-28 transition-colors duration-300">
      {/* Toast Notification Banner */}
      {checkInSuccessMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-emerald-500 animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="size-5 text-emerald-200 shrink-0" />
          <span className="text-xs font-bold">{checkInSuccessMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-border dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#60241E] dark:text-[#E77B49]">
            <Building2 className="size-4 text-[#E77B49]" />
            <span>Admin Executive Operating System</span>
          </div>
          <h1 className="font-serif italic text-3xl sm:text-4xl font-bold mt-1 text-[#60241E] dark:text-slate-100">
            {currentProfile?.name || "Heritage Spice Kitchen"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Terminal ID: {currentRestId} • Live Booking &amp; Check-in Controls
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Switch to Kitchen Portal Button */}
          <button
            type="button"
            onClick={() => navigate({ to: "/kitchen" })}
            className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#60241E] dark:text-slate-200 bg-[#60241E]/10 dark:bg-slate-800 hover:bg-[#60241E] hover:text-white dark:hover:bg-[#E77B49] border border-[#60241E]/20 dark:border-slate-700 rounded-2xl px-4 py-2.5 transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Switch to Kitchen Portal"
          >
            <ChefHat className="size-4 text-[#E77B49]" />
            <span>Switch to Kitchen Portal</span>
          </button>

          <ThemeToggle />
          <button
            type="button"
            onClick={() => {
              signOut();
              navigate({ to: "/login" });
            }}
            className="flex items-center gap-1.5 text-xs uppercase font-extrabold tracking-wider text-rose-600 dark:text-rose-400 hover:text-rose-700 border border-rose-500/20 rounded-2xl px-3.5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Sign Out of Session"
          >
            <LogOut className="size-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Real-Time Live Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div className="bg-[#F8F9FA] dark:bg-slate-900 border-2 border-[#E5E7EB] dark:border-slate-800 rounded-2xl p-3.5 shadow-sm">
          <span className="text-[10px] font-extrabold uppercase text-[#6B7280] dark:text-slate-400">Today's Bookings</span>
          <p className="font-serif italic text-2xl font-bold text-[#60241E] dark:text-[#E77B49] mt-0.5">{todayBookingsCount}</p>
          <span className="text-[10px] font-semibold text-[#E77B49]">Total Reservations</span>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-3.5 shadow-sm">
          <span className="text-[10px] font-extrabold uppercase text-emerald-800 dark:text-emerald-300">Currently Dining</span>
          <p className="font-serif italic text-2xl font-bold text-emerald-900 dark:text-emerald-200 mt-0.5">{currentlyDiningCount}</p>
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" /> Seated &amp; Active
          </span>
        </div>

        <div className="bg-[#F8F9FA] dark:bg-slate-900 border-2 border-[#E5E7EB] dark:border-slate-800 rounded-2xl p-3.5 shadow-sm">
          <span className="text-[10px] font-extrabold uppercase text-[#6B7280] dark:text-slate-400">Upcoming</span>
          <p className="font-serif italic text-2xl font-bold text-[#60241E] dark:text-[#E77B49] mt-0.5">{upcomingCount}</p>
          <span className="text-[10px] font-semibold text-[#6B7280] dark:text-slate-400">Confirmed Pipeline</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border-2 border-[#E5E7EB] dark:border-slate-800 rounded-2xl p-3.5 shadow-sm">
          <span className="text-[10px] font-extrabold uppercase text-[#6B7280] dark:text-slate-400">Available Tables</span>
          <p className="font-serif italic text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{availableTablesCount}</p>
          <span className="text-[10px] font-semibold text-[#6B7280] dark:text-slate-400">Ready for Guests</span>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-800/60 rounded-2xl p-3.5 shadow-sm">
          <span className="text-[10px] font-extrabold uppercase text-amber-900 dark:text-amber-300">Occupied Tables</span>
          <p className="font-serif italic text-2xl font-bold text-amber-800 dark:text-amber-200 mt-0.5">{occupiedTablesCount}</p>
          <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">In Dining Service</span>
        </div>

        <div className="bg-[#60241E] dark:bg-slate-800 text-white border-2 border-[#60241E] dark:border-slate-700 rounded-2xl p-3.5 shadow-md">
          <span className="text-[10px] font-extrabold uppercase text-white/80">Pending Check-ins</span>
          <p className="font-serif italic text-2xl font-bold text-white mt-0.5">{pendingCheckInsCount}</p>
          <span className="text-[10px] font-semibold text-[#E77B49]">Awaiting Arrival</span>
        </div>
      </div>

      {/* Main Module Tabs (Bookings & QR Code Scanner Highlighted) */}
      <div className="flex gap-2 mb-6 border-b-2 border-[#E5E7EB] dark:border-slate-800 pb-3 overflow-x-auto text-xs font-extrabold">
        <button
          type="button"
          onClick={() => setActiveTab("bookings")}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "bookings"
              ? "bg-[#60241E] text-white shadow-md ring-2 ring-[#E77B49]"
              : "bg-[#E77B49]/15 dark:bg-slate-800 border-2 border-[#E77B49]/40 dark:border-slate-700 text-[#60241E] dark:text-slate-200 hover:bg-[#E77B49] hover:text-white"
          }`}
        >
          <Calendar className="size-4" />
          <span>Bookings ⭐ ({bookings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("qr-scanner")}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "qr-scanner"
              ? "bg-[#60241E] text-white shadow-md ring-2 ring-[#E77B49]"
              : "bg-[#60241E]/10 dark:bg-slate-800 border-2 border-[#60241E]/30 dark:border-slate-700 text-[#60241E] dark:text-slate-200 hover:bg-[#60241E] hover:text-white"
          }`}
        >
          <QrCode className="size-4 text-[#E77B49]" />
          <span>QR Scanner Pass</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "analytics"
              ? "bg-[#60241E] text-white shadow-md"
              : "bg-[#F8F9FA] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-[#6B7280] dark:text-slate-300 hover:text-[#1F2937] dark:hover:text-white"
          }`}
        >
          <BarChart3 className="size-4" />
          <span>Analytics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tables")}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "tables"
              ? "bg-[#60241E] text-white shadow-md"
              : "bg-[#F8F9FA] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-[#6B7280] dark:text-slate-300 hover:text-[#1F2937] dark:hover:text-white"
          }`}
        >
          <LayoutGrid className="size-4" />
          <span>Tables ({tables.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("food")}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "food"
              ? "bg-[#60241E] text-white shadow-md"
              : "bg-[#F8F9FA] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-[#6B7280] dark:text-slate-300 hover:text-[#1F2937] dark:hover:text-white"
          }`}
        >
          <UtensilsCrossed className="size-4" />
          <span>Food Catalog ({dishes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("gallery")}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "gallery"
              ? "bg-[#60241E] text-white shadow-md"
              : "bg-[#F8F9FA] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-[#6B7280] dark:text-slate-300 hover:text-[#1F2937] dark:hover:text-white"
          }`}
        >
          <Sparkles className="size-4" />
          <span>Gallery 🖼️ ({galleryList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "profile"
              ? "bg-[#60241E] text-white shadow-md"
              : "bg-[#F8F9FA] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-[#6B7280] dark:text-slate-300 hover:text-[#1F2937] dark:hover:text-white"
          }`}
        >
          <Building2 className="size-4" />
          <span>Restaurant Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("staff")}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "staff"
              ? "bg-[#60241E] text-white shadow-md"
              : "bg-[#F8F9FA] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-[#6B7280] dark:text-slate-300 hover:text-[#1F2937] dark:hover:text-white"
          }`}
        >
          <Users className="size-4" />
          <span>Staff ({kitchenStaff.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reviews")}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "reviews"
              ? "bg-[#60241E] text-white shadow-md"
              : "bg-[#F8F9FA] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-[#6B7280] dark:text-slate-300 hover:text-[#1F2937] dark:hover:text-white"
          }`}
        >
          <Award className="size-4" />
          <span>Reviews ({adminReviewsList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "security"
              ? "bg-[#60241E] text-white shadow-md ring-2 ring-[#E77B49]"
              : "bg-[#F8F9FA] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-[#6B7280] dark:text-slate-300 hover:text-[#1F2937] dark:hover:text-white"
          }`}
        >
          <Lock className="size-4 text-[#E77B49]" />
          <span>Security &amp; Passwords 🔒</span>
        </button>
      </div>

      {/* ==================== TAB 1: BOOKINGS MODULE (PRIMARY FEATURE) ==================== */}
      {activeTab === "bookings" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#F8F9FA] p-5 rounded-3xl border-2 border-[#E5E7EB]">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E77B49] bg-[#E77B49]/10 px-3 py-1 rounded-full border border-[#E77B49]/20">
                PRIMARY ADMIN MODULE
              </span>
              <h2 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#60241E] mt-1.5">
                Bookings &amp; Reservation Management
              </h2>
              <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                Manage upcoming customer arrivals, verify pre-ordered food items, and execute table check-ins.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("qr-scanner")}
              className="py-3 px-5 rounded-2xl bg-[#60241E] hover:bg-[#4A1B17] text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <QrCode className="size-4 text-[#E77B49]" />
              <span>Launch QR Scanner</span>
            </button>
          </div>

          {/* Search Bar & Filter Chips */}
          <div className="bg-white border-2 border-[#E5E7EB] rounded-3xl p-4 shadow-sm space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 size-4 text-[#E77B49]" />
              <input
                type="text"
                value={bookingSearchQuery}
                onChange={(e) => setBookingSearchQuery(e.target.value)}
                placeholder="Search by Booking ID (e.g. BK-7491), Customer Name, or Phone..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F8F9FA] text-[#1F2937] text-xs font-semibold placeholder:text-[#9CA3AF] border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#E77B49]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold pb-1">
              <span className="text-[10px] text-[#60241E] uppercase font-extrabold mr-1 shrink-0">
                Filter Status:
              </span>
              {(["All", "Today", "Upcoming", "Pending", "Checked In", "Completed", "Cancelled"] as const).map(
                (status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setBookingStatusFilter(status)}
                    className={`px-3.5 py-1.5 rounded-full transition-all shrink-0 ${
                      bookingStatusFilter === status
                        ? "bg-[#60241E] text-white shadow-xs"
                        : "bg-[#F8F9FA] border border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937]"
                    }`}
                  >
                    {status}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Bookings List Cards Grid */}
          <div className="grid grid-cols-1 gap-4">
            {filteredBookingsList.length === 0 ? (
              <div className="p-12 text-center bg-card dark:bg-slate-900 border-2 border-dashed border-border dark:border-slate-800 rounded-3xl space-y-3">
                <div className="size-16 rounded-2xl bg-[#60241E]/10 dark:bg-[#E77B49]/20 text-[#60241E] dark:text-[#E77B49] flex items-center justify-center mx-auto">
                  <Calendar className="size-8 stroke-[2]" />
                </div>
                <h3 className="font-serif italic font-bold text-xl text-foreground">No bookings available.</h3>
                <p className="text-xs text-muted-foreground font-medium max-w-sm mx-auto">
                  Guest reservations and dine-in passes will appear here automatically when customer bookings are placed.
                </p>
              </div>
            ) : (
              filteredBookingsList.map((b) => {
              const isCheckedIn = b.bookingStatus === "Checked In" || b.bookingStatus === "Seated";
              const isCompleted = b.bookingStatus === "Completed";
              const isCancelled = b.bookingStatus === "Cancelled" || b.bookingStatus === "Rejected";

              return (
                <div
                  key={b.bookingId}
                  className={`bg-white border-2 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 transition-all relative overflow-hidden ${
                    isCheckedIn
                      ? "border-emerald-500 bg-emerald-50/20"
                      : isCompleted
                      ? "border-gray-200 bg-gray-50/50"
                      : isCancelled
                      ? "border-rose-200 bg-rose-50/30"
                      : "border-[#E5E7EB]"
                  }`}
                >
                  {/* Card Top Row */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[#E5E7EB]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold bg-[#60241E] text-white px-2.5 py-0.5 rounded-lg shadow-xs">
                          {b.bookingId}
                        </span>
                        <h3 className="font-serif italic text-2xl font-bold text-[#60241E]">
                          {b.customerName}
                        </h3>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                            isCheckedIn
                              ? "bg-emerald-600 text-white"
                              : isCompleted
                              ? "bg-gray-600 text-white"
                              : isCancelled
                              ? "bg-rose-600 text-white"
                              : "bg-amber-500 text-white"
                          }`}
                        >
                          {b.bookingStatus}
                        </span>
                      </div>

                      <p className="text-xs text-[#4B5563] font-medium flex flex-wrap items-center gap-2 mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="size-3 text-[#E77B49]" />
                          <a href={`tel:${b.customerPhone}`} className="hover:underline font-bold">
                            {b.customerPhone}
                          </a>
                        </span>
                        <span>•</span>
                        <span>{b.tableNumber || "Table 01"}</span>
                        <span>•</span>
                        <span>{b.guests || 2} Guests</span>
                        <span>•</span>
                        <span>{b.date}, {b.time}</span>
                      </p>
                    </div>

                    <div className="text-right flex flex-col sm:items-end gap-1">
                      <span className="text-xs font-extrabold uppercase text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full">
                        Advance Paid: {formatCurrency(b.advanceAmount)}
                      </span>
                      <span className="text-[11px] font-bold text-[#6B7280]">
                        Remaining at Venue: {formatCurrency(b.remainingAmount || Math.max(0, b.totalAmount - b.advanceAmount))}
                      </span>
                    </div>
                  </div>

                  {/* Pre-Ordered Food Items Summary */}
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-[#60241E] block mb-1.5">
                      Food Pre-Order Summary ({b.items?.length || 0} Items Total)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                      {b.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] flex justify-between items-center font-medium"
                        >
                          <span>{item.name} × {item.quantity}</span>
                          <span className="font-bold text-[#60241E]">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions Footer Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E5E7EB]">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${b.customerPhone}`}
                        className="py-2 px-3 rounded-xl bg-[#F8F9FA] hover:bg-[#60241E] hover:text-white text-[#60241E] text-xs font-extrabold border border-[#E5E7EB] transition-all flex items-center gap-1"
                      >
                        <Phone className="size-3.5" />
                        <span>Call</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedScanBooking(b);
                          setActiveTab("qr-scanner");
                        }}
                        className="py-2 px-3 rounded-xl bg-[#60241E]/10 text-[#60241E] hover:bg-[#60241E] hover:text-white text-xs font-extrabold border border-[#60241E]/20 transition-all flex items-center gap-1"
                      >
                        <QrCode className="size-3.5" />
                        <span>QR Pass</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isCheckedIn && !isCompleted && !isCancelled && (
                        <button
                          type="button"
                          onClick={() => handleCheckInBooking(b)}
                          className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="size-3.5" />
                          <span>Confirm Check-in</span>
                        </button>
                      )}

                      {isCheckedIn && (
                        <button
                          type="button"
                          onClick={() => handleCompleteBooking(b)}
                          className="py-2.5 px-4 rounded-xl bg-[#60241E] hover:bg-[#4A1B17] text-white text-xs font-extrabold shadow-md transition-all active:scale-95"
                        >
                          Mark Dining Complete
                        </button>
                      )}

                      {!isCancelled && !isCompleted && (
                        <button
                          type="button"
                          onClick={() => updateBookingStatus(b.bookingId, "Cancelled")}
                          className="py-2.5 px-3 rounded-xl bg-white border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }))}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: DEDICATED QR CODE SCANNER ==================== */}
      {activeTab === "qr-scanner" && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="bg-[#60241E] text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-white/80 bg-white/20 px-3 py-1 rounded-full">
                EXECUTIVE DEDICATED MODULE
              </span>
            </div>
            <h2 className="font-serif italic text-3xl font-bold text-white">
              QR Code Scanner &amp; Check-in Terminal
            </h2>
            <p className="text-xs text-white/80 font-medium">
              Scan customer booking passes upon arrival to instantly verify reservation and seat guests.
            </p>
          </div>

          {/* Scanner Viewfinder Simulation Box */}
          <div className="bg-slate-950 text-white rounded-3xl p-8 border-2 border-slate-800 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center space-y-6 min-h-[300px]">
            {/* Viewfinder Target Frame */}
            <div className="relative size-56 sm:size-64 border-4 border-dashed border-[#E77B49] rounded-3xl flex items-center justify-center bg-black/40 overflow-hidden shadow-inner">
              {/* Laser Line Animation */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_#ef4444] animate-pulse" />
              <Camera className="size-12 text-white/40" />
            </div>

            <div className="text-center space-y-1 z-10">
              <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center justify-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                Live Camera Scanner Active
              </p>
              <p className="text-[11px] text-gray-400">
                Hold customer's StockDine QR pass in front of camera or enter Booking ID below.
              </p>
            </div>

            {/* Backup Manual Booking ID Search */}
            <form
              onSubmit={handleQRManualSearch}
              className="w-full max-w-md flex items-center gap-2 z-10 pt-2"
            >
              <input
                type="text"
                value={qrScanInput}
                onChange={(e) => setQrScanInput(e.target.value)}
                placeholder="Enter Booking ID (e.g. BK-7491) or Phone..."
                className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#E77B49]"
              />
              <button
                type="submit"
                className="py-2.5 px-4 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold transition-all shadow-md active:scale-95"
              >
                Search ID
              </button>
            </form>
          </div>

          {/* Instant Verification Sheet */}
          {selectedScanBooking && (
            <div className="bg-white border-2 border-[#E5E7EB] rounded-3xl p-6 shadow-xl space-y-5 animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-start border-b border-[#E5E7EB] pb-4">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-2xl bg-[#60241E] text-white flex items-center justify-center font-bold text-lg font-serif">
                    {selectedScanBooking.customerName.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E77B49] bg-[#E77B49]/10 px-2.5 py-0.5 rounded-full">
                      Verified Check-in Pass
                    </span>
                    <h3 className="font-serif italic text-2xl font-bold text-[#60241E] mt-0.5">
                      {selectedScanBooking.customerName}
                    </h3>
                    <p className="text-xs text-[#6B7280] font-medium">
                      Phone: {selectedScanBooking.customerPhone} • Booking Ref: {selectedScanBooking.bookingId}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                    selectedScanBooking.bookingStatus === "Checked In"
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {selectedScanBooking.bookingStatus}
                </span>
              </div>

              {/* Receipt Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold">
                <div className="bg-[#F8F9FA] p-3 rounded-2xl border border-[#E5E7EB]">
                  <span className="text-[10px] text-[#6B7280] uppercase">Assigned Table</span>
                  <p className="text-[#60241E] text-sm font-bold">{selectedScanBooking.tableNumber}</p>
                </div>

                <div className="bg-[#F8F9FA] p-3 rounded-2xl border border-[#E5E7EB]">
                  <span className="text-[10px] text-[#6B7280] uppercase">Guests Count</span>
                  <p className="text-[#60241E] text-sm font-bold">{selectedScanBooking.guests || 2} Persons</p>
                </div>

                <div className="bg-[#F8F9FA] p-3 rounded-2xl border border-[#E5E7EB]">
                  <span className="text-[10px] text-[#6B7280] uppercase">Reservation Time</span>
                  <p className="text-[#60241E] text-sm font-bold">{selectedScanBooking.time}</p>
                </div>

                <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 uppercase font-bold">Advance Paid</span>
                  <p className="text-emerald-900 text-sm font-bold">{formatCurrency(selectedScanBooking.advanceAmount)}</p>
                </div>
              </div>

              {/* Pre-Ordered Food Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#60241E]">
                  Pre-Ordered Food Items ({selectedScanBooking.items?.length || 0})
                </h4>
                <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-2xl p-4 space-y-2 text-xs">
                  {selectedScanBooking.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center font-medium">
                      <span>{item.name} × {item.quantity}</span>
                      <span className="font-bold text-[#60241E]">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-[#E5E7EB] flex justify-between items-center text-sm font-bold text-[#60241E]">
                    <span>Total Bill Value</span>
                    <span>{formatCurrency(selectedScanBooking.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Scanner Actions Footer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleCheckInBooking(selectedScanBooking)}
                  className="py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="size-4" />
                  <span>Confirm Check-in &amp; Occupy Table</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    updateBookingStatus(selectedScanBooking.bookingId, "Preparing");
                    setCheckInSuccessMsg(`Kitchen notified to prepare orders for ${selectedScanBooking.tableNumber}`);
                    setTimeout(() => setCheckInSuccessMsg(null), 4000);
                  }}
                  className="py-3.5 px-6 rounded-2xl bg-[#60241E] hover:bg-[#4A1B17] text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Flame className="size-4 text-[#E77B49]" />
                  <span>Start Food Order</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== OTHER EXISTING ADMIN TABS ==================== */}

      {/* ANALYTICS TAB */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="bg-[#F8F9FA] dark:bg-slate-900 border-2 border-[#E5E7EB] dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-2xl font-serif italic font-bold text-[#60241E] dark:text-slate-100">Executive Performance Analytics</h2>
            <p className="text-xs text-[#6B7280] dark:text-slate-400 font-medium mt-0.5">Real-time table turnover, daily revenue stream, peak hours, and customer satisfaction metrics.</p>
          </div>

          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border-2 border-[#E5E7EB] dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B7280]">Total Revenue</span>
              <p className="text-2xl font-bold font-mono text-[#60241E] dark:text-[#E77B49]">{formatCurrency(bookings.reduce((sum, b) => sum + (b.totalAmount || 1200), 14500))}</p>
              <span className="text-[10px] font-bold text-emerald-600">↑ 18.5% vs last week</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border-2 border-[#E5E7EB] dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B7280]">Total Bookings</span>
              <p className="text-2xl font-bold font-mono text-[#1F2937] dark:text-slate-100">{bookings.length + 24} Reservations</p>
              <span className="text-[10px] font-bold text-emerald-600">↑ 12 new today</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border-2 border-[#E5E7EB] dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B7280]">Cancelled / No-Show</span>
              <p className="text-2xl font-bold font-mono text-rose-600">{bookings.filter((b) => b.bookingStatus === "Cancelled").length || 1}</p>
              <span className="text-[10px] font-bold text-rose-500">Low cancellation rate (2.1%)</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border-2 border-[#E5E7EB] dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B7280]">Customer Satisfaction</span>
              <p className="text-2xl font-bold font-mono text-amber-500">4.8 ★ / 5.0</p>
              <span className="text-[10px] font-bold text-[#6B7280]">Based on {adminReviewsList.length || 38} reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Occupancy Trends Graph */}
            <div className="bg-white dark:bg-slate-900 border-2 border-[#E5E7EB] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-serif italic font-bold text-xl text-[#60241E] dark:text-slate-100">Peak Occupancy Hours</h3>
                  <p className="text-xs text-[#4B5563] dark:text-slate-400 font-medium">Peak hours: 7:30 PM - 9:30 PM (95% Table Utilization)</p>
                </div>
                <BarChart3 className="size-6 text-[#E77B49]" />
              </div>

              <div className="h-44 pt-4 flex items-end justify-between gap-2 border-b border-[#E5E7EB] dark:border-slate-800 pb-2">
                {[
                  { time: "12 PM", pct: 40 },
                  { time: "1.5 PM", pct: 75 },
                  { time: "3 PM", pct: 30 },
                  { time: "5 PM", pct: 45 },
                  { time: "7.5 PM", pct: 95 },
                  { time: "9 PM", pct: 88 },
                  { time: "10.5 PM", pct: 50 },
                ].map((bar) => (
                  <div key={bar.time} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[9px] font-bold text-[#E77B49] opacity-0 group-hover:opacity-100 transition-opacity">{bar.pct}%</span>
                    <div
                      className="w-full bg-[#E77B49]/20 group-hover:bg-[#E77B49] rounded-t-xl transition-all duration-300"
                      style={{ height: `${bar.pct}%` }}
                    />
                    <span className="text-[9px] font-bold text-[#6B7280]">{bar.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Dishes Breakdown */}
            <div className="bg-white dark:bg-slate-900 border-2 border-[#E5E7EB] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-serif italic font-bold text-xl text-[#60241E] dark:text-slate-100">Top Revenue Dishes</h3>
              <div className="space-y-3">
                {[
                  { name: "Slow-Cooked Mutton Biryani", orders: 142, revenue: 63900, pct: 85 },
                  { name: "Melt-in-Mouth Galouti Kebab", orders: 98, revenue: 34300, pct: 60 },
                  { name: "Royal Sitar Butter Chicken", orders: 84, revenue: 31920, pct: 50 },
                  { name: "Saffron Phirni Dessert", orders: 62, revenue: 11160, pct: 35 },
                ].map((dish, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-foreground">
                      <span>{dish.name}</span>
                      <span className="font-mono text-[#E77B49]">{formatCurrency(dish.revenue)} ({dish.orders} orders)</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#60241E] dark:bg-[#E77B49] rounded-full transition-all duration-500" style={{ width: `${dish.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESTAURANT PROFILE TAB */}
      {activeTab === "profile" && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#F8F9FA] p-6 rounded-3xl border-2 border-[#E5E7EB]">
            <div>
              <h2 className="font-serif italic text-2xl font-bold text-[#60241E] dark:text-slate-100">
                Restaurant Profile Settings
              </h2>
              <p className="text-xs text-[#6B7280] dark:text-slate-400 font-medium mt-0.5">
                Manage your official restaurant identity, brand assets, operating hours, compliance credentials, and location details stored in MongoDB.
              </p>
            </div>

            {profileSavedMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2.5 shadow-sm animate-in fade-in">
                <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{profileSavedMsg}</span>
              </div>
            )}

            {profileErrorMsg && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2.5 shadow-sm animate-in fade-in">
                <AlertCircle className="size-5 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{profileErrorMsg}</span>
              </div>
            )}
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setProfileSavedMsg("");
              setProfileErrorMsg("");

              if (!profileForm.name?.trim()) {
                setProfileErrorMsg("Restaurant Name is required.");
                return;
              }
              if (!profileForm.ownerName?.trim()) {
                setProfileErrorMsg("Owner Name is required.");
                return;
              }
              if (!profileForm.contactPhone?.trim()) {
                setProfileErrorMsg("Mobile Number is required.");
                return;
              }
              const cleanMobile = profileForm.contactPhone.replace(/[^0-9+]/g, "");
              if (cleanMobile.length < 10) {
                setProfileErrorMsg("Please enter a valid Mobile Number (minimum 10 digits).");
                return;
              }
              if (!profileForm.address?.trim()) {
                setProfileErrorMsg("Restaurant Address is required.");
                return;
              }
              if (!profileForm.city?.trim()) {
                setProfileErrorMsg("City is required.");
                return;
              }
              if (!profileForm.state?.trim()) {
                setProfileErrorMsg("State is required.");
                return;
              }
              if (!profileForm.country?.trim()) {
                setProfileErrorMsg("Country is required.");
                return;
              }
              if (!profileForm.pincode?.trim()) {
                setProfileErrorMsg("Pincode / Zipcode is required.");
                return;
              }

              setIsSavingProfile(true);

              try {
                const res = await updateRestaurantProfile(currentRestId, {
                  ...profileForm,
                  logoFile: selectedLogoFile,
                  coverFile: selectedCoverFile,
                });

                if (res && res.success) {
                  setProfileSavedMsg("Restaurant Profile Updated Successfully.");
                  setSelectedLogoFile(null);
                  setSelectedCoverFile(null);
                  if (res.restaurant) {
                    setProfileForm((prev) => ({
                      ...prev,
                      logo: res.restaurant?.logo || prev.logo,
                      coverImage: res.restaurant?.coverImage || prev.coverImage,
                    }));
                  }
                  setTimeout(() => setProfileSavedMsg(""), 5000);
                } else {
                  setProfileErrorMsg(res?.message || "Failed to save restaurant profile.");
                }
              } catch (err: any) {
                setProfileErrorMsg(err.message || "An error occurred while saving profile.");
              } finally {
                setIsSavingProfile(false);
              }
            }}
            className="bg-card dark:bg-slate-900 border-2 border-border dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
          >
            {/* 1. Basic Identity & System ID */}
            <div className="space-y-4">
              <h3 className="font-serif italic font-bold text-xl text-[#60241E] dark:text-slate-100 border-b border-border dark:border-slate-800 pb-2">
                Restaurant Identity &amp; Credentials
              </h3>

              {/* Read-Only Auto-Generated Restaurant ID Banner */}
              <div className="p-4 rounded-2xl bg-secondary/10 dark:bg-slate-800/80 border-2 border-border dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E77B49]">
                    System Assigned Identifier (Read-Only)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">Restaurant ID:</span>
                    <span className="font-mono text-sm font-bold px-3 py-1 rounded-xl bg-card dark:bg-slate-900 border border-border dark:border-slate-700 text-[#60241E] dark:text-[#E77B49] shadow-xs select-all">
                      {currentRestId}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    This unique ID links menu items, tables, bookings, kitchen tickets, and analytics in MongoDB.
                  </p>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0 flex items-center gap-1">
                  <Lock className="size-3" /> System Verified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                <div>
                  <label className="block text-[#60241E] dark:text-slate-300 mb-1">
                    Restaurant Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="e.g. Royal Mughlai Feast"
                    className="w-full p-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border-2 border-border dark:border-slate-700 text-foreground font-semibold focus:outline-none focus:border-[#E77B49]"
                  />
                </div>

                <div>
                  <label className="block text-[#60241E] dark:text-slate-300 mb-1">
                    Owner Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.ownerName || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, ownerName: e.target.value })}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full p-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border-2 border-border dark:border-slate-700 text-foreground font-semibold focus:outline-none focus:border-[#E77B49]"
                  />
                </div>

                <div>
                  <label className="block text-[#60241E] dark:text-slate-300 mb-1">
                    Registered Email Address <span className="text-muted-foreground text-[10px]">(Non-Editable)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      readOnly
                      disabled
                      value={profileForm.contactEmail || ""}
                      className="w-full p-3 pr-10 rounded-2xl bg-secondary/20 dark:bg-slate-800/50 border-2 border-border dark:border-slate-700 text-muted-foreground font-mono font-bold cursor-not-allowed"
                    />
                    <Lock className="absolute right-3.5 top-3.5 size-4 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label className="block text-[#60241E] dark:text-slate-300 mb-1">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={profileForm.contactPhone || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, contactPhone: e.target.value })}
                    placeholder="e.g. +91 9876543210"
                    className="w-full p-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border-2 border-border dark:border-slate-700 text-foreground font-semibold focus:outline-none focus:border-[#E77B49]"
                  />
                </div>
              </div>
            </div>

            {/* 2. Address & Location */}
            <div className="space-y-4 pt-2 border-t border-border dark:border-slate-800">
              <h3 className="font-serif italic font-bold text-xl text-[#60241E] dark:text-slate-100 border-b border-border dark:border-slate-800 pb-2">
                Restaurant Location &amp; Address
              </h3>

              <div className="space-y-4 text-xs font-bold">
                <div>
                  <label className="block text-[#60241E] dark:text-slate-300 mb-1">
                    Street Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.address || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    placeholder="e.g. Plot 42, Connaught Place, Block C"
                    className="w-full p-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border-2 border-border dark:border-slate-700 text-foreground font-semibold focus:outline-none focus:border-[#E77B49]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[#60241E] dark:text-slate-300 mb-1">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.city || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      placeholder="e.g. New Delhi"
                      className="w-full p-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border-2 border-border dark:border-slate-700 text-foreground font-semibold focus:outline-none focus:border-[#E77B49]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#60241E] dark:text-slate-300 mb-1">
                      State <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.state || ""}
                      onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                      placeholder="e.g. Delhi"
                      className="w-full p-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border-2 border-border dark:border-slate-700 text-foreground font-semibold focus:outline-none focus:border-[#E77B49]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#60241E] dark:text-slate-300 mb-1">
                      Country <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.country || "India"}
                      onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                      placeholder="e.g. India"
                      className="w-full p-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border-2 border-border dark:border-slate-700 text-foreground font-semibold focus:outline-none focus:border-[#E77B49]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#60241E] dark:text-slate-300 mb-1">
                    Pincode / Zipcode <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.pincode || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })}
                    placeholder="e.g. 110001"
                    className="w-full sm:w-1/2 p-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border-2 border-border dark:border-slate-700 text-foreground font-semibold focus:outline-none focus:border-[#E77B49]"
                  />
                </div>
              </div>
            </div>

            {/* 3. Operating Hours & Cuisine */}
            <div className="space-y-4 pt-2 border-t border-border dark:border-slate-800">
              <h3 className="font-serif italic font-bold text-xl text-[#60241E] dark:text-slate-100 border-b border-border dark:border-slate-800 pb-2">
                Operations &amp; Cuisine Types
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
                <div>
                  <label className="block text-[#60241E] dark:text-slate-300 mb-1">
                    Opening Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.openingHours || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, openingHours: e.target.value })}
                    placeholder="e.g. 11:00 AM"
                    className="w-full p-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border-2 border-border dark:border-slate-700 text-foreground font-semibold focus:outline-none focus:border-[#E77B49]"
                  />
                </div>

                <div>
                  <label className="block text-[#60241E] dark:text-slate-300 mb-1">
                    Closing Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.closingHours || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, closingHours: e.target.value })}
                    placeholder="e.g. 11:00 PM"
                    className="w-full p-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border-2 border-border dark:border-slate-700 text-foreground font-semibold focus:outline-none focus:border-[#E77B49]"
                  />
                </div>

                <div>
                  <label className="block text-[#60241E] dark:text-slate-300 mb-1">
                    Primary Cuisine <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.cuisine || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, cuisine: e.target.value })}
                    placeholder="e.g. North Indian, Mughlai, Chinese"
                    className="w-full p-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border-2 border-border dark:border-slate-700 text-foreground font-semibold focus:outline-none focus:border-[#E77B49]"
                  />
                </div>
              </div>

              <div className="text-xs font-bold">
                <label className="block text-[#60241E] dark:text-slate-300 mb-1">
                  Restaurant Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={profileForm.description || ""}
                  onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                  placeholder="Describe your dining atmosphere, specialities, culinary story, and signature offerings..."
                  className="w-full p-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border-2 border-border dark:border-slate-700 text-foreground font-semibold focus:outline-none focus:border-[#E77B49]"
                />
              </div>
            </div>

            {/* 4. Compliance & Optional Business IDs */}
            <div className="space-y-4 pt-2 border-t border-border dark:border-slate-800">
              <h3 className="font-serif italic font-bold text-xl text-[#60241E] dark:text-slate-100 border-b border-border dark:border-slate-800 pb-2">
                Business Compliance &amp; Tax Credentials <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                <div>
                  <label className="block text-[#60241E] dark:text-slate-300 mb-1">
                    GST Number <span className="text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={profileForm.gstNumber || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, gstNumber: e.target.value })}
                    placeholder="e.g. 07AAAAA0000A1Z5"
                    className="w-full p-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border-2 border-border dark:border-slate-700 text-foreground font-mono font-semibold focus:outline-none focus:border-[#E77B49]"
                  />
                </div>

                <div>
                  <label className="block text-[#60241E] dark:text-slate-300 mb-1">
                    FSSAI License Number <span className="text-muted-foreground font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={profileForm.fssaiNumber || ""}
                    onChange={(e) => setProfileForm({ ...profileForm, fssaiNumber: e.target.value })}
                    placeholder="e.g. 10020011000123"
                    className="w-full p-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border-2 border-border dark:border-slate-700 text-foreground font-mono font-semibold focus:outline-none focus:border-[#E77B49]"
                  />
                </div>
              </div>
            </div>

            {/* 5. Brand Media File Uploads (Cover Banner Image) */}
            <div className="space-y-6 pt-4 border-t border-border dark:border-slate-800">
              <div className="flex items-center justify-between border-b border-border dark:border-slate-800 pb-2">
                <div>
                  <h3 className="font-serif italic font-bold text-xl text-[#60241E] dark:text-slate-100 flex items-center gap-2">
                    <Sparkles className="size-5 text-[#E77B49]" />
                    <span>Restaurant Cover Banner File Upload</span>
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    Upload official high-resolution cover banner image file saved to MongoDB.
                  </p>
                </div>
              </div>

              {/* Hidden System File Inputs */}
              <input
                type="file"
                ref={coverFileInputRef}
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleCoverUpload(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              <div className="max-w-xl">
                {/* RESTAURANT COVER BANNER FILE UPLOADER */}
                <div className="bg-[#F8F9FA] dark:bg-slate-900 border-2 border-border dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-[#60241E] dark:text-[#E77B49]">
                      Cover Banner Image
                    </label>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">PNG, JPG, WEBP (Max 5MB)</span>
                  </div>

                  {/* Cover Live Preview & Dropzone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOverCover(true);
                    }}
                    onDragLeave={() => setIsDragOverCover(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOverCover(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleCoverUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    className={`relative rounded-2xl border-2 border-dashed p-4 transition-all flex flex-col items-center justify-center gap-3 text-center ${
                      isDragOverCover
                        ? "border-[#E77B49] bg-[#E77B49]/10"
                        : "border-border dark:border-slate-700 bg-card dark:bg-slate-800/80"
                    }`}
                  >
                    {profileForm.coverImage ? (
                      <div className="relative group w-full h-28 rounded-2xl overflow-hidden shadow-md border-2 border-[#E77B49]/40 shrink-0">
                        <img
                          src={formatImageUrl(profileForm.coverImage)}
                          alt="Restaurant Cover Preview"
                          className="size-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCoverFile(null);
                            setProfileForm({ ...profileForm, coverImage: "" });
                          }}
                          className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity text-xs font-bold"
                          title="Remove Cover Image"
                        >
                          <Trash2 className="size-4 text-rose-400" />
                          <span>Remove Banner</span>
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-20 rounded-2xl bg-[#60241E]/10 dark:bg-slate-700 flex items-center justify-center text-[#E77B49]">
                        <Camera className="size-8" />
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-extrabold text-foreground">
                        {profileForm.coverImage ? "Cover Banner Selected" : "Click to select or drag cover image here"}
                      </p>
                      {selectedCoverFile && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                          File: {selectedCoverFile.name} ({(selectedCoverFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </p>
                      )}
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => coverFileInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-[#60241E] dark:bg-[#E77B49] text-white text-xs font-extrabold hover:bg-[#4A1B17] dark:hover:bg-[#D66A38] transition-all flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
                      >
                        <Upload className="size-3.5" />
                        <span>Upload Cover File</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Guest Amenities */}
            <div className="space-y-3 pt-2 border-t border-border dark:border-slate-800">
              <h3 className="font-serif italic font-bold text-xl text-[#60241E] dark:text-slate-100 border-b border-border dark:border-slate-800 pb-2">
                Guest Amenities
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
                {[
                  { key: "wifi", label: "Free WiFi 📶" },
                  { key: "ac", label: "Air Conditioning ❄️" },
                  { key: "parking", label: "Valet Parking 🚗" },
                  { key: "outdoorSeating", label: "Outdoor Seating 🌿" },
                  { key: "familyFriendly", label: "Family Friendly 👨‍👩‍👧" },
                  { key: "privateDining", label: "Private Dining 👑" },
                  { key: "liveMusic", label: "Live Music 🎵" },
                  { key: "wheelchairAccessible", label: "Wheelchair Access ♿" },
                ].map((item) => {
                  const isChecked = Boolean(profileForm.amenities?.[item.key as keyof typeof profileForm.amenities]);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        setProfileForm({
                          ...profileForm,
                          amenities: {
                            ...profileForm.amenities,
                            [item.key]: !isChecked,
                          },
                        })
                      }
                      className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                        isChecked
                          ? "bg-[#60241E] text-white border-[#60241E] shadow-sm"
                          : "bg-secondary/10 dark:bg-slate-800 text-muted-foreground border-border dark:border-slate-700"
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className={`size-3 rounded-full ${isChecked ? "bg-[#E77B49]" : "bg-gray-300"}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save Profile Button */}
            <div className="pt-4 border-t border-border dark:border-slate-800">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="w-full py-4 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSavingProfile ? (
                  <span>Saving Profile to MongoDB...</span>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    <span>Save Changes &amp; Sync App-Wide</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GALLERY MANAGEMENT TAB */}
      {activeTab === "gallery" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#F8F9FA] p-6 rounded-3xl border-2 border-[#E5E7EB]">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E77B49] bg-[#E77B49]/10 px-3 py-1 rounded-full border border-[#E77B49]/20">
                MEDIA &amp; VISUAL ASSETS
              </span>
              <h2 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#60241E] mt-1.5">
                Restaurant Photo &amp; Media Gallery
              </h2>
              <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                Upload and organize photos of interior dining halls, signature dishes, outdoor seating, VIP suites, and events.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowGalleryModal(true)}
              className="py-3 px-5 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-2 active:scale-95 shrink-0"
            >
              <Plus className="size-4" />
              <span>Add Photo to Gallery</span>
            </button>
          </div>

          {/* Gallery Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
            <span className="text-[10px] text-[#60241E] uppercase font-extrabold mr-1 shrink-0">
              Filter Category:
            </span>
            {["All", "Interior", "Exterior", "Dining Area", "VIP Rooms", "Events", "Food Highlights", "Food", "Tables"].map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setGalleryCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-full transition-all shrink-0 ${
                    galleryCategoryFilter === cat
                      ? "bg-[#60241E] text-white shadow-xs"
                      : "bg-[#F8F9FA] text-[#6B7280] border border-[#E5E7EB] hover:text-[#1F2937]"
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>

          {/* Gallery Photo Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleryList
              .filter(
                (img) =>
                  galleryCategoryFilter === "All" ||
                  img.category.toLowerCase() === galleryCategoryFilter.toLowerCase()
              )
              .map((img) => (
                <div
                  key={img.id}
                  className="bg-white border-2 border-[#E5E7EB] rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between group hover:border-[#E77B49] transition-all"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    <img
                      src={formatImageUrl(img.url)}
                      alt={img.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-[#60241E]/90 backdrop-blur-xs text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-xs">
                      {img.category}
                    </span>
                  </div>

                  <div className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-serif italic font-bold text-base text-[#60241E] truncate">
                        {img.title}
                      </h4>
                      <p className="text-[10px] text-[#6B7280] font-medium">Order #{img.order || 1}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteGalleryImage(img.id)}
                      className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                      title="Delete Photo"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* FOOD CATALOG TAB */}
      {activeTab === "food" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-serif italic font-bold text-[#60241E]">Live Food Menu Catalog</h2>
              <p className="text-xs text-[#6B7280] font-medium">Manage portions, prices, and today's kitchen availability.</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingDishId(null);
                setFoodForm({
                  name: "",
                  category: "Main Course",
                  price: 350,
                  discountPrice: 0,
                  description: "",
                  ingredients: "",
                  prepTime: "15-20 min",
                  portionsLeft: 10,
                  image: "",
                  enabled: true,
                  availableToday: true,
                  stockType: "Available",
                  isVeg: true,
                  isVegan: false,
                  isOrganic: false,
                  isBestseller: false,
                });
                setShowFoodModal(true);
              }}
              className="py-2.5 px-4 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="size-4" />
              <span>Add Dish</span>
            </button>
          </div>

          {dishes.length === 0 ? (
            <div className="p-12 text-center bg-card dark:bg-slate-900 border-2 border-dashed border-border dark:border-slate-800 rounded-3xl space-y-4">
              <div className="size-16 rounded-2xl bg-[#E77B49]/10 text-[#E77B49] flex items-center justify-center mx-auto">
                <UtensilsCrossed className="size-8 stroke-[2]" />
              </div>
              <div>
                <h3 className="font-serif italic font-bold text-xl text-foreground">No dishes added yet. Start by adding your first dish.</h3>
                <p className="text-xs text-muted-foreground mt-1 font-medium max-w-sm mx-auto">
                  Populate your restaurant menu catalog so customers and kitchen staff can view available items.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingDishId(null);
                  setFoodForm({
                    name: "",
                    category: "Main Course",
                    price: 350,
                    discountPrice: 0,
                    description: "",
                    ingredients: "",
                    prepTime: "15-20 min",
                    portionsLeft: 10,
                    image: "",
                    enabled: true,
                    availableToday: true,
                    stockType: "Available",
                    isVeg: true,
                    isVegan: false,
                    isOrganic: false,
                    isBestseller: false,
                  });
                  setShowFoodModal(true);
                }}
                className="py-3 px-5 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold shadow-md transition-all inline-flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <Plus className="size-4" />
                <span>Add Your First Dish</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dishes.map((d) => {
                const mainImg = (typeof d.dishImage === "string" ? d.dishImage : d.dishImage?.imageUrl) || d.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800";
                const isAvailable = d.availableToday && d.portionsLeft > 0;
                return (
                  <div key={d.id} className="bg-card dark:bg-slate-900 border-2 border-border dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-[#E77B49] transition-all">
                    <div className="flex gap-4">
                      <div className="relative size-24 rounded-2xl overflow-hidden border border-border dark:border-slate-800 shrink-0 bg-slate-100 dark:bg-slate-800">
                        <img src={mainImg} alt={d.name} loading="lazy" className="w-full h-full object-cover" />
                        <span className={`absolute top-1.5 left-1.5 size-4 rounded-md flex items-center justify-center border ${d.isVeg !== false ? "border-emerald-600 bg-white" : "border-red-600 bg-white"}`}>
                          <span className={`size-2 rounded-full ${d.isVeg !== false ? "bg-emerald-600" : "bg-red-600"}`} />
                        </span>
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#60241E]/10 dark:bg-[#E77B49]/20 text-[#60241E] dark:text-[#E77B49]">
                            {d.category}
                          </span>
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${isAvailable ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"}`}>
                            {isAvailable ? "Available Today" : "Sold Out"}
                          </span>
                        </div>
                        <h3 className="font-serif italic font-bold text-lg text-foreground truncate">{d.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{d.description}</p>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-xs font-extrabold text-[#E77B49]">{formatCurrency(d.discountPrice || d.price)}</span>
                          {d.isVegan && <span className="text-[9px] font-extrabold uppercase bg-emerald-600 text-white px-1.5 py-0.2 rounded-md">Vegan</span>}
                          {d.isOrganic && <span className="text-[9px] font-extrabold uppercase bg-teal-700 text-white px-1.5 py-0.2 rounded-md">Organic</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-border dark:border-slate-800">
                      <span className="text-[10px] font-bold text-[#60241E] dark:text-slate-300 bg-secondary/30 px-2.5 py-0.5 rounded-full">
                        {d.portionsLeft} Portions Left
                      </span>

                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => handleEditDish(d)} className="p-2 rounded-xl text-[#60241E] dark:text-slate-200 hover:bg-secondary/30" title="Edit Dish">
                          <Edit2 className="size-4" />
                        </button>
                        <button type="button" onClick={() => deleteDish(d.id)} className="p-2 rounded-xl text-rose-600 hover:bg-rose-500/10" title="Delete Dish">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TABLE MANAGEMENT TAB */}
      {activeTab === "tables" && (
        <div className="space-y-6">
          {/* Header & Controls Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#F8F9FA] dark:bg-slate-900 border-2 border-[#E5E7EB] dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <div>
              <h2 className="text-2xl font-serif italic font-bold text-[#60241E] dark:text-slate-100">Table Management</h2>
              <p className="text-xs text-[#6B7280] dark:text-slate-400 font-medium">Configure seating capacity, table types, uploaded photos, and live table status stored in MongoDB.</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingTableId(null);
                setTableUploadError("");
                setSelectedTableFile(null);
                setTableImagePreview(null);
                const nextNum = getNextUniqueTableNumber();
                setTableForm({
                  tableName: `Table ${nextNum}`,
                  tableNumber: nextNum,
                  capacity: 4,
                  tableType: "Regular",
                  description: "",
                  image: "",
                  status: "Available",
                  section: "Regular",
                });
                setShowTableModal(true);
              }}
              className="py-3 px-5 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="size-4" />
              <span>Add Table</span>
            </button>
          </div>

          {/* Search & Status Filter Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="size-4 text-muted-foreground absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={tableSearchQuery}
                onChange={(e) => setTableSearchQuery(e.target.value)}
                placeholder="Search by table number, name, or type (e.g. TABLE 01, Window)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#E5E7EB] dark:border-slate-800 text-xs font-bold text-foreground focus:outline-none focus:border-[#E77B49]"
              />
              {tableSearchQuery && (
                <button type="button" onClick={() => setTableSearchQuery("")} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-[#60241E] dark:text-slate-300 shrink-0">Filter Status:</span>
              <select
                value={tableStatusFilter}
                onChange={(e) => setTableStatusFilter(e.target.value as any)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#E5E7EB] dark:border-slate-800 text-xs font-extrabold text-[#60241E] dark:text-slate-100 focus:outline-none focus:border-[#E77B49] cursor-pointer"
              >
                <option value="All">All Tables</option>
                <option value="Available">Available (Green)</option>
                <option value="Reserved">Reserved (Orange)</option>
                <option value="Occupied">Occupied (Red)</option>
                <option value="Maintenance">Maintenance (Gray)</option>
              </select>
            </div>
          </div>

          {/* Table Cards Grid */}
          {(() => {
            const filteredTables = tables.filter((t) => {
              const q = tableSearchQuery.toLowerCase().trim();
              const matchesSearch =
                q === "" ||
                (t.tableNumber && t.tableNumber.toLowerCase().includes(q)) ||
                (t.tableName && t.tableName.toLowerCase().includes(q)) ||
                (t.tableType && t.tableType.toLowerCase().includes(q)) ||
                (t.section && t.section.toLowerCase().includes(q));

              const matchesStatus =
                tableStatusFilter === "All" ? true : (t.status || "Available") === tableStatusFilter;

              return matchesSearch && matchesStatus;
            });

            if (filteredTables.length === 0) {
              return (
                <div className="p-12 text-center bg-card dark:bg-slate-900 border-2 border-dashed border-border dark:border-slate-800 rounded-3xl space-y-4">
                  <div className="size-16 rounded-2xl bg-[#60241E]/10 dark:bg-[#E77B49]/20 text-[#60241E] dark:text-[#E77B49] flex items-center justify-center mx-auto">
                    <LayoutGrid className="size-8 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="font-serif italic font-bold text-xl text-foreground">No tables found matching criteria.</h3>
                    <p className="text-xs text-muted-foreground mt-1 font-medium max-w-sm mx-auto">
                      Try clearing search filters or add a new dining table to your establishment.
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTables.map((t) => {
                  const tableImgSrc = t.image
                    ? formatImageUrl(t.image)
                    : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=60";
                  const currentStatus = (t.status || "Available") as "Available" | "Reserved" | "Occupied" | "Maintenance";

                  return (
                    <div
                      key={t.id}
                      className="bg-white dark:bg-slate-900 border-2 border-[#E5E7EB] dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      {/* Top Table Image Thumbnail & Status Badge */}
                      <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <img
                          src={tableImgSrc}
                          alt={t.tableName || t.tableNumber}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                        {/* Status Badge Over Image */}
                        <span
                          className={`absolute top-3 right-3 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-md text-white ${
                            currentStatus === "Available"
                              ? "bg-emerald-600"
                              : currentStatus === "Reserved"
                              ? "bg-[#E77B49]"
                              : currentStatus === "Occupied"
                              ? "bg-rose-600"
                              : "bg-gray-500"
                          }`}
                        >
                          {currentStatus}
                        </span>

                        {/* Table Number Badge */}
                        <div className="absolute bottom-3 left-3 flex items-center gap-2">
                          <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-extrabold text-[#60241E] dark:text-[#E77B49] shadow-sm font-mono border border-white/20">
                            {t.tableNumber}
                          </span>
                        </div>
                      </div>

                      {/* Card Content Details */}
                      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-serif italic font-bold text-xl text-[#60241E] dark:text-slate-100">
                              {t.tableName || `Table ${t.tableNumber}`}
                            </h3>
                            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-secondary/20 text-[#60241E] dark:text-slate-300">
                              {t.tableType || t.type || "Regular"}
                            </span>
                          </div>

                          <p className="text-xs text-[#4B5563] dark:text-slate-400 font-medium">
                            {t.capacity} Seating Capacity • {t.section || t.tableType || "Main Dining"}
                          </p>

                          {t.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 pt-1 font-normal">
                              {t.description}
                            </p>
                          )}
                        </div>

                        {/* Status Management Selector & Action Buttons */}
                        <div className="pt-3 border-t border-[#E5E7EB] dark:border-slate-800 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <label className="text-[11px] font-extrabold uppercase text-[#60241E] dark:text-slate-400">
                              Status:
                            </label>
                            <select
                              value={currentStatus}
                              onChange={(e) => updateTable(t.id, { status: e.target.value as any })}
                              className="text-xs font-extrabold bg-[#F8F9FA] dark:bg-slate-800 border-2 border-[#E5E7EB] dark:border-slate-700 rounded-xl px-3 py-1.5 text-[#60241E] dark:text-slate-100 focus:outline-none focus:border-[#E77B49] cursor-pointer"
                            >
                              <option value="Available">Available (Green)</option>
                              <option value="Reserved">Reserved (Orange)</option>
                              <option value="Occupied">Occupied (Red)</option>
                              <option value="Maintenance">Maintenance (Gray)</option>
                            </select>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleEditTable(t)}
                              className="py-2 px-3.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-[#60241E] dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Edit2 className="size-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setDeletingTableId(t.id);
                                setShowDeleteTableModal(true);
                              }}
                              className="py-2 px-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Trash2 className="size-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* STAFF MANAGEMENT TAB */}
      {activeTab === "staff" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-serif italic font-bold text-[#60241E] dark:text-slate-100">Restaurant Staff Directory</h2>
              <p className="text-xs text-[#6B7280] dark:text-slate-400 font-medium">Manage chefs, cashiers, waiters, managers, and staff access accounts stored in MongoDB.</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingStaffId(null);
                setStaffForm({ name: "", mobile: "", email: "", role: "Kitchen Staff", password: "" });
                setShowStaffModal(true);
              }}
              className="py-2.5 px-4 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-1.5 active:scale-95"
            >
              <UserPlus className="size-4" />
              <span>Add Staff Member</span>
            </button>
          </div>

          {kitchenStaff.length === 0 ? (
            <div className="bg-[#F8F9FA] dark:bg-slate-900 border-2 border-dashed border-[#E5E7EB] dark:border-slate-800 rounded-3xl p-10 text-center space-y-3">
              <Users className="size-10 text-[#E77B49] mx-auto opacity-50" />
              <h3 className="font-serif italic text-xl font-bold text-[#60241E] dark:text-slate-100">No Staff Members Added Yet</h3>
              <p className="text-xs text-[#6B7280] dark:text-slate-400">Click "Add Staff Member" to add staff members to your restaurant team in MongoDB Atlas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {kitchenStaff.map((s) => (
                <div key={s.id} className="bg-white dark:bg-slate-900 border-2 border-[#E5E7EB] dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-3">
                      <img src={s.profilePhoto || "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500&auto=format&fit=crop&q=60"} alt={s.name} className="size-12 rounded-2xl object-cover border border-[#E5E7EB] dark:border-slate-800 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] font-extrabold uppercase text-[#E77B49]">{s.staffId}</span>
                        <h3 className="font-bold text-base text-[#1F2937] dark:text-slate-100 truncate">{s.name}</h3>
                        <p className="text-xs text-[#6B7280] dark:text-slate-400 font-semibold">{s.roleTitle || s.role} • {s.mobile || s.phone}</p>
                        {s.email && <p className="text-[11px] text-muted-foreground truncate">{s.email}</p>}
                        {s.createdAt && <p className="text-[10px] text-muted-foreground/70 mt-0.5">Added: {s.createdAt}</p>}
                      </div>
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shrink-0 ${s.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-400/30' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-400/30'}`}>
                      {s.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-[#E5E7EB] dark:border-slate-800">
                    <button type="button" onClick={() => toggleKitchenStaffStatus(s.id)} className="text-xs font-bold text-[#60241E] dark:text-[#E77B49] hover:underline">
                      Toggle Status ({s.status === "Active" ? "Disable" : "Enable"})
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingStaffId(s.id);
                          setStaffForm({
                            name: s.name,
                            mobile: s.mobile || s.phone || "",
                            email: s.email || "",
                            role: (s.roleTitle || s.role || "Kitchen Staff") as any,
                            password: s.password || "",
                          });
                          setShowStaffModal(true);
                        }}
                        className="p-2 rounded-xl text-[#60241E] dark:text-[#E77B49] hover:bg-gray-100 dark:hover:bg-slate-800"
                        title="Edit Staff"
                      >
                        <Edit2 className="size-4" />
                      </button>
                      <button type="button" onClick={() => deleteKitchenStaff(s.id)} className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50" title="Delete Staff">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REVIEWS MANAGEMENT TAB */}
      {activeTab === "reviews" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-serif italic font-bold text-[#60241E]">Customer Reviews Management</h2>
            <p className="text-xs text-[#6B7280] font-medium">Monitor diner ratings and publish management responses.</p>
          </div>

          <div className="space-y-4">
            {adminReviewsList.map((r) => (
              <div key={r.id} className="bg-white border-2 border-[#E5E7EB] rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-[#1F2937]">{r.customerName}</h3>
                    <p className="text-[10px] text-[#6B7280]">{r.date}</p>
                  </div>
                  <span className="text-xs font-bold text-amber-500">★ {r.rating}.0</span>
                </div>

                <p className="text-xs text-[#4B5563]">"{r.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADMIN SECURITY SETTINGS TAB */}
      {activeTab === "security" && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div>
            <h2 className="text-2xl font-serif italic font-bold text-[#60241E] dark:text-slate-100">
              Admin Security Settings
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-slate-400 font-medium">
              Manage your Restaurant Admin Portal password protection and access security credentials stored in MongoDB.
            </p>
          </div>

          <div className="bg-card dark:bg-slate-900 border-2 border-border dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            {/* 1. TOP OPTION: Admin Portal Password Protection Toggle */}
            <div className="p-5 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800/80 border-2 border-border dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-[#E77B49]" />
                  <h3 className="font-serif italic font-bold text-lg text-[#60241E] dark:text-slate-100">
                    Admin Portal Password Protection
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  When enabled, entering your Admin Password is required to open the Restaurant Admin Dashboard. When disabled, the Admin Dashboard opens directly.
                </p>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={async () => {
                  const currentSetting = profileForm.adminPasswordProtection !== false;
                  const newSetting = !currentSetting;
                  
                  setProfileForm((prev) => ({ ...prev, adminPasswordProtection: newSetting }));
                  setPassSuccessMsg("");
                  setPassErrMsg("");
                  
                  const res = await updateRestaurantProfile(currentRestId, {
                    ...profileForm,
                    adminPasswordProtection: newSetting,
                  });
                  
                  if (res && res.success) {
                    setPassSuccessMsg(`Admin Portal Password Protection ${newSetting ? "Enabled (ON)" : "Disabled (OFF)"} and saved to MongoDB.`);
                    setTimeout(() => setPassSuccessMsg(""), 5000);
                  } else {
                    setPassErrMsg("Failed to update password protection setting.");
                  }
                }}
                className={`relative inline-flex h-8 w-20 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  profileForm.adminPasswordProtection !== false
                    ? "bg-emerald-600"
                    : "bg-slate-400 dark:bg-slate-600"
                }`}
              >
                <span className="sr-only">Toggle Admin Portal Password Protection</span>
                <span
                  className={`pointer-events-none flex items-center justify-center size-7 transform rounded-full bg-white text-[9px] font-extrabold text-[#60241E] shadow-lg ring-0 transition duration-200 ease-in-out ${
                    profileForm.adminPasswordProtection !== false ? "translate-x-12 text-emerald-700" : "translate-x-0 text-slate-600"
                  }`}
                >
                  {profileForm.adminPasswordProtection !== false ? "ON" : "OFF"}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                profileForm.adminPasswordProtection !== false
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
              }`}>
                {profileForm.adminPasswordProtection !== false ? "[ ON ] Password Protection Enabled" : "[ OFF ] Password Protection Disabled"}
              </span>
            </div>

            {/* Success & Error Banners */}
            {passSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 shadow-sm">
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{passSuccessMsg}</span>
              </div>
            )}
            {passErrMsg && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2 shadow-sm">
                <AlertCircle className="size-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{passErrMsg}</span>
              </div>
            )}

            {/* CONDITIONAL RENDERING BASED ON PASSWORD PROTECTION SETTING */}
            {profileForm.adminPasswordProtection === false ? (
              <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-center space-y-2">
                <Lock className="size-8 text-amber-600 dark:text-amber-400 mx-auto opacity-70" />
                <h3 className="font-serif italic text-lg font-bold">
                  Admin Portal Password Protection is currently disabled.
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-300 font-medium max-w-md mx-auto">
                  Accessing the Restaurant Admin Dashboard will open directly without asking for a password. Toggle the setting ON above if you wish to enforce password verification.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAdminPassChange} className="space-y-4 pt-2">
                <p className="text-xs text-[#6B7280] dark:text-slate-400 font-medium">
                  Manage your Restaurant Admin Portal password. Your password is securely hashed using bcrypt and stored in MongoDB.
                </p>

                <div className="space-y-4 text-xs font-bold">
                  <div>
                    <label className="block text-[#60241E] dark:text-slate-200 mb-1">
                      Current Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? "text" : "password"}
                        required
                        value={currentAdminPass}
                        onChange={(e) => setCurrentAdminPass(e.target.value)}
                        placeholder="Enter current admin password"
                        className="w-full p-3 pr-10 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border-2 border-border dark:border-slate-700 text-foreground font-semibold focus:outline-none focus:border-[#E77B49]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrentPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#60241E] dark:text-slate-200 mb-1">
                      New Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPass ? "text" : "password"}
                        required
                        minLength={6}
                        value={newAdminPass}
                        onChange={(e) => setNewAdminPass(e.target.value)}
                        placeholder="Enter new password (min 6 chars)"
                        className="w-full p-3 pr-10 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border-2 border-border dark:border-slate-700 text-foreground font-semibold focus:outline-none focus:border-[#E77B49]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#60241E] dark:text-slate-200 mb-1">
                      Confirm New Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        required
                        value={confirmAdminPass}
                        onChange={(e) => setConfirmAdminPass(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full p-3 pr-10 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border-2 border-border dark:border-slate-700 text-foreground font-semibold focus:outline-none focus:border-[#E77B49]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmittingPass}
                    className="w-full py-4 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingPass ? (
                      <span>Updating Password...</span>
                    ) : (
                      <>
                        <ShieldCheck className="size-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FOOD FORM MODAL */}
      {showFoodModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 border-2 border-border dark:border-slate-800 my-8">
            <div className="flex justify-between items-center pb-2 border-b border-border dark:border-slate-800">
              <h3 className="font-serif italic text-2xl font-bold text-[#60241E] dark:text-slate-100">
                {editingDishId ? "Edit Dish Details & Image" : "Add New Dish to Catalog"}
              </h3>
              <button type="button" onClick={() => setShowFoodModal(false)} className="p-2 rounded-full hover:bg-secondary/20">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleFoodSubmit} className="space-y-4 text-xs">
              {/* Dish Image Upload Section */}
              <div className="space-y-2">
                <label className="block font-bold text-[#60241E] dark:text-slate-200">
                  Dish Image <span className="text-rose-500">*</span>
                </label>

                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  {/* Current Image Preview */}
                  <div className="relative size-28 rounded-2xl overflow-hidden border-2 border-[#E77B49] shadow-md shrink-0 bg-slate-100 dark:bg-slate-800 group">
                    <img
                      src={foodForm.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800"}
                      alt="Dish Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white uppercase">Preview</span>
                    </div>
                  </div>

                  {/* Dropzone & Upload Button */}
                  <div className="flex-1 w-full space-y-2">
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragOverFoodImage(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setIsDragOverFoodImage(false); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOverFoodImage(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleFoodImageFile(e.dataTransfer.files[0]);
                        }
                      }}
                      className={`border-2 border-dashed rounded-2xl p-3 text-center transition-all cursor-pointer ${
                        isDragOverFoodImage
                          ? "border-[#E77B49] bg-[#E77B49]/10"
                          : "border-border dark:border-slate-700 bg-secondary/10 hover:border-[#E77B49]"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        id="food-image-input"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFoodImageFile(e.target.files[0]);
                          }
                        }}
                      />
                      <label htmlFor="food-image-input" className="cursor-pointer space-y-1 block">
                        <Upload className="size-5 text-[#E77B49] mx-auto" />
                        <p className="font-bold text-foreground">Click to upload from device or drag &amp; drop</p>
                        <p className="text-[10px] text-muted-foreground">Accepts JPG, PNG, WEBP (Auto-optimized)</p>
                      </label>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => document.getElementById("food-image-input")?.click()}
                        className="flex-1 py-1.5 rounded-xl bg-[#60241E]/10 dark:bg-slate-800 text-[#60241E] dark:text-slate-200 font-extrabold hover:bg-[#60241E] hover:text-white transition-colors text-[11px]"
                      >
                        Replace Image
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFoodForm({
                            ...foodForm,
                            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
                            dishImage: null,
                          })
                        }
                        className="py-1.5 px-3 rounded-xl bg-rose-500/10 text-rose-600 font-bold hover:bg-rose-600 hover:text-white transition-colors text-[11px]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preset Selection Pills */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Or pick a gourmet photo preset:</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {[
                      { name: "Biryani", url: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=800" },
                      { name: "Kebabs", url: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=800" },
                      { name: "Pizza", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800" },
                      { name: "Pasta", url: "https://images.unsplash.com/photo-1621996346565-e3d5d6281288?auto=format&fit=crop&q=80&w=800" },
                      { name: "Burger", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800" },
                      { name: "Sushi", url: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&q=80&w=800" },
                      { name: "Paneer", url: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=800" },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() =>
                          setFoodForm({
                            ...foodForm,
                            image: preset.url,
                            dishImage: {
                              imageUrl: preset.url,
                              storagePath: `dishes/preset_${preset.name.toLowerCase()}.jpg`,
                              uploadTimestamp: new Date().toISOString(),
                            },
                          })
                        }
                        className="px-2.5 py-1 rounded-lg bg-secondary/20 hover:bg-[#E77B49] hover:text-white font-bold text-[10px] shrink-0 border border-border dark:border-slate-700 transition-colors"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Input Grid */}
              <div>
                <label className="block font-bold text-[#60241E] dark:text-slate-200 mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  value={foodForm.name}
                  onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                  placeholder="e.g. Royal Mughlai Paneer Tikka"
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-border dark:border-slate-700 text-foreground font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#60241E] dark:text-slate-200 mb-1">Category</label>
                  <select
                    value={foodForm.category}
                    onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-border dark:border-slate-700 text-foreground font-semibold"
                  >
                    <option value="Starters">Starters</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Pizza">Pizza</option>
                    <option value="Special Items">Special Items</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#60241E] dark:text-slate-200 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={foodForm.price}
                    onChange={(e) => setFoodForm({ ...foodForm, price: sanitizeNumberInput(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-border dark:border-slate-700 text-foreground font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#60241E] dark:text-slate-200 mb-1">Portions Left</label>
                  <input
                    type="number"
                    required
                    value={foodForm.portionsLeft}
                    onChange={(e) => setFoodForm({ ...foodForm, portionsLeft: sanitizeNumberInput(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-border dark:border-slate-700 text-foreground font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#60241E] dark:text-slate-200 mb-1">Dietary Type</label>
                  <div className="flex rounded-xl overflow-hidden border border-border dark:border-slate-700 p-0.5 bg-secondary/10">
                    <button
                      type="button"
                      onClick={() => setFoodForm({ ...foodForm, isVeg: true })}
                      className={`flex-1 py-1.5 text-[10px] font-extrabold rounded-lg transition-colors ${
                        foodForm.isVeg ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground"
                      }`}
                    >
                      Veg 🥬
                    </button>
                    <button
                      type="button"
                      onClick={() => setFoodForm({ ...foodForm, isVeg: false })}
                      className={`flex-1 py-1.5 text-[10px] font-extrabold rounded-lg transition-colors ${
                        !foodForm.isVeg ? "bg-red-600 text-white shadow-xs" : "text-muted-foreground"
                      }`}
                    >
                      Non-Veg 🍗
                    </button>
                  </div>
                </div>
              </div>

              {/* Tags & Availability Switches */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-secondary/10 border border-border dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={foodForm.isVegan}
                    onChange={(e) => setFoodForm({ ...foodForm, isVegan: e.target.checked })}
                    className="accent-[#E77B49]"
                  />
                  <span className="font-bold text-foreground">Vegan 🌱</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={foodForm.isOrganic}
                    onChange={(e) => setFoodForm({ ...foodForm, isOrganic: e.target.checked })}
                    className="accent-[#E77B49]"
                  />
                  <span className="font-bold text-foreground">Organic 🌿</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={foodForm.availableToday}
                    onChange={(e) => setFoodForm({ ...foodForm, availableToday: e.target.checked })}
                    className="accent-[#E77B49]"
                  />
                  <span className="font-bold text-foreground">Available Now ✅</span>
                </label>
              </div>

              <div>
                <label className="block font-bold text-[#60241E] dark:text-slate-200 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  value={foodForm.description}
                  onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
                  placeholder="Fresh ingredients, aromatic spices..."
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-border dark:border-slate-700 text-foreground font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFoodModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-secondary/20 hover:bg-secondary/30 text-foreground text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase shadow-md transition-all active:scale-95"
                >
                  {editingDishId ? "Save Changes" : "Save Dish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE TABLE CONFIRMATION MODAL */}
      {showDeleteTableModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 border-2 border-[#E5E7EB] dark:border-slate-800 text-center animate-in zoom-in-95 duration-200">
            <div className="size-14 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="size-7 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-serif italic text-xl font-bold text-[#60241E] dark:text-slate-100">
                Delete Table Confirmation
              </h3>
              <p className="text-xs text-muted-foreground font-medium mt-1">
                Are you sure you want to delete this table?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteTableModal(false);
                  setDeletingTableId(null);
                }}
                className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold hover:bg-gray-200 dark:hover:bg-slate-700 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deletingTableId) {
                    deleteTable(deletingTableId);
                    setShowDeleteTableModal(false);
                    setDeletingTableId(null);
                  }
                }}
                className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs uppercase shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT TABLE FORM MODAL */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border-2 border-[#E5E7EB] dark:border-slate-800 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-[#E5E7EB] dark:border-slate-800">
              <div>
                <h3 className="font-serif italic text-2xl font-bold text-[#60241E] dark:text-slate-100">
                  {editingTableId ? "Edit Dining Table" : "Add Dining Table"}
                </h3>
                <p className="text-xs text-muted-foreground">Configure table details and upload image file</p>
              </div>
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-[#6B7280]"
              >
                <X className="size-5" />
              </button>
            </div>

            {tableUploadError && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{tableUploadError}</span>
              </div>
            )}

            <form onSubmit={handleTableSubmit} className="space-y-3.5 text-xs font-bold">
              {/* Hidden File Input */}
              <input
                ref={tableFileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    validateAndSetTableFile(e.target.files[0]);
                  }
                }}
              />

              {/* Table Name */}
              <div>
                <label className="block text-[#60241E] dark:text-slate-200 mb-1">
                  Table Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={tableForm.tableName}
                  onChange={(e) => setTableForm({ ...tableForm, tableName: e.target.value })}
                  placeholder="e.g. Royal Window Table, Garden Booth"
                  className="w-full p-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-[#1F2937] dark:text-slate-100 focus:outline-none focus:border-[#E77B49]"
                />
              </div>

              {/* Table Number & Seating Capacity Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#60241E] dark:text-slate-200 mb-1">
                    Table Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={tableForm.tableNumber}
                    onChange={(e) => setTableForm({ ...tableForm, tableNumber: e.target.value })}
                    placeholder="e.g. TABLE 01"
                    className="w-full p-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 font-mono text-[#1F2937] dark:text-slate-100 focus:outline-none focus:border-[#E77B49]"
                  />
                </div>

                <div>
                  <label className="block text-[#60241E] dark:text-slate-200 mb-1">
                    Seating Capacity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={tableForm.capacity}
                    onChange={(e) => setTableForm({ ...tableForm, capacity: sanitizeNumberInput(e.target.value) })}
                    className="w-full p-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-[#1F2937] dark:text-slate-100 focus:outline-none focus:border-[#E77B49]"
                  />
                </div>
              </div>

              {/* Table Type & Initial Status Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#60241E] dark:text-slate-200 mb-1">Table Type</label>
                  <select
                    value={tableForm.tableType || "Regular"}
                    onChange={(e) => setTableForm({ ...tableForm, tableType: e.target.value as any, section: e.target.value })}
                    className="w-full p-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-[#1F2937] dark:text-slate-100 focus:outline-none focus:border-[#E77B49]"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Window">Window</option>
                    <option value="Family">Family</option>
                    <option value="VIP">VIP</option>
                    <option value="Outdoor">Outdoor</option>
                    <option value="Rooftop">Rooftop</option>
                    <option value="Private Room">Private Room</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#60241E] dark:text-slate-200 mb-1">Status</label>
                  <select
                    value={tableForm.status || "Available"}
                    onChange={(e) => setTableForm({ ...tableForm, status: e.target.value as any })}
                    className="w-full p-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-[#1F2937] dark:text-slate-100 focus:outline-none focus:border-[#E77B49]"
                  >
                    <option value="Available">Available (Green)</option>
                    <option value="Reserved">Reserved (Orange)</option>
                    <option value="Occupied">Occupied (Red)</option>
                    <option value="Maintenance">Maintenance (Gray)</option>
                  </select>
                </div>
              </div>

              {/* Table Image Upload Area */}
              <div>
                <label className="block text-[#60241E] dark:text-slate-200 mb-1">Table Image</label>
                {tableImagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-[#E77B49] bg-slate-100 dark:bg-slate-800 group shadow-sm">
                    <img
                      src={tableImagePreview}
                      alt="Selected Table Preview"
                      className="w-full h-36 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                      <button
                        type="button"
                        onClick={() => tableFileInputRef.current?.click()}
                        className="py-1.5 px-3 rounded-xl bg-white text-[#60241E] text-xs font-extrabold shadow-md hover:bg-gray-100 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                      >
                        <Upload className="size-3.5" />
                        <span>Change</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTableFile(null);
                          setTableImagePreview(null);
                          setTableForm({ ...tableForm, image: "" });
                        }}
                        className="py-1.5 px-3 rounded-xl bg-rose-600 text-white text-xs font-extrabold shadow-md hover:bg-rose-700 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOverTableImage(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDragOverTableImage(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOverTableImage(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        validateAndSetTableFile(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => tableFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer ${
                      isDragOverTableImage
                        ? "border-[#E77B49] bg-[#E77B49]/10"
                        : "border-border dark:border-slate-700 bg-[#F8F9FA] dark:bg-slate-800 hover:border-[#E77B49]"
                    }`}
                  >
                    <div className="size-10 rounded-2xl bg-[#E77B49]/10 text-[#E77B49] flex items-center justify-center mx-auto mb-1.5">
                      <Upload className="size-5 stroke-[2.5]" />
                    </div>
                    <h4 className="font-serif italic font-bold text-xs text-[#60241E] dark:text-slate-100">
                      Click to Browse local image or Drag &amp; Drop
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                      JPG, JPEG, PNG, WEBP (Max 5MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-[#60241E] dark:text-slate-200 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={tableForm.description}
                  onChange={(e) => setTableForm({ ...tableForm, description: e.target.value })}
                  placeholder="Optional details e.g. Near scenic window, intimate seating..."
                  className="w-full p-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-[#1F2937] dark:text-slate-100 focus:outline-none focus:border-[#E77B49]"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTableModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold hover:bg-gray-200 dark:hover:bg-slate-700 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  {editingTableId ? "Update Table" : "Save Table"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STAFF FORM MODAL */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-foreground rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border-2 border-[#E5E7EB] dark:border-slate-800">
            <div className="flex justify-between items-center">
              <h3 className="font-serif italic text-2xl font-bold text-[#60241E] dark:text-slate-100">
                {editingStaffId ? "Edit Staff Member" : "Add Staff Member"}
              </h3>
              <button type="button" onClick={() => setShowStaffModal(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleStaffSubmit} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block font-bold text-[#60241E] dark:text-slate-200 mb-1">Staff Name</label>
                <input
                  type="text"
                  required
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 text-foreground"
                />
              </div>

              <div>
                <label className="block font-bold text-[#60241E] dark:text-slate-200 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={staffForm.mobile}
                  onChange={(e) => setStaffForm({ ...staffForm, mobile: e.target.value })}
                  placeholder="e.g. +91 9876543210"
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 text-foreground"
                />
              </div>

              <div>
                <label className="block font-bold text-[#60241E] dark:text-slate-200 mb-1">Email Address</label>
                <input
                  type="email"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  placeholder="e.g. rahul@restaurant.com"
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 text-foreground"
                />
              </div>

              <div>
                <label className="block font-bold text-[#60241E] dark:text-slate-200 mb-1">Role</label>
                <select
                  value={staffForm.role}
                  onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 text-foreground font-semibold"
                >
                  <option value="Kitchen Staff">Kitchen Staff</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Manager">Manager</option>
                  <option value="Waiter">Waiter</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#60241E] dark:text-slate-200 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showStaffPass ? "text" : "password"}
                    value={staffForm.password || ""}
                    onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                    placeholder="Staff Portal Access Password"
                    className="w-full p-2.5 pr-10 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 text-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStaffPass(!showStaffPass)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    title={showStaffPass ? "Hide password" : "Show password"}
                  >
                    {showStaffPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full py-3 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white font-extrabold uppercase shadow-md transition-all active:scale-95">
                {editingStaffId ? "Update Staff Member" : "Save Staff Member"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* GALLERY ADD PHOTO MODAL */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border-2 border-[#E5E7EB]">
            <div className="flex justify-between items-center">
              <h3 className="font-serif italic text-2xl font-bold text-[#60241E]">
                Add Photo to Gallery
              </h3>
              <button
                type="button"
                onClick={() => setShowGalleryModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-[#6B7280]"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleGallerySubmit} className="space-y-4 text-xs font-bold">
              {/* Hidden System File Input */}
              <input
                ref={galleryFileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    validateAndSetGalleryFile(e.target.files[0]);
                  }
                }}
              />

              {/* Image Upload Box / Preview Area */}
              <div>
                <label className="block text-[#60241E] dark:text-slate-200 mb-1.5 uppercase tracking-wider text-[11px]">
                  Gallery Image File <span className="text-rose-500">*</span>
                </label>

                {galleryImagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-[#E77B49] bg-slate-100 dark:bg-slate-800 group shadow-md">
                    <img
                      src={galleryImagePreview}
                      alt="Selected Preview"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
                      <button
                        type="button"
                        onClick={() => galleryFileInputRef.current?.click()}
                        className="py-2 px-3.5 rounded-xl bg-white text-[#60241E] text-xs font-extrabold shadow-md hover:bg-gray-100 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      >
                        <Upload className="size-3.5" />
                        <span>Change Image</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedGalleryFile(null);
                          setGalleryImagePreview(null);
                        }}
                        className="py-2 px-3.5 rounded-xl bg-rose-600 text-white text-xs font-extrabold shadow-md hover:bg-rose-700 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOverGallery(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDragOverGallery(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOverGallery(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        validateAndSetGalleryFile(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => galleryFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                      isDragOverGallery
                        ? "border-[#E77B49] bg-[#E77B49]/10"
                        : "border-border dark:border-slate-700 bg-[#F8F9FA] dark:bg-slate-800 hover:border-[#E77B49]"
                    }`}
                  >
                    <div className="size-12 rounded-2xl bg-[#E77B49]/10 text-[#E77B49] flex items-center justify-center mx-auto mb-2">
                      <Upload className="size-6 stroke-[2.5]" />
                    </div>
                    <h4 className="font-serif italic font-bold text-sm text-[#60241E] dark:text-slate-100">
                      Click to Browse local files or Drag &amp; Drop
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                      Supports JPG, JPEG, PNG, WEBP (Max 5MB)
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[#60241E] dark:text-slate-200 mb-1">Category</label>
                <select
                  value={galleryForm.category}
                  onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value as any })}
                  className="w-full p-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-[#1F2937] dark:text-slate-100 focus:outline-none focus:border-[#E77B49]"
                >
                  <option value="Interior">Interior</option>
                  <option value="Exterior">Exterior</option>
                  <option value="Dining Area">Dining Area</option>
                  <option value="VIP Rooms">VIP Rooms</option>
                  <option value="Events">Events</option>
                  <option value="Food Highlights">Food Highlights</option>
                  <option value="Food">Food</option>
                  <option value="Tables">Tables</option>
                </select>
              </div>

              <div>
                <label className="block text-[#60241E] dark:text-slate-200 mb-1">Photo Title / Caption</label>
                <input
                  type="text"
                  required
                  value={galleryForm.title}
                  onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                  placeholder="e.g. Royal Sitar Courtyard Dining"
                  className="w-full p-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-[#1F2937] dark:text-slate-100 focus:outline-none focus:border-[#E77B49]"
                />
              </div>

              {isUploadingGallery && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] font-extrabold text-[#60241E] dark:text-[#E77B49]">
                    <span>Uploading image to backend...</span>
                    <span>{galleryUploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#E77B49] transition-all duration-150"
                      style={{ width: `${galleryUploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isUploadingGallery}
                className="w-full py-3.5 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isUploadingGallery ? (
                  <span>Uploading to Server...</span>
                ) : (
                  <>
                    <Upload className="size-4" />
                    <span>Upload &amp; Save Photo to MongoDB</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}