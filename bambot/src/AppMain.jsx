import React, { useState, useEffect, useRef } from 'react'; 
import { useNavigate } from 'react-router-dom';
import './AppMain.css';
import './App.css';
import headerLogo from './img/logo.png';
import GpsMap from './components/GpsMap';


// 新規追加: カメラ映像を表示するコンポーネント
import WebcamStream from "./components/WebcamStream";

// 【変更なし】WebSocket接続とLED制御コマンド送信のロジック
const useLedControl = () => {
  const [ledStatus, setLedStatus] = useState("OFF"); 
  const wsRef = useRef(null); 
  const [status, setStatus] = useState("サーバー接続待機中...");

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

  const toggleLed = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocketが接続されていません。");
      setStatus("サーバー切断 (コマンド送信失敗)");
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

  return { ledStatus, status, toggleLed, wsRef };
};


function AppMain() {
  const navigate = useNavigate();
  const { ledStatus, status, toggleLed, wsRef } = useLedControl();

  // ⭐ 修正箇所: ホームに戻る際にOFFコマンドを送信するロジックを追加
  const handleGoToHome = () => {
        // WebSocketがオープン状態であれば、OFFコマンドを送信
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const offCommand = { command: 'cut_off' };
            try {
                wsRef.current.send(JSON.stringify(offCommand));
                console.log('ホーム遷移前にOFFコマンドを送信しました: cut_off');
            } catch (e) {
                console.log('OFFコマンド送信エラー:', e);
            }
        }
    navigate('/'); // ボタンクリックで '/' に遷移
  };

  // ボタン 1 (制御トグル)
  const handleCutControlClick = toggleLed;
  
  // ボタン 2 (既存のまま)
  const handleButton2Click = () => {
    console.log('ボタン 2がクリックされました');
  };

  // ボタン 3 (ホームに戻る機能に統合)
  const handleButton3Click = handleGoToHome;
  
  // LED制御ボタンの表示テキストと色
  const controlButtonText = ledStatus === 'OFF' ? 'ONにする 🟢' : 'OFFにする 🔴';
  const controlButtonStyle = { 
    backgroundColor: ledStatus === 'OFF' ? 'green' : 'red', 
    color: 'white',
  };

  // ホームに戻るボタンのスタイル（サイドバー向けに調整）
  const homeButtonStyle = {
    backgroundColor: '#007bff', // 青系
    color: 'white',
  };


  return (
    <div className="app-main-container">
      {/* 1. ヘッダーエリア */}
      <header className="app-header">
        <img src={headerLogo} alt="ヘッダーロゴ" className="header-logo" />
      </header>
      
      {/* 2. メインコンテンツとサイドバーボタンのコンテナ (横並び) */}
      <div className="content-and-sidebar-wrapper">
        
        {/* ⭐ 左端に縦に並ぶ3つのボタンエリア（サイドバー） */}
        <div className="sidebar-buttons">
          {/* ボタン 1: LED制御トグルボタン */}
          <button 
            className="sidebar-button" 
            onClick={handleCutControlClick}
            style={controlButtonStyle} 
          >
            制御: {controlButtonText}
          </button>
          
          {/* ボタン 2 */}
          <button className="sidebar-button" onClick={handleButton2Click}>
            ボタン 2
          </button>
          
          {/* ボタン 3: ホームに戻る機能に統合 */}
          <button 
            className="sidebar-button" 
            onClick={handleButton3Click}
            style={homeButtonStyle} // スタイルを適用
          >
            🏠 ホームに戻る
          </button>
        </div>

        {/* 3. メインコンテンツエリア */}
        <main className="app-main-content">
            {/* ⭐ カメラ映像 (背景: z-index: 0) */}
            <WebcamStream />

            {/* ⭐ マップと状態表示を重ねるためのコンテナ */}
            <div className="overlay-container">
                
                {/* 4. マップ表示エリア (絶対配置で右上に配置) */}
                <GpsMap wsRef={wsRef}/> 

                {/* 状態表示 (絶対配置で左下に配置) */}
                <div className="status-display">
                    <h3>トラッカー状態: {status} | 制御状態: {ledStatus}</h3>
                </div>
            
            </div>
        </main>
      </div>
    </div>
  );
}

export default AppMain;