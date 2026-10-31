export default function BackgroundWallpaper() {
  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Subtle micro-grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.045]"
        style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      {/* Ambient caustic light pools (optimized: pure radial gradient with 0% GPU blur convolution cost) */}
      <div
        className="absolute -top-24 -right-24 h-[480px] w-[480px] rounded-full pointer-events-none opacity-40 dark:opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(251, 191, 36, 0.22) 0%, rgba(251, 191, 36, 0) 70%)' }}
      />
      <div
        className="absolute top-1/3 -left-36 h-[520px] w-[520px] -translate-y-1/2 rounded-full pointer-events-none opacity-40 dark:opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.20) 0%, rgba(59, 130, 246, 0) 70%)' }}
      />
      <div
        className="absolute -bottom-28 right-1/4 h-[440px] w-[440px] rounded-full pointer-events-none opacity-30 dark:opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, rgba(245, 158, 11, 0) 70%)' }}
      />

      {/* Central Watermark Brand Mark - Lightweight, crisp rendering */}
      <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center opacity-[0.06] transition-opacity duration-700 dark:opacity-[0.08]">
        <img
          src="/logo-mark.png"
          alt=""
          className="h-[280px] w-[280px] -rotate-6 object-contain sm:h-[420px] sm:w-[420px] md:h-[560px] md:w-[560px]"
        />
        <div className="mt-4 text-2xl font-black uppercase tracking-[0.25em] text-ink sm:text-4xl">
          BLINK<span className="font-black text-amber-500">EM</span>
        </div>
      </div>
    </div>
  );
}
