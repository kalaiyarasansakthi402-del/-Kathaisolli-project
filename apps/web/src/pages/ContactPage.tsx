import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, AlertCircle, Headphones, MapPin, Sparkles } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('அனைத்து புலங்களையும் நிரப்பவும் (Please fill out all required fields).');
      return;
    }

    setLoading(true);
    // Simulate real feedback processing and acknowledgment
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 700);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF7EE] dark:bg-[#03261C] text-[#173D2E] dark:text-[#F8F5E9] transition-colors">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F0E2] dark:bg-[#083325] border border-[#064E3B]/20 text-[#064E3B] dark:text-[#A7F3D0] text-xs font-bold tracking-wide">
            <Mail className="w-4 h-4" />
            <span>தொடர்புக்கு · Contact & Support</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-serif text-[#064E3B] dark:text-[#F8F5E9] tracking-tight">
            We’d Love to Hear from You
          </h1>
          <p className="text-sm font-tamil text-[#166534] dark:text-[#A7F3D0] font-semibold max-w-xl mx-auto">
            உங்கள் கருத்துக்கள், புதிய கதை பரிந்துரைகள் அல்லது உதவி தேவைகளுக்கு எங்களை தொடர்பு கொள்ளலாம்.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Details Card */}
          <div className="space-y-6 md:col-span-1">
            <div className="bg-white dark:bg-[#083325] p-6 rounded-3xl border border-[#E3DCBA] dark:border-[#124835] shadow-md space-y-4">
              <h3 className="text-lg font-bold font-serif text-[#064E3B] dark:text-[#F8F5E9]">
                Direct Inquiries
              </h3>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-1 shrink-0" />
                  <div>
                    <p className="font-bold">General & Creator Support</p>
                    <p className="text-stone-500 dark:text-stone-300">support@kathaisolli.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Headphones className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-1 shrink-0" />
                  <div>
                    <p className="font-bold">Audio & Studio Quality</p>
                    <p className="text-stone-500 dark:text-stone-300">audio@kathaisolli.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-1 shrink-0" />
                  <div>
                    <p className="font-bold">Headquarters</p>
                    <p className="text-stone-500 dark:text-stone-300">Chennai, Tamil Nadu, India</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#E8F0E2]/60 dark:bg-[#083325]/60 border border-[#064E3B]/20 text-xs space-y-2">
              <p className="font-bold text-[#064E3B] dark:text-[#A7F3D0] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Story Submissions
              </p>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed font-tamil">
                நீங்கள் ஒரு எழுத்தாளர் அல்லது கதைசொல்லியாக இருந்தால், படைப்பாளர் பிரிவில் பதிவு செய்து உங்கள் கதைகளை வெளியிடலாம்.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2 bg-white dark:bg-[#083325] p-8 sm:p-10 rounded-[32px] border-2 border-[#E3DCBA] dark:border-[#124835] shadow-xl">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h3 className="text-xl font-bold font-serif text-[#064E3B] dark:text-[#F8F5E9]">
                  நன்றி! உங்கள் செய்தி பெறப்பட்டது.
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out. Our editorial team reviews every message and will respond to your inquiry shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setName('');
                    setEmail('');
                    setSubject('');
                    setMessage('');
                  }}
                  className="mt-4 px-6 py-2.5 rounded-full bg-[#064E3B] text-white text-xs font-bold hover:bg-[#166534] transition-all"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#173D2E] dark:text-stone-200 mb-1.5 font-sans">
                      Your Name (உங்கள் பெயர்) *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Kalaiyarasan"
                      className="w-full px-4 py-3 rounded-2xl border border-[#D5CEBA] dark:border-[#124835] bg-[#F8F5E9]/60 dark:bg-[#033B2B]/60 text-sm text-[#173D2E] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#064E3B] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#173D2E] dark:text-stone-200 mb-1.5 font-sans">
                      Email Address (மின்னஞ்சல்) *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-4 py-3 rounded-2xl border border-[#D5CEBA] dark:border-[#124835] bg-[#F8F5E9]/60 dark:bg-[#033B2B]/60 text-sm text-[#173D2E] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#064E3B] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#173D2E] dark:text-stone-200 mb-1.5 font-sans">
                    Subject (பொருள்)
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Feedback, New Story Request, Question"
                    className="w-full px-4 py-3 rounded-2xl border border-[#D5CEBA] dark:border-[#124835] bg-[#F8F5E9]/60 dark:bg-[#033B2B]/60 text-sm text-[#173D2E] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#064E3B] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#173D2E] dark:text-stone-200 mb-1.5 font-sans">
                    Message (செய்தி) *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message here..."
                    className="w-full px-4 py-3 rounded-2xl border border-[#D5CEBA] dark:border-[#124835] bg-[#F8F5E9]/60 dark:bg-[#033B2B]/60 text-sm text-[#173D2E] dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#064E3B] transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-full bg-[#064E3B] hover:bg-[#166534] text-white font-bold text-sm shadow-xl shadow-emerald-950/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {loading ? 'அனுப்புகிறது...' : 'Send Message (செய்தி அனுப்பு)'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
