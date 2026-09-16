import { useEffect, useMemo, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { db } from "../firebase";
import Loader from "./Loader";
import {
  IconUsers, IconGradCap, IconFacebook, IconLinkedIn, IconMail, IconChevronRight,
} from "./Icons";

const SLOTS_DESKTOP = 3;
const SLOTS_TABLET = 2;
const SLOTS_MOBILE = 1;

function useSlotCount() {
  const getCount = () => {
    if (typeof window === "undefined") return SLOTS_DESKTOP;
    if (window.innerWidth <= 640) return SLOTS_MOBILE;
    if (window.innerWidth <= 980) return SLOTS_TABLET;
    return SLOTS_DESKTOP;
  };
  const [count, setCount] = useState(getCount);
  useEffect(() => {
    function onResize() { setCount(getCount()); }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return count;
}

// Enters from the right, exits to the left when moving forward (Next);
// reversed when moving back (Prev) — matches the partners carousel.
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 46 : -46, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -46 : 46, opacity: 0 }),
};

function TeamCard({ m }) {
  return (
    <motion.div
      className={`teamCard2${m.isLeader ? " teamCard2Leader" : ""}`}
      custom={1}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="teamCard2Banner">
        {m.isLeader && (
          <span className="teamCard2LeaderBadge">★ LEADER</span>
        )}
      </div>

      <div className="teamCard2PhotoWrap">
        {m.photoUrl ? (
          <img src={m.photoUrl} alt={m.name} className="teamCard2Photo" />
        ) : (
          <div className="teamCard2Photo teamCard2PhotoFallback">
            {(m.name || "?").trim().charAt(0).toUpperCase()}
          </div>
        )}
        <span className="teamCard2PhotoBadge"><IconUsers /></span>
      </div>

      <div className="teamCard2Body">
        <div className="teamCard2Name">{m.name}</div>
        {m.title && <span className="teamCard2Title">{m.title}</span>}
        {m.bio && (
          <div className="teamCard2Stat">
            <IconGradCap />
            <span>{m.bio}</span>
          </div>
        )}
        {m.quote && (
          <>
            <div className="teamCard2Divider" />
            <p className="teamCard2Quote">“{m.quote}”</p>
          </>
        )}
        <div className="teamCard2Socials">
          <a href="#" onClick={(e) => e.preventDefault()} aria-label="Facebook"><IconFacebook /></a>
          <a href="#" onClick={(e) => e.preventDefault()} aria-label="LinkedIn"><IconLinkedIn /></a>
          <a href="#" onClick={(e) => e.preventDefault()} aria-label="Email"><IconMail /></a>
        </div>
      </div>
    </motion.div>
  );
}

export default function TeamSection() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const slotCount = useSlotCount();
  const [windowStart, setWindowStart] = useState(0);
  const [direction, setDirection] = useState(1);

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

  useEffect(() => { setWindowStart(0); }, [members.length, slotCount]);

  const canRotate = members.length > slotCount;

  function goNext() {
    if (!canRotate) return;
    setDirection(1);
    setWindowStart((s) => (s + 1) % members.length);
  }
  function goPrev() {
    if (!canRotate) return;
    setDirection(-1);
    setWindowStart((s) => (s - 1 + members.length) % members.length);
  }

  const visible = useMemo(() => {
    if (members.length === 0) return [];
    const n = Math.min(slotCount, members.length);
    return Array.from({ length: n }, (_, i) => members[(windowStart + i) % members.length]);
  }, [members, slotCount, windowStart]);

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
    <div className="teamCarouselRow">
      {canRotate && (
        <button type="button" className="teamCarouselArrow teamCarouselArrowLeft" onClick={goPrev} aria-label="Previous team members">
          <IconChevronRight />
        </button>
      )}

      <div className="teamCarouselTrack">
        {visible.map((m, slot) => (
          <div className="teamCarouselSlot" key={slot}>
            <AnimatePresence mode="popLayout" custom={direction}>
              <TeamCard key={m.id} m={m} />
            </AnimatePresence>
          </div>
        ))}
      </div>

      {canRotate && (
        <button type="button" className="teamCarouselArrow teamCarouselArrowRight" onClick={goNext} aria-label="Next team members">
          <IconChevronRight />
        </button>
      )}
    </div>
  );
}