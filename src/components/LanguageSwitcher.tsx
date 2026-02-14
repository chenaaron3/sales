import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);

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
      className="p-2.5 rounded-lg text-white/90 hover:bg-white/15 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[var(--color-nifty-nav)] text-base"
      aria-label={`Switch to ${switchToLanguage === 'en' ? 'English' : 'Japanese'}`}
    >
      {switchToFlag}
    </button>
  );
}
