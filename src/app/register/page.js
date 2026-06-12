'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus, BookOpen, Camera, User } from 'lucide-react';
import { supabase, uploadAvatar } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', address: '', password: '', confirmPass: '',
  });
  const [showPass, setShowPass]         = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [avatarFile, setAvatarFile]     = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileRef = useRef(null);
  const router  = useRouter();

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { fullName, email, phone, address, password, confirmPass } = form;
    if (!fullName || !email || !phone || !address || !password) {
      toast.error('Please fill in all required fields'); return;
    }
    if (password !== confirmPass) { toast.error('Passwords do not match'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;

      let pictureUrl = null;
      if (avatarFile && data?.user) {
        try {
          pictureUrl = await uploadAvatar(data.user.id, avatarFile);
        } catch {
          /* non-fatal — user can upload later */
        }
      }

      if (data?.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
          email,
          phone_number: phone,
          address,
          profile_picture: pictureUrl,
          role: 'author',
          status: 'active',
        });
      }

      if (data?.session) {
        toast.success('Account created! Welcome aboard.');
        router.push('/dashboard');
      } else {
        toast.success('Account created! Please check your email to confirm, then log in.');
        router.push('/login?message=confirm-email');
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/30 mb-4">
            <BookOpen className="w-8 h-8 text-gold-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400 text-sm mt-1">Join the Author Management System</p>
        </div>

        <div className="bg-navy-800 border border-navy-700 rounded-2xl p-8 shadow-card">
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Avatar upload */}
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="relative group"
              >
                <div className="w-24 h-24 rounded-2xl bg-navy-700 border-2 border-dashed border-navy-600
                                group-hover:border-gold-500 transition-colors overflow-hidden flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-navy-600 group-hover:text-gold-500 transition-colors" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gold-500 rounded-lg flex items-center justify-center shadow-md">
                  <Camera className="w-3.5 h-3.5 text-navy-900" />
                </div>
              </button>
              <p className="text-xs text-slate-500">Click to upload profile picture</p>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name <span className="text-red-400">*</span></label>
              <input type="text" value={form.fullName} onChange={set('fullName')}
                placeholder="John Doe" className="input-field" />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address <span className="text-red-400">*</span></label>
              <input type="email" value={form.email} onChange={set('email')}
                placeholder="john@example.com" className="input-field" />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number <span className="text-red-400">*</span></label>
              <input type="tel" value={form.phone} onChange={set('phone')}
                placeholder="+1 (555) 000-0000" className="input-field" />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Complete Address <span className="text-red-400">*</span></label>
              <textarea value={form.address} onChange={set('address')} rows={3}
                placeholder="123 Main St, City, State, ZIP" className="input-field resize-none" />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="Min. 6 characters" className="input-field pr-12" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-600 hover:text-gold-500 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} value={form.confirmPass} onChange={set('confirmPass')}
                  placeholder="Repeat password" className="input-field pr-12" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-600 hover:text-gold-500 transition-colors">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <span className="w-5 h-5 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
              ) : (
                <><UserPlus className="w-4 h-4" /> Create Account</>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-gold-500 hover:text-gold-400 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
