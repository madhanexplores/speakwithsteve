export function encodeWAV(samples: Int16Array, sampleRate: number = 24000) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* RIFF chunk length */
  view.setUint32(4, 36 + samples.length * 2, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, 1, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  for (let i = 0; i < samples.length; i++) {
    view.setInt16(44 + i * 2, samples[i], true);
  }

  return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export function playSteveAudio(audioData: { data: string, mimeType: string }, audioRef?: React.RefObject<HTMLAudioElement | null>) {
  let blob: Blob;
  
  if (audioData.mimeType.includes('pcm')) {
    // Convert base64 to Int16Array
    const binaryString = atob(audioData.data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const samples = new Int16Array(bytes.buffer);
    const wavBuffer = encodeWAV(samples);
    blob = new Blob([wavBuffer], { type: 'audio/wav' });
  } else {
    const binaryString = atob(audioData.data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    blob = new Blob([bytes], { type: audioData.mimeType });
  }

  const audioUrl = URL.createObjectURL(blob);
  
  if (audioRef?.current) {
    audioRef.current.src = audioUrl;
    audioRef.current.play().catch(e => console.error("Error playing audio:", e));
  } else {
    const audio = new Audio(audioUrl);
    audio.play().catch(e => console.error("Error playing audio:", e));
  }
}

export function speakText(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.error("Speech synthesis not supported");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  const getBestVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const hasTamil = /[\u0B80-\u0BFF]/.test(text);

    if (hasTamil) {
      // Try to find a Tamil voice
      const tamilVoice = voices.find(v => v.lang.startsWith('ta'));
      if (tamilVoice) return tamilVoice;
    }
    
    // Priority list for "Natural" sounding free voices
    // 1. "Natural" or "Neural" (Edge/Chrome high quality)
    // 2. "Google" (Chrome's high quality remote voices)
    // 3. Premium/Enhanced system voices
    return voices.find(v => (v.name.includes('Natural') || v.name.includes('Neural')) && v.lang.startsWith('en')) ||
           voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
           voices.find(v => v.name.includes('Premium') && v.lang.startsWith('en')) ||
           voices.find(v => v.lang.startsWith('en-US')) ||
           voices.find(v => v.lang.startsWith('en')) ||
           voices[0];
  };

  const setVoiceAndSpeak = () => {
    const voice = getBestVoice();
    if (voice) {
      utterance.voice = voice;
      // Natural voices often sound better at a slightly slower rate
      utterance.rate = voice.name.includes('Natural') || voice.name.includes('Google') ? 0.95 : 0.9;
    }
    
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    if (onEnd) {
      utterance.onend = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  };

  // Voices are loaded asynchronously in many browsers
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      setVoiceAndSpeak();
      window.speechSynthesis.onvoiceschanged = null; // Clean up
    };
  } else {
    setVoiceAndSpeak();
  }
}
