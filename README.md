# TempMailX — Disposable Email App

A fully-featured, production-ready temporary/disposable email web app.  
Built with **React + Vite + Tailwind CSS** (frontend) and **Node.js + Express** (backend), using the **mail.tm** public API.

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- npm 9+

### Start Backend
```bash
cd backend
npm install
node server.js
# → Running on http://localhost:3001
```

### Start Frontend
```bash
cd frontend
npm install
npm run dev
# → Running on http://localhost:5173
```

Open **http://localhost:5173** in your browser. Done!

---

## 🌐 Render Deployment

### Option A — Blueprint (Recommended, One-Click)
1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your repo → Render reads `render.yaml` and auto-configures both services
4. Deploy!

### Option B — Manual

#### Backend (Web Service)
| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `node server.js` |
| Environment Variable | `FRONTEND_URL` = your frontend Render URL |

#### Frontend (Static Site)
| Setting | Value |
|---|---|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |
| Environment Variable | `VITE_API_URL` = your backend Render URL |
| Redirect/Rewrite | `/*` → `/index.html` (for SPA routing) |

---

## 🧩 Features

| Feature | Status |
|---|---|
| Disposable email generation (mail.tm API) | ✅ |
| 10-minute countdown timer | ✅ |
| Extend timer (+10 min) | ✅ |
| Session restore on page refresh | ✅ |
| Expired session recovery | ✅ |
| Auto-polling inbox (2.5s) | ✅ |
| HTML email rendering (DOMPurify sanitized) | ✅ |
| New email sound + toast notifications | ✅ |
| Copy email button | ✅ |
| Dark glassmorphism UI | ✅ |
| Mobile responsive | ✅ |
| Loading skeletons | ✅ |
| Error handling | ✅ |

---

## 📁 Project Structure

```
Tempmaill/
├── backend/
│   ├── server.js              # Express entry point
│   ├── routes/email.js        # API routes
│   ├── services/mailService.js # mail.tm API wrapper
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css          # Tailwind + custom styles
│   │   ├── pages/Home.jsx
│   │   ├── components/
│   │   │   ├── EmailHeader.jsx
│   │   │   ├── InboxList.jsx
│   │   │   ├── EmailViewer.jsx
│   │   │   ├── ExpiredBanner.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── ErrorState.jsx
│   │   ├── hooks/useEmail.js  # Core state + polling logic
│   │   └── lib/
│   │       ├── api.js         # Axios client
│   │       ├── session.js     # localStorage helpers
│   │       └── sounds.js      # Web Audio notifications
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── render.yaml                # One-click Render deployment
```

---

## ⚠️ Notes

- **Rate Limiting**: mail.tm allows ~8 QPS. Don't click "New Email" too rapidly.
- **Attribution**: Per mail.tm terms, attribution link is included in the footer.
- **Session**: Stored in `localStorage` — refreshing preserves your inbox.
