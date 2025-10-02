import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AppMain.css';
import './App.css';
import headerLogo from './img/logo.png';
import GpsMap from './components/GpsMap';


// 新規追加: カメラ映像を表示するコンポーネント
import WebcamStream from "./components/WebcamStream";

// GpsMapと共有する初期位置（都庁）
const INITIAL_POSITION = [35.6895, 139.6917];

// くにびきメッセ周辺の5つのランダム座標リスト
const KUNIBIKI_MESSE_AREA_POSITIONS = [
  [35.469333, 133.067056],
  [35.469440, 133.067150],
  [35.469228, 133.067140],
  [35.469436, 133.066960],
  [35.469241, 133.066954],
];


// WebSocket接続とLED/GPS制御のロジック (変更なし)
const useLedControl = () => {
  const [ledStatus, setLedStatus] = useState('OFF');
  const wsRef = useRef(null);
  const [status, setStatus] = useState('サーバー接続待機中...');
  const [gpsPosition, setGpsPosition] = useState(INITIAL_POSITION);

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
            setStatus(`GPS FIX (${data.sats}衛星) - 有効`);
          } else if (data.status === 'error') {
            setStatus(`❌ GPSエラー: ${data.message} (衛星: ${data.sats})`);
          }
        }

        const lat = parseFloat(data.lat);
        const lng = parseFloat(data.lng);
        if (data.type === 'gps_data' && data.status === 'ok' && !isNaN(lat) && !isNaN(lng)) {
          setGpsPosition([lat, lng]);
          console.log('AppMain: WebSocket GPS Update:', [lat, lng]);
        }
      } catch (e) {
        console.error('データ解析エラー、不正なJSONを受信:', event.data, e);
        setStatus('データ解析エラー');
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

  // LED ON/OFFトグル
  const toggleLed = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocketが接続されていません。');
      setStatus('サーバー切断 (コマンド送信失敗)');
      return;
    }

    const newStatus = ledStatus === 'ON' ? 'OFF' : 'ON';
    const command = newStatus === 'ON' ? 'cut_on' : 'cut_off';
    const message = { command };

    try {
      wsRef.current.send(JSON.stringify(message));
      setLedStatus(newStatus);
      console.log(`コマンド送信: ${command} (${newStatus}へ)`);
    } catch (e) {
      console.error(`コマンド送信エラー (${command}):`, e);
      alert(`コマンド送信エラー: ${command}`);
    }
  };

  return { ledStatus, status, toggleLed, wsRef, gpsPosition, setGpsPosition };
};

function AppMain() {
  const navigate = useNavigate();
  const { ledStatus, status, toggleLed, wsRef, gpsPosition, setGpsPosition } = useLedControl();
  const [isTesting, setIsTesting] = useState(false);
  const timeoutRef = useRef(null);

  // ホームに戻る際にOFFコマンドを送信
  const handleGoToHome = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const offCommand = { command: 'cut_off' };
      try {
        wsRef.current.send(JSON.stringify(offCommand));
        console.log('ホーム遷移前にOFFコマンドを送信しました: cut_off');
      } catch (e) {
        console.log('OFFコマンド送信エラー:', e);
      }
    }
    navigate('/');
  };

  // ランダム座標移動テスト
  const handleLocationTestClick = () => {
    if (isTesting) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setGpsPosition(INITIAL_POSITION);
      setIsTesting(false);
      console.log('[テスト終了] ランダム移動を停止し、座標を初期位置に戻しました。');
      return;
    }

    const getRandomPosition = () => {
      const randomIndex = Math.floor(Math.random() * KUNIBIKI_MESSE_AREA_POSITIONS.length);
      return KUNIBIKI_MESSE_AREA_POSITIONS[randomIndex];
    };

    const recursiveMove = (isFiveSeconds = true) => {
      const newPos = getRandomPosition();
      setGpsPosition(newPos);
      const delay = isFiveSeconds ? 5000 : 3000;
      console.log(`[ランダム移動] ${isFiveSeconds ? '5秒' : '3秒'}待機後移動: ${newPos}`);

      timeoutRef.current = setTimeout(() => {
        recursiveMove(!isFiveSeconds);
      }, delay);
    };

    setIsTesting(true);
    console.log('[テスト開始] 座標ランダム移動を開始します (5秒/3秒繰り返し)');
    recursiveMove(true);
  };

  const handleCutControlClick = toggleLed;

  // 緊急停止ボタン (現在動作は無効化)
  const handleButton2Click = () => {
    console.log('ボタン 2 (緊急停止) がクリックされました (現在、動作は無効化されています)');
  };

  const handleButton3Click = handleLocationTestClick;
  const handleButton4Click = handleGoToHome;

  // ボタンテキストとスタイル
  const controlButtonText = ledStatus === 'OFF' ? '竹を切る🎋' : '終了🛑';
  const controlButtonStatusText = ledStatus === 'OFF' ? '状態:OFF' : '状態:ON';

  const controlButtonStyle = {
    backgroundColor: ledStatus === 'OFF' ? 'green' : 'red',
    color: 'white',
  };

  const emergencyStopButtonStyle = {
    backgroundColor: ledStatus === 'ON' ? 'red' : '#6c757d',
    color: 'white',
  };

  const isEmergencyStopDisabled = ledStatus === 'OFF';

  const testButtonStyle = {
    backgroundColor: '#17a2b8',
    color: 'white',
  };

  const homeButtonStyle = {
    backgroundColor: '#007bff',
    color: 'white',
  };

  return (
    <div className="app-main-container">
      <header className="app-header">
        <img src={headerLogo} alt="ヘッダーロゴ" className="header-logo" />
      </header>

      <div className="content-and-sidebar-wrapper">
        <div className="sidebar-buttons">
          <button
            className="sidebar-button"
            onClick={handleCutControlClick}
            style={controlButtonStyle}
          >
            {controlButtonText}
            <br />
            {controlButtonStatusText}
          </button>

          <button
            className="sidebar-button"
            onClick={handleButton2Click}
            style={emergencyStopButtonStyle}
            disabled={isEmergencyStopDisabled}
          >
            緊急停止🚨<br />ボタン
          </button>

          <button
            className="sidebar-button"
            onClick={handleButton3Click}
            style={testButtonStyle}
          >
            位置情報<br />読み込み🔄
          </button>

          <button
            className="sidebar-button"
            onClick={handleButton4Click}
            style={homeButtonStyle}
          >
            ホームへ<br />戻る🏠
          </button>
        </div>

        <main className="app-main-content">
          <WebcamStream />
          <div className="overlay-container">
            <GpsMap position={gpsPosition} />
            {/* このdivを消せばテキストを消せる（本番は削除予定） */}
            

          </div>
        </main>
      </div>
    </div>
  );
}

export default AppMain;
