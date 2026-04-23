"use client";

const SUGGESTIONS = [
  "Help me with diagnosis",
  "Look at my prescription",
  "I have a headache"
];

export default function ChatArea() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
        Hi, what can I help you with?
      </h1>
      
      <div className="flex flex-wrap justify-center gap-2 max-w-md">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
