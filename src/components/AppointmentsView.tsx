import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  X, 
  UserCheck, 
  Sparkles, 
  DollarSign, 
  ChevronRight, 
  ChevronLeft,
  Users,
  Edit3,
  Trash2
} from 'lucide-react';
import { Appointment, Customer, ServiceItem, Technician } from '../types';

interface AppointmentsViewProps {
  appointments: Appointment[];
  customers: Customer[];
  services: ServiceItem[];
  technicians: Technician[];
  onAddAppointment: (appt: Omit<Appointment, 'id'>) => void;
  onUpdateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  onUpdateAppointment?: (id: string, updatedFields: Partial<Appointment>) => void;
  onDeleteAppointment?: (id: string) => void;
}

export default function AppointmentsView({
  appointments,
  customers,
  services,
  technicians,
  onAddAppointment,
  onUpdateAppointmentStatus,
  onUpdateAppointment,
  onDeleteAppointment
}: AppointmentsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Appointment['status']>('All');
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Edit Appointment States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingApptId, setEditingApptId] = useState<string | null>(null);
  const [editServiceId, setEditServiceId] = useState('');
  const [editTechnicianId, setEditTechnicianId] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<Appointment['status']>('Chờ phục vụ');

  const handleStartEditAppt = (appt: Appointment) => {
    setEditingApptId(appt.id);
    
    // Find matching service and tech ids
    const matchedSrv = services.find(s => s.name === appt.serviceName);
    const matchedTech = technicians.find(t => t.name === appt.technicianName);
    
    setEditServiceId(matchedSrv?.id || services[0]?.id || '');
    setEditTechnicianId(matchedTech?.id || technicians[0]?.id || '');
    setEditDate(appt.date);
    setEditTime(appt.time);
    setEditNotes(appt.notes || '');
    setEditStatus(appt.status);
    
    setShowEditModal(true);
  };

  const handleEditApptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApptId || !onUpdateAppointment) return;

    const selectedSrv = services.find(s => s.id === editServiceId);
    const selectedTech = technicians.find(t => t.id === editTechnicianId);

    if (!selectedSrv || !selectedTech) {
      alert('Vui lòng chọn dịch vụ và kỹ thuật viên hợp lệ.');
      return;
    }

    onUpdateAppointment(editingApptId, {
      serviceName: selectedSrv.name,
      price: selectedSrv.price,
      technicianId: selectedTech.id,
      technicianName: selectedTech.name,
      date: editDate,
      time: editTime,
      notes: editNotes,
      status: editStatus
    });

    setShowEditModal(false);
    setEditingApptId(null);
    alert('Cập nhật lịch hẹn thành công!');
  };

  // Stepper state
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
  const [bookingDate, setBookingDate] = useState('2026-07-08');
  const [bookingTime, setBookingTime] = useState('10:00');
  const [bookingNotes, setBookingNotes] = useState('');

  // Format currency
  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  // Filtered Appointments list
  const filteredAppointments = appointments.filter(appt => {
    const matchesSearch = 
      appt.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.customerPhone.includes(searchQuery) ||
      appt.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' ? true : appt.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle Booking Stepper Submit
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let customerName = '';
    let customerPhone = '';
    let customerAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPhGoTjtUutxMviwQA6tzgNLgwC3L905UOgKFihCIpyIjjRu_w3A2ql6Ldgf7SyHmH2W81se759xGRrYJpjrK3C6UrOcp8c4RvueFZ2ZjLiwHRpfzcz7uCaRG9fWRxIod9gR11Git42RpGQGQ-46USAyjgDUUR6WmgnV6PSeks4n5nAiH6qog5J5dpE9EIoZkAXx20kT38-oB2-wU8F9dzoq8SY_4L9fHCpTmv00D79cqTPAexmOHg8A'; // default secondary

    if (selectedCustomerId === 'new') {
      customerName = newCustomerName || 'Khách vãng lai';
      customerPhone = newCustomerPhone || '0900000000';
    } else {
      const selectedCust = customers.find(c => c.id === selectedCustomerId);
      if (selectedCust) {
        customerName = selectedCust.name;
        customerPhone = selectedCust.phone;
        customerAvatar = selectedCust.avatar;
      }
    }

    const selectedSrv = services.find(s => s.id === selectedServiceId);
    const selectedTech = technicians.find(t => t.id === selectedTechnicianId);

    if (!customerName || !selectedSrv || !selectedTech) {
      alert('Vui lòng hoàn thành tất cả các bước của lịch hẹn.');
      return;
    }

    onAddAppointment({
      customerId: selectedCustomerId === 'new' ? `cust_new_${Date.now()}` : selectedCustomerId,
      customerName,
      customerPhone,
      customerAvatar,
      serviceName: selectedSrv.name,
      price: selectedSrv.price,
      technicianId: selectedTech.id,
      technicianName: selectedTech.name,
      date: bookingDate,
      time: bookingTime,
      status: 'Chờ phục vụ',
      notes: bookingNotes
    });

    // Reset Stepper
    setShowBookingModal(false);
    setBookingStep(1);
    setSelectedCustomerId('');
    setNewCustomerName('');
    setNewCustomerPhone('');
    setSelectedServiceId('');
    setSelectedTechnicianId('');
    setBookingDate('2026-07-08');
    setBookingTime('10:00');
    setBookingNotes('');
  };

  const getServicePrice = () => {
    const srv = services.find(s => s.id === selectedServiceId);
    return srv ? formatVND(srv.price) : '0đ';
  };

  const getSelectedCustomer = () => {
    if (selectedCustomerId === 'new') return { name: newCustomerName, phone: newCustomerPhone, rank: 'Standard', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPhGoTjtUutxMviwQA6tzgNLgwC3L905UOgKFihCIpyIjjRu_w3A2ql6Ldgf7SyHmH2W81se759xGRrYJpjrK3C6UrOcp8c4RvueFZ2ZjLiwHRpfzcz7uCaRG9fWRxIod9gR11Git42RpGQGQ-46USAyjgDUUR6WmgnV6PSeks4n5nAiH6qog5J5dpE9EIoZkAXx20kT38-oB2-wU8F9dzoq8SY_4L9fHCpTmv00D79cqTPAexmOHg8A' };
    return customers.find(c => c.id === selectedCustomerId);
  };

  const getSelectedService = () => services.find(s => s.id === selectedServiceId);
  const getSelectedTechnician = () => technicians.find(t => t.id === selectedTechnicianId);

  return (
    <div id="appointments-view-root" className="space-y-6 animate-fade-in">
      
      {/* Header and Quick stats */}
      <div id="appointments-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 id="appt-page-title" className="text-xl font-bold text-slate-800 tracking-tight">Quản lý Lịch hẹn</h2>
          <p className="text-[10px] text-slate-400">Điều phối, sắp xếp và theo dõi trạng thái các ca liệu trình thẩm mỹ</p>
        </div>
        <button
          id="btn-trigger-booking-modal"
          onClick={() => setShowBookingModal(true)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all hover:scale-[1.01]"
        >
          <Plus className="h-4 w-4 text-amber-500" />
          <span>Tạo lịch hẹn mới</span>
        </button>
      </div>

      {/* Searching & Filter Tabs */}
      <div id="appointments-controls-bar" className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="flex items-center gap-2.5 w-full md:w-96 relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5" />
          <input
            id="appt-search-field"
            type="text"
            placeholder="Tìm theo khách hàng, SĐT hoặc dịch vụ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white focus:border-amber-500 transition-all duration-150"
          />
        </div>

        {/* Filter buttons */}
        <div id="appt-filter-tabs" className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(['All', 'Chờ phục vụ', 'Đang thực hiện', 'Hoàn thành', 'Đã huỷ'] as const).map((status) => (
            <button
              id={`filter-btn-${status}`}
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                statusFilter === status 
                  ? 'bg-slate-900 text-amber-400 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {status === 'All' ? 'Tất cả' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Appointments Table Card */}
      <div id="appointments-list-card" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table id="appointments-main-table" className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Khách hàng</th>
                <th className="px-6 py-4 font-semibold">Dịch vụ thẩm mỹ</th>
                <th className="px-6 py-4 font-semibold">Bác sĩ / KTV điều trị</th>
                <th className="px-6 py-4 font-semibold">Ngày hẹn</th>
                <th className="px-6 py-4 font-semibold">Giờ hẹn</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appt) => (
                  <tr id={`appt-table-row-${appt.id}`} key={appt.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={appt.customerAvatar} 
                          alt={appt.customerName} 
                          className="h-9 w-9 rounded-full object-cover border border-slate-100 shadow-sm shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors leading-tight">{appt.customerName}</p>
                          <p className="text-[10px] text-slate-400 font-medium font-mono mt-0.5">{appt.customerPhone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-800 leading-tight">{appt.serviceName}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{formatVND(appt.price)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 bg-amber-500 rounded-full"></span>
                        <span className="font-semibold text-slate-600">{appt.technicianName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600 font-medium font-mono">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{appt.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold font-mono">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{appt.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wide ${
                        appt.status === 'Hoàn thành' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' :
                        appt.status === 'Đang thực hiện' ? 'bg-amber-50 text-amber-700 border border-amber-200/50 animate-pulse' :
                        appt.status === 'Chờ phục vụ' ? 'bg-sky-50 text-sky-700 border border-sky-200/50' :
                        'bg-rose-50 text-rose-700 border border-rose-200/50'
                      }`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        {appt.status === 'Chờ phục vụ' && (
                          <button
                            id={`action-start-${appt.id}`}
                            onClick={() => onUpdateAppointmentStatus(appt.id, 'Đang thực hiện')}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[10px] rounded-lg transition-colors shadow-sm"
                          >
                            Phục vụ
                          </button>
                        )}
                        {appt.status === 'Đang thực hiện' && (
                          <button
                            id={`action-complete-${appt.id}`}
                            onClick={() => onUpdateAppointmentStatus(appt.id, 'Hoàn thành')}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded-lg transition-colors shadow-sm"
                          >
                            Hoàn thành
                          </button>
                        )}
                        {appt.status !== 'Hoàn thành' && appt.status !== 'Đã huỷ' && (
                          <button
                            id={`action-cancel-${appt.id}`}
                            onClick={() => onUpdateAppointmentStatus(appt.id, 'Đã huỷ')}
                            className="px-2 py-1.5 text-rose-500 hover:bg-rose-50 font-medium text-[10px] rounded-lg transition-colors"
                          >
                            Huỷ ca
                          </button>
                        )}
                        
                        {onUpdateAppointment && (
                          <button
                            onClick={() => handleStartEditAppt(appt)}
                            className="p-1 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Sửa lịch hẹn"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {onDeleteAppointment && (
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc chắn muốn xóa lịch hẹn của khách hàng "${appt.customerName}" không?`)) {
                                onDeleteAppointment(appt.id);
                                alert('Xóa lịch hẹn thành công!');
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Xóa lịch hẹn"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Không tìm thấy lịch hẹn phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Stepper Modal */}
      {showBookingModal && (
        <div id="booking-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div id="booking-modal-content" className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Tạo lịch hẹn điều trị mới</h3>
                  <p className="text-[10px] text-slate-400">Theo quy trình chuẩn 4 bước phục vụ cao cấp</p>
                </div>
              </div>
              <button 
                id="booking-close-btn"
                onClick={() => setShowBookingModal(false)}
                className="p-1.5 hover:bg-slate-200/70 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Step Indicators */}
            <div className="px-8 py-4 border-b border-slate-50 bg-white flex items-center justify-between text-xs">
              {[
                { step: 1, label: 'Chọn Khách hàng' },
                { step: 2, label: 'Chọn Dịch vụ' },
                { step: 3, label: 'Kỹ thuật viên & Giờ hẹn' },
                { step: 4, label: 'Xác nhận lịch' }
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-2">
                  <span className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    bookingStep === item.step 
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' 
                      : bookingStep > item.step 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-100 text-slate-400'
                  }`}>
                    {bookingStep > item.step ? '✓' : item.step}
                  </span>
                  <span className={`font-semibold hidden sm:inline ${
                    bookingStep === item.step ? 'text-slate-800' : 'text-slate-400'
                  }`}>{item.label}</span>
                  {item.step < 4 && <ChevronRight className="h-3.5 w-3.5 text-slate-300 hidden sm:block" />}
                </div>
              ))}
            </div>

            {/* Stepper Content Form */}
            <form onSubmit={handleBookingSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
              
              {/* STEP 1: Select Customer */}
              {bookingStep === 1 && (
                <div id="booking-step-1" className="space-y-4 animate-fade-in">
                  <div className="bg-amber-500/5 rounded-2xl p-4 border border-amber-500/10 mb-4 flex items-start gap-3">
                    <Users className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-900">Bước 1: Chọn hoặc khai báo khách hàng</p>
                      <p className="text-[10px] text-amber-700/80 leading-relaxed mt-0.5">Tìm kiếm khách hàng đã lưu trữ trong CRM hoặc chọn Thêm khách hàng mới nếu đây là lần đầu tiên khách ghé thăm cơ sở.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Option 1: Existing Customers Card */}
                    <div 
                      onClick={() => setSelectedCustomerId(customers[0]?.id || '')}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedCustomerId && selectedCustomerId !== 'new'
                          ? 'border-amber-500 bg-amber-50/25'
                          : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <img 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqgNK7wDBCLPEB5ltOOeB5qtCNSflyX-OI917IvofLJeVdgjp33c0zZdqJUH8n-jCn9sYW-tpGg9lgcRrWwssTPawj2ssM_ZeCe3V7qGZW8cZyV86IC3rZlJbdLITeEKB9cJdv362OHACuSD5aIvW-dwU9dv9iviBUiV6T8QEza8DANmrkn9P48dQ2kMyr0q0W69Gv9af_ueE8Dwczt0DbWPQ1P-469JsUZOeVwX0UFU8J1w1GHOfqvg" 
                          alt="Select customer option" 
                          className="h-10 w-10 rounded-xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-800">Chọn khách hàng từ hệ thống</p>
                          <p className="text-[10px] text-slate-400">Danh bạ VIP, Thành viên và Khách hàng cũ</p>
                        </div>
                      </div>

                      <select
                        id="booking-customer-select"
                        value={selectedCustomerId === 'new' ? '' : selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="">-- Chọn khách hàng --</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>{c.name} ({c.phone}) - {c.rank}</option>
                        ))}
                      </select>
                    </div>

                    {/* Option 2: Add New Customer Card */}
                    <div 
                      onClick={() => setSelectedCustomerId('new')}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedCustomerId === 'new'
                          ? 'border-amber-500 bg-amber-50/25'
                          : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <img 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPhGoTjtUutxMviwQA6tzgNLgwC3L905UOgKFihCIpyIjjRu_w3A2ql6Ldgf7SyHmH2W81se759xGRrYJpjrK3C6UrOcp8c4RvueFZ2ZjLiwHRpfzcz7uCaRG9fWRxIod9gR11Git42RpGQGQ-46USAyjgDUUR6WmgnV6PSeks4n5nAiH6qog5J5dpE9EIoZkAXx20kT38-oB2-wU8F9dzoq8SY_4L9fHCpTmv00D79cqTPAexmOHg8A" 
                          alt="Create new customer option" 
                          className="h-10 w-10 rounded-xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-800">Thêm mới khách hàng vãng lai</p>
                          <p className="text-[10px] text-slate-400">Đăng ký hồ sơ mới cho khách hàng</p>
                        </div>
                      </div>

                      {selectedCustomerId === 'new' ? (
                        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            id="new-customer-name"
                            type="text"
                            placeholder="Họ và tên khách hàng *"
                            value={newCustomerName}
                            onChange={(e) => setNewCustomerName(e.target.value)}
                            required
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white text-slate-700"
                          />
                          <input
                            id="new-customer-phone"
                            type="text"
                            placeholder="Số điện thoại *"
                            value={newCustomerPhone}
                            onChange={(e) => setNewCustomerPhone(e.target.value)}
                            required
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white text-slate-700"
                          />
                        </div>
                      ) : (
                        <div className="py-5 text-center text-[10px] text-slate-400 font-semibold">
                          Click để đăng ký thông tin mới
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Select Service */}
              {bookingStep === 2 && (
                <div id="booking-step-2" className="space-y-4 animate-fade-in">
                  <div className="bg-amber-500/5 rounded-2xl p-4 border border-amber-500/10 mb-4 flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-900">Bước 2: Chọn dịch vụ trị liệu thẩm mỹ</p>
                      <p className="text-[10px] text-amber-700/80 leading-relaxed mt-0.5">Chọn đúng công nghệ hoặc phác đồ khách yêu cầu để tối ưu phòng máy và thời lượng phục vụ.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto pr-1">
                    {services.map((srv) => (
                      <div
                        id={`srv-option-${srv.id}`}
                        key={srv.id}
                        onClick={() => setSelectedServiceId(srv.id)}
                        className={`p-3.5 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                          selectedServiceId === srv.id
                            ? 'border-amber-500 bg-amber-50/15'
                            : 'border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-800 leading-tight">{srv.name}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-semibold">{srv.category} • Thời lượng: {srv.durationMin} phút</p>
                        </div>
                        <span className="text-xs font-bold text-amber-600 font-mono">
                          {formatVND(srv.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: Select Tech, Date, Time */}
              {bookingStep === 3 && (
                <div id="booking-step-3" className="space-y-4 animate-fade-in">
                  <div className="bg-amber-500/5 rounded-2xl p-4 border border-amber-500/10 mb-4 flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-900">Bước 3: Chỉ định Bác sĩ/KTV & Lên lịch</p>
                      <p className="text-[10px] text-amber-700/80 leading-relaxed mt-0.5">Xác định clinician chịu trách nhiệm chính và giờ đặt lịch chính xác để tránh chồng chéo lịch phòng máy.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Select Technician */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-2.5">Chỉ định Bác sĩ / Clinician *</label>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {technicians.map((tech) => (
                          <div
                            id={`tech-option-${tech.id}`}
                            key={tech.id}
                            onClick={() => setSelectedTechnicianId(tech.id)}
                            className={`p-2.5 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                              selectedTechnicianId === tech.id
                                ? 'border-amber-500 bg-amber-50/15'
                                : 'border-slate-100 hover:border-slate-200'
                            }`}
                          >
                            <img 
                              src={tech.avatar} 
                              alt={tech.name} 
                              className="h-8.5 w-8.5 rounded-full object-cover border border-slate-100"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-800 leading-none">{tech.name}</p>
                              <p className="text-[9px] text-slate-400 font-medium mt-1">{tech.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Select Date and Time */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Ngày hẹn điều trị *</label>
                        <input
                          id="booking-date"
                          type="date"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          required
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Giờ hẹn *</label>
                        <input
                          id="booking-time"
                          type="time"
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          required
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Ghi chú lâm sàng / dặn dò</label>
                        <textarea
                          id="booking-notes"
                          placeholder="Nhập ghi chú ví dụ: Bôi tê trước 45p, da nhạy cảm..."
                          value={bookingNotes}
                          onChange={(e) => setBookingNotes(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 h-20 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Confirm booking */}
              {bookingStep === 4 && (
                <div id="booking-step-4" className="space-y-4 animate-fade-in">
                  <div className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/10 mb-4 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900">Bước 4: Xác nhận và Đăng ký lịch hẹn</p>
                      <p className="text-[10px] text-emerald-700/80 leading-relaxed mt-0.5">Vui lòng rà soát lại thông tin. Sau khi xác nhận, lịch hẹn sẽ được lưu trực tiếp vào cơ sở dữ liệu phòng máy Kim Seoul.</p>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl space-y-4 text-xs text-slate-700">
                    <div className="flex items-center gap-4 border-b border-slate-200/60 pb-4">
                      <img 
                        src={getSelectedCustomer()?.avatar} 
                        alt="Customer" 
                        className="h-12 w-12 rounded-full object-cover border border-amber-200"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Khách hàng</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{getSelectedCustomer()?.name}</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{getSelectedCustomer()?.phone}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-b border-slate-200/60 pb-4">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Dịch vụ chỉ định</span>
                        <p className="font-bold text-slate-800 mt-1">{getSelectedService()?.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{getSelectedService()?.category} • {getSelectedService()?.durationMin} phút</p>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Bác sĩ / KTV thực hiện</span>
                        <p className="font-bold text-slate-800 mt-1">{getSelectedTechnician()?.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{getSelectedTechnician()?.role}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-b border-slate-200/60 pb-4">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Thời gian trị liệu</span>
                        <p className="font-bold text-slate-900 mt-1 font-mono">{bookingTime} | {bookingDate}</p>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Tổng giá trị hóa đơn</span>
                        <p className="text-sm font-extrabold text-amber-600 mt-1 font-mono">{getServicePrice()}</p>
                      </div>
                    </div>

                    {bookingNotes && (
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Ghi chú phòng máy</span>
                        <p className="text-xs text-slate-500 italic mt-1 font-medium">{bookingNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </form>

            {/* Stepper Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                id="booking-prev-btn"
                type="button"
                disabled={bookingStep === 1}
                onClick={() => setBookingStep(bookingStep - 1)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors ${
                  bookingStep === 1
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Quay lại</span>
              </button>

              {bookingStep < 4 ? (
                <button
                  id="booking-next-btn"
                  type="button"
                  disabled={
                    (bookingStep === 1 && !selectedCustomerId) ||
                    (bookingStep === 2 && !selectedServiceId) ||
                    (bookingStep === 3 && (!selectedTechnicianId || !bookingDate || !bookingTime))
                  }
                  onClick={() => setBookingStep(bookingStep + 1)}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm ${
                    ((bookingStep === 1 && !selectedCustomerId) ||
                     (bookingStep === 2 && !selectedServiceId) ||
                     (bookingStep === 3 && (!selectedTechnicianId || !bookingDate || !bookingTime)))
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-[1.01]'
                  }`}
                >
                  <span>Tiếp tục</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  id="booking-submit-btn"
                  onClick={handleBookingSubmit}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/15 transition-all hover:scale-[1.01]"
                >
                  <UserCheck className="h-4 w-4" />
                  <span>Xác nhận & Đặt lịch</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && (
        <div id="edit-appt-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div id="edit-appt-modal-content" className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="font-bold text-slate-900 text-sm">Chỉnh sửa thông tin Lịch hẹn</span>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditApptSubmit} className="p-6 space-y-4 text-xs text-slate-700">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Dịch vụ điều trị *</label>
                <select
                  id="edit-appt-srv-select"
                  value={editServiceId}
                  onChange={(e) => setEditServiceId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({formatVND(s.price)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Bác sĩ / Kỹ thuật viên *</label>
                <select
                  id="edit-appt-tech-select"
                  value={editTechnicianId}
                  onChange={(e) => setEditTechnicianId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.role})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Ngày hẹn *</label>
                  <input
                    id="edit-appt-date"
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Giờ hẹn *</label>
                  <input
                    id="edit-appt-time"
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Trạng thái ca hẹn *</label>
                <select
                  id="edit-appt-status"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as Appointment['status'])}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                >
                  <option value="Chờ phục vụ">Chờ phục vụ</option>
                  <option value="Đang thực hiện">Đang thực hiện</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                  <option value="Đã huỷ">Đã huỷ</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Ghi chú điều trị</label>
                <textarea
                  id="edit-appt-notes"
                  placeholder="Yêu cầu chuẩn bị đặc biệt..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 h-20 resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  id="edit-appt-cancel"
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  id="edit-appt-submit"
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
