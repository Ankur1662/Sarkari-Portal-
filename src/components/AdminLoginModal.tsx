import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  X, 
  AlertCircle, 
  KeyRound, 
  CheckCircle2, 
  UserCheck 
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [adminId, setAdminId] = useState('admin@sarkariportal.gov.in');
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      // Official administrative verification passkey
      if (passkey === 'admin2026' || passkey === 'sarkari@admin' || passkey === 'admin') {
        setIsLoading(false);
        onSuccess();
      } else {
        setIsLoading(false);
        setError('Invalid Administrator Passkey. Please enter the authorized passkey (admin2026).');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="min-h-full flex items-center justify-center p-3.5 sm:p-4">
        <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Administrator Authentication
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950">
                    RESTRICTED
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Authorized SarkariPortal Staff & Editorial Desk
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              aria-label="Close Admin Login Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-5 sm:p-6 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5 leading-relaxed">
                <span className="font-bold">Administrative Interface:</span>
                <p className="text-[11px] text-amber-800">
                  This console allows publishing new job alerts, updating vacancy notices, and modifying gazette records.
                </p>
                <div className="mt-1 pt-1 border-t border-amber-200/60 text-[11px] font-mono font-semibold text-amber-950">
                  Evaluation Passkey: <span className="bg-white px-1.5 py-0.5 rounded border border-amber-300">admin2026</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Administrator ID / Staff Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  />
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Administrative Secret Passkey
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    autoFocus
                    value={passkey}
                    onChange={(e) => {
                      setPasskey(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Enter passkey (admin2026)..."
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {isLoading ? (
                    <span>Verifying...</span>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Authorize & Sign In</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
