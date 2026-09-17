'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore, PRESET_ROLES } from '@/stores/authStore';
import { DevPermissionsModal } from './DevPermissionsModal';
import {
  LayoutDashboard,
  Settings,
  Sliders,
  LogOut,
  Menu,
  X,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  Check,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  Store,
  Coins,
  Radio,
  Users,
  Wallet,
  Sun,
  Moon,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  group: 'Dashboard' | 'Channel' | 'Admin';
  permission?:
    | 'userPermissions'
    | 'dealerPermissions'
    | 'commissionPermissions'
    | 'plansNumberpermissions'
    | 'reportsPermissions'
    | 'walletPermissions';
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    group: 'Dashboard',
  },
  {
    label: 'Dealers',
    href: '/dealers',
    icon: Store,
    permission: 'dealerPermissions',
    group: 'Channel',
  },
  {
    label: 'Commissions',
    href: '/commissions',
    icon: Coins,
    permission: 'commissionPermissions',
    group: 'Channel',
  },
  {
    label: 'Plans & Numbers',
    href: '/plans',
    icon: Radio,
    permission: 'plansNumberpermissions',
    group: 'Channel',
  },
  {
    label: 'User Management',
    href: '/users',
    icon: Users,
    permission: 'userPermissions',
    group: 'Admin',
  },
  {
    label: 'Reports & Wallet',
    href: '/reports',
    icon: Wallet,
    permission: 'reportsPermissions',
    group: 'Admin',
  },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    username,
    displayName,
    currentRoleKey,
    hasPermission,
    switchRole,
    logout,
  } = useAuthStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDevPermsOpen, setIsDevPermsOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [openSections, setOpenSections] = useState<{ channel: boolean; admin: boolean }>({
    channel: true,
    admin: true,
  });

  const toggleSection = (section: 'channel' | 'admin') => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    // Light mode is default unless user explicitly chose dark
    const storedTheme = localStorage.getItem('scm_theme');
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }

    // Responsive auto-collapse under 1024px
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Auto-recover auth state if corrupted
    const state = useAuthStore.getState();
    if (!state.isAuthenticated || !state.permissions) {
      state.switchRole(state.currentRoleKey || 'SUPER_ADMIN');
    }

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('scm_theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('scm_theme', 'dark');
      setIsDarkMode(true);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(target)) {
        setIsRoleDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
        setIsUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = NAV_ITEMS.map((item) => {
    const hasAccess = !item.permission || !isMounted || hasPermission(item.permission);
    return { ...item, hasAccess };
  });

  const dashboardItems = navItems.filter((i) => i.group === 'Dashboard');
  const channelItems = navItems.filter((i) => i.group === 'Channel');
  const adminItems = navItems.filter((i) => i.group === 'Admin');

  const currentRole = PRESET_ROLES[currentRoleKey] || {
    roleName: 'Custom Policy',
    displayName: displayName || 'Operator',
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-background text-foreground font-sans antialiased">
      {/* Dev Permissions Switcher Modal */}
      <DevPermissionsModal isOpen={isDevPermsOpen} onClose={() => setIsDevPermsOpen(false)} />

      {/* ─────────────────────────────────────────────────────────────
          MOBILE & TABLET TOP HEADER (< 1024px)
          ───────────────────────────────────────────────────────────── */}
      <header className="lg:hidden h-14 shrink-0 bg-surface border-b border-border px-4 flex items-center justify-between z-30 select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 text-muted-fg hover:text-heading hover:bg-surface-alt rounded-[4px] transition-colors cursor-pointer"
            aria-label="Open Navigation Drawer"
          >
            <Menu className="w-5 h-5" strokeWidth={1.8} />
          </button>
          <Link href="/" className="flex items-center gap-2 group" title="National Telecom SCM">
            <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0">
              <span className="font-black text-[10px] tracking-tight text-sky-400 font-mono">
                SCM
              </span>
            </div>
            <span className="font-semibold text-[13px] text-heading truncate">National Telecom</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 text-muted-fg hover:text-heading hover:bg-surface-alt rounded-md transition-colors shrink-0 cursor-pointer"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <Sun className="w-4.5 h-4.5 text-amber-400" strokeWidth={2} />
            ) : (
              <Moon className="w-4.5 h-4.5 text-slate-600" strokeWidth={2} />
            )}
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          BODY: SIDEBAR + MAIN VIEWPORT
          ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* ── Sidebar Rail (Obsidian Dark / Surface) ── */}
        <aside
          className={`h-full hidden lg:flex flex-col shrink-0 border-r border-border bg-surface z-20 transition-all duration-[200ms] ease-out select-none ${
            isCollapsed ? 'w-14' : 'w-64'
          }`}
        >
          {/* Top of Sidebar: Simple One-Liner Brand */}
          <div className={`h-14 shrink-0 flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} border-b border-border`}>
            <Link href="/" className="flex items-center gap-2.5 group min-w-0" title="National Telecom SCM">
              <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0 group-hover:border-sky-500 transition-colors">
                <span className="font-black text-[10px] tracking-tight text-sky-400 font-mono">
                  SCM
                </span>
              </div>
              {!isCollapsed && (
                <span className="font-semibold text-[13px] text-heading truncate">
                  National Telecom
                </span>
              )}
            </Link>
          </div>
          {/* Dashboard Top Section */}
          <div className="px-2 pt-3 pb-1 shrink-0">
            {dashboardItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center ${isCollapsed ? 'justify-center px-0 h-9 w-9 mx-auto' : 'justify-between px-3 py-2'} rounded-[6px] text-[13px] leading-5 transition-colors duration-100 ${
                    isActive
                      ? 'bg-accent-light text-heading font-medium'
                      : 'text-foreground font-normal hover:bg-surface-alt'
                  }`}
                  title="Dashboard"
                >
                  <div className={`flex items-center min-w-0 ${isCollapsed ? '' : 'gap-2.5'}`}>
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-accent' : 'text-muted-fg group-hover:text-foreground'}`} strokeWidth={1.75} />
                    {!isCollapsed && <span className="truncate text-left">{item.label}</span>}
                  </div>
                  {!isCollapsed && (
                    <Settings
                      className="w-3.5 h-3.5 text-muted-fg group-hover:text-foreground shrink-0 transition-colors"
                      strokeWidth={1.75}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-4">
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => toggleSection('channel')}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-3'} py-1.5 text-[12px] font-semibold text-accent uppercase tracking-[0.4px] hover:bg-surface-alt rounded-[6px] transition-colors`}
                title="Channel Operations Group"
              >
                {!isCollapsed && <span className="text-left">Channel</span>}
                <ChevronDown
                  className={`w-3.5 h-3.5 text-accent transition-transform duration-150 ease-out shrink-0 ${
                    openSections.channel ? '' : '-rotate-90'
                  }`}
                  strokeWidth={2}
                />
              </button>

              {openSections.channel && (
                <div className="space-y-0.5">
                  {channelItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    if (!item.hasAccess) {
                      return (
                        <div
                          key={item.href}
                          title={`${item.label} (Permission locked for ${currentRole.roleName})`}
                          className={`flex items-center ${isCollapsed ? 'justify-center px-0 h-9 w-9 mx-auto' : 'justify-between px-3 py-2'} rounded-[6px] text-[13px] leading-5 font-normal text-muted-fg opacity-40 cursor-not-allowed select-none`}
                        >
                          <div className={`flex items-center min-w-0 ${isCollapsed ? '' : 'gap-2.5'}`}>
                            <Icon className="w-4 h-4 text-muted-fg shrink-0" strokeWidth={1.75} />
                            {!isCollapsed && <span className="truncate text-left">{item.label}</span>}
                          </div>
                          {!isCollapsed && <Lock className="w-3 h-3 text-muted-fg shrink-0 ml-1" strokeWidth={1.75} />}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={isCollapsed ? item.label : undefined}
                        className={`group flex items-center ${isCollapsed ? 'justify-center px-0 h-9 w-9 mx-auto' : 'gap-2.5 px-3 py-2'} rounded-[6px] text-[13px] leading-5 transition-colors duration-100 ${
                          isActive
                            ? 'bg-accent-light text-heading font-medium'
                            : 'text-foreground font-normal hover:bg-surface-alt'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-accent' : 'text-muted-fg group-hover:text-foreground'}`} strokeWidth={1.75} />
                        {!isCollapsed && <span className="truncate text-left">{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => toggleSection('admin')}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-3'} py-1.5 text-[12px] font-semibold text-accent uppercase tracking-[0.4px] hover:bg-surface-alt rounded-[6px] transition-colors`}
                title="Admin Operations Group"
              >
                {!isCollapsed && <span className="text-left">Admin</span>}
                <ChevronDown
                  className={`w-3.5 h-3.5 text-accent transition-transform duration-150 ease-out shrink-0 ${
                    openSections.admin ? '' : '-rotate-90'
                  }`}
                  strokeWidth={2}
                />
              </button>

              {openSections.admin && (
                <div className="space-y-0.5">
                  {adminItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    if (!item.hasAccess) {
                      return (
                        <div
                          key={item.href}
                          title={`${item.label} (Permission locked for ${currentRole.roleName})`}
                          className={`flex items-center ${isCollapsed ? 'justify-center px-0 h-9 w-9 mx-auto' : 'justify-between px-3 py-2'} rounded-[6px] text-[13px] leading-5 font-normal text-muted-fg opacity-40 cursor-not-allowed select-none`}
                        >
                          <div className={`flex items-center min-w-0 ${isCollapsed ? '' : 'gap-2.5'}`}>
                            <Icon className="w-4 h-4 text-muted-fg shrink-0" strokeWidth={1.75} />
                            {!isCollapsed && <span className="truncate text-left">{item.label}</span>}
                          </div>
                          {!isCollapsed && <Lock className="w-3 h-3 text-muted-fg shrink-0 ml-1" strokeWidth={1.75} />}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={isCollapsed ? item.label : undefined}
                        className={`group flex items-center ${isCollapsed ? 'justify-center px-0 h-9 w-9 mx-auto' : 'gap-2.5 px-3 py-2'} rounded-[6px] text-[13px] leading-5 transition-colors duration-100 ${
                          isActive
                            ? 'bg-accent-light text-heading font-medium'
                            : 'text-foreground font-normal hover:bg-surface-alt'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-accent' : 'text-muted-fg group-hover:text-foreground'}`} strokeWidth={1.75} />
                        {!isCollapsed && <span className="truncate text-left">{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Bottom Controls: Role Switcher + User Info & Dark Mode + Collapse Button */}
          <div className={`border-t border-border shrink-0 bg-surface ${isCollapsed ? 'p-2 space-y-2 flex flex-col items-center' : 'p-2.5 space-y-2'}`}>
            {/* 1. Active Role Switcher */}
            <div className="relative w-full" ref={roleDropdownRef}>
              {!isCollapsed ? (
                <button
                  type="button"
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-[6px] border border-border bg-surface-alt/70 hover:bg-surface-alt transition-colors text-left shadow-2xs"
                  title="Switch role context or modify permissions"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded-[4px] bg-accent/15 text-accent flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-accent" strokeWidth={2} />
                    </div>
                    <div className="flex flex-col text-left leading-tight min-w-0">
                      <span className="text-[10px] font-medium text-muted-fg uppercase tracking-[0.4px]">Active Role</span>
                      <span className="text-[12px] font-semibold text-accent truncate">
                        {currentRole.roleName}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-fg shrink-0 transition-transform duration-150 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="relative w-9 h-9 mx-auto flex items-center justify-center rounded-[6px] border border-border bg-surface-alt/70 hover:bg-surface-alt transition-colors group"
                  title={`Active Role: ${currentRole.roleName}`}
                  aria-label="Switch Active Role"
                >
                  <ShieldCheck className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" strokeWidth={1.8} />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                </button>
              )}

              {/* Role Dropdown Menu */}
              {isRoleDropdownOpen && (
                <div className={`absolute ${isCollapsed ? 'left-full bottom-0 ml-2' : 'left-0 bottom-full mb-1.5'} w-72 bg-surface rounded-[6px] shadow-2xl border border-border py-1 z-50 animate-in fade-in duration-100`}>
                  <div className="px-3 py-1.5 border-b border-border bg-background">
                    <div className="text-[10px] font-bold text-muted-fg uppercase tracking-wider">
                      Switch Role Context
                    </div>
                    <p className="text-[11px] text-muted-fg/70">
                      Updates UI module access and role permissions immediately.
                    </p>
                  </div>

                  <div className="p-1 space-y-0.5 max-h-60 overflow-y-auto">
                    {Object.entries(PRESET_ROLES).map(([key, role]) => {
                      const isSelected = currentRoleKey === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            switchRole(key);
                            setIsRoleDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[4px] text-xs text-left transition-colors ${
                            isSelected
                              ? 'bg-accent/10 text-accent font-semibold'
                              : 'text-foreground hover:bg-surface-alt'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span>{role.roleName}</span>
                              {isSelected && (
                                <span className="text-[9px] uppercase px-1.5 py-0.2 bg-accent text-white rounded font-bold">
                                  Active
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-muted-fg/70 font-normal mt-0.5">
                              {key === 'SUPER_ADMIN' && 'All 6 modules unlocked'}
                              {key === 'CIRCLE_MANAGER' && 'Dealers, Users & Plans'}
                              {key === 'COMMISSION_OFFICER' && 'Commissions & Plans'}
                              {key === 'FINANCE_AUDITOR' && 'Reports & Wallet'}
                              {key === 'READ_ONLY' && 'Read-only telemetry'}
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-accent shrink-0" strokeWidth={2.5} />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-border p-1.5 bg-background">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRoleDropdownOpen(false);
                        setIsDevPermsOpen(true);
                      }}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-[4px] text-xs text-accent hover:bg-accent/10 font-semibold transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Customize 14+ Permission Flags...</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. User Profile Card & Dark Mode Toggle */}
            <div className="relative w-full" ref={userDropdownRef}>
              {!isCollapsed ? (
                <div className="flex items-center justify-between p-1.5 rounded-[6px] bg-surface-alt/50 border border-border">
                  <button
                    type="button"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-2 min-w-0 flex-1 text-left group"
                    title={displayName || 'User Profile'}
                  >
                    <div className="w-7 h-7 rounded-full bg-accent text-white font-bold flex items-center justify-center text-xs shrink-0 ring-1 ring-border group-hover:ring-accent/40 transition-all">
                      {displayName ? displayName.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="flex flex-col min-w-0 leading-tight">
                      <span className="text-[12px] font-semibold text-heading truncate">{displayName || 'Adithya (Admin)'}</span>
                      <span className="text-[10px] text-muted-fg font-mono truncate">{username || 'admin'}</span>
                    </div>
                  </button>

                  {/* Theme Toggle */}
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="p-1.5 text-muted-fg hover:text-heading hover:bg-surface rounded-[4px] transition-colors shrink-0 cursor-pointer"
                    title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  >
                    {isDarkMode ? (
                      <Sun className="w-4 h-4 text-amber-400 hover:text-amber-300" strokeWidth={2} />
                    ) : (
                      <Moon className="w-4 h-4 text-slate-600 hover:text-slate-900" strokeWidth={2} />
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-2 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="w-8 h-8 rounded-full bg-accent text-white font-bold flex items-center justify-center text-xs mx-auto hover:ring-2 hover:ring-accent/40 transition-all cursor-pointer"
                    title={displayName || 'User Profile'}
                    aria-label="User Profile Menu"
                  >
                    {displayName ? displayName.charAt(0).toUpperCase() : 'A'}
                  </button>

                  {/* Theme Toggle (Collapsed) */}
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="w-8 h-8 mx-auto flex items-center justify-center text-muted-fg hover:text-heading hover:bg-surface-alt rounded-[6px] transition-colors cursor-pointer"
                    title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  >
                    {isDarkMode ? (
                      <Sun className="w-4 h-4 text-amber-400 hover:text-amber-300" strokeWidth={2} />
                    ) : (
                      <Moon className="w-4 h-4 text-slate-600 hover:text-slate-900" strokeWidth={2} />
                    )}
                  </button>
                </div>
              )}

              {/* User Dropdown Menu */}
              {isUserDropdownOpen && (
                <div className={`absolute ${isCollapsed ? 'left-full bottom-0 ml-2' : 'left-0 bottom-full mb-1.5'} w-56 bg-surface rounded-[6px] shadow-2xl border border-border py-1 z-50 animate-in fade-in duration-100`}>
                  <div className="px-3 py-2 border-b border-border bg-background">
                    <div className="text-xs font-bold text-heading">{displayName || 'Adithya (Admin)'}</div>
                    <div className="text-[10px] text-muted-fg font-mono mt-0.5">HRMS001 · {username || 'admin'}</div>
                    <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-accent bg-accent/10 px-1.5 py-0.5 rounded-[4px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span>{currentRole.roleName}</span>
                    </div>
                  </div>

                  <div className="p-1 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        setIsDevPermsOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-xs text-foreground hover:bg-surface-alt text-left"
                    >
                      <Sliders className="w-3.5 h-3.5 text-muted-fg" />
                      <span>Role Permissions Matrix</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        setIsHelpModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-xs text-foreground hover:bg-surface-alt text-left"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-muted-fg" />
                      <span>Documentation & Guides</span>
                    </button>
                  </div>

                  <div className="border-t border-border p-1 bg-background">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] text-xs text-[#DB3030] hover:bg-[#FDF2F2] dark:hover:bg-[#DB3030]/10 text-left font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Collapse Sidebar Button */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`w-full flex items-center gap-2 ${isCollapsed ? 'justify-center px-0 h-8 w-8 mx-auto' : 'px-2.5 py-1.5'} rounded-[6px] text-[12px] font-normal text-muted-fg hover:text-heading hover:bg-surface-alt transition-colors`}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 shrink-0 text-muted-fg" strokeWidth={1.75} />
              ) : (
                <>
                  <PanelLeftClose className="w-4 h-4 shrink-0 text-muted-fg" strokeWidth={1.75} />
                  <span className="truncate text-left">Collapse sidebar</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* ─────────────────────────────────────────────────────────────
            RIGHT SCROLLABLE CONTENT VIEWPORT + FOOTER
            ───────────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
          {/* Main content scrollable container */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 px-4 py-3 sm:px-6 sm:py-3.5">
            <div className="w-full max-w-[1400px]">{children}</div>
          </main>

          {/* ─────────────────────────────────────────────────────────────
              SCM TELECOM PORTAL FOOTER
              ───────────────────────────────────────────────────────────── */}
          <footer className="shrink-0 bg-background border-t border-border px-6 py-2 text-[11px] font-normal leading-4 text-muted-fg flex flex-col sm:flex-row items-center justify-between gap-2 select-none">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span>All systems operational · SCM Pan-India Cloud</span>
            </div>
            <div>
              <span>© 2026 National Telecom SCM Inc. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(true)}
                className="hover:text-[#016BF8] transition-colors"
              >
                System Status
              </button>
              <span className="text-[#C8D4D0]">·</span>
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(true)}
                className="hover:text-[#016BF8] transition-colors"
              >
                Security & RBAC
              </button>
              <span className="text-[#C8D4D0]">·</span>
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(true)}
                className="hover:text-[#016BF8] transition-colors"
              >
                API Registry
              </button>
              <span className="text-[#C8D4D0]">·</span>
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(true)}
                className="hover:text-[#016BF8] transition-colors"
              >
                Privacy
              </button>
            </div>
          </footer>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          HELP / KNOWLEDGE BASE MODAL
          ───────────────────────────────────────────────────────────── */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#001E2B]/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-surface rounded-[8px] shadow-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-background">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[4px] bg-accent text-white flex items-center justify-center text-xs">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-[18px] font-normal leading-6 text-heading">SCM Support & Knowledge Center</h3>
                  <p className="text-[11px] text-muted-fg">Reference manual and architectural specifications</p>
                </div>
              </div>
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="p-1 rounded-[4px] text-muted-fg hover:text-heading hover:bg-surface-alt"
                aria-label="Close help modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-foreground">
              <div className="space-y-2">
                <div className="font-bold text-heading text-xs uppercase tracking-wider text-[11px]">
                  Key Documentation Links
                </div>
                <ul className="divide-y divide-[#E8EDEB] border border-border rounded-[6px] overflow-hidden">
                  <li className="px-3 py-2 flex items-center justify-between hover:bg-background">
                    <span className="font-medium">1-Click Role Switcher &amp; RBAC Matrix</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsHelpModalOpen(false);
                        setIsDevPermsOpen(true);
                      }}
                      className="text-[#016BF8] hover:underline font-semibold text-[11px] flex items-center gap-1"
                    >
                      Open Matrix <Sliders className="w-3 h-3" />
                    </button>
                  </li>
                  <li className="px-3 py-2 flex items-center justify-between hover:bg-background">
                    <span className="font-medium">Franchise &amp; Dealer Commission Engine</span>
                    <Link
                      href="/commissions"
                      onClick={() => setIsHelpModalOpen(false)}
                      className="text-[#016BF8] hover:underline font-semibold text-[11px] flex items-center gap-1"
                    >
                      View Rules <ExternalLink className="w-3 h-3" />
                    </Link>
                  </li>
                  <li className="px-3 py-2 flex items-center justify-between hover:bg-background">
                    <span className="font-medium">Telecom API Registry &amp; Interceptors</span>
                    <span className="text-accent font-semibold text-[11px]">Connected &amp; Active</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-border bg-background flex justify-end">
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(false)}
                className="btn btn-primary text-xs px-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MOBILE & TABLET NAVIGATION DRAWER (< 1024px)
          ───────────────────────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#001E2B]/50 backdrop-blur-xs flex animate-in fade-in duration-150">
          <div className="w-72 bg-surface h-full shadow-2xl flex flex-col p-4 space-y-4 border-r border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0">
                  <span className="font-black text-[10px] tracking-tight text-sky-400 font-mono">
                    SCM
                  </span>
                </div>
                <span className="font-semibold text-[13px] text-heading">National Telecom</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-muted-fg hover:text-heading rounded-[4px]"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                if (!item.hasAccess) {
                  return (
                    <div
                      key={item.href}
                      className="flex items-center justify-between px-3 py-2 rounded-[4px] text-xs font-medium text-muted-fg/70 opacity-40 select-none"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0 text-muted-fg" strokeWidth={1.75} />
                        <span>{item.label}</span>
                      </div>
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-accent/10 text-heading font-semibold'
                        : 'text-foreground hover:bg-surface-alt'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-accent' : 'text-muted-fg'}`} strokeWidth={1.75} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-border space-y-2">
              <div className="flex items-center justify-between p-2 rounded-[6px] bg-surface-alt border border-border">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-accent text-white font-bold flex items-center justify-center text-xs">
                    {displayName ? displayName.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div className="flex flex-col text-left leading-tight">
                    <span className="text-xs font-semibold text-heading">{displayName || 'Adithya'}</span>
                    <span className="text-[10px] text-accent font-medium">{currentRole.roleName}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-1.5 text-muted-fg hover:text-heading hover:bg-surface rounded-[4px] transition-colors cursor-pointer"
                  title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDarkMode ? (
                    <Sun className="w-4 h-4 text-amber-400 hover:text-amber-300" strokeWidth={2} />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-600 hover:text-slate-900" strokeWidth={2} />
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsDevPermsOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-[4px] text-xs font-semibold text-accent bg-accent/10"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Permissions Matrix</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}
    </div>
  );
}

