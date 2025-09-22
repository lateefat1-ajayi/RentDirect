import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import { toast } from "react-toastify";
import Avatar from "../../components/ui/Avatar";
import { FaStar, FaUser, FaCalendarAlt } from "react-icons/fa";
import Card from "../../components/ui/Card";

export default function PublicProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/users/${id}`);
        setUser(data);
        
        // Load reviews for this user
        if (data?._id) {
          setReviewsLoading(true);
          try {
            const reviewsData = await apiFetch(`/reviews/user/${data._id}`);
            setReviews(Array.isArray(reviewsData) ? reviewsData : []);
          } catch (reviewErr) {
            console.error("Failed to load reviews:", reviewErr);
            setReviews([]);
          } finally {
            setReviewsLoading(false);
          }
        }
      } catch (err) {
        toast.error(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-6 text-sm text-gray-500">Loading profile...</div>;
  if (!user) return <div className="p-6 text-sm text-gray-500">Profile not found.</div>;

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text || "");
      toast.info("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-4">
        <Avatar
          name={user.name}
          src={user.profileImage}
          size="w-16 h-16"
          className="flex-shrink-0"
        />
        <div>
          <div className="text-lg font-semibold">{user.name}</div>
          <div className="text-xs text-gray-500 capitalize">{user.role}</div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {user.phone && (
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Phone:</span>
            <span className="font-medium">{user.phone}</span>
            <button className="px-2 py-1 text-xs border rounded" onClick={() => copy(user.phone)}>Copy</button>
          </div>
        )}
      </div>

      <div className="pt-2">
        <Link 
          to={localStorage.getItem("role") === "landlord" ? "/landlord/messages" : "/user/messages"} 
          className="text-sm text-primary underline"
        >
          Go to Messages
        </Link>
      </div>

      {/* Reviews Section */}
      <div className="pt-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaStar className="text-yellow-500" />
          Reviews ({reviews.length})
        </h3>
        
        {reviewsLoading ? (
          <div className="text-sm text-gray-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-sm text-gray-500">No reviews yet</div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review._id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar
                      name={review.reviewer?.name || "Anonymous"}
                      src={review.reviewer?.profileImage}
                      size="w-8 h-8"
                    />
                    <div>
                      <div className="font-medium text-sm">
                        {review.reviewer?.name || "Anonymous"}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {review.reviewType === "landlord_review" ? "Landlord" : "Tenant"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`w-3 h-3 ${
                          i < review.rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                {review.title && (
                  <div className="font-medium text-sm mb-1">{review.title}</div>
                )}
                
                <div className="text-sm text-gray-700 mb-2">{review.comment}</div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FaCalendarAlt className="w-3 h-3" />
                  <span>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                  {review.isVerified && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Verified
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


