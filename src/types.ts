export interface Customer {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: 'Nam' | 'Nữ';
  rank: 'Diamond VIP' | 'Gold Member' | 'Silver Member' | 'Standard';
  avatar: string;
  totalSpent: number;
  totalVisits: number;
  notes: string;
  activePackages: {
    packageName: string;
    totalSessions: number;
    usedSessions: number;
  }[];
  treatmentHistory: {
    id: string;
    date: string;
    serviceName: string;
    technician: string;
    note: string;
    status: 'Hoàn thành' | 'Đã huỷ';
  }[];
  beforeAfterImages: {
    before: string;
    after: string;
    title: string;
  }[];
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAvatar: string;
  serviceName: string;
  price: number;
  technicianId: string;
  technicianName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'Chờ phục vụ' | 'Đang thực hiện' | 'Hoàn thành' | 'Đã huỷ';
  notes?: string;
}

export interface Technician {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status: 'Sẵn sàng' | 'Đang bận' | 'Nghỉ phép';
  currentRoom?: string;
  rating: number;
  completedJobs: number;
  specialty: string[];
}

export interface CRMTask {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAvatar: string;
  type: 'Sau liệu trình' | 'Nhắc lịch dặm' | 'Sinh nhật' | 'Ưu đãi VIP';
  serviceName?: string;
  description: string;
  dueDate: string;
  status: 'Cần liên hệ' | 'Đang xử lý' | 'Đã hoàn thành';
  loggedInteractions?: {
    date: string;
    note: string;
    channel: 'Gọi điện' | 'SMS' | 'Zalo';
  }[];
}

export interface Promotion {
  id: string;
  code: string;
  title: string;
  discountValue: string;
  minSpend: number;
  expiryDate: string;
  status: 'Hoạt động' | 'Hết hạn' | 'Tạm dừng';
  usageCount: number;
  description: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  durationMin: number;
  category: 'Trẻ hoá da' | 'Tiêm thẩm mỹ' | 'Laser điều trị' | 'Body & Tắm trắng' | 'Chăm sóc cơ bản' | 'Massage' | 'Gội đầu' | 'Triệt lông' | 'Botox Hàn Quốc' | 'Filler Hàn Quốc';
}

export interface ClinicProfile {
  name: string;
  address: string;
  phone: string;
  hours: string;
  managerName: string;
  managerAvatar: string;
  logoUrl: string;
  dashboardImageUrl: string;
}

