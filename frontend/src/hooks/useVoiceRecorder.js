import { useState, useRef, useEffect, useCallback } from 'react';
import { blobToWav16kMono } from '../lib/wav';
import { api } from '../api';

export function useVoiceRecorder({ onResult, onError } = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

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
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startRecording = async () => {
    cleanup();
    chunksRef.current = [];

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

      // Update volume meter level
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(1, avg / 128));
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

          const res = await api.postForm('/voice/parse', formData);
          if (onResult) onResult(res);
        } catch (err) {
          console.error('Voice parse error:', err);
          if (onError) onError(err);
          // Fallback demo result so user is never blocked
          if (onResult) {
            onResult({
              category: 'plumber',
              description: 'Urgent home repair required',
              urgency: 'now',
              transcript: 'Sink leak',
              source: 'fallback',
            });
          }
        } finally {
          setIsProcessing(false);
        }
      };

      recorder.start(100);
      setIsRecording(true);

      // Max 15 seconds recording auto-stop
      timerRef.current = setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, 15000);
    } catch (err) {
      console.error('Mic access error:', err);
      if (onError) onError(err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  return {
    isRecording,
    isProcessing,
    audioLevel,
    startRecording,
    stopRecording,
  };
}

export default useVoiceRecorder;
