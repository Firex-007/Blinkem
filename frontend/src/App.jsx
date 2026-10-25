import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronDown, User, MapPin } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import Logo from './components/Logo';
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

  return (
    <header className="flex items-center justify-between px-4 py-3 glass border-b border-line sticky top-0 z-30">
      <div className="flex items-center gap-2">
        {!isRoot && (
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="w-8 h-8 rounded-full bg-surface2 flex items-center justify-center text-ink hover:bg-soft transition mr-1"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <Logo className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')} />
        
        {/* Interactive Location Selector Button */}
        <button
          onClick={() => setIsLocationModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-pill text-xs font-700 text-ink hover:border-primary transition group shadow-sm"
          title="Click to select or detect your location in Chennai"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
          <span className="truncate max-w-[90px]">{userLocation?.name || 'T. Nagar'}</span>
          <ChevronDown className="w-3 h-3 text-muted group-hover:text-primary transition" />
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <LangToggle />
        <ThemeToggle />
        <RoleSwitcher className="ml-0.5" />
        
        {/* User Profile Avatar Icon */}
        <button
          onClick={() => navigate('/profile')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-800 shadow-sm hover:scale-105 transition ml-1"
          style={{ backgroundColor: currentUser?.avatarColor || '#1F5BFF' }}
          title={`Signed in as ${currentUser?.name || 'User'}`}
          aria-label="Go to Profile"
        >
          {currentUser?.name ? currentUser.name[0] : 'U'}
        </button>
      </div>
    </header>
  );
}

function Shell({ children }) {
  const { isLocationModalOpen, setIsLocationModalOpen, isLoginModalOpen, setIsLoginModalOpen } = useApp();
  return (
    <div className="mx-auto min-h-dvh w-full max-w-[480px] md:max-w-[540px] bg-bg relative flex flex-col shadow-2xl md:my-5 md:rounded-[32px] md:border md:border-line/80 overflow-hidden">
      <Header />
      <main className="flex-1 px-4 py-4 pb-24">{children}</main>
      <BottomNav />
      <LocationModal open={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} />
      <LoginModal open={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
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
