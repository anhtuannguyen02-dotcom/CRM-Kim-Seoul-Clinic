import React, { useState, useEffect } from 'react';
import { Bell, Search, Settings, HelpCircle, ChevronDown, CheckCircle, Clock, AlertCircle, AlertTriangle, Calendar } from 'lucide-react';

import { ClinicProfile, CRMTask, Appointment } from '../types';

interface TopbarProps {
  notificationsCount: number;
  clearNotifications: () => void;
  clinicProfile: ClinicProfile;
  crmTasks: CRMTask[];
  appointments: Appointment[];
}

export default function Topbar({ notificationsCount, clearNotifications, clinicProfile, crmTasks, appointments }: TopbarProps) {
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

  // Overdue CRM Tasks (due before today 2026-07-08 and not completed)
  const overdueTasks = crmTasks.filter(t => t.status !== 'Đã hoàn thành' && t.dueDate < '2026-07-08');

  // Upcoming CRM Tasks (due today or within next 3 days, not completed)
  const upcomingTasks = crmTasks.filter(t => {
    if (t.status === 'Đã hoàn thành') return false;
    return t.dueDate >= '2026-07-08' && t.dueDate <= '2026-07-11';
  });

  // Upcoming Appointments (today or tomorrow, 'Chờ phục vụ' or 'Đang thực hiện')
  const upcomingAppointments = appointments.filter(a => {
    return (a.status === 'Chờ phục vụ' || a.status === 'Đang thực hiện') && 
           (a.date === '2026-07-08' || a.date === '2026-07-09');
  });

  const liveBadgeCount = overdueTasks.length + upcomingTasks.length + upcomingAppointments.length;

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
            onClick={() => {
              setShowNotificationMenu(!showNotificationMenu);
              if (showNotificationMenu) {
                clearNotifications();
              }
            }}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors relative"
          >
            <Bell className="h-5 w-5" />
            {(liveBadgeCount > 0 || notificationsCount > 0) && (
              <span id="topbar-notification-badge" className="absolute top-1.5 right-1.5 h-4 w-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-bounce">
                {liveBadgeCount || notificationsCount}
              </span>
            )}
          </button>

          {showNotificationMenu && (
            <div id="topbar-notification-dropdown" className="absolute right-0 mt-3 w-96 bg-white border border-slate-200 rounded-2xl shadow-xl py-3 z-50 text-slate-800 animate-fade-in max-h-[500px] flex flex-col">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Cảnh báo & Nhắc hẹn</span>
                {liveBadgeCount > 0 && (
                  <span className="text-[9px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-bold">
                    {liveBadgeCount} tác vụ hoạt động
                  </span>
                )}
              </div>
              <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
                {/* Overdue Warnings */}
                {overdueTasks.length > 0 && (
                  <div className="bg-rose-50/30">
                    <div className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Cảnh báo: Tác vụ quá hạn chưa xong ({overdueTasks.length})
                    </div>
                    {overdueTasks.map(task => (
                      <div key={task.id} className="px-4 py-2.5 hover:bg-rose-50/50 transition-colors flex gap-3 text-xs">
                        <div className="p-1 bg-rose-100 rounded-full h-fit mt-0.5 text-rose-600">
                          <AlertTriangle className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-950 leading-tight">
                            {task.customerName} - {task.type}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{task.description}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-mono font-medium">Trễ: {task.dueDate}</span>
                            <span className="text-[9px] text-slate-400 font-mono">{task.customerPhone}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upcoming Tasks */}
                {upcomingTasks.length > 0 && (
                  <div>
                    <div className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Nhắc nhở: Tác vụ sắp đến hạn ({upcomingTasks.length})
                    </div>
                    {upcomingTasks.map(task => (
                      <div key={task.id} className="px-4 py-2.5 hover:bg-slate-50 transition-colors flex gap-3 text-xs">
                        <div className="p-1 bg-amber-100 rounded-full h-fit mt-0.5 text-amber-600">
                          <Clock className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 leading-tight">
                            {task.customerName} - {task.type}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{task.description}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono font-medium">Hạn: {task.dueDate === '2026-07-08' ? 'Hôm nay' : task.dueDate}</span>
                            <span className="text-[9px] text-slate-400 font-mono">{task.customerPhone}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upcoming Appointments */}
                {upcomingAppointments.length > 0 && (
                  <div className="bg-sky-50/20">
                    <div className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Lịch hẹn sắp diễn ra ({upcomingAppointments.length})
                    </div>
                    {upcomingAppointments.map(appt => (
                      <div key={appt.id} className="px-4 py-2.5 hover:bg-sky-50/40 transition-colors flex gap-3 text-xs">
                        <div className="p-1 bg-sky-100 rounded-full h-fit mt-0.5 text-sky-600">
                          <Calendar className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 leading-tight">
                            {appt.customerName} - {appt.serviceName}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Bác sĩ/KTV: {appt.technicianName} | {appt.time}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[9px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-mono font-medium">Ngày: {appt.date === '2026-07-08' ? 'Hôm nay' : appt.date}</span>
                            <span className="text-[9px] text-slate-400 font-mono">{appt.customerPhone}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {liveBadgeCount === 0 && (
                  <div className="px-4 py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                    <span>Hệ thống sạch! Không có cảnh báo trễ hạn hay nhắc nhở nào cần chú ý.</span>
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
              src={clinicProfile.managerAvatar}
              alt={`Manager ${clinicProfile.managerName}`}
              className="h-9 w-9 rounded-full object-cover border border-amber-200 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div id="topbar-profile-info" className="hidden md:block">
              <p className="text-xs font-bold text-slate-800 tracking-tight leading-none">{clinicProfile.managerName}</p>
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
