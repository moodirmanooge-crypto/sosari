import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// Splits a heading into words, each masked in its own overflow-hidden box,
// and slides them up from below on scroll-into-view — a signature
// "editorial" headline reveal instead of a plain fade.
export function TextReveal({ text, as = "h1", className = "", delay = 0, stagger = 0.045 }) {
  const Tag = as;
  const words = String(text).split(" ");
  return (
    <Tag className={className}>
      {words.map((w, i) => (
        <span key={i} className="trMask">
          <motion.span
            className="trWord"
            initial={{ y: "115%", rotate: 3 }}
            animate={{ y: "0%", rotate: 0 }}
            transition={{ duration: 0.75, delay: delay + i * stagger, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

// A card that tilts in 3D toward the cursor (perspective + rotateX/Y),
// with a soft lift — used for grid cards and content cards.
export function TiltCard({ children, className = "", max = 7, ...rest }) {
  const ref = useRef(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [max, -max]), { stiffness: 260, damping: 22 });
  const ry = useSpring(useTransform(mx, [0, 1], [-max, max]), { stiffness: 260, damping: 22 });

  function handleMove(e) {
    const rect = ref.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  }
  function handleLeave() {
    mx.set(0.5);
    my.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      className={`tiltCard ${className}`}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileHover={{ y: -7 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// A photo that reveals with a colour-panel "wipe" and a slow zoom-settle,
// instead of a plain fade — used for article/hero imagery.
export function ImageReveal({ src, alt, className = "", delay = 0 }) {
  return (
    <div className={`imageReveal ${className}`}>
      <motion.span
        className="imageRevealMask"
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 0.85, delay, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        initial={{ scale: 1.18 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

// Two slow, softly-blurred blobs drifting behind a hero — gives every
// section its own quiet ambient motion without distracting from content.
export function BlobBg() {
  return (
    <div className="blobBg" aria-hidden="true">
      <span className="blobA" />
      <span className="blobB" />
    </div>
  );
}