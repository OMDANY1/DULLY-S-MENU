import Image from "next/image";

interface BrandLogoProps {
  className?: string;
  size?: number;
  priority?: boolean;
}

export default function BrandLogo({ className = "", size = 48, priority = true }: BrandLogoProps) {
  return (
    <div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}>
      <Image
        src="/brand/dullys-logo.png"
        alt="DULLY'S"
        width={size}
        height={size}
        priority={priority}
        className="object-contain"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    </div>
  );
}
