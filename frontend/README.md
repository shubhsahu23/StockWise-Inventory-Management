# StockWise - Inventory Management System (Frontend)

Modern React-based inventory management system with real-time analytics and advanced features.

## Features

- 📊 **Real-time Analytics Dashboard** - Bar charts with time period and category filters
- 🏷️ **Barcode & QR Code Generation** - Generate and display product barcodes
- 📥 **Import/Export** - CSV import, Excel/PDF/CSV exports with stock reports
- ⚡ **Bulk Operations** - Select multiple products for bulk update/delete
- 🌓 **Light/Dark Mode** - Theme toggle with localStorage persistence
- 🔐 **Role-based Access** - Admin and Staff user roles with protected routes
- 🎨 **Modern UI** - Professional Blue/White/Gray theme using Tailwind CSS

## Tech Stack

- React 19.2.0
- Vite 7.3.1
- React Router 6.28.1
- Tailwind CSS 4.1.18
- Recharts 2.12.7
- Axios 1.7.9
- html5-qrcode 2.3.8

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── api/          # API client functions
├── assets/       # Static assets
├── components/   # Reusable components
├── context/      # React context providers
├── hooks/        # Custom React hooks
├── pages/        # Page components
├── utils/        # Utility functions
├── App.jsx       # Main app component
├── main.jsx      # Entry point
└── index.css     # Global styles
```

## Default Admin Credentials

- Email: admin@test.com
- Password: admin123
