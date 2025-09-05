import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { FaStar, FaTimes } from "react-icons/fa";
import { apiFetch } from "../../lib/api";
import { toast } from "react-toastify";

export default function ReviewModal({ isOpen, onClose, targetUser, type, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      setLoading(true);
      
      const reviewData = {
        reviewType: type === "landlord" ? "landlord_review" : "tenant_review",
        rating,
        comment: comment.trim(),
        reviewedUser: targetUser._id
      };
      
      console.log("Submitting review with data:", reviewData);
      
      const response = await apiFetch("/reviews", {
        method: "POST",
        body: JSON.stringify(reviewData)
      });

      console.log("Review submission response:", response);
      toast.success("Review submitted successfully!");
      onSubmit();
      resetForm();
    } catch (error) {
      console.error("Error submitting review:", error);
      
      // Handle specific error cases
      if (error.message && error.message.includes("duplicate")) {
        toast.error("You have already reviewed this user. You can only review each person once.");
      } else if (error.message && error.message.includes("cannot review themselves")) {
        toast.error("You cannot review yourself.");
      } else if (error.message && error.message.includes("Validation error")) {
        toast.error("Please check your review details and try again.");
      } else {
        toast.error("Failed to submit review. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setComment("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Leave a Review
          </h2>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </Button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Reviewing: <span className="font-semibold">{targetUser?.name}</span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {type === "tenant" ? "Tenant Review" : "Property Review"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rating *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl transition-colors ${
                    star <= rating
                      ? "text-yellow-400 hover:text-yellow-500"
                      : "text-gray-300 hover:text-gray-400"
                  }`}
                >
                  <FaStar />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {rating > 0 && `${rating} out of 5 stars`}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Comment *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={`Share your experience with ${targetUser?.name}...`}
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              isLoading={loading}
              disabled={rating === 0 || !comment.trim()}
            >
              {loading ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
