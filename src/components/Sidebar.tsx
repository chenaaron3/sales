import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Package,
  Store,
  UserCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDataSource } from '../contexts/DataSourceContext';

export type TabType = 'customers' | 'product' | 'sales' | 'stores' | 'employees';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const tabIcons: Record<TabType, React.ComponentType<{ className?: string }>> = {
  sales: LayoutDashboard,
  customers: Users,
  product: Package,
  stores: Store,
  employees: UserCircle,
};

const SIDEBAR_WIDTH = 224; /* 14rem = w-56 */
const SIDEBAR_COLLAPSED_WIDTH = 72;

const BRAND_LABEL: Record<string, { full: string; short: string }> = {
  jouete: { full: 'Jouete', short: 'J' },
  mark: { full: 'Mark', short: 'M' },
};

export function Sidebar({ activeTab, onTabChange, collapsed, onToggleCollapse }: SidebarProps) {
  const { t } = useTranslation();
  const dataSource = useDataSource();
  const brand = BRAND_LABEL[dataSource] ?? BRAND_LABEL.jouete;

  const tabs: { id: TabType; labelKey: string }[] = [
    { id: 'sales', labelKey: 'header.tabs.sales' },
    { id: 'customers', labelKey: 'header.tabs.customers' },
    { id: 'product', labelKey: 'header.tabs.product' },
    { id: 'stores', labelKey: 'header.tabs.stores' },
    { id: 'employees', labelKey: 'header.tabs.employees' },
  ];

  return (
    <aside
      className="fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-white/10 transition-[width] duration-200 shrink-0"
      style={{
        width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
      }}
    >
      {/* Logo / brand – same dark blue as navbar */}
      <div
        className="flex h-14 items-center border-b border-white/10 px-4 shrink-0"
        style={{ backgroundColor: 'var(--color-nifty-sidebar-header)' }}
      >
        <AnimatePresence mode="wait">
          {collapsed ? (
            <motion.div
              key="collapsed-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center w-9 h-9 rounded-lg font-semibold text-sm bg-white/15 text-white"
            >
              {brand.short}
            </motion.div>
          ) : (
            <motion.div
              key="full-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-semibold text-lg text-white truncate"
            >
              {brand.full}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav – secondary gray-blue background */}
      <nav
        className="flex-1 py-4 px-3 space-y-1 overflow-y-auto"
        style={{ backgroundColor: 'var(--color-nifty-sidebar-bg)' }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tabIcons[tab.id];
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors font-normal text-white ${
                collapsed ? 'justify-center px-0' : ''
              } ${!isActive ? 'hover:bg-white/10 hover:text-white' : ''}`}
              style={
                isActive
                  ? { backgroundColor: 'var(--color-nifty-sidebar-active)' }
                  : undefined
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{t(tab.labelKey)}</span>}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle – same gray-blue as nav */}
      <div
        className="p-3 border-t border-white/10"
        style={{ backgroundColor: 'var(--color-nifty-sidebar-bg)' }}
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-lg text-white/90 hover:bg-white/10 hover:text-white transition-colors text-sm font-medium"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span>{t('sidebar.collapse', 'Collapse')}</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

export { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH };
