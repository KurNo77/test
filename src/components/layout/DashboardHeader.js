'use client';
import { useState } from 'react';
import { Menu, X, Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function DashboardHeader({ onMenuToggle, menuOpen, isAdmin = false }) {
  const { profile, signOut, adminSignOut } = useAuth();
  const [showDropdown, setShowDropdown]   = useState(false);

  const handleSignOut = () => {
    if (isAdmin) adminSignOut();
    else signOut();
  };


  return (
    <header className="h-16 bg-navy-800 border-b border-navy-700 flex items-center justify-between px-4 lg:px-6 shrink-0 z-30 relative">
      {/* Left: Hamburger + Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-700 transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

      </div>

      {/* Right: User info + actions */}
      <div className="flex items-center gap-2">
        {/* Notification bell (author only) */}
        {!isAdmin && (
          <button className="p-2 rounded-lg text-slate-400 hover:text-gold-500 hover:bg-navy-700 transition-colors relative">
            <Bell className="w-5 h-5" />
          </button>
        )}

        {/* Avatar + Name + Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl hover:bg-navy-700 transition-colors"
          >
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-white leading-none">
                {isAdmin ? 'Welcome, Administrator' : (profile?.full_name || 'Loading…')}
              </p>
              <p className="text-xs text-slate-500 leading-none mt-0.5 capitalize">{profile?.role}</p>
            </div>
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-navy-800 border border-navy-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-navy-700">
                <p className="text-sm font-medium text-white truncate">{profile?.full_name}</p>
                <p className="text-xs text-slate-500 truncate">{profile?.email}</p>
              </div>
              <button
                onClick={() => { setShowDropdown(false); handleSignOut(); }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
