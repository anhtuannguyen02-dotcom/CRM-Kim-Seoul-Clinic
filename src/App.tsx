import React, { useState, useEffect } from 'react';
import { 
  Customer, 
  Appointment, 
  Technician, 
  CRMTask, 
  Promotion, 
  ServiceItem 
} from './types';
import { 
  INITIAL_SERVICES, 
  INITIAL_TECHNICIANS, 
  INITIAL_CUSTOMERS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_CRM_TASKS, 
  INITIAL_PROMOTIONS, 
  DAILY_STATS 
} from './data';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardView from './components/DashboardView';
import AppointmentsView from './components/AppointmentsView';
import CustomersView from './components/CustomersView';
import CareView from './components/CareView';
import PromotionsView from './components/PromotionsView';
import StaffView from './components/StaffView';
import SettingsView from './components/SettingsView';

import { Sparkles, Key, UserCheck, ShieldAlert, Clock } from 'lucide-react';

export default function App() {
  // Login State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('kimseoul_logged_in');
    return saved === 'true';
  });

  const [username, setUsername] = useState('Phạm Minh Anh');
  const [password, setPassword] = useState('••••••••');
  const [loginError, setLoginError] = useState('');

  // Main UI States
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [notificationsCount, setNotificationsCount] = useState<number>(3);

  // Core Data States (load from localStorage or default to initial data)
  const [services, setServices] = useState<ServiceItem[]>(() => {
    const saved = localStorage.getItem('kimseoul_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [technicians, setTechnicians] = useState<Technician[]>(() => {
    const saved = localStorage.getItem('kimseoul_technicians');
    return saved ? JSON.parse(saved) : INITIAL_TECHNICIANS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('kimseoul_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('kimseoul_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [crmTasks, setCrmTasks] = useState<CRMTask[]>(() => {
    const saved = localStorage.getItem('kimseoul_crm_tasks');
    return saved ? JSON.parse(saved) : INITIAL_CRM_TASKS;
  });

  const [promotions, setPromotions] = useState<Promotion[]>(() => {
    const saved = localStorage.getItem('kimseoul_promotions');
    return saved ? JSON.parse(saved) : INITIAL_PROMOTIONS;
  });

  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('kimseoul_stats');
    return saved ? JSON.parse(saved) : DAILY_STATS;
  });

  // Save states to localStorage upon changes
  useEffect(() => {
    localStorage.setItem('kimseoul_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('kimseoul_technicians', JSON.stringify(technicians));
  }, [technicians]);

  useEffect(() => {
    localStorage.setItem('kimseoul_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('kimseoul_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('kimseoul_crm_tasks', JSON.stringify(crmTasks));
  }, [crmTasks]);

  useEffect(() => {
    localStorage.setItem('kimseoul_promotions', JSON.stringify(promotions));
  }, [promotions]);

  useEffect(() => {
    localStorage.setItem('kimseoul_stats', JSON.stringify(stats));
  }, [stats]);

  // Handle Login Action
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === '') {
      setLoginError('Vui lòng điền tên đăng nhập.');
      return;
    }
    setIsLoggedIn(true);
    localStorage.setItem('kimseoul_logged_in', 'true');
    setLoginError('');
  };

  // Handle Logout Action
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('kimseoul_logged_in');
  };

  // Clear topbar notifications
  const clearNotifications = () => {
    setNotificationsCount(0);
  };

  // Add Appointment
  const handleAddAppointment = (newAppt: Omit<Appointment, 'id'>) => {
    const appt: Appointment = {
      ...newAppt,
      id: `appt_${Date.now()}`
    };

    const updatedAppts = [appt, ...appointments];
    setAppointments(updatedAppts);

    // Increment today's stats if scheduled for today
    if (appt.date === '2026-07-08') {
      setStats(prev => ({
        ...prev,
        appointmentsToday: prev.appointmentsToday + 1,
        revenue: prev.revenue + appt.price
      }));
    }

    setNotificationsCount(prev => prev + 1);
  };

  // Update Appointment Status
  const handleUpdateAppointmentStatus = (id: string, status: Appointment['status']) => {
    const previousAppt = appointments.find(a => a.id === id);
    const updated = appointments.map(appt => {
      if (appt.id === id) {
        return { ...appt, status };
      }
      return appt;
    });
    setAppointments(updated);

    // Update daily stats check-ins
    if (status === 'Đang thực hiện' && previousAppt?.status === 'Chờ phục vụ') {
      setStats(prev => ({
        ...prev,
        appointmentsCheckedIn: prev.appointmentsCheckedIn + 1
      }));
    }
  };

  // Add Customer
  const handleAddCustomer = (newCust: Omit<Customer, 'id' | 'totalSpent' | 'totalVisits' | 'treatmentHistory' | 'activePackages' | 'beforeAfterImages'>) => {
    const cust: Customer = {
      ...newCust,
      id: `cust_${Date.now()}`,
      totalSpent: 0,
      totalVisits: 0,
      treatmentHistory: [],
      activePackages: [],
      beforeAfterImages: []
    };

    setCustomers([cust, ...customers]);
    setStats(prev => ({
      ...prev,
      newCustomers: prev.newCustomers + 1
    }));
  };

  // Complete CRM Task
  const handleCompleteTask = (id: string) => {
    setCrmTasks(crmTasks.map(task => {
      if (task.id === id) {
        return { ...task, status: 'Đã hoàn thành' };
      }
      return task;
    }));
  };

  // Add log to CRM Care Task
  const handleAddCareLog = (taskId: string, log: { note: string; channel: 'Gọi điện' | 'SMS' | 'Zalo' }) => {
    setCrmTasks(crmTasks.map(task => {
      if (task.id === taskId) {
        const loggedInteractions = task.loggedInteractions || [];
        return {
          ...task,
          status: 'Đã hoàn thành', // Auto complete upon logging result
          loggedInteractions: [
            {
              date: new Date().toLocaleDateString('vi-VN'),
              ...log
            },
            ...loggedInteractions
          ]
        };
      }
      return task;
    }));
  };

  // Add log to Customer detail profile treatment history
  const handleAddCustomerTreatmentNote = (customerId: string, note: string, serviceName: string, technician: string) => {
    setCustomers(customers.map(c => {
      if (c.id === customerId) {
        const treatmentHistory = c.treatmentHistory || [];
        const servicePrice = services.find(s => s.name === serviceName)?.price || 0;
        return {
          ...c,
          totalVisits: c.totalVisits + 1,
          totalSpent: c.totalSpent + servicePrice,
          treatmentHistory: [
            {
              id: `th_${Date.now()}`,
              date: new Date().toLocaleDateString('vi-VN'),
              serviceName,
              technician,
              note,
              status: 'Hoàn thành' as const
            },
            ...treatmentHistory
          ]
        };
      }
      return c;
    }));
  };

  // Add Promotion Voucher
  const handleAddPromotion = (newPromo: Omit<Promotion, 'id' | 'usageCount'>) => {
    const promo: Promotion = {
      ...newPromo,
      id: `promo_${Date.now()}`,
      usageCount: 0
    };
    setPromotions([promo, ...promotions]);
  };

  // Update promotion status
  const handleUpdatePromoStatus = (id: string, status: Promotion['status']) => {
    setPromotions(promotions.map(p => {
      if (p.id === id) {
        return { ...p, status };
      }
      return p;
    }));
  };

  // Add Staff Clinician
  const handleAddStaff = (newStaff: Omit<Technician, 'id' | 'completedJobs' | 'rating'>) => {
    const staff: Technician = {
      ...newStaff,
      id: `tech_${Date.now()}`,
      completedJobs: 0,
      rating: 5.0
    };
    setTechnicians([staff, ...technicians]);
  };

  // Update clinician status
  const handleUpdateTechStatus = (id: string, status: Technician['status']) => {
    setTechnicians(technicians.map(t => {
      if (t.id === id) {
        return { ...t, status };
      }
      return t;
    }));
  };

  // Add Service Item
  const handleAddService = (newSrv: Omit<ServiceItem, 'id'>) => {
    const srv: ServiceItem = {
      ...newSrv,
      id: `srv_${Date.now()}`
    };
    setServices([...services, srv]);
  };

  // Update Service Price
  const handleUpdateServicePrice = (id: string, price: number) => {
    setServices(services.map(s => {
      if (s.id === id) {
        return { ...s, price };
      }
      return s;
    }));
  };

  // Render view depending on active tab
  const renderView = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView
            stats={stats}
            appointments={appointments}
            technicians={technicians}
            crmTasks={crmTasks}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            onCompleteTask={handleCompleteTask}
            onNavigate={setCurrentTab}
          />
        );
      case 'appointments':
        return (
          <AppointmentsView
            appointments={appointments}
            customers={customers}
            services={services}
            technicians={technicians}
            onAddAppointment={handleAddAppointment}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
          />
        );
      case 'customers':
        return (
          <CustomersView
            customers={customers}
            onAddCustomer={handleAddCustomer}
            onAddTreatmentNote={handleAddCustomerTreatmentNote}
          />
        );
      case 'care':
        return (
          <CareView
            crmTasks={crmTasks}
            onCompleteTask={handleCompleteTask}
            onAddLog={handleAddCareLog}
          />
        );
      case 'promotions':
        return (
          <PromotionsView
            promotions={promotions}
            onAddPromotion={handleAddPromotion}
            onUpdatePromoStatus={handleUpdatePromoStatus}
          />
        );
      case 'staff':
        return (
          <StaffView
            technicians={technicians}
            onUpdateTechStatus={handleUpdateTechStatus}
            onAddStaff={handleAddStaff}
          />
        );
      case 'settings':
        return (
          <SettingsView
            services={services}
            onUpdateServicePrice={handleUpdateServicePrice}
            onAddService={handleAddService}
          />
        );
      default:
        return <div className="text-center py-12 text-slate-400">Đang cập nhật...</div>;
    }
  };

  // IF NOT LOGGED IN, RENDER THE PREMIUM SPA LOGIN PORTAL
  if (!isLoggedIn) {
    return (
      <div 
        id="login-bg-portal"
        className="min-h-screen bg-cover bg-center flex items-center justify-center p-6 select-none font-sans relative"
        style={{ 
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.75)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuCHMVY2FJlSE3qrgasqg1uEOIDA4FflIDQHw5xFjRl51gxQqfsYVTC_XG8Fgj8v0-HjX6dmu--qabI6lvE8h2AnlFVQQkuqc_sXZdM8z8kuONeNENCiZJK0qPCwgGwJwywVWGmiWRozLmLHYZgPczy7TxAl0WTWQYUxsMzRvEScxUje0bYqFaeTHaTOx-BZjsvvxS4zi1UPAU2GFNxxXA4r6Y8pvxAHFQ9OtuAQBPZVX2yawaoEflMWoQ')`
        }}
      >
        <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
          <img 
            id="login-bg-logo"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9lWUDJ3O5naySwCalAe_Vokbm8JC-rAXwCklB42fzS0uaCutuIEMjj8Psb7wPTktg3efiYVXNonj7kBk2-T2Y8_kcl03iTqitJP0B4bZCWAzy5S_0iW-j8csVI3ijVExl2cC74p7qyNgKXAhIhE18R_V9A4WznK6iN69rzwo3isWgXHyuzlr8d7XMfXAnncICex_okKOllYUNq6wXYk0X0WAaxl_SR_tp7v7y3zcJMASpZR8dsLb19U6xd1o80faAiFo" 
            alt="Kim Seoul Clinic Header Logo" 
            className="h-20 w-auto object-contain filter invert-0 brightness-125 drop-shadow-lg"
            referrerPolicy="no-referrer"
          />
        </div>

        <div 
          id="login-card-container"
          className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-2xl space-y-6"
        >
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-amber-600 block mb-1">Premium Portal</span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Hệ Thống Đăng Nhập CRM</h2>
            <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">Chào mừng đến với Kim Seoul Clinic. Hãy đăng nhập tài khoản nhân sự được cấp quyền quản lý cơ sở.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs text-slate-700">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Tên Đăng Nhập / Nhân viên</label>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50 text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Mật Khẩu Kiểm Soát</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50/50 text-slate-800 tracking-wider"
              />
            </div>

            {loginError && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500 bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                <ShieldAlert className="h-4 w-4" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              id="login-submit-btn"
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-slate-900 to-slate-850 hover:from-slate-850 hover:to-slate-800 text-amber-400 font-bold uppercase tracking-widest text-[10px] rounded-2xl shadow-xl transition-all hover:scale-[1.01]"
            >
              Đăng Nhập Hệ Thống
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>Phục vụ 24/7 • Phiên bản máy chủ Premium</span>
          </div>
        </div>
      </div>
    );
  }

  // CORE APPLICATION LAYOUT (MAIN CRM PORTAL)
  return (
    <div id="crm-layout-container" className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Dynamic Sidebar Component */}
      <Sidebar 
        currentTab={currentTab} 
        onTabChange={setCurrentTab} 
        onLogout={handleLogout} 
      />

      {/* Main Workspace */}
      <div id="crm-workspace-panel" className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Dynamic Topbar Component */}
        <Topbar 
          notificationsCount={notificationsCount} 
          clearNotifications={clearNotifications} 
        />

        {/* Content canvas container */}
        <main id="crm-main-canvas" className="flex-1 overflow-y-auto p-8 lg:p-10">
          <div className="max-w-7xl mx-auto w-full">
            {renderView()}
          </div>
        </main>

      </div>
    </div>
  );
}
