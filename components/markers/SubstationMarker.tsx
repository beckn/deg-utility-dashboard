import Image from "next/image";

export function SubstationMarker({ className = "" }) {
  return (
    <Image src="/feeders.svg" width={200} height={200} alt="Feeder Marker" />
  );
}
