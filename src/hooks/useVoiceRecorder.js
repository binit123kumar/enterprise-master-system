import { useState, useRef, useCallback } from "react";

export function useVoiceRecorder() {
  const [recording,   setRecording]   = useState(false);
  const [transcript,  setTranscript]  = useState("");
  const [audioBlob,   setAudioBlob]   = useState(null);
  const [error,       setError]       = useState(null);
  const [volume,      setVolume]      = useState(0);

  const mediaRecorder = useRef(null);
  const recognition   = useRef(null);
  const analyser      = useRef(null);
  const animFrame     = useRef(null);
  const chunks        = useRef([]);

  const startRecording = useCallback(async () => {
    setError(null);
    setTranscript("");
    chunks.current = [];

    try {
      // 1. Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 2. Volume analyser
      const ctx  = new AudioContext();
      const src  = ctx.createMediaStreamSource(stream);
      analyser.current = ctx.createAnalyser();
      analyser.current.fftSize = 256;
      src.connect(analyser.current);

      const trackVolume = () => {
        const data = new Uint8Array(analyser.current.frequencyBinCount);
        analyser.current.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setVolume(Math.min(100, avg * 2));
        animFrame.current = requestAnimationFrame(trackVolume);
      };
      trackVolume();

      // 3. MediaRecorder for audio blob
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = e => chunks.current.push(e.data);
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach(t => t.stop());
        cancelAnimationFrame(animFrame.current);
        setVolume(0);
      };
      mediaRecorder.current.start();

      // 4. Web Speech API for live transcript
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition.current = new SR();
        recognition.current.continuous    = true;
        recognition.current.interimResults = true;
        recognition.current.lang          = "en-IN"; // Hindi+English

        recognition.current.onresult = (e) => {
          let final = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) final += e.results[i][0].transcript + " ";
          }
          if (final) setTranscript(prev => prev + final);
        };

        recognition.current.onerror = () => {
          setError("Speech recognition failed. Using text input instead.");
        };

        recognition.current.start();
      } else {
        setError("Speech recognition not supported in this browser. Use text input.");
      }

      setRecording(true);
    } catch (err) {
      setError(err.message.includes("Permission")
        ? "Microphone permission denied. Please allow microphone access."
        : "Could not start recording: " + err.message);
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorder.current?.stop();
    recognition.current?.stop();
    setRecording(false);
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
    setAudioBlob(null);
    setError(null);
    setVolume(0);
  }, []);

  return { recording, transcript, audioBlob, error, volume, startRecording, stopRecording, reset };
}
