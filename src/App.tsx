import React, { useState, useEffect } from 'react';
import { 
  Customer, 
  Appointment, 
  Technician, 
  CRMTask, 
  Promotion, 
  ServiceItem,
  ClinicProfile 
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
import ReportsView from './components/ReportsView';

import { Sparkles, Key, UserCheck, ShieldAlert, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { useSyncCollection, useSyncDocument, db } from './utils/firebase';
import { useCentralSyncManager } from './utils/syncManager';
import { writeBatch, doc, collection, getDocs, setDoc } from 'firebase/firestore';
import { trackRevenueEvent } from './utils/revenueHelper';

// Formulate Rank from totalSpent dynamically matching Spa policies
export const getCustomerRank = (totalSpent: number): 'Diamond VIP Plus' | 'Diamond VIP' | 'Gold Member' | 'Silver Member' | 'Standard' => {
  if (totalSpent >= 100000000) return 'Diamond VIP Plus';
  if (totalSpent >= 60000000) return 'Diamond VIP';
  if (totalSpent >= 36000000) return 'Gold Member';
  if (totalSpent >= 24000000) return 'Silver Member';
  return 'Standard';
};

export default function App() {
  // Login State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('kimseoul_logged_in');
    return saved === 'true';
  });

  // Clinic Profile State
  const [clinicProfile, setClinicProfile] = useState<ClinicProfile>(() => {
    const defaultProfile = {
      name: 'Kim Seoul Clinic - Viện Thẩm Mỹ Hoàng Gia',
      address: 'Vinhome Smart City Tây Mỗ Nam Từ Liêm Hà Nội',
      phone: '0869135553',
      hours: '09:00 - 21:00 (Mỗi ngày)',
      managerName: 'Đoàn Thị Huyền Trang',
      managerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600&h=600',
      logoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9lWUDJ3O5naySwCalAe_Vokbm8JC-rAXwCklB42fzS0uaCutuIEMjj8Psb7wPTktg3efiYVXNonj7kBk2-T2Y8_kcl03iTqitJP0B4bZCWAzy5S_0iW-j8csVI3ijVExl2cC74p7qyNgKXAhIhE18R_V9A4WznK6iN69rzwo3isWgXHyuzlr8d7XMfXAnncICex_okKOllYUNq6wXYk0X0WAaxl_SR_tp7v7y3zcJMASpZR8dsLb19U6xd1o80faAiFo',
      dashboardImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYFpco8GVUNjAdNMEDCeaGaf3GAI8Heo3rxuWTy-fmPBVUKdjS4wSvY7UyXgsYqzdtWHjS7kLMzUObGhLeIz3VVpo52aimkW2CTCDnwH3Or-MS-sc7YFVspgAVPBHboflWr54BitxOub8d_NlfhojZyud-s4Pj3S1cT5Z0tJI5D-525A5WjyNjXDa_9zsZfyBja9onbsjfFM8apk8AdAsEW_QnjhboL2AeT1x8tCursXdY_sTCOWh8rA',
      branchName: 'Vinhome Smart City'
    };

    const saved = localStorage.getItem('kimseoul_clinic_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // If they have legacy credentials/address/phone, migrate them to the new requested values
        if (parsed.phone === '1900 888 999' || parsed.address?.includes('Sương Nguyệt Ánh') || !parsed.address || !parsed.branchName) {
          return {
            ...defaultProfile,
            ...parsed,
            address: parsed.address?.includes('Sương Nguyệt Ánh') ? defaultProfile.address : (parsed.address || defaultProfile.address),
            phone: parsed.phone === '1900 888 999' ? defaultProfile.phone : (parsed.phone || defaultProfile.phone),
            branchName: parsed.branchName || defaultProfile.branchName
          };
        }
        return parsed;
      } catch (e) {}
    }
    return defaultProfile;
  });

  const [username, setUsername] = useState(() => {
    const saved = localStorage.getItem('kimseoul_clinic_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.managerName) return parsed.managerName;
      } catch (e) {}
    }
    return 'Đoàn Thị Huyền Trang';
  });
  const [password, setPassword] = useState('••••••••');
  const [loginError, setLoginError] = useState('');

  // Main UI States
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [notificationsCount, setNotificationsCount] = useState<number>(3);
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);
  const [dismissedAppointmentIds, setDismissedAppointmentIds] = useState<string[]>([]);

  // Sync clinic profile to localStorage
  useEffect(() => {
    localStorage.setItem('kimseoul_clinic_profile', JSON.stringify(clinicProfile));
  }, [clinicProfile]);

  // Core Data States (load from localStorage or default to initial data)
  const [services, setServices] = useState<ServiceItem[]>(() => {
    const saved = localStorage.getItem('kimseoul_services');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.some((s: any) => s.id === 'srv_sk1')) {
          return INITIAL_SERVICES;
        }
        return parsed;
      } catch (e) {}
    }
    return INITIAL_SERVICES;
  });

  const [technicians, setTechnicians] = useState<Technician[]>(() => {
    const saved = localStorage.getItem('kimseoul_technicians');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.some((t: any) => t.name === 'Phạm Minh Tú' || t.name === 'Nguyễn Đông Nhi' || t.name === 'Trần Hà Phương')) {
          return INITIAL_TECHNICIANS;
        }
        return parsed;
      } catch (e) {}
    }
    return INITIAL_TECHNICIANS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('kimseoul_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('kimseoul_appointments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.some((a: any) => a.technicianName === 'Phạm Minh Tú' || a.technicianName === 'Trần Hà Phương')) {
          return INITIAL_APPOINTMENTS;
        }
        return parsed;
      } catch (e) {}
    }
    return INITIAL_APPOINTMENTS;
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

  useEffect(() => {
    localStorage.setItem('kimseoul_clinic_profile', JSON.stringify(clinicProfile));
  }, [clinicProfile]);

  // Real-time Cloud Synchronization via Firestore (keeps database online and synchronized across all clients)
  useCentralSyncManager({
    services,
    setServices,
    initialServices: INITIAL_SERVICES,
    customers,
    setCustomers,
    initialCustomers: INITIAL_CUSTOMERS,
    appointments,
    setAppointments,
    initialAppointments: INITIAL_APPOINTMENTS,
    onSyncUpdate: (currentServices, currentAppointments, currentCustomers) => {
      recalculateFinancials(currentServices, currentAppointments, currentCustomers);
    }
  });

  useSyncCollection('technicians', technicians, setTechnicians, INITIAL_TECHNICIANS);
  useSyncCollection('crm_tasks', crmTasks, setCrmTasks, INITIAL_CRM_TASKS);
  useSyncCollection('promotions', promotions, setPromotions, INITIAL_PROMOTIONS);
  useSyncDocument('clinic_profile', 'main', clinicProfile, setClinicProfile, clinicProfile);
  useSyncDocument('stats', 'daily', stats, setStats, DAILY_STATS);

  // Function to recalculate all financial stats and metrics using the latest services and pricing data from Firestore
  const recalculateFinancials = async (
    customServices?: typeof services,
    customAppointments?: typeof appointments,
    customCustomers?: typeof customers
  ) => {
    try {
      // Direct real-time fetch from Firestore services collection to ensure absolutely consistent prices
      const servicesSnapshot = await getDocs(collection(db, 'services'));
      const firestoreServices: ServiceItem[] = [];
      servicesSnapshot.forEach((docSnap) => {
        firestoreServices.push({ id: docSnap.id, ...docSnap.data() } as ServiceItem);
      });

      const currentServices = firestoreServices.length > 0 ? firestoreServices : (customServices || services);
      const currentAppointments = customAppointments || appointments;
      const currentCustomers = customCustomers || customers;

      // Calculate additional spent from package/treatments since baseline
      const initialTotalSpentSum = 481000000;
      const currentTotalSpentSum = currentCustomers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
      const additionalSpentRevenue = Math.max(0, currentTotalSpentSum - initialTotalSpentSum);

      // 1. Calculate Revenue: Base is 423,000,000
      // Plus the price of all completed appointments, resolving their price dynamically from the latest services list
      // Plus any additional package or direct spent from customers
      const baseRevenue = 423000000;
      const completedRevenue = currentAppointments
        .filter(appt => appt.status === 'Hoàn thành')
        .reduce((sum, appt) => {
          const matchedService = currentServices.find(s => s.name === appt.serviceName);
          const actualPrice = matchedService ? matchedService.price : appt.price;
          return sum + actualPrice;
        }, 0);
      const calculatedRevenue = baseRevenue + completedRevenue + additionalSpentRevenue;

      // 2. Calculate Appointments Today: Base is 28
      const baseAppointmentsToday = 28;
      const todayAppointmentsCount = currentAppointments.filter(appt => appt.date === '2026-07-08').length;
      const calculatedAppointmentsToday = baseAppointmentsToday + todayAppointmentsCount;

      // 3. Calculate Appointments Checked In Today: Base is 16
      const baseAppointmentsCheckedIn = 16;
      const todayCheckedInCount = currentAppointments.filter(
        appt => appt.date === '2026-07-08' && (appt.status === 'Đang thực hiện' || appt.status === 'Hoàn thành')
      ).length;
      const calculatedAppointmentsCheckedIn = baseAppointmentsCheckedIn + todayCheckedInCount;

      // 4. Calculate New Customers: Base is 119
      const baseNewCustomers = 119;
      const calculatedNewCustomers = baseNewCustomers + currentCustomers.length;

      // 5. Calculate Monthly Revenue: Base is 10,650,000,000
      // Plus the price of all completed appointments, resolving their price dynamically from the latest services list
      const baseMonthlyRevenue = 10650000000;
      const calculatedMonthlyRevenue = baseMonthlyRevenue + completedRevenue + additionalSpentRevenue;

      // 6. Calculate Monthly Visits: Base is 818
      // Plus total appointments count (July appointments)
      const baseMonthlyVisits = 818;
      const calculatedMonthlyVisits = baseMonthlyVisits + currentAppointments.length;

      // 7. Calculate Retention/Return Rate: Base is 68.2%
      // Calculated from actual customer visits and history!
      const addedCustomersCount = Math.max(0, currentCustomers.length - 5);
      const addedReturningCustomers = currentCustomers.slice(5).filter(c => (c.totalVisits || 0) > 1 || (c.treatmentHistory || []).length > 0).length;
      const calculatedRetentionRate = Math.round(((3.41 + addedReturningCustomers) / (5 + addedCustomersCount)) * 1000) / 10;

      const newStats = {
        revenue: calculatedRevenue,
        appointmentsToday: calculatedAppointmentsToday,
        appointmentsCheckedIn: calculatedAppointmentsCheckedIn,
        newCustomers: calculatedNewCustomers,
        monthlyRevenue: calculatedMonthlyRevenue,
        monthlyVisits: calculatedMonthlyVisits,
        retentionRate: calculatedRetentionRate
      };

      setStats(prev => {
        if (
          prev.revenue === newStats.revenue &&
          prev.appointmentsToday === newStats.appointmentsToday &&
          prev.appointmentsCheckedIn === newStats.appointmentsCheckedIn &&
          prev.newCustomers === newStats.newCustomers &&
          prev.monthlyRevenue === newStats.monthlyRevenue &&
          prev.monthlyVisits === newStats.monthlyVisits &&
          prev.retentionRate === newStats.retentionRate
        ) {
          return prev;
        }
        return {
          ...prev,
          ...newStats
        };
      });

      // Update the synchronized stats document in Firestore
      const statsDocRef = doc(db, 'stats', 'daily');
      await setDoc(statsDocRef, newStats, { merge: true });

      console.log('Successfully recalculated financials from Firestore:', newStats);
    } catch (error) {
      console.error('Failed to recalculate financials from Firestore:', error);
    }
  };

  // Reactively compute stats based on services, appointments and customers collections (always derived dynamically)
  useEffect(() => {
    recalculateFinancials();
  }, [services, appointments, customers]);

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

    // Track in Firestore revenue reports
    trackRevenueEvent({
      date: appt.date,
      deltaAppointments: 1,
      deltaCompleted: appt.status === 'Hoàn thành' ? 1 : 0,
      deltaRevenue: appt.status === 'Hoàn thành' ? appt.price : 0,
      deltaVisits: appt.status === 'Hoàn thành' ? 1 : 0,
      note: `Đặt lịch dịch vụ: ${appt.serviceName} cho ${appt.customerName}`
    });

    setNotificationsCount(prev => prev + 1);
  };

  // Update Appointment Status and automatically link customer spending, auto rank, treatment history & CRM care tasks
  const handleUpdateAppointmentStatus = (id: string, status: Appointment['status']) => {
    const previousAppt = appointments.find(a => a.id === id);
    if (!previousAppt) return;

    const updated = appointments.map(appt => {
      if (appt.id === id) {
        return { ...appt, status };
      }
      return appt;
    });
    setAppointments(updated);

    // Update daily stats check-ins
    if (status === 'Đang thực hiện' && previousAppt.status === 'Chờ phục vụ') {
      setStats(prev => ({
        ...prev,
        appointmentsCheckedIn: prev.appointmentsCheckedIn + 1
      }));
    }

    // LINK WITH CUSTOMER SPENDING & AUTO RANK UPGRADE
    if (status === 'Hoàn thành' && previousAppt.status !== 'Hoàn thành') {
      // 1. Accumulate spending for the customer and upgrade rank
      setCustomers(prevCustomers => prevCustomers.map(c => {
        if (c.id === previousAppt.customerId) {
          const newTotalSpent = c.totalSpent + previousAppt.price;
          const newRank = getCustomerRank(newTotalSpent);
          
          // Log into treatment history with a unique ID linked to this appointment
          const treatmentHistory = c.treatmentHistory || [];
          const isExist = treatmentHistory.some(th => th.id === `th_appt_${previousAppt.id}`);
          const updatedHistory = isExist ? treatmentHistory : [
            {
              id: `th_appt_${previousAppt.id}`,
              date: new Date().toLocaleDateString('vi-VN'),
              serviceName: previousAppt.serviceName,
              technician: previousAppt.technicianName,
              note: previousAppt.notes || 'Hoàn thành từ lịch hẹn đặt trước',
              status: 'Hoàn thành' as const
            },
            ...treatmentHistory
          ];

          // 2. Automatically generate a CRM care task 3 days after treatment
          const careTask: CRMTask = {
            id: `task_auto_${Date.now()}`,
            customerId: c.id,
            customerName: c.name,
            customerPhone: c.phone,
            customerAvatar: c.avatar,
            type: 'Sau liệu trình',
            serviceName: previousAppt.serviceName,
            description: `Chăm sóc sau liệu trình: Liên hệ hỏi thăm khách hàng "${c.name}" tình trạng hồi phục sau khi làm dịch vụ "${previousAppt.serviceName}". Hướng dẫn bôi kem phục hồi & chống nắng kỹ lưỡng.`,
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'Cần liên hệ',
            loggedInteractions: []
          };
          setCrmTasks(prevTasks => [careTask, ...prevTasks]);

          // 3. Automatically deduct session from active packages if they exist
          let activePackages = c.activePackages || [];
          if (activePackages.length > 0) {
            // Find matched package
            let matchedIdx = activePackages.findIndex(pkg => 
              pkg.packageName.toLowerCase().trim() === previousAppt.serviceName.toLowerCase().trim()
            );
            if (matchedIdx === -1) {
              // Try finding partial match
              matchedIdx = activePackages.findIndex(pkg => 
                previousAppt.serviceName.toLowerCase().includes(pkg.packageName.toLowerCase().trim()) ||
                pkg.packageName.toLowerCase().includes(previousAppt.serviceName.toLowerCase().trim())
              );
            }
            if (matchedIdx === -1) {
              // Fallback: match first active package
              matchedIdx = 0;
            }

            if (matchedIdx !== -1) {
              activePackages = activePackages.map((pkg, idx) => {
                if (idx === matchedIdx) {
                  const updatedUsed = Math.min(pkg.totalSessions, pkg.usedSessions + 1);
                  return {
                    ...pkg,
                    usedSessions: updatedUsed
                  };
                }
                return pkg;
              });
            }
          }

          return {
            ...c,
            totalSpent: newTotalSpent,
            totalVisits: c.totalVisits + 1,
            rank: newRank,
            treatmentHistory: updatedHistory,
            activePackages
          };
        }
        return c;
      }));

      // 2. Update technician completed jobs count
      if (previousAppt.technicianId || previousAppt.technicianName) {
        setTechnicians(prevTechs => prevTechs.map(t => {
          if ((previousAppt.technicianId && t.id === previousAppt.technicianId) || t.name === previousAppt.technicianName) {
            return { ...t, completedJobs: t.completedJobs + 1 };
          }
          return t;
        }));
      }

      // 3. Increment revenue in stats
      setStats(prev => ({
        ...prev,
        revenue: prev.revenue + previousAppt.price
      }));

      // Track in Firestore revenue reports
      trackRevenueEvent({
        date: previousAppt.date,
        deltaRevenue: previousAppt.price,
        deltaCompleted: 1,
        deltaVisits: 1,
        note: `Hoàn thành dịch vụ: ${previousAppt.serviceName} cho ${previousAppt.customerName}`
      });
    } else if (previousAppt.status === 'Hoàn thành' && status !== 'Hoàn thành') {
      // Revert spending if reverting appointment from Completed status
      setCustomers(prevCustomers => prevCustomers.map(c => {
        if (c.id === previousAppt.customerId) {
          const newTotalSpent = Math.max(0, c.totalSpent - previousAppt.price);
          const newRank = getCustomerRank(newTotalSpent);
          const treatmentHistory = (c.treatmentHistory || []).filter(th => th.id !== `th_appt_${previousAppt.id}`);
          
          // Revert session deduction from active packages if they exist
          let activePackages = c.activePackages || [];
          if (activePackages.length > 0) {
            // Find matched package
            let matchedIdx = activePackages.findIndex(pkg => 
              pkg.packageName.toLowerCase().trim() === previousAppt.serviceName.toLowerCase().trim()
            );
            if (matchedIdx === -1) {
              matchedIdx = activePackages.findIndex(pkg => 
                previousAppt.serviceName.toLowerCase().includes(pkg.packageName.toLowerCase().trim()) ||
                pkg.packageName.toLowerCase().includes(previousAppt.serviceName.toLowerCase().trim())
              );
            }
            if (matchedIdx === -1) {
              matchedIdx = 0;
            }

            if (matchedIdx !== -1) {
              activePackages = activePackages.map((pkg, idx) => {
                if (idx === matchedIdx) {
                  return {
                    ...pkg,
                    usedSessions: Math.max(0, pkg.usedSessions - 1)
                  };
                }
                return pkg;
              });
            }
          }

          return {
            ...c,
            totalSpent: newTotalSpent,
            totalVisits: Math.max(0, c.totalVisits - 1),
            rank: newRank,
            treatmentHistory,
            activePackages
          };
        }
        return c;
      }));

      // Revert technician completed jobs count
      if (previousAppt.technicianId || previousAppt.technicianName) {
        setTechnicians(prevTechs => prevTechs.map(t => {
          if ((previousAppt.technicianId && t.id === previousAppt.technicianId) || t.name === previousAppt.technicianName) {
            return { ...t, completedJobs: Math.max(0, t.completedJobs - 1) };
          }
          return t;
        }));
      }

      // Revert revenue in stats
      setStats(prev => ({
        ...prev,
        revenue: Math.max(0, prev.revenue - previousAppt.price)
      }));

      // Track in Firestore revenue reports
      trackRevenueEvent({
        date: previousAppt.date,
        deltaRevenue: -previousAppt.price,
        deltaCompleted: -1,
        deltaVisits: -1,
        note: `Hoàn tác hoàn thành dịch vụ: ${previousAppt.serviceName} cho ${previousAppt.customerName}`
      });
    }
  };

  // Add Customer
  const handleAddCustomer = (newCust: Omit<Customer, 'id' | 'totalSpent' | 'totalVisits' | 'treatmentHistory' | 'activePackages' | 'beforeAfterImages'>): string => {
    const cleanId = newCust.phone.replace(/\D/g, '');
    const newId = cleanId || `cust_${Date.now()}`;

    // Check if customer with this phone number already exists
    const existing = customers.find(c => c.phone.replace(/\D/g, '') === cleanId || c.id === newId);
    if (existing) {
      const updatedCustomers = customers.map(c => c.id === existing.id ? {
        ...c,
        name: newCust.name || c.name,
        age: newCust.age || c.age,
        address: newCust.address || c.address,
        birthday: newCust.birthday || c.birthday,
        gender: newCust.gender || c.gender,
        notes: newCust.notes ? `${c.notes}\n${newCust.notes}` : c.notes,
      } : c);
      setCustomers(updatedCustomers);
      recalculateFinancials(services, appointments, updatedCustomers);
      return existing.id;
    }

    const cust: Customer = {
      ...newCust,
      id: newId,
      totalSpent: 0,
      totalVisits: 0,
      treatmentHistory: [],
      activePackages: [],
      beforeAfterImages: []
    };

    const updatedCustomers = [cust, ...customers];
    setCustomers(updatedCustomers);
    
    recalculateFinancials(services, appointments, updatedCustomers);

    trackRevenueEvent({
      deltaNewCustomers: 1,
      note: `Khách hàng mới đăng ký: ${cust.name}`
    });

    // Trigger CRM Care Tasks for programs if pre-activated
    const newTasks: CRMTask[] = [];
    if (newCust.kimSkincarePass) {
      newTasks.push({
        id: `task_sp_${Date.now()}_1`,
        customerId: newId,
        customerName: newCust.name,
        customerPhone: newCust.phone,
        customerAvatar: newCust.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPhGoTjtUutxMviwQA6tzgNLgwC3L905UOgKFihCIpyIjjRu_w3A2ql6Ldgf7SyHmH2W81se759xGRrYJpjrK3C6UrOcp8c4RvueFZ2ZjLiwHRpfzcz7uCaRG9fWRxIod9gR11Git42RpGQGQ-46USAyjgDUUR6WmgnV6PSeks4n5nAiH6qog5J5dpE9EIoZkAXx20kT38-oB2-wU8F9dzoq8SY_4L9fHCpTmv00D79cqTPAexmOHg8A',
        type: 'Ưu đãi VIP',
        serviceName: 'KIM SKINCARE PASS',
        description: `Chào mừng hội viên KIM SKINCARE PASS mới! Gọi điện tư vấn quyền lợi (giảm 50% chăm sóc da, 20% Filler/Botox) và đặt lịch chăm sóc định kỳ.`,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Cần liên hệ',
        loggedInteractions: []
      });
      newTasks.push({
        id: `task_sp_${Date.now()}_2`,
        customerId: newId,
        customerName: newCust.name,
        customerPhone: newCust.phone,
        customerAvatar: newCust.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPhGoTjtUutxMviwQA6tzgNLgwC3L905UOgKFihCIpyIjjRu_w3A2ql6Ldgf7SyHmH2W81se759xGRrYJpjrK3C6UrOcp8c4RvueFZ2ZjLiwHRpfzcz7uCaRG9fWRxIod9gR11Git42RpGQGQ-46USAyjgDUUR6WmgnV6PSeks4n5nAiH6qog5J5dpE9EIoZkAXx20kT38-oB2-wU8F9dzoq8SY_4L9fHCpTmv00D79cqTPAexmOHg8A',
        type: 'Ưu đãi VIP',
        serviceName: 'KIM SKINCARE PASS',
        description: `Nhắc gia hạn thẻ KIM SKINCARE PASS MEMBER: Khách sắp hết hạn 3 tháng sử dụng thẻ ưu đãi. Tư vấn gia hạn tiếp tục hưởng ưu đãi đặc quyền.`,
        dueDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Cần liên hệ',
        loggedInteractions: []
      });
    }
    if (newCust.kimRewardBillGoc !== undefined) {
      newTasks.push({
        id: `task_kr_${Date.now()}`,
        customerId: newId,
        customerName: newCust.name,
        customerPhone: newCust.phone,
        customerAvatar: newCust.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPhGoTjtUutxMviwQA6tzgNLgwC3L905UOgKFihCIpyIjjRu_w3A2ql6Ldgf7SyHmH2W81se759xGRrYJpjrK3C6UrOcp8c4RvueFZ2ZjLiwHRpfzcz7uCaRG9fWRxIod9gR11Git42RpGQGQ-46USAyjgDUUR6WmgnV6PSeks4n5nAiH6qog5J5dpE9EIoZkAXx20kT38-oB2-wU8F9dzoq8SY_4L9fHCpTmv00D79cqTPAexmOHg8A',
        type: 'Ưu đãi VIP',
        serviceName: 'KIM REWARD',
        description: `Tư vấn hoàn tiền KIM REWARD: Khách có Bill gốc ${new Intl.NumberFormat('vi-VN').format(newCust.kimRewardBillGoc)}đ. Gọi điện hỏi thăm & hướng dẫn giới thiệu tối thiểu 3 bạn bè để hoàn tiền lên tới 100%!`,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Cần liên hệ',
        loggedInteractions: []
      });
    }

    if (newTasks.length > 0) {
      setCrmTasks(prev => [...newTasks, ...prev]);
    }

    return newId;
  };

  // Handle Notification Selection & Click
  const handleNotificationSelect = (customerId: string, itemType: 'task' | 'appointment', itemId: string) => {
    // 1. Chuyển sang tab khách hàng
    setCurrentTab('customers');
    
    // 2. Thiết lập ID khách hàng để CustomersView tự động mở
    setActiveCustomerId(customerId);
    
    // 3. Trừ đi (Đánh dấu đã xem)
    if (itemType === 'task') {
      handleCompleteTask(itemId);
    } else if (itemType === 'appointment') {
      setDismissedAppointmentIds(prev => [...prev, itemId]);
    }
    setNotificationsCount(prev => Math.max(0, prev - 1));
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
    const updatedCustomers = customers.map(c => {
      if (c.id === customerId) {
        const treatmentHistory = c.treatmentHistory || [];
        const servicePrice = services.find(s => s.name === serviceName)?.price || 0;
        const newTotalSpent = c.totalSpent + servicePrice;
        return {
          ...c,
          totalVisits: c.totalVisits + 1,
          totalSpent: newTotalSpent,
          rank: getCustomerRank(newTotalSpent),
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
    });
    setCustomers(updatedCustomers);
    recalculateFinancials(services, appointments, updatedCustomers);
  };

  // Add package to customer
  const handleAddCustomerPackage = (customerId: string, packageName: string, totalSessions: number, price: number) => {
    const updatedCustomers = customers.map(c => {
      if (c.id === customerId) {
        const activePackages = c.activePackages || [];
        const newTotalSpent = c.totalSpent + price;
        return {
          ...c,
          totalSpent: newTotalSpent,
          rank: getCustomerRank(newTotalSpent),
          activePackages: [
            ...activePackages,
            {
              packageName,
              totalSessions,
              usedSessions: 0
            }
          ]
        };
      }
      return c;
    });
    setCustomers(updatedCustomers);
    recalculateFinancials(services, appointments, updatedCustomers);

    const targetCust = customers.find(c => c.id === customerId);
    const custName = targetCust ? targetCust.name : 'Khách hàng';
    trackRevenueEvent({
      deltaRevenue: price,
      deltaVisits: 1,
      note: `Khách mua liệu trình: ${packageName} (${custName})`
    });
  };

  // Use a session from customer's package
  const handleUsePackageSession = (customerId: string, packageName: string, note: string, technician: string) => {
    const updatedCustomers = customers.map(c => {
      if (c.id === customerId) {
        const activePackages = (c.activePackages || []).map(pkg => {
          if (pkg.packageName === packageName) {
            return {
              ...pkg,
              usedSessions: Math.min(pkg.totalSessions, pkg.usedSessions + 1)
            };
          }
          return pkg;
        });

        const treatmentHistory = c.treatmentHistory || [];
        return {
          ...c,
          totalVisits: c.totalVisits + 1,
          activePackages,
          treatmentHistory: [
            {
              id: `th_${Date.now()}`,
              date: new Date().toLocaleDateString('vi-VN'),
              serviceName: `Trừ buổi: ${packageName}`,
              technician,
              note,
              status: 'Hoàn thành' as const
            },
            ...treatmentHistory
          ]
        };
      }
      return c;
    });
    setCustomers(updatedCustomers);
    recalculateFinancials(services, appointments, updatedCustomers);
  };

  // Add Before After clinical photo
  const handleAddBeforeAfterImage = (customerId: string, title: string, before: string, after: string) => {
    setCustomers(customers.map(c => {
      if (c.id === customerId) {
        const beforeAfterImages = c.beforeAfterImages || [];
        return {
          ...c,
          beforeAfterImages: [
            ...beforeAfterImages,
            { title, before, after }
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

  // Update staff details
  const handleUpdateStaff = (id: string, updatedFields: Partial<Technician>) => {
    const originalTech = technicians.find(t => t.id === id);
    setTechnicians(technicians.map(t => {
      if (t.id === id) {
        return { ...t, ...updatedFields };
      }
      return t;
    }));

    if (originalTech) {
      const oldName = originalTech.name;
      const newName = updatedFields.name || oldName;

      if (newName !== oldName) {
        // Sync Appointments referencing this clinician
        setAppointments(prev => prev.map(appt => {
          if (appt.technicianId === id || appt.technicianName === oldName) {
            return {
              ...appt,
              technicianName: newName,
              technicianId: id
            };
          }
          return appt;
        }));

        // Sync Customers treatment history
        setCustomers(prev => prev.map(c => {
          let changed = false;
          const treatmentHistory = (c.treatmentHistory || []).map(th => {
            if (th.technician === oldName) {
              changed = true;
              return { ...th, technician: newName };
            }
            return th;
          });
          if (changed) {
            return { ...c, treatmentHistory };
          }
          return c;
        }));
      }
    }
  };

  // Delete staff member
  const handleDeleteStaff = (id: string) => {
    setTechnicians(prev => prev.filter(t => t.id !== id));
    setAppointments(prev => prev.map(appt => {
      if (appt.technicianId === id) {
        return { ...appt, technicianId: '', technicianName: 'Chưa chỉ định' };
      }
      return appt;
    }));
  };

  // Add Service Item
  const handleAddService = async (newSrv: Omit<ServiceItem, 'id'>) => {
    const srv: ServiceItem = {
      ...newSrv,
      id: `srv_${Date.now()}`
    };
    const updatedServices = [...services, srv];
    setServices(updatedServices);
    // Trigger real-time financials recalculation after adding a new service
    await recalculateFinancials(updatedServices, appointments, customers);
  };

  // Update Service
  const handleUpdateService = async (id: string, updatedFields: Partial<ServiceItem>) => {
    const originalService = services.find(s => s.id === id);
    if (!originalService) return;

    const oldName = originalService.name;
    const newName = updatedFields.name || oldName;
    const newPrice = updatedFields.price !== undefined ? updatedFields.price : originalService.price;
    const priceDiff = newPrice - originalService.price;

    const updatedServices = services.map(s => {
      if (s.id === id) {
        return { ...s, ...updatedFields };
      }
      return s;
    });

    let updatedAppointments = appointments;
    let updatedCrmTasks = crmTasks;
    let updatedCustomers = customers;

    const hasChanged = newName !== oldName || newPrice !== originalService.price;

    if (hasChanged) {
      // Update Appointments referencing this service name
      updatedAppointments = appointments.map(appt => {
        if (appt.serviceName === oldName) {
          return {
            ...appt,
            serviceName: newName,
            price: newPrice
          };
        }
        return appt;
      });

      // Update CRM Tasks
      updatedCrmTasks = crmTasks.map(task => {
        if (task.serviceName === oldName) {
          return { ...task, serviceName: newName };
        }
        return task;
      });

      // Update Customers active packages, treatment history, totalSpent & rank dynamically
      updatedCustomers = customers.map(c => {
        let changed = false;
        let treatmentsCount = 0;
        const activePackages = (c.activePackages || []).map(pkg => {
          if (pkg.packageName === oldName) {
            changed = true;
            return { ...pkg, packageName: newName };
          }
          return pkg;
        });
        const treatmentHistory = (c.treatmentHistory || []).map(th => {
          if (th.serviceName === oldName) {
            changed = true;
            if (th.status === 'Hoàn thành') {
              treatmentsCount++;
            }
            return { ...th, serviceName: newName };
          }
          return th;
        });
        if (changed) {
          const addedSpent = priceDiff * treatmentsCount;
          const newTotalSpent = Math.max(0, c.totalSpent + addedSpent);
          return { 
            ...c, 
            activePackages, 
            treatmentHistory,
            totalSpent: newTotalSpent,
            rank: getCustomerRank(newTotalSpent)
          };
        }
        return c;
      });
    }

    // Set states locally to update the UI instantly
    setServices(updatedServices);
    if (hasChanged) {
      setAppointments(updatedAppointments);
      setCrmTasks(updatedCrmTasks);
      setCustomers(updatedCustomers);
    }

    // Direct synchronized atomic batch write to Firestore
    try {
      const batch = writeBatch(db);

      // 1. Save updated service
      const serviceDocRef = doc(db, 'services', id);
      batch.set(serviceDocRef, { ...originalService, ...updatedFields });

      if (hasChanged) {
        // 2. Update matching appointments in Firestore
        updatedAppointments.forEach(appt => {
          if (appt.serviceName === newName) {
            const apptDocRef = doc(db, 'appointments', appt.id);
            batch.set(apptDocRef, appt);
          }
        });

        // 3. Update matching CRM tasks in Firestore
        updatedCrmTasks.forEach(task => {
          if (task.serviceName === newName) {
            const taskDocRef = doc(db, 'crm_tasks', task.id);
            batch.set(taskDocRef, task);
          }
        });

        // 4. Update matching customers in Firestore
        updatedCustomers.forEach(c => {
          const originalCust = customers.find(orig => orig.id === c.id);
          if (originalCust && JSON.stringify(originalCust) !== JSON.stringify(c)) {
            const custDocRef = doc(db, 'customers', c.id);
            batch.set(custDocRef, c);
          }
        });
      }

      await batch.commit();
      console.log('Batch update to Firestore for service modifications completed successfully.');
      
      // Trigger real-time financials recalculation after updating service properties
      await recalculateFinancials(updatedServices, updatedAppointments, updatedCustomers);
    } catch (err) {
      console.error('Failed to commit Firestore batch update for service modification:', err);
    }
  };

  // Delete Service
  const handleDeleteService = async (id: string) => {
    const updatedServices = services.filter(s => s.id !== id);
    setServices(updatedServices);
    // Trigger real-time financials recalculation after deleting a service
    await recalculateFinancials(updatedServices, appointments, customers);
  };

  // Update Customer Details
  const handleUpdateCustomer = (id: string, updatedFields: Partial<Customer>) => {
    const originalCust = customers.find(c => c.id === id);
    const updatedCustomers = customers.map(c => {
      if (c.id === id) {
        const merged = { ...c, ...updatedFields };
        if (updatedFields.totalSpent !== undefined) {
          merged.rank = getCustomerRank(updatedFields.totalSpent);
        }
        return merged;
      }
      return c;
    });
    setCustomers(updatedCustomers);

    let updatedAppointments = appointments;

    if (originalCust) {
      const oldName = originalCust.name;
      const oldPhone = originalCust.phone;
      const oldAvatar = originalCust.avatar;

      const newName = updatedFields.name || oldName;
      const newPhone = updatedFields.phone || oldPhone;
      const newAvatar = updatedFields.avatar || oldAvatar;

      if (newName !== oldName || newPhone !== oldPhone || newAvatar !== oldAvatar) {
        // Sync Appointments
        updatedAppointments = appointments.map(appt => {
          if (appt.customerId === id) {
            return {
              ...appt,
              customerName: newName,
              customerPhone: newPhone,
              customerAvatar: newAvatar
            };
          }
          return appt;
        });
        setAppointments(updatedAppointments);

        // Sync CRM Tasks
        setCrmTasks(prev => prev.map(task => {
          if (task.customerId === id) {
            return {
              ...task,
              customerName: newName,
              customerPhone: newPhone,
              customerAvatar: newAvatar
            };
          }
          return task;
        }));
      }

      // Automatically add CRM tasks for Special Programs
      // 1. KIM SKINCARE PASS MEMBER
      if (updatedFields.kimSkincarePass && !originalCust.kimSkincarePass) {
        const welcomeTask: CRMTask = {
          id: `task_sp_${Date.now()}_1`,
          customerId: id,
          customerName: newName,
          customerPhone: newPhone,
          customerAvatar: newAvatar,
          type: 'Ưu đãi VIP',
          serviceName: 'KIM SKINCARE PASS',
          description: `Chào mừng hội viên KIM SKINCARE PASS mới! Gọi điện tư vấn quyền lợi (giảm 50% chăm sóc da, 20% Filler/Botox) và đặt lịch chăm sóc định kỳ.`,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
          status: 'Cần liên hệ',
          loggedInteractions: []
        };
        
        const expiryTask: CRMTask = {
          id: `task_sp_${Date.now()}_2`,
          customerId: id,
          customerName: newName,
          customerPhone: newPhone,
          customerAvatar: newAvatar,
          type: 'Ưu đãi VIP',
          serviceName: 'KIM SKINCARE PASS',
          description: `Nhắc gia hạn thẻ KIM SKINCARE PASS MEMBER: Khách sắp hết hạn 3 tháng sử dụng thẻ ưu đãi. Tư vấn gia hạn tiếp tục hưởng ưu đãi đặc quyền.`,
          dueDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 75 days from now (~2.5 months)
          status: 'Cần liên hệ',
          loggedInteractions: []
        };

        setCrmTasks(prev => [welcomeTask, expiryTask, ...prev]);
      }

      // 2. KIM REWARD
      if (updatedFields.kimRewardBillGoc !== undefined && originalCust.kimRewardBillGoc === undefined) {
        const rewardTask: CRMTask = {
          id: `task_kr_${Date.now()}`,
          customerId: id,
          customerName: newName,
          customerPhone: newPhone,
          customerAvatar: newAvatar,
          type: 'Ưu đãi VIP',
          serviceName: 'KIM REWARD',
          description: `Tư vấn hoàn tiền KIM REWARD: Khách có Bill gốc ${new Intl.NumberFormat('vi-VN').format(updatedFields.kimRewardBillGoc)}đ. Gọi điện hỏi thăm & hướng dẫn giới thiệu tối thiểu 3 bạn bè để hoàn tiền lên tới 100%!`,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
          status: 'Cần liên hệ',
          loggedInteractions: []
        };

        setCrmTasks(prev => [rewardTask, ...prev]);
      }
    }

    recalculateFinancials(services, updatedAppointments, updatedCustomers);
  };

  // Delete Customer
  const handleDeleteCustomer = (id: string) => {
    const updatedCustomers = customers.filter(c => c.id !== id);
    const updatedAppointments = appointments.filter(appt => appt.customerId !== id);
    setCustomers(updatedCustomers);
    setAppointments(updatedAppointments);
    setCrmTasks(prev => prev.filter(task => task.customerId !== id));
    recalculateFinancials(services, updatedAppointments, updatedCustomers);
  };

  // Batch Import Customers from Excel
  const handleBatchImportCustomers = (newCustomersList: Customer[]) => {
    setCustomers(newCustomersList);
  };

  // Edit Promotion
  const handleUpdatePromotion = (id: string, updatedFields: Partial<Promotion>) => {
    setPromotions(promotions.map(p => p.id === id ? { ...p, ...updatedFields } : p));
  };

  // Delete Promotion
  const handleDeletePromotion = (id: string) => {
    setPromotions(promotions.filter(p => p.id !== id));
  };

  // Add CRM Task
  const handleAddCRMTask = (newTask: Omit<CRMTask, 'id' | 'loggedInteractions'>) => {
    const task: CRMTask = {
      ...newTask,
      id: `task_${Date.now()}`,
      loggedInteractions: []
    };
    setCrmTasks([task, ...crmTasks]);
  };

  // Edit CRM Task
  const handleUpdateCRMTask = (id: string, updatedFields: Partial<CRMTask>) => {
    setCrmTasks(crmTasks.map(t => t.id === id ? { ...t, ...updatedFields } : t));
  };

  // Delete CRM Task
  const handleDeleteCRMTask = (id: string) => {
    setCrmTasks(crmTasks.filter(t => t.id !== id));
  };

  // Edit Appointment
  const handleUpdateAppointment = (id: string, updatedFields: Partial<Appointment>) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, ...updatedFields } : a));
  };

  // Delete Appointment
  const handleDeleteAppointment = (id: string) => {
    const appt = appointments.find(a => a.id === id);
    if (appt) {
      const isCompleted = appt.status === 'Hoàn thành';
      trackRevenueEvent({
        date: appt.date,
        deltaAppointments: -1,
        deltaCompleted: isCompleted ? -1 : 0,
        deltaRevenue: isCompleted ? -appt.price : 0,
        deltaVisits: isCompleted ? -1 : 0,
        note: `Xoá lịch hẹn: ${appt.serviceName} (${appt.customerName})`
      });
    }
    setAppointments(appointments.filter(a => a.id !== id));
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
            clinicProfile={clinicProfile}
            services={services}
          />
        );
      case 'appointments':
        return (
          <AppointmentsView
            appointments={appointments}
            customers={customers}
            services={services}
            technicians={technicians}
            promotions={promotions}
            onUpdatePromotion={handleUpdatePromotion}
            onAddCustomer={handleAddCustomer}
            onAddAppointment={handleAddAppointment}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            onUpdateAppointment={handleUpdateAppointment}
            onDeleteAppointment={handleDeleteAppointment}
          />
        );
      case 'customers':
        return (
          <CustomersView
            customers={customers}
            services={services}
            technicians={technicians}
            onAddCustomer={handleAddCustomer}
            onAddTreatmentNote={handleAddCustomerTreatmentNote}
            onAddCustomerPackage={handleAddCustomerPackage}
            onUsePackageSession={handleUsePackageSession}
            onAddBeforeAfterImage={handleAddBeforeAfterImage}
            onUpdateCustomer={handleUpdateCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onBatchImportCustomers={handleBatchImportCustomers}
            activeCustomerId={activeCustomerId}
            onClearActiveCustomerId={() => setActiveCustomerId(null)}
          />
        );
      case 'care':
        return (
          <CareView
            crmTasks={crmTasks}
            customers={customers}
            onCompleteTask={handleCompleteTask}
            onAddLog={handleAddCareLog}
            onAddTask={handleAddCRMTask}
            onUpdateTask={handleUpdateCRMTask}
            onDeleteTask={handleDeleteCRMTask}
          />
        );
      case 'promotions':
        return (
          <PromotionsView
            promotions={promotions}
            onAddPromotion={handleAddPromotion}
            onUpdatePromoStatus={handleUpdatePromoStatus}
            onUpdatePromotion={handleUpdatePromotion}
            onDeletePromotion={handleDeletePromotion}
            customers={customers}
            onUpdateCustomer={handleUpdateCustomer}
            onAddCustomer={handleAddCustomer}
          />
        );
      case 'staff':
        return (
          <StaffView
            technicians={technicians}
            onUpdateTechStatus={handleUpdateTechStatus}
            onAddStaff={handleAddStaff}
            onUpdateStaff={handleUpdateStaff}
            onDeleteStaff={handleDeleteStaff}
          />
        );
      case 'settings':
        return (
          <SettingsView
            services={services}
            onUpdateService={handleUpdateService}
            onDeleteService={handleDeleteService}
            onAddService={handleAddService}
            clinicProfile={clinicProfile}
            onUpdateClinicProfile={setClinicProfile}
            customers={customers}
            appointments={appointments}
            crmTasks={crmTasks}
            technicians={technicians}
            stats={stats}
            onUpdateStats={setStats}
          />
        );
      case 'reports':
        return (
          <ReportsView
            appointments={appointments}
            customers={customers}
            services={services}
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
          <motion.img 
            id="login-bg-logo"
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
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
        clinicProfile={clinicProfile}
      />

      {/* Main Workspace */}
      <div id="crm-workspace-panel" className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Dynamic Topbar Component */}
        <Topbar 
          notificationsCount={notificationsCount} 
          clearNotifications={clearNotifications} 
          clinicProfile={clinicProfile}
          onUpdateClinicProfile={setClinicProfile}
          crmTasks={crmTasks}
          appointments={appointments}
          dismissedAppointmentIds={dismissedAppointmentIds}
          onNotificationSelect={handleNotificationSelect}
          customers={customers}
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
