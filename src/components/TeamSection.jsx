import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { RevealGroup, RevealItem } from "./Reveal";
import { TiltCard } from "./Motion";
import Loader from "./Loader";

export default function TeamSection() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "teamMembers"), orderBy("order", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((m) => m.published !== false);
        setMembers(rows);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  if (loading) return <Loader />;

  if (members.length === 0) {
    return (
      <p className="lead">
        No team members published yet. Once the SOSARI team adds people from the admin
        panel, they will automatically appear here.
      </p>
    );
  }

  return (
    <RevealGroup className="teamGrid" stagger={0.08}>
      {members.map((m) => (
        <RevealItem key={m.id}>
          <TiltCard className="teamCard">
            <div className="teamCardPhotoWrap">
              {m.photoUrl ? (
                <img src={m.photoUrl} alt={m.name} className="teamCardPhoto" />
              ) : (
                <div className="teamCardPhoto teamCardPhotoFallback">
                  {(m.name || "?").trim().charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="teamCardBody">
              <div className="teamCardName">{m.name}</div>
              {m.title && <div className="teamCardTitle">{m.title}</div>}
              {m.bio && <p className="teamCardBio">{m.bio}</p>}
            </div>
          </TiltCard>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}