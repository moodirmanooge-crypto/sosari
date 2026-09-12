import { motion } from "framer-motion";

// Fades + slides a single element in once it scrolls into view.
// Use for headings, paragraphs, images, hero blocks — anything standalone.
export default function Reveal({
  children,
  delay = 0,
  y = 26,
  duration = 0.65,
  className = "",
  as = "div",
  ...rest
}) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

// Wrap a grid/list with RevealGroup and each child with RevealItem to get
// a staggered "cascade in" effect (cards, chips, list rows, image grids…).
export function RevealGroup({ children, className = "", stagger = 0.08, once = true, ...rest }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.12 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className = "", y = 22, ...rest }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// A gentle floating/hover-lift wrapper for cards and images.
export function HoverLift({ children, className = "", lift = 8, scale = 1.015, ...rest }) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -lift, scale, transition: { duration: 0.25, ease: "easeOut" } }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}