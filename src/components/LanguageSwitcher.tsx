import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);

    // Update URL to reflect language change
    const path = location.pathname;
    const pathWithoutLang = path.replace(/^\/(en|ja)/, '') || '/';
    const newPath = `/${lng}${pathWithoutLang}`;
    navigate(newPath, { replace: true });
  };

  const isJapanese = i18n.language === 'ja';
  const switchToLanguage = isJapanese ? 'en' : 'ja';
  const switchToFlag = isJapanese ? '🇺🇸' : '🇯🇵';

  return (
    <button
      type="button"
      onClick={() => changeLanguage(switchToLanguage)}
      className="px-3 py-1.5 text-lg rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      aria-label={`Switch to ${switchToLanguage === 'en' ? 'English' : 'Japanese'}`}
    >
      {switchToFlag}
    </button>
  );
}
