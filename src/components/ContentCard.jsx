import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

// Fires `true` once the element scrolls into view, then stops watching.
function useInView(ref, options) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        obs.disconnect();
      }
    }, options);
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, options]);
  return inView;
}

// Types the given text out character by character once it scrolls into
// view. The full text is always present for screen readers; only the
// animated visible copy is decorative.
function TypewriterText({ text, speed = 16, startDelay = 250, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { threshold: 0.3 });
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!inView || !text) return;
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setShown(text);
      setDone(true);
      return;
    }
    let i = 0;
    let interval;
    const kickoff = setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setShown(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
    }, startDelay);
    return () => {
      clearTimeout(kickoff);
      clearInterval(interval);
    };
  }, [inView, text, speed, startDelay]);

  return (
    <p ref={ref} className={className}>
      <span aria-hidden="true">
        {shown}
        {inView && !done && <span className="typeCursor">|</span>}
      </span>
      <span className="srOnly">{text}</span>
    </p>
  );
}

export default function ContentCard({ item, index = 0 }) {
  const delay = Math.min(index, 6) * 70;

  return (
    <Link
      to={`/article/${item.id}`}
      className="pub contentCard reveal"
      style={{ "--reveal-delay": `${delay}ms` }}
    >
      {item.imageUrl && (
        <div className="contentCardImg">
          <img
            src={item.imageUrl}
            alt={item.title}
            loading="lazy"
            className="contentCardImgReveal"
            style={{ "--img-delay": `${delay + 150}ms` }}
          />
        </div>
      )}
      <div className="contentCardBody">
        {item.tag && <span className="tag">{item.tag}</span>}
        <h3>{item.title}</h3>
        {item.summary && (
          <TypewriterText text={item.summary} className="contentCardSummary" />
        )}
        <span className="cardArrow" aria-hidden="true">Read more →</span>
      </div>
    </Link>
  );
}