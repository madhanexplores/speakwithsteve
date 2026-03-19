'use server';

import { getSteveSystemPrompt } from '@/lib/gemini';

export async function getSteveResponseAction(message: string, history: { role: "user" | "model", parts: { text: string }[] }[], language: 'English' | 'Tamil' = 'English') {
  const apiKey = process.env.OPENROUTER_API_KEY || "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";
  
  if (!apiKey || apiKey === "") {
    console.error("OPENROUTER_API_KEY is not set on the server");
    throw new Error("AI service is currently unavailable. Please check server configuration.");
  }

  try {
    const formattedHistory = history.map(h => ({
      role: h.role === "model" ? "assistant" : "user",
      content: h.parts[0].text
    }));

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey.trim()}`,
        "HTTP-Referer": process.env.APP_URL || "https://ai.studio",
        "X-Title": "SpeakWithSteve",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: getSteveSystemPrompt(language) },
          ...formattedHistory,
          { role: "user", content: message }
        ]
      }),
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `OpenRouter API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response from AI service");
    }
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error("Error in getSteveResponseAction:", error.message || error);
    throw error;
  }
}
