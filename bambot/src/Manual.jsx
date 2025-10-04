import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Manual.css';
import headerLogo from './img/logo2.png';

const manualItems = [
  { key: 'details', label: '利用手順' },
  { key: 'mechanism', label: '伐採機構' },
  { key: 'gps', label: 'GPS' },
  { key: 'camera', label: 'カメラ' },
];

const ManualContent = ({ view, setCurrentView }) => {
  const contentData = {
    details: {
      title: '利用手順',
      items: [
        '作業開始前に安全装備（ヘルメット・手袋・安全靴）を着用する',
        '電源投入後、ブレードとバッテリー残量を確認する',
        '使用後はブレードや本体のメンテナンスを行う',
      ],
    },
    mechanism: {
      title: '伐採機構の説明',
      items: [
        'モーター駆動によるブレード回転',
        '切断動作の制御方法',
        '緊急停止機能の仕組み',
      ],
    },
    gps: {
      title: 'GPSの設定と利用方法',
      items: [
        'アプリ起動時に自動で測位を開始します',
        'GPS精度は天候や障害物に左右されます',
        '測位が不安定な場合は開けた場所へ移動してください',
      ],
    },
    camera: {
      title: 'カメラ機能と注意点',
      items: [
        '撮影時は手元や周囲の安全を確認してください',
        '映像が乱れる場合はアプリを再起動してください',
        '長時間の使用はバッテリー消耗が早まります',
      ],
    },
  };

  if (view === 'main') {
    return (
      <>
        <h1 className="manual-title">マニュアル 概要</h1>
        <p className="manual-content-text">
          本アプリは竹伐採作業を支援するためのものです。
          左側のボタンから詳細なマニュアル項目をご確認ください。
          <br /><br />
          <ul>
            {manualItems.map((item) => (
              <li key={item.key}>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView(item.key); }}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </p>
      </>
    );
  }

  const data = contentData[view];
  return (
    <>
      <h1 className="manual-title">{data.title}</h1>
      <ul className="manual-content-text">
        {data.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </>
  );
};

function Manual() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('main');

  const handleBack = () => navigate(-1);
  const changeView = (view) => setCurrentView(view);

  return (
    <div className="app-main-container manual-page">
      {/* ヘッダー */}
      <header className="app-header">
        <img src={headerLogo} alt="ヘッダーロゴ" className="header-logo" />
        <div className="status-overlay"></div>
      </header>

      <div className="content-and-sidebar-wrapper">

        {/* サイドバー */}
        <div className="sidebar-buttons">

          <div className="sidebar-button-list-title">ボタン一覧</div>
          {manualItems.map((item) => (
            <button
              key={item.key}
              className={`sidebar-button ${currentView === item.key ? 'active' : ''}`}
              onClick={() => changeView(item.key)}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={handleBack}
            className="sidebar-button main-back-button"
           >
           メイン画面に戻る
          </button>

        </div>

        {/* メインコンテンツ */}
        <main className="app-main-content">
          <div className="manual-content-wrapper">
            <ManualContent view={currentView} setCurrentView={setCurrentView} />

            <button
              onClick={() => (currentView === 'main' ? handleBack() : setCurrentView('main'))}
              className="manual-back-button"
              style={{ marginTop: '20px' }}
            >
              {currentView === 'main' ? 'メイン画面に戻る' : '概要に戻る'}
            </button>
          </div>
        </main>

      </div>
    </div>
  );
}

export default Manual;
