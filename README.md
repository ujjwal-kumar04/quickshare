<<<<<<< HEAD
# QuickShare (MVP)

Secure file, text & document sharing via a unique share key. This is the **core MVP** slice of the full QuickShare spec: authentication, file/text sharing with auto-generated keys, retrieval, download, and share history. Admin panel, analytics charts, password-protected/expiring shares, and one-time downloads are not yet included — see "Not included yet" below.

## Stack
- **Frontend:** React + Vite, Tailwind CSS, React Router, Axios, React Dropzone, React Hook Form, React QR Code, Framer Motion, React Hot Toast
- **Backend:** Node.js + Express, MySQL (via `mysql2`), JWT, bcrypt, Multer, Helmet, CORS, rate limiting

## What's included
- Register / Login / Logout / Get current user / Update profile / Change password (JWT + bcrypt)
- Protected routes (frontend + backend)
- Upload one or more files (drag & drop) → generates a unique 8-character share key
- Share plain text → generates a unique share key
- Public "Receive" page: enter a key to preview text or download files
- View counter and download counter per share
- Share history: search, copy key, copy link, delete
- QR code for the share link
- Dark / light theme, saved to local storage
- Responsive, glassmorphism-inspired UI

## Not included yet (next stages)
- Admin panel (user & share management, platform-wide stats)
- Password-protected shares & expiry time
- One-time download option
- Dashboard analytics cards/charts, download/view history tables
- Forgot / reset password flow
- Image/PDF inline preview

Ask to have any of these layered on next.

## Getting started

### 1. Database
```bash
mysql -u root -p < backend/database/schema.sql
```
This creates the `quickshare` database and its tables.

### 2. Backend
```bash
cd backend
cp .env.example .env   # then edit DB credentials + JWT_SECRET
npm install
npm run dev             # nodemon, http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

### 4. Create an admin (optional, for future admin work)
```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

## Project structure
```
backend/
  config/db.js
  controllers/        # authController, shareController, fileController
  middleware/          # auth, upload (multer), errorHandler
  routes/               # authRoutes, shareRoutes, fileRoutes
  utils/                # generateShareKey, token (jwt)
  database/schema.sql
  server.js

frontend/
  src/
    api/axios.js
    context/            # AuthContext, ThemeContext
    components/         # Navbar, ProtectedRoute, FileDropzone, ThemeToggle
    pages/               # Home, Login, Register, Dashboard, ShareHistory, Receive
    App.jsx, main.jsx, index.css
```

## API summary
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | – | Create account |
| POST | /api/auth/login | – | Log in |
| GET  | /api/auth/me | ✓ | Current user |
| PUT  | /api/auth/profile | ✓ | Update name |
| PUT  | /api/auth/change-password | ✓ | Change password |
| POST | /api/shares/text | ✓ | Create a text share |
| POST | /api/shares/file | ✓ | Create a file share (multipart, field `files`) |
| GET  | /api/shares/key/:key | – | Retrieve a share by key |
| GET  | /api/shares/history | ✓ | List your shares |
| DELETE | /api/shares/:id | ✓ | Delete your share |
| GET  | /api/files/:fileId/download | – | Download a file |

## Notes
- Max upload size defaults to 25MB/file (`MAX_FILE_SIZE_MB` in backend `.env`).
- Allowed file types: images, PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, ZIP, TXT.
- Share keys are 8 characters, uppercase letters + digits, ambiguous characters excluded.
- This was generated in a sandboxed environment without network access, so dependencies have not been installed or run here — install and test locally as above.
=======
# Quickshare
>>>>>>> 542292318350704dd621211e0415588a83d1e0d9
