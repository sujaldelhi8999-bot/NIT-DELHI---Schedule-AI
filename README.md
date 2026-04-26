# 📅 Intelligent Timetable Generator

### Multi-Section Academic Scheduling System

An automated, constraint-aware timetable generation system that produces optimized, **conflict-free academic schedules** for multiple sections, faculty, and rooms — replacing manual or spreadsheet-based scheduling.

---

## 🌟 Project Overview

Educational institutions face significant challenges in generating conflict-free academic timetables. This system automates the entire process by intelligently handling:

- Multiple sections per semester (e.g., Section A through F)
- Separate theory and practical (lab) hours per course
- Combined classes across sections
- Faculty mapping for individual and combined sessions
- Classroom capacity constraints and lab-room separation
- Configurable working days, period durations, and mandatory lunch breaks
- Slot locking to prevent assignment in reserved periods

---

## 🏗️ Architecture

```
sch try final/
├── index.html              # Single-page app shell (sidebar + page containers)
├── css/
│   └── styles.css          # Microsoft Teams–inspired design system (556 lines)
├── js/
│   ├── data.js             # Data layer — localStorage CRUD + settings + time-slot computation
│   ├── constraints.js      # Constraint engine — placement validation, room finding, timetable validation
│   ├── generator.js        # Scheduling engine — greedy + most-constrained-first heuristic
│   ├── export.js           # PDF & Excel export (jsPDF + SheetJS)
│   ├── sample-data.js      # Pre-loaded sample data (CSE B.Tech 2nd Semester)
│   ├── ui-dashboard.js     # Dashboard page — stats, generation controls, slot locking
│   ├── ui-inputs.js        # Input configuration — CRUD for courses, sections, faculty, rooms, combined classes, settings
│   ├── ui-views.js         # Timetable views — section-wise, faculty-wise, room utilization grids + legend
│   └── app.js              # App shell — routing, modal system, toast notifications
└── assets/
    └── favicon.svg         # App icon
```

### Module Dependency Graph

```
app.js (entry point)
  ├── sample-data.js  →  data.js (Store)
  ├── ui-dashboard.js →  data.js, generator.js, constraints.js
  ├── ui-inputs.js    →  data.js
  ├── ui-views.js     →  data.js, export.js
  ├── generator.js    →  data.js, constraints.js
  ├── constraints.js  →  data.js
  └── export.js       →  data.js
```

---

## 🚀 Getting Started

### Prerequisites

- Any modern web browser (Chrome, Firefox, Edge, Safari)
- No build tools, no Node.js, no server required — it's a pure client-side SPA

### Running the Application

1. **Clone or download** this project folder.
2. **Open `index.html`** directly in your browser (double-click, or use `File > Open`).
3. The app loads with **pre-populated sample data** (7 courses, 6 sections, 14 rooms, 19 faculty mappings).
4. Click **"Generate Timetable"** on the Dashboard to see results immediately.

> **Tip:** For local development, you can use any simple HTTP server:
> ```bash
> # Python
> python -m http.server 8080
>
> # Node.js
> npx serve .
> ```

---

## 📖 Features

### 1. Input Configuration Module

| Entity           | Fields                                                     |
|------------------|------------------------------------------------------------|
| **Courses**      | Name, Code, Theory sessions/week, Lab sessions/week, Theory period length, Lab period length |
| **Sections**     | Name, Semester, Student count                              |
| **Faculty**      | Name, Course, Type (Individual/Combined), Section mapping   |
| **Rooms**        | Name, Capacity, Type (Classroom/Lab)                       |
| **Combined**     | Group name, Selected sections to merge                     |
| **Settings**     | Working days, Start/End time, Period duration, Lunch window  |

### 2. Constraint Engine (`constraints.js`)

All hard constraints are enforced during placement:

| # | Constraint                        | Description                                               |
|---|-----------------------------------|-----------------------------------------------------------|
| 1 | **Consecutive slot availability** | Multi-period blocks (labs) must have enough remaining slots |
| 2 | **Lunch break respect**           | No class can be placed during the lunch window            |
| 3 | **Locked slot avoidance**         | Admin-locked slots are never assigned                     |
| 4 | **No faculty double-booking**     | A faculty member cannot teach two classes at the same time |
| 5 | **No section overlap**            | A section cannot attend two classes simultaneously         |
| 6 | **Room availability**             | No two classes can share the same room at the same time    |
| 7 | **Room capacity ≥ students**      | Room must accommodate the section's student count          |
| 8 | **Lab/Room type matching**        | Lab sessions must be assigned to lab-type rooms            |

