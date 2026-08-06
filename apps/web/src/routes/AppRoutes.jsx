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
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/business/:id" element={<BusinessDetails />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/businesses" element={<ForBusinesses />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;