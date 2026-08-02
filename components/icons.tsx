import type { SVGProps } from "react";

/** Shared icon set — thin-stroke line icons, 1.5 viewBox grid. */

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

type IconProps = SVGProps<SVGSVGElement>;

export function ArrowUpRight(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...stroke} {...props}>
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

export function ArrowRight(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...stroke} {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function ArrowLeft(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...stroke} {...props}>
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}

export function ArrowDown(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...stroke} {...props}>
      <path d="M12 5v14" />
      <path d="m6 13 6 6 6-6" />
    </svg>
  );
}

export function Clock(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...stroke} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function Calendar(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...stroke} {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="1" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" />
    </svg>
  );
}

export function Tag(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...stroke} {...props}>
      <path d="M4 4h7l9 9-7 7-9-9V4Z" />
      <circle cx="8.5" cy="8.5" r="1.2" />
    </svg>
  );
}

export function Search(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...stroke} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function Filter(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...stroke} {...props}>
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

export function X(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...stroke} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function Copy(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...stroke} {...props}>
      <rect x="9" y="9" width="11" height="11" rx="1" />
      <path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5" />
    </svg>
  );
}

export function Check(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...stroke} {...props}>
      <path d="m4.5 12.5 5 5L20 7" />
    </svg>
  );
}

export function Menu(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...stroke} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function ExternalLink(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...stroke} {...props}>
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

export function Terminal(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...stroke} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="1" />
      <path d="m7 9 3 3-3 3M13 15h4" />
    </svg>
  );
}

export function Target(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...stroke} {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.5" />
    </svg>
  );
}

export function Trophy(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...stroke} {...props}>
      <path d="M8 4h8v6a4 4 0 0 1-8 0V4Z" />
      <path d="M8 5H4.5v1.5a4 4 0 0 0 3 3.9M16 5h3.5v1.5a4 4 0 0 1-3 3.9" />
      <path d="M12 14v3.5M8.5 20.5h7M10 17.5h4" />
    </svg>
  );
}

export function Flame(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...stroke} {...props}>
      <path d="M12 21c4 0 7-2.7 7-7 0-3.2-1.9-5.6-3.9-8-.8 1.6-1.6 2.4-2.6 2.9 0-2.8-1.2-5.2-2.8-6.9.2 2.6-.6 4.2-2 5.6C6 9 5 10.8 5 14c0 4.3 3 7 7 7Z" />
    </svg>
  );
}

export function Star(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...stroke} {...props}>
      <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
    </svg>
  );
}

export function Lock(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...stroke} {...props}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="1" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function Bug(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...stroke} {...props}>
      <path d="M12 19a5 5 0 0 0 5-5v-3a5 5 0 0 0-10 0v3a5 5 0 0 0 5 5Z" />
      <path d="M12 19v4M9 11 5 8M15 11l4-3M9 15H5M15 15h4M12 8V4" />
    </svg>
  );
}

export function Flag(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...stroke} {...props}>
      <path d="M5 21V4" />
      <path d="M5 4h12l-2.5 3.5L17 11H5" />
    </svg>
  );
}

export function Github(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...stroke} {...props}>
      <path d="M9 19c-4 1.5-4-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
    </svg>
  );
}

export function Download(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...stroke} {...props}>
      <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

export function Shield(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...stroke} {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function Cpu(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...stroke} {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M15 2v2M9 2v2M15 20v2M9 20v2M20 15h2M20 9h2M2 15h2M2 9h2" />
    </svg>
  );
}

export function Mail(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...stroke} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="m3.5 7 7.2 6a2 2 0 0 0 2.6 0l7.2-6" />
    </svg>
  );
}

export function MapPin(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...stroke} {...props}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

