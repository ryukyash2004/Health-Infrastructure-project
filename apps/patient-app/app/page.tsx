"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Menu, 
  Plus, 
  Mic, 
  Send, 
  FileText, 
  AlertCircle,
  X,
  History,
  UserCircle,
  Phone,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Loader2,
  LogIn,
  LogOut
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useUIStore } from "./store/ui-store";
import { useAuthStore } from "./store/auth-store";
import { AuthModal } from "./components/AuthModal";
import { apiFetch } from "./lib/api";

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  role: 'user' | 'ai';
  content: string;
  image?: string;
}

export default function PatientChat() {
  const { 
    isLeftDrawerOpen, 
    isRecordModalOpen, 
    isSOSOpen,
    toggleLeftDrawer, 
    toggleRecordModal,
    toggleSOS
  } = useUIStore();

  const {
    isAuthenticated,
    user,
    logout,
    toggleAuthModal
  } = useAuthStore();
  
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const [formStep, setFormStep] = useState<'edit' | 'review' | 'submitting'>('edit');
  const [formData, setFormData] = useState({
    patient_name: "Jane Doe",
    age: "28",
    gender: "Female",
    medical_history: "Occasional seasonal allergies, mild asthma.",
    allergies: "Penicillin, Peanuts."
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => prev + (prev ? " " : "") + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSend = async () => {
    if (!inputValue && !selectedImage) return;
    const currentInput = inputValue;
    const currentImage = selectedImage;
    const currentPreview = previewUrl;

    setMessages(prev => [...prev, { role: 'user', content: currentInput, image: currentPreview || undefined }]);
    setInputValue(""); setSelectedImage(null); setPreviewUrl(null);
    setIsUploading(true);

    try {
      if (currentImage) {
        const formData = new FormData();
        formData.append('file', currentImage);
        const res = await apiFetch('/vision/upload-prescription', { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          setMessages(prev => [...prev, { role: 'ai', content: `Extracted Prescription: \n${JSON.stringify(data, null, 2)}` }]);
        }
      } else {
        const res = await apiFetch('/triage/', {
          method: 'POST',
          body: JSON.stringify({ patient_name: formData.patient_name, symptoms: currentInput })
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(prev => [...prev, { role: 'ai', content: data.assessment }]);
        }
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', content: "Connection error." }]);
    } finally {
      setIsUploading(false);
    }
  };

  const submitProfile = async () => {
    setFormStep('submitting');
    try {
      const res = await apiFetch('/patients/profile', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("Medical profile updated successfully.");
        toggleRecordModal(false);
        setFormStep('edit');
      }
    } catch (e) {
      alert("Failed to update profile.");
      setFormStep('review');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-0 sm:p-6 lg:p-8">
      {/* --- AUTH MODAL --- */}
      <AuthModal />

      {/* --- PREMIUM MOBILE CONTAINER --- */}
      <div className="w-full max-w-md h-[100dvh] sm:h-[844px] bg-white sm:rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col border-[8px] border-zinc-900 relative">
        
        {/* --- DYNAMIC HEADER --- */}
        <header className="flex items-center justify-between px-6 py-5 bg-white/70 backdrop-blur-xl border-b border-zinc-100/50 sticky top-0 z-30">
          <button 
            onClick={() => toggleLeftDrawer(true)} 
            className="p-2.5 bg-zinc-50 hover:bg-zinc-100 rounded-full transition-all active:scale-90 text-zinc-900 border border-zinc-200/50 shadow-sm"
          >
            <Menu size={22} strokeWidth={2.5} />
          </button>
          
          <div className="flex items-center gap-2">
            {!isAuthenticated && (
              <button 
                onClick={() => toggleAuthModal(true)}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-bold text-[10px] uppercase tracking-wider hover:bg-blue-100 transition-all border border-blue-100"
              >
                Log In
              </button>
            )}
            <button 
              onClick={() => toggleSOS(true)} 
              className="px-5 py-2.5 bg-red-600 text-white rounded-full font-black text-[11px] uppercase tracking-wider hover:bg-red-700 transition-all shadow-[0_4px_15px_rgba(220,38,38,0.3)] active:scale-95 animate-pulse"
            >
              SOS
            </button>
            <button 
              onClick={() => toggleRecordModal(true)} 
              className="p-2.5 bg-zinc-900 text-white rounded-full transition-all active:scale-90 shadow-md border border-zinc-800"
            >
              <FileText size={20} strokeWidth={2.5} />
            </button>
          </div>
        </header>

        {/* --- CHAT AREA --- */}
        <main className="flex-1 overflow-y-auto px-6 py-8 space-y-8 scrollbar-hide">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="mb-10 relative">
                <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-[2.5rem] flex items-center justify-center shadow-xl rotate-12">
                   <AlertCircle size={40} className="text-white -rotate-12" strokeWidth={3} />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border border-zinc-50">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </div>
              </div>
              
              <h1 className="text-3xl font-black tracking-tighter text-zinc-900 mb-4 leading-[0.9]">
                How are you<br/>feeling today?
              </h1>
              {!isAuthenticated && (
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 mb-8 mx-4">
                  <p className="text-amber-800 text-[11px] font-bold uppercase tracking-widest mb-2">Guest Mode Active</p>
                  <p className="text-amber-700 text-xs leading-relaxed">Your history won't be saved. <button onClick={() => toggleAuthModal(true)} className="underline font-black">Login now</button> to sync across devices.</p>
                </div>
              )}
              <p className="text-zinc-400 text-sm font-medium mb-10 px-8">Meditron is ready to triage your symptoms with clinical precision.</p>

              <div className="grid grid-cols-1 gap-3 w-full">
                {["Diagnosis Help", "Scan Prescription", "Persistent Headache"].map(chip => (
                  <button 
                    key={chip} 
                    onClick={() => setInputValue(chip)} 
                    className="w-full px-6 py-4 rounded-2xl border border-zinc-100 text-sm font-bold text-zinc-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/30 transition-all bg-white shadow-sm flex items-center justify-between active:scale-[0.98]"
                  >
                    {chip}
                    <ChevronRight size={18} className="text-zinc-300" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={cn("flex flex-col max-w-[90%] animate-in fade-in slide-in-from-bottom-4 duration-500", msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
                {msg.image && (
                   <div className="mb-3 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
                      <img src={msg.image} className="max-h-72 w-full object-cover" />
                   </div>
                )}
                <div className={cn(
                  "px-5 py-4 rounded-[1.75rem] text-[15px] font-medium leading-relaxed shadow-sm",
                  msg.role === 'user' 
                    ? "bg-zinc-900 text-white rounded-tr-none" 
                    : "bg-zinc-100 text-zinc-800 rounded-tl-none border border-zinc-200/50"
                )}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {isUploading && (
            <div className="flex items-center gap-3 text-zinc-400 text-[11px] font-black uppercase tracking-widest ml-2">
              <Loader2 size={16} className="animate-spin text-blue-600" strokeWidth={3} />
              Meditron Processing
            </div>
          )}
        </main>

        {/* --- PREMIUM INPUT BAR --- */}
        <footer className="px-6 py-8 bg-white border-t border-zinc-100">
          <div className="space-y-4">
            {previewUrl && (
              <div className="flex px-2 animate-in slide-in-from-left duration-300">
                <div className="relative group">
                  <img src={previewUrl} className="w-20 h-20 rounded-[1.5rem] object-cover border-4 border-white shadow-xl ring-1 ring-zinc-100" />
                  <button 
                    onClick={() => { setPreviewUrl(null); setSelectedImage(null); }} 
                    className="absolute -top-3 -right-3 bg-zinc-900 text-white rounded-full p-1.5 shadow-xl hover:bg-red-600 transition-all border-2 border-white"
                  >
                    <X size={14} strokeWidth={3} />
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200/50 rounded-[2rem] px-5 py-2.5 transition-all focus-within:ring-4 focus-within:ring-blue-50 focus-within:bg-white focus-within:border-blue-400 shadow-inner">
              <label className="cursor-pointer group">
                <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if(f) { setSelectedImage(f); setPreviewUrl(URL.createObjectURL(f)); } }} />
                <div className="p-2 bg-white rounded-full shadow-sm border border-zinc-200 group-hover:bg-zinc-900 group-hover:text-white transition-all active:scale-90">
                  <Plus size={22} strokeWidth={2.5} />
                </div>
              </label>
              
              <input 
                type="text" 
                placeholder="Describe symptoms..." 
                className="flex-1 bg-transparent border-none focus:outline-none py-3 text-[16px] font-bold text-zinc-900 placeholder:text-zinc-300" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
              />
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleVoiceInput} 
                  className={cn(
                    "p-2 rounded-full transition-all active:scale-75", 
                    isListening ? "bg-red-50 text-red-600 shadow-inner" : "text-zinc-400 hover:text-zinc-600"
                  )}
                >
                  <Mic size={22} strokeWidth={isListening ? 3 : 2} className={cn(isListening && "animate-pulse")} />
                </button>
                
                <button 
                  onClick={handleSend} 
                  disabled={isUploading || (!inputValue && !selectedImage)} 
                  className={cn(
                    "p-3 rounded-full transition-all shadow-lg", 
                    (inputValue || selectedImage) 
                      ? "bg-zinc-900 text-white shadow-zinc-200 scale-100 active:scale-90" 
                      : "bg-zinc-200 text-white scale-90 opacity-40 cursor-not-allowed"
                  )}
                >
                  <Send size={18} strokeWidth={3} fill="currentColor" />
                </button>
              </div>
            </div>
          </div>
        </footer>

        {/* --- SOS BOTTOM SHEET --- */}
        {isSOSOpen && (
          <div className="absolute inset-0 z-[60] flex items-end">
            <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-md animate-in fade-in duration-500" onClick={() => toggleSOS(false)} />
            <div className="relative w-full bg-white rounded-t-[3rem] p-8 pb-14 shadow-2xl animate-in slide-in-from-bottom duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
              <div className="w-16 h-1.5 bg-zinc-100 rounded-full mx-auto mb-10" />
              <h2 className="text-3xl font-black text-center text-red-600 mb-3 tracking-tighter uppercase">SOS Emergency</h2>
              <p className="text-zinc-500 text-center font-bold text-xs mb-10 px-8 uppercase tracking-[0.15em]">System-triggered critical intervention</p>
              
              <div className="space-y-4">
                <a href="tel:112" className="flex items-center justify-between bg-red-600 text-white p-7 rounded-[2rem] font-black text-xl active:scale-[0.98] transition-all shadow-2xl shadow-red-200 group">
                  <div className="flex items-center gap-5"><Phone size={30} strokeWidth={3} /> EMERGENCY 112</div>
                  <ChevronRight strokeWidth={4} />
                </a>
                
                <div className="grid grid-cols-2 gap-4">
                  <a href="tel:102" className="flex flex-col items-center gap-3 bg-zinc-50 p-6 rounded-[2rem] font-black border border-zinc-100 active:scale-95 transition-all text-zinc-900 text-lg">
                    <Phone size={24} className="text-red-600" strokeWidth={3} /> 102
                  </a>
                  <a href="tel:108" className="flex flex-col items-center gap-3 bg-zinc-50 p-6 rounded-[2rem] font-black border border-zinc-100 active:scale-95 transition-all text-zinc-900 text-lg">
                    <Phone size={24} className="text-red-600" strokeWidth={3} /> 108
                  </a>
                </div>
                
                <a href="https://www.google.com/maps/search/hospitals+near+me" target="_blank" className="flex items-center justify-center gap-4 bg-zinc-900 text-white p-6 rounded-[2rem] font-black text-base active:scale-[0.98] transition-all shadow-xl shadow-zinc-300 mt-4 uppercase tracking-widest">
                  <MapPin size={22} strokeWidth={3} /> Nearby Hospitals
                </a>
              </div>
            </div>
          </div>
        )}

        {/* --- RECORD DRAWER --- */}
        {isRecordModalOpen && (
          <div className="absolute inset-0 z-[60] flex justify-end">
            <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => toggleRecordModal(false)} />
            <aside className="relative w-full max-w-[92%] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out border-l border-zinc-100">
              <div className="p-8 border-b flex items-center justify-between bg-zinc-50/50">
                <h2 className="font-black text-2xl flex items-center gap-3 text-zinc-900 tracking-tighter">
                  <FileText className="text-blue-600" size={28} strokeWidth={3} /> Record
                </h2>
                <button onClick={() => toggleRecordModal(false)} className="p-2.5 bg-white hover:bg-red-50 hover:text-red-600 rounded-full shadow-sm border border-zinc-100 transition-all"><X size={22} strokeWidth={3} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
                {formStep === 'edit' ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Full Name</label>
                        <input className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-zinc-900 outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all" value={formData.patient_name} onChange={e => setFormData({...formData, patient_name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Age / Sex</label>
                        <input className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-zinc-900 outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Baseline History</label>
                      <textarea className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-zinc-900 h-40 outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all resize-none text-[15px]" value={formData.medical_history} onChange={e => setFormData({...formData, medical_history: e.target.value})} />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-red-400 uppercase tracking-widest pl-1">Lethal Allergies</label>
                      <textarea className="w-full p-4 bg-red-50/30 border border-red-100 rounded-2xl font-black text-red-600 h-28 outline-none focus:ring-4 focus:ring-red-100 focus:bg-white transition-all resize-none text-[15px]" value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in zoom-in-95 duration-400">
                    <div className="bg-zinc-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 opacity-10 rotate-12"><CheckCircle2 size={250} strokeWidth={1} /></div>
                      <h3 className="font-black text-xs uppercase mb-8 tracking-[0.2em] text-zinc-500">Validation Required</h3>
                      <div className="space-y-6 relative z-10">
                        <div className="flex justify-between items-center border-b border-white/10 pb-4"><span className="text-zinc-500 font-bold text-xs uppercase">Patient</span> <span className="font-black text-lg">{formData.patient_name}</span></div>
                        <div className="space-y-2"><span className="text-zinc-500 font-bold text-xs uppercase block">Baseline History</span> <p className="font-bold text-sm leading-relaxed">{formData.medical_history}</p></div>
                        <div className="p-4 bg-red-600/20 rounded-2xl border border-red-600/30"><span className="text-red-400 font-black text-[10px] uppercase block mb-1">Critical Allergy Warning</span> <p className="font-black text-red-100">{formData.allergies}</p></div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-6 bg-blue-50 rounded-[2rem] border border-blue-100 shadow-sm">
                       <AlertCircle className="text-blue-600 shrink-0 mt-1" size={24} strokeWidth={3} />
                       <p className="text-[13px] text-blue-800 leading-tight font-bold italic">This profile will be injected into the Meditron AI RAG pipeline for localized triage accuracy.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 bg-white border-t border-zinc-100 flex flex-col gap-4">
                {formStep === 'edit' ? (
                  <button onClick={() => setFormStep('review')} className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-blue-200 active:scale-95 transition-all tracking-tight">
                    REVIEW BASELINE <ChevronRight size={22} strokeWidth={3} />
                  </button>
                ) : (
                  <>
                    <button onClick={submitProfile} disabled={formStep === 'submitting'} className="w-full bg-zinc-900 text-white py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all tracking-tight uppercase">
                      {formStep === 'submitting' ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={24} strokeWidth={3} /> Commit Profile</>}
                    </button>
                    <button onClick={() => setFormStep('edit')} className="w-full text-zinc-400 py-2 font-black text-[10px] uppercase tracking-[0.3em]">Back to Edit</button>
                  </>
                )}
              </div>
            </aside>
          </div>
        )}

        {/* --- LEFT MENU --- */}
        {isLeftDrawerOpen && (
          <div className="absolute inset-0 z-[60] flex">
            <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => toggleLeftDrawer(false)} />
            <aside className="relative w-80 bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-500 ease-out border-r border-zinc-100">
              <div className="p-8 border-b border-zinc-50 flex items-center justify-between">
                <h2 className="font-black text-2xl tracking-tighter italic text-zinc-900">AEGIS <span className="text-blue-600 not-italic">AI</span></h2>
                <button onClick={() => toggleLeftDrawer(false)} className="p-2.5 bg-zinc-50 hover:bg-red-50 hover:text-red-600 rounded-full transition-all border border-zinc-100"><X size={20} strokeWidth={3} /></button>
              </div>
              <nav className="flex-1 p-6 space-y-3">
                {isAuthenticated ? (
                  <div className="p-5 bg-zinc-50 rounded-3xl mb-6 border border-zinc-100">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center text-white font-black text-lg">
                        {user?.name?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-black text-zinc-900 text-sm">{user?.name}</p>
                        <p className="text-[10px] text-zinc-400 font-bold">{user?.phone}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => logout()}
                      className="w-full py-3 bg-white border border-zinc-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center justify-center gap-2 hover:bg-red-50 transition-all"
                    >
                      <LogOut size={14} /> Log Out
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => { toggleLeftDrawer(false); toggleAuthModal(true); }}
                    className="w-full p-5 bg-blue-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-100 flex items-center justify-center gap-3 mb-6"
                  >
                    <LogIn size={20} /> Log In to Sync
                  </button>
                )}
                
                <button className="flex items-center gap-5 w-full p-5 rounded-[2rem] hover:bg-zinc-50 text-zinc-900 transition-all group border border-transparent hover:border-zinc-100">
                  <div className="p-3 bg-zinc-100 rounded-2xl group-hover:bg-white group-hover:shadow-md transition-all text-zinc-400 group-hover:text-blue-600"><History size={24} strokeWidth={2.5} /></div>
                  <span className="font-black text-sm uppercase tracking-widest">History</span>
                </button>
                <button onClick={() => { toggleLeftDrawer(false); toggleRecordModal(true); }} className="flex items-center gap-5 w-full p-5 rounded-[2rem] hover:bg-zinc-50 text-zinc-900 transition-all group border border-transparent hover:border-zinc-100">
                  <div className="p-3 bg-zinc-100 rounded-2xl group-hover:bg-white group-hover:shadow-md transition-all text-zinc-400 group-hover:text-blue-600"><UserCircle size={24} strokeWidth={2.5} /></div>
                  <span className="font-black text-sm uppercase tracking-widest">Profile</span>
                </button>
              </nav>
              <div className="p-10 text-[9px] text-zinc-300 font-black uppercase tracking-[0.4em] text-center border-t border-zinc-50">V0.1 Alpha Build</div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
