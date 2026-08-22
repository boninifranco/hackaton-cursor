import { useState, useRef, useCallback } from "react";

// Reconocimiento de voz nativo del navegador (gratis, sin API externa).
// Funciona bien en Chrome/Edge. Si el navegador no lo soporta, el botón
// simplemente no aparece y el usuario sigue pudiendo tipear.

export function useSpeechToText(onResult: (texto: string) => void) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const supported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const start = useCallback(() => {
    if (!supported) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.lang = "es-AR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.onresult = (event: any) => {
      const texto = event.results[0][0].transcript;
      onResult(texto);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onResult, supported]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { listening, start, stop, supported };
}
