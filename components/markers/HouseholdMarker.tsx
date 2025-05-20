export function HouseholdMarker({ className = "" }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 20 20"
    >
      <rect
        x="5"
        y="8"
        width="10"
        height="7"
        fill="#4ade80"
        stroke="#166534"
        strokeWidth="2"
      />
      <polygon points="10,4 16,8 4,8" fill="#bbf7d0" />
    </svg>
  );
}
