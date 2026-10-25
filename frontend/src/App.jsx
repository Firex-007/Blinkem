import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from '../context/AppContext';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import RoleSwitcher from '../components/RoleSwitcher';
import BottomNav from '../components/BottomNav';
import Home from '../pages/customer/Home';

function Header() {
  const { userId } = useApp();
  const labels = { '1': 'Customer', '3': 'Worker', '99': 'Admin' };
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-surface border-b border-line">
      <Logo className="flex-shrink-0" />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <RoleSwitcher className="ml-2" />
      </div>
    </header>
  );
}

function Shell({ children }) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-[480px] bg-bg relative">
      <Header />
      <main className="flex-1 px-4 pb-24">{children}</main>
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
          <Route path="/worker" element={<Shell>Worker</Shell>} />
          <Route path="/admin" element={<Shell>Admin</Shell>} />
        </Routes>
      </Router>
    </AppProvider>
  );
}
