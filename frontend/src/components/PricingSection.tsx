'use client';

import React, { useState } from 'react';
import {
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  Download,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Award,
  Crown,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useLanguage } from '@/lib/i18n/language-context';
import { CheckoutModal, PricingPlan } from './CheckoutModal';

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: '1m',
    name: 'Gói 1 Tháng',
    durationLabel: '1 Tháng',
    durationMonths: 1,
    monthlyEquivalent: 69000,
    totalPrice: 69000,
    description: 'Thích hợp cho các dự án ngắn hạn hoặc trải nghiệm thử dịch vụ Pro.',
    features: [
      'Tải không giới hạn tất cả SFX',
      'Định dạng âm thanh gốc 24-bit WAV',
      'Giấy phép bản quyền thương mại YouTube / TikTok',
      'Không bắt buộc ghi nguồn tác giả',
      'Tốc độ tải băng thông tiêu chuẩn cao',
    ],
  },
  {
    id: '3m',
    name: 'Gói 3 Tháng',
    durationLabel: '3 Tháng',
    durationMonths: 3,
    monthlyEquivalent: 63000,
    totalPrice: 189000,
    discountBadge: 'Tiết kiệm 9%',
    description: 'Dành cho các nhà sáng tạo nội dung, podcaster và video editor đều đặn.',
    features: [
      'Tất cả quyền lợi của gói 1 Tháng',
      'Tiết kiệm 18.000 đ so với mua lẻ',
      'Ưu tiên kết nối máy chủ CDN tốc độ cao',
      'Truy cập bộ sưu tập Foley & Ambience VIP',
      'Hỗ trợ kỹ thuật qua Email trong 24h',
    ],
  },
  {
    id: '6m',
    name: 'Gói 6 Tháng',
    durationLabel: '6 Tháng',
    durationMonths: 6,
    monthlyEquivalent: 55000,
    totalPrice: 329000,
    discountBadge: 'Tiết kiệm 20%',
    isPopular: true,
    description: 'Lựa chọn phổ biến nhất cho các studio, agency và creator chuyên nghiệp.',
    features: [
      'Tất cả quyền lợi của gói 3 Tháng',
      'Tiết kiệm 85.000 đ so với mua lẻ',
      'Mở khóa toàn bộ SFX độc quyền (Exclusive)',
      'Giấy phép sử dụng cho phim ngắn & Game Indie',
      'Hỗ trợ ưu tiên 24/7 từ chuyên viên âm thanh',
    ],
  },
  {
    id: '1y',
    name: 'Gói 1 Năm',
    durationLabel: '12 Tháng',
    durationMonths: 12,
    monthlyEquivalent: 45000,
    totalPrice: 540000,
    discountBadge: 'Tiết kiệm 35%',
    isBestValue: true,
    description: 'Chi phí tối ưu nhất, sáng tạo không giới hạn suốt 365 ngày.',
    features: [
      'Tất cả quyền lợi của gói 6 Tháng',
      'Chỉ ~45k/tháng (Tiết kiệm hơn 280.000 đ)',
      'Giấy phép thương mại mở rộng không giới hạn nền tảng',
      'Tải trọn bộ thư viện theo danh mục (Batch Download)',
      'Cam kết giữ mức giá ưu đãi trọn đời tài khoản',
      'Quyền truy cập sớm các hiệu ứng âm thanh mới ra mắt',
    ],
  },
];

const FAQS_VI = [
  {
    q: 'Sau khi mua gói, tôi có thể tải bao nhiêu âm thanh mỗi ngày?',
    a: 'Bạn có thể tải không giới hạn số lượng hiệu ứng âm thanh ở chất lượng gốc cao nhất (WAV 24-bit 48kHz không nén) phục vụ công việc sáng tạo của bạn.',
  },
  {
    q: 'Giấy phép bản quyền thương mại hoạt động như thế nào?',
    a: 'Mọi âm thanh bạn tải về trong thời gian gói Pro còn hiệu lực đều được cấp bản quyền thương mại vĩnh viễn cho dự án đó. Bạn có thể sử dụng thoải mái cho YouTube, TikTok, Facebook, Game, Podcast, Quảng cáo mà không sợ bị đánh gậy bản quyền (Copyright Strike).',
  },
  {
    q: 'Tôi có thể huỷ hoặc nâng cấp lên gói dài hơn được không?',
    a: 'Có, bạn hoàn toàn có thể nâng cấp thời hạn bất kỳ lúc nào. Hệ thống sẽ tự động cộng dồn thời gian sử dụng vào tài khoản của bạn.',
  },
  {
    q: 'Hình thức thanh toán bằng chuyển khoản ngân hàng xác nhận trong bao lâu?',
    a: 'Hệ thống sử dụng cổng kiểm tra tự động qua mã chuyển khoản VietQR, tài khoản của bạn sẽ được nâng cấp thành Pro trong vòng 10 - 30 giây sau khi chuyển khoản thành công.',
  },
];

