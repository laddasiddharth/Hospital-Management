# Smart Hospital Appointment & Queue Management System V3.0

Welcome to the **Smart Hospital System**. This platform utilizes a robust full-stack architecture featuring a **FastAPI** Python backend (with WebSockets for real-time tracking) and a **Next.js** React frontend (styled with a premium **Clinical Light Theme** and **Manrope** typography).

V3.0 introduces expanded **EHR (Electronic Health Records)** capabilities including 8 distinct vital signs, BMI auto-calculation, and an immutable data architecture.

---

## 🏗️ Prerequisites
Ensure you have the following installed before proceeding:
1. **Python 3.10+** (Backend server)
2. **Node.js v18+** (Frontend Next.js server)
3. **PostgreSQL 15+** (Active local or cloud database instance)
4. **Git**

---

## ⚙️ Backend Setup (FastAPI)

The backend managed the API, PostgreSQL database models, JWT Authentication, and Live WebSockets mapping.

1. **Navigate to the Backend Directory:**
   ```bash
   cd backend
   ```

2. **Create and Activate a Virtual Environment:**
   *Windows:*
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```
   *Mac/Linux:*
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables:**
   Create a `.env` file in the `backend/` folder:
   ```ini
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/hospital_db
   JWT_SECRET_KEY=your_super_secret_key_change_this_in_production
   JWT_ALGORITHM=HS256
   ```

5. **Initialize the Database (Migrations & Tables):**
   ```bash
   python sync.py
   ```
   *(Optional: Use `python seed.py` to pre-load a demo Admin account)*

6. **Start the Backend Server:**
   ```bash
   uvicorn main:app --reload
   ```
   *Live Swagger Documentation: `http://localhost:8000/api/docs`*

---

## 💻 Frontend Setup (Next.js)

The frontend features role-based clinical dashboards, the Appointment Calendar wizard, and the Real-time Public Queue Board.

1. **Navigate to the Frontend Directory:**
   ```bash
   cd frontend
   ```

2. **Install Node Modules:**
   ```bash
   npm install
   ```

3. **Boot the React Server:**
   ```bash
   npm run dev
   ```
   *Your portal is now live at `http://localhost:3000`*

---

## 🚀 System Usage Flow (V3.0)

### 1. The Clinical Entry Point
- Browse to `http://localhost:3000` to see the new professional marketing page.
- Navigate to **Enrollment** (`/signup`) to initialize your doctor, patient, or receptionist profile.

### 2. Comprehensive EHR & Vitals
- **Consultation Room**: Doctors use the redesigned clinical interface to capture 8 vital signs:
  - *Blood Pressure, Heart Rate, Respiratory Rate, SpO2 (%), Temperature, Height, Weight, and Auto-calculated BMI.*
- **Immutable Records**: Once a consultation is saved, it becomes an immutable part of the patient's medical history timeline.

### 3. Real-time Infrastructure (WebSockets)
- Open a browser on `http://localhost:3000/board` (Public TV Board).
- As staff progress the queue in the **Live Queue Management** dashboard, the TV board will flash high-visibility "Please Proceed" alerts with audio in real-time.

---

### 🏥 Happy Healing!
*Built for modern institutional medical administration.*
