import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  Percent, 
  PhoneCall, 
  MessageSquare, 
  Gift, 
  Check, 
  Clock, 
  UserPlus, 
  ArrowUpRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Appointment, Technician, CRMTask, ClinicProfile } from '../types';
import { REVENUE_WEEK_DATA } from '../data';

interface DashboardViewProps {
  stats: {
    revenue: number;
    revenueTrend: number;
    appointmentsToday: number;
    appointmentsCheckedIn: number;
    newCustomers: number;
    newCustomersTrend: number;
    retentionRate: number;
    retentionTrend: number;
  };
  appointments: Appointment[];
  technicians: Technician[];
  crmTasks: CRMTask[];
  onUpdateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  onCompleteTask: (id: string) => void;
  onNavigate: (tab: string) => void;
  clinicProfile?: ClinicProfile;
}

export default function DashboardView({
  stats,
  appointments,
  technicians,
  crmTasks,
  onUpdateAppointmentStatus,
  onCompleteTask,
  onNavigate,
  clinicProfile
}: DashboardViewProps) {
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Format currency
  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  // Filter today's active appointments
  const activeAppointments = appointments.filter(a => a.date === '2026-07-08');

  // Filter pending crm tasks
  const activeTasks = crmTasks.filter(t => t.status !== 'Đã hoàn thành').slice(0, 3);

  // SVG Chart configurations
  const maxRevenue = Math.max(...REVENUE_WEEK_DATA.map(d => d.revenue));
  const chartHeight = 160;
  const padding = 20;

  return (
    <div id="dashboard-view-root" className="space-y-8 animate-fade-in">
      {/* Greeting Banner */}
      <div id="dashboard-greeting-banner" className="relative bg-slate-900 rounded-3xl p-8 text-white overflow-hidden shadow-xl border border-slate-800">
        {/* Background glow effects */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 -bottom-20 w-80 h-80 bg-slate-800/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold">Hệ thống Premium CRM v2.1</span>
          </div>
          <h1 id="greeting-title" className="text-2xl font-bold tracking-tight text-white mb-2">
            Chào buổi sáng, {clinicProfile?.managerName || 'Anh'}.
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Hôm nay cơ sở có <span className="text-amber-400 font-semibold">{stats.appointmentsToday} lịch hẹn</span> điều trị. Hãy kiểm tra phòng chuẩn bị đón khách VIP Nguyễn Phương Anh lúc 09:30 tại phòng VIP 1.
          </p>
          <div className="mt-6 flex gap-3">
            <button 
              id="dash-quick-booking-btn"
              onClick={() => onNavigate('appointments')}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02]"
            >
              Đặt lịch mới
            </button>
            <button 
              id="dash-quick-customers-btn"
              onClick={() => onNavigate('customers')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
            >
              Xem khách hàng
            </button>
          </div>
        </div>

        {/* Floating Korean Spa aesthetic illustration placeholder */}
        <div className="absolute right-12 bottom-0 top-0 w-80 hidden xl:flex items-center justify-end">
          <img 
            src={clinicProfile?.dashboardImageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBYFpco8GVUNjAdNMEDCeaGaf3GAI8Heo3rxuWTy-fmPBVUKdjS4wSvY7UyXgsYqzdtWHjS7kLMzUObGhLeIz3VVpo52aimkW2CTCDnwH3Or-MS-sc7YFVspgAVPBHboflWr54BitxOub8d_NlfhojZyud-s4Pj3S1cT5Z0tJI5D-525A5WjyNjXDa_9zsZfyBja9onbsjfFM8apk8AdAsEW_QnjhboL2AeT1x8tCursXdY_sTCOWh8rA"} 
            alt="Clinic Aesthetic View" 
            className="h-32 w-auto object-cover rounded-2xl border border-slate-800/80 shadow-2xl rotate-2 opacity-80 max-h-[140px]"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Dynamic Alerts & Reminders Section */}
      {(crmTasks.filter(t => t.status !== 'Đã hoàn thành' && t.dueDate < '2026-07-08').length > 0 || 
        crmTasks.filter(t => t.status !== 'Đã hoàn thành' && t.dueDate >= '2026-07-08' && t.dueDate <= '2026-07-11').length > 0 ||
        appointments.filter(a => (a.status === 'Chờ phục vụ' || a.status === 'Đang thực hiện') && (a.date === '2026-07-08' || a.date === '2026-07-09')).length > 0) && (
        <div id="dashboard-live-alerts" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overdue Warnings */}
          {crmTasks.filter(t => t.status !== 'Đã hoàn thành' && t.dueDate < '2026-07-08').length > 0 && (
            <div id="overdue-alerts-card" className="bg-rose-50/50 border border-rose-100 rounded-3xl p-5 shadow-sm flex items-start gap-3.5">
              <div className="p-2.5 bg-rose-500/10 rounded-2xl text-rose-600 shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider">Cảnh báo tác vụ chưa hoàn thành (Quá hạn)</h4>
                <p className="text-xs text-rose-700/90 mt-1.5 leading-relaxed">
                  Phát hiện <span className="font-bold text-rose-900">{crmTasks.filter(t => t.status !== 'Đã hoàn thành' && t.dueDate < '2026-07-08').length} tác vụ chăm sóc</span> quá hạn liên hệ phản hồi hoặc nhắc nhở phục hồi. Vui lòng hoàn thành để không ảnh hưởng đến trải nghiệm khách hàng.
                </p>
                <div className="mt-3.5 flex gap-2">
                  <button 
                    id="resolve-overdue-btn"
                    onClick={() => onNavigate('care')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-xl transition-colors shadow-sm shadow-rose-600/10"
                  >
                    Xử lý chăm sóc khách hàng
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Reminders */}
          {(crmTasks.filter(t => t.status !== 'Đã hoàn thành' && t.dueDate >= '2026-07-08' && t.dueDate <= '2026-07-11').length > 0 ||
            appointments.filter(a => (a.status === 'Chờ phục vụ' || a.status === 'Đang thực hiện') && (a.date === '2026-07-08' || a.date === '2026-07-09')).length > 0) && (
            <div id="upcoming-reminders-card" className="bg-amber-50/50 border border-amber-100 rounded-3xl p-5 shadow-sm flex items-start gap-3.5">
              <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-600 shrink-0">
                <Clock className="h-5 w-5 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">Nhắc nhanh tác vụ & lịch hẹn sắp đến</h4>
                <p className="text-xs text-amber-700/90 mt-1.5 leading-relaxed">
                  Có <span className="font-bold text-amber-900">{crmTasks.filter(t => t.status !== 'Đã hoàn thành' && t.dueDate >= '2026-07-08' && t.dueDate <= '2026-07-11').length} tác vụ chăm sóc</span> và <span className="font-bold text-amber-900">{appointments.filter(a => (a.status === 'Chờ phục vụ' || a.status === 'Đang thực hiện') && (a.date === '2026-07-08' || a.date === '2026-07-09')).length} lịch hẹn</span> hôm nay và 3 ngày tới sắp đến hạn cần chuẩn bị phòng máy & kỹ thuật viên đón tiếp.
                </p>
                <div className="mt-3.5 flex gap-2">
                  <button 
                    id="view-reminders-btn"
                    onClick={() => onNavigate('care')}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 text-[11px] font-bold rounded-xl transition-colors"
                  >
                    Mở bảng Care & Nhắc nhở
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4 Stats Cards */}
      <div id="stats-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Doanh thu */}
        <div id="stat-card-revenue" className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between group hover:border-amber-300 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng doanh thu</span>
            <div className="p-2.5 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
              <DollarSign className="h-4.5 w-4.5 text-amber-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">{formatVND(stats.revenue)}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                +{stats.revenueTrend}%
              </span>
              <span className="text-[10px] text-slate-400 font-medium">So với tháng trước</span>
            </div>
          </div>
        </div>

        {/* Lịch hẹn */}
        <div id="stat-card-appointments" className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between group hover:border-amber-300 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lịch hẹn hôm nay</span>
            <div className="p-2.5 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
              <Calendar className="h-4.5 w-4.5 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">{stats.appointmentsToday} Khách</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                Đã check-in: {stats.appointmentsCheckedIn}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Đang tiến hành</span>
            </div>
          </div>
        </div>

        {/* Khách hàng mới */}
        <div id="stat-card-new-customers" className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between group hover:border-amber-300 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Khách hàng mới</span>
            <div className="p-2.5 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
              <Users className="h-4.5 w-4.5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">{stats.newCustomers} Thành viên</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                +{stats.newCustomersTrend}%
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Tháng này</span>
            </div>
          </div>
        </div>

        {/* Tỷ lệ quay lại */}
        <div id="stat-card-retention" className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between group hover:border-amber-300 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tỷ lệ quay lại</span>
            <div className="p-2.5 bg-rose-50 rounded-xl group-hover:bg-rose-100 transition-colors">
              <Percent className="h-4.5 w-4.5 text-rose-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">{stats.retentionRate}%</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                +{stats.retentionTrend}%
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Tăng trưởng đều</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Dashboard Grid */}
      <div id="dashboard-main-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns */}
        <div id="dashboard-left-columns" className="lg:col-span-2 space-y-8">
          {/* Week Revenue SVG Chart */}
          <div id="weekly-revenue-chart-card" className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 id="weekly-chart-title" className="text-sm font-bold text-slate-800">Biểu đồ doanh thu tuần</h3>
                <p className="text-[10px] text-slate-400">Doanh thu điều trị theo các ngày trong tuần</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500 block"></span>
                  <span className="text-slate-500 font-medium">Doanh thu (đ)</span>
                </div>
              </div>
            </div>

            {/* Custom Interactive SVG Chart */}
            <div id="svg-chart-container" className="relative w-full h-48 select-none">
              <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
                {/* Horizontal gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                  const y = padding + (chartHeight - padding * 2) * ratio;
                  const labelVal = Math.round(maxRevenue * (1 - ratio));
                  return (
                    <g key={index}>
                      <line 
                        x1="45" 
                        y1={y} 
                        x2="490" 
                        y2={y} 
                        stroke="#f1f5f9" 
                        strokeWidth="1" 
                        strokeDasharray={index === 4 ? "0" : "4 4"} 
                      />
                      <text 
                        x="5" 
                        y={y + 4} 
                        fill="#94a3b8" 
                        className="text-[9px] font-mono font-medium"
                      >
                        {labelVal >= 1000000 ? `${(labelVal / 1000000).toFixed(0)}M` : labelVal}
                      </text>
                    </g>
                  );
                })}

                {/* Bars or Areas */}
                {REVENUE_WEEK_DATA.map((item, index) => {
                  const barWidth = 28;
                  const xGridSpacing = (490 - 45) / 6;
                  const x = 45 + xGridSpacing * index + (xGridSpacing - barWidth) / 2;
                  
                  // Calculate dynamic Y coordinate
                  const height = ((item.revenue) / maxRevenue) * (chartHeight - padding * 2);
                  const y = chartHeight - padding - height;

                  const isHovered = hoveredBarIndex === index;

                  return (
                    <g key={index}>
                      {/* Interactive Bar */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={height}
                        rx="6"
                        fill={isHovered ? 'url(#amberGradHover)' : 'url(#amberGrad)'}
                        className="transition-all duration-300 cursor-pointer"
                        onMouseEnter={() => setHoveredBarIndex(index)}
                        onMouseLeave={() => setHoveredBarIndex(null)}
                      />
                      {/* Day Label */}
                      <text
                        x={x + barWidth / 2}
                        y={chartHeight - 4}
                        textAnchor="middle"
                        fill={isHovered ? '#b45309' : '#64748b'}
                        className="text-[9px] font-sans font-semibold transition-colors duration-200"
                      >
                        {item.name}
                      </text>
                    </g>
                  );
                })}

                {/* Gradients */}
                <defs>
                  <linearGradient id="amberGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="0.2" />
                  </linearGradient>
                  <linearGradient id="amberGradHover" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#b45309" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Dynamic Overlay Hover Tooltip */}
              {hoveredBarIndex !== null && (
                <div 
                  className="absolute bg-slate-900 text-white rounded-xl p-2.5 shadow-xl text-[10px] pointer-events-none transition-all duration-200"
                  style={{
                    left: `${((hoveredBarIndex * (445 / 6) + 65) / 500) * 100}%`,
                    top: `10px`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <p className="font-bold text-amber-400">{REVENUE_WEEK_DATA[hoveredBarIndex].name}</p>
                  <p className="font-mono text-slate-200 mt-0.5">Doanh thu: <span className="font-bold">{formatVND(REVENUE_WEEK_DATA[hoveredBarIndex].revenue)}</span></p>
                  <p className="text-slate-400 mt-0.5">Lượt khách: {REVENUE_WEEK_DATA[hoveredBarIndex].visits} lượt</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Appointments List */}
          <div id="upcoming-appointments-card" className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 id="upcoming-appts-title" className="text-sm font-bold text-slate-800">Lịch hẹn sắp tới</h3>
                <p className="text-[10px] text-slate-400">Danh sách các ca điều trị hôm nay ({activeAppointments.length} lịch hẹn)</p>
              </div>
              <button 
                id="dash-view-all-appointments"
                onClick={() => onNavigate('appointments')}
                className="text-[10px] text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 transition-colors"
              >
                Xem tất cả lịch hẹn
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table id="appointments-dashboard-table" className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Khách hàng</th>
                    <th className="pb-3 font-semibold">Dịch vụ điều trị</th>
                    <th className="pb-3 font-semibold">Bác sĩ / KTV</th>
                    <th className="pb-3 font-semibold">Thời gian</th>
                    <th className="pb-3 font-semibold">Trạng thái</th>
                    <th className="pb-3 font-semibold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {activeAppointments.map((appt) => (
                    <tr id={`appt-row-${appt.id}`} key={appt.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-3.5 pr-2">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={appt.customerAvatar} 
                            alt={appt.customerName} 
                            className="h-8.5 w-8.5 rounded-full object-cover border border-slate-100"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">{appt.customerName}</p>
                            <p className="text-[10px] text-slate-400 font-medium font-mono">{appt.customerPhone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-2 font-medium text-slate-800 max-w-[150px] truncate">
                        {appt.serviceName}
                      </td>
                      <td className="py-3.5 pr-2 text-slate-500 font-medium">
                        {appt.technicianName}
                      </td>
                      <td className="py-3.5 pr-2">
                        <span className="font-bold text-slate-800 font-mono">{appt.time}</span>
                        <span className="text-[9px] text-slate-400 block font-semibold uppercase">{appt.date === '2026-07-08' ? 'Hôm nay' : appt.date}</span>
                      </td>
                      <td className="py-3.5 pr-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold leading-none ${
                          appt.status === 'Hoàn thành' ? 'bg-emerald-50 text-emerald-700' :
                          appt.status === 'Đang thực hiện' ? 'bg-amber-50 text-amber-700' :
                          appt.status === 'Chờ phục vụ' ? 'bg-sky-50 text-sky-700' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          {appt.status === 'Chờ phục vụ' && (
                            <button
                              id={`btn-appt-start-${appt.id}`}
                              onClick={() => onUpdateAppointmentStatus(appt.id, 'Đang thực hiện')}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[10px] rounded-lg transition-colors"
                            >
                              Phục vụ
                            </button>
                          )}
                          {appt.status === 'Đang thực hiện' && (
                            <button
                              id={`btn-appt-done-${appt.id}`}
                              onClick={() => onUpdateAppointmentStatus(appt.id, 'Hoàn thành')}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded-lg transition-colors"
                            >
                              Hoàn thành
                            </button>
                          )}
                          {appt.status !== 'Hoàn thành' && appt.status !== 'Đã huỷ' && (
                            <button
                              id={`btn-appt-cancel-${appt.id}`}
                              onClick={() => onUpdateAppointmentStatus(appt.id, 'Đã huỷ')}
                              className="px-1.5 py-1 text-rose-500 hover:bg-rose-50 font-medium text-[10px] rounded-lg transition-colors"
                            >
                              Huỷ
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Column - Tasks & Active Techs */}
        <div id="dashboard-right-column" className="space-y-8">
          
          {/* CRM / Customer Care Tasks list */}
          <div id="crm-tasks-card" className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 id="crm-tasks-title" className="text-sm font-bold text-slate-800">Việc cần chăm sóc</h3>
                <p className="text-[10px] text-slate-400">Yêu cầu liên hệ, nhắc hẹn, chúc mừng</p>
              </div>
              <button 
                id="dash-view-all-care"
                onClick={() => onNavigate('care')}
                className="text-[10px] text-amber-600 hover:text-amber-700 font-bold flex items-center gap-0.5 transition-colors"
              >
                Tất cả việc
              </button>
            </div>

            <div className="space-y-4">
              {activeTasks.map((task) => (
                <div 
                  id={`dashboard-task-item-${task.id}`}
                  key={task.id} 
                  className="p-4 rounded-xl border border-slate-100 hover:border-amber-200 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <img 
                      src={task.customerAvatar} 
                      alt={task.customerName} 
                      className="h-8.5 w-8.5 rounded-full object-cover border border-slate-100 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <p className="text-xs font-bold text-slate-900 truncate leading-none">{task.customerName}</p>
                        <span className={`inline-block px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide rounded ${
                          task.type === 'Sau liệu trình' ? 'bg-indigo-50 text-indigo-700' :
                          task.type === 'Nhắc lịch dặm' ? 'bg-amber-50 text-amber-700' :
                          task.type === 'Sinh nhật' ? 'bg-rose-50 text-rose-700' :
                          'bg-emerald-50 text-emerald-700'
                        }`}>
                          {task.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2 font-medium leading-relaxed line-clamp-2">
                        {task.description}
                      </p>

                      <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[9px] text-slate-400 font-medium flex items-center gap-1 font-mono">
                          <Clock className="h-3 w-3 text-slate-400" />
                          Hạn: {task.dueDate}
                        </span>
                        
                        <div className="flex gap-1">
                          {task.type === 'Sau liệu trình' && (
                            <button
                              id={`btn-task-call-${task.id}`}
                              onClick={() => {
                                alert(`Đang khởi tạo cuộc gọi đến ${task.customerName} (${task.customerPhone})...`);
                                onCompleteTask(task.id);
                              }}
                              className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors flex items-center gap-1 text-[9px] font-bold"
                            >
                              <PhoneCall className="h-3 w-3" />
                              Gọi điện
                            </button>
                          )}
                          {task.type === 'Nhắc lịch dặm' && (
                            <button
                              id={`btn-task-sms-${task.id}`}
                              onClick={() => {
                                alert(`Đang chuẩn bị gửi tin nhắn nhắc lịch dặm Meso đến ${task.customerName}...`);
                                onCompleteTask(task.id);
                              }}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors flex items-center gap-1 text-[9px] font-bold"
                            >
                              <MessageSquare className="h-3 w-3" />
                              SMS
                            </button>
                          )}
                          {task.type === 'Sinh nhật' && (
                            <button
                              id={`btn-task-gift-${task.id}`}
                              onClick={() => {
                                alert(`Mã Voucher 10.000.000đ đã được gửi chúc mừng sinh nhật chị ${task.customerName}!`);
                                onCompleteTask(task.id);
                              }}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors flex items-center gap-1 text-[9px] font-bold"
                            >
                              <Gift className="h-3 w-3" />
                              Gửi quà
                            </button>
                          )}
                          <button
                            id={`btn-task-done-${task.id}`}
                            onClick={() => onCompleteTask(task.id)}
                            className="p-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-500 rounded-lg transition-all"
                            title="Hoàn thành việc"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Technicians */}
          <div id="technicians-card" className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 id="technicians-title" className="text-sm font-bold text-slate-800">Kỹ thuật viên</h3>
                <p className="text-[10px] text-slate-400">Trạng thái phòng máy và clinicians</p>
              </div>
              <button 
                id="dash-view-all-staff"
                onClick={() => onNavigate('staff')}
                className="text-[10px] text-amber-600 hover:text-amber-700 font-bold transition-colors"
              >
                Xem chi tiết
              </button>
            </div>

            <div className="space-y-4">
              {technicians.slice(0, 4).map((tech) => (
                <div id={`dashboard-tech-item-${tech.id}`} key={tech.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img 
                        src={tech.avatar} 
                        alt={tech.name} 
                        className="h-9 w-9 rounded-full object-cover border border-slate-100"
                        referrerPolicy="no-referrer"
                      />
                      <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                        tech.status === 'Sẵn sàng' ? 'bg-emerald-500' :
                        tech.status === 'Đang bận' ? 'bg-amber-500' :
                        'bg-slate-400'
                      }`}></span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-none">{tech.name}</p>
                      <p className="text-[9px] text-slate-400 font-semibold mt-1 truncate max-w-[130px]">{tech.role}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {tech.status === 'Đang bận' ? (
                      <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                        {tech.currentRoom || 'Bận'}
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Trống lịch
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
