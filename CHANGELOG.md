# 📋 Changelog & Development Log

All notable changes and development milestones for the **Intelligent Timetable Generator** project.

---

## [1.0.0] — 2026-04-09 (Current Release)

### ✅ Completed Features

#### Core Architecture
- [x] Single-page application shell with sidebar navigation
- [x] Client-side routing between 5 pages (Dashboard, Inputs, Section View, Faculty View, Room View)
- [x] Modal system for CRUD forms
- [x] Toast notification system (success, error, info, warning)
- [x] Responsive layout (sidebar collapses on mobile)

#### Data Layer (`data.js`)
- [x] localStorage-based persistence with JSON serialization
- [x] Generic CRUD factory (`collectionApi`) for all entities
- [x] Custom event dispatch (`store-change`) for reactive UI updates
- [x] Unique ID generation (base-36 timestamp + random suffix)
- [x] Time slot computation with configurable period duration and lunch detection
- [x] Student count aggregation across section groups

#### Input Configuration (`ui-inputs.js`)
- [x] Full CRUD for Courses (name, code, theory/lab hours, period lengths)
- [x] Full CRUD for Sections (name, semester, student count)
- [x] Full CRUD for Faculty Mappings (name, course, individual vs combined, section selection)
- [x] Full CRUD for Rooms (name, capacity, lab flag)
- [x] Full CRUD for Combined Classes (group name, section merge)
- [x] Institutional Settings (working days, start/end time, period duration, lunch window)
- [x] Tab-based organization for input categories
- [x] XSS-safe HTML escaping via `esc()` utility

#### Constraint Engine (`constraints.js`)
- [x] Consecutive slot availability check
- [x] Lunch break slot detection and blocking
- [x] Locked slot enforcement
- [x] Faculty double-booking prevention
- [x] Section overlap detection
- [x] Room conflict detection
- [x] Room capacity validation (room.capacity ≥ student count)
- [x] Lab room type matching (labs must go to lab rooms)
- [x] Best-fit room selection (smallest adequate room first)
- [x] Fallback to lab rooms for theory if no classrooms available
- [x] Post-generation full timetable validation

#### Scheduling Engine (`generator.js`)
- [x] Greedy placement algorithm
- [x] Most-constrained-first heuristic sorting:
  - Combined classes → labs → individual theory
  - Multi-period blocks → single-period
  - Larger student groups → smaller groups
- [x] Per-section per-day load balancing (even distribution)
- [x] Automatic assignment building from faculty-course-section mappings
- [x] Theory session count = `theoryHours` per week
- [x] Lab block count = `ceil(labHours / labPeriods)` per week
- [x] Statistics reporting (total, placed, unplaced counts)

#### Timetable Views (`ui-views.js`)
- [x] Transposed grid layout (days = rows, time slots = columns)
- [x] Color-coded course blocks (10 distinct subject colors)
- [x] Section-wise timetable view with dropdown filter
- [x] Faculty-wise timetable view with dropdown filter
- [x] Room utilization view with percentage progress bars
- [x] Course-Faculty reference legend table
- [x] Per-room timetable grid

#### Export Module (`export.js`)
- [x] PDF export via jsPDF + AutoTable (landscape, styled headers)
- [x] Excel export via SheetJS (multi-sheet: Timetable + Legend)
- [x] Transposed table format (rows = days, columns = time slots)
- [x] Course-Faculty legend page appended to exports
- [x] Error handling with user-friendly toast messages

#### Dashboard (`ui-dashboard.js`)
- [x] Live statistics cards (courses, sections, faculty, rooms count)
- [x] Timetable status indicator (Ready / Issues / None)
- [x] One-click timetable generation with loading state
- [x] Generation result panel (total, placed, unplaced + progress bar)
- [x] Conflict & warnings log (error/warning icons + messages)
- [x] Clear timetable action
- [x] Slot locking system (day + period + add/remove)

#### Sample Data (`sample-data.js`)
- [x] Auto-loaded on first visit (when no courses exist)
- [x] CSE B.Tech 2nd Semester dataset:
  - 7 courses: LAO, DLD, DS, PP, PHY, ENG, FWD
  - 6 sections: A–F (50 students each)
  - 14 rooms: 9 classrooms + 5 labs
  - 19 faculty mappings

#### UI/UX & Styling (`styles.css`)
- [x] Microsoft Teams–inspired design system
- [x] CSS custom properties for theming (colors, spacing, typography, shadows)
- [x] 10 subject accent color pairs (foreground + background)
- [x] Card, badge, tab, button, form, table component styles
- [x] Timetable grid with day labels, lunch hatching, locked slot hatching
- [x] Modal overlay with scale-in animation
- [x] Toast slide-in animation
- [x] Page fade-in transition
- [x] Responsive breakpoint at 768px (sidebar collapse)

---

### 🐛 Known Issues

| ID    | Severity | Description                                              | Status    |
|-------|----------|----------------------------------------------------------|-----------|
| BUG-1 | Medium   | No backtracking — high-load scenarios may leave assignments unplaced even if a valid arrangement exists | Open |
| BUG-2 | Low      | Export buttons require CDN connectivity; no offline fallback | Open |
| BUG-3 | Low      | Large datasets (>20 sections) may cause slow generation without progress feedback | Open |
| BUG-4 | Info     | localStorage limit (~5MB) could be reached with very large timetable data | Open |

---

### 🔧 Technical Debt

| Item                    | Description                                                    | Priority |
|-------------------------|----------------------------------------------------------------|----------|
| Module system           | App uses global IIFE modules; could migrate to ES modules       | Low      |
| Test coverage           | No unit tests; constraint engine and generator need test suites | Medium   |
| Accessibility           | Missing ARIA labels, keyboard navigation in grid views          | Medium   |
| Error boundaries        | Some edge cases in data relationships not gracefully handled    | Low      |
| Code duplication        | `esc()` function duplicated in `ui-inputs.js` and `ui-views.js` | Low     |

---

## Development Timeline

| Date       | Milestone                                             |
|------------|-------------------------------------------------------|
| 2026-03-21 | Initial project planning and requirements gathering    |
| 2026-03-22 | Timetable grid layout transposition (days → rows)     |
| 2026-03-23 | Browser storage persistence implementation             |
| 2026-03-25 | Automated scheduler with constraint engine             |
| 2026-04-09 | Full UI overhaul — Teams-inspired design system        |
| 2026-04-09 | Sample data, export module, dashboard finalization      |
| 2026-04-09 | Documentation, README, changelog created               |

---

## Version History

| Version | Date       | Summary                                    |
|---------|------------|--------------------------------------------|
| 0.1.0   | 2026-03-21 | Initial prototype — basic grid + data model |
| 0.5.0   | 2026-03-25 | Constraint engine + greedy scheduler        |
| 1.0.0   | 2026-04-09 | Full release — UI, exports, documentation   |
