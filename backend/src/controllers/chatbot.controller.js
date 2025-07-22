export const handleChat = async (req, res) => {
  const userMessage = req.body.message;
  console.log("📥 Received message from frontend:", userMessage);

  try {
    const ollamaRes = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama2",
        prompt: userMessage,
        stream: false,
      }),
    });

    const data = await ollamaRes.json();
    console.log("🤖 Response from Ollama:", data);

    if (!ollamaRes.ok) throw new Error("Failed to communicate with Ollama");

    const aiReply = data.response.trim();
    res.json({ reply: aiReply });
  } catch (err) {
    console.error("❌ Ollama error:", err.message);
    res.status(500).json({ error: "Error communicating with Ollama" });
  }
};
