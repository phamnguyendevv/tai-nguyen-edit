# Magnific Sound Effects (SFX) - Kiến Trúc Monorepo & Hệ Thống Phân Quyền (RBAC)

Dự án website chuyên tìm kiếm, nghe thử và quản lý Sound Effects (SFX) được tái hiện từ giao diện chuẩn của [Magnific Audio](https://www.magnific.com/audio/sound-effects/search?q=), được phân chia cấu trúc rõ ràng thành 2 module độc lập: **Backend (BE)** và **Frontend (FE)**, tích hợp hệ thống **Phân Quyền Thực Tế (Role-Based Access Control - RBAC)** chuẩn sản xuất.

---

## 👥 Tài Khoản Kiểm Thử Phân Quyền (Pre-configured Test Accounts)

Hệ thống đã tạo sẵn 2 tài khoản kiểm thử trong cơ sở dữ liệu để bạn có thể test nhanh:

| Vai trò | Email | Mật khẩu | Quyền hạn truy cập |
| :--- | :--- | :--- | :--- |
| **ADMIN** (Quản trị viên) | `admin@magnific.com` | `admin123` | • Toàn quyền truy cập **Admin Studio Portal** (`/admin`)<br>• Tải lên file âm thanh mới, tự động phân tích dạng sóng PCM<br>• Xuất bản âm thanh vào hệ thống<br>• Xóa âm thanh khỏi kho dữ liệu |
| **USER** (Người dùng thường) | `user@magnific.com` | `user123` | • Nghe thử âm thanh, tua nhạc trên Waveform 60fps<br>• Tìm kiếm, lọc theo danh mục, sắp xếp<br>• Lưu yêu thích (Favorites) và tải file âm thanh (`.wav`)<br>• **Bị chặn 403 Forbidden khi cố gắng vào `/admin` hoặc gọi API upload/xóa** |

> 💡 **Mẹo:** Bạn có thể bấm nút **"Log in"** trên thanh Header $\rightarrow$ bấm nút **1-Click Test Login** tương ứng để đăng nhập ngay mà không cần gõ thủ công!

---

## 🔒 Cơ Chế Phân Quyền Hoạt Động Như Thế Nào?

1. **Phía Backend (`backend/`)**:
   - `POST /api/auth/login`: Xác thực thông tin đăng nhập và cấp mã Token phiên làm việc.
   - `GET /api/auth/me`: Kiểm tra phiên làm việc hiện tại.
   - Middleware `requireAdmin` chặn các request nhạy cảm:
     - `POST /api/sound-effects` (Tải lên/Xuất bản): Trả về `403 Forbidden` nếu người dùng không phải ADMIN.
     - `DELETE /api/sound-effects/:id` (Xóa track): Trả về `403 Forbidden` nếu không phải ADMIN.
2. **Phía Frontend (`frontend/`)**:
   - `AuthProvider` ([auth-context.tsx](file:///d:/code/tainguyen-edit/frontend/src/lib/auth/auth-context.tsx)) lưu trạng thái đăng nhập và vai trò (`ADMIN` hoặc `USER`).
   - Nút **"Admin Studio"** trên Header: Chỉ hiển thị khi đăng nhập bằng tài khoản `ADMIN`.
   - Trang `/admin`: Có chốt chặn bảo mật **RBAC Security Gate**. Nếu Người dùng thường (`USER`) hoặc khách chưa đăng nhập truy cập vào `/admin`, màn hình sẽ hiển thị thông báo **403 Access Denied** kèm nút chuyển đổi tài khoản an toàn.

---

## 📁 Cấu Trúc Dự Án (Monorepo)

```text
tainguyen-edit/
├── backend/                       # MODULE BACKEND (Node.js, Express, TypeScript, Prisma)
│   ├── public/
│   │   └── audio/sfx/             # 24 file âm thanh chuẩn WAV 44.1kHz 16-bit
│   ├── prisma/
│   │   └── schema.prisma          # Schema PostgreSQL (User, Role, SoundEffect, Category, Favorite,...)
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth-controller.ts # Đăng nhập, xác thực session, test accounts
│   │   │   └── sfx-controller.ts  # CRUD âm thanh, upload, download
│   │   ├── middleware/
│   │   │   └── auth-middleware.ts # requireAuth, requireAdmin (RBAC Guards)
│   │   ├── data/
│   │   │   ├── users.ts           # 2 tài khoản seed: Admin và User
│   │   │   ├── categories.ts      # Danh mục phân cấp
│   │   │   └── sound-effects.ts   # Catalog âm thanh với waveform vật lý
│   │   ├── repositories/          # Data Access Layer (user-repository, sfx-repository)
│   │   ├── routes/                # auth-routes, sfx-routes
│   │   └── server.ts              # Express Server chính (Port 5000)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                      # MODULE FRONTEND (Next.js 16, React 19, Tailwind CSS v4)
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/page.tsx     # Admin Portal (Upload Station & Catalog Manager)
│   │   │   ├── layout.tsx         # Bọc AuthProvider + PlayerProvider
│   │   │   ├── page.tsx           # Trang Public Storefront
│   │   │   └── globals.css        # Dark theme
│   │   ├── components/
│   │   │   ├── Header.tsx         # Navbar hiển thị Role pill, avatar, Admin link
│   │   │   ├── LoginModal.tsx     # Hộp thoại đăng nhập 1-click test tài khoản
│   │   │   ├── Sidebar.tsx        # Accordion danh mục tự đóng danh mục cũ
│   │   │   ├── SoundEffectCard.tsx# Card âm thanh, mini equalizer, 60fps playhead
│   │   │   ├── WaveformScrubber.tsx # Thanh sóng phân tích biên độ thực tế
│   │   │   └── BottomPlayer.tsx   # Thanh phát đáy màn hình
│   │   ├── lib/
│   │   │   ├── api-client.ts      # SDK kết nối Backend kèm Bearer token
│   │   │   ├── auth/auth-context.tsx # React Auth Context
│   │   │   └── audio/             # Waveform extractor & player context
│   │   └── types/                 # Types cho SFX và Auth
│   ├── package.json
│   ├── next.config.ts
│   └── tsconfig.json
│
├── package.json                   # Root scripts quản lý toàn bộ monorepo
└── README.md
```

---

## 🚀 Hướng Dẫn Khởi Chạy

```bash
# Cài đặt tất cả dependencies
npm run install:all

# Chạy Backend (Port 5000)
npm run dev:be

# Chạy Frontend (Port 3000)
npm run dev:fe

# Biên dịch kiểm tra toàn bộ
npm run build
```

- 🌐 **Frontend UI:** [http://localhost:3000](http://localhost:3000)
- 🎛️ **Admin Studio Portal:** [http://localhost:3000/admin](http://localhost:3000/admin)
- 🔌 **Backend API:** [http://localhost:5000](http://localhost:5000)
