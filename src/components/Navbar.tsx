import { useTranslation } from 'react-i18next';
import { useDataSource } from '../contexts/DataSourceContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  const { t } = useTranslation();
  const dataSource = useDataSource();
  const titleKey = dataSource === 'mark' ? 'header.titleMark' : 'header.title';

  return (
    <header
      className="sticky top-0 z-40 h-14 shrink-0 border-b border-white/10"
      style={{ backgroundColor: 'var(--color-nifty-sidebar-header)' }}
    >
      <div className="flex h-full items-center justify-between px-6">
        <h1 className="text-lg font-semibold text-white truncate">
          {t(titleKey)}
        </h1>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
