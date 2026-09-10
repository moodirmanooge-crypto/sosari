import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
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
import AdminMessages from "./admin/AdminMessages";
import ProtectedRoute from "./components/ProtectedRoute";

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
            <Route path="messages" element={<AdminMessages />} />
            <Route path="section/:parent/:child" element={<AdminSectionManager />} />
          </Route>

          {/* Public site */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/partner" element={<PublicLayout><PartnerPage /></PublicLayout>} />
          <Route path="/article/:id" element={<PublicLayout><ArticlePage /></PublicLayout>} />
          <Route path="/section/:parent" element={<PublicLayout><SectionLanding /></PublicLayout>} />
          <Route path="/section/:parent/:child" element={<PublicLayout><SectionPage /></PublicLayout>} />
          <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}