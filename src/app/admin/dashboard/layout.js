'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/layout/AdminSidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';

export default function AdminDashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile, loading }    = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/admin/login'); return; }
    if (profile && profile.role !== 'admin') { router.replace('/dashboard'); }
  }, [user, profile, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-navy-700 border-t-gold-500 animate-spin" />
          <p className="text-slate-500 text-sm">Verifying admin access…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-navy-900 overflow-hidden">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          menuOpen={sidebarOpen}
          isAdmin={true}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
