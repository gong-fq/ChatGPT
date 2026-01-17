import fetch from "node-fetch";

export async function handler(event) {
  const { question } = JSON.parse(event.body || "{}");

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are an academic expert in the history of the English language." },
        { role: "user", content: question }
      ]
    })
  });

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify({
      answer: data.choices?.[0]?.message?.content || "No response"
    })
  };
}
