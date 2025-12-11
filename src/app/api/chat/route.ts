export async function POST(req: Request) {
  try {
    const { messages, model } = await req.json();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer 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`,
        "Content-Type": "application/json",
        "HTTP-Referer": req.headers.get("origin") || "http://localhost:3000",
        "X-Title": "T3 Chat Clone",
      },
      body: JSON.stringify({
        model: model || "x-ai/grok-4.1-fast",
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", errorText);
      return new Response(JSON.stringify({ error: errorText }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
