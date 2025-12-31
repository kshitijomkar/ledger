'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { Header } from './Header';
import { SidebarContent } from './Sidebar';
import {
  LayoutDashboard,
  Users,
  Truck,
  ArrowLeftRight,
  Bell,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

export function MainLayout({ children }: LayoutProps) {
  const pathname = usePathname();
  const { t } = useApp();

  const bottomNavItems: NavItem[] = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { path: '/customers', icon: Users, label: t('customers') },
    { path: '/suppliers', icon: Truck, label: t('suppliers') },
    { path: '/transactions', icon: ArrowLeftRight, label: t('transactions') },
    { path: '/reminders', icon: Bell, label: t('reminders') },
  ];

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to main content link */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground">
        Skip to main content
      </a>

      {/* Desktop Sidebar */}
      <aside className="sidebar" aria-label="Desktop navigation">
        <SidebarContent onItemClick={() => {}} />
      </aside>

      {/* Mobile Header */}
      <Header />

      {/* Main Content */}
      <main className="md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0 min-h-screen" id="main-content" role="main">
        <div className="container-padding animate-fadeIn">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav safe-bottom" aria-label="Mobile navigation">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`bottom-nav-item ${active ? 'active' : ''}`}
              data-testid={`nav-${item.path.slice(1)}`}
              aria-current={active ? 'page' : undefined}
              title={item.label}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
