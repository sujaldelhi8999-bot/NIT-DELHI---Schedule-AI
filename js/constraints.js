/* ==================================================
   CONSTRAINTS.JS — Constraint checking engine
   ================================================== */

const Constraints = (() => {
  function canPlace(assignment, day, slotIdx, timetable, slots, rooms) {
    const neededSlots = assignment.requiredSlots || 1;
    const settings = Store.getSettings();
    const periodDuration = settings.periodDuration || 60;
    const slotHours = periodDuration / 60;

    // 1. Enough consecutive slots remaining?
    if (slotIdx + neededSlots > slots.length) {
      return { ok: false, reason: 'Not enough slots remaining in the day.' };
    }

    // 2. No lunch overlap (H3)
    for (let s = 0; s < neededSlots; s++) {
      if (slots[slotIdx + s].isLunch) {
        return { ok: false, reason: `Slot ${slots[slotIdx + s].start} is a lunch break.` };
      }
    }

    // 3. Faculty Limits (H6, H7)
    const maxDailyHours = settings.teacherMaxHoursD || 6;
    const maxWeeklyHours = settings.teacherMaxHoursW || 25;
    
    let dailySlots = 0;
    let weeklySlots = 0;
    
    Object.keys(timetable).forEach(d => {
      timetable[d].forEach(e => {
        if (e.facultyId === assignment.facultyId) {
          if (d === day) dailySlots += e.requiredSlots;
          weeklySlots += e.requiredSlots;
        }
      });
    });

    if ((dailySlots + neededSlots) * slotHours > maxDailyHours) {
      return { ok: false, reason: `Faculty ${assignment.facultyName} exceeds daily limit of ${maxDailyHours} hours.` };
    }
    if ((weeklySlots + neededSlots) * slotHours > maxWeeklyHours) {
      return { ok: false, reason: `Faculty ${assignment.facultyName} exceeds weekly limit of ${maxWeeklyHours} hours.` };
    }

    // 3.b Section Max Labs (H17)
    if (assignment.type === 'lab') {
      const maxLabs = settings.maxLabsPerDay || 2;
      for (const sid of assignment.sectionIds) {
        let secLabs = 0;
        (timetable[day] || []).forEach(e => {
          if (e.type === 'lab' && e.sectionIds.includes(sid)) {
            secLabs += 1;
          }
        });
        if (secLabs + 1 > maxLabs) {
          return { ok: false, reason: `Section exceeds max ${maxLabs} lab sessions per day.` };
        }
      }
    }

    // 4. Consecutive Hours Check (H9) - Max 3 hours
    // We check the slots array for existing faculty assignments adjacent to this new block
    const allFacSlotsToday = new Array(slots.length).fill(false);
    (timetable[day] || []).forEach(e => {
      if (e.facultyId === assignment.facultyId) {
        for(let i=0; i<e.requiredSlots; i++) allFacSlotsToday[e.slotIdx + i] = true;
      }
    });
    // simulate adding the new block
    for(let i=0; i<neededSlots; i++) allFacSlotsToday[slotIdx + i] = true;
    
    // measure max continuous true blocks
    let maxContinuous = 0;
    let currContinuous = 0;
    for(let i=0; i<allFacSlotsToday.length; i++) {
        // breaks don't count unless it's lunch, but lunch is a free slot, so it interrupts continuous
        if (allFacSlotsToday[i]) {
            currContinuous++;
            maxContinuous = Math.max(maxContinuous, currContinuous);
        } else {
            currContinuous = 0;
        }
    }
    if ((maxContinuous * slotHours) > 3) {
        return { ok: false, reason: `Faculty ${assignment.facultyName} cannot teach > 3 consecutive hours.` };
    }

    // 5. Check each consecutive slot
    for (let s = 0; s < neededSlots; s++) {
      const si = slotIdx + s;

      // Locked? (H8)
      if (isSlotLocked(day, si, assignment.facultyId)) {
        return { ok: false, reason: `Slot ${slots[si].start} on ${day} is unavailable for scheduling.` };
      }

      const existing = getEntriesAt(timetable, day, si);
      
      // Faculty double-booking (H4, H5)
      for (const e of existing) {
        if (e.facultyId === assignment.facultyId) {
          return { ok: false, reason: `Faculty ${assignment.facultyName} already booked at ${slots[si].start} on ${day}.` };
        }
      }

      // Section overlap (H19)
      for (const e of existing) {
        for (const sid of assignment.sectionIds) {
          if (e.sectionIds.includes(sid)) {
            const secName = Store.sections.get(sid)?.name || sid;
            return { ok: false, reason: `Section ${secName} already has a class at ${slots[si].start} on ${day}.` };
          }
        }
      }
    }

    // 6. Room feasibility (H11, H12, H13, H14)
    const roomResult = findRoom(assignment, day, slotIdx, neededSlots, timetable, slots, rooms);
    if (!roomResult.ok) return roomResult;

    return { ok: true, roomId: roomResult.roomId };
  }

  function findRoom(assignment, day, slotIdx, neededSlots, timetable, slots, rooms) {
    // Determine required lab type from the course
    const course = Store.courses.get(assignment.courseId);
    const requiredLabTypeId = (assignment.type === 'lab' && course) ? (course.labTypeId || '') : '';

    if (assignment.roomId) {
      const room = rooms.find(r => r.id === assignment.roomId);
      if (!room) return { ok: false, reason: 'Assigned room not found.' };
      for (let s = 0; s < neededSlots; s++) {
        const existing = getEntriesAt(timetable, day, slotIdx + s);
        if (existing.some(e => e.roomId === room.id)) {
          return { ok: false, reason: `Room ${room.name} is occupied at ${slots[slotIdx + s].start} on ${day}.` };
        }
      }
      const totalStudents = Store.totalStudents(assignment.sectionIds);
      if (room.capacity < totalStudents) {
        return { ok: false, reason: `Room ${room.name} capacity (${room.capacity}) < students (${totalStudents}).` };
      }
      // Check lab type match for pre-assigned room
      if (requiredLabTypeId && room.labTypeId !== requiredLabTypeId) {
        const labType = Store.labTypes.get(requiredLabTypeId);
        return { ok: false, reason: `Room ${room.name} is not a ${labType?.name || requiredLabTypeId}. Course requires ${labType?.name || requiredLabTypeId}.` };
      }
      return { ok: true, roomId: room.id };
    }

    const totalStudents = Store.totalStudents(assignment.sectionIds);
    const isLab = assignment.type === 'lab';

    // Strict constraint mapping: Labs must go to matching lab type rooms
    const candidates = rooms
      .filter(r => {
        if (r.capacity < totalStudents) return false;
        if (isLab && !r.isLab) return false;
        if (!isLab && r.isLab) return false; // H14: Theory MUST NOT use Lab
        // Lab type matching: if course requires a specific lab type, room must match
        if (isLab && requiredLabTypeId && r.labTypeId !== requiredLabTypeId) return false;
        return true;
      })
      .sort((a, b) => a.capacity - b.capacity); // Tightest fit first

    for (const room of candidates) {
      let free = true;
      for (let s = 0; s < neededSlots; s++) {
        const existing = getEntriesAt(timetable, day, slotIdx + s);
        if (existing.some(e => e.roomId === room.id)) { free = false; break; }
      }
      if (free) return { ok: true, roomId: room.id };
    }

    const labTypeName = requiredLabTypeId ? (Store.labTypes.get(requiredLabTypeId)?.name || requiredLabTypeId) : 'lab';
    return { ok: false, reason: `No available ${isLab ? labTypeName + ' room' : 'room'} with capacity >= ${totalStudents} at ${slots[slotIdx].start} on ${day}.` };
  }

  function getEntriesAt(timetable, day, slotIdx) {
    if (!timetable || !timetable[day]) return [];
    return timetable[day].filter(e => {
      const end = e.slotIdx + (e.requiredSlots || 1);
      return slotIdx >= e.slotIdx && slotIdx < end;
    });
  }

  function isSlotLocked(day, slotIdx, facultyId = null) {
    return Store.locks.getAll().some(l => 
        l.day === day && l.slotIdx === slotIdx && 
        (!l.facultyId || l.facultyId === facultyId)
    );
  }

  function makeError(code, message, entryIds = [], details = {}) {
    return { code, message, entryIds, details };
  }

  function validateTimetable(timetable) {
    const errors = [];
    const warnings = [];
    const slots = Store.computeTimeSlots();
    const settings = Store.getSettings();
    const days = settings.daysOfWeek;
    const periodDuration = settings.periodDuration || 60;
    const slotHours = periodDuration / 60;
    const validDays = new Set(days || []);
    const seenIds = new Set();
    const courses = Store.courses.getAll();
    const faculty = Store.faculty.getAll();
    const rooms = Store.rooms.getAll();
    const sections = Store.sections.getAll();
    const combined = Store.combined.getAll();

    const courseMap = Object.fromEntries(courses.map(c => [c.id, c]));
    const facultyMap = Object.fromEntries(faculty.map(f => [f.id, f]));
    const roomMap = Object.fromEntries(rooms.map(r => [r.id, r]));
    const sectionMap = Object.fromEntries(sections.map(s => [s.id, s]));
    const combinedMap = Object.fromEntries(combined.map(c => [c.id, c]));

    const allEntries = [];
    for (const day of Object.keys(timetable || {})) {
      for (const e of timetable[day] || []) allEntries.push({ ...e, day: e.day || day });
    }

    for (const e of allEntries) {
      if (!e.id) {
        errors.push(makeError('MISSING_ENTRY_ID', 'A timetable entry is missing an id.'));
      } else if (seenIds.has(e.id)) {
        errors.push(makeError('DUPLICATE_TIMETABLE_ENTRY', `Duplicate timetable entry ${e.id}.`, [e.id]));
      }
      seenIds.add(e.id);

      if (!validDays.has(e.day)) errors.push(makeError('INVALID_DAY', `Entry ${e.id} uses invalid day ${e.day}.`, [e.id], { day: e.day }));
      if (!Number.isInteger(e.slotIdx) || e.slotIdx < 0 || e.slotIdx >= slots.length) {
        errors.push(makeError('INVALID_PERIOD', `Entry ${e.id} uses invalid period ${e.slotIdx}.`, [e.id], { slotIdx: e.slotIdx }));
      }
      const requiredSlots = e.requiredSlots || 1;
      if (!Number.isInteger(requiredSlots) || requiredSlots < 1 || e.slotIdx + requiredSlots > slots.length) {
        errors.push(makeError('INVALID_BLOCK_LENGTH', `Entry ${e.id} has an invalid block length.`, [e.id], { requiredSlots }));
      }

      const course = courseMap[e.courseId];
      const fac = facultyMap[e.facultyId];
      const room = e.roomId ? roomMap[e.roomId] : null;
      if (!course) errors.push(makeError('MISSING_COURSE', `Entry ${e.id} references a missing course.`, [e.id], { courseId: e.courseId }));
      if (!fac) errors.push(makeError('MISSING_FACULTY', `Entry ${e.id} references a missing faculty mapping.`, [e.id], { facultyId: e.facultyId }));
      if (e.roomId && !room) errors.push(makeError('MISSING_ROOM', `Entry ${e.id} references a missing room.`, [e.id], { roomId: e.roomId }));
      if (!Array.isArray(e.sectionIds) || e.sectionIds.length === 0) {
        errors.push(makeError('MISSING_ENTRY_SECTIONS', `Entry ${e.id} has no assigned sections.`, [e.id]));
      }
      const entrySections = new Set();
      for (const sid of e.sectionIds || []) {
        if (entrySections.has(sid)) errors.push(makeError('DUPLICATE_ENTRY_SECTION', `Entry ${e.id} contains duplicate section ${sid}.`, [e.id], { sectionId: sid }));
        entrySections.add(sid);
        if (!sectionMap[sid]) errors.push(makeError('MISSING_SECTION', `Entry ${e.id} references missing section ${sid}.`, [e.id], { sectionId: sid }));
      }
      if (e.isCombined && fac?.combinedId && !combinedMap[fac.combinedId]) {
        errors.push(makeError('MISSING_COMBINED_CLASS', `Entry ${e.id} references a missing combined class.`, [e.id], { combinedId: fac.combinedId }));
      }

      for (let i = 0; i < requiredSlots; i++) {
        const slot = slots[e.slotIdx + i];
        if (!slot) continue;
        if (slot.isLunch) errors.push(makeError('BREAK_PERIOD_USED', `Entry ${e.id} overlaps a break on ${e.day}.`, [e.id]));
        if (isSlotLocked(e.day, e.slotIdx + i, e.facultyId)) {
          errors.push(makeError('UNAVAILABLE_SLOT_USED', `Entry ${e.id} uses an unavailable slot.`, [e.id], { day: e.day, slotIdx: e.slotIdx + i }));
        }
      }

      if (room) {
        const totalStudents = Store.totalStudents(e.sectionIds || []);
        if (room.capacity < totalStudents) {
          errors.push(makeError('ROOM_CAPACITY_EXCEEDED', `Room ${room.name} cannot hold the assigned sections.`, [e.id], { capacity: room.capacity, students: totalStudents }));
        }
        const requiredLabTypeId = e.type === 'lab' && course ? (course.labTypeId || '') : '';
        if (e.type === 'lab' && !room.isLab) errors.push(makeError('LAB_ROOM_REQUIRED', `Lab entry ${e.id} is not in a lab room.`, [e.id]));
        if (e.type !== 'lab' && room.isLab) errors.push(makeError('THEORY_IN_LAB_ROOM', `Theory entry ${e.id} is scheduled in a lab room.`, [e.id]));
        if (e.type === 'lab' && requiredLabTypeId && room.labTypeId !== requiredLabTypeId) {
          errors.push(makeError('LAB_TYPE_MISMATCH', `Lab entry ${e.id} uses an incompatible lab room.`, [e.id], { requiredLabTypeId, roomLabTypeId: room.labTypeId }));
        }
      }
    }

    for (const day of days) {
      const entries = timetable[day] || [];
      for (let si = 0; si < slots.length; si++) {
        const atSlot = entries.filter(e => {
          const end = e.slotIdx + (e.requiredSlots || 1);
          return si >= e.slotIdx && si < end;
        });

        const facMap = {};
        for (const e of atSlot) {
          if (facMap[e.facultyId]) {
            errors.push(makeError('FACULTY_CONFLICT', `Faculty ${e.facultyName} double-booked on ${day} at ${slots[si].start}.`, [e.id]));
          }
          facMap[e.facultyId] = true;
        }

        const roomMap = {};
        for (const e of atSlot) {
          if (e.roomId && roomMap[e.roomId]) {
            const room = Store.rooms.get(e.roomId);
            errors.push(makeError('ROOM_CONFLICT', `Room ${room?.name || e.roomId} double-booked on ${day} at ${slots[si].start}.`, [e.id]));
          }
          if (e.roomId) roomMap[e.roomId] = true;
        }

        const secMap = {};
        for (const e of atSlot) {
          for (const sid of (e.sectionIds || [])) {
            if (secMap[sid]) {
              const sec = Store.sections.get(sid);
              errors.push(makeError('SECTION_CONFLICT', `Section ${sec?.name || sid} overlapping on ${day} at ${slots[si].start}.`, [e.id], { sectionId: sid }));
            }
            secMap[sid] = true;
          }
        }

        if (slots[si].isLunch && atSlot.length > 0) {
          errors.push(makeError('BREAK_PERIOD_USED', `Class during lunch on ${day} at ${slots[si].start}.`, atSlot.map(e => e.id)));
        }
      }
      
      // Check max daily per section limit
      const secLabs = {};
      entries.forEach(e => {
          if (e.type === 'lab') {
              e.sectionIds.forEach(sid => {
                  secLabs[sid] = (secLabs[sid] || 0) + 1;
              });
          }
      });
      const maxLabs = settings.maxLabsPerDay || 2;
      for(const sid in secLabs) {
          if (secLabs[sid] > maxLabs) {
              const sec = Store.sections.get(sid);
              errors.push(makeError('MAX_LABS_PER_DAY_EXCEEDED', `Section ${sec?.name || sid} has more than ${maxLabs} lab sessions on ${day}.`, [], { sectionId: sid, day }));
          }
      }
    }
    
    // Cross-day validation: Weekly limits & Daily limits
    const facHoursD = {};
    const facHoursW = {};
    const maxD = settings.teacherMaxHoursD || 6;
    const maxW = settings.teacherMaxHoursW || 25;
    
    for (const day of days) {
        facHoursD[day] = {};
        const entries = timetable[day] || [];
        entries.forEach(e => {
            const hrs = e.requiredSlots * slotHours;
            facHoursD[day][e.facultyId] = (facHoursD[day][e.facultyId] || 0) + hrs;
            facHoursW[e.facultyId] = (facHoursW[e.facultyId] || 0) + hrs;
        });
        
        for (const fid in facHoursD[day]) {
            if (facHoursD[day][fid] > maxD) {
                errors.push(makeError('FACULTY_DAILY_LIMIT_EXCEEDED', `Faculty limits exceeded: Daily max > ${maxD} hrs on ${day}.`, [], { facultyId: fid, day }));
            }
        }
    }
    for (const fid in facHoursW) {
        if (facHoursW[fid] > maxW) {
            errors.push(makeError('FACULTY_WEEKLY_LIMIT_EXCEEDED', `Faculty limits exceeded: Weekly max > ${maxW} hrs.`, [], { facultyId: fid }));
        }
    }

    validateRequiredPeriods(timetable, errors);

    return { valid: errors.length === 0, errors, warnings };
  }

  function validateRequiredPeriods(timetable, errors) {
    const expected = new Map();
    const actual = new Map();
    const courses = Store.courses.getAll();
    const combined = Store.combined.getAll();
    const faculty = Store.faculty.getAll();

    function key(courseId, facultyId, sectionIds, type) {
      return [courseId, facultyId, [...sectionIds].sort().join('+'), type].join('|');
    }
    function addExpected(k, sessions, slotsPerSession) {
      const cur = expected.get(k) || { sessions: 0, periods: 0 };
      cur.sessions += sessions;
      cur.periods += sessions * slotsPerSession;
      expected.set(k, cur);
    }

    for (const fm of faculty) {
      const course = courses.find(c => c.id === fm.courseId);
      if (!course) continue;
      const sectionGroups = [];
      if (fm.isCombined) {
        const combo = combined.find(c => c.id === fm.combinedId);
        if (combo) sectionGroups.push(combo.sectionIds || []);
      } else {
        (fm.sectionIds || []).forEach(sid => sectionGroups.push([sid]));
      }
      for (const sids of sectionGroups) {
        if ((course.theoryHours || 0) > 0) addExpected(key(course.id, fm.id, sids, 'theory'), course.theoryHours, course.theoryPeriods || 1);
        if ((course.labHours || 0) > 0) addExpected(key(course.id, fm.id, sids, 'lab'), Math.ceil(course.labHours / (course.labPeriods || 2)), course.labPeriods || 2);
      }
    }

    for (const entries of Object.values(timetable || {})) {
      for (const e of entries || []) {
        const k = key(e.courseId, e.facultyId, e.sectionIds || [], e.type || 'theory');
        const cur = actual.get(k) || { sessions: 0, periods: 0, entryIds: [] };
        cur.sessions += 1;
        cur.periods += e.requiredSlots || 1;
        cur.entryIds.push(e.id);
        actual.set(k, cur);
        if (e.type === 'lab') {
          const course = Store.courses.get(e.courseId);
          const expectedLen = course?.labPeriods || e.requiredSlots || 1;
          if ((e.requiredSlots || 1) !== expectedLen) {
            errors.push(makeError('LAB_BLOCK_INCOMPLETE', `Lab entry ${e.id} does not match the required lab block length.`, [e.id], { expected: expectedLen, actual: e.requiredSlots || 1 }));
          }
        }
      }
    }

    for (const [k, exp] of expected) {
      const act = actual.get(k) || { sessions: 0, periods: 0, entryIds: [] };
      if (act.periods < exp.periods || act.sessions < exp.sessions) {
        errors.push(makeError('REQUIRED_PERIODS_MISSING', 'A required course/faculty/section assignment is missing scheduled periods.', act.entryIds, { key: k, expected: exp, actual: act }));
      }
    }
    for (const [k, act] of actual) {
      const exp = expected.get(k);
      if (!exp || act.periods > exp.periods || act.sessions > exp.sessions) {
        errors.push(makeError('EXTRA_PERIODS_SCHEDULED', 'Unexpected extra periods were scheduled.', act.entryIds, { key: k, expected: exp || null, actual: act }));
      }
    }
  }

  return { canPlace, findRoom, getEntriesAt, isSlotLocked, validateTimetable };
})();
