// src/components/WebcamStream.jsx
import { useEffect, useRef, useState } from "react";
import { startViewer, stopViewer } from "../lib/webrtcClient";

export default function WebcamStream() {
  const videoRef = useRef(null);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    let mounted = true;
    let retryTimer;

    async function connect() {
      try {
        setStatus("connecting");

        const OFFER_URL = "http://192.168.10.53:8080/offer"; // ← PiのIPに合わせる

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
        // 数秒後に自動リトライ
        retryTimer = setTimeout(connect, 3000);
      }
    }

    connect();

    return () => {
      mounted = false;
      clearTimeout(retryTimer);
      stopViewer();
    };
  }, []);

  return (
    <>
      <video ref={videoRef} className="background-video" autoPlay playsInline muted />
      <div style={{position:"absolute",left:8,bottom:8,color:"#fff",fontSize:12}}>{status}</div>
    </>
  );
}
