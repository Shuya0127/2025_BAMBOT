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
        
        {/* 3. マップとボタンの表示エリア（GpsMapコンポーネントが全てを内包） */}
        {/* ⚠️ GpsMap.jsxでレイアウトを調整したため、ここではシンプルにコンポーネントを配置 */}
        <GpsMap />
        
        {/* 5. ナビゲーションボタン */}
        {/* ナビゲーションボタンの位置がマップ/制御エリアの下になるように配置 */}
        <button className="back-to-home-button" onClick={handleGoToHome} style={{ margin: '40px auto', display: 'block' }}>
          ホームに戻る
        </button>
      </main>
    </div>
  );
}

export default AppMain;