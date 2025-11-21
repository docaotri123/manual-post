# Manual Post Management System - Documentation

## 📋 Tổng quan

**Manual Post Management System** là hệ thống quản lý nội dung và hình ảnh với phân quyền người dùng, được xây dựng bằng Next.js 14 và Firebase Firestore.

## 🎯 Tính năng chính

### 1. Quản lý Content
- Tạo, xem, sửa, xóa nội dung bài đăng
- Hỗ trợ icon emoji và text dài
- Lưu thông tin người tạo và thời gian
- 3 chế độ xem: Grid, List, Table
- Sắp xếp theo: Mới nhất, Cũ nhất, A-Z, Z-A, Ngắn nhất, Dài nhất
- Modal tạo/chỉnh sửa content
- Responsive trên mobile và desktop

### 2. Quản lý Hình ảnh
- Upload nhiều hình cùng lúc
- Tự động nén hình (max 600px, quality 50%)
- **Thumbnail system** (150x150px, quality 40%) cho performance tối ưu
- Phân loại AI/Human với badge màu sắc
- 3 chế độ xem: Grid, List, Table
- Sắp xếp: Mới nhất, Cũ nhất, A-Z, Z-A, AI trước, Người trước
- Tìm kiếm theo tên
- Lọc theo loại (Tất cả/AI/Người)
- Migration tool: Tự động generate thumbnail cho hình cũ
- Xóa hình ảnh
- Lưu base64 vào Firestore
- Responsive design cho mobile và desktop

### 3. Đăng bài
- Chọn content từ danh sách (tự động sắp xếp đã chọn lên đầu)
- Chọn nhiều hình ảnh (tự động sắp xếp đã chọn lên đầu)
- Badge AI/Người trên mỗi hình
- Selected state với màu xanh dương (friendly UX)
- Watermark preview trước khi share
- Random content + hình (cân bằng AI/Human)
- Reset button để xóa tất cả lựa chọn
- Copy nội dung + hình vào clipboard
- Share qua native app
- Responsive layout mobile/desktop

### 4. Quản lý Users
- 3 roles: Admin, Editor, Viewer
- CRUD users với phân quyền
- Lưu thông tin người tạo

## 🔐 Phân quyền (Roles)

### Tổng quan Roles

| Role | Icon | Mô tả |
|------|------|-------|
| **Admin** | 🔧 | Toàn quyền hệ thống, quản lý users và content |
| **Editor** | ✏️ | Tạo/sửa content, upload images, không xóa |
| **Viewer** | 👁️ | Chỉ xem và copy để đăng bài |

### Ma trận Phân quyền Chi tiết

| Tính năng | Admin | Editor | Viewer |
|-----------|-------|--------|--------|
| **Users Management** | | | |
| Xem danh sách users | ✅ | ❌ | ❌ |
| Tạo user mới | ✅ | ❌ | ❌ |
| Xóa user | ✅ | ❌ | ❌ |
| Truy cập trang Users | ✅ | ❌ | ❌ |
| **Content Management** | | | |
| Xem content | ✅ | ✅ | ✅ |
| Tạo content | ✅ | ✅ | ❌ |
| Sửa content | ✅ | ✅ | ❌ |
| Xóa content | ✅ | ❌ | ❌ |
| Truy cập trang Content | ✅ | ✅ | ✅ |
| **Images Management** | | | |
| Xem images | ✅ | ✅ | ✅ |
| Upload images | ✅ | ✅ | ❌ |
| Xóa images | ✅ | ❌ | ❌ |
| Truy cập trang Images | ✅ | ✅ | ✅ |
| **Post/Share** | | | |
| Đăng bài/Share | ✅ | ✅ | ✅ |
| Truy cập trang Post | ✅ | ✅ | ✅ |

## 🗄️ Database Schema (Firestore)

### Collection: `users`
```json
{
  "id": "auto-generated",
  "username": "admin",
  "password": "123456",
  "role": "admin",
  "createdAt": "2025-01-15T10:00:00.000Z",
  "createdBy": "admin",
  "updatedAt": "2025-01-15T10:00:00.000Z"
}
```

