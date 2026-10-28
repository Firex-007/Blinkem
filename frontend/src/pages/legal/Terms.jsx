import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FileText,
  Shield,
  Lock,
  MapPin,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Building2,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import LiquidGlass from '../../components/LiquidGlass';

export default function Terms({ tab: initialTab = 'terms' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    location.pathname.includes('privacy') ? 'privacy' : initialTab
  );

  useEffect(() => {
    if (location.pathname.includes('privacy')) {
      setActiveTab('privacy');
    } else {
      setActiveTab('terms');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 animate-fadeIn pb-32">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface2 hover:bg-soft text-ink text-xs font-700 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Hero Header */}
      <LiquidGlass radius={24} glow={1.05} className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-soft text-primary text-xs font-800 tracking-wide uppercase">
              <Shield className="w-3.5 h-3.5" />
              <span>Legal & Compliance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-900 text-ink tracking-tight">
              {activeTab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
            </h1>
            <p className="text-xs sm:text-sm text-muted">
              Effective Date: October 2026 • Platform: Blink'em Technologies Inc.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-surface2/90 rounded-2xl border border-line self-start sm:self-center">
            <button
              onClick={() => {
                setActiveTab('terms');
                window.history.replaceState(null, '', '/terms');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-800 transition ${
                activeTab === 'terms'
                  ? 'bg-primary text-onprimary shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Terms of Service
            </button>
            <button
              onClick={() => {
                setActiveTab('privacy');
                window.history.replaceState(null, '', '/privacy');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-800 transition ${
                activeTab === 'privacy'
                  ? 'bg-primary text-onprimary shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </LiquidGlass>

      {/* Content Container */}
      <div className="glass-card rounded-[24px] border border-line p-6 sm:p-10 space-y-8 text-ink text-sm sm:text-[15px] leading-relaxed shadow-sm">
        {activeTab === 'terms' ? (
          /* ================= TERMS OF SERVICE ================= */
          <div className="space-y-8">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-lg font-800 text-ink flex items-center gap-2 pb-1 border-b border-line">
                <span className="w-6 h-6 rounded-full bg-primary-soft text-primary text-xs font-900 flex items-center justify-center">
                  1
                </span>
                Platform Overview & Acceptance
              </h2>
              <p className="text-muted leading-relaxed">
                Welcome to <strong>Blink'em</strong>. By accessing our mobile application, website,
                or requesting on-demand blue-collar services, you agree to be bound by these Terms of
                Service. If you do not agree with any part of these terms, please do not use or access
                the platform.
              </p>
              <p className="text-muted leading-relaxed">
                Blink'em provides an online technology marketplace connecting consumers who require
                home repair and maintenance services ("Customers") with local verified technicians,
                contractors, and professionals ("Service Partners" or "Workers").
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-lg font-800 text-ink flex items-center gap-2 pb-1 border-b border-line">
                <span className="w-6 h-6 rounded-full bg-primary-soft text-primary text-xs font-900 flex items-center justify-center">
                  2
                </span>
                Independent Contractor Relationship
              </h2>
              <div className="p-4 rounded-card bg-surface2/60 border border-line text-xs sm:text-sm text-ink space-y-2">
                <div className="font-800 flex items-center gap-1.5 text-primary">
                  <CheckCircle2 className="w-4 h-4" />
                  Marketplace Facilitator Notice
                </div>
                <p className="text-muted">
                  Blink'em is a technology platform and does not provide plumbing, electrical, carpentry,
                  cleaning, or other artisanal services directly. All Service Partners listed on Blink'em
                  are independent contractors and are not employees, joint venturers, or agents of Blink'em.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-lg font-800 text-ink flex items-center gap-2 pb-1 border-b border-line">
                <span className="w-6 h-6 rounded-full bg-primary-soft text-primary text-xs font-900 flex items-center justify-center">
                  3
                </span>
                User Accounts, Authentication & Mobile OTP
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-muted">
                <li>
                  <strong>Phone Verification:</strong> To request or fulfill jobs, you must authenticate
                  using a valid 10-digit mobile number via One-Time Password (OTP) verification.
                </li>
                <li>
                  <strong>Account Security:</strong> You are responsible for maintaining the confidentiality
                  of your login credentials and devices. Never share OTP codes with unauthorized third parties.
                </li>
                <li>
                  <strong>Rate Limiting & Anti-Abuse:</strong> To prevent fraud and network degradation,
                  OTP requests are rate-limited to 30-second cooldown intervals. Repeated automated requests
                  will result in temporary suspension.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-lg font-800 text-ink flex items-center gap-2 pb-1 border-b border-line">
                <span className="w-6 h-6 rounded-full bg-primary-soft text-primary text-xs font-900 flex items-center justify-center">
                  4
                </span>
                Job Requests, Dynamic Bidding & Counter-Offers
              </h2>
              <p className="text-muted leading-relaxed">
                When a Customer creates a service request (via voice command or category selection), nearby
                online Service Partners review the request and submit individual price quotations.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted">
                <li>
                  <strong>Transparent Bidding:</strong> Workers quote their own competitive rates based on
                  job scope, distance, and time of day.
                </li>
                <li>
                  <strong>Customer Counter-Offer:</strong> Customers may accept an offer directly or submit
                  a single counter-offer. Once accepted by either party, a binding booking is created.
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-lg font-800 text-ink flex items-center gap-2 pb-1 border-b border-line">
                <span className="w-6 h-6 rounded-full bg-primary-soft text-primary text-xs font-900 flex items-center justify-center">
                  5
                </span>
                4-Digit Security Start OTP & Safety Guarantee
              </h2>
              <div className="p-4 rounded-card bg-primary-soft/50 border border-primary/20 space-y-2 text-xs sm:text-sm">
                <span className="font-800 text-primary block">
                  Mandatory Job Start Verification
                </span>
                <p className="text-ink/80 leading-relaxed">
                  Upon booking, the platform generates a unique <strong>4-digit Start OTP</strong> for the
                  Customer. The Customer must only share this OTP with the Service Partner once the worker
                  has physically arrived at the premises and inspected the job. The job cannot begin
                  digitally without this code.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-lg font-800 text-ink flex items-center gap-2 pb-1 border-b border-line">
                <span className="w-6 h-6 rounded-full bg-primary-soft text-primary text-xs font-900 flex items-center justify-center">
                  6
                </span>
                Payments, Cancellations & Dispute Resolution
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-muted">
                <li>
                  <strong>Payment Settlement:</strong> Payment is due immediately upon completion of the service
                  and customer confirmation through digital UPI or direct cash settlement as agreed.
                </li>
                <li>
                  <strong>Free Cancellation:</strong> Customers may cancel a booking free of charge at any time
                  prior to the Service Partner arriving on-site.
                </li>
                <li>
                  <strong>Dispute Resolution:</strong> If a customer is unsatisfied with the craftsmanship,
                  our support desk facilitates immediate remediation or alternative technician dispatch.
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="text-lg font-800 text-ink flex items-center gap-2 pb-1 border-b border-line">
                <span className="w-6 h-6 rounded-full bg-primary-soft text-primary text-xs font-900 flex items-center justify-center">
                  7
                </span>
                Limitation of Liability
              </h2>
              <p className="text-muted leading-relaxed">
                To the fullest extent permitted by applicable Indian laws, Blink'em shall not be liable for
                indirect, incidental, or consequential damages resulting from third-party services.
                The platform's aggregate liability for verified claims shall not exceed the total fee paid
                for the specific service booking in question.
              </p>
            </section>
          </div>
        ) : (
          /* ================= PRIVACY POLICY ================= */
          <div className="space-y-8">
            {/* Privacy Section 1 */}
            <section className="space-y-3">
              <h2 className="text-lg font-800 text-ink flex items-center gap-2 pb-1 border-b border-line">
                <span className="w-6 h-6 rounded-full bg-primary-soft text-primary text-xs font-900 flex items-center justify-center">
                  1
                </span>
                Information We Collect
              </h2>
              <p className="text-muted leading-relaxed">
                We collect personal information necessary to deliver, maintain, and optimize our hyperlocal
                service marketplace:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted">
                <li>
                  <strong>Identity & Contact Details:</strong> Name, phone number (+91), email address,
                  and profile avatar.
                </li>
                <li>
                  <strong>Hyperlocal Location Data:</strong> Precise GPS coordinates (latitude/longitude),
                  city, neighborhood, and PIN code to match you with nearby available workers.
                </li>
                <li>
                  <strong>Audio Voice Data (Optional):</strong> Voice recordings captured via the microphone
                  are processed strictly for natural language transcription to extract service requirements
                  and are never sold or retained for advertising.
                </li>
                <li>
                  <strong>Booking & Review Data:</strong> Service history, ratings, feedback, and quotations.
                </li>
              </ul>
            </section>

            {/* Privacy Section 2 */}
            <section className="space-y-3">
              <h2 className="text-lg font-800 text-ink flex items-center gap-2 pb-1 border-b border-line">
                <span className="w-6 h-6 rounded-full bg-primary-soft text-primary text-xs font-900 flex items-center justify-center">
                  2
                </span>
                How We Use Your Data
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-card bg-surface2/60 border border-line space-y-1">
                  <div className="font-800 text-ink text-xs sm:text-sm flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" />
                    Hyperlocal Dispatch
                  </div>
                  <p className="text-xs text-muted">
                    Calculating distance radii and dispatching the closest available technicians to your area.
                  </p>
                </div>
                <div className="p-3.5 rounded-card bg-surface2/60 border border-line space-y-1">
                  <div className="font-800 text-ink text-xs sm:text-sm flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-primary" />
                    Security & Fraud Prevention
                  </div>
                  <p className="text-xs text-muted">
                    Verifying OTP credentials, enforcing rate limiting, and protecting customer identity.
                  </p>
                </div>
              </div>
            </section>

            {/* Privacy Section 3 */}
            <section className="space-y-3">
              <h2 className="text-lg font-800 text-ink flex items-center gap-2 pb-1 border-b border-line">
                <span className="w-6 h-6 rounded-full bg-primary-soft text-primary text-xs font-900 flex items-center justify-center">
                  3
                </span>
                Data Sharing & Third Parties
              </h2>
              <p className="text-muted leading-relaxed">
                <strong>We never sell your personal data.</strong> Your data is shared strictly on a need-to-know basis:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-muted">
                <li>
                  <strong>Assigned Service Partner:</strong> Only your first name, neighborhood address, and
                  job description are shared with the worker after you accept their offer.
                </li>
                <li>
                  <strong>Infrastructure Partners:</strong> Secure cloud database (Supabase/PostgreSQL) and
                  SMS verification infrastructure (Firebase Identity Platform).
                </li>
              </ul>
            </section>

            {/* Privacy Section 4 */}
            <section className="space-y-3">
              <h2 className="text-lg font-800 text-ink flex items-center gap-2 pb-1 border-b border-line">
                <span className="w-6 h-6 rounded-full bg-primary-soft text-primary text-xs font-900 flex items-center justify-center">
                  4
                </span>
                Cookies & Storage
              </h2>
              <p className="text-muted leading-relaxed">
                Blink'em uses essential cookies and local storage tokens solely to maintain your login session,
                language preferences, and active booking state. We do not use intrusive cross-site tracking cookies.
              </p>
            </section>

            {/* Privacy Section 5 */}
            <section className="space-y-3">
              <h2 className="text-lg font-800 text-ink flex items-center gap-2 pb-1 border-b border-line">
                <span className="w-6 h-6 rounded-full bg-primary-soft text-primary text-xs font-900 flex items-center justify-center">
                  5
                </span>
                User Rights & Contact Us
              </h2>
              <p className="text-muted leading-relaxed">
                You have the right to request deletion or modification of your account data at any time.
                For privacy inquiries or grievance redressal:
              </p>
              <div className="p-4 rounded-card bg-surface2/60 border border-line text-xs space-y-1.5 font-600">
                <p className="text-ink">Grievance & Privacy Officer: Blink'em Technologies</p>
                <p className="text-muted">Email: legal@blinkem.in • support@blinkem.in</p>
                <p className="text-muted">Headquarters: Indiranagar, Bengaluru, Karnataka, India</p>
              </div>
            </section>
          </div>
        )}

        {/* Bottom Navigation between Terms and Privacy */}
        <div className="pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-muted">
            Questions regarding our policies? Contact{' '}
            <a href="mailto:support@blinkem.in" className="text-primary font-700 hover:underline">
              support@blinkem.in
            </a>
          </span>
          <button
            onClick={() => {
              const next = activeTab === 'terms' ? 'privacy' : 'terms';
              setActiveTab(next);
              window.history.replaceState(null, '', `/${next}`);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-4 py-2 rounded-full bg-surface2 hover:bg-soft text-ink font-700 transition"
          >
            Switch to {activeTab === 'terms' ? 'Privacy Policy' : 'Terms of Service'} →
          </button>
        </div>
      </div>
    </div>
  );
}
