# Setup Guide: Smart Hospital Management System

This guide provides step-by-step instructions to set up the application for local development.

## 1. Prerequisites

Before you begin, ensure you have the following installed on your system:
- **Python 3.10+** (For the FastAPI backend)
- **Node.js 18+** (For the Next.js frontend)
- **PostgreSQL** (Running locally or via a cloud provider)
- **Git**

## 2. Database Setup

1. Open your PostgreSQL command line tool (e.g., `psql`) or a GUI tool like pgAdmin / DBeaver.
2. Create a new database for the application. 
   ```sql
   CREATE DATABASE hospital_db;
   ```
3. Make sure to note down your PostgreSQL username and password, as you'll need them for the backend environment variables.

## 3. Backend Setup

The backend is built with FastAPI and runs on Python.

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Set up a Virtual Environment:**
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables:**
   Create a file named `.env` in the `backend` directory with the following contents. Update the `DATABASE_URL` to match your PostgreSQL setup:
   ```env
   DATABASE_URL=postgresql://<USERNAME>:<PASSWORD>@localhost:5432/hospital_db
   SECRET_KEY=your_super_secret_jwt_key_here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   ```

5. **Run Database Migrations (if using Alembic) or Sync:**
   Depending on your database strategy, you'll need to sync the models to the database.
   ```bash
   # If using Alembic
   alembic upgrade head

   # If using a custom sync script (e.g., sync.py)
   python sync.py
   ```

6. **Seed the Database:**
   Populate the database with initial data (like an Admin user, default departments, etc.).
   ```bash
   python seed.py
   ```

7. **Start the Backend Server:**
   ```bash
   uvicorn main:app --reload
   ```
   *The API will be available at `http://localhost:8000`.*
   *Swagger API Documentation will be at `http://localhost:8000/api/docs`.*

## 4. Frontend Setup

The frontend is built with Next.js and React.

1. **Navigate to the frontend directory:**
   Open a new terminal window/tab and navigate to the frontend folder.
   ```bash
   cd frontend
   ```

2. **Configure Environment Variables (Optional but recommended):**
   Create a `.env.local` file in the `frontend` directory. If your backend is running on the default port, the proxy settings in Next.js/API client usually handle it, but it's good practice to define it:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Start the Frontend Development Server:**
   ```bash
   npm run dev
   ```
   *The application will be accessible at `http://localhost:3000`.*

## 5. Accessing the Application

- Open your browser and go to `http://localhost:3000`.
- **Default Accounts:** Review the backend's `seed.py` file to see the default email addresses and passwords generated for testing (e.g., Admin, Receptionist, Doctor, Patient).

## Troubleshooting
- **CORS Errors:** Ensure your frontend URL (`http://localhost:3000`) is included in the `allow_origins` array in `backend/main.py`.
- **Database Connection Failed:** Double-check the username, password, and port in your backend `.env` file `DATABASE_URL`. Ensure the PostgreSQL server service is running.