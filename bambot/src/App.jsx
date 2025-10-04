import './App.css';
import take from './img/background.jpg';
import headerLogo from './img/logo.png'; 
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();

  const handleStartClick = () => {
    navigate('/appmain');
  };

  const handleManualClick = () => {
    navigate('/manual');
  };

  return (
    <div className="app-container">
      
      <header className="app-header">
        <img src={headerLogo} alt="ヘッダーロゴ" className="header-logo" />
      </header>
      
      <main className="main-content">
        <div className="image-container">
          <img src={take} alt="背景画像" className="responsive-image" />
          
          {/* 【修正箇所】ボタンを包むコンテナを追加し、位置と並びを制御します */}
          <div className="button-group-overlay"> 
            
            {/* スタートボタン */}
            <button 
              className="center-button" 
              onClick={handleStartClick}
              // 【修正】インラインスタイルを削除
            >
              スタート
            </button>
            
            {/* マニュアルボタン */}
            <button 
              className="center-button" 
              onClick={handleManualClick}
            >
              使い方
            </button>
            
          </div>
          {/* 【修正箇所ここまで】 */}
        </div>
      </main>
    </div>
  );
}

export default App;