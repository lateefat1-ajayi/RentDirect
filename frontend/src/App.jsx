import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public + Auth Pages
import Landing from "./pages/public/Landing";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import Faq from "./pages/public/Faq";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
// Layouts
import UserLayout from "./components/layouts/UserLayout";
import AdminLayout from "./components/layouts/AdminLayout";
import LandlordLayout from "./components/layouts/LandlordLayout";
import PublicLayout from "./components/layouts/PublicLayout";


// User Pages
import UserDashboard from "./pages/user/Dashboard";
import UserMessages from "./pages/user/Messages";
import UserNotifications from "./pages/user/Notifications";
import UserApplications from "./pages/user/Applications";
import UserProfile from "./pages/user/Profile";

// Landlord Pages
import LandlordDashboard from "./pages/landlord/Dashboard";
import LandlordMessages from "./pages/landlord/Messages";
import LandlordListings from "./pages/landlord/Listings";
import LandlordProfile from "./pages/landlord/Profile";
import LandlordApplicants from "./pages/landlord/Applicants";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminMessages from "./pages/admin/Messages";
import AdminUsers from "./pages/admin/Users";
import AdminProfile from "./pages/admin/Profile";
import AdminLandlords from "./pages/admin/Landlords";

// Fallback Layout or 404
import Layout from "./components/layouts/Layout";

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
        </Route>

        {/* Public Auth Routes */}
        <Route path="/auth">
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
       </Route>

        {/* User Routes */}
        <Route path="/user" element={<UserLayout />}>
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="messages" element={<UserMessages />} />
          <Route path="notifications" element={<UserNotifications />} />
          <Route path="applications" element={<UserApplications />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>

        {/* Landlord Routes */}
        <Route path="/landlord" element={<LandlordLayout />}>
          <Route path="dashboard" element={<LandlordDashboard />} />
          <Route path="messages" element={<LandlordMessages />} />
          <Route path="listings" element={<LandlordListings />} />
          <Route path="applicants" element={<LandlordApplicants />} />
          <Route path="profile" element={<LandlordProfile />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="landlords" element={<AdminLandlords />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Layout />} />
      </Routes>
    </BrowserRouter>

  );
}
