# RashTrackr

RashTrackr is a full-stack web application for community-driven environmental reporting and analytics. It consists of a Node.js/Express backend and a React (Create React App) frontend, with features for reporting, gamification, notifications, and analytics.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
  - [Backend](#backend)
  - [Frontend (Web App)](#frontend-web-app)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Overview](#api-overview)
- [Security & Best Practices](#security--best-practices)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

- User authentication (JWT)
- Environmental issue reporting
- Gamification (achievements, leaderboards)
- Community dashboards
- Notifications (in-app and email)
- Analytics and statistics
- Progressive Web App (PWA) support
- Admin dashboard

---

## Project Structure

```
trash/
  backend/         # Node.js/Express backend
    src/
      controllers/
      middleware/
      models/
      routes/
      services/
      __tests__/
    logs/
    package.json
    README.md
  web-app/         # React frontend (Create React App)
    src/
      components/
      pages/
      contexts/
      api.js
      App.jsx
      ...
    public/
    package.json
    README.md
```

---

## Setup Instructions

### Backend

1. **Install dependencies:**
   ```sh
   cd backend
   npm install
   ```

2. **Create a `.env` file in `backend/` with the following variables:**
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/rashtrackr
   JWT_SECRET=your_jwt_secret
   SESSION_SECRET=your_session_secret
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=your_redis_password
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_email_password
   SMTP_FROM=noreply@rashtrackr.com
   ELASTICSEARCH_URL=http://localhost:9200
   ELASTICSEARCH_USERNAME=your_es_user
   ELASTICSEARCH_PASSWORD=your_es_password
   NODE_ENV=development
   ```

3. **Start the backend server:**
   ```sh
   npm start
   ```
   The server will run on `http://localhost:5000`.

---

### Frontend (Web App)

1. **Install dependencies:**
   ```sh
   cd web-app
   npm install
   ```

2. **(Optional) Create a `.env` file in `web-app/` for custom environment variables.**

3. **Start the frontend development server:**
   ```sh
   npm start
   ```
   The app will run on `http://localhost:3000` and proxy API requests to the backend.

---

## Environment Variables

See the [Setup Instructions](#setup-instructions) for required backend variables.  
Frontend may use `.env` for custom settings (see [CRA docs](https://create-react-app.dev/docs/adding-custom-environment-variables/)).

---

## Scripts

### Backend

- `npm start` — Start the server
- `npm run dev` — Start with nodemon (auto-reload)
- `npm test` — Run backend tests

### Frontend

- `npm start` — Start the React dev server
- `npm run build` — Build for production
- `npm test` — Run frontend tests

---

## Testing

- **Backend:** Uses Jest and Supertest. Place tests in `backend/src/__tests__/`.
- **Frontend:** Uses Jest and React Testing Library. Place tests in `web-app/src/`.

---

## Deployment

1. **Build the frontend:**
   ```sh
   cd web-app
   npm run build
   ```
   Deploy the contents of `web-app/build/` to your static hosting (Netlify, Vercel, S3, etc).

2. **Deploy the backend:**
   - Use a process manager (PM2, Docker, etc) for production.
   - Ensure all environment variables are set.
   - Set `NODE_ENV=production`.

3. **Configure CORS and HTTPS** as needed for your deployment environment.

---

## API Overview

- All API endpoints are prefixed with `/api/`.
- Auth endpoints: `/api/auth/login`, `/api/auth/register`
- Reports: `/api/reports`
- Gamification: `/api/gamification/*`
- Community: `/api/community/*`
- Notifications: `/api/notifications`
- Admin: `/api/admin/*`
- Stats: `/api/stats`

See backend code for full API details.

---

## Security & Best Practices

- **Never commit `.env` files or secrets to version control.**
- Use strong secrets for JWT and session.
- Set up HTTPS in production.
- Regularly update dependencies and audit for vulnerabilities.
- Use environment-specific configuration for CORS and allowed origins.

---

## Troubleshooting

- **503 errors:** Backend is not running or crashed. Check logs in `backend/logs/`.
- **401 errors:** Token missing or invalid. Log in again and check localStorage.
- **Frontend build issues:** Ensure Node.js version matches requirements and dependencies are installed.

---

## License

MIT (or your chosen license) 