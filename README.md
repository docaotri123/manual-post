# Manual Post Management System

A comprehensive content and image management system built with Next.js and Firebase.

## Features

- **Content Management**: Create, read, update, delete content posts
- **Image Management**: Upload, organize, and manage images with AI/Human categorization
- **User Authentication**: Role-based access control system
- **Permission System**: Granular permissions for different user roles
- **Image Compression**: Automatic image optimization for better performance
- **Search & Filter**: Advanced filtering and search capabilities
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage (for images)
- **Authentication**: Custom auth system
- **UI Components**: Custom components with Lucide icons

## Project Structure

```
manual-post/
├── app/
│   ├── api/
│   │   ├── contents/     # Content CRUD operations
│   │   ├── images/       # Image CRUD operations
│   │   ├── users/        # User authentication
│   │   └── upload/       # File upload handling
│   ├── dashboard/
│   │   ├── content/      # Content management page
│   │   ├── images/       # Image management page
│   │   ├── post/         # Post creation page
│   │   └── users/        # User management page
│   └── login/            # Login page
├── lib/
│   ├── firebase.ts       # Firebase configuration
│   ├── auth.ts          # Authentication utilities
│   └── permissions.ts    # Permission system
└── components/ui/        # Reusable UI components
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd manual-post
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create `.env.local` file:
```env
NEXT_PRIVATE_FIREBASE_API_KEY=your_api_key
NEXT_PRIVATE_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Set up Firebase:
   - Create a Firebase project
   - Enable Firestore Database
   - Enable Storage
   - Configure Firestore rules (see `firestore.rules`)

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## API Endpoints

### Contents API (`/api/contents`)
- `GET` - Fetch all contents
- `POST` - Create new content
- `PUT` - Update existing content
- `DELETE` - Delete content

### Images API (`/api/images`)
- `GET` - Fetch all images
- `POST` - Upload new image
- `PUT` - Update image metadata
- `DELETE` - Delete image

### Users API (`/api/users`)
- `GET` - Fetch all users
- `POST` - User login
- `PUT` - Create new user
- `DELETE` - Delete user

## User Roles & Permissions

- **Admin**: Full access to all features
- **Editor**: Can manage content and images
- **Viewer**: Read-only access

## Features in Detail

### Content Management
- Rich text content creation
- Icon support for visual categorization
- Timestamp tracking
- User attribution

### Image Management
- Automatic image compression
- AI/Human categorization
- Search and filtering
- Bulk upload support
- Responsive image display

### Authentication System
- Username/password authentication
- Role-based access control
- Session management
- Permission checking

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

## Firebase Configuration

### Firestore Rules
See `firestore.rules` for security rules configuration.

### Collections Structure

**Contents Collection:**
```javascript
{
  id: string,
  title: string,
  text: string,
  icon: string,
  createdAt: string,
  createdBy: string,
  updatedAt: string
}
```

**Images Collection:**
```javascript
{
  id: string,
  name: string,
  url: string,
  uploadedAt: string,
  createdBy: 'ai' | 'human'
}
```

**Users Collection:**
```javascript
{
  id: string,
  username: string,
  password: string,
  role: 'admin' | 'editor' | 'viewer'
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.