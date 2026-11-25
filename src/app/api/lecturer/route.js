import {
  buildLecturerSystemPrompt,
  detectPromptLanguageStyle,
  generateSmartFallbackReply,
  sanitizeLecturerOutput
} from "@/lib/lecturerAI";

function normalizeGeminiContents(history, currentMessage) {
  const safeHistory = Array.isArray(history) ? history.slice(-6) : [];
  const normalized = [];

  for (const item of safeHistory) {
    if (!item || typeof item.text !== "string") continue;
    const text = item.text.trim();
    if (!text) continue;
    const role = item.sender === "user" ? "user" : "model";

    // Gemini expects conversation turns to begin with a user message
    if (normalized.length === 0 && role === "model") continue;

    // Avoid consecutive duplicate roles by merging
    const prev = normalized[normalized.length - 1];
    if (prev && prev.role === role) {
      prev.parts[0].text = `${prev.parts[0].text}\n${text}`;
    } else {
      normalized.push({ role, parts: [{ text }] });
    }
  }

  // Append current user message (avoid duplicating if caller already included it at the tail)
  const last = normalized[normalized.length - 1];
  if (last && last.role === "user" && last.parts[0].text === currentMessage) {
    return normalized;
  }
  if (last && last.role === "user") {
    last.parts[0].text = `${last.parts[0].text}\n${currentMessage}`;
  } else {
    normalized.push({ role: "user", parts: [{ text: currentMessage }] });
  }

  return normalized;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message.trim().slice(0, 2000) : "";

    if (!message) {
      return Response.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const currentTopic = body?.currentTopic && typeof body.currentTopic === "object" ? body.currentTopic : null;
    const activeQuestion = body?.activeQuestion && typeof body.activeQuestion === "object" ? body.activeQuestion : null;
    const history = Array.isArray(body?.history) ? body.history : [];

    const languageStyle = detectPromptLanguageStyle(message);
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

    if (!apiKey) {
      return Response.json({
        reply: generateSmartFallbackReply(message, currentTopic, activeQuestion, languageStyle),
        languageStyle,
        source: "fallback"
      });
    }

    const systemPrompt = buildLecturerSystemPrompt({
      languageStyle,
      currentTopic,
      activeQuestion
    });

    const contents = normalizeGeminiContents(history, message);
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(
      apiKey
    )}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 450
        }
      })
    });

    if (response.ok) {
      const result = await response.json();
      const rawReply = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      const cleanReply = sanitizeLecturerOutput(rawReply);

      if (cleanReply) {
        return Response.json({
          reply: cleanReply,
          languageStyle,
          source: "gemini"
        });
      }
    }

    return Response.json({
      reply: generateSmartFallbackReply(message, currentTopic, activeQuestion, languageStyle),
      languageStyle,
      source: "fallback"
    });
  } catch {
    return Response.json(
      {
        reply: generateSmartFallbackReply("", null, null, "id-mixed"),
        languageStyle: "id-mixed",
        source: "fallback"
      },
      { status: 200 }
    );
  }
}