### 3. Scheduling Engine (`generator.js`)

- **Algorithm:** Greedy placement with most-constrained-first heuristic
- **Priority ordering:**
  1. Combined classes first (hardest to place)
  2. Multi-period blocks (labs) before single-period
  3. Larger student groups first
  4. More sections first
- **Load balancing:** Distributes classes evenly across days per section
- **Post-generation validation:** Runs full timetable validation to catch any residual conflicts

### 4. Output Views

| View                  | Description                                                |
|-----------------------|------------------------------------------------------------|
| **Section Timetable** | Filter by section; grid shows days × time slots            |
| **Faculty Timetable** | Filter by faculty member; shows their weekly schedule       |
| **Room Utilization**  | Usage statistics (percentage bars) + per-room grid view     |

### 5. Export

- **PDF** — Landscape layout via jsPDF + AutoTable plugin, includes course-faculty legend
- **Excel** — Multi-sheet workbook via SheetJS (timetable + legend sheet)

### 6. Admin Dashboard

- Real-time statistics (courses, sections, faculty, rooms count)
- One-click timetable generation with progress reporting
- Conflict/warning log with detailed messages
- Slot locking system (lock any day + period combination)

---

## 🗄️ Data Persistence

All data is stored in **`localStorage`** under these keys:

| Key              | Contents                      |
|------------------|-------------------------------|
| `tt_courses`     | Array of course objects        |
| `tt_sections`    | Array of section objects       |
| `tt_faculty`     | Array of faculty mappings      |
| `tt_rooms`       | Array of room objects          |
| `tt_combined`    | Array of combined class groups |
| `tt_settings`    | Institutional settings object  |
| `tt_timetable`   | Generated timetable (day → entries) |
| `tt_locks`       | Array of locked slot objects   |
| `tt_conflicts`   | Array of conflict/warning messages |

> **Note:** Clearing browser storage will reset all data. On next load, sample data is re-populated if no courses exist.

---

## 🎨 Design System

The UI follows a **Microsoft Teams–inspired** design language:

- **Color palette:** Teams Purple (`#6264A7`), surface grays, 10 subject accent colors
- **Typography:** Segoe UI / system font stack
- **Components:** Cards, badges, tabs, modals, toast notifications, progress bars
- **Layout:** Fixed sidebar (240px) + scrollable main content
- **Responsive:** Sidebar collapses to 56px icon-only on mobile (< 768px)

---

## 📦 External Dependencies (CDN)

| Library                  | Version | Purpose            |
|--------------------------|---------|--------------------|
| **jsPDF**                | 2.5.1   | PDF generation      |
| **jsPDF-AutoTable**      | 3.8.2   | Table layout in PDF  |
| **SheetJS (xlsx)**       | 0.18.5  | Excel file export    |

All loaded from **cdnjs.cloudflare.com** — an internet connection is required for export features.

---

## 🧪 Sample Data

Pre-loaded dataset based on a **CSE B.Tech 2nd Semester** schedule:

- **7 Courses:** LAO, DLD, DS, PP, PHY, ENG, FWD
- **6 Sections:** Section A through F (50 students each)
- **14 Rooms:** 9 classrooms + 5 labs (all 60-capacity)
- **19 Faculty Mappings:** Each faculty covers 2–3 sections
- **Schedule:** Monday–Friday, 09:30–18:30, 60-min periods, lunch 13:30–14:30

---

## ⚠️ Known Limitations

1. **No backtracking:** The greedy algorithm places assignments one-by-one; unplaced items are reported as conflicts rather than triggering reassignment of previous placements.
2. **Client-side only:** All data is in `localStorage` — no multi-device sync, no backup/restore.
3. **No user authentication:** Single-user system; no role-based access control in this version.
4. **Export requires internet:** CDN-loaded libraries (jsPDF, SheetJS) need connectivity.

---

## 🛣️ Future Roadmap

- [ ] Backtracking / CSP solver for higher placement rates
- [ ] Import data from Excel/CSV
- [ ] Multi-semester support
- [ ] Backend API with MySQL/PostgreSQL for persistent storage
- [ ] Role-based access (Admin, Faculty, Student)
- [ ] Faculty availability / preference slots
- [ ] Dark mode toggle

---

## 📄 License

This project is developed for academic purposes as part of an educational institution's scheduling solution.

---

## 👥 Contributors

Developed as a final project for an academic course on intelligent scheduling systems.
