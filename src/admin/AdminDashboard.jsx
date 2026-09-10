import { Link } from "react-router-dom";
import { NAV } from "../config/navigation";

export default function AdminDashboard() {
  return (
    <div className="adminPage">
      <h1>Dashboard</h1>
      <p className="lead">
        Dooro qaybta navbar-ka (sida ABOUT → Leadership, ama RESEARCH AREAS → Health) si aad
        u dhigto ama u maareyso content-ka bogga taas. Content kastaa waxa uu si toos ah ugu
        muuqan doonaa bogga website-ka public-ka ah.
      </p>

      <div className="adminSectionGrid">
        {NAV.map((group) => {
          const leaves = group.items || group.groups.flatMap((g) => g.items);
          return (
            <div key={group.key} className="adminSectionCard">
              <h3>{group.label}</h3>
              <div className="adminSectionLinks">
                {leaves.map((it) => (
                  <Link key={it.key} to={`/admin/section/${it.key}`}>
                    {it.label}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
