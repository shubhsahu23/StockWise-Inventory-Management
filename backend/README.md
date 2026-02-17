# StockWise - Inventory Management System (Backend)

RESTful API backend for inventory management system with JWT authentication and advanced export capabilities.

## Features

- 🔐 **JWT Authentication** - Secure token-based auth with role-based access control
- 👥 **User Management** - Admin and Staff roles with protected endpoints
- 📦 **Product Management** - CRUD operations with low stock alerts
- 📊 **Stock History Tracking** - Complete audit trail of stock movements
- 📥 **Import/Export**
  - CSV import with validation
  - Excel export with professional styling
  - PDF export with summary statistics
  - Stock movement reports (30-day history)
- 🏷️ **Barcode/QR Generation** - Code128 barcodes and QR codes with bwip-js
- 📈 **Analytics** - Dashboard summaries with time period and category filters

## Tech Stack

- Node.js v22.20.0
- Express 4.19.2
- MongoDB + Mongoose 8.6.3
- JWT (jsonwebtoken 9.0.2)
- bcryptjs 2.4.3
- ExcelJS 4.4.0
- PDFKit 0.15.0
- bwip-js 4.5.1
- Multer 1.4.5 (file uploads)
- express-validator 7.2.0

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/inventory_db
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES=30d
NODE_ENV=development
```

3. Seed admin user:
```bash
npm run seed:admin
```

4. (Optional) Seed sample data:
```bash
npm run seed:sample
```

5. Start development server:
```bash
npm run dev
```

6. Start production server:
```bash
npm start
```

## Available Scripts

- `npm run dev` - Start with nodemon (auto-restart)
- `npm start` - Start production server
- `npm run seed:admin` - Create/update admin user
- `npm run seed:sample` - Seed sample products and categories

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Users (Admin only)
- `GET /api/users` - List users with filters
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Products
- `GET /api/products` - List products with filters
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `DELETE /api/products/bulk` - Bulk delete products
- `POST /api/products/import` - Import from CSV
- `GET /api/products/export/csv` - Export to CSV
- `GET /api/products/export/excel` - Export to Excel
- `GET /api/products/export/pdf` - Export to PDF
- `GET /api/products/export/stock-report` - 30-day stock report

### Barcodes
- `GET /api/barcodes/generate/:sku` - Generate barcode for SKU
- `GET /api/barcodes/qr/:id` - Generate QR code for product
- `POST /api/barcodes/bulk` - Generate multiple barcodes

### Stock History
- `GET /api/stock` - List stock movements with filters
- `POST /api/stock` - Record stock movement

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Analytics
- `GET /api/analytics/dashboard` - Dashboard summary statistics

## Database Models

### User
- name, email, password (hashed), role (ADMIN/STAFF)

### Product
- name, sku, category, supplier, description, price, quantity, lowStockThreshold, lowStock (computed), variants

### StockHistory
- product, type (IN/OUT), quantity, reason, performedBy, date

### Category
- name, description

## Default Admin User

After running `npm run seed:admin`:
- Email: admin@test.com
- Password: admin123

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Protected routes with role validation
- Express Helmet for security headers
- CORS configuration
- Input validation with express-validator
- Error handling middleware
