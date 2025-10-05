import React, { useEffect, useRef } from 'react'; 
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// マップの初期位置
const INITIAL_POSITION = [35.6895, 139.6917];

// MapRefresher コンポーネント
const MapRefresher = () => null;

// MapViewUpdater: centerが変更されたらマップビューを移動
const MapViewUpdater = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    // 初期位置からの移動かチェック
    const isNewPosition =
      center[0] !== INITIAL_POSITION[0] || center[1] !== INITIAL_POSITION[1];

    if (isNewPosition && !isNaN(center[0]) && !isNaN(center[1])) {
      // マップビューを新しい位置に設定し、ズームレベルを最低16に保つ
      map.setView(center, Math.max(map.getZoom(), 16));
    }
  }, [center, map]);

  return null;
};

// LiveMarker: Leaflet APIでマーカーの動きを確実にする
const LiveMarker = ({ position }) => {
  const markerRef = useRef(null);

  useEffect(() => {
    if (markerRef.current && !isNaN(position[0]) && !isNaN(position[1])) {
      // マーカーの位置を更新
      markerRef.current.setLatLng(position);

      // ポップアップの内容も更新
      const popup = markerRef.current.getPopup();
      if (popup) {
        const [lat, lng] = position;
        popup.setContent(
          `最終受信座標: <br />緯度: ${lat.toFixed(6)} <br />経度: ${lng.toFixed(6)}`
        );
      }
    }
  }, [position]);

  return (
    <Marker ref={markerRef} position={position}>
      <Popup>
        最終受信座標: <br />
        緯度: {position[0].toFixed(6)} <br />
        経度: {position[1].toFixed(6)}
      </Popup>
    </Marker>
  );
};

// GpsMap コンポーネント 
const GpsMap = ({ position }) => {
  const MAP_SIZE = '220px';

  return (
    <div
      style={{
        width: MAP_SIZE,
        position: 'absolute',
        top: '30px',
        right: '30px',
        zIndex: 2,
      }}
    >
      <div
        className="map-display-area"
        style={{ width: '100%', height: MAP_SIZE, position: 'relative', margin: '0px auto' }}
      >
        <MapContainer
          center={INITIAL_POSITION}
          zoom={10}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapRefresher />
          <MapViewUpdater center={position} /> 
          <LiveMarker position={position} />
        </MapContainer>
      </div>
    </div>
  );
};

export default GpsMap;