'use client';
import { useState } from 'react';
import { HelpCircle, Send, MessageSquare, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const faqs = [
  {
    q: 'How do I update my balance?',
    a: 'Balance is managed exclusively by administrators. Please contact support if you believe there is a discrepancy in your balance.',
  },
  {
    q: 'Can I change my email address?',
    a: 'Email address changes require admin assistance. Please submit a support request with your new email address.',
  },
  {
    q: 'How do I upload a profile picture?',
    a: 'Go to the Profile section in the sidebar and click the camera icon on your avatar to upload a new photo (max 5 MB).',
  },
  {
    q: 'What should I do if my account is suspended?',
    a: 'Contact the administration team via the support form below. Provide your full name and email for faster resolution.',
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-navy-700/50 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-3"
      >
        <span className="text-sm font-medium text-slate-200">{q}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gold-500 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
        )}
      </button>
      {open && <p className="text-sm text-slate-400 pb-4 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function SupportPage() {
  const { profile } = useAuth();
  const [form, setForm] = useState({ subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error('Please fill in all fields'); return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setForm({ subject: '', message: '' });
    toast.success('Support request sent! We\'ll respond within 24 hours.');
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Support</h1>
        <p className="text-slate-400 text-sm mt-1">Get help with your account or submit a request</p>
      </div>

      {/* FAQ */}
      <div className="dash-card">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-gold-500" />
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>
        {faqs.map((faq, i) => <FaqItem key={i} {...faq} />)}
      </div>

      {/* Contact form */}
      <div className="dash-card">
        <div className="flex items-center gap-2 mb-5">
          <MessageSquare className="w-5 h-5 text-gold-500" />
          <h2 className="section-title">Submit a Request</h2>
        </div>

        <div className="flex items-center gap-3 bg-navy-700/50 rounded-xl px-4 py-3 mb-5">
          <Mail className="w-4 h-4 text-gold-500 shrink-0" />
          <p className="text-sm text-slate-300">
            Sending as <span className="text-gold-400 font-medium">{profile?.email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              placeholder="Brief description of your issue"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              rows={5}
              placeholder="Describe your issue in detail…"
              className="input-field resize-none"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={sending} className="btn-gold flex items-center gap-2">
              {sending ? (
                <span className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
