# KaamWala - Project Documentation

## 1. Project Overview
**KaamWala** is a comprehensive on-demand service marketplace platform connecting customers with skilled local workers (electricians, plumbers, cleaners, etc.). It features real-time bookings, live chat, secure authentication, and dedicated dashboards for Customers, Workers, and Administrators.

## 2. Technology Stack
The application is built using the **MERN Stack** with real-time capabilities.

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Real-Time Engine**: Socket.io
- **Security**: Helmet, Rate-Limit, XSS-Clean, Mongo-Sanitize, CORS
- **Authentication**: JWT (JSON Web Tokens), Bcrypt.js
- **File Storage**: Cloudinary (for profile & verification images)

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Vanilla CSS, Lucide-React (Icons)
- **State Management**: React Context API (`AuthContext`, `SocketContext`)
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast

---

## 3. Core Features & Modules

### A. Authentication & User Management
- **Roles**: 
  - **Customer**: Can browse services, book workers, track history.
  - **Worker**: Can manage profile, accept/reject jobs, view earnings.
  - **Admin**: Verifies workers, manages users, views analytics.
- **Security**: Password hashing, Token-based session management, Protected Routes.

### B. Worker Profile & Verification
- **Public Profiles**: Workers currently have public profiles displaying skills, extensive bio, and ratings.
- **Verification System**: Workers upload CNIC (Front/Back) during registration. Admins manually review and "Approve" or "Reject" them.
- **Availability**: Workers can toggle their status (Available/Unavailable).

### C. Booking System (Real-Time)
The core of the platform.
1.  **Booking Creation**: Customer selects verify worker -> Fills details -> Sends Request.
2.  **Worker Notification**: Worker receives instant socket alert & Bell notification.
3.  **Status Workflow**: `Pending` -> `Accepted` -> `In Progress` -> `Work Done` -> `Completed`.
4.  **Tracking**: Customers can track status changes live.

### D. Communication System
- **Live Chat**: Integrated chat between Customer and Worker for active bookings.
- **Notifications**:
  - **System**: Database-persisted notifications for Booking updates (Accepted, Completed).
  - **Chat**: Unread message badges on dashboard and valid notifications in the Bell menu.
  - **Delivery**: Instant delivery via Socket.io.

### E. Admin Dashboard
- **Analytics**: Charts for Total Users, Workers by Category, Order Status distribution.
- **User Management**: Delete users, View all users.
- **Worker Approval**: Table to view pending worker documents and Approve/Reject.
- **Complaints**: View and resolve user support tickets.

---

## 4. Security Implementation
A robust security layer has been implemented to protect user data and infrastructure.

1.  **Secure HTTP Headers (`Helmet`)**:
    - Protects against clickjacking, sniffing, and other standard attacks.
    - Configured to allow Cloudinary resources.
2.  **Rate Limiting**:
    - Limits incoming requests to **100 per 10 minutes** per IP address.
    - Prevents Brute Force and DDoS attacks.
3.  **Data Sanitization**:
    - **`express-mongo-sanitize`**: Prevents NoSQL Injection (stripping `$` and `.` characters).
    - **`xss-clean`**: Prevents Cross-Site Scripting (XSS) by sanitizing user input.
    - **`hpp`**: Prevents HTTP Parameter Pollution.
4.  **CORS Policy**:
    - Strictly whitelisted to allow requests **only** from the frontend (`http://localhost:5173`).

---

## 5. Database Schema Overview

### `User`
- `name`, `email`, `password`, `role` (customer/admin/worker), `phone`
- `createdAt`

### `WorkerProfile`
- `userId` (Ref User)
- `skill`, `experience`, `hourlyRate`, `city`, `bio`
- `cnicFront`, `cnicBack`, `document` (Verification images)
- `isVerified` (Boolean), `verificationStatus` (pending/approved/rejected)
- `availability` (Boolean)

### `Booking`
- `customerId` (Ref User), `workerId` (Ref User/Worker)
- `service`, `status` (pending/accepted/etc.), `price`, `date`
- `location`, `coordinates`

### `Message`
- `conversationId`, `senderId`, `text`, `createdAt`, `read` (Boolean)

### `Notification`
- `recipientId`, `senderId`, `type` (booking_new, booking_update, message)
- `message` (String), `isRead` (Boolean)

---

## 6. API Endpoints Summary

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login & get Token

### Booking
- `POST /api/bookings` - Create Booking
- `GET /api/bookings/my` - Get Customer Bookings
- `GET /api/bookings/worker/my` - Get Worker Jobs
- `PATCH /api/bookings/:id/status` - Update Status

### Admin
- `GET /api/admin/stats` - Dashboard Analytics
- `GET /api/admin/pending-workers` - Verification Queue
- `PATCH /api/admin/verify-worker/:id` - Approve/Reject

---

## 7. Setup & Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (Local or Atlas)
- Cloudinary Account

### 1. Clone & Install
```bash
git clone <repo_url>
cd kaamwala
# Install Backend
cd backend
npm install
# Install Frontend
cd ../frontend
npm install
```

### 2. Environment Variables (.env)
Create a `.env` file in `backend/`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/kaamwala
JWT_SECRET=your_super_secret_key
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

### 3. Run Application
**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```
Access the app at `http://localhost:5173`
