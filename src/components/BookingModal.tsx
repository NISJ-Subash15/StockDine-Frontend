import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  Calendar,
  Users,
  Utensils,
  ShieldCheck,
  CreditCard,
  QrCode,
  ArrowRight,
  Download,
  Share2,
  Clock,
  Sparkles,
  RefreshCw,
  ChevronLeft,
  User as UserIcon,
} from "lucide-react";
import { RestaurantDetails, Table, Dish, formatCurrency, Booking, useStockDineStore } from "@/lib/stockdine-store";
import { Link } from "@tanstack/react-router";
import { api } from "@/lib/api";


interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: RestaurantDetails;
  availableTables: Table[];
  dishes: Dish[];
  preSelectedDish?: Dish | null;
  onConfirmBooking: (bookingData: {
    tableId: string;
    tableNumber: string;
    customerName: string;
    customerPhone: string;
    date: string;
    time: string;
    guests: number;
    selectedDishes: { [dishId: string]: number };
    totalAmount: number;
    advanceAmount: number;
    remainingAmount: number;
    paymentMethod: string;
  }) => Booking | Promise<Booking | any>;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  availableTables,
  dishes,
  preSelectedDish,
  onConfirmBooking,
}) => {
  const { authSession } = useStockDineStore();
  const isGuest = !authSession || !authSession.isLoggedIn;
  const userProfile = authSession?.profileData;

  // Modal Step State: 1 = Form & Summary, 2 = Payment Gateway, 3 = Confirmation Success
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [selectedTableId, setSelectedTableId] = useState<string>(
    availableTables[0]?.id || "t1"
  );
  const [customerName, setCustomerName] = useState(userProfile?.name || "");
  const [customerPhone, setCustomerPhone] = useState(userProfile?.mobile || userProfile?.email || "");
  const [bookingDate, setBookingDate] = useState("Tonight");
  const [bookingTime, setBookingTime] = useState("8:30 PM");
  const [guestCount, setGuestCount] = useState(2);

  useEffect(() => {
    if (userProfile) {
      if (userProfile.name) setCustomerName(userProfile.name);
      if (userProfile.mobile || userProfile.email) setCustomerPhone(userProfile.mobile || userProfile.email);
    }
  }, [userProfile]);

  const [selectedDishes, setSelectedDishes] = useState<{ [dishId: string]: number }>(
    preSelectedDish ? { [preSelectedDish.id]: 1 } : {}
  );

  // Payment Gateway State
  const [paymentMethod, setPaymentMethod] = useState<string>("UPI");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Completed Booking Result
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);

  if (!isOpen) return null;

  if (isGuest) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-5 text-center border-2 border-[#E5E7EB] relative animate-in fade-in zoom-in-95 duration-200">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-[#6B7280] p-2 rounded-full hover:bg-[#F8F9FA] transition-colors"
          >
            <X className="size-5" />
          </button>
          <div className="size-16 rounded-2xl bg-amber-100 text-[#E77B49] flex items-center justify-center mx-auto border-2 border-amber-200 shadow-sm">
            <ShieldCheck className="size-8" />
          </div>
          <div>
            <h3 className="font-serif italic text-2xl font-bold text-[#60241E]">
              Sign in to hold a table
            </h3>
            <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed font-medium">
              Hold Table requires an authenticated customer profile. Sign in with your registered mobile or email to hold tables using your verified account details.
            </p>
          </div>
          <Link
            to="/login"
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Sign In to Continue</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  const handleDishQty = (id: string, delta: number) => {
    const current = selectedDishes[id] || 0;
    const updated = Math.max(0, current + delta);
    const map = { ...selectedDishes };
    if (updated === 0) delete map[id];
    else map[id] = updated;
    setSelectedDishes(map);
  };

  const foodTotal = Object.entries(selectedDishes).reduce((sum, [id, qty]) => {
    const dish = dishes.find((d) => d.id === id);
    return sum + (dish ? (dish.discountPrice || dish.price) * qty : 0);
  }, 0);

  const tableFee = 150;
  const taxes = Math.round((foodTotal + tableFee) * 0.05);
  const grandTotal = foodTotal + tableFee + taxes;

  // Advance Payment calculation: 25% or minimum deposit
  const advanceAmount = Math.max(250, Math.round(grandTotal * 0.25));
  const remainingAmount = Math.max(0, grandTotal - advanceAmount);

  const selectedTableObj = availableTables.find((t) => t.id === selectedTableId) || availableTables[0];

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleExecutePayment = async () => {
    setIsProcessingPayment(true);
    setPaymentError(null);

    const bookingItems = Object.entries(selectedDishes).map(([dishId, qty]) => {
      const dishObj = dishes.find((d) => d.id === dishId);
      return {
        dishId,
        dishName: dishObj ? dishObj.name : "Dish",
        quantity: qty,
        price: dishObj ? (dishObj.discountPrice || dishObj.price) : 0,
      };
    });

    try {
      await api.bookings.create({
        customerName,
        customerPhone,
        restaurantId: restaurant.id,
        tableNumber: selectedTableObj ? selectedTableObj.tableNumber : "Table 01",
        guests: guestCount,
        bookingDate,
        bookingTime,
        bookedItems: bookingItems,
      });
    } catch (e) {
      console.log("Saving booking to local store fallback");
    }

    const booking = await onConfirmBooking({
      tableId: selectedTableObj ? selectedTableObj.id : "t1",
      tableNumber: selectedTableObj ? selectedTableObj.tableNumber : "Table 01",
      customerName,
      customerPhone,
      date: bookingDate,
      time: bookingTime,
      guests: guestCount,
      selectedDishes,
      totalAmount: grandTotal,
      advanceAmount,
      remainingAmount,
      paymentMethod,
    });

    setIsProcessingPayment(false);
    setCompletedBooking(booking);
    setStep(3);
  };

  const handleDownloadReceipt = () => {
    if (!completedBooking) return;
    const receiptText = `
STOCKDINE INVOICE RECEIPT
Booking ID: ${completedBooking.bookingId}
Payment Ref: ${completedBooking.paymentId}
Restaurant: ${completedBooking.restaurantName}
Date & Time: ${completedBooking.date} at ${completedBooking.time}
Table: ${completedBooking.tableNumber} (${completedBooking.guests || 2} Guests)
Customer: ${completedBooking.customerName} (${completedBooking.customerPhone})

--- PAYMENT BREAKDOWN ---
Advance Paid Now (${completedBooking.paymentMethod || "UPI"}): ${formatCurrency(completedBooking.advanceAmount)}
Remaining Balance (Pay at Venue): ${formatCurrency(completedBooking.remainingAmount)}
Total Reservation Value: ${formatCurrency(completedBooking.totalAmount)}
Status: CONFIRMED & RESERVED
`.trim();

    const blob = new Blob([receiptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `StockDine-Receipt-${completedBooking.bookingId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 text-[#1F2937] dark:text-slate-100 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 relative border-2 border-[#E5E7EB] dark:border-slate-800 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#6B7280] dark:text-slate-400 p-2 rounded-full hover:bg-[#F8F9FA] dark:hover:bg-slate-800 transition-colors z-10 cursor-pointer"
        >
          <X className="size-5" />
        </button>

        {/* STEP 1: SUMMARY & DETAILS FORM */}
        {step === 1 && (
          <form onSubmit={handleProceedToPayment} className="space-y-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#60241E] dark:text-[#E77B49] bg-[#60241E]/10 dark:bg-[#E77B49]/20 px-2.5 py-0.5 rounded-full border border-[#E77B49]/20">
                Step 1 of 2 — Reservation Details
              </span>
              <h3 className="font-serif italic text-2xl font-bold text-[#60241E] dark:text-slate-100 mt-1">
                Reserve Table at {restaurant.name}
              </h3>
            </div>

            {/* Restaurant Cover Header */}
            <div className="relative h-28 w-full rounded-2xl overflow-hidden border border-[#E5E7EB] dark:border-slate-800 shadow-xs">
              <img src={restaurant.coverImage} alt={restaurant.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex items-end">
                <p className="text-xs text-white font-bold">{restaurant.address}</p>
              </div>
            </div>

            {/* Verified Customer Information */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-[#F8F9FA] dark:bg-slate-800/80 border border-[#E5E7EB] dark:border-slate-700">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-extrabold uppercase text-[#60241E] dark:text-[#E77B49]">
                  Customer Details
                </label>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  <ShieldCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Authenticated Profile</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] text-[#6B7280] dark:text-slate-400 font-bold block">Name</span>
                  <input
                    type="text"
                    required
                    readOnly
                    value={customerName || userProfile?.name || "Authenticated Diner"}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 text-xs font-bold text-[#1F2937] dark:text-slate-100"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-[#6B7280] dark:text-slate-400 font-bold block">Mobile / Email</span>
                  <input
                    type="text"
                    required
                    readOnly
                    value={customerPhone || userProfile?.mobile || userProfile?.email || "Verified"}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[#E5E7EB] dark:border-slate-700 text-xs font-bold text-[#1F2937] dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Date, Time & Guests */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-extrabold uppercase text-[#60241E] mb-1">
                  Date
                </label>
                <select
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] text-xs font-semibold text-[#1F2937]"
                >
                  <option value="Tonight">Tonight</option>
                  <option value="Tomorrow">Tomorrow</option>
                  <option value="This Weekend">This Weekend</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-[#60241E] mb-1">
                  Time Slot
                </label>
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] text-xs font-semibold text-[#1F2937]"
                >
                  <option value="7:30 PM">7:30 PM</option>
                  <option value="8:30 PM">8:30 PM</option>
                  <option value="9:00 PM">9:00 PM</option>
                  <option value="9:30 PM">9:30 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-[#60241E] mb-1">
                  Guests
                </label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] text-xs font-semibold text-[#1F2937]"
                >
                  <option value={2}>2 Guests</option>
                  <option value={4}>4 Guests</option>
                  <option value={6}>6 Guests</option>
                  <option value={8}>8+ Guests</option>
                </select>
              </div>
            </div>

            {/* Table Selector */}
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#60241E] mb-1">
                Choose Table
              </label>
              <select
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
                className="w-full p-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] text-xs font-semibold text-[#1F2937]"
              >
                {availableTables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.tableNumber} — {t.tableName || "Dining Booth"} ({t.capacity} Guests • {t.location})
                  </option>
                ))}
              </select>
            </div>

            {/* Pre-order Dishes */}
            <div>
              <label className="block text-xs font-extrabold uppercase text-[#60241E] mb-1">
                Pre-Order Signature Food (Optional)
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                {dishes.slice(0, 3).map((d) => {
                  const qty = selectedDishes[d.id] || 0;
                  return (
                    <div
                      key={d.id}
                      className="p-2 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img src={d.image} alt={d.name} className="size-8 rounded-lg object-cover shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-[#1F2937] truncate">{d.name}</p>
                          <p className="text-[10px] text-[#60241E] font-bold">
                            {formatCurrency(d.discountPrice || d.price)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 bg-white border border-[#E77B49] rounded-lg px-2 py-0.5 shrink-0">
                        <button type="button" onClick={() => handleDishQty(d.id, -1)} className="text-[#E77B49] font-bold px-1">
                          -
                        </button>
                        <span className="text-xs font-bold">{qty}</span>
                        <button type="button" onClick={() => handleDishQty(d.id, 1)} className="text-[#E77B49] font-bold px-1">
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Advance Payment Breakdown */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-200 text-xs space-y-2">
              <div className="flex justify-between text-[#4B5563]">
                <span>Food Pre-Orders &amp; Service</span>
                <span>{formatCurrency(foodTotal)}</span>
              </div>
              <div className="flex justify-between text-[#4B5563]">
                <span>Table Reservation &amp; Taxes</span>
                <span>{formatCurrency(tableFee + taxes)}</span>
              </div>
              <div className="flex justify-between font-bold text-[#1F2937] border-t border-amber-200/80 pt-1">
                <span>Total Estimated Value</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>

              <div className="pt-2 border-t-2 border-dashed border-amber-300 space-y-1">
                <div className="flex justify-between items-center text-amber-900 font-extrabold text-sm">
                  <span className="flex items-center gap-1">
                    <Sparkles className="size-4 text-amber-600 fill-current" />
                    ADVANCE TO PAY NOW:
                  </span>
                  <span className="text-lg text-[#60241E]">{formatCurrency(advanceAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-800 text-[11px] font-bold">
                  <span>REMAINING BAL. (Pay at restaurant):</span>
                  <span>{formatCurrency(remainingAmount)}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Proceed to Pay Advance ({formatCurrency(advanceAmount)})</span>
              <ArrowRight className="size-4" />
            </button>
          </form>
        )}

        {/* STEP 2: ADVANCE PAYMENT GATEWAY */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-xs font-extrabold text-[#60241E]"
              >
                <ChevronLeft className="size-4" /> Back to Summary
              </button>
              <span className="text-[10px] font-extrabold uppercase text-[#60241E] bg-[#60241E]/10 px-2.5 py-0.5 rounded-full">
                Step 2 of 2 — Secure Payment
              </span>
            </div>

            <div>
              <h3 className="font-serif italic text-2xl font-bold text-[#60241E]">
                Pay Advance Amount
              </h3>
              <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                Pay <strong>{formatCurrency(advanceAmount)}</strong> now to hold your table reservation.
              </p>
            </div>

            {/* Payment Method Options */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase text-[#60241E] block">
                Select Advance Payment Method
              </label>

              {[
                { id: "UPI", title: "UPI (Google Pay, PhonePe, Paytm)", icon: "📱" },
                { id: "Credit Card", title: "Credit Card / Debit Card", icon: "💳" },
                { id: "Net Banking", title: "Net Banking (All Major Banks)", icon: "🏦" },
                { id: "Wallets", title: "Digital Wallets", icon: "👛" },
              ].map((m) => (
                <label
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === m.id
                      ? "border-[#E77B49] bg-amber-50/60 shadow-xs"
                      : "border-[#E5E7EB] bg-[#F8F9FA]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{m.icon}</span>
                    <span className="text-xs font-bold text-[#1F2937]">{m.title}</span>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id)}
                    className="accent-[#E77B49]"
                  />
                </label>
              ))}
            </div>

            {/* Clear Payment Policy Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-[11px] text-emerald-900 font-semibold space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>Advance Payment Policy Guarantee:</span>
              </div>
              <p className="text-emerald-800 leading-relaxed">
                • <strong>{formatCurrency(advanceAmount)}</strong> advance will be paid now.
                <br />• Remaining <strong>{formatCurrency(remainingAmount)}</strong> is paid directly at restaurant after dining.
              </p>
            </div>

            {paymentError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-2xl font-bold flex items-center justify-between">
                <span>{paymentError}</span>
                <button
                  type="button"
                  onClick={handleExecutePayment}
                  className="px-3 py-1 bg-rose-600 text-white rounded-xl text-[11px]"
                >
                  Retry
                </button>
              </div>
            )}

            {isProcessingPayment ? (
              <div className="py-8 text-center space-y-3">
                <RefreshCw className="size-8 text-[#E77B49] animate-spin mx-auto" />
                <p className="text-xs font-extrabold text-[#60241E]">
                  Processing Advance Payment of {formatCurrency(advanceAmount)}...
                </p>
                <p className="text-[10px] text-[#6B7280]">
                  Connecting to secure bank gateway. Please do not refresh.
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleExecutePayment}
                className="w-full py-3.5 rounded-2xl bg-[#E77B49] hover:bg-[#D66A38] text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition-all active:scale-95"
              >
                Pay {formatCurrency(advanceAmount)} Advance Now
              </button>
            )}
          </div>
        )}

        {/* STEP 3: BOOKING SUCCESS PAGE */}
        {step === 3 && completedBooking && (
          <div className="text-center space-y-5 py-2 animate-in zoom-in-95 duration-300">
            {/* Success Icon */}
            <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-md">
              <CheckCircle2 className="size-10 animate-bounce" />
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                Advance Paid • Booking Confirmed
              </span>
              <h3 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#60241E] mt-2">
                Reservation Confirmed!
              </h3>
              <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                Booking ID: <strong className="text-[#60241E] font-mono">{completedBooking.bookingId}</strong>
              </p>
            </div>

            {/* QR Code for Check-in */}
            <div className="bg-[#F8F9FA] border-2 border-[#E5E7EB] rounded-2xl p-4 space-y-2 flex flex-col items-center">
              <img
                src={completedBooking.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${completedBooking.bookingId}`}
                alt="Check-in QR Code"
                className="size-32 rounded-xl border border-[#E5E7EB] shadow-xs"
              />
              <p className="text-[11px] font-bold text-[#60241E] flex items-center gap-1">
                <QrCode className="size-3.5 text-[#E77B49]" /> Show QR Code at Restaurant Desk
              </p>
            </div>

            {/* Reservation Pass Summary */}
            <div className="p-4 rounded-2xl bg-[#F8F9FA] text-xs font-medium space-y-2 text-left border-2 border-[#E5E7EB]">
              <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
                <div>
                  <p className="font-bold text-[#60241E] text-sm">{completedBooking.restaurantName}</p>
                  <p className="text-[11px] text-[#6B7280]">{completedBooking.tableNumber} • {completedBooking.guests || 2} Guests</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#1F2937]">{completedBooking.date}</p>
                  <p className="text-[11px] text-[#E77B49] font-bold">{completedBooking.time}</p>
                </div>
              </div>

              <div className="space-y-1 text-[11px] pt-1">
                <div className="flex justify-between text-[#1F2937]">
                  <span>Advance Paid ({completedBooking.paymentMethod || "UPI"}):</span>
                  <span className="font-bold text-[#60241E]">{formatCurrency(completedBooking.advanceAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>Remaining Amount to Pay at Restaurant:</span>
                  <span>{formatCurrency(completedBooking.remainingAmount)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="py-2.5 px-3 rounded-2xl bg-white border border-[#D1D5DB] text-[#1F2937] text-xs font-extrabold hover:bg-[#F8F9FA] transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Download className="size-3.5 text-[#60241E]" />
                <span>Download Receipt</span>
              </button>

              <Link
                to="/customer/bookings"
                className="py-2.5 px-3 rounded-2xl bg-[#60241E] hover:bg-[#4A1B17] text-white text-xs font-extrabold text-center transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>View My Bookings</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
