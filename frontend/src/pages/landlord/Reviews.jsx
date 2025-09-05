import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import { apiFetch } from "../../lib/api";
import { FaStar, FaUser, FaCalendarAlt, FaHome } from "react-icons/fa";
import Button from "../../components/ui/Button";

export default function LandlordReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const profile = await apiFetch("/users/profile");
        setUserProfile(profile);
        console.log("Landlord profile:", profile);
        
        if (profile?._id) {
          console.log("Fetching reviews for landlord ID:", profile._id);
          const reviewsData = await apiFetch(`/reviews/user/${profile._id}`);
          console.log("Reviews data:", reviewsData);
          setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const profile = await apiFetch("/users/profile");
      setUserProfile(profile);
      console.log("Landlord profile:", profile);
      
      if (profile?._id) {
        console.log("Fetching reviews for landlord ID:", profile._id);
        const reviewsData = await apiFetch(`/reviews/user/${profile._id}`);
        console.log("Reviews data:", reviewsData);
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      }
    } catch (err) {
      console.error("Failed to refresh reviews:", err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getRatingStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {rating}/5
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reviews</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Reviews from tenants and other users
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      ) : reviews.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500 dark:text-gray-400">
            <FaHome className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
            <p className="text-sm">
              You haven't received any reviews yet. Reviews will appear here once tenants leave feedback.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review._id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <FaUser className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {review.reviewer?.name || "Anonymous"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {review.reviewType === "landlord_review" ? "Landlord Review" : "Tenant Review"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {getRatingStars(review.rating)}
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                    <FaCalendarAlt className="w-3 h-3" />
                    {formatDate(review.createdAt)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {review.title && (
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {review.title}
                  </h4>
                )}
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {review.comment}
                </p>
                {review.property && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <strong>Property:</strong> {review.property.title}
                    {review.property.location && ` • ${review.property.location}`}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
