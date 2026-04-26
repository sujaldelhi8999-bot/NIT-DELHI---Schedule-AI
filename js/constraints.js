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
        return { ok: false, reason: `Slot ${slots[si].start} on ${day} is marked unavailable.` };
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

  function validateTimetable(timetable) {
    const conflicts = [];
    const slots = Store.computeTimeSlots();
    const settings = Store.getSettings();
    const days = settings.daysOfWeek;
    const periodDuration = settings.periodDuration || 60;
    const slotHours = periodDuration / 60;

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
            conflicts.push({ type: 'error', message: `Faculty ${e.facultyName} double-booked on ${day} at ${slots[si].start}.` });
          }
          facMap[e.facultyId] = true;
        }

        const roomMap = {};
        for (const e of atSlot) {
          if (e.roomId && roomMap[e.roomId]) {
            const room = Store.rooms.get(e.roomId);
            conflicts.push({ type: 'error', message: `Room ${room?.name || e.roomId} double-booked on ${day} at ${slots[si].start}.` });
          }
          if (e.roomId) roomMap[e.roomId] = true;
        }

        const secMap = {};
        for (const e of atSlot) {
          for (const sid of (e.sectionIds || [])) {
            if (secMap[sid]) {
              const sec = Store.sections.get(sid);
              conflicts.push({ type: 'error', message: `Section ${sec?.name || sid} overlapping on ${day} at ${slots[si].start}.` });
            }
            secMap[sid] = true;
          }
        }

        if (slots[si].isLunch && atSlot.length > 0) {
          conflicts.push({ type: 'error', message: `Class during lunch on ${day} at ${slots[si].start}.` });
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
              conflicts.push({ type: 'error', message: `Section ${sec?.name || sid} has more than ${maxLabs} lab sessions on ${day}.`});
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
                conflicts.push({ type: 'error', message: `Faculty limits exceeded: Daily max > ${maxD} hrs on ${day}.` });
            }
        }
    }
    for (const fid in facHoursW) {
        if (facHoursW[fid] > maxW) {
            conflicts.push({ type: 'error', message: `Faculty limits exceeded: Weekly max > ${maxW} hrs.` });
        }
    }

    return conflicts;
  }

  return { canPlace, findRoom, getEntriesAt, isSlotLocked, validateTimetable };
})();
