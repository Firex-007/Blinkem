import { useState, useRef, useEffect, useCallback } from 'react';
import { blobToWav16kMono } from '../lib/wav';
import { classifyTradeFromText } from '../lib/tradeClassifier';
import { api } from '../api';

export function useVoiceRecorder({ onResult, onError, autoStopSilence = true, silenceThresholdMs = 1800, lang = 'auto' } = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const liveTranscriptRef = useRef('');

  // Silence detection refs
  const hasSpokenRef = useRef(false);
  const lastSpeechTimeRef = useRef(0);
  const isStoppingRef = useRef(false);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {}
    }
    setIsRecording(false);
    setAudioLevel(0);
    isStoppingRef.current = false;
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const stopRecording = useCallback(() => {
    if (isStoppingRef.current) return;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      isStoppingRef.current = true;
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Error stopping media recorder:', e);
      }
    }
  }, []);

  const startRecording = async () => {
    cleanup();
    chunksRef.current = [];
    setLiveTranscript('');
    liveTranscriptRef.current = '';
    hasSpokenRef.current = false;
    lastSpeechTimeRef.current = Date.now();
    isStoppingRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Start Web Speech API live recognition if available in browser
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          const recognition = new SpeechRec();
          recognition.continuous = true;
          recognition.interimResults = true;
          const langMap = {
            ta: 'ta-IN',
            hi: 'hi-IN',
            en: 'en-IN',
          };
          recognition.lang = langMap[lang] || (lang === 'en' ? 'en-IN' : 'ta-IN');
          recognition.onresult = (event) => {
            let combined = '';
            for (let i = 0; i < event.results.length; ++i) {
              combined += event.results[i][0].transcript + ' ';
            }
            const clean = combined.trim();
            if (clean) {
              setLiveTranscript(clean);
              liveTranscriptRef.current = clean;
              hasSpokenRef.current = true;
              lastSpeechTimeRef.current = Date.now();
            }
          };
          recognition.onerror = (e) => {
            console.debug('Speech recognition interim warning:', e.error);
          };
          recognition.start();
          recognitionRef.current = recognition;
        } catch (e) {
          console.debug('Web Speech API unavailable or denied:', e);
        }
      }

      // Update volume meter level and silence detection
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;
        const currentLevel = Math.min(1, avg / 128);
        setAudioLevel(currentLevel);

        // Silence / VAD Detection
        const now = Date.now();
        if (currentLevel > 0.08) {
          hasSpokenRef.current = true;
          lastSpeechTimeRef.current = now;
        } else if (hasSpokenRef.current && autoStopSilence) {
          // If user spoke and has now been silent for silenceThresholdMs, auto-stop
          if (now - lastSpeechTimeRef.current > silenceThresholdMs) {
            stopRecording();
            return;
          }
        }

        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch (e) {}
        }

        setIsRecording(false);
        setIsProcessing(true);

        try {
          const rawBlob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          const wavBlob = await blobToWav16kMono(rawBlob);

          const formData = new FormData();
          formData.append('audio', wavBlob, 'request.wav');
          formData.append('lang_hint', lang || 'auto');
          if (liveTranscriptRef.current) {
            formData.append('client_transcript', liveTranscriptRef.current);
          }

          let res;
          try {
            res = await api.postForm('/voice/parse', formData);
          } catch (audioErr) {
            console.warn('Audio parse attempt failed, trying transcript fallback:', audioErr);
            if (liveTranscriptRef.current) {
              res = await api.post('/voice/parse-text', {
                text: liveTranscriptRef.current,
                lang_hint: lang || 'auto',
              });
            } else {
              throw audioErr;
            }
          }

          // If backend didn't supply transcript but live transcript is available
          if (!res.transcript && liveTranscriptRef.current) {
            res.transcript = liveTranscriptRef.current;
          }
          if (onResult) onResult(res);
        } catch (err) {
          console.error('Voice parse error:', err);
          if (onError) onError(err);
          // Intelligent contextual fallback using trade classifier
          const text = liveTranscriptRef.current || 'Home service request';
          const classified = classifyTradeFromText(text);
          if (onResult) {
            onResult({
              category: classified.category,
              description: text,
              urgency: classified.urgency,
              transcript: text,
              confidence: classified.confidence,
              source: 'local_ai',
            });
          }
        } finally {
          setIsProcessing(false);
          isStoppingRef.current = false;
        }
      };

      recorder.start(100);
      setIsRecording(true);

      // Max 15 seconds recording auto-stop safety
      timerRef.current = setTimeout(() => {
        if (recorder.state === 'recording') stopRecording();
      }, 15000);
    } catch (err) {
      console.error('Mic access error:', err);
      if (onError) onError(err);
      setIsRecording(false);
    }
  };

  return {
    isRecording,
    isProcessing,
    audioLevel,
    liveTranscript,
    startRecording,
    stopRecording,
    cleanup,
  };
}

export default useVoiceRecorder;
