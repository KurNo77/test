'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  Search, UserX, UserCheck, Pencil, Trash2, X, Save, Users, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

function EditModal({ author, onClose, onSaved }) {
  const [form, setForm] = useState({
    full_name:    author.full_name    || '',
    phone_number: author.phone_number || '',
    address:      author.address      || '',
    status:       author.status       || 'active',
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({
        full_name:    form.full_name.trim(),
        phone_number: form.phone_number.trim(),
        address:      form.address.trim(),
        status:       form.status,
      }).eq('id', author.id);
      if (error) throw error;
      toast.success('Author updated');
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
      <div className="modal-box">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Edit Author</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name *</label>
            <input type="text" value={form.full_name} onChange={set('full_name')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <input type="email" value={author.email} disabled className="input-field opacity-50 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone</label>
            <input type="tel" value={form.phone_number} onChange={set('phone_number')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Address</label>
            <textarea value={form.address} onChange={set('address')} rows={2} className="input-field resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
            <select value={form.status} onChange={set('status')}
              className="input-field">
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-outline py-2.5 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 btn-gold flex items-center justify-center gap-2 py-2.5 text-sm">
              {saving ? <span className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" /> : <><Save className="w-3.5 h-3.5" />Save</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ author, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const doDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', author.id);
      if (error) throw error;
      toast.success(`${author.full_name} has been deleted`);
      onDeleted();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-sm">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Delete Author</h3>
          <p className="text-slate-400 text-sm">
            Are you sure you want to delete <span className="text-white font-semibold">{author.full_name}</span>?
            This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 btn-outline py-2.5 text-sm">Cancel</button>
          <button onClick={doDelete} disabled={deleting}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
            {deleting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthorsPage() {
  useAuth();
  const [authors, setAuthors]   = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(0);
  const [editTarget, setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchAuthors = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('profiles')
      .select('*', { count: 'exact' })
      .eq('role', 'author')
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (search.trim()) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, count, error } = await query;
    if (!error && data) {
      // Fetch balances separately to avoid RLS join issues
      const { data: balances } = await supabase
        .from('author_balances')
        .select('author_id, balance')
        .in('author_id', data.map((a) => a.id));

      const balMap = {};
      (balances || []).forEach((b) => { balMap[b.author_id] = b.balance; });

      setAuthors(data.map((a) => ({ ...a, balance: Number(balMap[a.id] ?? 0) })));
      setTotal(count || 0);
    }
    setLoading(false);
  }, [search, page]);

  useEffect(() => { fetchAuthors(); }, [fetchAuthors]);

  const toggleSuspend = async (author) => {
    const newStatus = author.status === 'active' ? 'suspended' : 'active';
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', author.id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Account ${newStatus === 'active' ? 'activated' : 'suspended'}`);
    fetchAuthors();
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Author Management</h1>
          <p className="text-slate-400 text-sm mt-1">{total} author{total !== 1 ? 's' : ''} registered</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-600" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          placeholder="Search by name or email…"
          className="input-field pl-11"
        />
      </div>

      {/* Table */}
      <div className="dash-card overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-navy-700 border-t-gold-500 rounded-full animate-spin" />
          </div>
        ) : authors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Users className="w-12 h-12 text-navy-700" />
            <p className="text-slate-500 text-sm">No authors found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="pl-6">Author</th>
                  <th>Phone</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th className="pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {authors.map((a) => (
                  <tr key={a.id}>
                    <td className="pl-6">
                      <div className="flex items-center gap-3">
                        {a.profile_picture ? (
                          <img src={a.profile_picture} alt={a.full_name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-gold-500/10 flex items-center justify-center shrink-0">
                            <span className="text-gold-500 text-xs font-bold">
                              {a.full_name?.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{a.full_name}</p>
                          <p className="text-xs text-slate-500 truncate">{a.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>{a.phone_number || <span className="text-navy-600">—</span>}</td>
                    <td>
                      <span className="text-gold-400 font-semibold">
                        ${Number(a.balance ?? 0).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span className={a.status === 'active' ? 'badge-active' : a.status === 'suspended' ? 'badge-suspended' : 'badge-pending'}>
                        {a.status}
                      </span>
                    </td>
                    <td>{format(new Date(a.created_at), 'MMM d, yyyy')}</td>
                    <td className="pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditTarget(a)}
                          className="p-2 rounded-lg text-slate-400 hover:text-gold-500 hover:bg-gold-500/10 transition-colors" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => toggleSuspend(a)}
                          className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                          title={a.status === 'active' ? 'Suspend' : 'Activate'}>
                          {a.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setDeleteTarget(a)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {editTarget  && <EditModal   author={editTarget}  onClose={() => setEditTarget(null)}  onSaved={fetchAuthors} />}
      {deleteTarget && <DeleteModal author={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={fetchAuthors} />}
    </div>
  );
}
