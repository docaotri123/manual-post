# Manual Post Management System - Documentation

## 📋 Tổng quan

**Manual Post Management System** là hệ thống quản lý nội dung và hình ảnh với phân quyền người dùng, được xây dựng bằng Next.js 14 và Firebase Firestore.

## 🎯 Tính năng chính

### 1. Quản lý Content
- Tạo, xem, xóa nội dung bài đăng
- Hỗ trợ icon emoji và text dài
- Lưu thông tin người tạo và thời gian

### 2. Quản lý Hình ảnh
- Upload nhiều hình cùng lúc
- Tự động nén hình (max 600px, quality 50%)
- Phân loại AI/Human
- Xóa hình ảnh
- Lưu base64 vào Firestore
- Tìm kiếm và lọc theo loại

### 3. Đăng bài
- Chọn content từ danh sách
- Chọn nhiều hình ảnh
- Copy nội dung + hình vào clipboard
- Share qua native app

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
  "uploadedAt": "2025-01-15T10:00:00.000Z",
  "createdBy": "ai" | "human"
}
```

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
NEXT_PRIVATE_FIREBASE_API_KEY=your_api_key
NEXT_PRIVATE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
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

### Mobile (< 1024px)
- Layout dọc, sections riêng biệt
- Grid 3 cột cho hình ảnh
- Button cố định ở dưới cùng
- Touch-friendly với active states

### Desktop (≥ 1024px)
- Layout ngang 3 cột
- Grid 5 cột cho hình ảnh
- Sidebar có thể thu gọn
- Hover effects

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
- `PUT` - Cập nhật content
- `DELETE` - Xóa content

### `/api/images`
- `GET` - Lấy tất cả images
- `POST` - Upload image mới
- `PUT` - Cập nhật image metadata
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
- [ ] Hash passwords
- [ ] JWT authentication
- [ ] Edit content/images inline
- [ ] Pagination
- [ ] Export/Import data
- [ ] Activity logs
- [ ] Watermark functionality

## 📞 Support

Liên hệ: admin@manualpost.com

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-15
