import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Clock,
  MapPin,
  QrCode,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Download,
  Star,
  Sparkles,
  X,
  RotateCcw,
  AlertCircle,
  Building2,
  Calendar,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStockDineStore, Booking, formatCurrency, RestaurantDetails } from "@/lib/stockdine-store";
import { api } from "@/lib/api";
import { ReviewModal } from "@/components/ReviewModal";
import { GuestAuthModal } from "@/components/GuestAuthModal";


export const Route = createFileRoute("/customer/bookings")({
  head: () => ({
    meta: [
      { title: "My Bookings — StockDine" },
      { name: "description", content: "Manage upcoming reservations, view advance payments, check-in QR pass, and review dining visits." },
    ],
  }),
  component: BookingsPage,
});

function BookingsPage() {
  const navigate = useNavigate();
  const { bookings: storeBookings, updateBookingStatus, getAllRestaurantProfiles, authSession } = useStockDineStore();

  const isGuest = !authSession || !authSession.isLoggedIn;
  const [backendBookings, setBackendBookings] = useState<any[]>([]);

  useEffect(() => {
    async function loadBookings() {
      try {
        const res: any = await api.bookings.getMyBookings();
        if (res.success && res.bookings) {
          setBackendBookings(res.bookings);
        }
      } catch (err) {
        console.log("Using store bookings fallback");
      }
    }
    if (!isGuest) {
      loadBookings();
    }
  }, [isGuest]);

  const bookings = backendBookings.length > 0 ? backendBookings.map(b => ({
    bookingId: b._id,
    paymentId: "#PAY-" + Math.floor(1000 + Math.random() * 9000),
    restaurantId: b.restaurant?._id || b.restaurant,
    restaurantName: b.restaurant?.restaurantName || "StockDine Restaurant",
    customerName: b.customerName,
    customerPhone: b.customerPhone || "",
    items: b.bookedItems ? b.bookedItems.map((bi: any) => ({
      dishId: bi.dish?._id || bi.dish,
      name: bi.dishName,
      price: bi.price,
      quantity: bi.quantity
    })) : [],
    tableId: b.tableNumber,
    tableNumber: b.tableNumber,
    date: b.bookingDate,
    time: b.bookingTime,
    guests: b.guests,
    totalAmount: b.totalAmount,
    advanceAmount: Math.round(b.totalAmount * 0.2),
    remainingAmount: Math.round(b.totalAmount * 0.8),
    paymentStatus: b.paymentStatus,
    bookingStatus: b.bookingStatus,
    qrCodeUrl: b.qrCode,
    createdAt: new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })) : storeBookings;

  const restaurantMap = getAllRestaurantProfiles();

  // Tab State: Upcoming vs Completed/History
  const [activeTab, setActiveTab] = useState<"Upcoming" | "Completed" | "Cancelled">("Upcoming");

  // Selected QR Modal
  const [selectedQrBooking, setSelectedQrBooking] = useState<Booking | null>(null);

  // Selected Booking for Review
  const [reviewTargetRestaurant, setReviewTargetRestaurant] = useState<RestaurantDetails | null>(null);
  const [reviewTargetBookingId, setReviewTargetBookingId] = useState<string | undefined>(undefined);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Cancel Confirmation Modal
  const [cancelBookingTarget, setCancelBookingTarget] = useState<Booking | null>(null);

  // Separate Bookings by Tab Status
  const upcomingBookings = bookings.filter(
    (b) => b.bookingStatus === "Confirmed" || b.bookingStatus === "Accepted" || b.bookingStatus === "Preparing" || b.bookingStatus === "Ready"
  );

  const completedBookings = bookings.filter((b) => b.bookingStatus === "Completed");
  const cancelledBookings = bookings.filter((b) => b.bookingStatus === "Cancelled" || b.bookingStatus === "Rejected");

  const displayCompleted: Booking[] = completedBookings;

  const handleDownloadReceipt = (b: Booking) => {
    const receiptText = `
STOCKDINE INVOICE RECEIPT
Booking ID: ${b.bookingId}
Payment Ref: ${b.paymentId}
Restaurant: ${b.restaurantName}
Date & Time: ${b.date} at ${b.time}
Table: ${b.tableNumber} (${b.guests || 2} Guests)
Customer: ${b.customerName} (${b.customerPhone})

--- ADVANCE PAYMENT SUMMARY ---
Advance Amount Paid (${b.paymentMethod || "UPI"}): ${formatCurrency(b.advanceAmount)}
Remaining Amount Paid at Venue: ${formatCurrency(b.remainingAmount || Math.max(0, b.totalAmount - b.advanceAmount))}
Total Reservation Value: ${formatCurrency(b.totalAmount)}
Booking Status: ${b.bookingStatus.toUpperCase()}
`.trim();

    const blob = new Blob([receiptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `StockDine-Receipt-${b.bookingId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirmCancel = () => {
    if (!cancelBookingTarget) return;
    updateBookingStatus(cancelBookingTarget.bookingId, "Cancelled");
    setCancelBookingTarget(null);
  };

  const handleOpenReview = (b: Booking) => {
    const rest = restaurantMap[b.restaurantId] || Object.values(restaurantMap)[0];
    setReviewTargetRestaurant(rest);
    setReviewTargetBookingId(b.bookingId);
    setShowReviewModal(true);
  };

  const activeDisplayList =
    activeTab === "Upcoming"
      ? upcomingBookings
      : activeTab === "Completed"
      ? displayCompleted
      : cancelledBookings;

  if (isGuest) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] dark:bg-slate-950 flex items-center justify-center p-4">
        <GuestAuthModal isOpen={true} onClose={() => navigate({ to: "/customer" })} />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 pt-8 max-w-2xl mx-auto pb-28 selection:bg-[#E77B49] selection:text-white bg-[#FFFFFF] dark:bg-slate-950 text-[#1F2937] dark:text-slate-100 min-h-screen transition-colors duration-300">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/customer" })}
            className="p-2.5 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800 border border-[#E5E7EB] dark:border-slate-700 text-[#1F2937] dark:text-slate-200 hover:bg-[#E5E7EB] dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer"
            title="Go back"
          >
            <ArrowLeft className="size-4 text-[#60241E] dark:text-[#E77B49]" />
          </button>
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#E77B49] font-extrabold">
              My Reservations
            </p>
            <h1 className="font-serif italic text-3xl sm:text-4xl font-bold text-[#60241E] dark:text-slate-100">
              My Bookings
            </h1>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Tab Filter Navigation */}
      <div className="flex items-center gap-2 bg-[#F8F9FA] dark:bg-slate-900 p-1.5 rounded-2xl border-2 border-[#E5E7EB] dark:border-slate-800 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("Upcoming")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all text-center cursor-pointer ${
            activeTab === "Upcoming"
              ? "bg-[#60241E] dark:bg-[#E77B49] text-white shadow-md"
              : "text-[#6B7280] dark:text-slate-400 hover:text-[#1F2937] dark:hover:text-slate-100"
          }`}
        >
          Upcoming ({upcomingBookings.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("Completed")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all text-center cursor-pointer ${
            activeTab === "Completed"
              ? "bg-[#60241E] dark:bg-[#E77B49] text-white shadow-md"
              : "text-[#6B7280] dark:text-slate-400 hover:text-[#1F2937] dark:hover:text-slate-100"
          }`}
        >
          Completed ({displayCompleted.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("Cancelled")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all text-center cursor-pointer ${
            activeTab === "Cancelled"
              ? "bg-[#60241E] dark:bg-[#E77B49] text-white shadow-md"
              : "text-[#6B7280] dark:text-slate-400 hover:text-[#1F2937] dark:hover:text-slate-100"
          }`}
        >
          Cancelled ({cancelledBookings.length})
        </button>
      </div>

      {/* Bookings List */}
      {activeDisplayList.length > 0 ? (
        <div className="space-y-4 mb-8">
          {activeDisplayList.map((b) => {
            const isCompleted = b.bookingStatus === "Completed";
            const isCancelled = b.bookingStatus === "Cancelled" || b.bookingStatus === "Rejected";
            const remainingDue = b.remainingAmount || Math.max(0, b.totalAmount - b.advanceAmount);

            return (
              <div
                key={b.bookingId}
                className="bg-white dark:bg-slate-900 border-2 border-[#E5E7EB] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full mb-2 border ${
                        isCompleted
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                          : isCancelled
                          ? "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800"
                          : "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                      }`}
                    >
                      <Clock className="size-3" />
                      Status: {b.bookingStatus}
                    </span>
                    <h2 className="font-serif italic text-2xl font-bold text-[#60241E] dark:text-slate-100">
                      {b.restaurantName}
                    </h2>
                    <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-0.5 flex items-center gap-1 font-semibold">
                      <MapPin className="size-3.5 text-[#E77B49]" /> {b.tableNumber} • {b.date}, {b.time} ({b.guests || 2} Guests)
                    </p>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="text-[11px] font-mono font-bold bg-[#60241E] dark:bg-[#E77B49] text-white px-3 py-1 rounded-xl shadow-xs">
                      {b.bookingId}
                    </span>
                    <span className="text-[10px] font-mono text-[#6B7280] dark:text-slate-400">
                      Ref: {b.paymentId}
                    </span>
                  </div>
                </div>

                {/* Reserved Food Items */}
                {b.items && b.items.length > 0 && (
                  <div className="space-y-1.5 py-3 border-y border-[#E5E7EB] dark:border-slate-800 text-xs">
                    <span className="text-[10px] font-extrabold uppercase text-[#60241E] dark:text-[#E77B49] block">
                      Pre-Ordered Items:
                    </span>
                    {b.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-[#4B5563] dark:text-slate-300">
                        <span>{item.name} × {item.quantity}</span>
                        <span className="font-bold text-[#60241E] dark:text-slate-100">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Advance vs Remaining Payment Breakdown */}
                <div className="p-3.5 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800/60 border border-[#E5E7EB] dark:border-slate-700 space-y-1 text-xs">
                  <div className="flex justify-between text-[#1F2937] dark:text-slate-200 font-semibold">
                    <span>Advance Paid ({(b as any).paymentMethod || "UPI"}):</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(b.advanceAmount)}</span>
                  </div>
                  <div className="flex justify-between text-[#60241E] dark:text-[#E77B49] font-bold">
                    <span>Remaining Amount (To pay at restaurant):</span>
                    <span>{formatCurrency(remainingDue)}</span>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {!isCancelled && (
                    <button
                      type="button"
                      onClick={() => setSelectedQrBooking(b)}
                      className="py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-[#E5E7EB] dark:border-slate-700 hover:bg-[#F8F9FA] dark:hover:bg-slate-700 text-[#1F2937] dark:text-slate-200 text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <QrCode className="size-4 text-[#E77B49]" />
                      <span>Check-in QR Pass</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDownloadReceipt(b)}
                    className="py-2.5 px-3.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-[#E5E7EB] dark:border-slate-700 hover:bg-[#F8F9FA] dark:hover:bg-slate-700 text-[#1F2937] dark:text-slate-200 text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Download className="size-4 text-[#60241E]" />
                    <span>Receipt</span>
                  </button>

                  {/* Upcoming Actions */}
                  {!isCompleted && !isCancelled && (
                    <button
                      type="button"
                      onClick={() => setCancelBookingTarget(b)}
                      className="py-2.5 px-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-extrabold transition-all ml-auto"
                    >
                      Cancel Hold
                    </button>
                  )}

                  {/* Completed Review Action */}
                  {isCompleted && (
                    <div className="flex items-center gap-2 ml-auto">
                      {(b as any).isReviewed ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="size-3.5" /> Reviewed
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenReview(b)}
                          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                        >
                          <Sparkles className="size-3.5 fill-current" />
                          <span>Rate &amp; Review</span>
                        </button>
                      )}

                      <Link
                        to="/customer/restaurant/$restaurantId"
                        params={{ restaurantId: b.restaurantId }}
                        className="py-2.5 px-3.5 rounded-xl bg-[#60241E] text-white text-xs font-extrabold flex items-center gap-1"
                      >
                        <RotateCcw className="size-3.5" />
                        <span>Rebook</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#F8F9FA] border-2 border-dashed border-[#E5E7EB] rounded-3xl p-10 text-center text-[#6B7280] space-y-3">
          <Calendar className="size-10 text-[#E77B49] mx-auto opacity-60" />
          <h3 className="font-serif italic text-xl font-bold text-[#60241E]">
            No {activeTab} Bookings Found
          </h3>
          <p className="text-xs font-medium max-w-sm mx-auto">
            Explore nearby partner restaurants or signature dishes to reserve a dining table.
          </p>
          <Link
            to="/customer"
            className="inline-block py-3 px-6 rounded-2xl bg-[#E77B49] text-white text-xs font-extrabold uppercase tracking-wider shadow-md hover:bg-[#D66A38] transition-all"
          >
            Explore Restaurants Near You
          </Link>
        </div>
      )}

      {/* QR Code Check-in Pass Modal */}
      {selectedQrBooking && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 relative border-2 border-[#E5E7EB] dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setSelectedQrBooking(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-[#6B7280] dark:text-slate-400 cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-[#E77B49] bg-[#E77B49]/10 px-3 py-1 rounded-full border border-[#E77B49]/20">
                Desk Check-in Pass
              </span>
              <h3 className="font-serif italic text-2xl font-bold text-[#60241E] dark:text-slate-100">
                {selectedQrBooking.restaurantName}
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-slate-400">
                {selectedQrBooking.tableNumber} • {selectedQrBooking.date} at {selectedQrBooking.time}
              </p>
            </div>

            <div className="bg-[#F8F9FA] dark:bg-slate-800/80 border-2 border-[#E5E7EB] dark:border-slate-700 p-4 rounded-2xl flex flex-col items-center">
              <img
                src={selectedQrBooking.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${selectedQrBooking.bookingId}`}
                alt="QR Code Pass"
                className="size-40 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white p-1"
              />
              <span className="text-xs font-mono font-bold text-[#60241E] dark:text-[#E77B49] mt-2">
                ID: {selectedQrBooking.bookingId}
              </span>
            </div>

            <div className="text-xs text-[#4B5563] dark:text-slate-300 space-y-1 font-medium bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-200 dark:border-amber-900/50 text-left">
              <div className="flex justify-between">
                <span>Advance Paid:</span>
                <span className="font-bold text-[#60241E] dark:text-[#E77B49]">{formatCurrency(selectedQrBooking.advanceAmount)}</span>
              </div>
              <div className="flex justify-between text-emerald-800 dark:text-emerald-400 font-bold">
                <span>Remaining to Pay at Venue:</span>
                <span>{formatCurrency(selectedQrBooking.remainingAmount || Math.max(0, selectedQrBooking.totalAmount - selectedQrBooking.advanceAmount))}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedQrBooking(null)}
              className="w-full py-3 rounded-2xl bg-[#60241E] dark:bg-[#E77B49] hover:bg-[#4A1B17] dark:hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider cursor-pointer"
            >
              Close QR Pass
            </button>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelBookingTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 border-2 border-[#E5E7EB] animate-in zoom-in-95 duration-200">
            <AlertCircle className="size-12 text-rose-500 mx-auto" />
            <h3 className="font-serif italic text-2xl font-bold text-[#60241E]">
              Cancel Reservation?
            </h3>
            <p className="text-xs text-[#4B5563] font-medium leading-relaxed">
              Are you sure you want to cancel booking <strong>{cancelBookingTarget.bookingId}</strong> for {cancelBookingTarget.restaurantName}?
              <br />
              Advance payment of <strong>{formatCurrency(cancelBookingTarget.advanceAmount)}</strong> will be refunded to your original payment method.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelBookingTarget(null)}
                className="py-3 rounded-2xl bg-[#F8F9FA] text-[#4B5563] text-xs font-extrabold border border-[#D1D5DB]"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md"
              >
                Yes, Cancel &amp; Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && reviewTargetRestaurant && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          restaurant={reviewTargetRestaurant}
          bookingId={reviewTargetBookingId}
          onSuccess={() => {
            setShowReviewModal(false);
          }}
        />
      )}
    </div>
  );
}