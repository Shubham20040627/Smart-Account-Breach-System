# Smart Account Breach Protection System

A full-stack security dashboard designed to detect brute-force attacks and unknown devices, featuring automated account locking and session management.

## 🚀 How to Run the Project

### Prerequisites
- **Node.js**: [Download here](https://nodejs.org/)
- **MongoDB**: Ensure MongoDB is installed and running on your machine.

---

### Step 1: Start the Backend
1. Open your terminal.
2. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
   *Your backend is now running on http://localhost:5000*

---

### Step 2: Start the Frontend
1. Open a **new** terminal window (leave the backend running).
2. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   *Your frontend is now running on http://localhost:5173*

---

## 🛠 Features
- **Brute-Force Protection**: Locks account after 5 failed attempts in 2 minutes.
- **Device Detection**: Detects logins from new devices/browsers and sends alerts.
- **Global Logout**: "Logout from all devices" invalidate all active sessions.
- **Security Dashboard**: Clean UI to monitor account status, history, and devices.

## 📁 Tech Stack
- **Frontend**: React + Vite + Vanilla CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Security**: JWT + Bcrypt
