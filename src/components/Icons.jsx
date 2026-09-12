// Small inline SVG icon set (stroke-based, currentColor) used across the
// navbar and the home hero. No external icon package required.

const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function IconSearch(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function IconChart(props) {
  return (
    <svg {...base} {...props}>
      <line x1="4" y1="20" x2="4" y2="12" />
      <line x1="10" y1="20" x2="10" y2="6" />
      <line x1="16" y1="20" x2="16" y2="15" />
      <line x1="22" y1="20" x2="22" y2="9" />
    </svg>
  );
}

export function IconUsers(props) {
  return (
    <svg {...base} {...props}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function IconDoc(props) {
  return (
    <svg {...base} {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
    </svg>
  );
}

export function IconBulb(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7c.5.4.8 1 .8 1.6V17h6.4v-.7c0-.6.3-1.2.8-1.6A7 7 0 0 0 12 2Z" />
    </svg>
  );
}

export function IconDb(props) {
  return (
    <svg {...base} {...props}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 5v6c0 1.66-4.03 3-9 3s-9-1.34-9-3V5" />
      <path d="M21 11v6c0 1.66-4.03 3-9 3s-9-1.34-9-3v-6" />
    </svg>
  );
}

export function IconGlobe(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
    </svg>
  );
}

export function IconArrow(props) {
  return (
    <svg {...base} {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function IconFlask(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9 3h6" />
      <path d="M10 3v6.2L4.6 18a2 2 0 0 0 1.7 3h11.4a2 2 0 0 0 1.7-3L14 9.2V3" />
      <path d="M7.5 14h9" />
    </svg>
  );
}

export function IconInstitution(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2 2 8h20L12 2Z" />
      <line x1="4" y1="8" x2="4" y2="20" />
      <line x1="9" y1="8" x2="9" y2="20" />
      <line x1="15" y1="8" x2="15" y2="20" />
      <line x1="20" y1="8" x2="20" y2="20" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

export function IconChat(props) {
  return (
    <svg {...base} {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
    </svg>
  );
}

export function IconHome(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}

export function IconChevronRight(props) {
  return (
    <svg {...base} {...props}>
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );
}

export function IconPin(props) {
  return (
    <svg {...base} {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function IconMail(props) {
  return (
    <svg {...base} {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  );
}

export function IconFacebook(props) {
  return (
    <svg {...base} {...props}>
      <path d="M14 9h3V5.6c-.5-.07-2.2-.22-3.2-.22-3.4 0-4.8 2.1-4.8 4.7V12H6v4h3v8h4v-8h3.4l.6-4H13V10.4c0-.9.2-1.4 1-1.4Z" />
    </svg>
  );
}

export function IconX(props) {
  return (
    <svg {...base} {...props}>
      <line x1="4" y1="4" x2="20" y2="20" />
      <line x1="20" y1="4" x2="4" y2="20" />
    </svg>
  );
}

export function IconLinkedIn(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="7" y1="10" x2="7" y2="17" />
      <circle cx="7" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
      <path d="M11 17v-4a2.2 2.2 0 0 1 4.4 0v4" />
      <line x1="11" y1="10" x2="11" y2="17" />
    </svg>
  );
}

export function IconYoutube(props) {
  return (
    <svg {...base} {...props}>
      <rect x="2" y="6" width="20" height="12" rx="4" />
      <polygon points="10.5 9.5 15.5 12 10.5 14.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconTelegram(props) {
  return (
    <svg {...base} {...props}>
      <path d="m21 4-18.4 7.2c-.8.3-.8 1.5.1 1.7l4.6 1.3 1.7 5.4c.2.7 1.1.9 1.6.4l2.6-2.5 4.6 3.4c.7.5 1.7.1 1.8-.7L22 4.9c.1-.7-.6-1.2-1-1Z" />
      <path d="M8.3 14.2 18 6.5" />
    </svg>
  );
}

export function IconCheck(props) {
  return (
    <svg {...base} {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function IconHandshake(props) {
  return (
    <svg {...base} {...props}>
      <path d="m11 12 2.5 2.5a1.5 1.5 0 0 0 2.12-2.12L13.5 10" />
      <path d="m8.5 15 1.5 1.5a1.5 1.5 0 0 0 2.12-2.12" />
      <path d="M2 10.5 6 6l4.5 1.5L13 5l4 2 5 3.5-3 3.5-3-2-4 4-2-1-3.5 3.5L2 14Z" />
    </svg>
  );
}

export function IconDownload(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v12" />
      <polyline points="7 10 12 15 17 10" />
      <path d="M4 19h16" />
    </svg>
  );
}