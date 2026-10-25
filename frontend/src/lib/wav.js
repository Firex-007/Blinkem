export async function blobToWav16kMono(blob) {
  const buf = await blob.arrayBuffer();
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();
  const decoded = await ctx.decodeAudioData(buf);
  const targetSamples = Math.ceil(decoded.duration * 16000);
  const off = new OfflineAudioContext(1, targetSamples, 16000);
  const src = off.createBufferSource();
  src.buffer = decoded;
  src.connect(off.destination);
  src.start();

  const rendered = await off.startRendering();
  const pcm = rendered.getChannelData(0);
  const out = new DataView(new ArrayBuffer(44 + pcm.length * 2));

  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i++) {
      out.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF header
  writeString(0, 'RIFF');
  out.setUint32(4, 36 + pcm.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  out.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  out.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  out.setUint16(22, 1, true); // NumChannels (1 = mono)
  out.setUint32(24, 16000, true); // SampleRate (16000 Hz)
  out.setUint32(28, 32000, true); // ByteRate (16000 * 1 * 16/8)
  out.setUint16(32, 2, true); // BlockAlign (1 * 16/8)
  out.setUint16(34, 16, true); // BitsPerSample (16 bits)
  writeString(36, 'data');
  out.setUint32(40, pcm.length * 2, true);

  // PCM data samples
  for (let i = 0; i < pcm.length; i++) {
    const s = Math.max(-1, Math.min(1, pcm[i]));
    out.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([out], { type: 'audio/wav' });
}
