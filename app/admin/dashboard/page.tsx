'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { 
  Users, 
  UserMinus, 
  Phone, 
  Calendar, 
  LogOut, 
  Baby, 
  CheckCircle2, 
  XCircle,
  Search,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firebase-utils';
import { signOut } from 'firebase/auth';

interface RSVP {
  id: string;
  whatsapp: string;
  names: string[];
  attending: boolean;
  diaperSize: string;
  diaperBrand: string;
  timestamp: any;
}

export default function AdminDashboard() {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'regret'>('all');
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/admin/login');
      }
    });

    // Set a safety timeout for loading state
    const timeout = setTimeout(() => {
      setLoading(false);
      if (rsvps.length === 0) {
        setError("O carregamento está demorando mais que o esperado. Verifique sua conexão.");
      }
    }, 10000);

    const rsvpsRef = collection(db, 'rsvps');
    const q = query(rsvpsRef, orderBy('timestamp', 'desc'));

    const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
      clearTimeout(timeout);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RSVP[];
      setRsvps(data);
      setLoading(false);
      setError(null);
    }, (err) => {
      clearTimeout(timeout);
      console.error("Dashboard Snapshot Error:", err);
      // Check if it's a permission error
      if (err.code === 'permission-denied') {
        setError("Você não tem permissão para acessar estes dados. Verifique seu login.");
      } else {
        setError("Erro ao carregar dados. Verifique sua conexão.");
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribeAuth();
      unsubscribeSnapshot();
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const filteredRsvps = rsvps.filter(rsvp => {
    const matchesSearch = rsvp.names.some(name => name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          rsvp.whatsapp.includes(searchTerm);
    const matchesFilter = filter === 'all' ? true :
                         filter === 'confirmed' ? rsvp.attending :
                         !rsvp.attending;
    return matchesSearch && matchesFilter;
  });

  const totalGuests = rsvps
    .filter(r => r.attending)
    .reduce((acc, curr) => acc + curr.names.length, 0);

  const stats = {
    confirmed: rsvps.filter(r => r.attending).length,
    regrets: rsvps.filter(r => !r.attending).length,
    totalPeople: totalGuests
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9FC] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-[#9A86B3] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF9FC] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-[#2D2D2D] mb-2">Ops! Algo deu errado</h2>
        <p className="text-sm text-gray-500 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-[#9A86B3] text-white text-[10px] uppercase tracking-widest font-bold hover:bg-[#85739E] transition-all"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9FC] font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-[#9A86B3]/20 px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Baby className="w-6 h-6 text-[#9A86B3]" />
            <h1 className="font-script text-3xl text-[#9A86B3]">Lista da Cecília</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#4A4453] hover:text-[#9A86B3] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 border border-[#9A86B3]/20 shadow-sm flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-[#9A86B3]/10 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-[#9A86B3]" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#4A4453]/60 font-bold">Total de Pessoas</p>
              <p className="text-2xl font-bold text-[#2D2D2D]">{stats.totalPeople}</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 border border-[#9A86B3]/20 shadow-sm flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#4A4453]/60 font-bold">Confirmações (Famílias)</p>
              <p className="text-2xl font-bold text-[#2D2D2D]">{stats.confirmed}</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 border border-[#9A86B3]/20 shadow-sm flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <UserMinus className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#4A4453]/60 font-bold">Não Comparecerão</p>
              <p className="text-2xl font-bold text-[#2D2D2D]">{stats.regrets}</p>
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white border border-[#9A86B3]/20 p-6 mb-8 shadow-sm flex flex-col md:flex-row gap-6 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou WhatsApp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#9A86B3]/10 focus:border-[#9A86B3] focus:outline-none text-sm transition-colors"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {(['all', 'confirmed', 'regret'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold whitespace-nowrap border transition-all ${
                  filter === t 
                    ? 'bg-[#9A86B3] text-white border-[#9A86B3]' 
                    : 'bg-transparent text-[#4A4453] border-[#9A86B3]/20 hover:border-[#9A86B3]'
                }`}
              >
                {t === 'all' ? 'Todos' : t === 'confirmed' ? 'Confirmados' : 'Não Vão'}
              </button>
            ))}
          </div>
        </div>

        {/* Guest Table */}
        <div className="bg-white border border-[#9A86B3]/20 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#FAF9FC] border-b border-[#9A86B3]/20">
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-[#4A4453]">Status</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-[#4A4453]">Convidado(s)</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-[#4A4453]">WhatsApp</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-[#4A4453]">Fralda Sugerida</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-[#4A4453]">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#9A86B3]/10">
                {filteredRsvps.map((rsvp) => (
                  <tr key={rsvp.id} className="hover:bg-[#FAF9FC]/50 transition-colors">
                    <td className="px-6 py-4">
                      {rsvp.attending ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wide">Confirmado</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-500">
                          <XCircle className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wide">Não vai</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {rsvp.names.map((name, i) => (
                          <span key={i} className="text-sm font-medium text-[#2D2D2D]">
                            {name}{i < rsvp.names.length - 1 ? ',' : ''}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">{rsvp.names.length} pessoa(s)</p>
                    </td>
                    <td className="px-6 py-4">
                      <a 
                        href={`https://wa.me/${rsvp.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[#4A4453] hover:text-[#9A86B3] transition-colors"
                      >
                        <Phone className="w-3 h-3 text-[#9A86B3]" />
                        {rsvp.whatsapp}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      {rsvp.attending ? (
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-[#2D2D2D]">{rsvp.diaperSize} - {rsvp.diaperBrand}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase">
                        <Calendar className="w-3 h-3" />
                        {rsvp.timestamp?.toDate ? rsvp.timestamp.toDate().toLocaleDateString('pt-BR') : 'Recent'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRsvps.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <Baby className="w-12 h-12 text-[#9A86B3]/20 mx-auto" />
              <p className="text-sm text-gray-400">Nenhum convidado encontrado.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
