"use client";

import { useStore } from "../store/useStore";
import { Bot, User, AlertCircle, RefreshCcw } from "lucide-react";

const SUGGESTIONS = [
  "Help me with diagnosis",
  "Look at my prescription",
  "I have a headache"
];

export default function ChatArea() {
  const { messages, isLoading, sendMessage, error, retryLastMessage } = useStore();

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 min-h-screen">
        <h1 className="text-2xl font-semibold text-gray-800 mb-8 text-center transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
          Hi, what can I help you with?
        </h1>
        
        <div className="flex flex-wrap justify-center gap-3 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => sendMessage(suggestion)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col pt-20 pb-24 px-4 gap-6 overflow-y-auto">
      {messages.map((msg, index) => (
        <div 
          key={index} 
          className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {msg.role === 'ai' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
          </div>
          <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            msg.role === 'user' 
              ? 'bg-gray-900 text-white rounded-tr-none' 
              : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-tl-none'
          }`}>
            {msg.content}
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="flex gap-3 animate-pulse">
          <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div className="bg-white border border-gray-100 text-gray-500 px-4 py-2.5 rounded-2xl rounded-tl-none text-sm italic">
            Meditron is thinking...
          </div>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center gap-4 py-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 px-4 py-3 rounded-2xl max-w-[90%]">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-red-800 uppercase tracking-widest mb-0.5">{error.type.replace('_', ' ')} ERROR</p>
              <p className="text-sm text-red-600 font-medium">{error.message}</p>
            </div>
          </div>
          <button 
            onClick={() => retryLastMessage()}
            className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> Retry Request
          </button>
        </div>
      )}
    </div>
  );
}
