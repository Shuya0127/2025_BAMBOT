import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; 
import L from 'leaflet';

// Leafletマーカーアイコンの修正 (既存)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// マップの初期位置（例：東京）
const INITIAL_POSITION = [35.6895, 139.6917];

// ... (MapRefresher, MapViewUpdater コンポーネントは省略、変更なし) ...
const MapRefresher = () => { /* ... */ return null; };
const MapViewUpdater = ({ center }) => { 
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null; 
};


const GpsMap = ({ wsRef }) => {
  const [position, setPosition] = useState(INITIAL_POSITION);
  const [status, setStatus] = useState("サーバー接続待機中..."); 

  useEffect(() => {
    const ws = wsRef.current; 

    if (!ws) {
        setStatus("WebSocket参照なし (AppMainエラー)");
        return;
    }
    
    const originalOnMessage = ws.onmessage; 

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'gps_data') {
          if (data.status === 'ok') {
            const newPos = [data.lat, data.lng];
            setPosition(newPos); 
          }
        }
        
      } catch (e) {
        console.error("データ解析エラー、不正なJSONを受信:", event.data, e);
      }
      
      if (originalOnMessage) {
          originalOnMessage(event);
      }
    };
    
  }, [wsRef]);

  // 🚩 変更点1: MAP_SIZEを400pxから200pxに変更
  const MAP_SIZE = '250px'; 

  return (
    <div style={{ 
        width: MAP_SIZE, 
        margin: '0 auto', 
        float: 'right', 
    }}>
      
      {/* 2. マップコンテナ - 固定サイズで正方形を確定 */}
      <div 
        className="map-display-area" 
        style={{ 
          width: '100%', 
          // 🚩 変更点2: heightもMAP_SIZE (200px) を参照
          height: MAP_SIZE, 
          position: 'relative', 
          margin: '0px auto'
        }}
      > 
          <MapContainer 
            center={INITIAL_POSITION} 
            zoom={10} 
            scrollWheelZoom={true}
            style={{ 
              height: '100%', 
              width: '100%',
              position: 'absolute', 
              top: 0, 
              left: 0 
            }}
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapRefresher /> 
            <MapViewUpdater center={position} /> 
            
            <Marker position={position}>
              <Popup>
                最終受信座標: <br />
                緯度: {position[0].toFixed(6)} <br />
                経度: {position[1].toFixed(6)}
              </Popup>
            </Marker>
          </MapContainer>
      </div>
    </div>
  );
};

export default GpsMap;