import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import AppMain from './AppMain.jsx';

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
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);