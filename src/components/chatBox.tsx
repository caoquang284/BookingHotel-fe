import React, { useState, useEffect, useRef } from "react";
import { askChatbot } from "../services/apis/chatbot/chatbot";
import { loadKnowledgeSections, getRelevantSections } from "../services/apis/chatbot/loadKnowledge";
import closeIcon from "../assets/icon/closeIcon.svg";
import { useAuth } from "../contexts/AuthContext";
import { getGuestByAccountId } from '../services/apis/guest'

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

const Chatbot: React.FC = () => {
  const { user } = useAuth();
  const [guestId, setGuestId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "🤖 Chatbot sẵn sàng trả lời câu hỏi!", isUser: false },
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [knowledge, setKnowledge] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.id) return;

    getGuestByAccountId(user.id)
      .then((guest) => {
        if (guest?.id) setGuestId(guest.id);
      })
      .catch((err) => {
        console.error("Không lấy được guest từ account id:", err);
      });
  }, [user]);

  useEffect(() => {
    if (!guestId) return;

    loadKnowledgeSections(guestId)
      .then((data) => {
      console.log("🎯 DỮ LIỆU KIẾN THỨC CHO CHATBOT (knowledge):", data);
      setKnowledge(data);
      })
      .catch((err) => {
        console.error("❌ Lỗi khi tải dữ liệu kiến thức:", err);
      });
  }, [guestId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question || loading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: question,
      isUser: true,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const relevantData = getRelevantSections(question, knowledge);
      const responseText = await askChatbot(question, relevantData);

      const botMessage: Message = {
        id: messages.length + 2,
        text: responseText,
        isUser: false,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorText =
        error instanceof Error ? error.message : "Lỗi không xác định khi gọi Gemini.";
      setMessages((prev) => [
        ...prev,
        { id: messages.length + 2, text: "❌ " + errorText, isUser: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 z-40"
          onClick={() => setIsOpen(true)}
        >
          <img
            src="https://img.icons8.com/ios-filled/24/ffffff/bot.png"
            alt="Robot Icon"
            className="w-6 h-6"
          />
        </button>
      )}
      {isOpen && (
        <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-lg flex flex-col z-40">
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h2 className="text-lg font-semibold">Chatbot Hỗ trợ</h2>
            <button
              className="text-white hover:text-gray-200"
              onClick={() => setIsOpen(false)}
            >
              <img src={closeIcon} alt="Close Icon" className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-2 flex ${
                  msg.isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    msg.isUser
                      ? "bg-blue-100 text-blue-900"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <span>{msg.isUser ? "🧑‍💼 " : "🤖 "}</span>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t">
            <textarea
              className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập câu hỏi của bạn..."
              disabled={loading}
            />
            <button
              className="mt-2 w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              onClick={handleSend}
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Gửi"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
