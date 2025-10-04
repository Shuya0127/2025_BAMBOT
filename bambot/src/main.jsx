import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import AppMain from './AppMain.jsx';
// 【追加】マニュアルページ用のコンポーネントをインポートします
import Manual from './manual.jsx'; 

// 【修正箇所】LeafletのCSSをここでインポートします。
// これにより、アプリケーション全体でスタイルが適用されます。
import 'leaflet/dist/leaflet.css'; 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* アプリケーション全体をBrowserRouterでラップします */}
    <BrowserRouter>
      {/* 複数のルートを定義するためにRoutesを使用します */}
      <Routes>
        {/* パス '/' がリクエストされたときに App コンポーネントを表示します */}
        <Route path="/" element={<App />} />
        {/* パス '/appmain' がリクエストされたときに AppMain コンポーネントを表示します */}
        <Route path="/appmain" element={<AppMain />} />
        {/* 【追加】パス '/manual' がリクエストされたときに Manual コンポーネントを表示します */}
        <Route path="/manual" element={<Manual />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);