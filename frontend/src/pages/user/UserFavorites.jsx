import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { apiFetch } from "../../lib/api";
import { toast } from "react-toastify";

export default function UserFavorites() {
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/favorites");
      setSavedProperties(data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      toast.error("Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (propertyId) => {
    try {
      await apiFetch(`/favorites/${propertyId}`, { method: "DELETE" });
      setSavedProperties(prev => prev.filter(p => p._id !== propertyId));
      toast.success("Property removed from favorites!");
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast.error("Failed to remove from favorites");
    }
  };

  if (loading) {
    return (
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
    );
  }

  if (savedProperties.length === 0) {
    return <p className="p-6 text-gray-500">You have no saved properties.</p>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold mb-4">Your Saved Properties</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedProperties.map((property) => (
          <Card key={property._id || property.id} className="p-4 flex flex-col">
            <img
              src={Array.isArray(property.images) && property.images.length > 0 ? (typeof property.images[0] === "string" ? property.images[0] : property.images[0]?.url) : "https://via.placeholder.com/600x400?text=Property"}
              alt={property.title}
              className="w-full h-48 object-cover rounded-md mb-2"
            />
            <h2 className="text-lg font-semibold">{property.title}</h2>
            <p className="text-sm text-gray-500">{property.location}</p>
            <p className="text-md font-semibold mt-1">{property.price}</p>

            <div className="mt-3 flex gap-2">
              <Link to={`/user/properties/${property._id || property.id}`} state={{ property }}>
                <Button variant="primary" size="sm">View Details</Button>
              </Link>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleRemove(property._id || property.id)}
              >
                Remove
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
