export function AllMarker({ className = "" }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 20 20"
    >
      <circle
        cx="10"
        cy="10"
        r="8"
        fill="#64748b"
        stroke="#334155"
        strokeWidth="2"
      />
    </svg>
  );
}
