# **🚀 AssetFlow: Enterprise Asset & Resource Management System**

**Hackathon Master Context & Execution Blueprint**

## **1\. Project Context (The "What" & "Why")**

**The Problem:** Organizations track physical assets (laptops, vehicles, desks) and shared resources (meeting rooms, projectors) using messy spreadsheets. This leads to double-bookings, lost equipment, ignored maintenance, and zero visibility into asset lifecycles.

**The Solution (AssetFlow):** A centralized, digitized ERP platform built on strict relational logic. It handles structured asset lifecycles, real-time resource booking without overlaps, maintenance approval workflows, and audit cycles.

**The Goal:** Build a highly scalable, premium, bug-free web application within the hackathon time limit that outshines competitors through strict validation logic and a "Vercel/Linear-tier" UI/UX.

## **2\. Technical Stack & Architecture**

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router, Axios, Lucide React (Icons), Zustand (Global State \- optional/if needed).  
* **Backend:** Node.js, Express, TypeScript, Zod (Validations), JWT (Auth), Bcrypt (Hashing).  
* **Database:** PostgreSQL (Cloud-hosted via Neon.tech or Supabase).  
* **ORM:** Prisma (Strict type-safety and relational integrity).  
* **Architecture Pattern:** RCSR (Route \-\> Controller \-\> Service \-\> Repository) for the backend. Component-Driven UI for the frontend.

## **3\. Premium UI/UX Design System (The "Look & Feel")**

To win, the app must look like a multi-million dollar SaaS product. We are utilizing a **Premium Minimalist** aesthetic inspired by Vercel, Stripe, and Linear.

### **Typography**

* **Primary Font:** Inter or Geist (Sans-serif). Crisp, geometric, and highly legible.  
* **Monospace (for IDs/Tags):** JetBrains Mono or Fira Code.

### **Color Palette (Tailwind Configuration)**