### Collection: `contents`
```json
{
  "id": "auto-generated",
  "title": "Tiêu đề bài đăng",
  "text": "Nội dung chi tiết...",
  "icon": "📝",
  "createdAt": "2025-01-15T10:00:00.000Z",
  "createdBy": "admin",
  "updatedAt": "2025-01-15T10:00:00.000Z"
}
```

### Collection: `images`
```json
{
  "id": "auto-generated",
  "name": "image.jpg",
  "url": "data:image/jpeg;base64,...",
  "thumbnail": "data:image/jpeg;base64,...",
  "uploadedAt": "2025-01-15T10:00:00.000Z",
  "createdBy": "ai" | "human"
}
```

**Note**: 
- `url`: Full size image (max 600px, quality 50%)
- `thumbnail`: Thumbnail for grid view (150x150px, quality 40%)
- Hình cũ có thể không có `thumbnail`, dùng migration tool để generate

## 🚀 Cài đặt

### 1. Clone & Install
```bash
git clone <repo-url>
cd manual-post
npm install
```

### 2. Cấu hình Firebase
Tạo file `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Cấu hình Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 4. Tạo User đầu tiên
Vào Firebase Console → Firestore → Tạo collection `users`:
```json
{
  "username": "admin",
  "password": "123456",
  "role": "admin",
  "createdAt": "2025-01-15T00:00:00.000Z",
  "createdBy": "system",
  "updatedAt": "2025-01-15T00:00:00.000Z"
}
```

### 5. Chạy Development Server
```bash
npm run dev
```
Mở http://localhost:3000

## 📱 Responsive Design

### Mobile (< 768px)
- Layout dọc, sections riêng biệt
- Grid 3 cột cho hình ảnh
- Button cố định ở dưới cùng
- Touch-friendly với active states
- Table view tự động chuyển thành card

### Desktop (≥ 768px)
- Layout ngang 3 cột
- Grid 5 cột cho hình ảnh
- Sidebar có thể thu gọn
- Hover effects
- Table view đầy đủ các cột

## 🎨 UI Components

### Loading State
- Full-screen overlay với spinner
- Animation xoay chậm (2s)
- Hiển thị khi CRUD operations

### Sidebar Menu
- Responsive với hamburger menu (mobile)
- 4 menu items với gradient colors
- Active state với animation

### Cards
- Shadow và border radius
- Hover effects (desktop)
- Active scale animation (mobile)

### View Modes (Content Page)
- **Grid View**: Hiển thị dạng card lưới 2-3 cột
- **List View**: Hiển thị dạng danh sách ngang
- **Table View**: Hiển thị dạng bảng (desktop), card (mobile)

### Sort Options (Content Page)
- 📅 Mới nhất / Cũ nhất (theo createdAt)
- 🔤 A → Z / Z → A (theo tiêu đề)
- 📏 Ngắn nhất / Dài nhất (theo độ dài nội dung)

### Modal Create/Edit
- Full-screen overlay
- Form với Icon, Tiêu đề, Nội dung
- Nút Hủy và Lưu/Cập nhật
- Tự động đóng sau khi lưu

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS + Custom UI Components
- **Database**: Firebase Firestore
- **Icons**: Lucide React
- **Language**: TypeScript

## 📂 Cấu trúc thư mục

```
manual-post/
├── app/
│   ├── api/
│   │   ├── contents/route.ts
│   │   ├── images/route.ts
│   │   └── users/route.ts
│   ├── dashboard/
│   │   ├── content/page.tsx
│   │   ├── images/page.tsx
│   │   ├── post/page.tsx
│   │   ├── users/page.tsx
│   │   └── layout.tsx
│   ├── login/page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   └── ui/
├── lib/
│   ├── auth.ts
│   ├── firebase.ts
│   ├── permissions.ts
│   └── utils.ts
├── .env.local
└── firestore.rules
```

## 🔄 Workflow đăng bài

1. **Tạo Content** → Vào "Quản lý Content" → Nhập tiêu đề, nội dung, icon
2. **Upload Hình** → Vào "Quản lý Hình" → Upload nhiều hình, chọn loại AI/Human
3. **Đăng bài** → Vào "Đăng bài":
   - Chọn 1 content
   - Chọn nhiều hình
   - Click "Chia sẻ"
   - Hệ thống tự động:
     - Copy nội dung vào clipboard
     - Copy tất cả hình vào clipboard
4. **Share** → Paste vào Facebook/Zalo/etc.

## 🛡️ Security Notes

⚠️ **Quan trọng**: Hiện tại password lưu plain text. Nên:
- Hash password với bcrypt
- Implement JWT authentication
- Thêm rate limiting
- Validate input server-side

## 📝 API Endpoints

### `/api/contents`
- `GET` - Lấy tất cả contents
- `POST` - Tạo content mới
- `PUT` - Cập nhật content (title, text, icon)
- `DELETE` - Xóa content

### `/api/images`
- `GET` - Lấy tất cả images
- `POST` - Upload image mới (tự động generate thumbnail)
- `PUT` - Cập nhật image metadata (thumbnail, createdBy, etc.)
- `DELETE` - Xóa image

### `/api/users`
- `GET` - Lấy tất cả users
- `POST` - Login authentication
- `PUT` - Tạo user mới
- `DELETE` - Xóa user

## 🎯 Roadmap

- [x] CRUD operations for all entities
- [x] Role-based permissions
- [x] Image compression and categorization
- [x] Search & filter for images
- [x] Thumbnail system for performance
- [x] Migration tool for old images
- [x] Edit content inline
- [x] View modes (Grid/List/Table)
- [x] Sort & filter improvements
- [x] Watermark functionality
- [x] Auto-sort selected items
- [ ] Hash passwords
- [ ] JWT authentication
- [ ] Pagination
- [ ] Export/Import data
- [ ] Activity logs

## 📞 Support

Liên hệ: admin@manualpost.com

---

## 🆕 Features Detail

### Content Management Page

#### Layout Structure
1. **Header**
   - Tiêu đề "Quản lý Content"
   - Hiển thị tổng số content
   - Nút "Tạo mới" (chỉ hiển với Editor/Admin)

2. **Toolbar**
   - Dropdown Sort (trái)
   - Toggle View Modes (phải)

3. **Content Display**
   - Grid: 2-3 cột cards
   - List: Danh sách ngang với icon lớn
   - Table: Bảng đầy đủ (desktop) / Cards (mobile)

#### Actions
- **Edit** (✏️): Mở modal chỉnh sửa content
- **Delete** (🗑️): Xóa content (có confirm)

#### Permissions
- **Admin**: Tạo, sửa, xóa
- **Editor**: Tạo, sửa
- **Viewer**: Chỉ xem

---

### Images Management Page

#### Layout Structure
1. **Header**
   - Tiêu đề "Quản lý Hình"
   - Stats: Tổng | AI | Người | Thiếu thumbnail
   - Button "Tạo Thumbnail (X)" (nếu có hình thiếu thumbnail)
   - Button "Upload"

2. **Toolbar**
   - Search box với icon
   - Sort dropdown (6 options)
   - Filter dropdown (Tất cả/AI/Người)
   - View modes toggle (Grid/List/Table)

3. **Content Display**
   - Grid: 2-5 cột responsive, dùng thumbnail
   - List: Hàng ngang với thumbnail + info
   - Table: Bảng đầy đủ (desktop) / Cards (mobile)

#### Thumbnail System
- **Auto-generate**: Hình mới tự động có thumbnail khi upload
- **Migration tool**: Button "Tạo Thumbnail" cho hình cũ
- **Performance**: Load nhanh hơn 10x với thumbnail 150x150px
- **Fallback**: Dùng full size nếu không có thumbnail

#### Actions
- **Upload**: Modal với radio AI/Người, drag & drop
- **Delete**: Xóa hình (có confirm)
- **Generate Thumbnails**: Batch generate cho hình cũ

---

### Post Page (Đăng bài)

#### Features
- **Auto-sort**: Items đã chọn tự động lên đầu
- **Badge labels**: AI (tím) / Người (xanh lá) trên mỗi hình
- **Selected state**: Ring xanh dương + checkmark
- **Random**: Chọn ngẫu nhiên 1 content + 3-5 hình (cân bằng AI/Human)
- **Reset**: Xóa tất cả lựa chọn
- **Watermark preview**: Xem trước watermark trước khi share

---

**Version**: 1.2.0  
**Last Updated**: 2025-01-16
