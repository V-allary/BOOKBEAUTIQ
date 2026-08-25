import { useEffect, useRef, useState } from "react";

function BusinessChatWidget({ businessId, customerEmail }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const token = localStorage.getItem("token");
  const bottomRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/messages/business/${businessId}/${encodeURIComponent(customerEmail)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (response.ok) setMessages(data);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [businessId, customerEmail]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);

    try {
      const response = await fetch(
        "http://localhost:5001/api/messages/business",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ businessId, customerEmail, text }),
        }
      );

      if (response.ok) {
        setText("");
        fetchMessages();
      }
    } finally {
      setSending(false);
    }
  };

  const Ticks = ({ read }) => (
    <span
      className={`ml-1 text-[10px] ${
        read ? "text-[#B96882]" : "text-white/70"
      }`}
    >
      {read ? "✓✓" : "✓"}
    </span>
  );

  return (
    <div className="flex h-96 flex-col rounded-2xl border border-[#ECE4E6] bg-white">

      <div className="border-b border-[#ECE4E6] p-3 text-sm font-semibold text-[#242424]">
        {customerEmail}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">

        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400">
            No messages yet.
          </p>
        )}

        {messages.map((m) => (
          <div
            key={m._id}
            className={`flex ${
              m.sender === "business"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                m.sender === "business"
                  ? "bg-[#B96882] text-white"
                  : "bg-[#F7F2F4] text-[#242424]"
              }`}
            >
              {m.text}

              {m.sender === "business" && (
                <Ticks read={m.read} />
              )}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />

      </div>

      <form
        onSubmit={handleSend}
        className="flex gap-2 border-t border-[#ECE4E6] p-3"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Reply to customer..."
          className="flex-1 rounded-xl border border-[#E5DDE0] bg-[#FAF8F9] p-3 text-sm text-[#242424] outline-none transition placeholder:text-gray-400 focus:border-[#B96882] focus:bg-white focus:ring-4 focus:ring-[#B96882]/10"
        />

        <button
          type="submit"
          disabled={sending}
          className="rounded-xl bg-[#B96882] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#A85872] disabled:opacity-50"
        >
          Send
        </button>
      </form>

    </div>
  );
}

export default BusinessChatWidget;