"use client";

import { Plus, Mic, SendHorizontal, X, Image as ImageIcon } from "lucide-react";
import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { useStore } from "../store/useStore";

export default function InputBar() {
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  
  const { sendMessage, isLoading } = useStore();

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join("");
        setInput(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Failed to start speech recognition", e);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setAttachment(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachment) || isLoading) return;
    
    // In a real app, we'd handle the attachment here (e.g., upload to S3 or send to LLaVA)
    const text = input;
    setInput("");
    removeAttachment();
    await sendMessage(text);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-white/80 backdrop-blur-md max-w-4xl lg:max-w-5xl mx-auto z-40 transition-all">
      {/* Image Preview */}
      {previewUrl && (
        <div className="mb-2 relative inline-block animate-in fade-in zoom-in duration-200">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-100 shadow-sm">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <button 
            onClick={removeAttachment}
            className="absolute -top-2 -right-2 bg-gray-900 text-white rounded-full p-1 shadow-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-2xl md:rounded-3xl px-4 md:px-6 py-3 md:py-4 shadow-sm focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
        
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening..." : "Ask Meditron..."}
          disabled={isLoading}
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-2 text-gray-700 outline-none placeholder:text-gray-400 disabled:opacity-50"
        />
        
        <div className="flex items-center gap-1">
          <button 
            onClick={toggleListening}
            className={`p-1.5 hover:bg-gray-200 rounded-full transition-all ${isListening ? 'text-red-500 animate-pulse bg-red-50' : 'text-gray-500'}`}
          >
            <Mic className="w-5 h-5" />
          </button>
          <button 
            onClick={handleSend}
            disabled={(!input.trim() && !attachment) || isLoading}
            className="p-1.5 bg-gray-900 hover:bg-gray-800 rounded-full text-white transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <SendHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
