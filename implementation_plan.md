# Implementation Plan: Smart Hospital Appointment & Queue System

## Goal Description
Build a full-stack, modern "Smart Hospital Appointment and Queue Management System". The application will facilitate patient appointment booking, real-time queue tracking, receptionist ticket management, doctor workflows, and admin analytics.
The system will be initiated in a newly created greenfield repository.

> [!CAUTION]
> ## User Review Required
> Because we are building this entirely from scratch, there are a couple of major architectural decisions that require your direct selection before we write the first line of code. Please refer to the "Open Questions" section carefully.

---

## 1. Project Scaffolding and Architecture Map

### Backend (Python Server)
- **Path:** `/backend`
- Initialize Python environment (`venv`).
- Establish project skeleton (routes, models/schemas, database context, utils).
- Setup PostgreSQL connection mapping with an ORM.

### Frontend (User Interface)
- **Path:** `/frontend`
- Scaffold Next.js or Vite React app.
- Configure pure Vanilla CSS workspace (`index.css`) establishing a customized modern design token system (avoiding Tailwind CSS to maximize custom aesthetic).
- Create structural layout wrappers (Navbars, Role-based dashboards).

---

## 2. Phased Execution Roadmap

### Phase 1: Foundation & Authentication
- Initialize Database schemas (Users, Doctors, Appointments, Tokens/Queue).
- Implement robust Role-Based Access Control (RBAC) accommodating Admins, Doctors, Receptionists, and Patients.
- Build Frontend Authentication workflows (Login/Signup routes, Session tracking).

### Phase 2: Booking Engine & Doctor Schedules
- **Admin Tools:** Interfaces to add Doctors, set availability timings, and manage departments.
- **Patient Tools:** Discoverability of doctors and interactive calendar interfaces to book and reschedule operational slots.

### Phase 3: The Live Queue System (Real-Time)
- Implement Token generation engine mapping appointments and walk-ins to sequenced queues.
- Attach WebSocket (Socket.io / Channels) controllers to continuously broadcast real-time queue position state.
- Create the "Live TV Board" interface for clinic waiting rooms.
- **Receptionist Dashboard:** Tools to override queue sequences and mark emergency cases.
- **Doctor Dashboard:** Display upcoming sequences with actions to "Call Next Patient".

### Phase 4: Polish & Analytics
- Configure Admin Analytics dashboards visualizing peaks, low activity, no-shows, and avg. wait times.
- Implement UI refinements focusing on micro-animations, fast transitions, and aesthetic polish.

---

> [!IMPORTANT]
> ## Open Questions
> Before we begin scaffolding the project, please select one from each of the following categories:
> 
> **1. Python Backend Choice:**
> - **[Option A: FastAPI]** Ideal for lightning-fast performance and seamless native WebSocket integration (highly recommended for live queues).
> - **[Option B: Django + DRF]** Best if you want to leverage Django's powerful out-of-the-box Admin interface to manage the clinic setups swiftly.
> 
> **2. React Frontend Choice:**
> - **[Option X: Next.js App Router]** Modern, SEO-compatible, incredibly structured framework.
> - **[Option Y: Vite (Pure React SPA)]** Simpler mental model, purely client-side rendering.
> 
> **3. Folder Structure Insight**
> Are you entirely comfortable proceeding to build inside the current active directory (`l:\Projects\Hospital`)?

---

## 5. Verification Plan

### Automated Verification
- We will routinely execute API validations ensuring JSON endpoints return expected HTTP Status Codes.
- Compile checks to ensure CSS & Typescript contain zero syntax disruptions.

### Manual Verification
- Testing user session roles across different browser instances (e.g., Patient logs in -> Books -> Receptionist manually overrides token -> Doctor marks patient Complete -> Patient sees status update).
