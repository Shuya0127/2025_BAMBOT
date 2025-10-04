// src/components/WebcamStream.jsx
import { useEffect, useRef, useState } from "react";
import { startViewer, stopViewer } from "../lib/webrtcClient";

export default function WebcamStream() {
  const videoRef = useRef(null);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setStatus("connecting");
        const OFFER_URL = "http://172.20.10.3:8080/offer"; // ←PiのIP
        await startViewer({
          offerUrl: OFFER_URL,
          onStream: (stream) => {
            if (!mounted || !videoRef.current) return;
            videoRef.current.srcObject = stream;
            videoRef.current.play?.().catch(() => {});
          },
        });
        setStatus("playing");
      } catch (e) {
        console.error("WebRTC接続失敗", e);
        setStatus("error");
      }
    })();
    return () => { mounted = false; stopViewer(); };
  }, []);

  return (
    <>
      <video ref={videoRef} className="background-video" autoPlay playsInline muted />
      <div style={{position:"absolute",left:8,bottom:8,color:"#fff",fontSize:12}}>{status}</div>
    </>
  );
}
