import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { NavigationProvider } from "./contexts/NavigationContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import OurWork from "./pages/OurWork";
import SectionLanding from "./pages/SectionLanding";
import SectionPage from "./pages/SectionPage";
import ArticlePage from "./pages/ArticlePage";
import PartnerPage from "./pages/PartnerPage";
import NotFound from "./pages/NotFound";

import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminSectionManager from "./admin/AdminSectionManager";
import AdminHomeSettings from "./admin/AdminHomeSettings";
import AdminOurWork from "./admin/AdminOurWork";
import AdminTeam from "./admin/AdminTeam";
import AdminMessages from "./admin/AdminMessages";
import AdminSettings from "./admin/AdminSettings";
import AdminPartners from "./admin/AdminPartners";
import AdminNavigation from "./admin/AdminNavigation";
import ProtectedRoute from "./components/ProtectedRoute";

// React Router does not reset scroll position on navigation by default.
// Without this, clicking a link while scrolled down (e.g. a footer link)
// loads the new page underneath the current scroll position, so it looks
// like nothing happened until the person manually scrolls back up.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <NavigationProvider>
        <ScrollToTop />
        <Routes>
          {/* Admin routes (no public navbar/footer) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          {/* Friendly aliases in case the URL is typed with a dash or without /login */}
          <Route path="/admin-login" element={<Navigate to="/admin/login" replace />} />
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="home-settings" element={<AdminHomeSettings />} />
            <Route path="our-work" element={<AdminOurWork />} />
            <Route path="team" element={<AdminTeam />} />
            <Route path="partners" element={<AdminPartners />} />
            <Route path="navigation" element={<AdminNavigation />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="section/:parent/:child" element={<AdminSectionManager />} />
          </Route>

          {/* Public site */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/our-work" element={<PublicLayout><OurWork /></PublicLayout>} />
          <Route path="/partner" element={<PublicLayout><PartnerPage /></PublicLayout>} />
          <Route path="/article/:id" element={<PublicLayout><ArticlePage /></PublicLayout>} />
          <Route path="/section/:parent" element={<PublicLayout><SectionLanding /></PublicLayout>} />
          <Route path="/section/:parent/:child" element={<PublicLayout><SectionPage /></PublicLayout>} />
          <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
        </Routes>
        </NavigationProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}