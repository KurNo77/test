'use client';
import { useState, useRef } from 'react';
import { Camera, Save, User } from 'lucide-react';
import { supabase, uploadAvatar } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const [saving, setSaving]         = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview]       = useState(null);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    full_name:    profile?.full_name    || '',
    phone_number: profile?.phone_number || '',
    address:      profile?.address      || '',
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) { toast.error('Full name is required'); return; }
    setSaving(true);
    try {
      let pictureUrl = profile?.profile_picture;

      if (avatarFile) {
        pictureUrl = await uploadAvatar(profile.id, avatarFile);
      }

      const { error } = await supabase.from('profiles').update({
        full_name:       form.full_name.trim(),
        phone_number:    form.phone_number.trim(),
        address:         form.address.trim(),
        profile_picture: pictureUrl,
      }).eq('id', profile.id);

      if (error) throw error;
      refreshProfile();
      setAvatarFile(null);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const currentPic = preview || profile?.profile_picture;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Update your personal information and profile picture</p>
      </div>

      <form onSubmit={handleSave}>
        <div className="dash-card space-y-6">
          {/* Avatar section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-navy-700">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-navy-700 border-2 border-navy-600 group-hover:border-gold-500 transition-colors">
                {currentPic ? (
                  <img src={currentPic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-10 h-10 text-navy-500" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center shadow-md hover:bg-gold-400 transition-colors"
              >
                <Camera className="w-4 h-4 text-navy-900" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>
            <div>
              <p className="text-white font-semibold">{profile?.full_name}</p>
              <p className="text-slate-400 text-sm">{profile?.email}</p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-gold-500 hover:text-gold-400 text-sm font-medium mt-2 transition-colors"
              >
                Change photo
              </button>
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.full_name}
                onChange={set('full_name')}
                className="input-field"
                placeholder="Your full name"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="input-field opacity-50 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed here.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
              <input
                type="tel"
                value={form.phone_number}
                onChange={set('phone_number')}
                className="input-field"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Complete Address</label>
              <textarea
                value={form.address}
                onChange={set('address')}
                rows={3}
                className="input-field resize-none"
                placeholder="Street, City, State, ZIP"
              />
            </div>
          </div>

          {/* Balance (read-only) */}
          <div className="bg-gold-500/5 border border-gold-500/20 rounded-xl p-4">
            <p className="text-xs text-gold-500 font-semibold uppercase tracking-wider mb-1">Current Balance (Read-Only)</p>
            <p className="text-slate-300 text-sm">Balance is managed exclusively by administrators and cannot be modified here.</p>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving} className="btn-gold flex items-center gap-2">
              {saving ? (
                <span className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