const FAQS_EN = [
  {
    q: 'How many sound effects can I download per day after subscribing?',
    a: 'You can download unlimited sound effects in full studio quality (uncompressed 24-bit 48kHz WAV) for all your creative projects.',
  },
  {
    q: 'How does the commercial license work?',
    a: 'All audio downloaded while your Pro plan is active comes with perpetual commercial rights for that project. You can freely use it on YouTube, TikTok, Facebook, Games, Podcasts, and Ads without risk of copyright strikes.',
  },
  {
    q: 'Can I upgrade to a longer plan at any time?',
    a: 'Yes, you can upgrade your plan duration whenever you want. The remaining period will automatically stack and extend your active subscription.',
  },
  {
    q: 'How long does bank transfer / VietQR confirmation take?',
    a: 'We use instant automated VietQR payment verification. Your account is upgraded to Pro within 10 to 30 seconds after payment completion.',
  },
];

export const PricingSection: React.FC = () => {
  const { user, subscription, isPro } = useAuth();
  const { language, t } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(PRICING_PLANS[2]); // Default: 6 months
  const [checkoutPlan, setCheckoutPlan] = useState<PricingPlan | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCheckoutSuccess = () => {
    setCheckoutPlan(null);
    showToast(language === 'vi' ? 'Nâng cấp tài khoản PRO thành công!' : 'PRO Subscription successfully activated!');
  };

  return (
    <div className="w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#161616] border border-neutral-700 text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-semibold mb-4">
          <Crown className="w-3.5 h-3.5 text-white" />
          <span>{language === 'vi' ? 'Gói Đăng Ký Bản Quyền Âm Thanh Pro' : 'Pro Commercial Sound License'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
          {language === 'vi' ? 'Nâng Tầm Tác Phẩm Với ' : 'Elevate Your Productions With '}<br className="hidden sm:inline" />
          <span className="text-neutral-400">{language === 'vi' ? 'Âm Thanh Đẳng Cấp Studio' : 'Studio-Grade Audio'}</span>
        </h1>
        <p className="mt-4 text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-xl mx-auto">
          {language === 'vi'
            ? 'Tải không giới hạn hàng nghìn hiệu ứng âm thanh WAV 24-bit chuẩn phòng thu. Đầy đủ giấy phép thương mại cho Creator, Filmmaker và Game Developer.'
            : 'Unlimited downloads of thousands of studio-grade 24-bit WAV sound effects. Complete commercial license for Creators, Filmmakers, and Game Developers.'}
        </p>

        {/* Current status pill if logged in */}
        {isPro && subscription && (
          <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>
              {language === 'vi' ? 'Bạn đang sử dụng ' : 'You are currently using '}
              <strong className="text-white">{subscription.planName}</strong> • {language === 'vi' ? 'Hết hạn vào ngày ' : 'Expires on '}
              {new Date(subscription.expiresAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
            </span>
          </div>
        )}
      </div>

      {/* 4 Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 mb-16">
        {PRICING_PLANS.map((plan) => {
          const isSelected = selectedPlan.id === plan.id;
          const isFeatured = plan.isPopular || plan.isBestValue;

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className={`relative flex flex-col rounded-2xl p-6 transition-all duration-200 cursor-pointer ${
                isFeatured
                  ? 'bg-[#181818] border-2 border-neutral-400/90 shadow-2xl hover:border-white'
                  : 'bg-[#141414] border border-[#282828] hover:border-neutral-600 hover:bg-[#161616]'
              } ${isSelected ? 'ring-2 ring-white/30' : ''}`}
            >
              {/* Badge for Popular / Best Value */}
              {plan.isBestValue && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white text-black shadow-md flex items-center gap-1">
                  <Crown className="w-3 h-3 fill-black text-black" />
                  <span>{language === 'vi' ? 'Tiết Kiệm Nhất' : 'Best Value'}</span>
                </div>
              )}
              {plan.isPopular && !plan.isBestValue && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-neutral-200 text-black shadow-md flex items-center gap-1">
                  <Star className="w-3 h-3 fill-black text-black" />
                  <span>{language === 'vi' ? 'Phổ Biến Nhất' : 'Most Popular'}</span>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">
                    {language === 'vi'
                      ? plan.name
                      : plan.id === '1m'
                      ? '1 Month Plan'
                      : plan.id === '3m'
                      ? '3 Months Plan'
                      : plan.id === '6m'
                      ? '6 Months Plan'
                      : '1 Year Plan'}
                  </h3>
                  {plan.discountBadge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                      {language === 'vi'
                        ? plan.discountBadge
                        : plan.id === '3m'
                        ? 'Save 9%'
                        : plan.id === '6m'
                        ? 'Save 20%'
                        : 'Save 35%'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-400 mt-1 min-h-[36px] line-clamp-2">
                  {language === 'vi'
                    ? plan.description
                    : plan.id === '1m'
                    ? 'Ideal for short-term projects or testing out Pro features.'
                    : plan.id === '3m'
                    ? 'Designed for regular creators, podcasters, and video editors.'
                    : plan.id === '6m'
                    ? 'The most popular plan for studios, agencies, and professional creators.'
                    : 'Best value for 365 days of unlimited, unrestricted creative production.'}
                </p>
              </div>

              {/* Pricing Display */}
              <div className="py-3 my-2 border-y border-[#262626]">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {plan.monthlyEquivalent.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}
                  </span>
                  <span className="text-xs font-semibold text-neutral-400">
                    {language === 'vi' ? 'đ / tháng' : 'VND / mo'}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 mt-1 font-medium">
                  {plan.durationMonths === 1 ? (
                    language === 'vi' ? 'Thanh toán 69.000 đ mỗi tháng' : 'Billed 69,000 VND monthly'
                  ) : (
                    <span>
                      {language === 'vi' ? 'Tổng thanh toán: ' : 'Total: '}
                      <strong className="text-neutral-300">
                        {plan.totalPrice.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')} {language === 'vi' ? 'đ' : 'VND'}
                      </strong>
                      {' '}/ {language === 'vi' ? plan.durationLabel : `${plan.durationMonths} Months`}
                    </span>
                  )}
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-2.5 my-4 flex-1">
                <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  {language === 'vi' ? 'Quyền lợi gói:' : 'Included perks:'}
                </div>
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-neutral-300 leading-snug">
                    <Check className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Subscribe CTA Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCheckoutPlan(plan);
                }}
                className={`w-full mt-4 py-2.5 px-4 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
                  isFeatured
                    ? 'bg-white text-black hover:bg-neutral-200 shadow-md font-extrabold'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
                }`}
              >
                <span>
                  {language === 'vi'
                    ? `Đăng ký ${plan.durationLabel}`
                    : `Subscribe for ${plan.durationMonths} ${plan.durationMonths === 1 ? 'Month' : 'Months'}`}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Matrix Section */}
      <div className="bg-[#141414] border border-[#242424] rounded-2xl p-6 sm:p-8 mb-16">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {language === 'vi' ? 'So Sánh Quyền Lợi Gói' : 'Plan Features Comparison'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {language === 'vi'
              ? 'Minh bạch quyền lợi giữa tài khoản Miễn Phí và Gói Trả Phí Pro'
              : 'Transparent comparison between Free and Pro subscription plans'}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#282828] text-neutral-400">
                <th className="py-3 px-4 font-semibold">
                  {language === 'vi' ? 'Tính năng & Quyền lợi' : 'Features & Benefits'}
                </th>
                <th className="py-3 px-4 font-semibold text-center w-36 sm:w-48">
                  {language === 'vi' ? 'Miễn Phí (Free)' : 'Free Tier'}
                </th>
                <th className="py-3 px-4 font-bold text-white text-center w-36 sm:w-48 bg-neutral-900/50 rounded-t-lg">
                  {language === 'vi' ? 'Gói Pro' : 'Pro VIP'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242424]">
              <tr>
                <td className="py-3.5 px-4 text-neutral-200 font-medium">
                  {language === 'vi' ? 'Nghe thử & Tìm kiếm SFX' : 'Preview & Search SFX'}
                </td>
                <td className="py-3.5 px-4 text-center text-neutral-400">
                  {language === 'vi' ? 'Không giới hạn' : 'Unlimited'}
                </td>
                <td className="py-3.5 px-4 text-center text-white font-bold bg-neutral-900/50">
                  {language === 'vi' ? 'Không giới hạn' : 'Unlimited'}
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 text-neutral-200 font-medium">
                  {language === 'vi' ? 'Chất lượng tải về' : 'Audio Quality'}
                </td>
                <td className="py-3.5 px-4 text-center text-neutral-400">MP3 128kbps</td>
                <td className="py-3.5 px-4 text-center text-white font-bold bg-neutral-900/50">
                  {language === 'vi' ? 'WAV 24-bit 48kHz Chuẩn Studio' : '24-bit 48kHz Studio WAV'}
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 text-neutral-200 font-medium">
                  {language === 'vi' ? 'Số lượt tải mỗi ngày' : 'Daily Download Limit'}
                </td>
                <td className="py-3.5 px-4 text-center text-neutral-400">
                  {language === 'vi' ? 'Giới hạn 3 lượt/ngày' : '3 downloads / day'}
                </td>
                <td className="py-3.5 px-4 text-center text-white font-bold bg-neutral-900/50">
                  {language === 'vi' ? 'Không giới hạn' : 'Unlimited'}
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 text-neutral-200 font-medium">
                  {language === 'vi' ? 'Giấy phép thương mại (Commercial)' : 'Commercial License'}
                </td>
                <td className="py-3.5 px-4 text-center text-neutral-500">
                  {language === 'vi' ? 'Chỉ dùng cá nhân' : 'Personal use only'}
                </td>
                <td className="py-3.5 px-4 text-center text-white font-bold bg-neutral-900/50">
                  <div className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                    <Check className="w-3.5 h-3.5" />
                    <span>{language === 'vi' ? 'Toàn quyền thương mại' : 'Full commercial rights'}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 text-neutral-200 font-medium">
                  {language === 'vi' ? 'Ghi nguồn tác giả (Attribution)' : 'Attribution required'}
                </td>
                <td className="py-3.5 px-4 text-center text-neutral-400">
                  {language === 'vi' ? 'Bắt buộc ghi nguồn' : 'Required'}
                </td>
                <td className="py-3.5 px-4 text-center text-white font-bold bg-neutral-900/50">
                  {language === 'vi' ? 'Không cần ghi nguồn' : 'Not required'}
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 text-neutral-200 font-medium">
                  {language === 'vi' ? 'Tạo & Quản lý Collections riêng' : 'Custom Collections'}
                </td>
                <td className="py-3.5 px-4 text-center text-neutral-400">
                  {language === 'vi' ? 'Tối đa 2 bộ sưu tập' : 'Max 2 collections'}
                </td>
                <td className="py-3.5 px-4 text-center text-white font-bold bg-neutral-900/50">
                  {language === 'vi' ? 'Không giới hạn' : 'Unlimited'}
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 text-neutral-200 font-medium">
                  {language === 'vi' ? 'Tốc độ máy chủ tải về' : 'Download Server Speed'}
                </td>
                <td className="py-3.5 px-4 text-center text-neutral-500">
                  {language === 'vi' ? 'Bình thường' : 'Standard'}
                </td>
                <td className="py-3.5 px-4 text-center text-white font-bold bg-neutral-900/50">
                  {language === 'vi' ? 'Tốc độ tối đa qua CDN' : 'Ultra-fast CDN'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="max-w-2xl mx-auto mb-16">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {language === 'vi' ? 'Câu Hỏi Thường Gặp' : 'Frequently Asked Questions'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {language === 'vi'
              ? 'Mọi điều bạn cần biết trước khi nâng cấp gói Pro'
              : 'Everything you need to know about Magnific Pro'}
          </p>
        </div>

        <div className="space-y-3">
          {(language === 'vi' ? FAQS_VI : FAQS_EN).map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-[#141414] border border-[#242424] rounded-xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-neutral-200 hover:text-white transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-neutral-400 leading-relaxed border-t border-[#222222]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Satisfaction Guarantee Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-neutral-900 to-[#141414] border border-[#2a2a2a] text-center max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-5 justify-between">
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white flex-shrink-0">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              {language === 'vi' ? 'Cam Kết Hoàn Tiền 100% Trong 7 Ngày' : '100% 7-Day Money-Back Guarantee'}
            </h4>
            <p className="text-xs text-neutral-400 mt-0.5">
              {language === 'vi'
                ? 'Nếu bạn không hoàn toàn hài lòng với chất lượng âm thanh, liên hệ hỗ trợ để được hoàn tiền ngay lập tức không cần lý do.'
                : 'If you are not satisfied with the audio quality, reach out to support for an immediate, no-questions-asked refund.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setCheckoutPlan(selectedPlan)}
          className="flex-shrink-0 px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs transition-all active:scale-95 shadow-md cursor-pointer"
        >
          {language === 'vi' ? 'Nâng cấp ngay' : 'Upgrade Now'}
        </button>
      </div>

      {/* Checkout Modal */}
      {checkoutPlan && (
        <CheckoutModal
          plan={checkoutPlan}
          isOpen={!!checkoutPlan}
          onClose={() => setCheckoutPlan(null)}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </div>
  );
};
