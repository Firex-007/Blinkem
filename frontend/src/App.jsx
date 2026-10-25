import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronLeft, MapPin } from 'lucide-react';
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
  const { location: userLocation, setIsLocationModalOpen } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const isRoot = ['/', '/worker', '/admin', '/profile'].includes(location.pathname);

  return (
    <header className="app-header">
      <div className="app-header-top">
        <div className="flex items-center gap-2">
        {!isRoot && (
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="icon-touch mr-1"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <Logo className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')} />
        
        </div>
        <RoleSwitcher />
      </div>
      <div className="app-header-bottom">
        <button onClick={() => setIsLocationModalOpen(true)} className="location-control" title="Change area">
          <MapPin className="h-5 w-5" />
          <span>{userLocation?.name || 'T. Nagar'}, Chennai</span>
          <ChevronDown className="h-4 w-4" />
        </button>
        <div className="header-tools"><LangToggle /><ThemeToggle /></div>
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
