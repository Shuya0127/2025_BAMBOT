import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Manual.css'; 
import headerLogo from './img/logo.png';
import './App.css';

function Manual() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); 
  };

  return (
    // 【修正】CSSクラス 'manual-container' を適用
    <div className="manual-container">
      
      {/* 【修正】CSSクラス 'manual-title' を適用 */}
      <h1 className="manual-title">マニュアル</h1>
      
      {/* 【修正】CSSクラス 'manual-content' を適用 */}
      <p className="manual-content">
        このページはマニュアルを表示するための仮のページです。
      </p>

      {/* 【修正】CSSクラス 'manual-back-button' を適用 */}
      <button 
        onClick={handleBack}
        className="manual-back-button"
      >
        戻る
      </button>
      
    </div>
  );
}

// インラインスタイルは不要になったため削除します

export default Manual;