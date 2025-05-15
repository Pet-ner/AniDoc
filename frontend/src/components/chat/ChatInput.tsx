import { useState } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim() || disabled) return;
    onSendMessage(message);
    setMessage("");
  };

  return (
    <div className="border-t border-teal-100 p-3 flex gap-2 bg-white">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleSend()}
        placeholder="메시지를 입력하세요..."
        className="flex-1 border border-teal-100 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
        disabled={disabled}
      />
      <button
        onClick={handleSend}
        disabled={disabled}
        className="bg-teal-500 text-white px-3 py-2 rounded-md hover:bg-teal-600 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        <Send size={18} />
      </button>
    </div>
  );
}
