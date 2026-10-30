'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  QrCode,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Copy,
  Check,
  Loader2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

export interface PricingPlan {
  id: '1m' | '3m' | '6m' | '1y';
  name: string;
  durationLabel: string;
  durationMonths: number;
  monthlyEquivalent: number;
  totalPrice: number;
  discountBadge?: string;
  isPopular?: boolean;
  isBestValue?: boolean;
  description: string;
  features: string[];
}

interface CheckoutModalProps {
  plan: PricingPlan;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  plan,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, upgradeSubscription, isAuthenticated } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'momo' | 'card'>('bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form states for credit card
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  if (!isOpen) return null;

  const orderCode = `MG${Math.floor(100000 + Math.random() * 900000)}`;
  const transferContent = `MAGNIFIC ${plan.id.toUpperCase()} ${user ? user.id.slice(0, 5) : 'USER'}`;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    // Simulate real-time payment gateway verification
    setTimeout(() => {
      upgradeSubscription(plan.id, plan.name, plan.durationMonths, plan.totalPrice);
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1800);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={() => !isProcessing && onClose()}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-[#141414] border border-[#2b2b2b] rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 text-white my-auto">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#242424] bg-[#181818]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight">
                Thanh Toán Đăng Ký Gói Pro
              </h2>
              <p className="text-[11px] text-neutral-400">
                {plan.name} • {plan.durationLabel}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {isSuccess ? (
          <div className="p-8 text-center flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Kích Hoạt Thành Công!</h3>
            <p className="text-xs text-neutral-300 max-w-sm mb-4 leading-relaxed">
              Chúc mừng bạn đã nâng cấp thành công gói <strong className="text-white">{plan.name}</strong>. Giờ đây bạn có thể tải không giới hạn SFX bản quyền chất lượng cao 24-bit WAV.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-700 rounded-full text-xs text-neutral-300 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Tài khoản PRO đã có hiệu lực</span>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6 space-y-5">
            {/* Plan Summary Card */}
            <div className="bg-[#1a1a1a] border border-[#282828] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-base">{plan.name}</span>
                  {plan.discountBadge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 border border-neutral-700 text-white">
                      {plan.discountBadge}
                    </span>
                  )}
                </div>
                <div className="text-xs text-neutral-400 mt-0.5">{plan.description}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xl sm:text-2xl font-black text-white">
                  {plan.totalPrice.toLocaleString('vi-VN')} đ
                </div>
                <div className="text-[11px] text-neutral-400 font-medium">
                  (~{plan.monthlyEquivalent.toLocaleString('vi-VN')} đ/tháng)
                </div>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">
                Chọn phương thức thanh toán:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    paymentMethod === 'bank'
                      ? 'bg-neutral-800 border-white text-white shadow-sm'
                      : 'bg-[#181818] border-[#262626] text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span>QR Ngân Hàng</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('momo')}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    paymentMethod === 'momo'
                      ? 'bg-neutral-800 border-white text-white shadow-sm'
                      : 'bg-[#181818] border-[#262626] text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  <span>Ví MoMo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-neutral-800 border-white text-white shadow-sm'
                      : 'bg-[#181818] border-[#262626] text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Thẻ Visa / Master</span>
                </button>
              </div>
            </div>

            {/* Payment Method Details */}
            {paymentMethod === 'bank' && (
              <div className="bg-[#181818] border border-[#282828] rounded-xl p-4 space-y-3.5">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Dynamic VietQR Display Box */}
                  <div className="w-36 h-36 bg-white p-2 rounded-xl flex flex-col items-center justify-center shadow-lg flex-shrink-0">
                    {/* SVG QR Code Simulation */}
                    <div className="relative w-full h-full flex items-center justify-center bg-neutral-950 rounded-lg p-1">
                      <svg
                        viewBox="0 0 100 100"
                        className="w-full h-full fill-white"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* QR Code pattern simulation */}
                        <path d="M5 5h30v30H5V5zm6 6v18h18V11H11zm65-6h30v30H76V5zm6 6v18h18V11H82zM5 76h30v30H5V76zm6 6v18h18V82H11zm40-77h6v6h-6V5zm10 0h6v6h-6V5zm-20 15h6v6h-6v-6zm30 0h6v6h-6v-6zm-10 10h6v6h-6v-6zm-20 10h16v6H41v-6zm26 0h16v6H67v-6zm-26 15h6v16h-6V66zm10 0h6v6h-6v-6zm16 0h6v6h-6v-6zm10 0h6v6h-6v-6zm-26 15h16v6H51v-6zm26 0h16v16H77V81zm-10 10h6v6h-6v-6z" />
                        <rect x="42" y="42" width="16" height="16" rx="3" fill="#ffffff" />
                        <path d="M47 46h6v8h-6z" fill="#000000" />
                      </svg>
                    </div>
                  </div>

                  {/* Transfer Instructions */}
                  <div className="flex-1 space-y-2 text-xs w-full">
                    <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800">
                      <span className="text-neutral-400">Ngân hàng:</span>
                      <span className="font-semibold text-white">MB Bank (Quân Đội)</span>
                    </div>

                    <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800">
                      <span className="text-neutral-400">Số tài khoản:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-white text-sm">9876543210</span>
                        <button
                          type="button"
                          onClick={() => handleCopy('9876543210', 'stk')}
                          className="p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                          title="Copy số tài khoản"
                        >
                          {copiedField === 'stk' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800">
                      <span className="text-neutral-400">Chủ tài khoản:</span>
                      <span className="font-semibold text-neutral-200">MAGNIFIC AUDIO VN</span>
                    </div>

                    <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800">
                      <span className="text-neutral-400">Số tiền:</span>
                      <span className="font-bold text-white text-sm">
                        {plan.totalPrice.toLocaleString('vi-VN')} đ
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Nội dung CK:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-neutral-200 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-700">
                          {transferContent}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(transferContent, 'content')}
                          className="p-1 rounded hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                          title="Copy nội dung"
                        >
                          {copiedField === 'content' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800 text-[11px] text-neutral-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-neutral-300 flex-shrink-0" />
                  <span>
                    Hệ thống tự động kích hoạt tài khoản PRO sau khi nhận được chuyển khoản trong 30 giây.
                  </span>
                </div>
              </div>
            )}

            {paymentMethod === 'momo' && (
              <div className="bg-[#181818] border border-[#282828] rounded-xl p-4 text-center space-y-3">
                <div className="w-32 h-32 bg-white p-2 rounded-xl mx-auto flex items-center justify-center shadow-lg">
                  <div className="w-full h-full bg-[#a50064] rounded-lg flex flex-col items-center justify-center text-white">
                    <Smartphone className="w-10 h-10 mb-1" />
                    <span className="text-[10px] font-black tracking-wider uppercase">Momo QR</span>
                  </div>
                </div>
                <div className="text-xs text-neutral-300">
                  Quét mã QR bằng ứng dụng <strong className="text-[#e22e86]">MoMo</strong> để thanh toán{' '}
                  <span className="font-bold text-white">{plan.totalPrice.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="text-[11px] text-neutral-500 font-mono">
                  Mã giao dịch: {orderCode}
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="bg-[#181818] border border-[#282828] rounded-xl p-4 space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Số thẻ tín dụng / ghi nợ</label>
                  <input
                    type="text"
                    placeholder="4111 2222 3333 4444"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={19}
                    className="w-full bg-[#1f1f1f] border border-[#333333] rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 transition-colors font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">Ngày hết hạn (MM/YY)</label>
                    <input
                      type="text"
                      placeholder="12/28"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      maxLength={5}
                      className="w-full bg-[#1f1f1f] border border-[#333333] rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 transition-colors font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 mb-1 font-medium">Mã bảo mật (CVC)</label>
                    <input
                      type="password"
                      placeholder="123"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      maxLength={4}
                      className="w-full bg-[#1f1f1f] border border-[#333333] rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400 transition-colors font-mono"
                    />
                  </div>
                </div>
                <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Mã hóa bảo mật thanh toán chuẩn PCI-DSS 256-bit</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="flex-1 py-2.5 px-5 rounded-xl text-xs font-bold text-black bg-white hover:bg-neutral-200 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang kiểm tra & kích hoạt...</span>
                  </>
                ) : (
                  <>
                    <span>Xác nhận đã chuyển khoản / Thanh toán</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
