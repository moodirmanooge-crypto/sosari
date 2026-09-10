import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import logo from "../assets/logo.png";

export default function AdminLayout() {
  const { adminProfile, logout } = useAdminAuth();
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
          <NavLink to="/admin/messages">Partner Messages</NavLink>
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
