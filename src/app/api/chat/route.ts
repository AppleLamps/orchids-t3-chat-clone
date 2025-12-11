import type { MessageContent, ModelId } from "@/types/chat";

interface ChatRequest {
  messages: Array<{ role: string; content: MessageContent }>;
  model?: ModelId;
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as ChatRequest;
    const { messages, model } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid messages format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": req.headers.get("origin") || "http://localhost:3000",
        "X-Title": "T3 Chat Clone",
      },
      body: JSON.stringify({
        model: model || "x-ai/grok-4.1-fast",
        messages,
        stream: true,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

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
    if (error instanceof Error && error.name === "AbortError") {
      return new Response(JSON.stringify({ error: "Request timeout" }), {
        status: 504,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}