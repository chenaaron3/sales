import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dashboard } from './components/Dashboard';
import './i18n/config';

function App() {
  const { i18n } = useTranslation();

  // Sync i18n language with URL path
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/(en|ja)(\/|$)/);
    if (match && match[1] !== i18n.language) {
      i18n.changeLanguage(match[1]);
    }
  }, [i18n]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/en" replace />} />
        <Route path="/:lang" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/en" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
