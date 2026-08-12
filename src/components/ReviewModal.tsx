import React, { useState } from "react";
import { Star, X, Sparkles, Camera, CheckCircle2, Award, ThumbsUp } from "lucide-react";
import { useStockDineStore, RestaurantDetails } from "@/lib/stockdine-store";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: RestaurantDetails;
  bookingId?: string;
  customerName?: string;
  onSuccess?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  bookingId,
  customerName,
  onSuccess,
}) => {
  const { addReviewWithReward, authSession } = useStockDineStore();
  const activeCustomerName = customerName || authSession?.profileData?.name || "Verified Diner";

  const [overallRating, setOverallRating] = useState<number>(5);
  const [foodRating, setFoodRating] = useState<number>(5);
  const [serviceRating, setServiceRating] = useState<number>(5);
  const [ambienceRating, setAmbienceRating] = useState<number>(5);
  const [cleanlinessRating, setCleanlinessRating] = useState<number>(5);
  const [valueRating, setValueRating] = useState<number>(5);

  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRewardSuccess, setShowRewardSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAddSamplePhoto = () => {
    const samplePhotos = [
      restaurant.coverImage,
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=400",
    ];
    const nextPhoto = samplePhotos[photos.length % samplePhotos.length];
    setPhotos([...photos, nextPhoto]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      addReviewWithReward(
        {
          restaurantId: restaurant.id,
          customerName: activeCustomerName,
          customerAvatar:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
          rating: overallRating,
          foodRating,
          serviceRating,
          ambienceRating,
          cleanlinessRating,
          valueRating,
          comment: comment || "Wonderful dining experience with exceptional service and food quality!",
          photos,
          verifiedDiner: true,
        }
      );

      setIsSubmitting(false);
      setShowRewardSuccess(true);

      setTimeout(() => {
        setShowRewardSuccess(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 2200);
    }, 600);
  };

  const CategoryStarPicker = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
  }) => (
    <div className="flex items-center justify-between py-1.5 border-b border-[#E5E5E5] last:border-none">
      <span className="text-xs font-semibold text-[#333333]">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform cursor-pointer"
          >
            <Star
              className={`size-4 ${
                star <= value ? "fill-[#d2d0c1] text-[#d2d0c1]" : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border border-[#E5E5E5] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4 sd-modal-pop relative">
        {/* Header */}
        <div className="bg-[#111111] text-white p-5 flex items-center justify-between relative border-b border-[#E5E5E5]">
          <div className="flex items-center gap-3">
            <img
              src={restaurant.logo || restaurant.coverImage}
              alt={restaurant.name}
              className="size-12 rounded-xl object-cover border border-white/40 shadow-sm bg-white"
            />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/80 bg-white/20 px-2.5 py-0.5 rounded-full">
                Verified Diner Review
              </span>
              <h3 className="font-serif italic text-xl font-bold text-white mt-0.5">
                Rate {restaurant.name}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {showRewardSuccess ? (
          <div className="p-8 text-center space-y-4 sd-scale-in">
            <div className="size-16 rounded-full bg-[#F5F5F5] text-[#d2d0c1] flex items-center justify-center mx-auto border border-[#E5E5E5] shadow-md sd-scale-in">
              <CheckCircle2 className="size-10 text-[#d2d0c1]" />
            </div>
            <h3 className="font-serif italic text-2xl font-bold text-[#111111]">
              Thank You for Your Review!
            </h3>
            <div className="bg-[#F5F5F5] border border-[#E5E5E5] rounded-2xl p-4 space-y-1">
              <p className="text-xs font-bold text-[#111111]">
                Your feedback has been published successfully and shared with {restaurant.name}.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-5">
            {/* Overall Star Rating */}
            <div className="text-center space-y-2 py-2 bg-[#F5F5F5] rounded-2xl border border-[#E5E5E5]">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#111111] block">
                Overall Experience Rating
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setOverallRating(star)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`size-7 ${
                        star <= overallRating ? "fill-[#d2d0c1] text-[#d2d0c1]" : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-[#111111] block">
                {overallRating === 5
                  ? "⭐⭐⭐⭐⭐ Excellent"
                  : overallRating === 4
                  ? "⭐⭐⭐⭐ Very Good"
                  : overallRating === 3
                  ? "⭐⭐⭐ Good"
                  : overallRating === 2
                  ? "⭐⭐ Fair"
                  : "⭐ Poor"}
              </span>
            </div>

            {/* Detailed Category Ratings */}
            <div className="space-y-1 bg-[#F5F5F5] rounded-2xl p-3 border border-[#E5E5E5]">
              <span className="text-[11px] font-extrabold uppercase text-[#111111] block mb-2">
                Category Ratings
              </span>
              <CategoryStarPicker label="Food Quality" value={foodRating} onChange={setFoodRating} />
              <CategoryStarPicker label="Service Hospitality" value={serviceRating} onChange={setServiceRating} />
              <CategoryStarPicker label="Ambience & Music" value={ambienceRating} onChange={setAmbienceRating} />
              <CategoryStarPicker label="Cleanliness & Hygiene" value={cleanlinessRating} onChange={setCleanlinessRating} />
              <CategoryStarPicker label="Value for Money" value={valueRating} onChange={setValueRating} />
            </div>

            {/* Text Review */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#111111] block">
                Share your dining experience
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Loved the table setup, prompt service, and signature dishes..."
                className="w-full p-3 rounded-2xl border border-[#E5E5E5] text-xs text-[#111111] placeholder:text-[#737373] focus:outline-none focus:border-[#111111]"
              />
            </div>

            {/* Photo Upload Simulator */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-[#111111]">Upload Dining Photos (Optional)</label>
                <button
                  type="button"
                  onClick={handleAddSamplePhoto}
                  className="text-xs font-extrabold text-[#d2d0c1] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="size-3.5" />
                  <span>+ Attach Photo</span>
                </button>
              </div>

              {photos.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {photos.map((p, idx) => (
                    <div key={idx} className="relative size-14 rounded-xl overflow-hidden border border-[#E5E5E5] shrink-0">
                      <img src={p} alt="Dining photo preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                        className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5 cursor-pointer"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-2xl bg-[#F5F5F5] hover:bg-[#E5E5E5] text-[#111111] font-extrabold text-xs transition-all border border-[#E5E5E5] cursor-pointer"
              >
                Skip for Now
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="py-3 px-4 rounded-2xl bg-[#111111] hover:bg-[#333333] text-white font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="size-4 text-[#d2d0c1]" />
                <span>{isSubmitting ? "Submitting..." : "Submit Review"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
