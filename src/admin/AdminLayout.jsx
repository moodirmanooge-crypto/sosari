import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { useAdminNotifications } from "../hooks/useAdminNotifications";
import logo from "../assets/logo.png";

export default function AdminLayout() {
  const { adminProfile, logout } = useAdminAuth();
  const { unreadCount } = useAdminNotifications();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/admin/login");
  }

  return (
    <div className="adminShell">
      <aside className="adminSidebar">
        <img src={logo} alt="SOSARI" className="adminSidebarLogo" />
        <nav>
          <NavLink to="/admin" end>Dashboard</NavLink>
          <NavLink to="/admin/home-settings">Home Page Settings</NavLink>
          <NavLink to="/admin/our-work">Our Work Settings</NavLink>
          <NavLink to="/admin/team">Our Team</NavLink>
          <NavLink to="/admin/partners">Our Partners</NavLink>
          <NavLink to="/admin/navigation">Navigation Menu</NavLink>
          <NavLink to="/admin/messages">
            Partner Messages
            {unreadCount > 0 && <span className="adminNavBadge">{unreadCount}</span>}
          </NavLink>
          <NavLink to="/admin/settings">Settings</NavLink>
        </nav>
        <div className="adminSidebarFooter">
          <span>{adminProfile?.username}</span>
          <button onClick={handleLogout} className="btn outline adminLogoutBtn">Log out</button>
        </div>
      </aside>
      <main className="adminMain">
        <Outlet />
      </main>
    </div>
  );
}