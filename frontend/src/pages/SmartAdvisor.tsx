import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/db';
import { chatService } from "../services/chatService";
import { aiService } from "../services/aiService";
import { BotMessageSquare, Send, Trash2, WifiOff } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import ReactMarkdown from 'react-markdown';
import { useAuth } from "../contexts/AuthContext";

/**
 * Hook simpel untuk mendeteksi status online/offline browser
 */
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return isOnline;
};

const SmartAdvisor: React.FC = () => {
  const { user } = useAuth();

  const token = localStorage.getItem('token') || '';

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Cek status internet
  const isOnline = useOnlineStatus();

  /**
   * Ambil chat realtime dari IndexedDB
   */
  const messages = useLiveQuery(async () =>
    await chatService.getAllMessages(user.id)
  ) || [];

  console.log(messages);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => scrollToBottom(), [messages]);

  /**
   * Kirim pesan ke AI
   */
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading || !isOnline) return;

    setLoading(true);
    const userMsg = input;
    setInput('');

    try {
      const aiReply = await aiService.sendMessage(userMsg, token, user.id);

      if (!aiReply) {
        await chatService.addMessage({
          userId: user.id,
          sender: "assistant",
          message: "Maaf, terjadi kesalahan koneksi.",
          createdAt: new Date().toISOString(),
        });
      }

    } catch (err) {
      console.error(err);
      await chatService.addMessage({
        userId: user.id,
        sender: "assistant",
        message: "Maaf, terjadi kesalahan koneksi.",
        createdAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Hapus riwayat chat
   */
  const clearChat = async () => {
    if (confirm("Hapus semua riwayat chat?")) {
      await chatService.clearAllMessages();
    }
  };

  // ======================================================
  //                     OFFLINE UI
  // ======================================================
  if (!isOnline) {
    return (
      <div className="flex flex-col h-[calc(100vh-140px)] items-center justify-center text-center p-6 bg-white dark:bg-gray-900">
        <WifiOff size={60} className="text-red-500 dark:text-red-400 mb-4" />

        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
          Tidak ada koneksi internet
        </h2>

        <p className="text-gray-500 dark:text-gray-300 text-sm mt-2">
          Halaman AI Assistant membutuhkan koneksi internet.
          <br />
          Silakan sambungkan perangkat Anda ke internet.
        </p>
      </div>
    );
  }

  // Jika online → tampilkan UI chat seperti biasa
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white dark:bg-gray-900 transition">

      {/* HEADER */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-4 flex justify-between items-center sticky top-0 left-0 right-0 z-10">
        <div className="flex items-center">
          <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-full mr-3">
            <BotMessageSquare size={20} className="text-indigo-600 dark:text-indigo-300" />
          </div>

          <div>
            <h2 className="font-bold text-gray-800 dark:text-white">Noto AI Assistant</h2>

            <p className="text-[10px] text-green-600 dark:text-green-400 font-medium flex items-center">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
              Online & Connected to Data
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button onClick={clearChat} className="text-gray-400 dark:text-gray-300 hover:text-red-500">
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.length === 0 && (
          <div className="text-center mt-10 opacity-60">
            <BotMessageSquare size={48} className="mx-auto mb-4 text-indigo-300 dark:text-indigo-400" />
            <p className="text-sm text-gray-500 dark:text-gray-300">
              Tanyakan apa saja tentang<br />keuangan tokomu.
            </p>

            <div className="mt-6 space-y-2">
              <button
                onClick={() => setInput("Bagaimana performa penjualan minggu ini?")}
                className="block w-full text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-lg text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                "Bagaimana performa penjualan minggu ini?"
              </button>

              <button
                onClick={() => setInput("Barang apa yang harus saya restock?")}
                className="block w-full text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-lg text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                "Barang apa yang harus saya restock?"
              </button>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm text-sm transition ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-none'
              }`}
            >
              {msg.sender === 'assistant' ? (
                <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 dark:prose-invert">
                  <ReactMarkdown>{msg.message}</ReactMarkdown>
                </div>
              ) : (
                msg.message
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-none p-4 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <form
        onSubmit={handleSend}
        className="w-full fixed bottom-16 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik pertanyaan..."
          className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-0 rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-400 dark:placeholder-gray-400"
        />

        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={18} />
        </button>
      </form>

    </div>
  );
};

export default SmartAdvisor;
