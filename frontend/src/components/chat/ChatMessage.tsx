interface ChatMessageProps {
  message: {
    id: number;
    senderId: number;
    senderName: string;
    content: string;
    createdAt: string;
  };
  isOwnMessage: boolean;
}

export default function ChatMessage({
  message,
  isOwnMessage,
}: ChatMessageProps) {
  const formatTime = (dateTimeString: string) => {
    try {
      let timeString;
      // "YYYY-MM-DD HH:MM:SS"
      timeString = dateTimeString.split(" ")[1].substring(0, 5);
      return timeString;
    } catch (e) {
      return "";
    }
  };

  return (
    <div
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-3`}
    >
      <div
        className={`max-w-[75%] rounded-lg p-3 ${
          isOwnMessage ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-800"
        }`}
      >
        {!isOwnMessage && (
          <div className="text-xs font-medium mb-1">{message.senderName}</div>
        )}
        <div className="break-words">{message.content}</div>
        <div className="text-xs mt-1 opacity-70 text-right">
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
}
