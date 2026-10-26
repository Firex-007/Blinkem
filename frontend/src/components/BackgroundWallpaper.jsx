export default function BackgroundWallpaper() {
  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Subtle micro-grid texture */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.045]" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      {/* Ambient caustic light pools for glass refraction */}
      <div className="absolute -top-24 -right-24 h-[480px] w-[480px] rounded-full bg-amber-400/[0.08] blur-[110px] dark:bg-amber-400/[0.11]" />
      <div className="absolute top-1/3 -left-36 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-blue-500/[0.07] blur-[130px] dark:bg-blue-600/[0.12]" />
      <div className="absolute -bottom-28 right-1/4 h-[440px] w-[440px] rounded-full bg-amber-500/[0.06] blur-[110px] dark:bg-amber-500/[0.08]" />

      {/* Central Watermark Brand Mark - Perfectly calibrated to gleam under liquid glass */}
      <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center opacity-[0.075] transition-opacity duration-700 dark:opacity-[0.095]">
        <img
          src="/logo-mark.png"
          alt=""
          className="h-[280px] w-[280px] -rotate-6 object-contain filter drop-shadow-[0_0_80px_rgba(251,191,36,0.35)] sm:h-[420px] sm:w-[420px] md:h-[560px] md:w-[560px]"
        />
        <div className="mt-4 text-2xl font-black uppercase tracking-[0.25em] text-ink sm:text-4xl">
          BLINK<span className="font-black text-amber-500">EM</span>
        </div>
      </div>
    </div>
  );
}
