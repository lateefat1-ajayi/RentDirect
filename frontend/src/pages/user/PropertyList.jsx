import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { apiFetch } from "../../lib/api";
import { FaHeart, FaMapMarkerAlt, FaLocationArrow, FaShare } from "react-icons/fa";
import ShareModal from "../../components/ui/ShareModal";

export default function PropertyList() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedLoading, setSavedLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("browse"); // "browse" or "saved"
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [viewingProperty, setViewingProperty] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Use reverse geocoding to get city/area name
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          
          const locationName = data.city || data.locality || data.principalSubdivision || "Current Location";
          
          setUserLocation({
            latitude,
            longitude,
            name: locationName
          });
          
          // Update search with location
          setSearch(locationName);
        } catch (error) {
          console.error("Error getting location name:", error);
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            name: "Current Location"
          });
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError("Unable to get your location. Please allow location access or search manually.");
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await apiFetch("/property");
        const list = res?.properties || res || [];
        setItems(list);
        setError("");
      } catch (e) {
        setItems([]);
        setError(e.message || "Failed to load properties");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fetchSavedProperties = async () => {
    try {
      setSavedLoading(true);
      const data = await apiFetch("/favorites");
      setSavedItems(data || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setSavedItems([]);
    } finally {
      setSavedLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "saved") {
      fetchSavedProperties();
    }
  }, [activeTab]);

  const currentItems = activeTab === "browse" ? items : savedItems;
  const currentLoading = activeTab === "browse" ? loading : savedLoading;

  const openImageViewer = (property, imageIndex = 0) => {
    setViewingProperty(property);
    setSelectedImageIndex(imageIndex);
    setImageLoading(true);
  };

  const closeImageViewer = () => {
    setViewingProperty(null);
    setSelectedImageIndex(null);
    setImageLoading(false);
  };

  const nextImage = () => {
    if (viewingProperty && viewingProperty.images) {
      setImageLoading(true);
      setSelectedImageIndex((prev) => 
        prev < viewingProperty.images.length - 1 ? prev + 1 : 0
      );
    }
  };

  const prevImage = () => {
    if (viewingProperty && viewingProperty.images) {
      setImageLoading(true);
      setSelectedImageIndex((prev) => 
        prev > 0 ? prev - 1 : viewingProperty.images.length - 1
      );
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!viewingProperty) return;
      
      switch (e.key) {
        case 'Escape':
          closeImageViewer();
          break;
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
      }
    };

    if (viewingProperty) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [viewingProperty, selectedImageIndex]);

  const handleShare = (property) => {
    setSelectedProperty(property);
    setShareModalOpen(true);
  };

  const filteredProperties = currentItems.filter((p) => {
    const term = search.toLowerCase();
    return (
      (p.title || "").toLowerCase().includes(term) ||
      (p.location || "").toLowerCase().includes(term) ||
      String(p.price || "").toLowerCase().includes(term) ||
      (p.description || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Properties</h1>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("browse")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "browse"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          Browse Properties
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
            activeTab === "saved"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <FaHeart className="w-4 h-4" />
          Saved Properties
        </button>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Search by title, location, price, or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button
          onClick={getCurrentLocation}
          disabled={locationLoading}
          variant="secondary"
          className="flex items-center gap-2 whitespace-nowrap"
        >
          {locationLoading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          ) : (
            <FaLocationArrow className="w-4 h-4" />
          )}
          {userLocation ? "Update Location" : "Use My Location"}
        </Button>
      </div>
      
      {userLocation && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <FaMapMarkerAlt className="w-4 h-4" />
          <span>Showing properties near: {userLocation.name}</span>
        </div>
      )}
      
      {locationError && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
          {locationError}
        </div>
      )}

      {currentLoading ? (
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <FaHeart className="text-gray-400 dark:text-gray-500 text-4xl mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {activeTab === "saved" 
              ? "No saved properties yet. Browse properties and save your favorites!" 
              : "No properties found matching your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map((property) => (
            <Card key={property._id || property.id} className="p-3 flex flex-col">
              <div className="relative">
                <img
                  src={
                    Array.isArray(property.images) && property.images.length > 0
                      ? (typeof property.images[0] === "string" ? property.images[0] : property.images[0]?.url)
                      : "https://via.placeholder.com/600x400?text=Property"
                  }
                  alt={property.title}
                  className="w-full h-40 object-cover rounded-md mb-3 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => openImageViewer(property, 0)}
                />
                
                {/* Image count indicator */}
                {property.images && property.images.length > 1 && (
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                    {property.images.length} photos
                  </div>
                )}
                
                {/* Click to view hint */}
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                  Click to view
                </div>
              </div>
              <h2 className="text-sm font-semibold">{property.title}</h2>
              <p className="text-xs text-gray-500">{property.location}</p>
              <p className="text-sm font-medium mt-1">{property.price}</p>
              {property.size && (
                <p className="text-xs text-gray-400 mt-1">{property.size} sq ft</p>
              )}
              <div className="flex gap-2 mt-2">
                <Link
                  to={`/user/properties/${property._id || property.id}`}
                  className="flex-1"
                >
                  <Button variant="primary" size="md" className="w-full">
                    View Details
                  </Button>
                </Link>
                <Button
                  onClick={() => handleShare(property)}
                  variant="outline"
                  size="md"
                  className="px-3"
                  title="Share Property"
                >
                  <FaShare className="w-4 h-4" />
                </Button>
              </div>

            </Card>
          ))}
        </div>
      )}

      {/* Image Viewer Modal */}
      {/* Custom Image Viewer Modal */}
      {viewingProperty && selectedImageIndex !== null && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-[90vw] h-[90vh] max-w-6xl max-h-[80vh] bg-black rounded-lg overflow-hidden shadow-2xl">
            {/* Close Button */}
            <button
              onClick={closeImageViewer}
              className="absolute top-4 right-4 z-50 text-white hover:text-gray-300 bg-black/50 rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold transition-colors"
              title="Close"
            >
              ×
            </button>

            {/* Loading Spinner */}
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-40">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {/* Image Container */}
            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={
                  viewingProperty && typeof viewingProperty.images[selectedImageIndex] === "string" 
                    ? viewingProperty.images[selectedImageIndex] 
                    : viewingProperty?.images[selectedImageIndex]?.url
                }
                alt={`${viewingProperty?.title} - Image ${selectedImageIndex + 1}`}
                className={`max-w-full max-h-full w-auto h-auto object-contain transition-opacity duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
            </div>
            
            {/* Navigation arrows */}
            {viewingProperty && viewingProperty.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-2xl hover:text-gray-300 bg-black/50 rounded-full w-10 h-10 flex items-center justify-center"
                >
                  ‹
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-2xl hover:text-gray-300 bg-black/50 rounded-full w-10 h-10 flex items-center justify-center"
                >
                  ›
                </button>
              </>
            )}

            {/* Image counter */}
            {viewingProperty && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                {selectedImageIndex + 1} of {viewingProperty.images.length}
              </div>
            )}

            {/* Property title */}
            {viewingProperty && (
              <div className="absolute top-4 left-4 text-white text-lg font-semibold bg-black/50 px-3 py-1 rounded">
                {viewingProperty.title}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        property={selectedProperty}
      />
    </div>
  );
}
