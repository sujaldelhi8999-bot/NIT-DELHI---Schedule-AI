/* ==================================================
   GENERATOR.JS — Greedy scheduler with soft-rule scoring
   ================================================== */

const Generator = (() => {

  function buildAssignments() {
    const courses = Store.courses.getAll();
    const sections = Store.sections.getAll();
    const faculty = Store.faculty.getAll();
    const combined = Store.combined.getAll();
    const assignments = [];

    for (const fm of faculty) {
      const course = courses.find(c => c.id === fm.courseId);
      if (!course) continue;

      const theoryPeriods = course.theoryPeriods || 1;
      const labPeriods = course.labPeriods || 2;

      if (fm.isCombined) {
        const combo = combined.find(c => c.id === fm.combinedId);
        if (!combo) continue;

        if (course.theoryHours > 0) {
          for (let i = 0; i < course.theoryHours; i++) {
            assignments.push({
              id: Store.uid(),
              courseId: course.id,
              courseName: course.name,
              type: 'theory',
              facultyId: fm.id,
              facultyName: fm.name,
              sectionIds: combo.sectionIds,
              requiredSlots: theoryPeriods,
              isCombined: true,
            });
          }
        }
        if (course.labHours > 0) {
          const labBlocks = Math.ceil(course.labHours / labPeriods);
          for (let i = 0; i < labBlocks; i++) {
            assignments.push({
              id: Store.uid(),
              courseId: course.id,
              courseName: course.name,
              type: 'lab',
              facultyId: fm.id,
              facultyName: fm.name,
              sectionIds: combo.sectionIds,
              requiredSlots: labPeriods,
              isCombined: true,
            });
          }
        }
      } else {
        const sectionIds = fm.sectionIds || [];
        for (const secId of sectionIds) {
          if (course.theoryHours > 0) {
            for (let i = 0; i < course.theoryHours; i++) {
              assignments.push({
                id: Store.uid(),
                courseId: course.id,
                courseName: course.name,
                type: 'theory',
                facultyId: fm.id,
                facultyName: fm.name,
                sectionIds: [secId],
                requiredSlots: theoryPeriods,
              });
            }
          }
          if (course.labHours > 0) {
            const labBlocks = Math.ceil(course.labHours / labPeriods);
            for (let i = 0; i < labBlocks; i++) {
              assignments.push({
                id: Store.uid(),
                courseId: course.id,
                courseName: course.name,
                type: 'lab',
                facultyId: fm.id,
                facultyName: fm.name,
                sectionIds: [secId],
                requiredSlots: labPeriods,
              });
            }
          }
        }
      }
    }
    return assignments;
  }

  function sortByConstraint(assignments) {
    // Primary deterministic sort
    assignments.sort((a, b) => {
      if (a.isCombined && !b.isCombined) return -1;
      if (!a.isCombined && b.isCombined) return 1;
      if (a.requiredSlots !== b.requiredSlots) return b.requiredSlots - a.requiredSlots;
      if (a.type === 'lab' && b.type !== 'lab') return -1;
      if (a.type !== 'lab' && b.type === 'lab') return 1;
      if (a.sectionIds.length !== b.sectionIds.length) return b.sectionIds.length - a.sectionIds.length;
      return Store.totalStudents(b.sectionIds) - Store.totalStudents(a.sectionIds);
    });

    // Shuffle within same-priority groups so each generate() tries a different ordering
    let i = 0;
    while (i < assignments.length) {
      let j = i + 1;
      while (
        j < assignments.length &&
        assignments[i].requiredSlots === assignments[j].requiredSlots &&
        assignments[i].type === assignments[j].type &&
        assignments[i].isCombined === assignments[j].isCombined
      ) j++;
      // shuffle the group [i, j)
      const group = assignments.splice(i, j - i);
      shuffle(group);
      assignments.splice(i, 0, ...group);
      i = i + (j - i);
    }

    return assignments;
  }

  /* ─────────────────────────────────────────────────
   * SOFT RULE SCORING ENGINE (S1–S7)
   * ───────────────────────────────────────────────── */

  function scoreS1(assignment, day, timetable, days) {
    // Balance teacher daily teaching hours (S1)
    let todaySlots = 0;
    (timetable[day] || []).forEach(e => {
      if (e.facultyId === assignment.facultyId) todaySlots += e.requiredSlots;
    });
    // Heavy penalty for putting too many hours on a single day
    return -(todaySlots * 15);
  }

  function scoreS2(assignment, day, slotIdx, timetable, slots) {
    // Provide teachers reasonable gaps (S2)
    const neededSlots = assignment.requiredSlots || 1;
    const blockStart = slotIdx;
    const blockEnd = slotIdx + neededSlots - 1;
    const teacherSlots = new Set();

    (timetable[day] || []).forEach(e => {
      if (e.facultyId === assignment.facultyId) {
        for (let i = 0; i < (e.requiredSlots || 1); i++) teacherSlots.add(e.slotIdx + i);
      }
    });

    let score = 0;
    // Strong penalty if placing adjacent to existing class (encourages gaps)
    if (blockStart > 0 && teacherSlots.has(blockStart - 1)) score -= 30;
    if (blockEnd < slots.length - 1 && teacherSlots.has(blockEnd + 1)) score -= 30;

    // Reward natural gaps
    if (blockStart > 1 && !teacherSlots.has(blockStart - 1) && teacherSlots.has(blockStart - 2)) score += 10;
    return score;
  }

  function scoreS3(assignment, day, timetable, days) {
    // Spread section's classes evenly (S3)
    let score = 0;
    for (const sid of assignment.sectionIds) {
      let todayLoad = 0;
      (timetable[day] || []).forEach(e => {
        if (e.sectionIds.includes(sid)) todayLoad += e.requiredSlots;
      });
      // Heavily penalize overloading a student's single day
      score -= (todayLoad * 20);
    }
    return score;
  }

  function scoreS4(assignment, day, slotIdx, timetable, slots) {
    // Student experience: avoid large gaps
    const neededSlots = assignment.requiredSlots || 1;
    let worstGap = 0;

    for (const sid of assignment.sectionIds) {
      const occupied = new Set();
      (timetable[day] || []).forEach(e => {
        if (e.sectionIds.includes(sid)) {
          for (let i = 0; i < (e.requiredSlots || 1); i++) occupied.add(e.slotIdx + i);
        }
      });
      for (let i = 0; i < neededSlots; i++) occupied.add(slotIdx + i);

      if (occupied.size === 0) continue;

      const sorted = [...occupied].sort((a, b) => a - b);
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      let gaps = 0;
      for (let i = first; i <= last; i++) {
        if (!occupied.has(i) && !slots[i]?.isLunch) gaps++;
      }
      worstGap = Math.max(worstGap, gaps);
    }
    return -worstGap * 5;
  }

  function scoreS5(assignment, day, timetable) {
    // Avoid same-day repeats (S5)
    let penalty = 0;
    for (const sid of assignment.sectionIds) {
      const already = (timetable[day] || []).some(e =>
        e.courseId === assignment.courseId && e.sectionIds.includes(sid)
      );
      if (already) penalty -= 100; // CRITICAL penalty to spread subjects
    }
    return penalty;
  }

  function scoreS6(slotIdx, slots) {
    // Favor earlier slots generally to avoid trailing blanks
    return -(slotIdx * 2);
  }

  function scoreS7(assignment, slotIdx, slots) {
    // Avoid labs in first/last slot (S7)
    if (assignment.type !== 'lab') return 0;
    const lastSlotStart = slots.length - (assignment.requiredSlots || 1);
    if (slotIdx === 0 || slotIdx >= lastSlotStart) return -40;
    return 0;
  }

  function softScore(assignment, day, slotIdx, timetable, slots, days) {
    return (
      scoreS1(assignment, day, timetable, days) +
      scoreS2(assignment, day, slotIdx, timetable, slots) +
      scoreS3(assignment, day, timetable, days) +
      scoreS4(assignment, day, slotIdx, timetable, slots) +
      scoreS5(assignment, day, timetable) +
      scoreS6(slotIdx, slots) +
      scoreS7(assignment, slotIdx, slots)
    );
  }

  /* Fisher-Yates shuffle — used to randomize tie-broken candidates */
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function findCandidates(assignment, timetable, slots, rooms, days) {
    const candidates = [];
    for (const day of days) {
      for (let si = 0; si < slots.length; si++) {
        const result = Constraints.canPlace(assignment, day, si, timetable, slots, rooms);
        if (result.ok) {
          const score = softScore(assignment, day, si, timetable, slots, days);
          candidates.push({ day, slotIdx: si, roomId: result.roomId, score });
        }
      }
    }
    // Sort by score descending, then shuffle within tied score groups
    // so repeated generate() calls produce different valid timetables
    candidates.sort((a, b) => b.score - a.score);

    // Collect the top-score tier (within a small threshold) and shuffle it
    const SCORE_TOLERANCE = 15; // slots within 15 pts of best are "equivalent"
    if (candidates.length > 1) {
      const best = candidates[0].score;
      let tierEnd = 1;
      while (tierEnd < candidates.length && candidates[tierEnd].score >= best - SCORE_TOLERANCE) {
        tierEnd++;
      }
      // Shuffle the top tier in-place
      const topTier = candidates.splice(0, tierEnd);
      shuffle(topTier);
      candidates.unshift(...topTier);
    }

    return candidates;
  }

  function placeEntry(assignment, candidate, timetable, rooms) {
    const entry = {
      ...assignment,
      day: candidate.day,
      slotIdx: candidate.slotIdx,
      roomId: candidate.roomId,
      roomName: rooms.find(r => r.id === candidate.roomId)?.name || '',
    };
    timetable[candidate.day].push(entry);
    return entry;
  }

  function removeEntry(entryId, timetable) {
    for (const day in timetable) {
      const idx = timetable[day].findIndex(e => e.id === entryId);
      if (idx !== -1) {
        return timetable[day].splice(idx, 1)[0];
      }
    }
    return null;
  }

  function findBlockers(assignment, day, slotIdx, timetable, slots) {
    const neededSlots = assignment.requiredSlots || 1;
    const blockerIds = new Set();

    for (let s = 0; s < neededSlots; s++) {
      const si = slotIdx + s;
      const existing = Constraints.getEntriesAt(timetable, day, si);
      for (const e of existing) {
        if (e.facultyId === assignment.facultyId) blockerIds.add(e.id);
        for (const sid of assignment.sectionIds) {
          if (e.sectionIds.includes(sid)) blockerIds.add(e.id);
        }
      }
    }

    const blockers = [];
    for (const day in timetable) {
      for (const e of timetable[day]) {
        if (blockerIds.has(e.id)) blockers.push(e);
      }
    }
    return blockers;
  }

  /* ─────────────────────────────────────────────────
   * HIGH-PERFORMANCE BACKTRACKING ENGINE
   * ───────────────────────────────────────────────── */

  const MAX_BACKTRACK_DEPTH = 4;
  const MAX_BACKTRACK_ATTEMPTS = 500;

  function backtrackPlace(assignment, timetable, slots, rooms, days, depth, attemptCounter) {
    if (depth > MAX_BACKTRACK_DEPTH) return false;

    for (const day of days) {
      for (let si = 0; si < slots.length; si++) {
        if (attemptCounter.count >= MAX_BACKTRACK_ATTEMPTS) return false;
        attemptCounter.count++;

        const neededSlots = assignment.requiredSlots || 1;
        if (si + neededSlots > slots.length) continue;
        let lunchBlock = false;
        for (let s = 0; s < neededSlots; s++) {
          if (slots[si + s].isLunch) { lunchBlock = true; break; }
        }
        if (lunchBlock) continue;

        const directResult = Constraints.canPlace(assignment, day, si, timetable, slots, rooms);
        if (directResult.ok) {
          placeEntry(assignment, { day, slotIdx: si, roomId: directResult.roomId }, timetable, rooms);
          return true;
        }

        const blockers = findBlockers(assignment, day, si, timetable, slots);
        if (blockers.length === 0 || blockers.length > 3) continue;

        // === FAST TARGETED MULTI-EJECTION ===
        // 1. Snapshot original locations of only the blockers
        const originalStates = blockers.map(b => ({
          day: b.day,
          slotIdx: b.slotIdx,
          roomId: b.roomId,
          entry: b
        }));

        // 2. Clear blockers
        for (const b of blockers) removeEntry(b.id, timetable);

        // 3. Try placing the stuck assignment
        const tryResult = Constraints.canPlace(assignment, day, si, timetable, slots, rooms);
        if (tryResult.ok) {
          const placedAssignment = placeEntry(assignment, { day, slotIdx: si, roomId: tryResult.roomId }, timetable, rooms);
          let allBlockersReplaced = true;

          // 4. Re-place ejected blockers
          for (const removedEntry of blockers) {
            const blockerCandidates = findCandidates(removedEntry, timetable, slots, rooms, days);

            if (blockerCandidates.length > 0) {
              placeEntry(removedEntry, blockerCandidates[0], timetable, rooms);
            } else if (depth < MAX_BACKTRACK_DEPTH) {
              const recursiveOk = backtrackPlace(removedEntry, timetable, slots, rooms, days, depth + 1, attemptCounter);
              if (!recursiveOk) {
                allBlockersReplaced = false;
                break;
              }
            } else {
              allBlockersReplaced = false;
              break;
            }
          }

          if (allBlockersReplaced) return true;

          // 5. ROLLBACK on failure
          removeEntry(placedAssignment.id, timetable);
        }

        // Remove blockers from any temporary new homes they found
        for (const b of blockers) removeEntry(b.id, timetable);

        // Restore blockers precisely to their original spots
        for (const state of originalStates) {
          placeEntry(state.entry, { day: state.day, slotIdx: state.slotIdx, roomId: state.roomId }, timetable, rooms);
        }
      }
    }

    return false;
  }

  function generate() {
    const settings = Store.getSettings();
    const days = settings.daysOfWeek;
    const slots = Store.computeTimeSlots();
    const rooms = Store.rooms.getAll();
    const assignments = sortByConstraint(buildAssignments());

    const timetable = {};
    days.forEach(d => timetable[d] = []);

    const greedyUnplaced = [];
    let placed = 0;

    for (const assignment of assignments) {
      const candidates = findCandidates(assignment, timetable, slots, rooms, days);
      if (candidates.length > 0) {
        placeEntry(assignment, candidates[0], timetable, rooms);
        placed++;
      } else {
        greedyUnplaced.push(assignment);
      }
    }

    const stillUnplaced = [];
    let backtrackResolved = 0;

    if (greedyUnplaced.length > 0) {
      sortByConstraint(greedyUnplaced);
      for (const assignment of greedyUnplaced) {
        const attemptCounter = { count: 0 };
        const ok = backtrackPlace(assignment, timetable, slots, rooms, days, 0, attemptCounter);
        if (ok) {
          placed++;
          backtrackResolved++;
        } else {
          stillUnplaced.push(assignment);
        }
      }
    }

    const conflicts = [];
    for (const u of stillUnplaced) {
      const secNames = u.sectionIds.map(sid => Store.sections.get(sid)?.name || sid).join(', ');
      conflicts.push({
        type: 'error',
        message: `Could not place ${u.courseName} (${u.type}, ${u.requiredSlots} periods) for ${secNames} — Faculty: ${u.facultyName}. No valid slot found even after backtracking.`,
      });
    }

    const valConflicts = Constraints.validateTimetable(timetable);
    conflicts.push(...valConflicts);

    Store.saveTimetable(timetable);
    Store.saveConflicts(conflicts);

    const stats = {
      total: assignments.length,
      placed,
      unplaced: stillUnplaced.length,
      backtrackResolved,
      greedyUnplaced: greedyUnplaced.length,
    };

    // Persist stats so AI Optimizer can read them
    localStorage.setItem('tt_last_stats', JSON.stringify(stats));

    return { timetable, conflicts, stats };
  }

  return { generate, buildAssignments };
})();