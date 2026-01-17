const fetch = require("node-fetch");

exports.handler = async function (event) {
  try {
    const { question } = JSON.parse(event.body || "{}");

    if (!question) {
      return {
        statusCode: 400,
        body: JSON.stringify({ answer: "No question provided." })
      };
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ answer: "DeepSeek API key not configured." })
      };
    }

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "You are an academic expert in the history of the English language. Answer clearly and rigorously."
          },
          { role: "user", content: question }
        ]
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        answer: data.choices?.[0]?.message?.content || "No response."
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ answer: "Server error.", error: err.message })
    };
  }
};
