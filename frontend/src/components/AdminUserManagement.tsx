'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Crown,
  Search,
  RefreshCw,
  Loader2,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  X,
  Lock,
  Unlock,
  Star,
  Sparkles,
  Mail,
  UserCheck,
  UserX,
  Key,
  Eye,
  Download,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { User, Role, UserStatus, CreateUserData, UpdateUserData } from '@/types/auth';
import { ApiClient } from '@/lib/api-client';
import { CustomSelect } from '@/components/CustomSelect';

interface AdminUserManagementProps {
  currentUser: User | null;
  showToast: (type: 'success' | 'error', message: string) => void;
}

export function AdminUserManagement({ currentUser, showToast }: AdminUserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | Role>('ALL');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'PRO' | 'FREE'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | UserStatus>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('USER');
  const [status, setStatus] = useState<UserStatus>('ACTIVE');
  const [isPro, setIsPro] = useState(false);
  const [downloadsCount, setDownloadsCount] = useState<number>(0);

  // Delete State
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Action Loading state per user
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch users from backend
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await ApiClient.getAdminUsers();
      setUsers(data);
    } catch (err: any) {
      console.warn('Failed to load users from backend:', err);
      showToast('error', 'Không thể kết nối đến máy chủ lấy danh sách tài khoản');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesId = u.id.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesId) return false;
      }

      // Role Filter
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;

      // Tier Filter
      if (tierFilter === 'PRO' && !u.isPro) return false;
      if (tierFilter === 'FREE' && u.isPro) return false;

      // Status Filter
      if (statusFilter !== 'ALL' && (u.status || 'ACTIVE') !== statusFilter) return false;

      return true;
    });
  }, [users, searchQuery, roleFilter, tierFilter, statusFilter]);

  // Stats
  const totalCount = users.length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const proCount = users.filter((u) => u.isPro).length;
  const bannedCount = users.filter((u) => u.status === 'BANNED').length;

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('user123');
    setRole('USER');
    setStatus('ACTIVE');
    setIsPro(false);
    setDownloadsCount(0);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword(''); // Leave blank if not changing
    setRole(user.role);
    setStatus(user.status || 'ACTIVE');
    setIsPro(!!user.isPro);
    setDownloadsCount(user.downloadsCount ?? 0);
    setIsModalOpen(true);
  };

  // Export Users to CSV
  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      showToast('error', 'Không có dữ liệu người dùng để xuất CSV');
      return;
    }

    const headers = [
      'ID',
      'Họ Tên',
      'Email',
      'Vai Trò',
      'Gói Cước',
      'Tổng Lượt Tải SFX',
      'Lượt Tải Hôm Nay',
      'Trạng Thái',
      'Phương Thức Đăng Nhập',
      'Ngày Tạo',
    ];
    const rows = filteredUsers.map((u) => [
      `"${u.id}"`,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${u.role}"`,
      `"${u.isPro ? 'PRO VIP' : 'FREE'}"`,
      `"${u.downloadsCount ?? 0}"`,
      `"${u.todayDownloads ?? 0}"`,
      `"${u.status || 'ACTIVE'}"`,
      `"${u.provider || 'credentials'}"`,
      `"${u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString()}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `danh-sach-nguoi-dung-magnific-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('success', `Đã xuất ${filteredUsers.length} tài khoản ra file CSV`);
  };

  // Submit Create or Edit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('error', 'Họ tên và email không được để trống');
      return;
    }

    setIsSaving(true);
    try {
      if (editingUser) {
        // Update user
        const updatePayload: UpdateUserData = {
          name: name.trim(),
          email: email.trim(),
          role,
          status,
          isPro,
          downloadsCount,
        };
        if (password.trim()) {
          updatePayload.password = password.trim();
        }

        const updated = await ApiClient.updateAdminUser(editingUser.id, updatePayload);
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? updated : u)));
        showToast('success', `Đã cập nhật tài khoản "${updated.name}"`);
      } else {
        // Create user
        const createPayload: CreateUserData = {
          name: name.trim(),
          email: email.trim(),
          password: password.trim() || 'password123',
          role,
          status,
          isPro,
          downloadsCount,
        };

        const created = await ApiClient.createAdminUser(createPayload);
        setUsers((prev) => [created, ...prev]);
        showToast('success', `Đã tạo tài khoản mới "${created.name}"`);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi lưu thông tin tài khoản');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Toggle Pro Status
  const handleTogglePro = async (targetUser: User) => {
    setProcessingId(targetUser.id);
    try {
      const updated = await ApiClient.toggleUserPro(targetUser.id);
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? updated : u)));
      showToast(
        'success',
        updated.isPro
          ? `Đã kích hoạt gói Pro VIP cho ${updated.name}`
          : `Đã hạ về gói Miễn phí cho ${updated.name}`
      );
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi thay đổi gói cước');
    } finally {
      setProcessingId(null);
    }
  };

  // Quick Toggle Ban / Unban Status
  const handleToggleStatus = async (targetUser: User) => {
    if (targetUser.id === currentUser?.id) {
      showToast('error', 'Bạn không thể tự khóa tài khoản của chính mình');
      return;
    }
    if (targetUser.id === 'user-admin-01') {
      showToast('error', 'Không thể khóa tài khoản Quản trị viên gốc');
      return;
    }

    setProcessingId(targetUser.id);
    try {
      const updated = await ApiClient.toggleUserStatus(targetUser.id);
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? updated : u)));
      showToast(
        'success',
        updated.status === 'BANNED'
          ? `Đã khóa tài khoản của ${updated.name}`
          : `Đã kích hoạt lại tài khoản ${updated.name}`
      );
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi cập nhật trạng thái');
    } finally {
      setProcessingId(null);
    }
  };

  // Delete User Confirmation
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    if (userToDelete.id === currentUser?.id) {
      showToast('error', 'Bạn không thể tự xóa tài khoản của chính mình');
      setUserToDelete(null);
      return;
    }

    setIsDeleting(true);
    try {
      await ApiClient.deleteAdminUser(userToDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      showToast('success', `Đã xóa tài khoản "${userToDelete.name}" thành công`);
      setUserToDelete(null);
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi xóa tài khoản');
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141414] border border-neutral-800 rounded-xl p-5 shadow-xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-neutral-300" />
            <span>Quản Lý Tài Khoản & Người Dùng</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Xem danh sách, thêm tài khoản mới, phân quyền Admin, nâng cấp Pro VIP và khóa/mở khóa tài khoản.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={fetchUsers}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white transition-all cursor-pointer shadow-sm disabled:opacity-50"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={isLoading || filteredUsers.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm disabled:opacity-40"
            title="Xuất danh sách người dùng ra file CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Xuất CSV</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex-shrink-0"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm Tài Khoản Mới</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#141414] border border-neutral-800 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white flex-shrink-0">
            <Users className="w-5 h-5 text-neutral-300" />
          </div>
          <div className="min-w-0">
            <div className="text-xl font-bold text-white tabular-nums">{totalCount}</div>
            <div className="text-xs text-neutral-400 truncate">Tổng Tài Khoản</div>
          </div>
        </div>

        <div className="bg-[#141414] border border-neutral-800 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-800/50 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Crown className="w-5 h-5 text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="text-xl font-bold text-amber-300 tabular-nums">{adminCount}</div>
            <div className="text-xs text-neutral-400 truncate">Quản Trị Viên (Admin)</div>
          </div>
        </div>

        <div className="bg-[#141414] border border-neutral-800 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="text-xl font-bold text-emerald-300 tabular-nums">{proCount}</div>
            <div className="text-xs text-neutral-400 truncate">Hội Viên Pro VIP</div>
          </div>
        </div>

        <div className="bg-[#141414] border border-neutral-800 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-center justify-center text-rose-400 flex-shrink-0">
            <UserX className="w-5 h-5 text-rose-400" />
          </div>
          <div className="min-w-0">
            <div className="text-xl font-bold text-rose-300 tabular-nums">{bannedCount}</div>
            <div className="text-xs text-neutral-400 truncate">Tài Khoản Bị Khóa</div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-[#141414] border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <input
            type="text"
            placeholder="Tìm theo tên người dùng, email, mã tài khoản..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1c1c1c] border border-neutral-700/80 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 transition-colors"
          />
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Filter */}
          <div className="w-36">
            <CustomSelect
              size="sm"
              value={roleFilter}
              onChange={(val) => setRoleFilter(val as any)}
              options={[
                { value: 'ALL', label: 'Mọi Vai Trò' },
                { value: 'ADMIN', label: '🛡️ Quản trị (Admin)' },
                { value: 'USER', label: '👤 Người dùng (User)' },
              ]}
            />
          </div>

          {/* Tier Filter */}
          <div className="w-36">
            <CustomSelect
              size="sm"
              value={tierFilter}
              onChange={(val) => setTierFilter(val as any)}
              options={[
                { value: 'ALL', label: 'Mọi Gói Cước' },
                { value: 'PRO', label: '⚡ Gói Pro VIP' },
                { value: 'FREE', label: 'Miễn phí (Free)' },
              ]}
            />
          </div>

          {/* Status Filter */}
          <div className="w-40">
            <CustomSelect
              size="sm"
              value={statusFilter}
              onChange={(val) => setStatusFilter(val as any)}
              options={[
                { value: 'ALL', label: 'Mọi Trạng Thái' },
                { value: 'ACTIVE', label: '🟢 Đang hoạt động' },
                { value: 'BANNED', label: '🔴 Đã bị khóa' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Main Users Table / List */}
      <div className="bg-[#141414] border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <Loader2 className="w-7 h-7 animate-spin text-white" />
            <span className="text-xs font-mono">Đang tải danh sách người dùng...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-center text-neutral-400">
            <Users className="w-10 h-10 text-neutral-600 stroke-[1.5] mb-2" />
            <div className="text-sm font-semibold text-white">Không tìm thấy tài khoản phù hợp</div>
            <div className="text-xs text-neutral-500 max-w-sm">
              Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh các bộ lọc vai trò, gói cước phía trên.
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('ALL');
                  setTierFilter('ALL');
                  setStatusFilter('ALL');
                }}
                className="mt-3 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-white transition-colors"
              >
                Xóa bộ lọc tìm kiếm
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800/80 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider bg-[#161616]">
                  <th className="py-3 px-4">Người Dùng</th>
                  <th className="py-3 px-4">Email & Đăng Nhập</th>
                  <th className="py-3 px-4">Vai Trò</th>
                  <th className="py-3 px-4">Gói Cước</th>
                  <th className="py-3 px-4">Lượt Tải SFX</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4">Ngày Tạo</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-xs">
                {filteredUsers.map((u) => {
                  const isCurrent = u.id === currentUser?.id || u.email === currentUser?.email;
                  const isRoot = u.id === 'user-admin-01';
                  const isProcessing = processingId === u.id;

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-neutral-900/60 transition-colors ${
                        u.status === 'BANNED' ? 'opacity-70 bg-rose-950/10' : ''
                      }`}
                    >
                      {/* User Info (Avatar + Name + ID) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              u.avatarUrl ||
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                            }
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover border border-neutral-700 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-white flex items-center gap-1.5 truncate">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                  Bạn
                                </span>
                              )}
                              {isRoot && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                  Gốc
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-neutral-500 truncate">
                              ID: {u.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email & Provider */}
                      <td className="py-3.5 px-4">
                        <div className="text-neutral-200 font-mono text-xs truncate max-w-[200px]">
                          {u.email}
                        </div>
                        <div className="text-[10px] text-neutral-500 flex items-center gap-1 mt-0.5">
                          {u.provider === 'google' ? (
                            <span className="text-emerald-400 font-medium">Google OAuth</span>
                          ) : (
                            <span>Mật khẩu nội bộ</span>
                          )}
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {u.role === 'ADMIN' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/80 shadow-sm">
                            <Crown className="w-3 h-3 text-amber-400" />
                            <span>ADMIN</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
                            <Users className="w-3 h-3 text-neutral-400" />
                            <span>USER</span>
                          </span>
                        )}
                      </td>

                      {/* Tier / Pro Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {u.isPro ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>PRO VIP</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-neutral-900 text-neutral-400 border border-neutral-800">
                            <span>Miễn Phí</span>
                          </span>
                        )}
                      </td>

                      {/* Sound Effect Downloads */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Download className="w-3.5 h-3.5 text-neutral-400" />
                          <span className="font-bold text-white text-xs tabular-nums">
                            {u.downloadsCount ?? 0}
                          </span>
                          <span className="text-[11px] text-neutral-500">lượt</span>
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">
                          {u.isPro ? (
                            <span className="text-amber-400/90 font-medium">Hôm nay: {u.todayDownloads ?? 0} (Không GH)</span>
                          ) : (
                            <span>
                              Hôm nay: <strong className="text-neutral-300 font-mono">{u.todayDownloads ?? 0}</strong>/5
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {u.status === 'BANNED' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-950/60 text-rose-300 border border-rose-800/70">
                            <Lock className="w-3 h-3 text-rose-400" />
                            <span>Đã Khóa</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/40 text-emerald-300 border border-emerald-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Hoạt Động</span>
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-neutral-400 font-mono text-[11px]">
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {/* Quick Toggle Pro */}
                          <button
                            type="button"
                            onClick={() => handleTogglePro(u)}
                            disabled={isProcessing}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              u.isPro
                                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                                : 'bg-neutral-900 border-neutral-700/80 text-neutral-400 hover:text-amber-400 hover:border-amber-500/40'
                            }`}
                            title={u.isPro ? 'Hạ cấp về Miễn phí' : 'Nâng cấp lên Pro VIP'}
                          >
                            <Crown className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Toggle Status (Ban / Unban) */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u)}
                            disabled={isProcessing || isCurrent || isRoot}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                              u.status === 'BANNED'
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                                : 'bg-neutral-900 border-neutral-700/80 text-neutral-400 hover:text-rose-400 hover:border-rose-500/40'
                            }`}
                            title={
                              isCurrent
                                ? 'Không thể khóa tài khoản của bạn'
                                : isRoot
                                ? 'Không thể khóa tài khoản Admin gốc'
                                : u.status === 'BANNED'
                                ? 'Kích hoạt lại tài khoản'
                                : 'Khóa tài khoản này'
                            }
                          >
                            {u.status === 'BANNED' ? (
                              <Unlock className="w-3.5 h-3.5" />
                            ) : (
                              <Lock className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* View Details */}
                          <button
                            type="button"
                            onClick={() => setViewingUser(u)}
                            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-700/80 text-neutral-400 hover:text-white hover:border-neutral-500 transition-all cursor-pointer"
                            title="Xem chi tiết tài khoản"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Details */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            disabled={isProcessing}
                            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-700/80 text-neutral-400 hover:text-white hover:border-neutral-500 transition-all cursor-pointer"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Account */}
                          <button
                            type="button"
                            onClick={() => setUserToDelete(u)}
                            disabled={isProcessing || isCurrent || isRoot}
                            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-700/80 text-neutral-400 hover:text-rose-400 hover:border-rose-500/40 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title={
                              isCurrent
                                ? 'Không thể xóa tài khoản của chính bạn'
                                : isRoot
                                ? 'Không thể xóa tài khoản Admin gốc'
                                : 'Xóa tài khoản này'
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= MODAL: CREATE / EDIT USER ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !isSaving && setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-[#161616] border border-neutral-800 rounded-2xl shadow-2xl p-6 z-10 text-white animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {editingUser ? (
                  <>
                    <Edit2 className="w-4 h-4 text-amber-400" />
                    <span>Chỉnh Sửa Tài Khoản</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-white" />
                    <span>Thêm Tài Khoản Mới</span>
                  </>
                )}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              {/* Full Name */}
              <div>
                <label className="block text-neutral-400 font-medium mb-1">
                  Họ và Tên <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Alex Sound Creator, Sarah Connor..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  required
                  className="w-full bg-[#1f1f1f] border border-[#333333] rounded-lg px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-neutral-400 font-medium mb-1">
                  Địa Chỉ Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g., user@magnific.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#1f1f1f] border border-[#333333] rounded-lg px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-neutral-400 font-medium mb-1 flex items-center justify-between">
                  <span>
                    Mật Khẩu {editingUser ? '(Để trống nếu không đổi)' : ''}
                    {!editingUser && <span className="text-red-400"> *</span>}
                  </span>
                  <span className="text-[10px] text-neutral-500">Tối thiểu 6 ký tự</span>
                </label>
                <input
                  type="password"
                  placeholder={editingUser ? '•••••••• (Giữ nguyên mật khẩu cũ)' : 'Nhập mật khẩu ban đầu...'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!editingUser}
                  minLength={6}
                  className="w-full bg-[#1f1f1f] border border-[#333333] rounded-lg px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 transition-colors"
                />
              </div>

              {/* Role & Status Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Role */}
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">
                    Vai Trò (Role) <span className="text-red-400">*</span>
                  </label>
                  <CustomSelect
                    value={role}
                    onChange={(val) => setRole(val as Role)}
                    options={[
                      { value: 'USER', label: '👤 Người dùng (USER)' },
                      { value: 'ADMIN', label: '🛡️ Quản trị viên (ADMIN)' },
                    ]}
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-neutral-400 font-medium mb-1">
                    Trạng Thái <span className="text-red-400">*</span>
                  </label>
                  <CustomSelect
                    value={status}
                    onChange={(val) => setStatus(val as UserStatus)}
                    options={[
                      { value: 'ACTIVE', label: '🟢 Đang hoạt động' },
                      { value: 'BANNED', label: '🔴 Khóa tài khoản' },
                    ]}
                  />
                </div>
              </div>

              {/* Sound Effect Downloads Count */}
              <div>
                <label className="block text-neutral-400 font-medium mb-1 flex items-center justify-between">
                  <span>Số Lượng Đã Tải SFX</span>
                  <span className="text-[10px] text-neutral-500">Tổng số lượt tải xuống</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={downloadsCount}
                    onChange={(e) => setDownloadsCount(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#1f1f1f] border border-[#333333] rounded-lg pl-9 pr-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 transition-colors"
                  />
                  <Download className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Pro VIP Privilege Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-[#1b1b1b] border border-neutral-700/80 cursor-pointer hover:border-amber-500/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={isPro}
                    onChange={(e) => setIsPro(e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-600 text-amber-500 focus:ring-amber-500/30 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cấp Gói Pro VIP (Tải không giới hạn SFX)</span>
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      Bỏ qua giới hạn 5 lượt tải/ngày, mở khóa quyền tải không giới hạn toàn bộ thư viện.
                    </div>
                  </div>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !name.trim() || !email.trim()}
                  className="px-5 py-2 rounded-lg text-xs font-bold text-black bg-white hover:bg-neutral-200 disabled:opacity-50 transition-all cursor-pointer shadow-md"
                >
                  {isSaving ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu...</span>
                    </span>
                  ) : (
                    <span>{editingUser ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !isDeleting && setUserToDelete(null)}
          />
          <div className="relative w-full max-w-sm bg-[#161616] border border-neutral-800 rounded-2xl shadow-2xl p-6 z-10 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-950/50 border border-red-800/60 flex items-center justify-center text-red-400 mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 stroke-[2]" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              Xác Nhận Xóa Tài Khoản?
            </h3>
            <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
              Bạn có chắc chắn muốn xóa tài khoản{' '}
              <strong className="text-white">&quot;{userToDelete.name}&quot;</strong> ({userToDelete.email})?
              Hành động này sẽ xóa vĩnh viễn quyền truy cập và dữ liệu liên quan.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white bg-neutral-800 transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {isDeleting ? 'Đang xóa...' : 'Xác Nhận Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: VIEW USER DETAILS ================= */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setViewingUser(null)}
          />
          <div className="relative w-full max-w-lg bg-[#161616] border border-neutral-800 rounded-2xl shadow-2xl p-6 z-10 text-white animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white">
                  <Eye className="w-4 h-4 text-neutral-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Hồ Sơ Chi Tiết Người Dùng</h3>
                  <p className="text-[11px] text-neutral-400">Xem thông tin tài khoản, quyền hạn & hạn mức</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Header Card */}
            <div className="bg-[#1c1c1c] border border-neutral-800 rounded-xl p-4 flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500/30 to-violet-500/30 border border-neutral-700 flex items-center justify-center text-white font-black text-lg overflow-hidden flex-shrink-0">
                {viewingUser.avatarUrl ? (
                  <img src={viewingUser.avatarUrl} alt={viewingUser.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{viewingUser.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-bold text-white truncate">{viewingUser.name}</h4>
                  {viewingUser.role === 'ADMIN' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/70 text-amber-300 border border-amber-800/80">
                      <Crown className="w-2.5 h-2.5" />
                      ADMIN
                    </span>
                  )}
                  {viewingUser.isPro && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <Sparkles className="w-2.5 h-2.5" />
                      PRO VIP
                    </span>
                  )}
                </div>
                <div className="text-xs text-neutral-400 truncate mt-0.5 font-mono">{viewingUser.email}</div>
                <div className="text-[10px] text-neutral-500 font-mono mt-1">ID: {viewingUser.id}</div>
              </div>
            </div>

            {/* Detail Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 bg-[#131313] border border-neutral-800/90 rounded-lg">
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1 font-semibold">Trạng Thái</div>
                <div>
                  {viewingUser.status === 'BANNED' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400">
                      <Lock className="w-3.5 h-3.5" /> Đã Bị Khóa
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đang Hoạt Động
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-[#131313] border border-neutral-800/90 rounded-lg">
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1 font-semibold flex items-center justify-between">
                  <span>Lượt Tải Sound Effect</span>
                  <span className="text-white font-bold">{viewingUser.downloadsCount ?? 0} lượt</span>
                </div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-neutral-400" />
                  {viewingUser.isPro ? (
                    <span className="text-amber-300">⚡ Không giới hạn (Pro VIP)</span>
                  ) : (
                    <span className="text-neutral-300">Hôm nay: {viewingUser.todayDownloads ?? 0}/5 lượt</span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-[#131313] border border-neutral-800/90 rounded-lg">
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1 font-semibold">Đăng Nhập Qua</div>
                <div className="text-xs font-medium text-neutral-300">
                  {viewingUser.provider === 'google' ? '🌐 Google OAuth 2.0' : '🔑 Mật khẩu nội bộ'}
                </div>
              </div>

              <div className="p-3 bg-[#131313] border border-neutral-800/90 rounded-lg">
                <div className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1 font-semibold">Ngày Tạo Tài Khoản</div>
                <div className="text-xs font-medium text-neutral-300 font-mono">
                  {formatDate(viewingUser.createdAt)}
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const u = viewingUser;
                    setViewingUser(null);
                    handleTogglePro(u);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    viewingUser.isPro
                      ? 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
                      : 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                  }`}
                >
                  {viewingUser.isPro ? 'Hạ cấp Free' : '⭐ Nâng Pro VIP'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const u = viewingUser;
                    setViewingUser(null);
                    handleToggleStatus(u);
                  }}
                  disabled={viewingUser.id === currentUser?.id || viewingUser.id === 'user-admin-01'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                    viewingUser.status === 'BANNED'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                      : 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                  }`}
                >
                  {viewingUser.status === 'BANNED' ? 'Mở Khóa' : 'Khóa Tài Khoản'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const u = viewingUser;
                    setViewingUser(null);
                    handleOpenEdit(u);
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white transition-colors cursor-pointer"
                >
                  Chỉnh Sửa
                </button>
                <button
                  type="button"
                  onClick={() => setViewingUser(null)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-black hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
