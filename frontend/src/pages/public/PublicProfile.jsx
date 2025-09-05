import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import { toast } from "react-toastify";
import Avatar from "../../components/ui/Avatar";

export default function PublicProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/users/${id}`);
        setUser(data);
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
    </div>
  );
}


