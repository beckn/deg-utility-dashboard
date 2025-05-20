export function DERMarker({ className = "" }) {
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
        fill="#f472b6"
        stroke="#be185d"
        strokeWidth="2"
      />
      <rect x="7" y="7" width="6" height="6" fill="#f9a8d4" />
    </svg>
  );
}
