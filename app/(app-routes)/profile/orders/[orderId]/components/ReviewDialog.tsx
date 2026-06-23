"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Star } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog";
import { Textarea } from "@/components/shared/ui/textarea";
import { Button } from "@/components/shared/ui/button";
import { createReview } from "../../actions";

interface ReviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  productId: number;
  productName: string;
}

export default function ReviewDialog({
  isOpen,
  onOpenChange,
  productId,
  productName,
}: ReviewDialogProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>("");
  const [errors, setErrors] = useState<{
    rating?: string;
    review?: string;
  }>({});

  const validateForm = () => {
    const newErrors: { rating?: string; review?: string } = {};

    if (rating === 0) {
      newErrors.rating = t("review.ratingRequired") || "Please select a rating";
    }

    if (review.trim().length < 10) {
      newErrors.review =
        t("review.reviewMinLength") || "Review must be at least 10 characters";
    }

    if (review.length > 500) {
      newErrors.review =
        t("review.reviewMaxLength") || "Review must not exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createReview({
        product_id: productId,
        rating,
        review,
      });

      if (result.success) {
        toast.success(
          t("review.success") || "Review submitted successfully!"
        );
        onOpenChange(false);
        setRating(0);
        setReview("");
        setErrors({});
      } else {
        toast.error(
          result.message || t("review.error") || "Failed to submit review"
        );
      }
    } catch (error) {
      toast.error(t("review.error") || "Failed to submit review");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {t("review.writeReview") || "Write a Review"}
          </DialogTitle>
          <DialogDescription>
            {t("review.reviewFor") || "Review for"}: {productName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Rating Section */}
          <div>
            <label className="block text-sm font-medium mb-3">
              {t("review.rating") || "Rating"}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    setRating(star);
                    setErrors({ ...errors, rating: "" });
                  }}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(null)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={`${(hoveredRating || rating) >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                      } transition-colors`}
                  />
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="text-sm text-destructive mt-2">{errors.rating}</p>
            )}
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("review.message") || "Your Review"}
            </label>
            <Textarea
              placeholder={
                t("review.placeholder") ||
                "Share your experience with this product..."
              }
              className="min-h-[120px] resize-none"
              value={review}
              onChange={(e) => {
                setReview(e.target.value);
                if (errors.review) {
                  setErrors({ ...errors, review: "" });
                }
              }}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {review.length}/500 {t("common.characters") || "characters"}
            </p>
            {errors.review && (
              <p className="text-sm text-destructive mt-2">{errors.review}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setRating(0);
                setReview("");
                setErrors({});
              }}
              disabled={isSubmitting}
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t("common.submitting") || "Submitting..."
                : t("review.submit") || "Submit Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
