import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, where, orderBy, startAt, endAt } from "firebase/firestore";
import { db } from "../firebase";
import { NAV } from "../config/navigation";
import {
  IconDoc, IconFlask, IconChart, IconUsers, IconArrow, IconGlobe,
} from "../components/Icons";

const PANEL_KEYS = {
  about: { icon: IconUsers, color: "blue", label: "About" },
  research: { icon: IconFlask, color: "green", label: "Research" },
  data: { icon: IconChart, color: "purple", label: "Data & Statistics" },
};

async function countByPrefix(prefix) {
  const q = query(
    collection(db, "content"),
    orderBy("sectionKey"),
    startAt(prefix),
    endAt(prefix + "\uf8ff")
  );
  const snap = await getDocs(q);
  return snap.size;
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ about: null, research: null, data: null, messages: null });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [about, research, data, messagesSnap] = await Promise.all([
          countByPrefix("about/"),
          countByPrefix("research/"),
          countByPrefix("data/"),
          getDocs(collection(db, "messages")),
        ]);
        if (mounted) {
          setCounts({ about, research, data, messages: messagesSnap.size });
        }
      } catch (e) {
        console.error(e);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const statCards = [
    { key: "about", label: "About Pages", value: counts.about, icon: IconUsers, color: "blue" },
    { key: "research", label: "Research Topics", value: counts.research, icon: IconFlask, color: "green" },
    { key: "data", label: "Data & Statistics", value: counts.data, icon: IconChart, color: "purple" },
    { key: "messages", label: "Partner Messages", value: counts.messages, icon: IconUsers, color: "orange" },
  ];

  const panelGroups = NAV.filter((g) => PANEL_KEYS[g.key]);

  return (
    <div className="adminPage adminDash">
      <div className="adminWelcome">
        <div>
          <p className="adminWelcomeHi">Welcome back,</p>
          <h1>Admin <span className="adminWave">👋</span></h1>
          <p className="lead">Manage your content, research areas and data from one place. Here's an overview of your website.</p>
        </div>
        <div className="adminWelcomeArt">
          <IconGlobe />
          <div className="adminWelcomeArtText">
            KNOWLEDGE<br />PEOPLE<br />PROGRESS<br />SOMALIA
          </div>
        </div>
      </div>

      <div className="adminStatGrid">
        {statCards.map((c) => (
          <div key={c.key} className={`adminStatCard adminStat-${c.color}`}>
            <span className="adminStatIcon"><c.icon /></span>
            <div>
              <b>{c.value === null ? "…" : c.value}</b>
              <span>{c.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="adminPanelGrid">
        {panelGroups.map((group) => {
          const style = PANEL_KEYS[group.key];
          const leaves = group.items || group.groups.flatMap((g) => g.items);
          return (
            <div key={group.key} className="adminPanel">
              <div className="adminPanelHead">
                <span className={`adminPanelIcon adminPanelIcon-${style.color}`}><style.icon /></span>
                <div>
                  <h3>{style.label}</h3>
                  <span>Manage content for the {style.label} section</span>
                </div>
                <Link to={`/admin/section/${leaves[0]?.key}`} className="adminPanelViewAll">View all <IconArrow /></Link>
              </div>
              <div className="adminPanelList">
                {leaves.slice(0, 10).map((it) => (
                  <Link key={it.key} to={`/admin/section/${it.key}`} className="adminPanelRow">
                    {it.label} <IconArrow />
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        <div className="adminPanel adminPanelReports">
          <div className="adminPanelHead">
            <span className="adminPanelIcon adminPanelIcon-rose"><IconDoc /></span>
            <div>
              <h3>Reports</h3>
              <span>Manage published reports (Knowledge section)</span>
            </div>
            <Link to="/reports" className="adminPanelViewAll">View live page <IconArrow /></Link>
          </div>
          <div className="adminPanelList">
            {(NAV.find((g) => g.key === "knowledge")?.items || []).map((it) => (
              <Link key={it.key} to={`/admin/section/${it.key}`} className="adminPanelRow">
                {it.label} <IconArrow />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}