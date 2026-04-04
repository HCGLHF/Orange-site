/** 品牌橙子图标，可作站点角标；配色与 tailwind `brand-orange` 一致。 */
export function OrangeMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M16 3.5c-.8 1.6-2.4 3.8-1.8 5.8 1.4-.6 2.8-2.8 1.8-5.8z"
        fill="#5C9E6E"
      />
      <path
        d="M16 7.5v1.2"
        stroke="#4A7C59"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="19" r="11" fill="#E07A5F" />
      <ellipse cx="11.5" cy="15.5" rx="4" ry="2.8" fill="#F4B5A0" opacity="0.55" />
      <path
        d="M10 24c2.2 1.8 5.5 2 9.5.5"
        stroke="#C96B52"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}
