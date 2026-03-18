import { GoogleGenAI } from "@google/genai";

export const getSteveSystemPrompt = (language: 'English' | 'Tamil' = 'English') => `
You are Steve, a friendly and encouraging English tutor. 
Your goal is to help the user practice their English speaking and writing skills.

When a user sends a message:
1. First, check if there are any grammar or spelling mistakes in their sentence.
2. **IMPORTANT**: Ignore capitalization and basic punctuation errors (like missing periods at the end), as the user might be using voice-to-text which often lacks these. Only correct actual grammar, word choice, or spelling mistakes.
3. If there are mistakes, provide a "Corrected sentence" and a brief, simple "Explanation".
4. **IMPORTANT**: Provide the "Explanation" in ${language}.
5. Then, continue the conversation naturally as a friend would in English.
5. Keep your responses relatively short (2-4 sentences) to encourage more back-and-forth.
6. Use a friendly, helpful tone.

Example format (if language is English):
Corrected sentence: I went to the market yesterday.
Explanation: We use "went" as the past tense of "go".

Anyway, that sounds like a fun trip! What did you buy at the market?

Example format (if language is Tamil):
Corrected sentence: I went to the market yesterday.
Explanation: "go" என்பதன் கடந்த காலம் "went" ஆகும்.

Anyway, that sounds like a fun trip! What did you buy at the market?
`;

export async function getSteveResponse(message: string, history: { role: "user" | "model", parts: { text: string }[] }[], language: 'English' | 'Tamil' = 'English') {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set");
    return "I'm having trouble connecting to my brain right now. Please check the API key configuration.";
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: getSteveSystemPrompt(language),
      },
      contents: [
        ...history.map(h => ({
          role: h.role === "model" ? "model" : "user",
          parts: h.parts
        })),
        { role: "user", parts: [{ text: message }] }
      ],
    });

    return response.text;
  } catch (error: any) {
    console.error("Error getting Steve's response:", error);
    
    // Handle specific 404 error by trying a fallback model if needed
    if (error.message?.includes("404") || error.status === "NOT_FOUND") {
       return "I'm sorry, I'm having trouble finding the right AI model to talk to you. Please contact support.";
    }

    return "Oops! I had a little glitch. Can you say that again?";
  }
}

export async function getSteveSpeech(text: string): Promise<{ data: string, mimeType: string } | null> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say naturally: ${text}` }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' },
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part?.inlineData?.data && part?.inlineData?.mimeType) {
      return {
        data: part.inlineData.data,
        mimeType: part.inlineData.mimeType
      };
    }
    return null;
  } catch (error: any) {
    // Silently handle quota errors to allow fallback to browser TTS
    if (error.message?.includes("429") || error.status === "RESOURCE_EXHAUSTED") {
      console.warn("Gemini TTS Quota exceeded, falling back to browser voice.");
    } else {
      console.error("Error generating speech:", error);
    }
    return null;
  }
}
