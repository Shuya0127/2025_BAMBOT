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
    [35.469333, 133.067056], // 1. くにびきメッセ (指定座標)
    [35.469340, 133.067050],
    [35.469328, 133.067040],
    [35.469336, 133.067060],
    [35.469341, 133.067054],
];

// 【変更なし】WebSocket接続とLED制御コマンド送信のロジック
const useLedControl = () => {
  const [ledStatus, setLedStatus] = useState("OFF"); 
  const wsRef = useRef(null); 
  const [status, setStatus] = useState("サーバー接続待機中...");
  // GPSの位置情報を親で管理
  const [gpsPosition, setGpsPosition] = useState(INITIAL_POSITION); 

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080'); 
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket接続成功');
      setStatus('サーバー接続済み');
    };

    // onmessageでGPSデータを受信し、状態を更新する
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
        
        // GPSデータを親の状態に保存
        const lat = parseFloat(data.lat);
        const lng = parseFloat(data.lng);
        if (data.type === 'gps_data' && data.status === 'ok' && !isNaN(lat) && !isNaN(lng)) {
            setGpsPosition([lat, lng]); 
            console.log('AppMain: WebSocket GPS Update:', [lat, lng]); 
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

  // toggleLed 関数 (変更なし)
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

  // 戻り値に setGpsPosition を含める
  return { ledStatus, status, toggleLed, wsRef, gpsPosition, setGpsPosition };
};


function AppMain() {
  const navigate = useNavigate();
  const { ledStatus, status, toggleLed, wsRef, gpsPosition, setGpsPosition } = useLedControl();
  const [isTesting, setIsTesting] = useState(false);
  // ⭐ 修正箇所: setTimeoutのIDを保持するRefに変更
  const timeoutRef = useRef(null);


  // ホームに戻る際にOFFコマンドを送信するロジック (変更なし)
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
  
  // ⭐ 修正箇所: 4つ目のボタンのロジック (トグルON/OFFと再帰的な移動)
  const handleLocationTestClick = () => {
        
        // --- テスト停止処理 (ボタンがONの状態からのOFF) ---
        if (isTesting) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            // 座標を初期位置に戻す
            setGpsPosition(INITIAL_POSITION); 
            setIsTesting(false);
            console.log("[テスト終了] ランダム移動を停止し、座標を初期位置に戻しました。");
            return;
        }

        // --- テスト開始処理 (ボタンがOFFの状態からのON) ---
        
        // ランダムな座標を取得するヘルパー関数
        const getRandomPosition = () => {
            const randomIndex = Math.floor(Math.random() * KUNIBIKI_MESSE_AREA_POSITIONS.length);
            return KUNIBIKI_MESSE_AREA_POSITIONS[randomIndex];
        };

        // 5秒と3秒で移動を繰り返す再帰関数
        // isFiveSeconds: 次の移動までの待機時間が5秒かどうか (true=5秒, false=3秒)
        const recursiveMove = (isFiveSeconds = true) => {
            // 座標移動
            const newPos = getRandomPosition();
            setGpsPosition(newPos);
            const delay = isFiveSeconds ? 5000 : 3000;
            console.log(`[ランダム移動] ${isFiveSeconds ? '5秒' : '3秒'}待機後移動: ${newPos}`);
            
            // 次のタイマーを設定
            timeoutRef.current = setTimeout(() => {
                // 次は逆の間隔で再帰呼び出し
                recursiveMove(!isFiveSeconds);
            }, delay);
        };
        
        // 1. テストモード開始
        setIsTesting(true);
        console.log(`[テスト開始] 座標ランダム移動を開始します (5秒/3秒繰り返し)`);

        // 2. 最初の移動を即座に実行し、タイマー連鎖を開始
        // recursiveMove(true)で開始すると、最初の移動が即座に行われ、次は5秒待機する
        recursiveMove(true); 
    };


  // ボタンのハンドラ割り当て (変更なし)
  const handleCutControlClick = toggleLed;
  const handleButton2Click = () => { console.log('ボタン 2がクリックされました'); };
  const handleButton3Click = handleGoToHome;
  const handleButton4Click = handleLocationTestClick;
  
  // LED制御ボタンの表示テキストと色 (変更なし)
  const controlButtonText = ledStatus === 'OFF' ? 'ONにする 🟢' : 'OFFにする 🔴';
  const controlButtonStyle = { 
    backgroundColor: ledStatus === 'OFF' ? 'green' : 'red', 
    color: 'white',
  };

  // ホームに戻るボタンのスタイル (変更なし)
  const homeButtonStyle = {
    backgroundColor: '#007bff', 
    color: 'white',
  };

  // 位置情報テストボタンのスタイル
  const testButtonStyle = {
    // ON/OFF状態に応じてボタンの色を変更
    backgroundColor: isTesting ? '#ff5555' : '#17a2b8', 
    color: 'white',
 };


  return (
    <div className="app-main-container">
      <header className="app-header">
        <img src={headerLogo} alt="ヘッダーロゴ" className="header-logo" />
      </header>
      
      <div className="content-and-sidebar-wrapper">
        
        <div className="sidebar-buttons">
          {/* ボタン 1: 制御トグル */}
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
          
          {/* ボタン 3: ホームに戻る */}
          <button 
            className="sidebar-button" 
            onClick={handleButton3Click}
            style={homeButtonStyle} 
          >
            🏠 ホームに戻る
          </button>

          {/* 4つ目のボタン: 位置情報テスト (トグル動作) */}
          <button 
            className="sidebar-button" 
            onClick={handleButton4Click}
            style={testButtonStyle}
            // disabled は不要。トグルなのでONの時も押せる必要がある
          >
            {isTesting ? '🔴 テスト停止' : '🟢 位置情報テスト開始'}
          </button>
        </div>

        <main className="app-main-content">
            <WebcamStream />

            <div className="overlay-container">
                
                <GpsMap position={gpsPosition}/> 

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