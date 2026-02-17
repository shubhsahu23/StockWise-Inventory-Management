# StockWise - Modern Inventory Management System

A full-stack MERN inventory management system with real-time analytics, barcode generation, and advanced export capabilities.

## 🚀 Features

### Dashboard & Analytics
- Real-time bar charts showing stock trends
- Filter by time period (7/14/30/60/90 days)
- Filter by product category
- Key metrics: Total products, Low stock alerts, Stock IN/OUT


### Product Management
- Complete CRUD operations
- Bulk update/delete with selection
- Low stock alerts with configurable thresholds
- Product variants support
- Search and filter by category, supplier, status

### Import/Export
- 📥 CSV import with validation and preview
- 📊 Excel export with professional styling
- 📄 PDF export with summary statistics
- 📈 Stock movement reports (30-day history)

### Barcode & QR Codes
- Code128 barcode generation
- QR code generation with product details
- Bulk barcode generation
- Display and download capabilities

### User Management
- Role-based access control (Admin/Staff)
- Admins can create other admins and staff
- Staff can only manage products and inventory
- Secure JWT authentication

## 🛠 Tech Stack

### Frontend
- React 19.2.0
- Vite 7.3.1
- React Router 6.28.1
- Tailwind CSS 4.1.18
- Recharts 2.12.7 (charts)
- Axios 1.7.9 (API client)
- html5-qrcode 2.3.8 (QR scanning)

### Backend
- Node.js v22.20.0
- Express 4.19.2
- MongoDB + Mongoose 8.6.3
- JWT Authentication
- ExcelJS 4.4.0 (Excel exports)
- PDFKit 0.15.0 (PDF exports)
- bwip-js 4.5.1 (Barcode generation)
- Multer 1.4.5 (File uploads)

## 📋 Prerequisites

- Node.js v22.20.0 or higher
- MongoDB (local or Atlas)
- npm or yarn

## 🔧 Environment Setup

Create these env files before running the app:

### Backend (backend/.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/inventory_db
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRES=30d
NODE_ENV=development
```

### Frontend (frontend/.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Getting Started

### 1. Clone the repository
```bash
cd "Inventory Management-1"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/inventory_db
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRES=30d
NODE_ENV=development
```

Seed admin user:
```bash
npm run seed:admin
```

(Optional) Seed sample data:
```bash
npm run seed:sample
```

Start backend:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5174
- Backend API: http://localhost:5000/api

### Default Admin Credentials
- Email: admin@test.com
- Password: admin123


## 📁 Project Structure

```
.
├── backend/
│   ├── .env               # Backend environment variables
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, error handling
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Helper functions, seeders
│   │   ├── app.js          # Express app setup
│   │   └── server.js       # Entry point
│   └── package.json
│
└── frontend/
    ├── .env               # Frontend environment variables
    ├── src/
    │   ├── api/            # API client functions
    │   ├── components/     # Reusable components
    │   ├── context/        # React context (auth)
    │   ├── hooks/          # Custom hooks
    │   ├── pages/          # Page components
    │   ├── utils/          # Utility functions
    │   ├── App.jsx         # Main app component
    │   └── main.jsx        # Entry point
    └── package.json
```

## 🔐 User Roles & Permissions

### Admin
- Full system access
- Can manage users (create/edit/delete)
- Can create other admins
- Can manage products and inventory
- Can view all analytics and reports

### Staff
- Limited access
- Can view and edit products
- Can manage inventory (stock IN/OUT)
- **Cannot** manage users
- Can view analytics and reports

## 📊 API Documentation

See [backend/README.md](backend/README.md) for complete API documentation.

## 🎨 Color Theme

- **Primary**: #2563EB (Blue)
- **Primary Strong**: #1D4ED8 (Dark Blue)
- **Background**: #F8FAFC (Light Gray)
- **Surface**: White
- **Text**: #0F172A (Dark)

## 🔧 Available Scripts

### Backend
```bash
npm run dev          # Start with nodemon
npm start            # Production mode
npm run seed:admin   # Seed admin user
npm run seed:sample  # Seed sample data
```

### Frontend
```bash
npm run dev      # Development server
npm run build    # Production build
```
