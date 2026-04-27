'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Lock, Mail } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push('/admin/dashboard');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      router.push('/admin/dashboard');
    } catch (err: any) {
      console.error('Login Error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha incorretos');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Muitas tentativas. Tente novamente mais tarde.');
      } else {
        setError('Ocorreu um erro ao tentar entrar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9FC] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Image */}
      <div className="fixed inset-0 z-0 overflow-hidden flex items-center justify-center bg-white">
        <img 
          src="/fundopage.png" 
          alt="" 
          className="w-full h-full object-cover opacity-40 transition-all duration-1000"
        />
      </div>
      {/* Background decoration matching the main theme */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-25 overflow-hidden flex items-center justify-center">
        <img 
          src="/fundopage.png" 
          alt="" 
          className="w-full h-full object-contain object-center"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white border border-[#9A86B3]/30 p-10 shadow-sm relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="font-script text-5xl text-[#9A86B3] mb-2">Área dos Papais</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#4A4453] font-bold">Acesso Restrito</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <label className="block text-[11px] uppercase tracking-[0.3em] text-[#9A86B3] font-bold mb-2">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A86B3]" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-[#9A86B3]/30 py-2 pl-8 focus:border-[#9A86B3] focus:outline-none transition-colors text-sm font-sans"
                required
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-[11px] uppercase tracking-[0.3em] text-[#9A86B3] font-bold mb-2">Senha</label>
            <div className="relative">
              <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A86B3]" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-[#9A86B3]/30 py-2 pl-8 focus:border-[#9A86B3] focus:outline-none transition-colors text-sm font-sans"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-[10px] uppercase tracking-wider font-bold text-center">{error}</p>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 uppercase tracking-[0.3em] text-[10px] font-bold text-white bg-[#9A86B3] hover:bg-[#85739E] transition-all rounded-lg shadow-sm disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
