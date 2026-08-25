import { useEffect, useRef, useState } from "react";

function ChatWidget({ businessId, customerEmail }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const token = localStorage.getItem("token");
  const bottomRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const url = `http://localhost:5001/api/messages/customer/${businessId}?email=${encodeURIComponent(customerEmail)}`;
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
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
        "http://localhost:5001/api/messages/customer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            businessId,
            text,
            customerEmail,
          }),
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
    <div className="flex h-96 flex-col overflow-hidden rounded-[24px] border border-[#E5E2DF] bg-white shadow-sm">

      {/* ======================================
          MESSAGES
      ====================================== */}

      <div className="flex-1 space-y-3 overflow-y-auto bg-[#F7F7F6] p-4">

        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">

            <div className="text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F7EEF1] text-lg text-[#B96882]">
                ✦
              </div>

              <p className="mt-3 text-sm text-gray-400">
                No messages yet — say hello!
              </p>

            </div>

          </div>
        )}

        {messages.map((m) => (
          <div
            key={m._id}
            className={`flex ${
              m.sender === "customer"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                m.sender === "customer"
                  ? "bg-[#B96882] text-white"
                  : "border border-[#E5E2DF] bg-white text-[#242424]"
              }`}
            >
              {m.text}

              {m.sender === "customer" && (
                <Ticks read={m.read} />
              )}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />

      </div>

      {/* ======================================
          MESSAGE INPUT
      ====================================== */}

      <form
        onSubmit={handleSend}
        className="flex gap-2 border-t border-[#E5E2DF] bg-white p-3"
      >

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-xl border border-[#E5E2DF] bg-[#FAFAF9] p-3 text-sm text-[#242424] outline-none transition placeholder:text-gray-400 focus:border-[#B96882] focus:bg-white focus:ring-4 focus:ring-[#B96882]/10"
        />

        <button
          type="submit"
          disabled={sending}
          className="rounded-xl bg-[#B96882] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#A95772] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? "Sending..." : "Send"}
        </button>

      </form>

    </div>
  );
}

export default ChatWidget;