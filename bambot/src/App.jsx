// App.jsx

import './App.css';
import take from './img/background2.jpg';
import headerLogo from './img/logo.png'; 
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate(); // useNavigateフックを呼び出す

  const handleButtonClick = () => {
    navigate('/appmain'); // ボタンクリックで '/appmain' に遷移
  };

  return (
    // ヘッダー、メインコンテンツ、フッターを配置するコンテナ
    <div className="app-container">
      
      {/* ヘッダー部分 */}
      <header className="app-header">
        <img src={headerLogo} alt="ヘッダーロゴ" className="header-logo" />
      </header>
      
      {/* メインコンテンツ部分 */}
      <main className="main-content">
        <div className="image-container">
          <img src={take} alt="背景画像" className="responsive-image" />
          <button className="center-button" onClick={handleButtonClick}>
            ボタン
          </button>
        </div>
      </main>
      
      {/* フッター部分 */}
      <footer className="app-footer">
        <p>© 2025 アプリ名. All rights reserved.</p>
      </footer>
      
    </div>
  );
}

export default App;