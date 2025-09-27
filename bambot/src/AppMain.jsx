import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AppMain.css';
import './App.css';
// headerLogoをインポート
import headerLogo from './img/logo.png'; 

// ----------------------------------------------------
// 【重要】GpsMapコンポーネントをインポート
// ----------------------------------------------------
import GpsMap from './components/GpsMap'; 

function AppMain() {
  const navigate = useNavigate();

  const handleGoToHome = () => {
    // navigate('/')でルートパスに直接遷移
    navigate('/');
  };

  return (
    <div className="app-main-container">
      {/* 1. ヘッダーエリア */}
      <header className="app-header">
        <img src={headerLogo} alt="ヘッダーロゴ" className="header-logo" />
      </header>
      
      {/* 2. メインコンテンツエリア */}
      <main className="app-main-content">

        <h1>リアルタイム GPS トラッカー</h1>
        
        {/* 3. マップ表示エリア（ヘッダーとボタンの間） */}
        <div className="map-display-area" style={{ width: '90%', margin: '20px auto', maxWidth: '1200px' }}>
          {/* GpsMapコンポーネントがWebSocket通信と地図表示を処理 */}
          <GpsMap />
        </div>
        
        {/* 5. ナビゲーションボタン */}
        <button className="back-to-home-button" onClick={handleGoToHome} style={{ marginBottom: '40px' }}>
          ホームに戻る
        </button>
      </main>
    </div>
  );
}

export default AppMain;