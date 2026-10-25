export default function BackgroundWallpaper() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* Subtle modern SaaS dot-grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Ambient glowing radial orbs */}
      <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-amber-400/[0.05] dark:bg-amber-400/[0.08] blur-[100px]" />
      <div className="absolute top-1/2 -left-40 -translate-y-1/2 w-[460px] h-[460px] rounded-full bg-primary/[0.03] dark:bg-primary/[0.06] blur-[120px]" />
      <div className="absolute -bottom-32 right-1/4 w-[380px] h-[380px] rounded-full bg-amber-500/[0.04] dark:bg-amber-500/[0.06] blur-[100px]" />

      {/* Central Large Brand Watermark (The Golden 3D Origami "B" Structure) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center opacity-[0.035] dark:opacity-[0.055] transition-opacity duration-700 pointer-events-none">
        <img
          src="/logo-mark.png"
          alt=""
          className="w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] md:w-[560px] md:h-[560px] object-contain filter drop-shadow-[0_0_60px_rgba(251,191,36,0.3)] -rotate-6"
        />
        <div className="mt-4 tracking-[0.25em] font-black text-2xl sm:text-4xl text-ink uppercase">
          BLINK<span className="text-amber-500 font-black">EM</span>
        </div>
      </div>

      {/* Static Footer Brand Stamp: Made with love in Chennai */}
      <div className="absolute bottom-20 md:bottom-4 left-0 right-0 flex flex-col items-center justify-center gap-1 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-line/40 bg-surface/30 dark:bg-surface/20 backdrop-blur-[2px]">
          <span className="text-[11px] sm:text-xs font-bold tracking-wider uppercase text-muted/60 dark:text-muted/50">
            Made with <span className="text-red-500/80 inline-block animate-pulse">❤️</span> in Chennai
          </span>
          <span className="text-muted/30 text-[10px]">•</span>
          <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase text-amber-500/70 dark:text-amber-400/60">
            Blink'em
          </span>
        </div>
        <div className="text-[10px] tracking-widest font-semibold uppercase text-muted/35 dark:text-muted/30">
          Hyperlocal On-Demand Infrastructure
        </div>
      </div>
    </div>
  );
}
