import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import closeIcon from "../assets/icon/closeIcon.svg";
interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "🤖 Chatbot sẵn sàng trả lời câu hỏi!", isUser: false },
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false); // Trạng thái để kiểm soát thu gọn/mở rộng
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      isUser: true,
    };
    setMessages([...messages, userMessage]);
    setInput("");

    try {
      const response = await fetch("http://localhost:9090/api/chatbot/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: input }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to get chatbot response: ${await response.text()}`
        );
      }

      const botResponse = await response.text();
      const botMessage: Message = {
        id: messages.length + 2,
        text: botResponse,
        isUser: false,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: messages.length + 2,
        text:
          "Lỗi khi gọi chatbot: " +
          (error instanceof Error ? error.message : "Unknown error"),
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
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
            />
            <button
              className="mt-2 w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
              onClick={handleSend}
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
