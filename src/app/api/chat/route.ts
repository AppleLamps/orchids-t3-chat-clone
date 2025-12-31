import type { MessageContent, ModelId } from "@/types/chat";

interface ChatRequest {
  messages: Array<{ role: string; content: MessageContent }>;
  model?: ModelId;
  systemPrompt?: string | null;
  webSearchEnabled?: boolean;
}

const CONNECT_TIMEOUT_MS = 60_000;
// If the upstream stops sending bytes (including keep-alives), abort to avoid hanging forever.
const STREAM_IDLE_TIMEOUT_MS = 45_000;
// Absolute ceiling for a single generation; protects against rare "never ending" streams.
const STREAM_TOTAL_TIMEOUT_MS = 5 * 60_000;

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as ChatRequest;
    const { messages, model, systemPrompt, webSearchEnabled } = body;

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
    const connectTimeout = setTimeout(() => controller.abort(), CONNECT_TIMEOUT_MS);

    // If the client disconnects, stop the upstream request immediately.
    try {
      req.signal?.addEventListener("abort", () => controller.abort(), { once: true });
    } catch {
      // ignore (older runtimes / unexpected Request impl)
    }

    const messagesWithSystem = systemPrompt
      ? [{ role: "system", content: systemPrompt }, ...messages]
      : messages;

    // Build request body with optional web search plugin
    const requestBody: Record<string, unknown> = {
      model: model || "x-ai/grok-4.1-fast",
      messages: messagesWithSystem,
      stream: true,
    };

    // Enable web search via OpenRouter plugins when requested
    if (webSearchEnabled) {
      requestBody.plugins = [{ id: "web" }];
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": req.headers.get("origin") || "http://localhost:3000",
        "X-Title": "T3 Chat Clone",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(connectTimeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", errorText);
      return new Response(JSON.stringify({ error: errorText }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!response.body) {
      return new Response(JSON.stringify({ error: "Upstream response has no body" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Wrap the upstream stream to enforce idle/total timeouts during generation.
    const upstreamReader = response.body.getReader();

    let idleTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let totalTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const resetIdleTimeout = () => {
      if (idleTimeoutId) clearTimeout(idleTimeoutId);
      idleTimeoutId = setTimeout(() => controller.abort(), STREAM_IDLE_TIMEOUT_MS);
    };

    const clearStreamTimeouts = () => {
      if (idleTimeoutId) clearTimeout(idleTimeoutId);
      if (totalTimeoutId) clearTimeout(totalTimeoutId);
      idleTimeoutId = null;
      totalTimeoutId = null;
    };

    resetIdleTimeout();
    totalTimeoutId = setTimeout(() => controller.abort(), STREAM_TOTAL_TIMEOUT_MS);

    const wrappedStream = new ReadableStream<Uint8Array>({
      async start(streamController) {
        try {
          while (true) {
            const { done, value } = await upstreamReader.read();
            if (done) break;
            if (value) {
              resetIdleTimeout();
              streamController.enqueue(value);
            }
          }
          clearStreamTimeouts();
          streamController.close();
        } catch (error) {
          clearStreamTimeouts();
          // If we aborted due to our timeout or client disconnect, close cleanly so the client unblocks.
          if (isAbortError(error) || controller.signal.aborted) {
            try {
              streamController.close();
            } catch {
              // ignore
            }
            return;
          }
          streamController.error(error);
        } finally {
          clearStreamTimeouts();
          try {
            await upstreamReader.cancel();
          } catch {
            // ignore
          }
        }
      },
      cancel() {
        clearStreamTimeouts();
        controller.abort();
      },
    });

    return new Response(wrappedStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    if (isAbortError(error)) {
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