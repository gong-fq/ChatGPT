// 注意：无需在顶部引入 node-fetch，Netlify Node.js 18+ 环境已内置 fetch

exports.handler = async function (event) {
  try {
    // 1. 仅允许 POST 请求
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ answer: "仅支持 POST 请求" })
      };
    }

    // 2. 解析前端传来的问题
    const { question } = JSON.parse(event.body || "{}");

    if (!question) {
      return {
        statusCode: 400,
        body: JSON.stringify({ answer: "没有接收到问题，请重新输入。" })
      };
    }

    // 3. 检查环境变量
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      console.error("错误：未在 Netlify 后台配置 DEEPSEEK_API_KEY 环境变量");
      return {
        statusCode: 500,
        body: JSON.stringify({ answer: "服务器配置错误：缺少 API Key。" })
      };
    }

    // 4. 调用 DeepSeek API
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are an academic expert in the history of the English language. Answer clearly and rigorously."
          },
          { role: "user", content: question }
        ],
        stream: false // 确保不开启流式，以适配 Netlify Function 的简单返回模式
      })
    });

    // 5. 检查 API 响应状态
    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API 返回错误:", errorText);
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          answer: "DeepSeek 服务繁忙或调用出错，请稍后再试。",
          details: errorText 
        })
      };
    }

    const data = await response.json();

    // 6. 成功返回结果
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        answer: data.choices?.[0]?.message?.content || "AI 没能给出有效的回复。"
      })
    };

  } catch (err) {
    // 捕获代码逻辑错误
    console.error("云函数执行崩溃:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        answer: "服务器内部错误，请检查 Netlify Function 日志。",
        error: err.message 
      })
    };
  }
};