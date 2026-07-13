import React, { useState, useEffect } from 'react';
import { Bell, Search, Settings, HelpCircle, ChevronDown, CheckCircle, Clock, AlertCircle, AlertTriangle, Calendar, X, User, MapPin, Phone, Save } from 'lucide-react';

import { ClinicProfile, CRMTask, Appointment, Customer } from '../types';

interface TopbarProps {
  notificationsCount: number;
  clearNotifications: () => void;
  clinicProfile: ClinicProfile;
  onUpdateClinicProfile?: (profile: ClinicProfile) => void;
  crmTasks: CRMTask[];
  appointments: Appointment[];
  dismissedAppointmentIds?: string[];
  onNotificationSelect?: (customerId: string, itemType: 'task' | 'appointment', itemId: string) => void;
  customers?: Customer[];
}

export default function Topbar({
  notificationsCount,
  clearNotifications,
  clinicProfile,
  onUpdateClinicProfile,
  crmTasks,
  appointments,
  dismissedAppointmentIds = [],
  onNotificationSelect,
  customers = []
}: TopbarProps) {
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Edit Profile Form State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editManagerName, setEditManagerName] = useState(clinicProfile.managerName);
  const [editManagerAvatar, setEditManagerAvatar] = useState(clinicProfile.managerAvatar);
  const [editBranchName, setEditBranchName] = useState(clinicProfile.branchName || 'Vinhome Smart City');
  const [editClinicName, setEditClinicName] = useState(clinicProfile.name);
  const [editClinicAddress, setEditClinicAddress] = useState(clinicProfile.address);
  const [editClinicPhone, setEditClinicPhone] = useState(clinicProfile.phone);
  const [editClinicHours, setEditClinicHours] = useState(clinicProfile.hours);

  const handleOpenEditModal = () => {
    setEditManagerName(clinicProfile.managerName);
    setEditManagerAvatar(clinicProfile.managerAvatar);
    setEditBranchName(clinicProfile.branchName || 'Vinhome Smart City');
    setEditClinicName(clinicProfile.name);
    setEditClinicAddress(clinicProfile.address);
    setEditClinicPhone(clinicProfile.phone);
    setEditClinicHours(clinicProfile.hours);
    setShowEditProfileModal(true);
    setShowProfileMenu(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateClinicProfile) {
      onUpdateClinicProfile({
        name: editClinicName,
        address: editClinicAddress,
        phone: editClinicPhone,
        hours: editClinicHours,
        managerName: editManagerName,
        managerAvatar: editManagerAvatar,
        logoUrl: clinicProfile.logoUrl,
        dashboardImageUrl: clinicProfile.dashboardImageUrl,
        branchName: editBranchName
      });
    }
    setShowEditProfileModal(false);
  };

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
    if (dismissedAppointmentIds.includes(a.id)) return false;
    return (a.status === 'Chờ phục vụ' || a.status === 'Đang thực hiện') && 
           (a.date === '2026-07-08' || a.date === '2026-07-09');
  });

  // Filter customers with 2 or fewer package sessions remaining
  const lowSessionCustomers = (customers || []).filter(c => 
    c.activePackages && c.activePackages.some(pkg => {
      const remaining = pkg.totalSessions - pkg.usedSessions;
      return remaining > 0 && remaining <= 2;
    })
  );

  const liveBadgeCount = overdueTasks.length + upcomingTasks.length + upcomingAppointments.length + lowSessionCustomers.length;

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
                      <div 
                        key={task.id} 
                        onClick={() => {
                          onNotificationSelect?.(task.customerId, 'task', task.id);
                          setShowNotificationMenu(false);
                        }}
                        className="px-4 py-2.5 hover:bg-rose-50/80 hover:text-slate-950 cursor-pointer transition-colors flex gap-3 text-xs"
                      >
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
                      <div 
                        key={task.id} 
                        onClick={() => {
                          onNotificationSelect?.(task.customerId, 'task', task.id);
                          setShowNotificationMenu(false);
                        }}
                        className="px-4 py-2.5 hover:bg-amber-50/60 cursor-pointer transition-colors flex gap-3 text-xs"
                      >
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
                      <div 
                        key={appt.id} 
                        onClick={() => {
                          onNotificationSelect?.(appt.customerId, 'appointment', appt.id);
                          setShowNotificationMenu(false);
                        }}
                        className="px-4 py-2.5 hover:bg-sky-100/70 cursor-pointer transition-colors flex gap-3 text-xs"
                      >
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

                {/* Low Session Warnings */}
                {lowSessionCustomers.length > 0 && (
                  <div className="bg-amber-50/20">
                    <div className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50/60 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-amber-600" />
                      Cảnh báo: Khách sắp hết buổi liệu trình ({lowSessionCustomers.length})
                    </div>
                    {lowSessionCustomers.map(c => {
                      const lowPkgs = c.activePackages.filter(pkg => {
                        const remaining = pkg.totalSessions - pkg.usedSessions;
                        return remaining > 0 && remaining <= 2;
                      });
                      return (
                        <div 
                          key={c.id} 
                          onClick={() => {
                            onNotificationSelect?.(c.id, 'task', '');
                            setShowNotificationMenu(false);
                          }}
                          className="px-4 py-2.5 hover:bg-amber-50/40 cursor-pointer transition-colors flex gap-3 text-xs"
                        >
                          <img 
                            src={c.avatar} 
                            alt={c.name} 
                            className="h-7 w-7 rounded-full object-cover mt-0.5 border border-slate-100 shrink-0" 
                            referrerPolicy="no-referrer" 
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900 leading-tight">
                              {c.name}
                            </p>
                            <p className="text-[10px] text-amber-700 font-medium mt-0.5">
                              {lowPkgs.map(pkg => `📦 ${pkg.packageName} (Còn ${pkg.totalSessions - pkg.usedSessions}/${pkg.totalSessions} buổi!)`).join(', ')}
                            </p>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono font-medium">⚠️ Sắp hết buổi</span>
                              <span className="text-[9px] text-slate-400 font-mono">{c.phone}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                <span className="font-bold text-slate-900 block">{clinicProfile.name.split('-')[0].trim()}</span>
                <span className="text-[10px] text-slate-400">Chi nhánh {clinicProfile.branchName || 'Vinhome Smart City'}</span>
              </div>
              <button 
                onClick={handleOpenEditModal}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
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

      {/* TIGHTLY LINKED: Personal Profile Settings Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-500/5 to-amber-600/5 animate-fade-in">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 rounded-xl">
                  <Settings className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Cài đặt cá nhân & Chi nhánh</h3>
                  <p className="text-[10px] text-slate-400">Đồng bộ thông tin quản lý và cơ sở thẩm mỹ</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 text-xs text-slate-700">
              
              {/* Section 1: Personal Manager Profile */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block border-b border-slate-100 pb-1.5">Thông tin Quản lý</span>
                
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <img 
                    src={editManagerAvatar} 
                    alt="Avatar preview" 
                    className="h-14 w-14 rounded-full object-cover border-2 border-amber-500/20 shadow-inner shrink-0 animate-fade-in"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600&h=600';
                    }}
                  />
                  <div className="flex-1 space-y-1">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Chọn nhanh ảnh đại diện</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditManagerAvatar('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600&h=600')}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${editManagerAvatar.includes('photo-1573496359142') ? 'border-amber-500 bg-amber-50 text-amber-700 font-medium' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'}`}
                      >
                        Nữ (Mặc định)
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditManagerAvatar('https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600&h=600')}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${editManagerAvatar.includes('photo-1560250097') ? 'border-amber-500 bg-amber-50 text-amber-700 font-medium' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'}`}
                      >
                        Nam
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Họ và tên Quản lý</label>
                    <input
                      type="text"
                      value={editManagerName}
                      onChange={(e) => setEditManagerName(e.target.value)}
                      placeholder="Nhập tên quản lý..."
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-700 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Đường dẫn ảnh chân dung (URL)</label>
                    <input
                      type="text"
                      value={editManagerAvatar}
                      onChange={(e) => setEditManagerAvatar(e.target.value)}
                      placeholder="Nhập link ảnh..."
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-700 font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Clinic Location Profile */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block border-b border-slate-100 pb-1.5">Thông tin Chi nhánh & Cơ sở</span>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Tên Thương Hiệu</label>
                    <input
                      type="text"
                      value={editClinicName}
                      onChange={(e) => setEditClinicName(e.target.value)}
                      placeholder="Nhập tên thương hiệu..."
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-700 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Khu Vực / Tên Chi Nhánh</label>
                    <input
                      type="text"
                      value={editBranchName}
                      onChange={(e) => setEditBranchName(e.target.value)}
                      placeholder="Ví dụ: Vinhome Smart City"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-700 font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Địa chỉ chi tiết</label>
                  <input
                    type="text"
                    value={editClinicAddress}
                    onChange={(e) => setEditClinicAddress(e.target.value)}
                    placeholder="Nhập địa chỉ..."
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-700 font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Số điện thoại</label>
                    <input
                      type="text"
                      value={editClinicPhone}
                      onChange={(e) => setEditClinicPhone(e.target.value)}
                      placeholder="Nhập số điện thoại..."
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-700 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Giờ mở cửa</label>
                    <input
                      type="text"
                      value={editClinicHours}
                      onChange={(e) => setEditClinicHours(e.target.value)}
                      placeholder="Ví dụ: 09:00 - 21:00 (Mỗi ngày)"
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-700 font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 font-semibold transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-amber-900/15"
                >
                  <Save className="h-4 w-4" />
                  Lưu thay đổi
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </header>
  );
}