* **Dark Mode (Default/Premium Feel):**  
  * *Background:* zinc-950 (\#09090b) \- Deep obsidian, not pure black.  
  * *Surface/Cards:* zinc-900 (\#18181b) with a 50% opacity blur (backdrop-blur-md).  
  * *Borders:* zinc-800 (Micro-borders for subtle separation).  
  * *Primary Brand:* indigo-500 (Main action buttons, active states).  
  * *Text:* zinc-100 (Primary), zinc-400 (Secondary/Muted).  
* **Light Mode (Clean/Corporate):**  
  * *Background:* zinc-50 (\#fafafa) \- Stark, medical white.  
  * *Surface/Cards:* white (\#ffffff).  
  * *Borders:* zinc-200.  
  * *Text:* zinc-900 (Primary), zinc-500 (Secondary).  
* **Semantic Accents (Status Indicators):**  
  * *Available/Success:* emerald-500 text with emerald-500/10 background (Soft glow pill).  
  * *Allocated/Info:* blue-500 text with blue-500/10 background.  
  * *Maintenance/Warning:* amber-500 text with amber-500/10 background.  
  * *Lost/Disposed/Danger:* red-500 text with red-500/10 background.

### **Premium UI/UX Principles to Implement**

1. **No Harsh Shadows or Borders:** Use shadow-sm and thin 1px borders. Let whitespace (padding/margins) separate content, not heavy lines.  
2. **Slide-Overs \> Modals:** When clicking an asset to view details or allocate it, slide a panel in from the right side of the screen. Do not use center-screen popup modals, which break user context.  
3. **Micro-Interactions:** Buttons must have active:scale-\[0.98\] and transition-all duration-200 to feel responsive and physical.  
4. **Empty States:** Never show a blank table. Always use a beautifully designed "No assets found" illustration or muted text with a clear "Create New" Call-to-Action.  
5. **Skeleton Loaders:** Instead of spinning circles, use pulsing gray rectangles that mimic the shape of the data loading in.

### **Reusable Frontend Components to Build First**

1. Button: Variants (Primary, Secondary, Ghost, Danger), Sizes (sm, md, lg).  
2. Input / Select: With built-in error message rendering below the field.  
3. StatusBadge: Dynamic color based on asset/booking status.  
4. SlideOver: The right-side drawer component.  
5. DataTable: A generic table component with pagination, sorting, and search headers.

## **4\. Backend Modular Architecture**

We use a domain-driven folder structure to prevent spaghetti code.

### **Folder Structure**

backend/  
├── src/  
│   ├── config/          \# DB connection, ENV checks  
│   ├── middlewares/     \# auth.middleware, validate.middleware, error.handler  
│   ├── utils/           \# Custom error classes, helpers  
│   ├── modules/         \# \--- DOMAIN MODULES \---  
│   │   ├── auth/        \# Login, Signup  
│   │   ├── users/       \# Employee directory, roles, departments  
│   │   ├── assets/      \# Asset registry, lifecycle  
│   │   ├── allocations/ \# Assigning assets, transfer requests  
│   │   ├── bookings/    \# Time-slot based resource booking  
│   │   ├── maintenance/ \# Repair workflows  
│   │   └── audits/      \# Audit cycles and discrepancy reporting  
│   ├── app.ts           \# Express setup  
│   └── server.ts        \# Server listener

### **The RCSR Flow (How data moves)**

1. **Route:** POST /api/v1/assets \-\> Calls the Auth Middleware, then the Zod Validation Middleware, then passes to the Controller.  
2. **Controller:** Extracts req.body, calls the Service, and formats the res.status(201).json(...).  
3. **Service:** Contains the **Business Logic** (e.g., "Is this user allowed to do this? Is the asset currently available?").  
4. **Repository (Prisma):** Actually touches the database. (In Prisma, the Service often just calls Prisma directly, acting as a combined Service/Repo layer for speed).

## **5\. Core Business Logics & Validations (The "Secret Sauce")**

This is how we win. The application must not allow illogical states.

1. **Role-Based Access Control (RBAC):**  
   * ADMIN: Can manage departments, edit roles, create audits.  
   * ASSET\_MANAGER: Can register assets, approve transfers, approve maintenance.  
   * DEPARTMENT\_HEAD: Can approve transfers within their dept, book shared resources.  
   * EMPLOYEE: Can only view their own assets, request transfers, book resources, raise maintenance.  
2. **Asset Allocation Validation:**  
   * *Rule:* You cannot allocate an asset if status \!== 'AVAILABLE'.  
   * *Logic:* If User A tries to allocate a laptop currently held by User B, the backend rejects it with 422 Unprocessable Entity. The frontend catches this and changes the UI button to "Request Transfer from User B".  
3. **The Double-Booking Prevention (CRITICAL):**  
   * *Rule:* Shared resources (rooms, projectors) cannot be booked by two people at the same time.  
   * *Backend Logic:* We will use a PostgreSQL **GIST Exclusion Constraint** on the Booking table. This prevents overlapping tsrange(startTime, endTime) at the database engine level, making race conditions mathematically impossible.  
4. **Maintenance State Machine:**  
   * *Rule:* An asset goes AVAILABLE \-\> Maintenance Requested \-\> UNDER\_MAINTENANCE (Only after Asset Manager approval).  
   * *Logic:* An employee cannot force an asset into maintenance. It requires approval. Once approved, the asset is hidden from allocation lists.

## **6\. The Master Execution Roadmap (Phase-by-Phase)**

### **Phase 1: Foundation & Setup (Hours 0-1)**

* **Why:** To establish a working monorepo-lite environment before writing business logic.  
* **Steps:**  
  1. Initialize Backend (Express \+ TypeScript \+ Prisma). Connect to Cloud Postgres (Neon).  
  2. Initialize Frontend (Vite \+ React \+ Tailwind v4).  
  3. Define the exact schema.prisma (Users, Departments, Assets, Allocations, Bookings, Maintenance, Audits).  
  4. Run prisma migrate dev and generate the Prisma Client.  
  5. Set up global error handling and JWT middleware on the backend.

### **Phase 2: Auth & Core UI (Hours 1-2.5)**

* **Why:** Users need to log in, and we need our premium components ready to consume data.  
* **Backend:** Implement /auth/signup and /auth/login. Hardcode signup to default to EMPLOYEE role to prevent privilege escalation.  
* **Frontend:** Build the Login screen. Build the main layout (Sidebar navigation, Header). Build the core reusable components (Button, Input, StatusBadge, SlideOver).

### **Phase 3: Master Data & Asset Registry (Hours 2.5-4)**

* **Why:** The ERP needs data (Departments, Users, Assets) before workflows can exist.  
* **Backend:**  
  * Admin routes for creating Departments and changing Employee roles.  
  * CRUD routes for Assets.  
* **Frontend:**  
  * Build the "Organization Setup" dashboard (Admin only).  
  * Build the "Asset Directory" view. Implement a data table with search and filtering by Category and Status.  
  * Build the "Register Asset" Slide-over form.

### **Phase 4: Complex Workflows (Allocations & Bookings) (Hours 4-6)**

* **Why:** This is the core problem statement. Moving assets around and preventing conflicts.  
* **Backend:**  
  * Create Allocation endpoints. Implement the logic checking if an asset is already taken.  
  * Create Transfer Request endpoints (State transitions: PENDING \-\> APPROVED).  
  * Create Booking endpoints. Ensure time overlap validation is strictly enforced.  
* **Frontend:**  
  * Asset Allocation drawer. If asset is taken, show the "Request Transfer" UI flow.  
  * Resource Booking calendar/list view. Show visual indicators for available vs. booked timeslots.

### **Phase 5: Maintenance & Audits (Hours 6-7.5)**

* **Why:** Fulfilling the remaining requirements of the problem statement.  
* **Backend:**  
  * Maintenance endpoints (Raise request, Approve request). Status cascades to the Asset model.  
  * Audit Cycle endpoints. Generate cycles, allow assigned auditors to mark items (VERIFIED, MISSING), close cycle.  
* **Frontend:**  
  * Maintenance approval queue for Asset Managers.  
  * Audit execution screen (a simple list where an auditor taps "Verify" or "Flag" next to assets).

### **Phase 6: Dashboards, Polish, & Demo Prep (Hours 7.5-End)**

* **Why:** Judges look at the dashboard first. It must be beautiful and populated with realistic data.  
* **Backend:** Create a /dashboard/kpis endpoint that aggregates data (Count of available assets, pending maintenance, upcoming returns).  
* **Frontend:**  
  * Build the KPI Cards on the Home Screen.  
  * Seed the database with realistic, funny, or relatable dummy data (e.g., "Missing: CEO's Espresso Machine").  
  * Final UX check: Ensure all hovers, loaders, and error toasts (using something like react-hot-toast) are functioning.  
  * Practice the 3-minute demo pitch focusing on *conflict prevention* and *UI cleanlines*.