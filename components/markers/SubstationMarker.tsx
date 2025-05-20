export function SubstationMarker({ className = "" }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 20 20"
    >
      <rect
        x="4"
        y="4"
        width="12"
        height="12"
        rx="2"
        fill="#f59e42"
        stroke="#b45309"
        strokeWidth="2"
      />
    </svg>
  );
}
