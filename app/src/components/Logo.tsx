export default function Logo() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <circle cx="20" cy="20" r="17.5" fill="#0d0d0d" stroke="#ffcc33" strokeWidth="3" />
      <text
        x="20"
        y="26.5"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight={900}
        fontSize="15"
        letterSpacing="-0.5"
        fill="#ffffff"
      >
        JB
      </text>
    </svg>
  );
}
