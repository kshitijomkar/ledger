'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { useIsMounted } from '@/hooks/useIsMounted';
import {
  LayoutDashboard,
  Users,
  Truck,
  ArrowLeftRight,
  Bell,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface SidebarContentProps {
  onItemClick?: () => void;
}

export function SidebarContent({ onItemClick }: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, t } = useApp();
  const isMounted = useIsMounted();

  const navItems: NavItem[] = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { path: '/customers', icon: Users, label: t('customers') },
    { path: '/suppliers', icon: Truck, label: t('suppliers') },
    { path: '/transactions', icon: ArrowLeftRight, label: t('transactions') },
    { path: '/reminders', icon: Bell, label: t('reminders') },
    { path: '/reports', icon: BarChart3, label: t('reports') },
  ];

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isMounted) return <div className="flex flex-col h-full bg-card" />;

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">{t('app_name')}</h1>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onItemClick}
              className={`sidebar-item ${active ? 'active' : ''}`}
              aria-current={active ? 'page' : undefined}
              title={item.label}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border space-y-1" role="group" aria-label="Account options">
        <Link
          href="/settings"
          onClick={onItemClick}
          className={`sidebar-item ${isActive('/settings') ? 'active' : ''}`}
          aria-current={isActive('/settings') ? 'page' : undefined}
          title={t('settings')}
        >
          <Settings className="w-5 h-5" aria-hidden="true" />
          <span>{t('settings')}</span>
        </Link>
        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-left text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          aria-label={t('logout')}
        >
          <LogOut className="w-5 h-5" aria-hidden="true" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );
}
