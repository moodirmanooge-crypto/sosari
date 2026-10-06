import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { NavigationProvider } from "./contexts/NavigationContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
// Home is loaded right away (it's the first page most visitors see).
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";

// Every other page — and the whole admin panel — is split into its own
// small file that downloads only when it's opened. This keeps the first
// download for the home page much smaller, so the hero appears faster on
// both laptop and mobile.
const OurWork = lazy(() => import("./pages/OurWork"));
const SectionLanding = lazy(() => import("./pages/SectionLanding"));
const SectionPage = lazy(() => import("./pages/SectionPage"));
const ArticlePage = lazy(() => import("./pages/ArticlePage"));
const PartnerPage = lazy(() => import("./pages/PartnerPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AdminLogin = lazy(() => import("./admin/AdminLogin"));
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard"));
const AdminSectionManager = lazy(() => import("./admin/AdminSectionManager"));
const AdminHomeSettings = lazy(() => import("./admin/AdminHomeSettings"));
const AdminOurWork = lazy(() => import("./admin/AdminOurWork"));
const AdminTeam = lazy(() => import("./admin/AdminTeam"));
const AdminMessages = lazy(() => import("./admin/AdminMessages"));
const AdminSettings = lazy(() => import("./admin/AdminSettings"));
const AdminPartners = lazy(() => import("./admin/AdminPartners"));
const AdminNavigation = lazy(() => import("./admin/AdminNavigation"));

// Shows a small spinner in place of a page while its file downloads
// (only the first time that page is opened).
function Lazy({ children, full = false }) {
  return <Suspense fallback={<Loader full={full} />}>{children}</Suspense>;
}

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
      <Lazy>{children}</Lazy>
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
          <Route path="/admin/login" element={<Lazy full><AdminLogin /></Lazy>} />
          {/* Friendly aliases in case the URL is typed with a dash or without /login */}
          <Route path="/admin-login" element={<Navigate to="/admin/login" replace />} />
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Lazy full><AdminLayout /></Lazy>
              </ProtectedRoute>
            }
          >
            <Route index element={<Lazy><AdminDashboard /></Lazy>} />
            <Route path="home-settings" element={<Lazy><AdminHomeSettings /></Lazy>} />
            <Route path="our-work" element={<Lazy><AdminOurWork /></Lazy>} />
            <Route path="team" element={<Lazy><AdminTeam /></Lazy>} />
            <Route path="partners" element={<Lazy><AdminPartners /></Lazy>} />
            <Route path="navigation" element={<Lazy><AdminNavigation /></Lazy>} />
            <Route path="messages" element={<Lazy><AdminMessages /></Lazy>} />
            <Route path="settings" element={<Lazy><AdminSettings /></Lazy>} />
            <Route path="section/:parent/:child" element={<Lazy><AdminSectionManager /></Lazy>} />
          </Route>

          {/* Public site */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/our-work" element={<PublicLayout><OurWork /></PublicLayout>} />
          {/* Old / commonly typed URLs (e.g. sosari.org/services/ from Google
              or old links) — send them to the right page instead of a 404. */}
          <Route path="/services" element={<Navigate to="/our-work" replace />} />
          <Route path="/service" element={<Navigate to="/our-work" replace />} />
          <Route path="/our-services" element={<Navigate to="/our-work" replace />} />
          <Route path="/what-we-do" element={<Navigate to="/our-work" replace />} />
          <Route path="/services/*" element={<Navigate to="/our-work" replace />} />
          <Route path="/about" element={<Navigate to="/section/about" replace />} />
          <Route path="/about-us" element={<Navigate to="/section/about" replace />} />
          <Route path="/research" element={<Navigate to="/section/research" replace />} />
          <Route path="/publications" element={<Navigate to="/section/knowledge" replace />} />
          <Route path="/contact" element={<Navigate to="/partner" replace />} />
          <Route path="/contact-us" element={<Navigate to="/partner" replace />} />
          <Route path="/partner-with-sosari" element={<Navigate to="/partner" replace />} />
          <Route path="/work-with-sosari" element={<Navigate to="/partner" replace />} />
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