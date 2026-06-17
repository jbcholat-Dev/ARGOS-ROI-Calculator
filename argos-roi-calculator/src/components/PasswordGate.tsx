import { useState, useRef, useEffect } from 'react';
import type { FormEvent } from 'react';

const PASSWORD = 'argos2026';
const STORAGE_KEY = 'argos-auth';

function isAuthenticated(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function setAuthenticated() {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // ignore
  }
}

interface PasswordGateProps {
  children: React.ReactNode;
}

export function PasswordGate({ children }: PasswordGateProps) {
  const [unlocked, setUnlocked] = useState(isAuthenticated);
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!unlocked) inputRef.current?.focus();
  }, [unlocked]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value === PASSWORD) {
      setAuthenticated();
      setUnlocked(true);
    } else {
      setError(true);
      setShake(true);
      setValue('');
      setTimeout(() => setShake(false), 500);
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#F1F2F2] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-pfeiffer-red mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">ARGOS ROI Calculator</h1>
          <p className="text-sm text-gray-500 mt-1">Pfeiffer Vacuum — Accès restreint</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition-transform ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
        >
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Mot de passe
          </label>
          <input
            ref={inputRef}
            id="password"
            type="password"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false); }}
            placeholder="••••••••••"
            autoComplete="current-password"
            className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors
              ${error
                ? 'border-pfeiffer-red bg-red-50 focus:border-pfeiffer-red'
                : 'border-gray-300 focus:border-pfeiffer-red focus:ring-2 focus:ring-pfeiffer-red/20'
              }`}
          />
          {error && (
            <p className="mt-2 text-xs text-pfeiffer-red">Mot de passe incorrect.</p>
          )}
          <button
            type="submit"
            className="mt-4 w-full py-2.5 rounded-lg bg-pfeiffer-red text-white text-sm font-semibold hover:bg-pfeiffer-red-dark transition-colors"
          >
            Accéder
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Pfeiffer Vacuum SAS · Usage interne uniquement
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
