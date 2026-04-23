import Header from "../components/Header";
import ChatArea from "../components/ChatArea";
import InputBar from "../components/InputBar";
import Modals from "../components/Modals";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-100 selection:text-gray-900 overflow-x-hidden">
      <div className="max-w-2xl mx-auto flex flex-col min-h-screen">
        <Header />
        
        <ChatArea />
        
        <InputBar />
        
        <Modals />
      </div>
    </main>
  );
}
