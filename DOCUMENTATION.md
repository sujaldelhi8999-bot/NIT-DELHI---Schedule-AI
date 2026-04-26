# 📚 Technical Documentation

## Intelligent Timetable Generator — Developer & Evaluator Guide

This document provides an in-depth technical reference for understanding, verifying, and extending the Intelligent Timetable Generator system.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Module Reference](#2-module-reference)
3. [Data Models](#3-data-models)
4. [Constraint Engine — Detailed Rules](#4-constraint-engine--detailed-rules)
5. [Scheduling Algorithm](#5-scheduling-algorithm)
6. [User Interface Guide](#6-user-interface-guide)
7. [Export System](#7-export-system)
8. [Issue Verification Guide](#8-issue-verification-guide)
9. [Testing Procedures](#9-testing-procedures)
10. [Troubleshooting FAQ](#10-troubleshooting-faq)

---

## 1. System Overview

### 1.1 Problem Statement

Educational institutions need to generate conflict-free academic timetables satisfying multiple simultaneous constraints:
- Faculty availability and non-overlapping schedules
- Classroom capacity matching student strength
- Combined section handling (merged classes)
- Separate theory and practical sessions with different period requirements
- Mandatory lunch breaks and configurable schedules
- Consecutive period requirements for lab sessions

### 1.2 Solution Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser (SPA)                  │
│                                                  │
│  ┌────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │  UI Layer   │  │  Logic Layer  │  │  Data    │ │
│  │ app.js      │→│ generator.js  │→│ data.js   │ │
│  │ ui-*.js     │  │ constraints.js│  │ (Store)  │ │
│  │ export.js   │  └──────────────┘  └──────────┘ │
│  └────────────┘                      ↕           │
│                              ┌──────────────┐    │
│                              │ localStorage  │    │
│                              └──────────────┘    │
└─────────────────────────────────────────────────┘
```

### 1.3 Technology Stack

| Technology    | Role                              |
|---------------|-----------------------------------|
| HTML5         | Application structure              |
| Vanilla CSS   | Styling (no frameworks)            |
| Vanilla JS    | Application logic (no frameworks)  |
| localStorage  | Client-side data persistence       |
| jsPDF 2.5.1   | PDF generation                     |
| SheetJS 0.18.5| Excel file generation              |

---

## 2. Module Reference

### 2.1 `data.js` — Store Module

**Purpose:** Centralized data access layer with localStorage persistence.

**Exposed API (global `Store` object):**

```javascript
// Collection APIs (courses, sections, faculty, rooms, combined, locks)
Store.courses.getAll()        // → Array<Course>
Store.courses.get(id)         // → Course | undefined
Store.courses.add(item)       // → Course (with generated ID)
Store.courses.update(id, data)// → void (merges fields)
Store.courses.remove(id)      // → void
Store.courses.clear()         // → void
Store.courses.count()         // → Number

// Settings
Store.getSettings()           // → SettingsObject
Store.saveSettings(obj)       // → void

// Timetable
Store.getTimetable()          // → Object | null
Store.saveTimetable(tt)       // → void
Store.clearTimetable()        // → void

// Conflicts
Store.getConflicts()          // → Array<ConflictObject>
Store.saveConflicts(arr)      // → void

// Utilities
Store.uid()                   // → String (unique ID)
Store.computeTimeSlots()      // → Array<SlotObject>
Store.totalStudents(sectionIds)// → Number
```

**Reactive Events:**
Every `_set()` call dispatches a `store-change` CustomEvent on `window`, enabling reactive UI updates.

---

### 2.2 `constraints.js` — Constraint Engine

**Purpose:** Validates whether a class assignment can be placed at a specific day/slot.

**Exposed API (global `Constraints` object):**

```javascript
Constraints.canPlace(assignment, day, slotIdx, timetable, slots, rooms)
// → { ok: true, roomId: string } | { ok: false, reason: string }

Constraints.findRoom(assignment, day, slotIdx, neededSlots, timetable, slots, rooms)
// → { ok: true, roomId: string } | { ok: false, reason: string }

Constraints.getEntriesAt(timetable, day, slotIdx)
// → Array<TimetableEntry>

Constraints.isSlotLocked(day, slotIdx)
// → Boolean

Constraints.validateTimetable(timetable)
// → Array<ConflictObject>
```

#### Constraint Checking Order (in `canPlace`):

1. **Slot range check** — Enough consecutive slots remaining?
2. **Lunch overlap** — Any of the required slots fall in lunch window?
3. **Per-slot checks** (for each consecutive slot):
   - Is the slot locked?
   - Is the faculty already booked?
   - Is any section already attending a class?
4. **Room feasibility** — calls `findRoom()`:
   - If pre-assigned room: check availability + capacity
   - If auto-assign: find best-fit room by capacity, matching type (lab/classroom)

---

### 2.3 `generator.js` — Scheduling Engine

**Purpose:** Builds teaching assignments from input data and schedules them.

**Exposed API (global `Generator` object):**

```javascript
Generator.generate()
// → { timetable: Object, conflicts: Array, stats: { total, placed, unplaced } }

Generator.buildAssignments()
// → Array<Assignment>
```

#### Assignment Building Logic:

For each faculty mapping:
1. Look up the associated course
2. Read `theoryPeriods` and `labPeriods` from the course
3. If **combined**: create assignments using the combined class's section IDs
4. If **individual**: create separate assignments per section

**Theory assignments:** `course.theoryHours` sessions per week, each spanning `theoryPeriods` consecutive periods.

**Lab assignments:** `ceil(course.labHours / labPeriods)` blocks per week, each spanning `labPeriods` consecutive periods.

#### Scheduling Strategy:

```
1. Build all assignments
2. Sort by most-constrained-first:
   - Combined classes → Individual
   - Multi-period → Single-period  
   - Labs → Theory
   - Larger sections → Smaller sections
   - More students → Fewer students
3. For each assignment:
   a. Sort days by least load for this section set
   b. Try each day, each slot
   c. Call Constraints.canPlace()
   d. If ok → place and update load tracker
   e. If failed all → add to unplaced list
4. Validate entire timetable
5. Save timetable + conflicts to Store
```

---

### 2.4 `export.js` — Export Module

**Purpose:** Generates downloadable PDF and Excel files.

**Layout:** Transposed table — rows = days, columns = time slots.

**Cell content format:**
```
CourseCode
FacultyName
RoomName
SectionNames
```

**PDF Features:**
- Landscape A4 orientation
- Styled header with generation timestamp
- AutoTable with alternating row colors
- Legend page with course-faculty reference
- Teams Purple header styling

**Excel Features:**
- Sheet 1: Timetable grid
- Sheet 2: Course-Faculty reference
- Auto-sized columns

---

### 2.5 `app.js` — Application Shell

**Purpose:** Navigation routing, modal system, toast notifications.

**Page routing:** Maps `data-page` attributes on sidebar nav items to page container divs.

**Modal API:**
```javascript
App.modal(title, bodyHtml, onSave)
// Shows modal; onSave() is called when Save is clicked
// Return false from onSave to prevent modal close

App.closeModal()
// Closes the active modal
```

**Toast API:**
```javascript
App.toast(message, type)
// type: 'success' | 'error' | 'info' | 'warning'
// Auto-dismisses after 3 seconds with slide-out animation
```

---

### 2.6 `ui-dashboard.js` — Dashboard Controller

**Features:**
- Statistics grid (course/section/faculty/room counts)
- Generate button with loading state
- Result panel (total/placed/unplaced + progress bar)
- Conflict log display
- Slot locking UI (day selector + period selector + lock/unlock)

---

### 2.7 `ui-inputs.js` — Input Configuration Controller

**Tab-based organization:**
1. **Courses** — Table + Add/Edit/Delete via modal
2. **Sections** — Table + Add/Edit/Delete via modal
3. **Faculty** — Table + Add/Edit/Delete via modal (with combined class toggle)
4. **Rooms** — Table + Add/Edit/Delete via modal (with lab checkbox)
5. **Combined Classes** — Table + Add/Edit/Delete via modal (multi-section checkbox)
6. **Settings** — Form for schedule parameters

---

### 2.8 `ui-views.js` — Timetable View Controller

**Three view modes:**
1. **Section View** — Filter by section; shows that section's weekly schedule
2. **Faculty View** — Filter by faculty member; shows their weekly schedule
3. **Room View** — Shows room utilization stats + per-room schedule grid

**Grid rendering:** Uses CSS Grid with `grid-template-columns: 110px repeat(N, 1fr)` where N = number of time slots.

---

## 3. Data Models

### 3.1 Course Object

```javascript
{
  id: "c_ds",                // Auto-generated or preset
  name: "Data Structures",   // Display name
  code: "DS",                // Short code (used in grid cells)
  theoryHours: 3,            // Theory sessions per week
  labHours: 2,               // Lab sessions per week
  theoryPeriods: 1,          // Consecutive periods per theory session
  labPeriods: 2              // Consecutive periods per lab session
}
```

### 3.2 Section Object

```javascript
{
  id: "s_a",
  name: "Section A",
  semester: "Sem 2",
  studentCount: 50
}
```

### 3.3 Faculty Mapping Object

```javascript
{
  id: "f_ds1",
  name: "Dr. Shashank S. Singh",
  courseId: "c_ds",            // FK → Course
  isCombined: false,           // true = uses combinedId
  sectionIds: ["s_a", "s_b"], // Individual section assignments
  combinedId: ""               // FK → Combined (if isCombined=true)
}
```

### 3.4 Room Object

```javascript
{
  id: "r_001",
  name: "CSE001",
  capacity: 60,
  isLab: false    // true = lab room
}
```

### 3.5 Combined Class Object

```javascript
{
  id: "combo_1",
  name: "CS-A+B Combined",
  sectionIds: ["s_a", "s_b"]   // Merged section IDs
}
```

### 3.6 Settings Object

```javascript
{
  daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  startTime: "09:30",
  endTime: "18:30",
  periodDuration: 60,    // minutes
  lunchStart: "13:30",
  lunchEnd: "14:30"
}
```

### 3.7 Timetable Entry (Generated)

```javascript
{
  id: "lxyz12abc",
  courseId: "c_ds",
  courseName: "Data Structures",
  type: "theory",              // "theory" | "lab"
  facultyId: "f_ds1",
  facultyName: "Dr. Shashank S. Singh",
  sectionIds: ["s_a"],
  requiredSlots: 1,            // Number of consecutive periods
  isCombined: false,
  day: "Monday",
  slotIdx: 0,                  // 0-based period index
  roomId: "r_001",
  roomName: "CSE001"
}
```

### 3.8 Time Slot Object (Computed)

```javascript
{
  idx: 0,           // 0-based index
  start: "09:30",   // Period start time
  end: "10:30",     // Period end time
  isLunch: false     // true if falls within lunch window
}
```

### 3.9 Conflict Object

```javascript
{
  type: "error",    // "error" | "warn"
  message: "Faculty Dr. XYZ double-booked on Monday at 09:30."
}
```

---

## 4. Constraint Engine — Detailed Rules

### Hard Constraints (Must Satisfy)

| # | Rule                              | Implementation                                | Location                        |
|---|-----------------------------------|-----------------------------------------------|---------------------------------|
| 1 | Sufficient consecutive slots       | `slotIdx + neededSlots <= slots.length`        | `canPlace()` line 10            |
| 2 | No lunch overlap                   | `slots[si].isLunch === false` for all slots    | `canPlace()` lines 15-19       |
| 3 | No locked slot assignment          | `isSlotLocked(day, si)` check                 | `canPlace()` lines 26-28       |
| 4 | No faculty double-booking          | Check existing entries for same `facultyId`    | `canPlace()` lines 32-36       |
| 5 | No section overlap                 | Check existing entries for overlapping section | `canPlace()` lines 39-46       |
| 6 | Room must be available             | Check existing entries for same `roomId`       | `findRoom()` lines 61-64       |
| 7 | Room capacity ≥ students           | `room.capacity >= totalStudents`               | `findRoom()` lines 67-69       |
| 8 | Lab → Lab room only                | `r.isLab === true` filter for lab assignments  | `findRoom()` lines 79-80       |
| 9 | Classroom → Classroom preferred    | `r.isLab === false` filter, with lab fallback  | `findRoom()` lines 76-89       |

### Soft Constraints (Optimization)

| # | Rule                              | Implementation                                |
|---|-----------------------------------|-----------------------------------------------|
| 1 | Even day distribution              | Sort days by section load count before trying  |
| 2 | Best-fit room allocation           | Sort candidate rooms by capacity ascending     |
| 3 | Most-constrained-first scheduling  | Priority sort before placement loop            |

### Post-Generation Validation

The `validateTimetable()` function performs a full sweep checking:
- Faculty double-booking across all days and slots
- Room double-booking across all days and slots
- Section overlap across all days and slots
- Classes scheduled during lunch break (warning only)

---

## 5. Scheduling Algorithm

### Pseudocode

```
FUNCTION generate():
    settings ← Store.getSettings()
    days ← settings.daysOfWeek
    slots ← Store.computeTimeSlots()
    rooms ← Store.rooms.getAll()
    
    assignments ← buildAssignments()
    SORT assignments BY most-constrained-first
    
    timetable ← { day: [] for each day }
    sectionDayCount ← {}
    unplaced ← []
    
    FOR EACH assignment IN assignments:
        placed ← false
        
        dayOrder ← SORT days BY section load (ascending)
        
        FOR EACH day IN dayOrder:
            FOR slotIdx = 0 TO slots.length:
                result ← Constraints.canPlace(assignment, day, slotIdx, ...)
                
                IF result.ok:
                    entry ← assignment + { day, slotIdx, roomId, roomName }
                    timetable[day].PUSH(entry)
                    UPDATE sectionDayCount
                    placed ← true
                    BREAK
            
            IF placed: BREAK
        
        IF NOT placed:
            unplaced.PUSH(assignment)
    
    conflicts ← buildConflictMessages(unplaced)
    conflicts += Constraints.validateTimetable(timetable)
    
    Store.saveTimetable(timetable)
    Store.saveConflicts(conflicts)
    
    RETURN { timetable, conflicts, stats }
```

### Complexity Analysis

- **Time:** O(A × D × S × E) where A = assignments, D = days, S = slots, E = existing entries per slot
- **Space:** O(A + D × E_max) for timetable storage

For the sample dataset: ~120 assignments × 5 days × 8 slots × ~10 entries ≈ 48,000 checks (fast).

---

## 6. User Interface Guide

### 6.1 Navigation

The sidebar provides five sections:

| Page              | Icon | Description                           |
|-------------------|------|---------------------------------------|
| Dashboard         | Grid | Overview stats, generate, lock slots   |
| Input Config      | Plus | Define all scheduling entities         |
| Section Timetable | Grid | View generated schedule by section     |
| Faculty Timetable | Users| View schedule by faculty member        |
| Room Utilization  | Home | Room usage stats + per-room schedule   |

### 6.2 Workflow

```
1. Configure Inputs (or use sample data)
   └─ Courses → Sections → Rooms → Faculty → Combined Classes → Settings

2. Dashboard → Lock Slots (optional)
   └─ Lock specific day/period combinations

3. Dashboard → Generate Timetable
   └─ Review stats, placed/unplaced counts
   └─ Check conflict log for issues

4. View Timetables
   └─ Section View: filter by section, export PDF/Excel
   └─ Faculty View: filter by faculty, export PDF/Excel
   └─ Room View: utilization bars + per-room grid

5. Iterate
   └─ Modify inputs → Regenerate → Review
```

---

## 7. Export System

### 7.1 PDF Export

**Library:** jsPDF 2.5.1 + AutoTable 3.8.2

**Output format:**
- Page 1: Timetable grid (landscape A4)
  - Title + generation timestamp
  - Rows = days, Columns = time slots
  - Cell content: Course Code, Faculty, Room, Sections
  - Teams Purple header row
- Page 2: Course-Faculty Reference legend

**File naming:** `{Title}_with_spaces_as_underscores.pdf`

### 7.2 Excel Export

**Library:** SheetJS (xlsx) 0.18.5

**Output format:**
- Sheet "Timetable": Same grid as PDF
- Sheet "Course-Faculty": Legend table (Code, Course, Faculty, Sections)

**File naming:** `{Title}_with_spaces_as_underscores.xlsx`

---

## 8. Issue Verification Guide

### 8.1 How to Verify the Constraint Engine

#### Test: No Faculty Double-Booking

1. Open browser DevTools → Console
2. Generate a timetable
3. Run:
```javascript
const tt = Store.getTimetable();
const slots = Store.computeTimeSlots();
const days = Store.getSettings().daysOfWeek;
let violations = 0;

for (const day of days) {
  for (const slot of slots) {
    const entries = (tt[day] || []).filter(e =>
      slot.idx >= e.slotIdx && slot.idx < e.slotIdx + (e.requiredSlots || 1)
    );
    const facIds = entries.map(e => e.facultyId);
    const unique = new Set(facIds);
    if (facIds.length !== unique.size) {
      console.error(`DOUBLE-BOOKING: ${day} ${slot.start}`, entries);
      violations++;
    }
  }
}
console.log(`Faculty double-booking violations: ${violations}`);
```

#### Test: No Room Overlap

```javascript
const tt = Store.getTimetable();
const slots = Store.computeTimeSlots();
const days = Store.getSettings().daysOfWeek;
let violations = 0;

for (const day of days) {
  for (const slot of slots) {
    const entries = (tt[day] || []).filter(e =>
      slot.idx >= e.slotIdx && slot.idx < e.slotIdx + (e.requiredSlots || 1)
    );
    const roomIds = entries.filter(e => e.roomId).map(e => e.roomId);
    const unique = new Set(roomIds);
    if (roomIds.length !== unique.size) {
      console.error(`ROOM OVERLAP: ${day} ${slot.start}`, entries);
      violations++;
    }
  }
}
console.log(`Room overlap violations: ${violations}`);
```

#### Test: No Section Overlap

```javascript
const tt = Store.getTimetable();
const slots = Store.computeTimeSlots();
const days = Store.getSettings().daysOfWeek;
let violations = 0;

for (const day of days) {
  for (const slot of slots) {
    const entries = (tt[day] || []).filter(e =>
      slot.idx >= e.slotIdx && slot.idx < e.slotIdx + (e.requiredSlots || 1)
    );
    const allSecIds = [];
    entries.forEach(e => (e.sectionIds || []).forEach(s => allSecIds.push(s)));
    const unique = new Set(allSecIds);
    if (allSecIds.length !== unique.size) {
      console.error(`SECTION OVERLAP: ${day} ${slot.start}`, entries);
      violations++;
    }
  }
}
console.log(`Section overlap violations: ${violations}`);
```

#### Test: Room Capacity

```javascript
const tt = Store.getTimetable();
const days = Store.getSettings().daysOfWeek;
let violations = 0;

for (const day of days) {
  for (const entry of (tt[day] || [])) {
    const room = Store.rooms.get(entry.roomId);
    const students = Store.totalStudents(entry.sectionIds);
    if (room && room.capacity < students) {
      console.error(`CAPACITY VIOLATION: ${room.name} (${room.capacity}) < ${students} students`, entry);
      violations++;
    }
  }
}
console.log(`Room capacity violations: ${violations}`);
```

#### Test: No Classes During Lunch

```javascript
const tt = Store.getTimetable();
const slots = Store.computeTimeSlots();
const lunchSlots = slots.filter(s => s.isLunch);
const days = Store.getSettings().daysOfWeek;
let violations = 0;

for (const day of days) {
  for (const slot of lunchSlots) {
    const entries = (tt[day] || []).filter(e =>
      slot.idx >= e.slotIdx && slot.idx < e.slotIdx + (e.requiredSlots || 1)
    );
    if (entries.length > 0) {
      console.warn(`LUNCH VIOLATION: ${day} ${slot.start}`, entries);
      violations++;
    }
  }
}
console.log(`Lunch break violations: ${violations}`);
```

### 8.2 How to Verify Data Integrity

```javascript
// Check all faculty point to valid courses
Store.faculty.getAll().forEach(f => {
  if (!Store.courses.get(f.courseId)) {
    console.error(`Faculty ${f.name} → invalid courseId: ${f.courseId}`);
  }
});

// Check all faculty sections exist
Store.faculty.getAll().forEach(f => {
  (f.sectionIds || []).forEach(sid => {
    if (!Store.sections.get(sid)) {
      console.error(`Faculty ${f.name} → invalid sectionId: ${sid}`);
    }
  });
});

// Check combined class sections exist
Store.combined.getAll().forEach(c => {
  (c.sectionIds || []).forEach(sid => {
    if (!Store.sections.get(sid)) {
      console.error(`Combined ${c.name} → invalid sectionId: ${sid}`);
    }
  });
});

console.log('Data integrity check complete.');
```

### 8.3 How to Verify Placement Statistics

```javascript
// After generation, check stats
const result = Generator.generate();
console.table({
  'Total Assignments': result.stats.total,
  'Successfully Placed': result.stats.placed,
  'Failed to Place': result.stats.unplaced,
  'Placement Rate': `${Math.round(result.stats.placed / result.stats.total * 100)}%`,
  'Post-Validation Conflicts': result.conflicts.length
});
```

---

## 9. Testing Procedures

### 9.1 Manual Test Scenarios

#### Scenario 1: Fresh Start Generation

1. Clear all localStorage: `localStorage.clear()` → Refresh page
2. Sample data auto-loads
3. Click "Generate Timetable"
4. **Expected:** 100% placement rate, 0 conflicts

#### Scenario 2: Add a Course and Regenerate

1. Go to Input Config → Courses → Add Course
2. Add "Advanced Algorithms" (3 theory, 2 lab)
3. Map a faculty to this course for sections A, B
4. Regenerate
5. **Expected:** New course appears in section timetables

#### Scenario 3: Lock a Slot

1. Dashboard → Locked Slots → Lock "Monday Period 1"
2. Regenerate
3. **Expected:** No class assigned to Monday P1

#### Scenario 4: Capacity Constraint

1. Reduce a room's capacity to 10
2. Regenerate
3. **Expected:** That room is not assigned to any section with > 10 students

#### Scenario 5: Export Verification

1. Generate timetable
2. Section View → Select Section A → Export PDF
3. **Expected:** PDF downloads with correct grid and legend

---

## 10. Troubleshooting FAQ

### Q: Timetable shows unplaced assignments

**A:** The greedy algorithm couldn't find a valid slot. Possible causes:
- Not enough rooms for simultaneous sections
- Faculty has too many assignments for available slots
- Too many locked slots
- Lunch break reduces available periods

**Fix:** Add more rooms, reduce course hours, or unlock slots.

---

### Q: Export buttons don't work

**A:** CDN libraries (jsPDF, SheetJS) failed to load. Check:
- Internet connectivity
- Browser console for 404/network errors
- Try refreshing the page

---

### Q: Data disappeared after browser update

**A:** localStorage was cleared. This can happen when:
- Browser cache/data is cleared
- Privacy mode / incognito window
- Different browser or device (data is per-browser)

**Fix:** Re-enter data or use the sample data (auto-loads on empty state).

---

### Q: Grid shows wrong time slots

**A:** Check Settings:
1. Go to Input Config → Settings
2. Verify Start Time, End Time, Period Duration, Lunch Window
3. Save Settings → Regenerate

---

### Q: Same course appears twice in one slot

**A:** This happens when a faculty teaches the same course to different sections — both may be placed in the same slot with different rooms. This is **correct behavior** (different sections can attend different rooms simultaneously).

---

### Q: How to reset everything

**A:** Open browser DevTools → Console:
```javascript
localStorage.clear();
location.reload();
```
This removes all data and reloads with sample data.

---

## Appendix A: File Size Summary

| File              | Lines | Bytes  | Description                        |
|-------------------|-------|--------|------------------------------------|
| `index.html`      | 79    | 3,837  | App shell + script loading         |
| `styles.css`      | 556   | 14,263 | Complete design system             |
| `data.js`         | 119   | 3,838  | Data layer + persistence           |
| `constraints.js`  | 166   | 6,009  | Constraint validation engine       |
| `generator.js`    | 221   | 7,198  | Scheduling algorithm               |
| `export.js`       | 159   | 5,421  | PDF + Excel export                 |
| `sample-data.js`  | 110   | 6,197  | Pre-loaded sample dataset          |
| `ui-dashboard.js` | 248   | 11,156 | Dashboard page controller          |
| `ui-inputs.js`    | 632   | 28,059 | Input configuration controller     |
| `ui-views.js`     | 310   | 13,496 | Timetable view controllers         |
| `app.js`          | 101   | 3,516  | App shell + routing + modal/toast  |
| **Total**         | **2,701** | **102,990** | **~103 KB total source code** |

## Appendix B: localStorage Key Reference

```
tt_courses    → Array<{id, name, code, theoryHours, labHours, theoryPeriods, labPeriods}>
tt_sections   → Array<{id, name, semester, studentCount}>
tt_faculty    → Array<{id, name, courseId, isCombined, sectionIds, combinedId}>
tt_rooms      → Array<{id, name, capacity, isLab}>
tt_combined   → Array<{id, name, sectionIds}>
tt_settings   → {daysOfWeek, startTime, endTime, periodDuration, lunchStart, lunchEnd}
tt_timetable  → {Monday: [...entries], Tuesday: [...], ...}
tt_locks      → Array<{id, day, slotIdx}>
tt_conflicts  → Array<{type, message}>
```
