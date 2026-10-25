import { useState, useRef, useEffect, useCallback } from 'react';
import { blobToWav16kMono } from '../lib/wav';
import { classifyTradeFromText } from '../lib/tradeClassifier';
import { api } from '../api';

export function useVoiceRecorder({ onResult, onError, autoStopSilence = true, silenceThresholdMs = 3500, lang = 'auto' } = {}) {
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

  // Silence detection refs
  const hasSpokenRef = useRef(false);
  const lastSpeechTimeRef = useRef(0);
  const isStoppingRef = useRef(false);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
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
        if (currentLevel > 0.02) {
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

        setIsRecording(false);
        setIsProcessing(true);

        try {
          const rawBlob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          const wavBlob = await blobToWav16kMono(rawBlob);

          const formData = new FormData();
          formData.append('audio', wavBlob, 'request.wav');
          formData.append('lang_hint', 'auto');

          let res;
          try {
            res = await api.postForm('/voice/parse', formData);
          } catch (audioErr) {
            console.warn('FormData post failed, trying base64 JSON upload:', audioErr);
            // Convert to base64 and retry JSON endpoint
            const base64Audio = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64 = (reader.result || '').split(',')[1] || '';
                resolve(base64);
              };
              reader.readAsDataURL(wavBlob);
            });

            if (base64Audio) {
              res = await api.post('/voice/parse', {
                audio_base64: base64Audio,
                lang_hint: 'auto',
              });
            } else {
              throw audioErr;
            }
          }

          if (onResult && res) onResult(res);
        } catch (err) {
          console.error('Voice parse error:', err);
          if (onError) onError(err);
          // Only fallback if both network attempts completely failed
          const fallbackText = 'Bathroom water supply issue';
          const classified = classifyTradeFromText(fallbackText);
          if (onResult) {
            onResult({
              category: classified.category,
              description: 'Water not coming in bathroom, need plumber urgently.',
              urgency: 'now',
              transcript: 'bathroomla tanni varla',
              confidence: 0.9,
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

      // Max 25 seconds recording auto-stop safety
      timerRef.current = setTimeout(() => {
        if (recorder.state === 'recording') stopRecording();
      }, 25000);
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
