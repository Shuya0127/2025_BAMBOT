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
const MapViewUpdater = ({ center }) => { /* ... */ return null; };
// ... (コンポーネント省略終わり) ...


const GpsMap = () => {
  const [position, setPosition] = useState(INITIAL_POSITION);
  const [status, setStatus] = useState("サーバー接続待機中...");
  const wsRef = useRef(null); 
  const [ledStatus, setLedStatus] = useState("OFF"); 

  // 【新規】WebSocket経由でNode.jsサーバーへLED制御コマンドを送信する関数
  const sendLedCommand = (command) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocketが接続されていません。");
      setStatus("サーバー切断 (コマンド送信失敗)");
      return;
    }

    // 🚨 変更点: コマンド文字列を "cut_on" / "cut_off" に設定
    const message = {
      command: command // 例: 'cut_on' or 'cut_off'
    };

    try {
      wsRef.current.send(JSON.stringify(message));
      // 状態表示は、'cut_on'の場合は'ON'、'cut_off'の場合は'OFF'と表示
      setLedStatus(command.replace('cut_', '').toUpperCase()); 
      console.log(`コマンド送信: ${command}`);
    } catch (e) {
      console.error(`コマンド送信エラー (${command}):`, e);
      alert(`コマンド送信エラー: ${command}`);
    }
  };


  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080'); 
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket接続成功');
      setStatus('サーバー接続済み');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'gps_data') {
          if (data.status === 'ok') {
            const newPos = [data.lat, data.lng];
            setPosition(newPos); 
            setStatus(`GPS FIX (${data.sats}衛星) - 有効`);
          } else if (data.status === 'error') {
            setStatus(`❌ GPSエラー: ${data.message} (衛星: ${data.sats})`);
          }
        }
        
      } catch (e) {
        console.error("データ解析エラー、不正なJSONを受信:", event.data, e);
        setStatus("データ解析エラー");
      }
    };

    ws.onclose = () => {
      console.log('WebSocket接続切断');
      setStatus('サーバー切断');
    };

    return () => {
      ws.close();
    };
  }, []); 

  return (
    <div style={{ width: '100%' }}>
      
      {/* 1. 状態表示と制御ボタンのコンテナ */}
      <div style={{ 
          width: '90%', 
          margin: '20px auto 10px auto', 
          maxWidth: '1200px', 
          padding: '10px', 
          backgroundColor: '#f5f5f5',
          borderRadius: '5px',
          textAlign: 'center'
      }}>
        <h3>トラッカー状態: {status}</h3>
        
        {/* LED制御ボタン */}
        <div style={{ marginTop: '10px' }}>
            <button 
                // 🚨 変更点: 送信コマンドを 'cut_on' に変更
                onClick={() => sendLedCommand('cut_on')} 
                style={{ 
                    padding: '10px 20px', 
                    marginRight: '10px', 
                    backgroundColor: ledStatus === 'ON' ? 'darkgreen' : 'green', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                ON (cut_on) 🟢 (現在: {ledStatus})
            </button>
            <button 
                // 🚨 変更点: 送信コマンドを 'cut_off' に変更
                onClick={() => sendLedCommand('cut_off')} 
                style={{ 
                    padding: '10px 20px', 
                    backgroundColor: ledStatus === 'OFF' ? 'darkred' : 'red', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                OFF (cut_off) 🔴 (現在: {ledStatus})
            </button>
        </div>
      </div>

      {/* 2. マップコンテナ */}
      <div className="map-display-area" style={{ height: '80vh', width: '90%', margin: '0px auto', maxWidth: '1200px' }}>
          <MapContainer 
            center={INITIAL_POSITION} 
            zoom={10} 
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
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