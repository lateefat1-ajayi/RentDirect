import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { apiFetch } from "../../lib/api";

export default function PropertyList() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const filteredProperties = items.filter((p) => {
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
      <h1 className="text-xl font-bold">Browse Properties</h1>

      <Input
        placeholder="Search by title, location, price, or description..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
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
        <p className="text-sm text-gray-500">No properties found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map((property) => (
            <Card key={property._id || property.id} className="p-3 flex flex-col">
              <img
                src={
                  Array.isArray(property.images) && property.images.length > 0
                    ? (typeof property.images[0] === "string" ? property.images[0] : property.images[0]?.url)
                    : "https://via.placeholder.com/600x400?text=Property"
                }
                alt={property.title}
                className="w-full h-40 object-cover rounded-md mb-3"
              />
              <h2 className="text-sm font-semibold">{property.title}</h2>
              <p className="text-xs text-gray-500">{property.location}</p>
              <p className="text-sm font-medium mt-1">{property.price}</p>
              <Link
                to={`/user/properties/${property._id || property.id}`}
              >
                <Button variant="primary" size="sm" className="mt-2 w-full">
                  View Details
                </Button>
              </Link>

            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
