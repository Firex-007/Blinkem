import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronLeft, MapPin } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import Logo from './components/Logo';
import BackgroundWallpaper from './components/BackgroundWallpaper';
import ThemeToggle from './components/ThemeToggle';
import RoleSwitcher from './components/RoleSwitcher';
import LangToggle from './components/LangToggle';
import BottomNav from './components/BottomNav';
import LocationModal from './components/LocationModal';
import LoginModal from './components/LoginModal';
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
  const { location: userLocation, setIsLocationModalOpen, currentUser } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const isRoot = ['/', '/worker', '/admin', '/profile'].includes(location.pathname);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/bookings', label: 'Bookings' },
    { path: '/profile', label: 'Account' },
  ];

  return (
    <header className="app-header glass sticky top-0 z-40 border-b border-line">
      {/* Mobile Header (< md) */}
      <div className="md:hidden flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isRoot && (
              <button
                onClick={() => navigate(-1)}
                aria-label="Back"
                className="w-9 h-9 rounded-full bg-surface2 flex items-center justify-center text-ink hover:bg-soft transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <Logo className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')} />
          </div>
          <RoleSwitcher />
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-line/60">
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-700 text-ink max-w-[210px] truncate"
            title="Change service area"
          >
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="truncate">{userLocation?.name || 'T. Nagar'}, Chennai</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted flex-shrink-0" />
          </button>
          <div className="flex items-center gap-1.5">
            <LangToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Desktop Header (>= md) */}
      <div className="hidden md:flex items-center justify-between gap-6">
        {/* Left: Logo & Location */}
        <div className="flex items-center gap-4">
          <Logo className="cursor-pointer" onClick={() => navigate('/')} />
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-pill hover:border-primary transition text-xs font-700 text-ink shadow-sm group"
            title="Change service area"
          >
            <MapPin className="w-4 h-4 text-primary flex-shrink-0 group-hover:scale-110 transition" />
            <span>{userLocation?.name || 'T. Nagar'}, Chennai</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted group-hover:text-primary transition" />
          </button>
        </div>

        {/* Center: Desktop Nav Links */}
        <nav className="flex items-center gap-1 bg-surface2/70 p-1 rounded-full border border-line">
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

        {/* Right: Tools & Portal Switcher & Profile Avatar */}
        <div className="flex items-center gap-2">
          <LangToggle />
          <ThemeToggle />
          <RoleSwitcher />
          <button
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-800 shadow-md hover:scale-105 transition ml-1"
            style={{ backgroundColor: currentUser?.avatarColor || '#1F5BFF' }}
            title={`Account: ${currentUser?.name || 'User'}`}
            aria-label="Account Profile"
          >
            {currentUser?.name ? currentUser.name[0] : 'U'}
          </button>
        </div>
      </div>
    </header>
  );
}

function Shell({ children }) {
  const { isLocationModalOpen, setIsLocationModalOpen, isLoginModalOpen, setIsLoginModalOpen } = useApp();
  return (
    <div className="nodi-shell">
      <Header />
      <main className="app-main">{children}</main>
      <div className="md:hidden">
        <BottomNav />
      </div>
      <LocationModal open={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} />
      <LoginModal open={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BackgroundWallpaper />
      <Router>
        <Routes>
          <Route path="/" element={<Shell><Home /></Shell>} />
          <Route path="/request/new" element={<Shell><RequestForm /></Shell>} />
          <Route path="/request/:id/searching" element={<Shell><Searching /></Shell>} />
          <Route path="/request/:id/offers" element={<Shell><Offers /></Shell>} />
          <Route path="/booking/:id" element={<Shell><Tracking /></Shell>} />
          <Route path="/booking/:id/complete" element={<Shell><Complete /></Shell>} />
          <Route path="/bookings" element={<Shell><Bookings /></Shell>} />
          <Route path="/profile" element={<Shell><Profile /></Shell>} />
          <Route path="/worker" element={<Shell><WorkerHome /></Shell>} />
          <Route path="/worker/job/:id" element={<Shell><ActiveJob /></Shell>} />
          <Route path="/admin" element={<Shell><AdminConsole /></Shell>} />
        </Routes>
      </Router>
    </AppProvider>
  );
}
