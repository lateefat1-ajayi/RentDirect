import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotificationsProvider } from "./context/NotificationsContext";

// Public + Auth Pages
import Landing from "./pages/public/Landing";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import Faq from "./pages/public/Faq";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyCode from "./pages/auth/VerifyCode";
import ConfirmEmail from "./pages/auth/ConfirmEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";


// Layouts
import UserLayout from "./components/layouts/UserLayout";
import AdminLayout from "./components/layouts/AdminLayout";
import LandlordLayout from "./components/layouts/LandlordLayout";
import PublicLayout from "./components/layouts/PublicLayout";


// User Pages
// User Pages
import UserDashboard from "./pages/user/UserDashboard";
import UserMessages from "./pages/user/UserMessages";
import UserNotifications from "./pages/user/UserNotifications";
import UserApplications from "./pages/user/UserApplications";
import UserProfile from "./pages/user/UserProfile";
import PropertyList from "./pages/user/PropertyList";
import PropertyDetails from "./pages/user/PropertyDetails";
import UserFavorites from "./pages/user/UserFavorites";
import UserPayments from "./pages/user/UserPayments";
import PaymentForm from "./pages/user/PaymentForm";
import PaymentCallback from "./pages/user/PaymentCallback";
import UserLeases from "./pages/user/UserLeases";
import UserReviews from "./pages/user/UserReviews";
import ContactHistory from "./pages/user/ContactHistory";


// Landlord Pages
import LandlordDashboard from "./pages/landlord/Dashboard";
import LandlordMessages from "./pages/landlord/Messages";
import LandlordListings from "./pages/landlord/Listings";
import LandlordProfile from "./pages/landlord/Profile";
import LandlordApplicants from "./pages/landlord/Applicants";
import LandlordLeases from "./pages/landlord/Leases";
import LandlordReviews from "./pages/landlord/Reviews";
import LandlordTransactions from "./pages/landlord/Transactions";
import LandlordNotifications from "./pages/landlord/Notifications";
import LandlordVerification from "./pages/landlord/Verification";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminContacts from "./pages/admin/Contacts";
import AdminProfile from "./pages/admin/Profile";
import AdminLandlords from "./pages/admin/Landlords";
import AdminProperties from "./pages/admin/Properties";
import AdminReports from "./pages/admin/Reports";
import AdminNotifications from "./pages/admin/Notifications";

// Fallback Layout or 404
import Layout from "./components/layouts/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import NotFound from "./pages/NotFound";
import PublicProfile from "./pages/public/PublicProfile";
import SharedProperty from "./pages/public/SharedProperty";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* public + auth Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Landing />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="faq" element={<Faq />} />
          <Route path="users/:id" element={<PublicProfile />} />
        </Route>

        {/* Public Auth Routes */}
        <Route path="/auth">
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="verify-code" element={<VerifyCode />} />
        </Route>

        <Route path="/confirm-email/:token" element={<ConfirmEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="/property/shared/:propertyId/:shareToken" element={<SharedProperty />} />

        {/* User Routes */}
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={["tenant"]}>
              <NotificationsProvider>
                <UserLayout />
              </NotificationsProvider>
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="messages" element={<UserMessages />} />
          <Route path="notifications" element={<UserNotifications />} />
          <Route path="applications" element={<UserApplications />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="properties" element={<PropertyList />} />
          <Route path="properties/:propertyId" element={<PropertyDetails />} />
          <Route path="favorites" element={<UserFavorites />} />
          <Route path="payments/:leaseId" element={<UserPayments />} />
          <Route path="payments/:leaseId/pay" element={<PaymentForm />} />
          <Route path="payments" element={<UserPayments />} />
          <Route path="leases" element={<UserLeases />} />
          <Route path="reviews" element={<UserReviews />} />
          <Route path="contact-history" element={<ContactHistory />} />
        </Route>


        {/* Landlord Routes */}
        <Route
          path="/landlord"
          element={
            <ProtectedRoute allowedRoles={["landlord"]}>
              <NotificationsProvider>
                <LandlordLayout />
              </NotificationsProvider>
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<LandlordDashboard />} />
          <Route path="messages" element={<LandlordMessages />} />
          <Route path="listings" element={<LandlordListings />} />
          <Route path="applicants" element={<LandlordApplicants />} />
          <Route path="leases" element={<LandlordLeases />} />
          <Route path="reviews" element={<LandlordReviews />} />
          <Route path="transactions" element={<LandlordTransactions />} />
          <Route path="profile" element={<LandlordProfile />} />
          <Route path="notifications" element={<LandlordNotifications />} />
          <Route path="contact-history" element={<ContactHistory />} />
          <Route path="verification" element={<LandlordVerification />} />
        </Route>


        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="landlords" element={<AdminLandlords />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="notifications" element={<AdminNotifications />} />
        </Route>


        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>

  );
}
