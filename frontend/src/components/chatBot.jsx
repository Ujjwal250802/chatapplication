import React, { useState } from "react";
import "../index.css";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);

  const toggleChatbox = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (!input.trim() || isSending) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { sender: "You", text: userText }]);
    setInput("");
    setIsSending(true);
    setMessages((prev) => [...prev, { sender: "ChatSphere AI", text: "typing..." }]);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { sender: "ChatSphere AI", text: data.reply };
        return updated;
      });
    } catch (error) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          sender: "ChatSphere AI",
          text: "⚠️ Error: Could not get response.",
        };
        return updated;
      });
    }

    setIsSending(false);
  };

  return (
    <>
      <div id="chat-icon" onClick={toggleChatbox}>💬</div>
      {isOpen && (
        <div id="chatbox">
          <div id="chat-header">
            ChatSphere AI
            <span id="close-chat" onClick={toggleChatbox}>❌</span>
          </div>
          <div id="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx}>
                <strong>{msg.sender}:</strong> {msg.text}
              </div>
            ))}
          </div>
          <div id="chat-input-container">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
