import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AppMain.css';
import './App.css';
import headerLogo from './img/logo.png';
import GpsMap from './components/GpsMap';
import WebcamStream from "./components/WebcamStream";

// GpsMapと共有する初期位置（都庁）
const INITIAL_POSITION = [35.6895, 139.6917];

const KUNIBIKI_MESSE_AREA_POSITIONS = [
  [35.469333, 133.067056],
  [35.469440, 133.067150],
  [35.469228, 133.067140],
  [35.469436, 133.066960],
  [35.469241, 133.066954],
];

// WebSocket接続とLED/GPS制御のロジック
const useLedControl = () => {
  const [ledStatus, setLedStatus] = useState('OFF');
  const wsRef = useRef(null);
  const [status, setStatus] = useState('');
  const [gpsPosition, setGpsPosition] = useState(INITIAL_POSITION);

  useEffect(() => {
    // WebSocket接続はlocalhost:8080のNode.jsサーバーを想定
    const ws = new WebSocket('ws://localhost:8080'); 
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket接続成功');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'gps_data') {
          if (data.status === 'ok') {
            setStatus(`GPS FIX (${data.sats}衛星) - 有効`);
          }
        }

        const lat = parseFloat(data.lat);
        const lng = parseFloat(data.lng);
        // リアルタイムGPSデータを受信し、有効な数値であれば位置を更新
        if (data.type === 'gps_data' && data.status === 'ok' && !isNaN(lat) && !isNaN(lng)) {
          setGpsPosition([lat, lng]); 
          console.log('AppMain: WebSocket GPS Update:', [lat, lng]);
        }
      } catch (e) {
        console.error('データ解析エラー、不正なJSONを受信:', event.data, e);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket接続切断');
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

  // ホームに戻る際にOFFコマンドを送信 (cut_off)
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

  const handleLocationTestClick = () => {
    if (isTesting) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setGpsPosition(INITIAL_POSITION);
      setIsTesting(false);
      return;
    }

    // テスト開始処理
    const getRandomPosition = () => {
      const randomIndex = Math.floor(Math.random() * KUNIBIKI_MESSE_AREA_POSITIONS.length);
      return KUNIBIKI_MESSE_AREA_POSITIONS[randomIndex];
    };

    const recursiveMove = (isFiveSeconds = true) => {
      const newPos = getRandomPosition();
      setGpsPosition(newPos); 
      const delay = isFiveSeconds ? 5000 : 3000;
      timeoutRef.current = setTimeout(() => {
        recursiveMove(!isFiveSeconds);
      }, delay);
    };
    setIsTesting(true);
    recursiveMove(true);
  };

  const handleCutControlClick = toggleLed;

  // 緊急停止ボタンの動作: 'cut_emergency' コマンドを送信
  const handleButton2Click = () => {
    const emergencyCommand = 'cut_emergency'; 
    const message = { command: emergencyCommand };
    
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocketが接続されていません。緊急停止コマンド送信失敗');
      return;
    }

    try {
        wsRef.current.send(JSON.stringify(message));
        console.log(`緊急停止コマンド送信: ${emergencyCommand}`);
    } catch (e) {
        console.error(`緊急停止コマンド送信エラー (${emergencyCommand}):`, e);
        alert(`コマンド送信エラー: ${emergencyCommand}`);
    }
  };

  const handleButton3Click = handleLocationTestClick;
  const handleButton4Click = handleGoToHome;

  // ボタンテキストとスタイル (変更なし)
  const controlButtonText = ledStatus === 'OFF' ? '竹を切る🎋' : '終了🛑';
  const controlButtonStatusText = ledStatus === 'OFF' ? '状態:OFF' : '状態:ON';

  const controlButtonStyle = {
    backgroundColor: ledStatus === 'OFF' ? 'green' : 'red',
    color: 'white',
  };

  const emergencyStopButtonStyle = {
    backgroundColor: ledStatus === 'ON' ? '#ffc107' : '#6c757d',
    color: 'white',
  };

  const isEmergencyStopDisabled = ledStatus === 'OFF';

  const testButtonStyle = {
    backgroundColor: isTesting ? '#17a2b8' : '#17a2b8', 
    color: 'white',
  };

  const testButtonText = isTesting ? '位置情報<br />読み込み🔄' : '位置情報<br />読み込み🔄';

  const homeButtonStyle = {
    backgroundColor: 'white', 
    color: '#333', 
  };

  return (
    <div className="app-main-container">
      <header className="app-header">
        <img src={headerLogo} alt="ヘッダーロゴ" className="header-logo" />
        <div className="status-overlay">
            <p className="status-text">{status}</p>
        </div>
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
            dangerouslySetInnerHTML={{ __html: testButtonText }}
          >
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
            {/* GPS位置情報はAppMainからプロップスで渡す */}
            <GpsMap position={gpsPosition} /> 
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppMain;