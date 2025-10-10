import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Manual.css';
import headerLogo from './img/logo2.png';
import img1 from './img/img1.png';
import img2 from './img/img2.png';
import img3 from './img/img3.png';
import img4 from './img/img4.png';
import img5 from './img/img5.png';
import img6 from './img/img6.png';

const manualItems = [
  { key: 'details', label: '利用手順' },
  { key: 'gps', label: 'GPS' },
  { key: 'emergency', label: '緊急停止' },
  { key: 'controller', label: '操縦方法' },
];

const ManualContent = ({ view, setCurrentView }) => {
  const contentData = {
    details: {
      title: '利用手順',
      items: [
        '竹串を切りたい場所の近くに伐採機を持っていきます',
        <img src={img1} alt="画像1" className="manual-image" />,
        'Webアプリの「スタート」ボタンを押すことで、操作画面に移ります',
        <img src={img2} alt="画像2" className="manual-image" />,
        '操作画面に切り替わったら、コントローラで伐採機を前後左右に移動させます',
        'カメラの視野内に竹串が入ると、自動で画面に赤い枠で強調表示されます',
        <img src={img3} alt="画像3" className="manual-image" />,
        '伐採機を停止させ、Webアプリの緑色の「竹を切る」ボタンを押して伐採を開始します',
        <img src={img4} alt="画像4" className="manual-image" />,
        '伐採機がグリッパーで竹串を固定し伐採します。',
        '伐採が完了したら、終了ボタンを押して伐採を止めます',
        <img src={img5} alt="画像5" className="manual-image" />,
        '切りたい範囲が終了するまで繰り返します',
        'すべての伐採が終了したら、画面のマップ（位置情報）を参照し、伐採機を回収します',
      ],
    },
    gps: {
      title: 'GPSモジュールの注意点',
      items: [
        '屋根のある建物の中では位置情報の取得が難しいです',
        '測位が不安定な場合は開けた場所へ移動してください',
        '位置情報の取得には時間のかかる場合があります',
        'GPSモジュールに搭載されたLEDが点滅していると位置情報を取得できている状態です',
      ],
    },
    emergency: {
      title: '緊急停止ボタンの使い方',
      items: [
        '動作に異常が発生したら緊急停止ボタンを押してください',
        'ボタンを押すとモーターが即時停止します',
        '終了ボタンは刃が元の状態に戻るのに対し、緊急停止ボタンはそのままの状態で停止します。',
      ],
    },
    controller: {
      title: 'コントローラーでの操縦方法',
      items: [
        <img src={img6} alt="画像6" className="manual-image" />,
        '左スティックで前進、後退を操作できます',
        '右スティックで旋回（方向転換）ができます',
        '真ん中のレバーが電源です',
      ],
    },
  };

  if (view === 'main') {
    return (
      <>
        <h1 className="manual-title">BAMBOTとは</h1>
        <p className="manual-content-text">
          BAMBOTは、全国で深刻化している放置竹林問題の解決を目的とした、遠隔操作型の竹伐採システムです。
          遠隔操作によって林業における人手不足や高齢化といった課題を補い、安全かつ効率的な竹林管理を実現し、
          地域の森林環境保全に貢献します。
          <br />
          サイドバーのボタンから、各項目の詳細な説明や注意事項をご確認いただけます。
        </p>
      </>
    );
  }

  const data = contentData[view];
  return (
    <>
      <h1 className="manual-title">{data.title}</h1>
      {view === 'details' ? (
        <ol className="manual-content-text">
          {data.items.map((item, i) =>
            typeof item === 'string' ? (
              <li key={i}>{item}</li>
            ) : (
              <div key={i}>{item}</div> // 画像は番号なし
            )
          )}
        </ol>
      ) : (
        <ul className="manual-content-text">
          {data.items.map((item, i) =>
            typeof item === 'string' ? (
              <li key={i}>{item}</li>
            ) : (
              <div key={i}>{item}</div> // 画像は「・」なし
            )
          )}
        </ul>
      )}
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
          {/* 常に表示する「BAMBOTとは」ボタン */}
          <button
            className={`sidebar-button ${currentView === 'main' ? 'active' : ''}`}
            onClick={() => setCurrentView('main')}
          >
            BAMBOT<br/>とは
          </button>

          {/* 他のマニュアル項目ボタン */}
          {manualItems.map((item) => (
            <button
              key={item.key}
              className={`sidebar-button ${currentView === item.key ? 'active' : ''}`}
              onClick={() => changeView(item.key)}
            >
              {item.label}
            </button>
          ))}

          {/* メイン画面に戻るボタン */}
          <button
            onClick={handleBack}
            className="sidebar-button main-back-button"
          >
            ホーム<br />に戻る
          </button>
        </div>

        {/* メインコンテンツ */}
        <main className="app-main-content">
          <div className="manual-content-wrapper">
            <ManualContent view={currentView} setCurrentView={setCurrentView} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Manual;
