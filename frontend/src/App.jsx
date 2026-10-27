import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { ChevronDown, ChevronLeft, MapPin } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import Logo from './components/Logo';
import BackgroundWallpaper from './components/BackgroundWallpaper';
import ThemeToggle from './components/ThemeToggle';
import RoleSwitcher from './components/RoleSwitcher';
import LangToggle from './components/LangToggle';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import AccountFlyout from './components/AccountFlyout';
import CookieBanner from './components/CookieBanner';
import LocationModal from './components/LocationModal';
import LoginModal from './components/LoginModal';
import Login from './pages/auth/Login';
import Home from './pages/customer/Home';
import RequestForm from './pages/customer/RequestForm';
import Searching from './pages/customer/Searching';
import Offers from './pages/customer/Offers';
import Tracking from './pages/customer/Tracking';
import Complete from './pages/customer/Complete';
import Bookings from './pages/customer/Bookings';
import Profile from './pages/customer/Profile';
import WorkerHome from './pages/worker/WorkerHome';
import ActiveJob from './pages/worker/ActiveJob';
import AdminConsole from './pages/admin/AdminConsole';

function Header() {
  const {
    location: userLocation,
    setIsLocationModalOpen,
    currentUser,
    isAccountFlyoutOpen,
    setIsAccountFlyoutOpen,
  } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const isRoot = ['/', '/worker', '/admin', '/profile'].includes(location.pathname);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/bookings', label: 'Bookings' },
  ];

  return (
    <header className="app-header w-full liquid-glass sticky top-0 z-40 border-b border-line/60">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Mobile / Tablet Compact Header (< lg) */}
        <div className="lg:hidden flex flex-col gap-2 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {!isRoot && (
                <button
                  onClick={() => navigate(-1)}
                  aria-label="Back"
                  className="w-8 h-8 rounded-full bg-surface2 flex items-center justify-center text-ink hover:bg-soft transition flex-shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <Logo className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')} />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <RoleSwitcher />
              {isAuthenticated ? (
                <button
                  onClick={() => setIsAccountFlyoutOpen((prev) => !prev)}
                  className="w-8 h-8 rounded-full overflow-hidden shadow-sm border border-line ring-2 ring-primary/20 flex-shrink-0"
                  title="Account Menu"
                  aria-label="Account Menu"
                >
                  <img
                    src={
                      currentUser?.avatarUrl ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                        currentUser?.name || 'User'
                      )}&backgroundColor=2563EB`
                    }
                    alt={currentUser?.name || 'Account'}
                    className="w-full h-full object-cover"
                  />
                </button>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-3 py-1.5 rounded-full bg-primary text-onprimary text-xs font-800 shadow-sm hover:bg-primary600 transition flex-shrink-0"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-line/50 text-xs">
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-1.5 font-700 text-ink max-w-[200px] truncate"
              title="Change service area"
            >
              <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="truncate">
                {userLocation?.name || 'Select Location'}
                {userLocation?.city ? `, ${userLocation.city}` : ''}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-muted flex-shrink-0" />
            </button>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <LangToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Desktop Header (>= lg) */}
        <div className="hidden lg:flex items-center justify-between gap-4 h-16">
          {/* Left: Logo & Location */}
          <div className="flex items-center gap-4 min-w-0">
            <Logo className="cursor-pointer flex-shrink-0" onClick={() => navigate('/')} />
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-pill hover:border-primary transition text-xs font-700 text-ink shadow-sm group flex-shrink-0"
              title="Change service area"
            >
              <MapPin className="w-4 h-4 text-primary flex-shrink-0 group-hover:scale-110 transition" />
              <span className="truncate max-w-[190px]">
                {userLocation?.name || 'Select Location'}
                {userLocation?.city ? `, ${userLocation.city}` : ''}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-muted group-hover:text-primary transition" />
            </button>
          </div>

          {/* Center: Desktop Nav Links */}
          <nav className="flex items-center gap-1 bg-surface2/70 p-1 rounded-full border border-line flex-shrink-0">
            {navLinks.map((item) => {
              const isActive = item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`px-4 py-1.5 rounded-full text-xs font-800 transition ${
                    isActive
                      ? 'bg-primary text-onprimary shadow-sm'
                      : 'text-muted hover:text-ink hover:bg-surface2'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right: Tools & Portal Switcher & Account Dropdown Button (Blinkit style) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <LangToggle />
            <ThemeToggle />
            <RoleSwitcher />
            {isAuthenticated ? (
              <button
                onClick={() => setIsAccountFlyoutOpen((prev) => !prev)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition text-xs font-800 shadow-sm ml-1 ${
                  isAccountFlyoutOpen
                    ? 'bg-primary text-onprimary border-primary ring-2 ring-primary/30'
                    : 'glass-pill text-ink hover:border-primary'
                }`}
                title="Account Menu"
                aria-expanded={isAccountFlyoutOpen}
              >
                <div className="w-5 h-5 rounded-full overflow-hidden shadow-xs flex-shrink-0 border border-line/80">
                  <img
                    src={
                      currentUser?.avatarUrl ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                        currentUser?.name || 'User'
                      )}&backgroundColor=2563EB`
                    }
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="max-w-[100px] truncate">{currentUser?.name || 'Account'}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isAccountFlyoutOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-4 py-1.5 rounded-full bg-primary text-onprimary text-xs font-800 shadow-sm hover:bg-primary600 transition ml-1"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function Shell({ children }) {
  const {
    isLocationModalOpen,
    setIsLocationModalOpen,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isAccountFlyoutOpen,
    setIsAccountFlyoutOpen,
  } = useApp();

  return (
    <div className="min-h-screen flex flex-col w-full bg-transparent">
      <Header />
      <main className="app-main flex-1 w-full flex flex-col">{children}</main>
      <Footer />
      <div className="lg:hidden">
        <BottomNav />
      </div>
      <AccountFlyout
        open={isAccountFlyoutOpen}
        onClose={() => setIsAccountFlyoutOpen(false)}
      />
      <LocationModal open={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} />
      <LoginModal open={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <CookieBanner />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AppProvider>
      <BackgroundWallpaper />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Shell><Home /></Shell>} />
          <Route path="/request/new" element={<ProtectedRoute><Shell><RequestForm /></Shell></ProtectedRoute>} />
          <Route path="/request/:id/searching" element={<ProtectedRoute><Shell><Searching /></Shell></ProtectedRoute>} />
          <Route path="/request/:id/offers" element={<ProtectedRoute><Shell><Offers /></Shell></ProtectedRoute>} />
          <Route path="/booking/:id" element={<ProtectedRoute><Shell><Tracking /></Shell></ProtectedRoute>} />
          <Route path="/booking/:id/complete" element={<ProtectedRoute><Shell><Complete /></Shell></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><Shell><Bookings /></Shell></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Shell><Profile /></Shell></ProtectedRoute>} />
          <Route path="/worker" element={<ProtectedRoute><Shell><WorkerHome /></Shell></ProtectedRoute>} />
          <Route path="/worker/job/:id" element={<ProtectedRoute><Shell><ActiveJob /></Shell></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Shell><AdminConsole /></Shell></ProtectedRoute>} />
        </Routes>
      </Router>
    </AppProvider>
  );
}
