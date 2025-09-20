import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AppMain.css';
import './App.css';
// headerLogoをインポート
import headerLogo from './img/logo.png'; 

function AppMain() {
  const navigate = useNavigate();

  const handleGoToHome = () => {
    // navigate('/')でルートパスに直接遷移
    navigate('/');
  };

  return (
    <div className="app-main-container">
      {/* App.jsからヘッダーのJSXをコピーして追加 */}
      <header className="app-header">
        <img src={headerLogo} alt="ヘッダーロゴ" className="header-logo" />
      </header>

      <h1>AppMain ページ</h1>
      <p>このページはApp.jsxから遷移してきました。</p>
      <p>このページはApp.jsxから遷移してきました。</p>
      <p>このページはApp.jsxから遷移してきました。</p>
      <p>このページはApp.jsxから遷移してきました。</p>
      <p>このページはApp.jsxから遷移してきました。</p>
      
      <button className="back-to-home-button" onClick={handleGoToHome}>
        ホームに戻る
      </button>
    </div>
  );
}

export default AppMain;