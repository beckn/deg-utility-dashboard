export function TransformerMarker({ className = "" }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 20 20"
    >
      <polygon
        points="10,3 17,17 3,17"
        fill="#38bdf8"
        stroke="#0ea5e9"
        strokeWidth="2"
      />
    </svg>
  );
}
