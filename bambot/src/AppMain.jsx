// AppMain.jsx

import './AppMain.css';
import { useNavigate } from 'react-router-dom';

function AppMain() {
  const navigate = useNavigate();

  const handleGoToHome = () => {
    // navigate('/')でルートパスに直接遷移
    navigate('/');
  };

  return (
    <div className="app-main-container">
      <h1>AppMain ページ</h1>
      <p>このページはApp.jsxから遷移してきました。</p>
      
      <button className="back-to-home-button" onClick={handleGoToHome}>
        ホームに戻る
      </button>
    </div>
  );
}

export default AppMain;