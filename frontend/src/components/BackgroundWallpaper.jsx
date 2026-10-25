export default function BackgroundWallpaper() {
  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-amber-400/[0.05] blur-[100px] dark:bg-amber-400/[0.08]" />
      <div className="absolute top-1/2 -left-40 h-[460px] w-[460px] -translate-y-1/2 rounded-full bg-primary/[0.03] blur-[120px] dark:bg-primary/[0.06]" />
      <div className="absolute -bottom-32 right-1/4 h-[380px] w-[380px] rounded-full bg-amber-500/[0.04] blur-[100px] dark:bg-amber-500/[0.06]" />
      <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center opacity-[0.035] transition-opacity duration-700 dark:opacity-[0.055]">
        <img src="/logo-mark.png" alt="" className="h-[280px] w-[280px] -rotate-6 object-contain filter drop-shadow-[0_0_60px_rgba(251,191,36,0.3)] sm:h-[420px] sm:w-[420px] md:h-[560px] md:w-[560px]" />
        <div className="mt-4 text-2xl font-black uppercase tracking-[0.25em] text-ink sm:text-4xl">BLINK<span className="font-black text-amber-500">EM</span></div>
      </div>
    </div>
  );
}
