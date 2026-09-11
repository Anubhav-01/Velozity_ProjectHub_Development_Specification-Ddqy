import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Layers, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'DEVELOPER' | 'PROJECT_MANAGER'>('DEVELOPER');

  const { login, isLoggingIn, loginError, register, isRegistering, registerError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await register({ name, email, password, role });
      } else {
        await login({ email, password });
      }
    } catch {
      // Error handled by TanStack mutation and displayed in UI
    }
  };

  // Quick helper to fill demo credentials
  const fillCredentials = (demoEmail: string, demoPass: string) => {
    setIsSignUp(false);
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  const rawError = isSignUp ? registerError : loginError;
  const errorMessage =
    (rawError as any)?.response?.data?.error?.message ||
    (rawError ? (isSignUp ? 'Registration failed. Check inputs.' : 'Invalid email or password') : '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-indigo-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-600/30">
            <Layers className="h-8 w-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white">
          ProjectPulse
        </h2>
        <p className="mt-1 text-center text-xs text-indigo-300 font-medium">
          Real-Time Agency Project Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-gray-100">
          {/* Header Tabs: Sign In / Sign Up */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                !isSignUp
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                isSignUp
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              <span>Create Account</span>
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="p-3 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {isSignUp && (
              <Input
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                required
              />
            )}

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@velozity.dev"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              helperText={
                isSignUp ? 'Min 8 chars with uppercase, lowercase, and a number' : undefined
              }
              required
            />

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Desired Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'DEVELOPER' | 'PROJECT_MANAGER')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="DEVELOPER">Developer (Work on assigned tasks)</option>
                  <option value="PROJECT_MANAGER">Project Manager (Create and manage projects)</option>
                </select>
              </div>
            )}

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isSignUp ? isRegistering : isLoggingIn}
            >
              <span>{isSignUp ? 'Create Account & Sign In' : 'Sign In'}</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          {/* Switch Mode Helper */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </button>
          </div>

          {/* Quick Demo Credentials Panel (shown in Sign In mode) */}
          {!isSignUp && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-3 text-center">
                Quick Demo Logins (Click to autofill)
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => fillCredentials('admin@velozity.dev', 'Admin123!')}
                  className="p-2 border border-gray-200 hover:border-indigo-500 rounded-lg text-left transition-colors bg-gray-50/50 hover:bg-indigo-50/30"
                >
                  <span className="block text-[11px] font-bold text-gray-800">Admin</span>
                  <span className="block text-[10px] text-gray-500">Alex Chen</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials('pm1@velozity.dev', 'Manager123!')}
                  className="p-2 border border-gray-200 hover:border-indigo-500 rounded-lg text-left transition-colors bg-gray-50/50 hover:bg-indigo-50/30"
                >
                  <span className="block text-[11px] font-bold text-gray-800">Project Mgr</span>
                  <span className="block text-[10px] text-gray-500">Sarah M.</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials('dev1@velozity.dev', 'Dev123!')}
                  className="p-2 border border-gray-200 hover:border-indigo-500 rounded-lg text-left transition-colors bg-gray-50/50 hover:bg-indigo-50/30"
                >
                  <span className="block text-[11px] font-bold text-gray-800">Developer</span>
                  <span className="block text-[10px] text-gray-500">Ravi Patel</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

