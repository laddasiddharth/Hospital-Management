# Smart Hospital Appointment and Queue Management System

Welcome to the **Smart Hospital System**. This platform utilizes a robust full-stack architecture featuring a **FastAPI** Python backend (with WebSockets for real-time tracking) and a **Next.js** React frontend (styled with clean, modern Tailwind v4 components).

This guide covers everything you need to know to get the system up and running on your local machine.

---

## 🏗️ Prerequisites
Ensure you have the following installed before proceeding:
1. **Python 3.10+** (For the backend server)
2. **Node.js v18+** (For the frontend Next.js server)
3. **PostgreSQL** (Active local or cloud database instance)
4. **Git**

---

## ⚙️ Backend Setup (FastAPI)

The backend server manages the API, PostgreSQL database models, Authentication logic (JWT), and Live WebSockets mapping.

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
   Create a `.env` file in the `backend/` folder directly. 
   *(Make sure your PostgreSQL daemon is running locally unblocked).*
   ```ini
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/hospital_db
   JWT_SECRET_KEY=your_super_secret_key_change_this_in_production
   JWT_ALGORITHM=HS256
   ```

5. **Initialize the Database (Migrations & Tables):**
   We have built native Python sync scripts to auto-generate mapping schemas for you.
   ```bash
   python sync.py
   ```
   *(Optional: If you want to load mock Admins into your database quickly, run `python seed.py`)*

6. **Start the Backend Server!**
   Start the powerful ASGI asynchronous server. It must run on port `8000`.
   ```bash
   python -m uvicorn main:app --reload
   ```
   *Your backend is now live at `http://localhost:8000/api/docs` (Interactive Swagger API)*

---

## 💻 Frontend Setup (Next.js)

The frontend houses the role-based dashboards, the Appointment Calendar wizard, and the Live Public WebSockets Queue Board.

1. **Navigate to the Frontend Directory:**
   Open a **new terminal window** (keep the backend server running in the old one).
   ```bash
   cd frontend
   ```

2. **Install Node Modules:**
   ```bash
   npm install
   ```

3. **Configure the Environment:**
   There is no extensive `.env` needed here, as the `src/lib/api.ts` file automatically targets standard `http://localhost:8000`.

4. **Boot the React Server:**
   ```bash
   npm run dev
   ```
   *Your frontend is now live at `http://localhost:3000`*

---

## 🚀 How to Utilize the Application (Demo Run)

Now that both servers are operating parallel to each other, follow this trail to see the magic happen:

### 1. The Super Admin Console
- Browse to `http://localhost:3000/login`.
- If you ran `seed.py` earlier during setup, log in with Email: `admin@hospital.com` | Password: `Admin@123`.
- Go to **Departments** and create a department (e.g., Cardiology).
- Go to **Doctors** and link a user into that department.

### 2. The Patient Workflow
- Sign out, and register a brand new patient account on the signup page.
- Navigate to **Book Appointment**. Use the stunning 3-step Calendar wizard to grab a slot with the newly created Doctor.

### 3. The Live TV Experience (WebSockets)
- Open a **brand new split-screen window** and navigate to `http://localhost:3000/board`.
- *Wait here. This is the TV running inside the physical hospital. Do not touch this window.*

### 4. Administer the Hospital Queue
- On your primary screen, log back in as an Admin (or a Receptionist).
- Navigate to **Hospital Queue**.
- Hit `"Start Consult"`. 
- Without refreshing or pressing a single button on your TV Board side-screen, watch the TV instantly flash the new patient Token loudly in real-time.

### 5. Finalize the Medical Record (EHR)
- Type symptoms inside the Consultation Room and hit "Save & Complete".
- The patient completely disappears from the TV Board securely.
- If the patient logs in, they will find the immutable Prescription waiting on their dashboard.

Enjoy the application! 🏥
