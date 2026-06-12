'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  Search, ShieldCheck, ShieldOff, UserCheck, UserX,
  ChevronLeft, ChevronRight, X, AlertTriangle, Users,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

const ROLE_FILTERS  = ['all', 'author', 'admin'];
const STATUS_OPTS   = ['active', 'suspended', 'pending'];

function RoleBadge({ role }) {
  return role === 'admin'
    ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gold-500/10 text-gold-400 border border-gold-500/20"><ShieldCheck className="w-3 h-3" />Admin</span>
    : <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/40 text-blue-400 border border-blue-800">Author</span>;
}

function RoleChangeModal({ user, onClose, onSaved }) {
  const isPromoting = user.role === 'author';
  const [confirming, setConfirming] = useState(false);

  const confirm = async () => {
    setConfirming(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: isPromoting ? 'admin' : 'author' })
        .eq('id', user.id);
      if (error) throw error;
      toast.success(`${user.full_name} is now ${isPromoting ? 'an Admin' : 'an Author'}`);
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-sm">
        <div className="text-center">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isPromoting ? 'bg-gold-500/10 border border-gold-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
            {isPromoting ? <ShieldCheck className="w-6 h-6 text-gold-400" /> : <ShieldOff className="w-6 h-6 text-red-400" />}
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            {isPromoting ? 'Promote to Admin' : 'Demote to Author'}
          </h3>
          <p className="text-slate-400 text-sm">
            {isPromoting
              ? <>Promote <span className="text-white font-semibold">{user.full_name}</span> to Admin? They will gain full admin access.</>
              : <>Demote <span className="text-white font-semibold">{user.full_name}</span> to Author? They will lose admin access immediately.</>
            }
          </p>
          {isPromoting && (
            <div className="mt-3 flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-left">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300">They must sign out and log in via the Admin login page to access admin features.</p>
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-outline py-2.5 text-sm">Cancel</button>
          <button
            onClick={confirm}
            disabled={confirming}
            className={`flex-1 font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors ${isPromoting ? 'bg-gold-500 hover:bg-gold-400 text-navy-900' : 'bg-red-500 hover:bg-red-600 text-white'}`}
          >
            {confirming
              ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              : isPromoting ? 'Promote' : 'Demote'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusModal({ user, onClose, onSaved }) {
  const [status, setStatus]   = useState(user.status);
  const [saving, setSaving]   = useState(false);

  const save = async () => {
    if (status === user.status) { onClose(); return; }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', user.id);
      if (error) throw error;
      toast.success('Status updated');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Change Status</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-slate-400 text-sm mb-4">
          Update account status for <span className="text-white font-semibold">{user.full_name}</span>
        </p>
        <div className="space-y-2">
          {STATUS_OPTS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
                status === s
                  ? s === 'active'    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : s === 'suspended' ? 'bg-red-500/10 border-red-500/40 text-red-400'
                                      : 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                  : 'border-navy-700 text-slate-400 hover:border-navy-600 hover:text-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${s === 'active' ? 'bg-emerald-400' : s === 'suspended' ? 'bg-red-400' : 'bg-amber-400'}`} />
              <span className="capitalize">{s}</span>
              {status === s && <span className="ml-auto text-xs">Selected</span>}
            </button>
          ))}
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 btn-outline py-2.5 text-sm">Cancel</button>
          <button onClick={save} disabled={saving} className="flex-1 btn-gold py-2.5 text-sm flex items-center justify-center gap-2">
            {saving ? <span className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" /> : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PermissionsPage() {
  const { profile: adminProfile } = useAuth();
  const [users, setUsers]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage]         = useState(0);
  const [roleTarget, setRoleTarget]     = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (roleFilter !== 'all') query = query.eq('role', roleFilter);
    if (search.trim())        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);

    const { data, count, error } = await query;
    if (!error) { setUsers(data || []); setTotal(count || 0); }
    setLoading(false);
  }, [search, roleFilter, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Roles & Permissions</h1>
        <p className="text-slate-400 text-sm mt-1">Manage user roles and account statuses</p>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search by name or email…"
            className="input-field pl-11"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          {ROLE_FILTERS.map((r) => (
            <button
              key={r}
              onClick={() => { setRoleFilter(r); setPage(0); }}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all capitalize ${
                roleFilter === r
                  ? 'bg-gold-500/10 border-gold-500/30 text-gold-400'
                  : 'border-navy-700 text-slate-400 hover:border-navy-600 hover:text-slate-200'
              }`}
            >
              {r === 'all' ? `All (${total})` : r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="dash-card overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-navy-700 border-t-gold-500 rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Users className="w-12 h-12 text-navy-700" />
            <p className="text-slate-500 text-sm">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="pl-6">User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th className="pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.id === adminProfile?.id;
                  return (
                    <tr key={u.id}>
                      <td className="pl-6">
                        <div className="flex items-center gap-3">
                          {u.profile_picture ? (
                            <img src={u.profile_picture} alt={u.full_name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${u.role === 'admin' ? 'bg-gold-500/10' : 'bg-blue-500/10'}`}>
                              <span className={`text-xs font-bold ${u.role === 'admin' ? 'text-gold-500' : 'text-blue-400'}`}>
                                {u.full_name?.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-white truncate">{u.full_name}</p>
                              {isSelf && <span className="text-xs text-navy-600 font-medium">(you)</span>}
                            </div>
                            <p className="text-xs text-slate-500 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td><RoleBadge role={u.role} /></td>
                      <td>
                        <span className={u.status === 'active' ? 'badge-active' : u.status === 'suspended' ? 'badge-suspended' : 'badge-pending'}>
                          {u.status}
                        </span>
                      </td>
                      <td>{format(new Date(u.created_at), 'MMM d, yyyy')}</td>
                      <td className="pr-6">
                        <div className="flex items-center justify-end gap-1">
                          {!isSelf && (
                            <>
                              <button
                                onClick={() => setRoleTarget(u)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                  u.role === 'author'
                                    ? 'text-gold-400 hover:bg-gold-500/10 border border-gold-500/20'
                                    : 'text-red-400 hover:bg-red-500/10 border border-red-500/20'
                                }`}
                                title={u.role === 'author' ? 'Promote to Admin' : 'Demote to Author'}
                              >
                                {u.role === 'author' ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                                {u.role === 'author' ? 'Promote' : 'Demote'}
                              </button>
                              <button
                                onClick={() => setStatusTarget(u)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-navy-700 border border-navy-700 transition-colors"
                                title="Change Status"
                              >
                                {u.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                                Status
                              </button>
                            </>
                          )}
                          {isSelf && <span className="text-xs text-navy-600 px-2">Cannot edit self</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-navy-700">
            <p className="text-sm text-slate-400">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => p - 1)} disabled={page === 0}
                className="p-2 rounded-lg border border-navy-700 text-slate-400 hover:text-white hover:border-gold-500 disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}
                className="p-2 rounded-lg border border-navy-700 text-slate-400 hover:text-white hover:border-gold-500 disabled:opacity-30 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {roleTarget   && <RoleChangeModal user={roleTarget}   onClose={() => setRoleTarget(null)}   onSaved={fetchUsers} />}
      {statusTarget && <StatusModal     user={statusTarget} onClose={() => setStatusTarget(null)} onSaved={fetchUsers} />}
    </div>
  );
}
