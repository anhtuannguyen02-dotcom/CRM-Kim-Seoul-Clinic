import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { RevenueReport } from '../types';

export async function trackRevenueEvent(params: {
  date?: string; // YYYY-MM-DD
  deltaRevenue?: number;
  deltaAppointments?: number;
  deltaCompleted?: number;
  deltaVisits?: number;
  deltaNewCustomers?: number;
  note?: string;
}) {
  try {
    // Determine the date in local timezone (UTC+7 for Vietnam)
    const tzOffset = 7 * 60 * 60 * 1000;
    const localTime = new Date(Date.now() + tzOffset);
    const todayStr = localTime.toISOString().split('T')[0];

    const targetDate = params.date || todayStr;
    const targetMonth = targetDate.slice(0, 7); // YYYY-MM
    const targetYear = targetDate.slice(0, 4); // YYYY

    const periods = [
      { id: `day_${targetDate}`, type: 'day' as const, period: targetDate },
      { id: `month_${targetMonth}`, type: 'month' as const, period: targetMonth },
      { id: `year_${targetYear}`, type: 'year' as const, period: targetYear },
    ];

    for (const p of periods) {
      const docRef = doc(db, 'revenue_reports', p.id);
      const docSnap = await getDoc(docRef);

      let currentData: RevenueReport;
      if (docSnap.exists()) {
        currentData = docSnap.data() as RevenueReport;
      } else {
        currentData = {
          id: p.id,
          type: p.type,
          period: p.period,
          revenue: 0,
          appointmentsCount: 0,
          completedAppointments: 0,
          visits: 0,
          newCustomers: 0,
          notes: 'Khởi tạo tự động từ hoạt động hệ thống',
          updatedAt: new Date().toISOString()
        };
      }

      // Apply deltas
      currentData.revenue = Math.max(0, currentData.revenue + (params.deltaRevenue || 0));
      currentData.appointmentsCount = Math.max(0, currentData.appointmentsCount + (params.deltaAppointments || 0));
      currentData.completedAppointments = Math.max(0, currentData.completedAppointments + (params.deltaCompleted || 0));
      currentData.visits = Math.max(0, currentData.visits + (params.deltaVisits || 0));
      currentData.newCustomers = Math.max(0, currentData.newCustomers + (params.deltaNewCustomers || 0));
      
      if (params.note) {
        currentData.notes = params.note;
      }
      currentData.updatedAt = new Date().toISOString();

      await setDoc(docRef, currentData);
    }
  } catch (err) {
    console.error('Error tracking revenue event in Firestore:', err);
  }
}
