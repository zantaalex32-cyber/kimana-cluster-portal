import React, { useState } from 'react';
import { PRIMARY_CLUSTER_ID, getLocalities, submitAccessRequest } from '../lib/db';
import { CheckCircle2, AlertCircle, ArrowLeft, Send } from 'lucide-react';

interface RequestAccessPageProps {
  onNavigate: (path: string) => void;
}

export const RequestAccessPage: React.FC<RequestAccessPageProps> = ({ onNavigate }) => {
  const localities = getLocalities(PRIMARY_CLUSTER_ID);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [localityId, setLocalityId] = useState(localities[0]?.id || '');
  const [reason, setReason] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await submitAccessRequest({
        cluster_id: PRIMARY_CLUSTER_ID,
        full_name: fullName,
        email,
        phone,
        locality_id: localityId,
        reason,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-emerald-900/10 bg-white p-6 sm:p-10 shadow-xs">
        {submitted ? (
          <div className="text-center space-y-4 py-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-emerald-950">
              Access Request Submitted
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Thank you, <strong>{fullName}</strong>. Your request to access the Kimana Cluster Portal has been
              received with status <span className="font-semibold text-emerald-800">PENDING</span>.
            </p>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              A cluster administrator will review your application, verify your locality affiliation, and assign your role.
              You will be notified once reviewed.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => onNavigate('/')}
                className="rounded-xl border border-emerald-900/15 px-4 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-50"
              >
                Back to Home
              </button>
              <button
                onClick={() => onNavigate('/login')}
                className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-900 shadow-xs"
              >
                Go to Sign In
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-800 hover:text-emerald-950 mb-4 font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-emerald-950">Request Access</h1>
              <p className="text-xs text-slate-600 leading-relaxed">
                Internal access is granted to verified community members and coordinators.
                Please provide accurate details so the administrative team can confirm your affiliation.
              </p>
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-950">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Mary Wanjiku"
                  className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3 text-xs text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-emerald-950">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3 text-xs text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-950">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+254 7..."
                    className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3 text-xs text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-950">Locality *</label>
                <select
                  value={localityId}
                  onChange={(e) => setLocalityId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 py-2.5 px-3 text-xs text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                >
                  {localities.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-500">
                  Select your residential or coordinating locality within Kimana Cluster.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-950">
                  Reason for Requesting Access *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe your involvement in cluster activities (e.g., attending devotional meetings, coordinating study circles, participating in educational programs)..."
                  className="mt-1 w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl bg-emerald-800 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-900 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Request'}</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
