# Deploy Next.js to Firebase Hosting + Cloud Functions

## 📋 Yêu cầu

- Node.js 18+
- Firebase CLI
- Tài khoản Firebase (Blaze Plan - trả phí)

## 🚀 Bước 1: Cài đặt Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

## 🔧 Bước 2: Khởi tạo Firebase

```bash
cd manual-post
firebase init
```

Chọn:
- ✅ Hosting
- ✅ Functions
- Chọn project: `tri-3a6e7`
- Public directory: `out`
- Single-page app: `No`
- GitHub Actions: `No`

## 📦 Bước 3: Cấu hình Next.js cho Static Export

Tạo file `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
```

## ⚠️ Lưu ý: Next.js Static Export

Static export **KHÔNG hỗ trợ**:
- API Routes (`/api/*`)
- Server Components
- Dynamic Routes với `getServerSideProps`

## 🔄 Giải pháp: Chuyển API sang Client-side

### Option A: Gọi Firestore trực tiếp từ Client

Xóa folder `app/api/` và gọi Firestore trực tiếp:

```typescript
// Thay vì fetch('/api/contents')
import { db } from '@/lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

const snapshot = await getDocs(collection(db, 'contents'))
const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
```

### Option B: Dùng Firebase Cloud Functions

Giữ API logic nhưng chuyển sang Cloud Functions.

## 📝 Bước 4: Build & Deploy

```bash
# Build static files
npm run build

# Deploy
firebase deploy
```

## 🌐 Bước 5: Cấu hình firebase.json

```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## 🔐 Bước 6: Cấu hình Environment Variables

Trong Firebase Console:
1. Project Settings → General
2. Thêm Web App nếu chưa có
3. Copy Firebase config

Hoặc dùng `.env.local` (không commit):
```env
NEXT_PRIVATE_FIREBASE_API_KEY=...
NEXT_PRIVATE_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## ⚡ Giải pháp Khuyến nghị: Vercel

Vì project dùng API Routes, nên deploy lên **Vercel** dễ hơn:

```bash
# Cài Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Vercel tự động:
- ✅ Hỗ trợ API Routes
- ✅ Hỗ trợ Server Components
- ✅ Free tier đủ dùng
- ✅ Auto deploy từ Git
- ✅ Environment variables UI

## 📊 So sánh

| Tính năng | Firebase Hosting | Vercel |
|-----------|------------------|--------|
| API Routes | ❌ (cần Cloud Functions) | ✅ |
| Static Export | ✅ | ✅ |
| Server Components | ❌ | ✅ |
| Free Tier | ❌ (cần Blaze) | ✅ |
| Setup | Phức tạp | Đơn giản |

## 🎯 Khuyến nghị

**Deploy lên Vercel** vì:
1. Project dùng API Routes
2. Không cần refactor code
3. Free tier đủ dùng
4. Setup đơn giản hơn

## 📱 Deploy lên Vercel (Chi tiết)

### 1. Tạo tài khoản Vercel
- Vào https://vercel.com
- Sign up với GitHub

### 2. Import Project
```bash
vercel
```

Hoặc qua UI:
1. New Project
2. Import Git Repository
3. Chọn repo `manual-post`

### 3. Cấu hình Environment Variables
Trong Vercel Dashboard → Settings → Environment Variables:
```
NEXT_PRIVATE_FIREBASE_API_KEY=...
NEXT_PRIVATE_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 4. Deploy
- Push code lên GitHub
- Vercel tự động deploy
- URL: `https://your-project.vercel.app`

## 🔒 Security Checklist

- [ ] Cấu hình Firestore Rules
- [ ] Hash passwords (hiện tại plain text)
- [ ] Thêm rate limiting
- [ ] HTTPS only
- [ ] Environment variables không commit

## 📞 Support

Nếu gặp vấn đề, check:
- Vercel Logs
- Firebase Console
- Browser DevTools

---

**Khuyến nghị**: Deploy lên Vercel cho đơn giản! 🚀
