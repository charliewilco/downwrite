import Image from "next/image";

export function LandingPageImage(): JSX.Element {
  return (
    <object className="max-w-lg mx-auto">
      <Image
        alt="Downwrite Logo"
        className="mx-auto block grayscale-50 object-contain"
        src="/static/landing.png"
        width={128}
        height={128}
      />
    </object>
  );
}
