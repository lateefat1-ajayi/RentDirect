import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../../lib/api.js";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import { FaHome, FaMapMarkerAlt, FaShare, FaUserPlus } from "react-icons/fa";

const SharedProperty = () => {
  const { propertyId, shareToken } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSharedProperty = async () => {
      try {
        setLoading(true);
        const response = await apiFetch(`/share/property/${propertyId}/${shareToken}`);
        
        if (response.success) {
          setProperty(response.property);
        } else {
          setError(response.message || "Invalid share link");
        }
      } catch (error) {
        console.error("Error fetching shared property:", error);
        setError("Failed to load property. The link may be invalid or expired.");
      } finally {
        setLoading(false);
      }
    };

    if (propertyId && shareToken) {
      fetchSharedProperty();
    }
  }, [propertyId, shareToken]);

  const handleSignUp = () => {
    // Store the share token for tracking after registration
    localStorage.setItem('pendingShareToken', shareToken);
    navigate('/auth/register');
  };

  const handleSignIn = () => {
    // Store the share token for tracking after login
    localStorage.setItem('pendingShareToken', shareToken);
    navigate('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading property...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="p-8 max-w-md mx-auto text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Link Not Available
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <Button onClick={() => navigate('/')} className="w-full">
            Go to Homepage
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
            <FaShare className="text-primary text-lg" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Property Shared With You!
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Someone thought you'd be interested in this property. Sign up to view full details and apply.
          </p>
        </div>

        {/* Property Preview */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Property Image */}
            <div className="relative">
              <img
                src={
                  property?.images && property.images.length > 0
                    ? (typeof property.images[0] === "string" 
                        ? property.images[0] 
                        : property.images[0]?.url)
                    : "https://via.placeholder.com/600x400?text=Property"
                }
                alt={property?.title}
                className="w-full h-48 object-cover rounded-lg"
              />
              {property?.images && property.images.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                  +{property.images.length - 1} more photos
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="space-y-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {property?.title}
                </h2>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                  <FaMapMarkerAlt className="w-3 h-3" />
                  <span className="text-sm">{property?.location}</span>
                </div>
                <div className="text-2xl font-bold text-primary mb-3">
                  ₦{property?.price?.toLocaleString()}/year
                </div>
              </div>

              {/* Property Features */}
              <div className="space-y-1">
                {property?.type && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <FaHome className="w-3 h-3" />
                    <span>{property.type}</span>
                  </div>
                )}
                {property?.size && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Size: {property.size} sq ft
                  </div>
                )}
                {property?.bedrooms && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Bedrooms: {property.bedrooms}
                  </div>
                )}
                {property?.bathrooms && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Bathrooms: {property.bathrooms}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Call to Action */}
        <Card className="p-4 text-center">
          <div className="max-w-sm mx-auto">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full mb-3">
              <FaUserPlus className="text-primary text-lg" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Join RentDirect to View Full Details
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Create your account to see more photos, detailed information, and apply for this property.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleSignUp} className="flex-1 text-sm">
                Create Account
              </Button>
              <Button onClick={handleSignIn} variant="outline" className="flex-1 text-sm">
                Sign In
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SharedProperty;
