import React, { useState, useEffect } from 'react';
import { Bell, Search, Settings, HelpCircle, ChevronDown, CheckCircle, Clock } from 'lucide-react';

interface TopbarProps {
  notificationsCount: number;
  clearNotifications: () => void;
}

export default function Topbar({ notificationsCount, clearNotifications }: TopbarProps) {
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <header id="topbar-container" className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm shadow-slate-100/40">
      {/* Left Search Section */}
      <div id="topbar-search-wrapper" className="flex items-center gap-4 w-96 relative">
        <Search className="h-4 w-4 text-slate-400 absolute left-3.5" />
        <input
          id="topbar-search-input"
          type="text"
          placeholder="Tìm kiếm khách hàng, lịch hẹn, dịch vụ..."
          className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white focus:border-amber-500 transition-all duration-150"
        />
      </div>

      {/* Right Controls & Profile */}
      <div id="topbar-right-controls" className="flex items-center gap-6">
        {/* Dynamic Clock (Vietnamese) */}
        <div id="topbar-clock-display" className="hidden lg:flex flex-col items-end text-right font-sans">
          <span className="text-xs font-semibold text-slate-700 tracking-tight flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-amber-600 animate-pulse" />
            {formattedTime}
          </span>
          <span className="text-[10px] text-slate-400 font-medium capitalize">{formattedDate}</span>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden lg:block"></div>

        {/* Notification Bell with Badge */}
        <div id="topbar-notifications-wrapper" className="relative">
          <button
            id="topbar-notification-btn"
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors relative"
          >
            <Bell className="h-5 w-5" />
            {notificationsCount > 0 && (
              <span id="topbar-notification-badge" className="absolute top-1.5 right-1.5 h-4 w-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-bounce">
                {notificationsCount}
              </span>
            )}
          </button>

          {showNotificationMenu && (
            <div id="topbar-notification-dropdown" className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-slate-800 animate-fade-in">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Thông báo mới</span>
                {notificationsCount > 0 && (
                  <button 
                    id="topbar-clear-notif-btn"
                    onClick={() => {
                      clearNotifications();
                      setShowNotificationMenu(false);
                    }} 
                    className="text-[10px] text-amber-600 hover:text-amber-700 font-semibold"
                  >
                    Đánh dấu tất cả đã đọc
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notificationsCount > 0 ? (
                  <div className="divide-y divide-slate-50">
                    <div className="px-4 py-3 hover:bg-slate-50 transition-colors flex gap-3">
                      <div className="p-1 bg-amber-50 rounded-full h-fit">
                        <CheckCircle className="h-4.5 w-4.5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-800 font-medium">Khách hàng Nguyễn Phương Anh đã check-in</p>
                        <span className="text-[10px] text-slate-400">9:30 AM • Phòng VIP 1</span>
                      </div>
                    </div>
                    <div className="px-4 py-3 hover:bg-slate-50 transition-colors flex gap-3">
                      <div className="p-1 bg-sky-50 rounded-full h-fit">
                        <CheckCircle className="h-4.5 w-4.5 text-sky-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-800 font-medium">Lịch hẹn mới được đặt từ Admin Kim</p>
                        <span className="text-[10px] text-slate-400">Hôm nay, 14:30</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-xs text-slate-400">
                    Không có thông báo mới
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Card & Dropdown */}
        <div id="topbar-profile-wrapper" className="relative">
          <button
            id="topbar-profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 rounded-full hover:bg-slate-100 transition-all text-left"
          >
            <img
              id="topbar-profile-avatar"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfRRspgKk3Pu_Ynok-987fQAqFAYzZGSIOZZ_pAlY4MR63jnal_1UCCH6t98jbHGFYdr1XP6R4ccQVfg3cRDKyZKMUw1dPl1MifcAVcNi1jZPEn6FOcgdo5zRS57HQMRl_eG3CNOxcDmmZKg1XHVZY2LLKB7LW6_BQvAHuXY59tTY2IyLWKwnsPxSQTCWFSazH7oNndjYvnvAwxP-U1EeKhy40NFQgZTfdqZ5FORLWNBN2DigU0DbMnA"
              alt="Manager Phạm Minh Anh"
              className="h-9 w-9 rounded-full object-cover border border-amber-200 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div id="topbar-profile-info" className="hidden md:block">
              <p className="text-xs font-bold text-slate-800 tracking-tight leading-none">Phạm Minh Anh</p>
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">Quản lý cơ sở</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden md:block" />
          </button>

          {showProfileMenu && (
            <div id="topbar-profile-dropdown" className="absolute right-0 mt-3 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-fade-in text-xs text-slate-700">
              <div className="px-4 py-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 block">Kim Seoul Premium</span>
                <span className="text-[10px] text-slate-400">Chi nhánh Quận 1, Tp.HCM</span>
              </div>
              <button className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-center gap-2">
                <Settings className="h-4 w-4 text-slate-400" />
                <span>Cài đặt cá nhân</span>
              </button>
              <button className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-slate-400" />
                <span>Trung tâm hỗ trợ</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
