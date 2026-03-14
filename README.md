# ⚡ FlashLink — Africa's Trusted Logistics Platform

A full-stack logistics web application built with **React** (frontend) and **Node.js/Express** (backend).

---

## 🏗️ Project Structure

```
flashlink/
├── frontend/          # React 18 app
│   ├── src/
│   │   ├── pages/        # Home, Login, Register, Dashboard, GetQuote, Track, Contact
│   │   ├── components/   # Navbar, Footer, reusable UI
│   │   ├── context/      # AuthContext (JWT auth)
│   │   └── utils/        # Axios API instance
│   └── package.json
│
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── models/       # User, Quote, Shipment, Contact, Newsletter
│   │   ├── controllers/  # Auth, Quote, Shipment, Contact, Newsletter
│   │   ├── routes/       # REST API routes
│   │   ├── middleware/   # JWT auth, error handler
│   │   └── utils/        # Email (Nodemailer)
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
# Install all dependencies
npm run install:all

# OR install separately:
cd backend && npm install
cd frontend && npm install
```

### 2. Configure Environment Variables

**Backend** — copy `backend/.env.example` → `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/flashlink
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_key
JWT_REFRESH_EXPIRE=30d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@flashlink.com
EMAIL_FROM_NAME=FlashLink
CLIENT_URL=http://localhost:3000
ADMIN_EMAIL=admin@flashlink.com
```

**Frontend** — copy `frontend/.env.example` → `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Run Development Servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm start
```

---

## 🔌 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user (protected) |
| PUT | `/api/auth/me` | Update profile (protected) |
| POST | `/api/auth/refresh` | Refresh JWT token |

### Quotes
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/quotes` | Create quote (public/guest) |
| GET | `/api/quotes/my` | My quotes (protected) |
| GET | `/api/quotes/:id` | Get single quote |
| GET | `/api/quotes` | All quotes (admin/agent) |
| PUT | `/api/quotes/:id` | Update quote status (admin) |

### Shipments
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/shipments/track/:number` | Public tracking |
| GET | `/api/shipments/my` | My shipments (protected) |
| GET | `/api/shipments` | All shipments (admin) |
| PUT | `/api/shipments/:id/status` | Update status (admin) |

### Other
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/contact` | Submit contact form |
| POST | `/api/newsletter/subscribe` | Subscribe to newsletter |
| GET | `/api/newsletter/unsubscribe/:token` | Unsubscribe |

---

## 🎨 Tech Stack

**Frontend:** React 18, React Router v6, Axios, React Hook Form, React Hot Toast

**Backend:** Node.js, Express, MongoDB + Mongoose, JWT Auth, Nodemailer, Helmet, Rate Limiting

---

## 📈 Recommended Next Features

- [ ] Admin dashboard (manage quotes, shipments, users)
- [ ] Shipment document upload (Bill of Lading, etc.)
- [ ] Real-time notifications (Socket.io)
- [ ] Stripe/Flutterwave payment integration
- [ ] Multi-language support (EN/FR)
- [ ] Mobile app (React Native)
- [ ] SMS notifications (Africa's Talking)
- [ ] Analytics dashboard
- [ ] Live chat support
- [ ] Partner/agent portal

---

## 📞 Support

Built for FlashLink — Africa's Trusted Logistics Operator 🌍
