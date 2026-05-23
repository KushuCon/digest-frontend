"use client";
/**
 * Subtle, GPU-cheap animated gradient backdrop.
 * Pure CSS — no video, respects prefers-reduced-motion via Tailwind animate.
 */
export function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-32 h-[42rem] w-[42rem] rounded-full bg-primary/20 blur-3xl animate-aurora" />
      <div className="absolute top-1/3 -right-32 h-[36rem] w-[36rem] rounded-full bg-[hsl(220_90%_60%/0.18)] blur-3xl animate-aurora [animation-delay:-6s]" />
      <div className="absolute -bottom-40 left-1/3 h-[40rem] w-[40rem] rounded-full bg-[hsl(280_80%_65%/0.12)] blur-3xl animate-aurora [animation-delay:-12s]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black, transparent 70%)",
        }}
      />
    </div>
  );
}
