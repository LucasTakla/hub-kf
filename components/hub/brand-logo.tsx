import Image from "next/image";

type BrandLogoProps = {
  variant?: "white" | "primary";
  className?: string;
};

export function BrandLogo({
  variant = "white",
  className = "h-9 w-auto max-w-[180px]",
}: BrandLogoProps) {
  const src =
    variant === "white" ? "/logos/logo-white.png" : "/logos/logo-primary.png";

  return (
    <Image
      src={src}
      alt="Kapital Funding"
      width={446}
      height={107}
      className={`object-contain object-left ${className}`}
      priority
    />
  );
}
