"use client";

import React, { useState } from 'react';
import { X, Phone, Lock, ChevronRight, Loader2, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/auth-store';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const AuthModal = () => {
  const { isAuthModalOpen, toggleAuthModal, login } = useAuthStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock authentication delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    login({
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      phone: phoneNumber,
      name: 'Jane Doe'
    });
    
    setIsLoading(false);
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center p-6">
      <div 
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={() => toggleAuthModal(false)}
      />
      
      <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-zinc-100">
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <ShieldCheck className="text-blue-600" size={28} strokeWidth={2.5} />
            </div>
            <button 
              onClick={() => toggleAuthModal(false)}
              className="p-2 hover:bg-zinc-50 rounded-full transition-colors"
            >
              <X size={20} className="text-zinc-400" />
            </button>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-zinc-900 mb-2">Secure Login</h2>
          <p className="text-zinc-500 text-sm font-medium mb-8">Enter your mobile number to sync your clinical history and medical records.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Mobile Number</label>
              <div className="relative flex items-center">
                <Phone className="absolute left-4 text-zinc-300" size={18} />
                <input 
                  required
                  type="tel"
                  placeholder="+91 00000 00000"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-zinc-900 outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">OTP / Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 text-zinc-300" size={18} />
                <input 
                  required
                  type="password"
                  placeholder="••••••"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-zinc-900 outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-zinc-900 text-white py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-zinc-800 active:scale-95 transition-all mt-6 uppercase tracking-tight"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <>Continue <ChevronRight size={20} strokeWidth={3} /></>}
            </button>
          </form>
          
          <p className="mt-8 text-[10px] text-zinc-400 text-center font-medium leading-relaxed">
            By continuing, you agree to Aegis's <span className="text-zinc-900 underline">Terms of Service</span> and <span className="text-zinc-900 underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};
