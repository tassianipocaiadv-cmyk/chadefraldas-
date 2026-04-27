'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  UserCheck, 
  Check, 
  Plus, 
  X, 
  Calendar,
  Clock,
  Heart,
  Camera
} from 'lucide-react';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firebase-utils';

export default function RSVPPage() {
  const [view, setView] = useState<'welcome' | 'form' | 'success' | 'regret' | 'regret_success'>('welcome');
  const [names, setNames] = useState<string[]>([]);
  const [currentName, setCurrentName] = useState("");
  const [additionalName, setAdditionalName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedDiaper, setAssignedDiaper] = useState<{ size: string, brand: string } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);


  const addAdditionalName = () => {
    if (additionalName.trim()) {
      setNames([...names, additionalName.trim()]);
      setAdditionalName("");
    }
  };

  const removeName = (index: number) => {
    setNames(names.filter((_, i) => i !== index));
  };

  const handleSubmit = async (isAttending: boolean = true) => {
    if (isAttending && (!currentName.trim() && names.length === 0 || !whatsapp)) return;
    if (!isAttending && !currentName.trim()) return;

    setIsSubmitting(true);
    try {
      const rsvpsRef = collection(db, 'rsvps');
      
      let size = "-";
      let brand = "-";

      if (isAttending) {
        const q = query(rsvpsRef, where('diaperSize', '==', 'P'));
        const snapshot = await getDocs(q);
        const pCount = snapshot.size;

        size = "M";
        const roll = Math.random();
        
        if (pCount < 5) {
          if (roll < 0.4) size = "P";
          else if (roll < 0.7) size = "M";
          else size = "G";
        } else {
          size = roll < 0.5 ? "M" : "G";
        }

        const brands = ["Huggies", "Pampers", "Mamy Poko", "Cremer"];
        brand = brands[Math.floor(Math.random() * brands.length)];
      }

      const allNames = isAttending 
        ? [currentName.trim(), ...names].filter(Boolean) 
        : [currentName.trim()];

      const rsvpData = {
        whatsapp: isAttending ? whatsapp : "-",
        names: allNames,
        attending: isAttending,
        diaperSize: size,
        diaperBrand: brand,
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, 'rsvps'), rsvpData);
      
      if (isAttending) {
        setAssignedDiaper({ size, brand });
        setView('success');
      } else {
        setView('regret_success');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'rsvps');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (view === 'success' && assignedDiaper) {
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

        {/* Subtle decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#9A86B3] to-transparent opacity-30" />
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#9A86B3] to-transparent opacity-30" />
        
        {/* Watermarks - SVG Icons */}
        <div className="absolute top-10 left-10 opacity-[0.05] select-none pointer-events-none rotate-12 text-[#9A86B3]">
          <svg className="w-32 h-32 md:w-48 md:h-48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,12C12,12 11,8 7,8C3,8 2,11 2,12C2,13 3,16 7,16C11,16 12,12 12,12M12,12C12,12 13,8 17,8C21,8 22,11 22,12C22,13 21,16 17,16C13,16 12,12 12,12M12,12L12,10M12,12L12,14" />
          </svg>
        </div>
        <div className="absolute bottom-20 right-10 opacity-[0.05] select-none pointer-events-none -rotate-12 text-[#9A86B3]">
          <Heart className="w-32 h-32 md:w-48 md:h-48 fill-current" />
        </div>
        <div className="absolute top-1/2 -right-16 opacity-[0.03] select-none pointer-events-none text-[#9A86B3]">
          <svg className="w-64 h-64 md:w-96 md:h-96" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,12C12,12 11,8 7,8C3,8 2,11 2,12C2,13 3,16 7,16C11,16 12,12 12,12M12,12C12,12 13,8 17,8C21,8 22,11 22,12C22,13 21,16 17,16C13,16 12,12 12,12M12,12L12,10M12,12L12,14" />
          </svg>
        </div>
        
        <motion.div 
          ref={cardRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white border border-[#9A86B3]/30 p-10 text-center relative shadow-sm"
        >
          <div className="flex flex-col items-center justify-center mb-8 w-full border-b border-[#9A86B3]/10 pb-6">
             <span className="font-script text-6xl text-[#9A86B3] leading-tight">Obrigada!</span>
          </div>

          <p className="font-sans text-[#4A4453] text-[13px] leading-relaxed mb-10 tracking-wide uppercase italic font-medium px-4">
            Olá Titios e Titias! Estou muito feliz que vocês virão celebrar a minha chegada, será uma tarde de muita alegria.
          </p>

          <div className="border-t border-b border-[#9A86B3]/20 py-10 mb-10 space-y-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#9A86B3] font-bold mb-3">Sugestão de Presente</p>
              <div className="space-y-4">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[#4A4453]/60 mb-1">Tamanho</p>
                  <p className="text-5xl font-sans font-light tracking-widest text-[#2D2D2D]">{assignedDiaper.size}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[#4A4453]/60 mb-1">Marcas Recomendadas</p>
                  <p className="text-xs font-semibold tracking-[0.1em] text-[#6D637A]">Huggies, Pampers, Mamy Poko ou Cremer</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 px-4">
            <div className="text-center space-y-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#9A86B3] font-bold">Localização</p>
              <p className="text-[11px] text-[#4A4453] font-medium leading-relaxed">
                Condomínio Mirante do Sol Residence<br/>
                R. Francisco Serafim da Costa, 72<br/>
                Barra de Gramame, João Pessoa - PB, 58060-415
              </p>
              <a 
                href="https://www.google.com/maps/place/Condom%C3%ADnio+Mirante+do+Sol+Residence/@-7.2238386,-34.8229254,21z/data=!4m14!1m7!3m6!1s0x7acc10009ee886d:0xd1b5bfe93cd3ecc0!2sCondom%C3%ADnio+Mirante+do+Sol+Residence!8m2!3d-7.2237307!4d-34.8229014!16s%2Fg%2F11yk6dh2dt!3m5!1s0x7acc10009ee886d:0xd1b5bfe93cd3ecc0!8m2!3d-7.2237307!4d-34.8229014!16s%2Fg%2F11yk6dh2dt?entry=ttu&g_ep=EgoyMDI2MDQyMi4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 py-2 px-4 border border-[#9A86B3]/40 rounded-full text-[#6D637A] text-[10px] uppercase tracking-[0.1em] font-bold hover:bg-[#9A86B3] hover:text-white transition-all group"
              >
                <MapPin className="w-3 h-3 text-[#9A86B3] group-hover:text-white transition-colors" />
                Ver no mapa
              </a>
            </div>
            
            <div className="bg-[#FAF9FC] border border-[#9A86B3]/30 rounded-xl p-5 mt-4 flex items-center gap-4 animate-pulse shadow-sm">
              <div className="bg-[#9A86B3] p-2.5 rounded-full shadow-md">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-[11px] uppercase tracking-wider text-[#9A86B3] font-bold mb-0.5">Dica dos Papais</p>
                <p className="text-xs text-[#4A4453] font-medium leading-tight">
                  Tire um <strong>print</strong> ou <strong>foto</strong> desta tela para não esquecer o tamanho da fralda!
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-6 mt-8 print:hidden">
              
              <button 
                onClick={() => {
                  setView('welcome');
                  setNames([]);
                  setCurrentName('');
                  setAdditionalName('');
                  setWhatsapp("");
                  setAssignedDiaper(null);
                }}
                className="text-[#9A86B3] text-[10px] uppercase tracking-[0.2em] font-bold hover:underline transition-colors block mx-auto"
              >
                Voltar pro início
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9FC] flex flex-col items-center justify-center py-12 px-6 font-sans relative overflow-hidden">
      {/* Background Image */}
      <div className="fixed inset-0 z-0 overflow-hidden flex items-center justify-center bg-white">
        <img 
          src="/fundopage.png" 
          alt="" 
          className="w-full h-full object-cover opacity-40 transition-all duration-1000"
        />
      </div>

      {/* Watermarks - SVG Icons */}
      <div className="absolute top-20 right-20 opacity-[0.05] select-none pointer-events-none -rotate-12 text-[#9A86B3]">
        <svg className="w-40 h-40 md:w-64 md:h-64" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,12C12,12 11,8 7,8C3,8 2,11 2,12C2,13 3,16 7,16C11,16 12,12 12,12M12,12C12,12 13,8 17,8C21,8 22,11 22,12C22,13 21,16 17,16C13,16 12,12 12,12M12,12L12,10M12,12L12,14" />
        </svg>
      </div>
      <div className="absolute bottom-40 left-10 opacity-[0.05] select-none pointer-events-none rotate-45 text-[#9A86B3]">
        <Heart className="w-32 h-32 md:w-56 md:h-56 fill-current" />
      </div>
      <div className="absolute top-1/2 -left-20 opacity-[0.03] select-none pointer-events-none text-[#9A86B3]">
        <svg className="w-72 h-72 md:w-[500px] md:h-[500px]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,12C12,12 11,8 7,8C3,8 2,11 2,12C2,13 3,16 7,16C11,16 12,12 12,12M12,12C12,12 13,8 17,8C21,8 22,11 22,12C22,13 21,16 17,16C13,16 12,12 12,12M12,12L12,10M12,12L12,14" />
        </svg>
      </div>

      {/* Sleek Line Accents */}
      <div className="absolute top-0 right-[15%] w-px h-full bg-[#9A86B3]/20" />
      <div className="absolute top-0 left-[15%] w-px h-full bg-[#9A86B3]/20" />
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="max-w-lg w-full relative z-10"
      >
        <div className="text-center mb-10 relative">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block mb-4"
          >
            <span className="text-[11px] uppercase tracking-[0.5em] text-[#9A86B3] font-bold">Convite</span>
          </motion.div>
          <h1 className="text-7xl md:text-8xl font-script text-[#9A86B3] mb-8">Chá de fraldas da Cecília</h1>
          
          <div className="flex flex-col items-center justify-center gap-4 mb-10">
            <div className="flex items-center gap-6">
              <div className="h-px w-8 md:w-12 bg-[#9A86B3]/30" />
              <span className="text-2xl md:text-3xl uppercase tracking-[0.2em] text-[#2D2D2D] font-light">31 MAIO 2026</span>
              <div className="h-px w-8 md:w-12 bg-[#9A86B3]/30" />
            </div>
            <div className="flex items-center gap-4 text-[#9A86B3] font-bold tracking-[0.3em] text-sm">
              <Clock className="w-4 h-4" />
              <span>15:30 HORAS</span>
            </div>
          </div>

          <p className="text-[13px] italic text-[#4A4453] tracking-widest leading-loose max-w-sm mx-auto font-medium mb-6">
            &quot;A borboleta mais linda do nosso jardim está chegando, e queremos dividir essa alegria com você!&quot;
          </p>
        </div>

        <div className="bg-white border border-[#9A86B3]/40 p-8 md:p-12 shadow-[0_20px_50px_rgba(154,134,179,0.15)]">
          <AnimatePresence mode="wait">
            {view === 'welcome' ? (
              <motion.div 
                key="welcome"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-6">
                  <h3 className="text-sm uppercase tracking-[0.3em] text-[#9A86B3] font-bold text-center mb-8 border-b border-[#9A86B3]/20 pb-4">
                    Para confirmar sua presença:
                  </h3>
                  
                  <div className="space-y-6 text-[#2D2D2D]">
                    {[
                      { step: 1, text: 'Clique no botão "Confirmar presença"' },
                      { step: 2, text: 'Preencha o(s) nome(s) do(s) convidado(s)' },
                      { step: 3, text: 'Clique em "Enviar confirmação"' },
                      { step: 4, text: 'Será disponibilizado a localização e as informações sobre tamanho e marca das fraldas.' }
                    ].map((item) => (
                      <div key={item.step} className="flex gap-4 items-start group">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full border border-[#9A86B3]/60 flex items-center justify-center text-[#9A86B3] font-bold text-xs group-hover:bg-[#9A86B3] group-hover:text-white transition-colors">
                          {item.step}
                        </span>
                        <p className="text-[11px] uppercase tracking-widest leading-relaxed pt-1 flex-1 font-semibold italic text-[#4A4453]">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                  <div className="pt-8 border-t border-[#9A86B3]/20 space-y-4">
                    <button 
                      onClick={() => setView('form')}
                      className="w-full py-5 uppercase tracking-[0.4em] text-xs font-bold transition-all duration-500 text-white bg-[#9A86B3] border-2 border-[#9A86B3] hover:bg-transparent hover:text-[#9A86B3] shadow-lg shadow-[#9A86B3]/30"
                    >
                      CONFIRMAR PRESENÇA
                    </button>
                    
                    <button 
                      onClick={() => setView('regret')}
                      className="w-full py-4 uppercase tracking-[0.2em] text-[10px] font-bold transition-all duration-500 text-[#9A86B3] border-2 border-[#9A86B3]/30 hover:border-[#9A86B3] bg-transparent"
                    >
                      Infelizmente não poderei comparecer
                    </button>

                    <p className="text-[10px] text-center mt-6 text-[#9A86B3] font-bold uppercase tracking-[0.2em] opacity-80">
                      Por gentileza confirmar até 15 de Maio
                    </p>
                  </div>
              </motion.div>
            ) : view === 'regret' ? (
              <motion.div 
                key="regret"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 text-center"
              >
                <div className="py-6 px-4 space-y-6">
                  <div className="mb-6 flex justify-center">
                    <Heart className="w-12 h-12 text-[#9A86B3]/40" />
                  </div>
                  <h3 className="font-script text-5xl text-[#9A86B3]">Poxa, que pena!</h3>
                  <p className="font-sans text-[#4A4453] text-[11px] leading-relaxed tracking-wider uppercase italic font-medium">
                    Sentiremos sua falta! Por favor, deixe seu nome para sabermos quem nos avisou.
                  </p>

                  <div className="relative text-left">
                    <label className="block text-[10px] uppercase tracking-[0.3em] text-[#9A86B3] font-bold mb-3">
                      Seu Nome
                    </label>
                    <input 
                      type="text" 
                      placeholder="Seu nome completo"
                      value={currentName}
                      onChange={(e) => setCurrentName(e.target.value)}
                      className="w-full bg-transparent border-b-2 border-[#9A86B3]/30 py-2 focus:border-[#9A86B3] focus:outline-none transition-colors text-base tracking-[0.1em] placeholder:text-gray-200 text-[#2D2D2D]"
                    />
                  </div>

                  <button 
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting || !currentName.trim()}
                    className={`w-full py-4 uppercase tracking-[0.3em] text-[10px] font-bold transition-all duration-500 text-white bg-[#9A86B3] border-2 border-[#9A86B3] hover:bg-transparent hover:text-[#9A86B3] shadow-lg shadow-[#9A86B3]/30 mt-4 ${isSubmitting || !currentName.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? 'ENVIANDO...' : 'AVISAR PAPAIS'}
                  </button>
                </div>
                
                <button 
                  onClick={() => setView('welcome')}
                  className="text-[#9A86B3] text-[10px] uppercase tracking-[0.2em] hover:underline transition-colors block mx-auto font-bold"
                >
                  Voltar
                </button>
              </motion.div>
            ) : view === 'regret_success' ? (
              <motion.div 
                key="regret_success"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 text-center"
              >
                <div className="py-12 px-4 space-y-6">
                  <div className="mb-6 flex justify-center">
                    <Heart className="w-12 h-12 text-[#9A86B3]/40 fill-current" />
                  </div>
                  <h3 className="font-script text-5xl text-[#9A86B3]">Obrigada por avisar!</h3>
                  <p className="font-sans text-[#4A4453] text-[13px] leading-relaxed tracking-wide uppercase italic font-medium">
                    Agradecemos muito pelo seu carinho. Mesmo de longe, sabemos que estará torcendo pela nossa pequena Cecília!
                  </p>
                </div>
                
                <button 
                  onClick={() => {
                    setView('welcome');
                    setCurrentName('');
                    setAdditionalName('');
                    setNames([]);
                  }}
                  className="text-[#9A86B3] text-[10px] uppercase tracking-[0.2em] hover:underline transition-colors mt-6 block mx-auto font-bold"
                >
                  Voltar pro início
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                {/* WhatsApp Input */}
                <div className="relative">
                  <label className="block text-[11px] uppercase tracking-[0.3em] text-[#9A86B3] font-bold mb-3">
                    Seu WhatsApp
                  </label>
                  <input 
                    type="text" 
                    placeholder="(00) 00000-0000"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-[#9A86B3]/30 py-2 focus:border-[#9A86B3] focus:outline-none transition-colors text-base tracking-[0.1em] placeholder:text-gray-200 text-[#2D2D2D]"
                  />
                </div>

                {/* Names Input */}
                <div className="relative">
                  <label className="block text-[11px] uppercase tracking-[0.3em] text-[#9A86B3] font-bold mb-3">
                    Seu Nome
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ex: Tio João"
                    value={currentName}
                    onChange={(e) => setCurrentName(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-[#9A86B3]/30 py-2 focus:border-[#9A86B3] focus:outline-none transition-colors text-base tracking-[0.1em] placeholder:text-gray-200 text-[#2D2D2D]"
                  />
                </div>

                <div className="relative mt-6">
                  <label className="block text-[11px] uppercase tracking-[0.3em] text-[#9A86B3] font-bold mb-3">
                    Adicione mais um nome <span className="text-[9px] normal-case tracking-normal opacity-70">(Opcional, digite e clique no +)</span>
                  </label>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      placeholder="Ex: Tia Maria (Acompanhante)"
                      value={additionalName}
                      onChange={(e) => setAdditionalName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addAdditionalName();
                        }
                      }}
                      className="flex-1 bg-transparent border-b-2 border-[#9A86B3]/30 py-2 focus:border-[#9A86B3] focus:outline-none transition-colors text-base tracking-[0.1em] placeholder:text-gray-200 text-[#2D2D2D]"
                    />
                    <button 
                      type="button"
                      onClick={addAdditionalName}
                      className="text-[#9A86B3] hover:scale-125 transition-transform"
                    >
                      <Plus className="w-6 h-6 stroke-[3px]" />
                    </button>
                  </div>

                  {names.length > 0 && (
                    <div className="mt-6 space-y-4">
                      {names.map((name, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex justify-between items-center py-2 border-b border-[#9A86B3]/10"
                        >
                          <span className="text-sm tracking-widest text-[#2D2D2D] font-medium">{name}</span>
                          <button 
                            onClick={() => removeName(index)}
                            className="text-gray-400 hover:text-[#9A86B3] transition-colors"
                          >
                            <X className="w-4 h-4 stroke-[3px]" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <p className="mt-6 text-[10px] text-[#9A86B3] font-medium italic opacity-80 text-center">
                    *Por gentileza, alinhar a inclusão de novas pessoas à quantidade de senhas recebidas.
                  </p>
                </div>

                <div className="pt-8">
                    <button 
                      onClick={() => handleSubmit()}
                      disabled={isSubmitting || (!currentName.trim() && names.length === 0) || !whatsapp}
                    className={`w-full py-5 uppercase tracking-[0.4em] text-xs font-bold transition-all duration-500 relative group border-2
                      ${isSubmitting || (!currentName.trim() && names.length === 0) || !whatsapp 
                        ? 'text-gray-300 cursor-not-allowed border-gray-100 bg-gray-50' 
                        : 'text-white bg-[#9A86B3] border-[#9A86B3] hover:bg-transparent hover:text-[#9A86B3] shadow-lg shadow-[#9A86B3]/30'
                      }`}
                  >
                    <span className="relative z-10">{isSubmitting ? 'AGUARDE...' : 'ENVIAR CONFIRMAÇÃO'}</span>
                  </button>
                  <button 
                    onClick={() => setView('welcome')}
                    className="text-[#9A86B3] text-[10px] uppercase tracking-[0.2em] hover:underline transition-colors mt-6 block mx-auto font-bold"
                  >
                    Voltar para instruções
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-20 flex flex-col items-center gap-10">
          <div className="flex justify-center gap-16 text-[#9A86B3]/20 items-center">
            <Heart className="w-5 h-5 fill-current" />
            <Heart className="w-3 h-3 fill-current rotate-45" />
            <Heart className="w-5 h-5 fill-current -rotate-45" />
          </div>
          
          <a 
            href="/admin/login" 
            className="text-[11px] uppercase tracking-[0.3em] text-[#9A86B3] hover:text-[#85739E] transition-all font-bold mb-10 border border-[#9A86B3]/30 px-6 py-2 rounded-full hover:bg-[#9A86B3]/5"
          >
            Acesso Restrito: Papais
          </a>
        </div>
      </motion.div>

      <style jsx global>{`
        :root {
          --font-sans: 'Montserrat', sans-serif;
          --font-script: 'Style Script', cursive;
        }
        
        .font-sans { font-family: var(--font-sans); }
        .font-script { font-family: var(--font-script); }

        ::selection {
          background-color: #9A86B3;
          color: white;
        }
      `}</style>
    </div>
  );
}
