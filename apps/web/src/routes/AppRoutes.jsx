import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Explore from "../pages/Explore";
import BusinessDetails from "../pages/BusinessDetails";
import ForBusinesses from "../pages/ForBusinesses";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import Dashboard from "../pages/Dashboard";
import Bookings from "../pages/Bookings";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";
import Checkout from "../pages/Checkout";
import Admin from "../pages/Admin";
import AccountVerification from "../pages/AccountVerification";
import BusinessOnboarding from "../pages/BusinessOnboarding";

import ProtectedRoute from "../components/ProtectedRoute";
import RoleRoute from "../components/RoleRoute";
import VerifiedOwnerRoute from "../components/VerifiedOwnerRoute";

import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import PaymentCallback from "../pages/PaymentCallback";
import LeaveReview from "../pages/LeaveReview";
import Categories from "../pages/Categories";
import SubscriptionCallback from "../pages/SubscriptionCallback";


function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/categories" element={<Categories/>} />
        <Route path="/business/:id" element={<BusinessDetails />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="/review/:token" element={<LeaveReview />} />
        <Route path="/subscription/callback" element={<SubscriptionCallback />} />


        <Route path="/businesses" element={<ForBusinesses />} />

        {/* Protected Routes — logged in required */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/verify-account" element={<AccountVerification />} />
        </Route>

        {/* Verified Business Owner Routes */}
        <Route element={<VerifiedOwnerRoute />}>
          <Route path="/onboarding" element={<BusinessOnboarding />} />
        </Route>

        {/* Business/Admin Routes */}
        <Route element={<RoleRoute allowedRoles={["business", "admin"]} />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
