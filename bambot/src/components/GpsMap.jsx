import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // LeafletのCSSはここでインポートする必要はありませんが、念のため残しておきます。
import L from 'leaflet';

// Leafletマーカーアイコンの修正 (Vite環境でアイコンが表示されない問題の回避)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// マップの初期位置（例：東京）
const INITIAL_POSITION = [35.6895, 139.6917];

// ------------------------------------------------------------------
// 【追加】描画後にマップのサイズをリフレッシュし、真っ白になる問題を解消するコンポーネント
// ------------------------------------------------------------------
const MapRefresher = () => {
    const map = useMap();

    // コンポーネントがマウントされた直後（＝マップが表示された直後）に実行
    useEffect(() => {
        // マップをリフレッシュし、サイズを再計算させる
        map.invalidateSize();
        console.log("Leaflet Map refreshed after mounting.");
    }, [map]);
    
    // ウィンドウのリサイズ時にもリフレッシュさせる（オプション）
    useMapEvents({
        resize: () => {
            map.invalidateSize();
        },
    });

    return null;
};

// ------------------------------------------------------------------
// マーカー位置に合わせてマップの中心を追従させるカスタムコンポーネント
// ------------------------------------------------------------------
const MapViewUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    // 緯度0.0, 経度0.0 (無効なGPS座標) への追従を防ぐ
    if (center[0] !== 0.0 || center[1] !== 0.0) {
        // 現在のズームレベルを維持しつつ、中心座標を更新
        map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

const GpsMap = () => {
  // [緯度, 経度]
  const [position, setPosition] = useState(INITIAL_POSITION);
  const [status, setStatus] = useState("サーバー接続待機中...");

  useEffect(() => {
    // Node.jsサーバーのWebSocket接続
    const ws = new WebSocket('ws://localhost:8080'); 

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
            setPosition(newPos); // マーカー位置を更新
            setStatus(`GPS FIX (${data.sats}衛星) - 有効`);
          } else if (data.status === 'error') {
            // GPS Fixがない場合
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
    // 【要確認】コンテナの高さ設定
    <div style={{ height: '80vh', width: '100%' }}>
      <h3>トラッカー状態: {status}</h3>
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
        
        {/* 【重要】リフレッシュコンポーネントを配置 */}
        <MapRefresher /> 

        {/* マーカー位置に合わせてマップの中心を追従 */}
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
  );
};

export default GpsMap;