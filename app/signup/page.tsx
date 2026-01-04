"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { signup, signInWithGoogle } from '@/backend/actions/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      const submissionData = new FormData();
      submissionData.append('name', `${formData.firstname} ${formData.lastname}`);
      submissionData.append('username', formData.username);
      submissionData.append('email', formData.email);
      submissionData.append('password', formData.password);

      const result = await signup(submissionData);

      if (result.error) {
        setError(result.error);
      } else {
        router.push('/login');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-[460px]">
        <div className="bg-black border border-zinc-800 rounded-[32px] overflow-hidden shadow-2xl">
          <div className="p-10 pb-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-cyan-400"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-xl font-bold text-white mb-2">Create a Twinkle Account</h1>
              <p className="text-sm text-zinc-400">Welcome! Create an account to get started</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg text-center">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white ml-2">Firstname</label>
                  <input
                    type="text"
                    name="firstname"
                    required
                    value={formData.firstname}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-zinc-600 transition h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white ml-2">Lastname</label>
                  <input
                    type="text"
                    name="lastname"
                    required
                    value={formData.lastname}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-zinc-600 transition h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-white ml-2">Username</label>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-zinc-600 transition h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-white ml-2">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-zinc-600 transition h-12"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-2 mr-2">
                  <label className="text-sm font-semibold text-white">Password</label>
                  <Link href="/forgot-password" className="text-xs font-semibold text-zinc-300 hover:text-white transition">
                    Forgot your Password ?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-zinc-600 transition h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-white ml-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-zinc-600 transition h-12"
                />
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full h-12 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition flex items-center justify-center mt-8"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign Up'}
              </button>

              <div className="relative flex items-center justify-center py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800 border-dashed"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black px-4 text-zinc-500 font-medium">Or continue With</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading || googleLoading}
                  className="flex items-center justify-center gap-3 h-12 px-4 bg-black border border-zinc-800 rounded-xl text-white text-sm font-semibold hover:bg-zinc-900 transition disabled:opacity-50"
                >
                  {googleLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Google
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-3 h-12 px-4 bg-black border border-zinc-800 rounded-xl text-white text-sm font-semibold hover:bg-zinc-900 transition"
                  disabled={loading || googleLoading}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <rect x="1" y="1" width="10" height="10" fill="#f25022" />
                    <rect x="13" y="1" width="10" height="10" fill="#7fbb00" />
                    <rect x="1" y="13" width="10" height="10" fill="#00a1f1" />
                    <rect x="13" y="13" width="10" height="10" fill="#ffbb00" />
                  </svg>
                  Microsoft
                </button>
              </div>
            </form>
          </div>

          <div className="bg-zinc-900/30 p-8 border-t border-zinc-800/50 text-center">
            <p className="text-sm text-zinc-400">
              Have an account ?{' '}
              <Link href="/login" className="text-white font-bold hover:underline ml-1">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
