import React, { useState, useEffect, useRef } from 'react';
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
  AlertCircle,
  ShieldAlert,
  Target
} from 'lucide-react';
import { Appointment, Technician, CRMTask, ClinicProfile, ServiceItem } from '../types';
import { REVENUE_WEEK_DATA } from '../data';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../utils/firebase';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';

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
    dailyTarget?: number;
  };
  appointments: Appointment[];
  technicians: Technician[];
  crmTasks: CRMTask[];
  onUpdateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  onCompleteTask: (id: string) => void;
  onNavigate: (tab: string) => void;
  clinicProfile?: ClinicProfile;
  services?: ServiceItem[];
}

export default function DashboardView({
  stats,
  appointments,
  technicians,
  crmTasks,
  onUpdateAppointmentStatus,
  onCompleteTask,
  onNavigate,
  clinicProfile,
  services
}: DashboardViewProps) {
  const [localStats, setLocalStats] = useState(stats);
  const [timePeriod, setTimePeriod] = useState<'day' | 'month'>('month');

  const dailyTargetVal = localStats.dailyRevenueTarget || localStats.dailyTarget || 550000000;
  const isKpiDeficit = localStats.revenue < dailyTargetVal * 0.8;
  const kpiPercentage = Math.round((localStats.revenue / dailyTargetVal) * 1000) / 10;

  // Additional target calculations requested by user
  const appointmentsTodayVal = localStats.appointmentsToday || 32;
  const dailyVisitsTargetVal = (localStats as any).dailyVisitsTarget || 40;
  const dailyVisitsPercentage = Math.round((appointmentsTodayVal / dailyVisitsTargetVal) * 1000) / 10;

  const monthlyRevenueVal = (localStats as any).monthlyRevenue || 10712500000;
  const monthlyTargetVal = (localStats as any).monthlyRevenueTarget || (localStats as any).monthlyTarget || 12000000000;
  const monthlyRevenuePercentage = Math.round((monthlyRevenueVal / monthlyTargetVal) * 1000) / 10;

  const monthlyVisitsVal = (localStats as any).monthlyVisits || 850;
  const monthlyVisitsTargetVal = (localStats as any).monthlyVisitsTarget || 1000;
  const monthlyVisitsPercentage = Math.round((monthlyVisitsVal / monthlyVisitsTargetVal) * 1000) / 10;

  // Sync with prop when parent updates
  useEffect(() => {
    setLocalStats(prev => ({
      ...prev,
      ...stats
    }));
  }, [stats]);

  // Listen to Firestore stats/daily doc for real-time updates
  useEffect(() => {
    const docRef = doc(db, 'stats', 'daily');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLocalStats(prev => ({
          ...prev,
          ...data
        }));
      }
    }, (err) => {
      console.error('Lỗi lắng nghe Firestore stats/daily:', err);
    });

    return () => unsubscribe();
  }, []);

  // Real-time synchronization change indicators
  const [isRevenueFlashed, setIsRevenueFlashed] = useState(false);
  const [isAppointmentsFlashed, setIsAppointmentsFlashed] = useState(false);
  const [isNewCustomersFlashed, setIsNewCustomersFlashed] = useState(false);

  const prevRevenueRef = useRef<number>(localStats.revenue);
  const prevAppointmentsRef = useRef<number>(localStats.appointmentsToday);
  const prevNewCustomersRef = useRef<number>(localStats.newCustomers);

  useEffect(() => {
    if (localStats.revenue !== prevRevenueRef.current) {
      setIsRevenueFlashed(true);
      const timer = setTimeout(() => setIsRevenueFlashed(false), 2000);
      prevRevenueRef.current = localStats.revenue;
      return () => clearTimeout(timer);
    }
  }, [localStats.revenue]);

  useEffect(() => {
    if (localStats.appointmentsToday !== prevAppointmentsRef.current) {
      setIsAppointmentsFlashed(true);
      const timer = setTimeout(() => setIsAppointmentsFlashed(false), 2000);
      prevAppointmentsRef.current = localStats.appointmentsToday;
      return () => clearTimeout(timer);
    }
  }, [localStats.appointmentsToday]);

  useEffect(() => {
    if (localStats.newCustomers !== prevNewCustomersRef.current) {
      setIsNewCustomersFlashed(true);
      const timer = setTimeout(() => setIsNewCustomersFlashed(false), 2000);
      prevNewCustomersRef.current = localStats.newCustomers;
      return () => clearTimeout(timer);
    }
  }, [localStats.newCustomers]);

  // Format currency
  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const getWeekdayName = (dateStr: string) => {
    try {
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) {
        return 'Thứ 4';
      }
      const day = dateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const weekdays = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      return weekdays[day];
    } catch {
      return 'Thứ 4';
    }
  };

  const liveWeeklyRevenue = React.useMemo(() => {
    const chartData = REVENUE_WEEK_DATA.map(day => ({
      ...day,
      visits: day.visits,
      revenue: day.revenue,
    }));

    appointments.forEach(appt => {
      if (appt.status === 'Hoàn thành') {
        const weekdayName = getWeekdayName(appt.date);
        const matchedDay = chartData.find(d => d.name === weekdayName);
        if (matchedDay) {
          const matchedService = services?.find(s => s.name === appt.serviceName);
          const price = matchedService ? matchedService.price : appt.price;
          matchedDay.revenue += price;
          matchedDay.visits += 1;
        }
      }
    });

    return chartData;
  }, [appointments, services]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-xl text-xs">
          <p className="font-bold text-amber-400 mb-1.5">{data.name}</p>
          <p className="font-medium text-slate-200">
            Doanh thu: <span className="font-bold text-white">{formatVND(data.revenue)}</span>
          </p>
          <p className="text-slate-400 mt-0.5">
            Lượt khách: <span className="font-semibold text-slate-300">{data.visits} lượt</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Filter today's active appointments
  const activeAppointments = appointments.filter(a => a.date === '2026-07-08');

  // Filter pending crm tasks
  const activeTasks = crmTasks.filter(t => t.status !== 'Đã hoàn thành').slice(0, 3);

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
            Hôm nay cơ sở có <span className="text-amber-400 font-semibold">{localStats.appointmentsToday} lịch hẹn</span> điều trị. Hãy kiểm tra phòng chuẩn bị đón khách VIP Nguyễn Phương Anh lúc 09:30 tại phòng VIP 1.
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
        appointments.filter(a => (a.status === 'Chờ phục vụ' || a.status === 'Đang thực hiện') && (a.date === '2026-07-08' || a.date === '2026-07-09')).length > 0 ||
        isKpiDeficit) && (
        <div id="dashboard-live-alerts" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* KPI Target deficit warning */}
          {isKpiDeficit && (
            <div id="kpi-warning-card" className="bg-rose-50/80 border border-rose-200/80 rounded-3xl p-5 shadow-md flex items-start gap-4 col-span-1 lg:col-span-2 animate-pulse-slow">
              <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-600 shrink-0 ring-4 ring-rose-500/5">
                <ShieldAlert className="h-6 w-6 animate-pulse text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-1">
                    <span>Cảnh báo hiệu suất KPI doanh thu ngày</span>
                  </h4>
                  <span className="px-2.5 py-0.5 bg-rose-500/20 rounded text-[9px] font-extrabold text-rose-800 border border-rose-500/35">
                    🚨 Dưới mức an toàn 80%
                  </span>
                </div>
                <p className="text-xs text-rose-900 mt-2 leading-relaxed">
                  Doanh thu thực tế hiện tại đạt <span className="font-extrabold text-rose-950 font-mono text-[13px]">{formatVND(localStats.revenue)}</span>, mới chỉ đạt <span className="font-extrabold text-rose-600 text-sm font-mono">{kpiPercentage}%</span> của chỉ tiêu KPI ngày (<span className="font-semibold text-slate-700 font-mono">{formatVND(dailyTargetVal)}</span>). 
                  Hiệu suất này thấp hơn mức an toàn tối thiểu <span className="font-bold text-rose-950">80%</span>. 
                  Hệ thống ghi nhận cơ sở còn thiếu <span className="font-extrabold text-rose-700 font-mono">{formatVND(Math.max(0, dailyTargetVal * 0.8 - localStats.revenue))}</span> nữa để đạt mức an toàn, và thiếu <span className="font-extrabold text-rose-700 font-mono">{formatVND(Math.max(0, dailyTargetVal - localStats.revenue))}</span> để hoàn thành 100% KPI ngày.
                  Vui lòng đẩy mạnh tư vấn chốt các gói liệu trình mới hoặc tăng cường cuộc gọi chăm sóc khách hàng hôm nay!
                </p>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  <button 
                    id="trigger-packages-sales"
                    onClick={() => onNavigate('customers')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-xl transition-all shadow-md shadow-rose-600/10 hover:shadow-lg"
                  >
                    Tư vấn chốt gói liệu trình
                  </button>
                  <button 
                    id="trigger-add-appointment"
                    onClick={() => onNavigate('appointments')}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-rose-400 text-[11px] font-bold rounded-xl transition-all shadow-sm"
                  >
                    Lên lịch hẹn mới
                  </button>
                  <button 
                    id="trigger-care-calls"
                    onClick={() => onNavigate('care')}
                    className="px-4 py-2 bg-white hover:bg-rose-100/50 text-rose-700 border border-rose-200 text-[11px] font-bold rounded-xl transition-all"
                  >
                    Thực hiện cuộc gọi chăm sóc
                  </button>
                </div>
              </div>
            </div>
          )}

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

      {/* Time Period Selector for Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 block animate-pulse"></span>
            Báo cáo phân tích hiệu năng Clinic
          </h2>
          <p className="text-[11px] text-slate-500">Cập nhật thực tế liên tục từ dữ liệu khách hàng & tích lũy cộng dồn thông minh</p>
        </div>
        <div className="inline-flex p-1 bg-slate-200/70 rounded-xl border border-slate-200 shadow-inner">
          <button
            onClick={() => setTimePeriod('day')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timePeriod === 'day' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Hôm nay (Hàng ngày)
          </button>
          <button
            onClick={() => setTimePeriod('month')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timePeriod === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Tháng này (Lũy kế tháng)
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div id="stats-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Doanh thu */}
        <div id="stat-card-revenue" className={`bg-white rounded-2xl p-6 border shadow-sm flex flex-col justify-between group transition-all duration-500 ${isRevenueFlashed ? 'border-amber-500 ring-4 ring-amber-500/10 bg-amber-50/20 scale-[1.02]' : (timePeriod === 'day' && isKpiDeficit ? 'border-rose-300 bg-rose-50/5 hover:border-rose-400' : 'border-slate-200/80 hover:border-amber-300 hover:shadow-md')}`}>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {timePeriod === 'month' ? 'Tổng doanh thu tháng' : 'Doanh thu hôm nay'}
              </span>
              {timePeriod === 'day' && isKpiDeficit && (
                <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-extrabold text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded animate-pulse">
                  <ShieldAlert className="h-3 w-3" />
                  Dưới 80% chỉ tiêu
                </span>
              )}
              {isRevenueFlashed && !isKpiDeficit && (
                <span className="text-[9px] font-bold text-amber-600 animate-pulse mt-0.5">
                  ● Đồng bộ Live
                </span>
              )}
            </div>
            <div className={`p-2.5 rounded-xl transition-colors ${isRevenueFlashed ? 'bg-amber-100 text-amber-700' : (timePeriod === 'day' && isKpiDeficit ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-100' : 'bg-amber-50 text-amber-600 group-hover:bg-amber-100')}`}>
              <DollarSign className={`h-4.5 w-4.5 ${isRevenueFlashed ? 'animate-spin' : ''}`} />
            </div>
          </div>
          <div className="mt-4">
            <p className={`text-xl font-extrabold tracking-tight leading-none transition-all duration-300 ${isRevenueFlashed ? 'text-amber-600 scale-105' : 'text-slate-900'}`}>
              {formatVND(timePeriod === 'month' ? (localStats as any).monthlyRevenue || 10712500000 : localStats.revenue)}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                +{localStats.revenueTrend}%
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {timePeriod === 'month' ? 'Lũy kế so với tháng trước' : 'Đồng bộ từ dữ liệu thực tế'}
              </span>
            </div>
          </div>
        </div>

        {/* Lịch hẹn */}
        <div id="stat-card-appointments" className={`bg-white rounded-2xl p-6 border shadow-sm flex flex-col justify-between group transition-all duration-500 ${isAppointmentsFlashed ? 'border-indigo-500 ring-4 ring-indigo-500/10 bg-indigo-50/20 scale-[1.02]' : 'border-slate-200/80 hover:border-indigo-300 hover:shadow-md'}`}>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {timePeriod === 'month' ? 'Lượt phục vụ tháng' : 'Lịch hẹn hôm nay'}
              </span>
              {isAppointmentsFlashed && (
                <span className="text-[9px] font-bold text-indigo-600 animate-pulse mt-0.5">
                  ● Mới cập nhật
                </span>
              )}
            </div>
            <div className={`p-2.5 rounded-xl transition-colors ${isAppointmentsFlashed ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'}`}>
              <Calendar className={`h-4.5 w-4.5 ${isAppointmentsFlashed ? 'animate-bounce' : ''}`} />
            </div>
          </div>
          <div className="mt-4">
            <p className={`text-xl font-extrabold tracking-tight leading-none transition-all duration-300 ${isAppointmentsFlashed ? 'text-indigo-600 scale-105' : 'text-slate-900'}`}>
              {timePeriod === 'month' ? `${(localStats as any).monthlyVisits || 850} Khách` : `${localStats.appointmentsToday} Khách`}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                {timePeriod === 'month' 
                  ? `Chỉ tiêu: ${monthlyVisitsTargetVal} lượt` 
                  : `Đã check-in: ${localStats.appointmentsCheckedIn}`}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {timePeriod === 'month' ? `Đạt ${monthlyVisitsPercentage}%` : 'Đang tiến hành'}
              </span>
            </div>
          </div>
        </div>

        {/* Khách hàng mới */}
        <div id="stat-card-new-customers" className={`bg-white rounded-2xl p-6 border shadow-sm flex flex-col justify-between group transition-all duration-500 ${isNewCustomersFlashed ? 'border-emerald-500 ring-4 ring-emerald-500/10 bg-emerald-50/20 scale-[1.02]' : 'border-slate-200/80 hover:border-emerald-300 hover:shadow-md'}`}>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {timePeriod === 'month' ? 'Khách hàng mới tháng' : 'Khách hàng mới hôm nay'}
              </span>
              {isNewCustomersFlashed && (
                <span className="text-[9px] font-bold text-emerald-600 animate-pulse mt-0.5">
                  ● Đã lưu Cloud
                </span>
              )}
            </div>
            <div className={`p-2.5 rounded-xl transition-colors ${isNewCustomersFlashed ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'}`}>
              <Users className={`h-4.5 w-4.5 ${isNewCustomersFlashed ? 'animate-pulse' : ''}`} />
            </div>
          </div>
          <div className="mt-4">
            <p className={`text-xl font-extrabold tracking-tight leading-none transition-all duration-300 ${isNewCustomersFlashed ? 'text-emerald-600 scale-105' : 'text-slate-900'}`}>
              {timePeriod === 'month' ? `${localStats.newCustomers} Thành viên` : `${Math.max(0, localStats.newCustomers - 119)} Thành viên`}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                +{localStats.newCustomersTrend}%
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {timePeriod === 'month' ? 'Tháng này' : 'Đăng ký mới trong ngày'}
              </span>
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
            <p className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">{localStats.retentionRate}%</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                +{localStats.retentionTrend}%
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Tích lũy thực tế theo ngày</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Dashboard Grid */}
      <div id="dashboard-main-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns */}
        <div id="dashboard-left-columns" className="lg:col-span-2 space-y-8">
          {/* Week Revenue Recharts Live Chart */}
          <div id="weekly-revenue-chart-card" className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 id="weekly-chart-title" className="text-sm font-bold text-slate-800">Biểu đồ doanh thu tuần (Thời gian thực)</h3>
                <p className="text-[10px] text-slate-400">Doanh thu điều trị tích hợp dữ liệu đồng bộ tức thời từ Firestore</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500 block"></span>
                  <span className="text-slate-500 font-medium text-[10px]">Doanh thu live (đ)</span>
                </div>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div id="recharts-chart-container" className="w-full h-56 select-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={liveWeeklyRevenue}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'monospace' }}
                    tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(0)}M` : value}
                  />
                  <RechartsTooltip 
                    content={<CustomTooltip />}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#d97706" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
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
          
          {/* KPI & Business Targets Monitor */}
          <div id="kpi-monitor-card" className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Target className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
              <div>
                <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider leading-none">Chỉ tiêu & KPI Mục tiêu</h3>
                <p className="text-[9px] text-slate-400 mt-1">Đo lường tiến độ kinh doanh thời gian thực</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Daily Revenue Target */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-end">
                  <span className="font-semibold text-slate-700 text-[10px]">Doanh thu Ngày</span>
                  <span className="font-mono text-[10px] font-bold text-amber-600">
                    {formatVND(localStats.revenue)} / <span className="text-slate-400">{formatVND(dailyTargetVal)}</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden relative border border-slate-200/60" title={`Mức đạt: ${kpiPercentage}% (Mức an toàn tối thiểu: 80%)`}>
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isKpiDeficit ? 'bg-gradient-to-r from-rose-500 to-rose-400' : 'bg-gradient-to-r from-amber-500 to-amber-400'}`} 
                    style={{ width: `${Math.min(100, kpiPercentage)}%` }}
                  />
                  {/* Visual safe line at 80% */}
                  <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-rose-600/60 z-10" />
                  <span className="absolute top-0 bottom-0 left-[81%] text-[8px] font-bold text-rose-700 flex items-center select-none pointer-events-none opacity-80">
                    80% An toàn
                  </span>
                </div>
                <div className="flex justify-between text-[8px] font-bold text-slate-400">
                  <span>Tiến độ thực tế</span>
                  <span>{kpiPercentage}%</span>
                </div>
              </div>

              {/* Daily Visits Target */}
              <div className="space-y-1.5 border-t border-slate-50 pt-3">
                <div className="flex justify-between items-end">
                  <span className="font-semibold text-slate-700 text-[10px]">Lượt khách Ngày</span>
                  <span className="font-mono text-[10px] font-bold text-sky-600">
                    {appointmentsTodayVal} lượt / <span className="text-slate-400">{dailyVisitsTargetVal} lượt</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-sky-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, dailyVisitsPercentage)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[8px] font-bold text-slate-400">
                  <span>Tiến độ thực tế</span>
                  <span>{dailyVisitsPercentage}%</span>
                </div>
              </div>

              {/* Monthly Revenue Target */}
              <div className="space-y-1.5 border-t border-slate-50 pt-3">
                <div className="flex justify-between items-end">
                  <span className="font-semibold text-slate-700 text-[10px]">Doanh thu Tháng</span>
                  <span className="font-mono text-[10px] font-bold text-emerald-600">
                    {formatVND(monthlyRevenueVal)} / <span className="text-slate-400">{formatVND(monthlyTargetVal)}</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, monthlyRevenuePercentage)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[8px] font-bold text-slate-400">
                  <span>Tiến độ thực tế</span>
                  <span>{monthlyRevenuePercentage}%</span>
                </div>
              </div>

              {/* Monthly Visits Target */}
              <div className="space-y-1.5 border-t border-slate-50 pt-3">
                <div className="flex justify-between items-end">
                  <span className="font-semibold text-slate-700 text-[10px]">Lượt khách Tháng</span>
                  <span className="font-mono text-[10px] font-bold text-indigo-600">
                    {monthlyVisitsVal} lượt / <span className="text-slate-400">{monthlyVisitsTargetVal} lượt</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, monthlyVisitsPercentage)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[8px] font-bold text-slate-400">
                  <span>Tiến độ thực tế</span>
                  <span>{monthlyVisitsPercentage}%</span>
                </div>
              </div>
            </div>
          </div>

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
