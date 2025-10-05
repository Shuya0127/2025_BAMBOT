import asyncio
import json
from aiohttp import web
import aiohttp_cors
from aiortc import RTCPeerConnection, RTCSessionDescription, VideoStreamTrack
from av import VideoFrame
import cv2
import processor  # 処理コード（processor.py）をインポート

VIDEO_DEVICE = "/dev/video0"

# グローバルでカメラを開く
cap = cv2.VideoCapture(VIDEO_DEVICE)
frame_id = 0
results = None

class ProcessedTrack(VideoStreamTrack):
    """
    カメラ映像を取得して processor.py で処理後に配信するトラック
    """
    async def recv(self):
        await asyncio.sleep(1/15) #fps set
        global frame_id, results
        ret, frame = cap.read()
        if not ret:
            return None
        
        frame = cv2.resize(frame,(320,240)) #frame set

        frame_id += 1
        # processor.py の関数で処理付きフレームに変換
        processed, results = processor.process_frame(frame, frame_id, results)

        # OpenCV → WebRTC フレーム
        new_frame = VideoFrame.from_ndarray(processed, format="bgr24")
        new_frame.pts, new_frame.time_base = await self.next_timestamp()
        return new_frame


async def handle_offer(request: web.Request) -> web.Response:
    params = await request.json()
    offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])

    # PeerConnection を生成
    pc = RTCPeerConnection()

    # 状態監視
    @pc.on("connectionstatechange")
    async def on_state_change():
        print("state:", pc.connectionState)
        if pc.connectionState in ("failed", "disconnected", "closed"):
            await pc.close()

    # 処理済みトラックを追加
    pc.addTrack(ProcessedTrack())

    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return web.json_response({
        "sdp": pc.localDescription.sdp,
        "type": pc.localDescription.type
    })


app = web.Application()
app.router.add_post("/offer", handle_offer)

# CORS許可（Reactからfetchできるように）
cors = aiohttp_cors.setup(app, defaults={
    "*": aiohttp_cors.ResourceOptions(
        allow_credentials=True,
        expose_headers="*",
        allow_headers="*",
    )
})
for route in list(app.router.routes()):
    cors.add(route)

if __name__ == "__main__":
    web.run_app(app, host="0.0.0.0", port=8080)
