"use client";

import { Plus, Mic, SendHorizontal } from "lucide-react";

export default function InputBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md max-w-2xl mx-auto z-40">
      <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-3xl px-4 py-2 shadow-sm focus-within:border-gray-300 focus-within:ring-1 focus-within:ring-gray-100 transition-all">
        <button className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
          <Plus className="w-5 h-5" />
        </button>
        
        <input 
          type="text" 
          placeholder="Ask Meditron..." 
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-2 text-gray-700 outline-none placeholder:text-gray-400"
        />
        
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
            <Mic className="w-5 h-5" />
          </button>
          <button className="p-1.5 bg-gray-900 hover:bg-gray-800 rounded-full text-white transition-colors">
            <SendHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
