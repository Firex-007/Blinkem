export default function Footer() {
  return (
    <footer className="w-full border-t border-line bg-surface/80 dark:bg-surface/70 backdrop-blur-md transition-colors mt-auto relative z-10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-8 flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
        {/* Left: Copyright */}
        <div className="text-xs sm:text-sm text-muted font-medium select-none">
          © Blink'em Hyperlocal Services Private Limited, 2024–2026
        </div>

        {/* Center: Download App Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="text-xs sm:text-sm font-bold text-ink select-none mr-1">
            Download App
          </span>

          {/* App Store Badge */}
          <a
            href="#download-ios"
            onClick={(e) => {
              e.preventDefault();
              alert('Blink\'em iOS app is coming soon to the App Store!');
            }}
            className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#0E131F] text-white hover:bg-black transition-all duration-200 border border-white/10 shadow-sm hover:scale-[1.02] group"
            title="Download on the App Store"
          >
            {/* Apple Icon */}
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.67-1.09 1.74-.96 2.77 1.01.08 2.07-.52 2.69-1.27z" />
            </svg>
            <div className="flex flex-col text-left leading-none">
              <span className="text-[9px] uppercase tracking-wider text-gray-300 font-medium">
                Download on the
              </span>
              <span className="text-xs font-bold text-white tracking-tight mt-0.5">
                App Store
              </span>
            </div>
          </a>

          {/* Google Play Badge */}
          <a
            href="#download-android"
            onClick={(e) => {
              e.preventDefault();
              alert('Blink\'em Android app is coming soon to Google Play!');
            }}
            className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#0E131F] text-white hover:bg-black transition-all duration-200 border border-white/10 shadow-sm hover:scale-[1.02] group"
            title="Get it on Google Play"
          >
            {/* Google Play Triangle Icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M3.6 2.26L13.88 12.5 3.6 22.74C3.24 22.38 3 21.84 3 21.15V3.85c0-.69.24-1.23.6-1.59z"
              />
              <path
                fill="#FBBC04"
                d="M17.43 8.97L13.88 12.5l3.55 3.53 4.05-2.34c.78-.45.78-1.19 0-1.64l-4.05-2.08z"
              />
              <path
                fill="#EA4335"
                d="M3.6 22.74L13.88 12.5l3.55 3.53-8.8 5.09c-.83.48-1.92.35-2.67-.18l-2.36-1.87c.21.37.5.7.84.97z"
              />
              <path
                fill="#34A853"
                d="M3.6 2.26c.75-.53 1.84-.66 2.67-.18l8.8 5.09L13.88 12.5 3.6 2.26z"
              />
            </svg>
            <div className="flex flex-col text-left leading-none">
              <span className="text-[9px] uppercase tracking-wider text-gray-300 font-medium">
                GET IT ON
              </span>
              <span className="text-xs font-bold text-white tracking-tight mt-0.5">
                Google Play
              </span>
            </div>
          </a>
        </div>

        {/* Right: Circular Social Media Links */}
        <div className="flex items-center justify-center gap-3">
          {/* Facebook */}
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="w-10 h-10 rounded-full bg-[#181C26] dark:bg-[#151D33] text-white hover:bg-[#1877F2] hover:text-white transition-all duration-200 flex items-center justify-center shadow-md hover:scale-110 border border-white/10"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
            </svg>
          </a>

          {/* X / Twitter */}
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (Twitter)"
            className="w-10 h-10 rounded-full bg-[#181C26] dark:bg-[#151D33] text-white hover:bg-black hover:text-white transition-all duration-200 flex items-center justify-center shadow-md hover:scale-110 border border-white/10"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          {/* Instagram */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="w-10 h-10 rounded-full bg-[#181C26] dark:bg-[#151D33] text-white hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:text-white transition-all duration-200 flex items-center justify-center shadow-md hover:scale-110 border border-white/10"
          >
            <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>

          {/* LinkedIn */}
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="w-10 h-10 rounded-full bg-[#181C26] dark:bg-[#151D33] text-white hover:bg-[#0A66C2] hover:text-white transition-all duration-200 flex items-center justify-center shadow-md hover:scale-110 border border-white/10"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 2a2 2 0 11-2 2 2 2 0 012-2z" />
            </svg>
          </a>

          {/* Threads */}
          <a
            href="https://threads.net"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Threads"
            className="w-10 h-10 rounded-full bg-[#181C26] dark:bg-[#151D33] text-white hover:bg-black hover:text-white transition-all duration-200 flex items-center justify-center shadow-md hover:scale-110 border border-white/10"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
