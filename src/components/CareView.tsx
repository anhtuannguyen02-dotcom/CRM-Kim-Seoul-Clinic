import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Search, 
  PhoneCall, 
  MessageSquare, 
  Gift, 
  Check, 
  Clock, 
  Sparkles,
  Calendar,
  CheckCircle,
  Plus,
  X,
  Edit3,
  Trash2,
  Download,
  Send
} from 'lucide-react';
import { CRMTask, Customer } from '../types';
import { exportToExcel } from '../utils/exportToExcel';
import { sendZaloMessage, sendSMSMessage } from '../utils/messagingService';

interface CareViewProps {
  crmTasks: CRMTask[];
  customers: Customer[];
  onCompleteTask: (id: string) => void;
  onAddLog: (taskId: string, log: { note: string; channel: 'Gọi điện' | 'SMS' | 'Zalo' }) => void;
  onAddTask?: (task: Omit<CRMTask, 'id' | 'loggedInteractions'>) => void;
  onUpdateTask?: (id: string, updatedFields: Partial<CRMTask>) => void;
  onDeleteTask?: (id: string) => void;
}

export default function CareView({
  crmTasks,
  customers,
  onCompleteTask,
  onAddLog,
  onAddTask,
  onUpdateTask,
  onDeleteTask
}: CareViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('pending');
  const [typeFilter, setTypeFilter] = useState<'All' | CRMTask['type']>('All');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  // Log entry state
  const [logNote, setLogNote] = useState('');
  const [logChannel, setLogChannel] = useState<'Gọi điện' | 'SMS' | 'Zalo'>('Gọi điện');

  // Automated message state
  const [autoMessageChannel, setAutoMessageChannel] = useState<'SMS' | 'Zalo'>('Zalo');
  const [autoMessageText, setAutoMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Load template dynamically when task selection or channel selection changes
  React.useEffect(() => {
    if (!selectedTaskId) return;
    const task = crmTasks.find(t => t.id === selectedTaskId);
    if (!task) return;

    let template = '';
    if (task.type === 'Sau liệu trình') {
      template = `Viện thẩm mỹ Kim Seoul Premium xin chào chị ${task.customerName}. Ngày hôm qua chị đã thực hiện dịch vụ ${task.serviceName || 'chăm sóc da cao cấp'}. Da của chị hiện có bị đỏ hay sưng nhẹ không ạ? Chị nhớ đắp mặt nạ phục hồi và bôi kem chống nắng đầy đủ nhé. Nếu cần hỗ trợ chị cứ liên hệ hotline 0909.123.456 ạ!`;
    } else if (task.type === 'Nhắc lịch dặm') {
      template = `Chào chị ${task.customerName}, Kim Seoul Premium xin thông báo đã đến thời gian dặm lại liệu trình ${task.serviceName || 'chăm sóc'} của mình để duy trì hiệu quả tối ưu nhất. Kim Seoul có thể hỗ trợ đặt lịch hẹn cho chị vào lúc mấy giờ hôm nay ạ?`;
    } else if (task.type === 'Sinh nhật') {
      template = `Chúc mừng sinh nhật chị ${task.customerName}! Kim Seoul Premium kính chúc chị tuổi mới luôn rạng rỡ, xinh đẹp và hạnh phúc. Để tri ân, Kim Seoul xin gửi tặng chị mã ưu đãi giảm 20% cho tất cả dịch vụ và liệu trình trong tháng sinh nhật của chị ạ.`;
    } else { // Ưu đãi VIP
      template = `Chào chị ${task.customerName}, Kim Seoul Premium xin gửi tới chị chương trình tri ân khách hàng VIP đặc quyền tuần này: Giảm ngay 30% khi đặt lịch trải nghiệm Liệu trình Nâng cơ xóa nhăn Meso Lift thế hệ mới. Đặt lịch ngay hôm nay chị nhé!`;
    }

    setAutoMessageText(template);
    setSendStatus(null);
  }, [selectedTaskId, autoMessageChannel, crmTasks]);

  const handleSendAutoMessage = async () => {
    const task = crmTasks.find(t => t.id === selectedTaskId);
    if (!task || !autoMessageText) return;
    setIsSending(true);
    setSendStatus(null);

    try {
      let result;
      if (autoMessageChannel === 'Zalo') {
        result = await sendZaloMessage(task.customerPhone, autoMessageText);
      } else {
        result = await sendSMSMessage(task.customerPhone, autoMessageText);
      }

      setSendStatus({ success: result.success, message: result.message });

      if (result.success) {
        // Automatically append to Interaction Log and complete task
        onAddLog(task.id, {
          note: `[Gửi ${autoMessageChannel} Tự động] ${autoMessageText}`,
          channel: autoMessageChannel
        });
      }
    } catch (err: any) {
      setSendStatus({ success: false, message: `Lỗi hệ thống: ${err.message || err}` });
    } finally {
      setIsSending(false);
    }
  };


  // Add CRM Task States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskCustomerId, setNewTaskCustomerId] = useState('');
  const [newTaskType, setNewTaskType] = useState<CRMTask['type']>('Sau liệu trình');
  const [newTaskServiceName, setNewTaskServiceName] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-07-15');

  // Edit CRM Task States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskType, setEditTaskType] = useState<CRMTask['type']>('Sau liệu trình');
  const [editTaskServiceName, setEditTaskServiceName] = useState('');
  const [editTaskDescription, setEditTaskDescription] = useState('');
  const [editTaskDueDate, setEditTaskDueDate] = useState('');
  const [editTaskStatus, setEditTaskStatus] = useState<CRMTask['status']>('Cần liên hệ');

  const handleStartEditTask = (task: CRMTask) => {
    setEditingTaskId(task.id);
    setEditTaskType(task.type);
    setEditTaskServiceName(task.serviceName || '');
    setEditTaskDescription(task.description);
    setEditTaskDueDate(task.dueDate);
    setEditTaskStatus(task.status);
    setShowEditModal(true);
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskCustomerId || !newTaskDescription || !onAddTask) return;

    const selectedCust = customers.find(c => c.id === newTaskCustomerId);
    if (!selectedCust) return;

    onAddTask({
      customerId: selectedCust.id,
      customerName: selectedCust.name,
      customerPhone: selectedCust.phone,
      customerAvatar: selectedCust.avatar,
      type: newTaskType,
      serviceName: newTaskServiceName || undefined,
      description: newTaskDescription,
      dueDate: newTaskDueDate,
      status: 'Cần liên hệ'
    });

    setShowAddModal(false);
    setNewTaskCustomerId('');
    setNewTaskServiceName('');
    setNewTaskDescription('');
    setNewTaskDueDate('2026-07-15');
    alert('Thêm nhiệm vụ chăm sóc thành công!');
  };

  const handleEditTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTaskId || !editTaskDescription || !onUpdateTask) return;

    onUpdateTask(editingTaskId, {
      type: editTaskType,
      serviceName: editTaskServiceName || undefined,
      description: editTaskDescription,
      dueDate: editTaskDueDate,
      status: editTaskStatus
    });

    setShowEditModal(false);
    setEditingTaskId(null);
    alert('Cập nhật nhiệm vụ thành công!');
  };

  // Filter tasks
  const filteredTasks = crmTasks.filter(task => {
    const matchesSearch = task.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || task.customerPhone.includes(searchQuery);
    const matchesType = typeFilter === 'All' ? true : task.type === typeFilter;
    
    let matchesStatus = true;
    if (activeTab === 'pending') matchesStatus = task.status !== 'Đã hoàn thành';
    else if (activeTab === 'completed') matchesStatus = task.status === 'Đã hoàn thành';
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const selectedTask = crmTasks.find(t => t.id === selectedTaskId);

  const handleSubmitLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId || !logNote) return;

    onAddLog(selectedTaskId, {
      note: logNote,
      channel: logChannel
    });

    setLogNote('');
  };

  return (
    <div id="care-view-root" className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      
      {/* Left 2 Columns: Tasks list */}
      <div id="care-left-columns" className="lg:col-span-2 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 id="care-page-title" className="text-xl font-bold text-slate-800">Chăm sóc Khách hàng</h2>
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-export-care-excel"
                  onClick={() => {
                    exportToExcel(
                      filteredTasks,
                      ['Mã Nhiệm vụ', 'Khách hàng', 'Số điện thoại', 'Loại chăm sóc', 'Liên quan Dịch vụ', 'Nội dung dặn dò', 'Ngày cần gọi', 'Trạng thái'],
                      ['id', 'customerName', 'customerPhone', 'type', 'serviceName', 'description', 'dueDate', 'status'],
                      'Danh_sach_Cham_soc_Khach_hang'
                    );
                  }}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm transition-all"
                  title="Xuất danh sách chăm sóc ra Excel"
                >
                  <Download className="h-3 w-3 text-emerald-100" /> Xuất Excel
                </button>
                {onAddTask && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-850 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Plus className="h-3 w-3 text-amber-500" /> Thêm việc
                  </button>
                )}
              </div>
            </div>
            <p className="text-[10px] text-slate-400">Điều phối các chiến dịch tri ân, dặn dò hồi phục sau liệu trình</p>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <button
              id="care-tab-pending"
              onClick={() => setActiveTab('pending')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Cần liên hệ ({crmTasks.filter(t => t.status !== 'Đã hoàn thành').length})
            </button>
            <button
              id="care-tab-completed"
              onClick={() => setActiveTab('completed')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'completed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Đã liên hệ ({crmTasks.filter(t => t.status === 'Đã hoàn thành').length})
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <div id="care-filters-card" className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 text-slate-400 absolute left-3" />
            <input
              id="care-search-input"
              type="text"
              placeholder="Tìm theo tên thọ khách..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          <div id="care-type-filters" className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {(['All', 'Sau liệu trình', 'Nhắc lịch dặm', 'Sinh nhật', 'Ưu đãi VIP'] as const).map((type) => (
              <button
                id={`care-filter-${type}`}
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-bold whitespace-nowrap transition-colors ${
                  typeFilter === type 
                    ? 'bg-slate-900 text-amber-400' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {type === 'All' ? 'Tất cả dạng' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Task cards listing */}
        <div id="care-tasks-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const isOverdue = task.status !== 'Đã hoàn thành' && task.dueDate < '2026-07-08';
              const isDueToday = task.status !== 'Đã hoàn thành' && task.dueDate === '2026-07-08';
              return (
                <div
                  id={`care-task-card-${task.id}`}
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className={`rounded-2xl p-5 border cursor-pointer transition-all ${
                    selectedTaskId === task.id
                      ? 'border-amber-500 shadow-md ring-1 ring-amber-500/20 bg-white'
                      : isOverdue
                      ? 'bg-rose-50/20 border-rose-200 hover:border-rose-300'
                      : isDueToday
                      ? 'bg-amber-50/15 border-amber-200 hover:border-amber-300'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <img 
                      src={task.customerAvatar} 
                      alt={task.customerName} 
                      className="h-10 w-10 rounded-full object-cover border border-slate-100 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <p className="text-xs font-bold text-slate-900 truncate leading-none">{task.customerName}</p>
                        <div className="flex items-center gap-1 shrink-0">
                          {isOverdue && (
                            <span className="inline-block px-1 py-0.5 text-[8px] font-extrabold uppercase bg-rose-500 text-white rounded animate-pulse mr-1">
                              ⚠️ Trễ hạn
                            </span>
                          )}
                          {isDueToday && (
                            <span className="inline-block px-1 py-0.5 text-[8px] font-extrabold uppercase bg-amber-500 text-slate-950 rounded mr-1">
                              ⏰ Hôm nay
                            </span>
                          )}
                          <span className={`inline-block px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide rounded ${
                            task.type === 'Sau liệu trình' ? 'bg-indigo-50 text-indigo-700' :
                            task.type === 'Nhắc lịch dặm' ? 'bg-amber-50 text-amber-700' :
                            task.type === 'Sinh nhật' ? 'bg-rose-50 text-rose-700' :
                            'bg-emerald-50 text-emerald-700'
                          }`}>
                            {task.type}
                          </span>

                          {onUpdateTask && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEditTask(task);
                              }}
                              className="p-1 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-slate-50 transition-colors animate-none"
                              title="Chỉnh sửa nhiệm vụ"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {onDeleteTask && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Bạn có chắc chắn muốn xóa nhiệm vụ chăm sóc cho khách hàng "${task.customerName}" không?`)) {
                                  onDeleteTask(task.id);
                                  if (selectedTaskId === task.id) {
                                    setSelectedTaskId(null);
                                  }
                                  alert('Đã xóa nhiệm vụ!');
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-50 transition-colors"
                              title="Xóa nhiệm vụ"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2 font-medium leading-relaxed font-sans min-h-[30px] line-clamp-2">
                        {task.description}
                      </p>

                      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className={`font-medium font-mono flex items-center gap-1 ${
                          isOverdue ? 'text-rose-600 font-bold' : isDueToday ? 'text-amber-600 font-bold' : 'text-slate-400'
                        }`}>
                          <Clock className={`h-3.5 w-3.5 ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`} />
                          Hạn: {task.dueDate}
                        </span>

                        {task.status !== 'Đã hoàn thành' ? (
                          <button
                            id={`btn-complete-quick-${task.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onCompleteTask(task.id);
                            }}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-[9px] rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Check className="h-3 w-3" />
                            Hoàn thành
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            ✓ Đã xong
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 bg-white rounded-2xl p-12 text-center text-xs text-slate-400">
              Không tìm thấy nhiệm vụ chăm sóc
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Interactive CRM log panel */}
      <div id="care-right-column" className="lg:col-span-1">
        {selectedTask ? (
          <div id="care-interaction-card" className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <img 
                src={selectedTask.customerAvatar} 
                alt={selectedTask.customerName} 
                className="h-12 w-12 rounded-full object-cover border border-amber-200"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">{selectedTask.customerName}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{selectedTask.customerPhone}</p>
              </div>
            </div>

            {/* Task Info details */}
            <div className="space-y-3">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Nội dung chăm sóc</span>
                <p className="text-xs text-slate-700 font-medium leading-relaxed mt-1">
                  {selectedTask.description}
                </p>
              </div>
              {selectedTask.serviceName && (
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Liệu trình liên quan</span>
                  <p className="text-xs text-slate-800 font-bold mt-0.5">{selectedTask.serviceName}</p>
                </div>
              )}
            </div>

            {/* Past Interactions Log timeline */}
            <div className="space-y-3">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Nhật ký tiếp cận</span>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {selectedTask.loggedInteractions && selectedTask.loggedInteractions.length > 0 ? (
                  selectedTask.loggedInteractions.map((log, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px]">
                      <div className="flex items-center justify-between font-bold text-slate-700">
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-emerald-500" />
                          Dùng {log.channel}
                        </span>
                        <span className="font-mono text-slate-400">{log.date}</span>
                      </div>
                      <p className="text-slate-500 mt-1.5 font-medium leading-relaxed">{log.note}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-400 italic">Chưa ghi nhận cuộc gọi/SMS nào.</p>
                )}
              </div>
            </div>

            {/* Automatic Messaging Section */}
            {selectedTask.status !== 'Đã hoàn thành' && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-wider text-slate-800 font-bold block flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Gửi Zalo OA / SMS Tự động
                  </span>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg text-[9px] font-bold">
                    <button
                      type="button"
                      onClick={() => setAutoMessageChannel('Zalo')}
                      className={`px-2 py-0.5 rounded-md transition-all ${
                        autoMessageChannel === 'Zalo' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-850'
                      }`}
                    >
                      Zalo OA
                    </button>
                    <button
                      type="button"
                      onClick={() => setAutoMessageChannel('SMS')}
                      className={`px-2 py-0.5 rounded-md transition-all ${
                        autoMessageChannel === 'SMS' ? 'bg-amber-600 text-white' : 'text-slate-500 hover:text-slate-850'
                      }`}
                    >
                      SMS
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold">
                    <span>MẪU TIN NHẮN ({autoMessageChannel})</span>
                    <span className="font-mono text-[8px] bg-slate-200/60 text-slate-600 px-1 py-0.5 rounded">
                      {autoMessageText.length} kí tự
                    </span>
                  </div>
                  <textarea
                    value={autoMessageText}
                    onChange={(e) => setAutoMessageText(e.target.value)}
                    className="w-full text-[10px] leading-relaxed bg-white border border-slate-200/80 rounded-xl p-2.5 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 h-24 resize-none"
                    placeholder="Nội dung tin nhắn..."
                  />

                  {sendStatus && (
                    <div className={`p-2.5 rounded-xl text-[9px] font-bold leading-relaxed ${
                      sendStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60' : 'bg-rose-50 text-rose-800 border border-rose-200/60'
                    }`}>
                      {sendStatus.message}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSendAutoMessage}
                    disabled={isSending || !autoMessageText}
                    className={`w-full py-2 rounded-xl text-white text-[10px] font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                      autoMessageChannel === 'Zalo' 
                        ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300' 
                        : 'bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300'
                    }`}
                  >
                    {isSending ? (
                      <span className="inline-block animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                    Gửi thông báo tự động
                  </button>
                </div>
              </div>
            )}

            {/* Log Entry Form */}
            {selectedTask.status !== 'Đã hoàn thành' && (
              <form onSubmit={handleSubmitLog} className="space-y-4 pt-4 border-t border-slate-100 text-xs">
                <span className="text-[9px] uppercase tracking-wider text-amber-800 font-bold block">Ghi lại kết quả tiếp cận thủ công</span>
                
                <div>
                  <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1.5">Kênh tương tác</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Gọi điện', 'SMS', 'Zalo'] as const).map((channel) => (
                      <button
                        id={`btn-channel-${channel}`}
                        key={channel}
                        type="button"
                        onClick={() => setLogChannel(channel)}
                        className={`py-1.5 rounded-lg font-bold text-[10px] text-center border transition-all ${
                          logChannel === channel 
                            ? 'bg-slate-900 border-slate-900 text-amber-400 shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {channel}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1.5">Kết quả cuộc gọi / phản hồi của khách *</label>
                  <textarea
                    id="interaction-note-input"
                    placeholder="Khách khen Meso tiêm không đau, hẹn dặm lại tuần sau..."
                    value={logNote}
                    onChange={(e) => setLogNote(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 h-20 resize-none"
                  />
                </div>

                <button
                  id="btn-save-interaction"
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                >
                  Lưu nhật ký tiếp cận
                </button>
              </form>
            )}

          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center text-xs text-slate-400">
            Hãy chọn một việc cần chăm sóc bên trái để theo dõi nhật ký tiếp cận và ghi nhận lịch sử chăm sóc khách hàng.
          </div>
        )}
      </div>

      {/* Add CRM Task Modal */}
      {showAddModal && (
        <div id="add-task-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div id="add-task-modal-content" className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="font-bold text-slate-900 text-sm">Thêm nhiệm vụ chăm sóc khách hàng</span>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="p-6 space-y-4 text-xs text-slate-700">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Khách hàng nhận chăm sóc *</label>
                <select
                  id="new-task-cust-select"
                  value={newTaskCustomerId}
                  onChange={(e) => setNewTaskCustomerId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="">-- Chọn khách hàng --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Loại chăm sóc *</label>
                  <select
                    id="new-task-type-select"
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value as CRMTask['type'])}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Sau liệu trình">Sau liệu trình</option>
                    <option value="Nhắc lịch dặm">Nhắc lịch dặm</option>
                    <option value="Sinh nhật">Sinh nhật</option>
                    <option value="Ưu đãi VIP">Ưu đãi VIP</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Hạn hoàn thành *</label>
                  <input
                    id="new-task-due"
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Liệu trình liên quan (Không bắt buộc)</label>
                <input
                  id="new-task-srv"
                  type="text"
                  placeholder="E.g. Tiêm Meso, Laser Pico, v.v."
                  value={newTaskServiceName}
                  onChange={(e) => setNewTaskServiceName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Mô tả chi tiết việc cần chăm sóc *</label>
                <textarea
                  id="new-task-desc"
                  placeholder="E.g. Nhắc nhở dặn dâu sau tiêm, thăm hỏi dặm lại..."
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 h-20 resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  id="add-task-cancel"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  id="add-task-submit"
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm"
                >
                  Tạo nhiệm vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit CRM Task Modal */}
      {showEditModal && (
        <div id="edit-task-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div id="edit-task-modal-content" className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="font-bold text-slate-900 text-sm">Chỉnh sửa nhiệm vụ chăm sóc</span>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditTaskSubmit} className="p-6 space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Loại chăm sóc *</label>
                  <select
                    id="edit-task-type-select"
                    value={editTaskType}
                    onChange={(e) => setEditTaskType(e.target.value as CRMTask['type'])}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Sau liệu trình">Sau liệu trình</option>
                    <option value="Nhắc lịch dặm">Nhắc lịch dặm</option>
                    <option value="Sinh nhật">Sinh nhật</option>
                    <option value="Ưu đãi VIP">Ưu đãi VIP</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Hạn hoàn thành *</label>
                  <input
                    id="edit-task-due"
                    type="date"
                    value={editTaskDueDate}
                    onChange={(e) => setEditTaskDueDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Liệu trình liên quan</label>
                  <input
                    id="edit-task-srv"
                    type="text"
                    placeholder="E.g. Tiêm Meso, Laser Pico, v.v."
                    value={editTaskServiceName}
                    onChange={(e) => setEditTaskServiceName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Trạng thái *</label>
                  <select
                    id="edit-task-status-select"
                    value={editTaskStatus}
                    onChange={(e) => setEditTaskStatus(e.target.value as CRMTask['status'])}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Cần liên hệ">Cần liên hệ</option>
                    <option value="Đang xử lý">Đang xử lý</option>
                    <option value="Đã hoàn thành">Đã hoàn thành</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Mô tả chi tiết việc cần chăm sóc *</label>
                <textarea
                  id="edit-task-desc"
                  placeholder="E.g. Nhắc nhở dặn dâu sau tiêm, thăm hỏi dặm lại..."
                  value={editTaskDescription}
                  onChange={(e) => setEditTaskDescription(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 h-20 resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  id="edit-task-cancel"
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  id="edit-task-submit"
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
