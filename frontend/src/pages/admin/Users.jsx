import { useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import UserProfileModal from "../../components/modals/UserProfileModal";
import Avatar from "../../components/ui/Avatar";
import { apiFetch } from "../../lib/api";
import { toast } from "react-toastify";
import { FaSearch, FaFilter, FaEye, FaBan, FaCheck, FaTrash, FaUserEdit, FaUser, FaShieldAlt } from "react-icons/fa";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchUsers();
    // Get current user from localStorage
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUser(userData);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/admin/users");
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      await apiFetch(`/admin/users/${userId}/${action}`, { method: "PUT" });
      toast.success(`User ${action} successfully`);
      fetchUsers();
    } catch (error) {
      console.error("Error performing user action:", error);
      toast.error(`Failed to ${action} user`);
    }
  };

  const openUserModal = (user) => {
    console.log("Opening user modal for:", user);
    setSelectedUser(user);
    setShowModal(true);
    console.log("Modal state after opening:", { selectedUser: user, showModal: true });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Admin</span>;
      case "landlord":
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Landlord</span>;
      case "tenant":
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Tenant</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Unknown</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>;
      case "suspended":
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Suspended</span>;
      case "pending":
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Unknown</span>;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <div className="text-sm text-gray-500">
          {users.length} total users
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Roles</option>
              <option value="tenant">Tenants</option>
              <option value="landlord">Landlords</option>
              <option value="admin">Admins</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <Card key={user._id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {user.role === "admin" ? (
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                      <FaShieldAlt className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                  ) : (
                    <Avatar
                      name={user.name}
                      src={user.profileImage}
                      size="w-12 h-12"
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="mb-1">{getRoleBadge(user.role)}</div>
                    <div>{getStatusBadge(user.status)}</div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openUserModal(user)}
                      className="flex items-center gap-1"
                    >
                      <FaEye className="w-3 h-3" />
                      View
                    </Button>
                    
                    {user.status === "active" && user.role !== "admin" && (
                      <Button
                        size="sm"
                        onClick={() => handleUserAction(user._id, "suspend")}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700"
                      >
                        <FaBan className="w-3 h-3" />
                        Suspend
                      </Button>
                    )}
                    
                    {user.status === "suspended" && user.role !== "admin" && (
                      <Button
                        size="sm"
                        onClick={() => handleUserAction(user._id, "activate")}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                      >
                        <FaCheck className="w-3 h-3" />
                        Activate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No users found matching your criteria</p>
          </Card>
        )}
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        user={selectedUser}
        currentUser={currentUser}
      />
    </div>
  );
}
