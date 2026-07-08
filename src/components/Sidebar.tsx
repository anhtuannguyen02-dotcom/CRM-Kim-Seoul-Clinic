import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  HeartHandshake, 
  TicketPercent, 
  UserRoundCheck, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { ClinicProfile } from '../types';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  clinicProfile: ClinicProfile;
}

export default function Sidebar({ currentTab, onTabChange, onLogout, clinicProfile }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', name: 'Tổng quan', icon: LayoutDashboard },
    { id: 'appointments', name: 'Lịch hẹn', icon: CalendarDays },
    { id: 'customers', name: 'Khách hàng', icon: Users },
    { id: 'care', name: 'Chăm sóc', icon: HeartHandshake },
    { id: 'promotions', name: 'Khuyến mãi', icon: TicketPercent },
    { id: 'staff', name: 'Nhân sự', icon: UserRoundCheck },
    { id: 'settings', name: 'Cài đặt', icon: Settings },
  ];

  return (
    <aside id="sidebar-container" className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-full shrink-0">
      {/* Brand Logo & Header */}
      <div id="sidebar-brand-header" className="p-6 border-b border-slate-800 flex flex-col items-center justify-center">
        <img 
          id="sidebar-logo-img"
          src={clinicProfile.logoUrl} 
          alt="Clinic Logo" 
          className="h-16 w-auto object-contain filter invert-0 brightness-110 mb-2 max-h-[64px]"
          referrerPolicy="no-referrer"
        />
        <div id="sidebar-brand-title" className="text-center">
          <span className="text-xs uppercase tracking-[0.2em] font-light text-amber-500/80 block line-clamp-1">{clinicProfile.name.split('-')[0].trim()}</span>
          <span className="text-xs text-slate-500 font-mono">Seoul • Vietnam</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav id="sidebar-nav-menu" className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              id={`sidebar-tab-btn-${item.id}`}
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive 
                  ? 'bg-gradient-to-r from-amber-950/40 to-amber-900/10 text-amber-400 border-l-2 border-amber-500 shadow-sm shadow-amber-950/10' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <IconComponent className={`h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-amber-500' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="h-3.5 w-3.5 text-amber-500" />}
            </button>
          );
        })}
      </nav>

      {/* Logout Footer Section */}
      <div id="sidebar-footer" className="p-4 border-t border-slate-800">
        <button
          id="sidebar-logout-btn"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-colors duration-150"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
