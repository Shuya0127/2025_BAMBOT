let pc = null;

export async function startViewer({ offerUrl, onStream }) {
  if (pc) await stopViewer();

  pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  const transceiver = pc.addTransceiver("video", { direction: "recvonly" });

   // VP8 を最優先にする（ブラウザ対応高め）
  const caps = RTCRtpReceiver.getCapabilities("video");
  const vp8 = caps.codecs.filter(c => c.mimeType.toLowerCase() === "video/vp8");
  const others = caps.codecs.filter(c => c.mimeType.toLowerCase() !== "video/vp8");
  if (transceiver.setCodecPreferences) {
    transceiver.setCodecPreferences([...vp8, ...others]);
  }
  

  pc.ontrack = (e) => onStream && onStream(e.streams[0]);

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  const res = await fetch(offerUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sdp: offer.sdp, type: offer.type }),
  });
  const data = await res.json();

  await pc.setRemoteDescription({ sdp: data.sdp, type: data.type });
  return pc;
}

export async function stopViewer() {
  if (!pc) return;
  try {
    pc.getSenders().forEach((s) => s.track && s.track.stop());
    pc.close();
  } catch {}
  pc = null;
}
