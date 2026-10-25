import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import Logo from './components/Logo';
import ThemeToggle from './components/ThemeToggle';
import RoleSwitcher from './components/RoleSwitcher';
import LangToggle from './components/LangToggle';
import BottomNav from './components/BottomNav';
import Home from './pages/customer/Home';
import RequestForm from './pages/customer/RequestForm';
import Searching from './pages/customer/Searching';
import Offers from './pages/customer/Offers';
import Tracking from './pages/customer/Tracking';
import Complete from './pages/customer/Complete';
import Bookings from './pages/customer/Bookings';

function Header() {
  const { lang } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const isRoot = ['/', '/worker', '/admin'].includes(location.pathname);

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-surface border-b border-line sticky top-0 z-30">
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
        <Logo className="flex-shrink-0" />
        <div className="flex items-center gap-1.5 text-xs font-700 text-muted">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary" /> <span className="font-700 text-ink">T. Nagar ▾</span>
          </span>
          <LangToggle />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <RoleSwitcher className="ml-1" />
      </div>
    </header>
  );
}

function Shell({ children }) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-[480px] bg-bg relative flex flex-col shadow-sm">
      <Header />
      <main className="flex-1 px-4 py-4 pb-24">{children}</main>
      <BottomNav />
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
          <Route path="/worker" element={<Shell><div className="p-4 text-center text-muted">Worker Home (Phase 6)</div></Shell>} />
          <Route path="/worker/job/:id" element={<Shell><div className="p-4 text-center text-muted">Active Job (Phase 6)</div></Shell>} />
          <Route path="/admin" element={<Shell><div className="p-4 text-center text-muted">Admin Console (Phase 7)</div></Shell>} />
        </Routes>
      </Router>
    </AppProvider>
  );
}
