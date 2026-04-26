/* ==================================================
   HEALTH-SCORE.JS — Timetable quality scoring engine
   Returns a 0–100 score with per-category breakdown.
   ================================================== */

const HealthScore = (() => {

  /* ---- helpers ---- */
  function getEntriesAt(timetable, day, si) {
    return (timetable[day] || []).filter(e => {
      const end = e.slotIdx + (e.requiredSlots || 1);
      return si >= e.slotIdx && si < end;
    });
  }

  /* ──────────────────────────────────────────────
   * Derive placement stats from timetable when
   * stats object is not available (e.g. on page reload).
   * ────────────────────────────────────────────── */
  function deriveStats(timetable) {
    const settings = Store.getSettings();
    const days = settings.daysOfWeek;
    let placed = 0;
    const seen = new Set();
    for (const day of days) {
      (timetable[day] || []).forEach(e => {
        // Count unique assignment slots (by facultyId+courseId+sectionIds key)
        const key = `${e.facultyId}|${e.courseId}|${(e.sectionIds||[]).sort().join(',')}|${day}|${e.slotIdx}`;
        if (!seen.has(key)) { seen.add(key); placed++; }
      });
    }
    // We can't know 'total' without regenerating, so use placed as total
    // which gives 100% when all are placed — correct for a saved timetable
    return { placed, total: placed, unplaced: 0 };
  }

  /* ──────────────────────────────────────────────
   * C1 — Placement rate (0–25 pts)
   *   25 pts if all assignments placed, scales linearly.
   * ────────────────────────────────────────────── */
  function scoreC1(timetable, stats) {
    const s = stats || deriveStats(timetable);
    if (!s || s.total === 0) return { score: 25, max: 25, label: 'Placement Rate', detail: 'Timetable fully placed' };
    // shadow stats with derived if null was passed
    stats = s;
    const pct = stats.placed / stats.total;
    const score = Math.round(pct * 25);
    return {
      score, max: 25, label: 'Placement Rate',
      detail: `${stats.placed}/${stats.total} assignments placed (${Math.round(pct * 100)}%)`
    };
  }

  /* ──────────────────────────────────────────────
   * C2 — Teacher daily load balance (0–20 pts)
   *   Penalty for each day a teacher has > maxDailyHours/2 hours.
   *   Perfect = all teachers balanced = 20 pts.
   * ────────────────────────────────────────────── */
  function scoreC2(timetable) {
    const settings = Store.getSettings();
    const days = settings.daysOfWeek;
    const dur = (settings.periodDuration || 60) / 60;
    const softLimit = (settings.teacherMaxHoursD || 6) * 0.6; // 60% of max = "heavy"
    let penalties = 0;
    let checks = 0;

    for (const day of days) {
      const facLoad = {};
      (timetable[day] || []).forEach(e => {
        facLoad[e.facultyId] = (facLoad[e.facultyId] || 0) + e.requiredSlots * dur;
      });
      for (const hrs of Object.values(facLoad)) {
        checks++;
        if (hrs > softLimit) penalties++;
      }
    }
    if (checks === 0) return { score: 20, max: 20, label: 'Teacher Load Balance', detail: 'No data' };
    const pct = 1 - penalties / checks;
    const score = Math.round(pct * 20);
    return {
      score, max: 20, label: 'Teacher Load Balance',
      detail: `${checks - penalties}/${checks} teacher-days within comfortable load`
    };
  }

  /* ──────────────────────────────────────────────
   * C3 — Student free period gaps (0–20 pts)
   *   Penalise large gaps in a section's daily schedule.
   * ────────────────────────────────────────────── */
  function scoreC3(timetable) {
    const settings = Store.getSettings();
    const days = settings.daysOfWeek;
    const slots = Store.computeTimeSlots();
    const sections = Store.sections.getAll();

    let totalGaps = 0;
    let sectionDays = 0;

    for (const day of days) {
      for (const sec of sections) {
        const occupied = new Set();
        (timetable[day] || []).forEach(e => {
          if (e.sectionIds.includes(sec.id)) {
            for (let i = 0; i < (e.requiredSlots || 1); i++) occupied.add(e.slotIdx + i);
          }
        });
        if (occupied.size === 0) continue;
        sectionDays++;

        const sorted = [...occupied].sort((a, b) => a - b);
        const first = sorted[0], last = sorted[sorted.length - 1];
        let gaps = 0;
        for (let i = first; i <= last; i++) {
          if (!occupied.has(i) && !slots[i]?.isLunch) gaps++;
        }
        totalGaps += gaps;
      }
    }
    if (sectionDays === 0) return { score: 20, max: 20, label: 'Student Free Gaps', detail: 'No data' };
    const avgGaps = totalGaps / sectionDays;
    const score = Math.max(0, Math.round(20 - avgGaps * 5));
    return {
      score, max: 20, label: 'Student Free Gaps',
      detail: `Avg ${avgGaps.toFixed(1)} idle period(s) per section per day`
    };
  }

  /* ──────────────────────────────────────────────
   * C4 — Subject spread across days (0–20 pts)
   *   Penalise same subject appearing twice on same day for a section.
   * ────────────────────────────────────────────── */
  function scoreC4(timetable) {
    const settings = Store.getSettings();
    const days = settings.daysOfWeek;
    const sections = Store.sections.getAll();

    let repeats = 0;
    let total = 0;

    for (const day of days) {
      for (const sec of sections) {
        const seen = {};
        (timetable[day] || []).forEach(e => {
          if (e.sectionIds.includes(sec.id)) {
            seen[e.courseId] = (seen[e.courseId] || 0) + 1;
          }
        });
        for (const count of Object.values(seen)) {
          total++;
          if (count > 1) repeats++;
        }
      }
    }
    if (total === 0) return { score: 20, max: 20, label: 'Subject Spread', detail: 'No data' };
    const pct = 1 - repeats / total;
    const score = Math.round(pct * 20);
    return {
      score, max: 20, label: 'Subject Spread',
      detail: repeats === 0 ? 'No same-day subject repeats ✓' : `${repeats} same-day repeat(s) found`
    };
  }

  /* ──────────────────────────────────────────────
   * C5 — Lab distribution (0–15 pts)
   *   Labs should NOT cluster on one day.
   * ────────────────────────────────────────────── */
  function scoreC5(timetable) {
    const settings = Store.getSettings();
    const days = settings.daysOfWeek;
    const sections = Store.sections.getAll();
    const maxLabsPerDay = settings.maxLabsPerDay || 2;

    let violations = 0;
    let checks = 0;

    for (const day of days) {
      for (const sec of sections) {
        const labs = (timetable[day] || []).filter(e =>
          e.type === 'lab' && e.sectionIds.includes(sec.id)
        ).length;
        if (labs > 0) {
          checks++;
          if (labs > maxLabsPerDay) violations++;
        }
      }
    }
    if (checks === 0) return { score: 15, max: 15, label: 'Lab Distribution', detail: 'No labs scheduled' };
    const pct = 1 - violations / checks;
    const score = Math.round(pct * 15);
    return {
      score, max: 15, label: 'Lab Distribution',
      detail: violations === 0 ? 'All labs within daily limit ✓' : `${violations} day(s) exceed lab limit`
    };
  }

  /* ──────────────────────────────────────────────
   * Master compute
   * ────────────────────────────────────────────── */
  function compute(timetable, stats) {
    if (!timetable) return null;

    const c1 = scoreC1(timetable, stats || null);
    const c2 = scoreC2(timetable);
    const c3 = scoreC3(timetable);
    const c4 = scoreC4(timetable);
    const c5 = scoreC5(timetable);

    const categories = [c1, c2, c3, c4, c5];
    const total = categories.reduce((s, c) => s + c.score, 0);
    const maxTotal = categories.reduce((s, c) => s + c.max, 0);
    const pct = Math.round((total / maxTotal) * 100);

    let grade, gradeColor;
    if (pct >= 90) { grade = 'A+'; gradeColor = 'var(--success)'; }
    else if (pct >= 80) { grade = 'A'; gradeColor = 'var(--success)'; }
    else if (pct >= 70) { grade = 'B'; gradeColor = '#0891b2'; }
    else if (pct >= 60) { grade = 'C'; gradeColor = '#d97706'; }
    else { grade = 'D'; gradeColor = 'var(--danger)'; }

    return { total, maxTotal, pct, grade, gradeColor, categories };
  }

  /* ──────────────────────────────────────────────
   * Render the score card HTML
   * ────────────────────────────────────────────── */
  function renderCard(timetable, stats) {
    const result = compute(timetable, stats);
    if (!result) return '<p style="color:var(--text-muted);font-size:.85rem">Generate a timetable to see the health score.</p>';

    const bars = result.categories.map(c => {
      const pct = Math.round((c.score / c.max) * 100);
      const color = pct >= 80 ? 'var(--success)' : pct >= 60 ? '#d97706' : 'var(--danger)';
      return `
        <div style="margin-bottom:var(--sp-sm)">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="font-size:.8rem;font-weight:500">${c.label}</span>
            <span style="font-size:.8rem;color:var(--text-muted)">${c.score}/${c.max} &nbsp;·&nbsp; ${c.detail}</span>
          </div>
          <div style="background:var(--gray-100);border-radius:20px;height:5px;overflow:hidden">
            <div style="height:100%;border-radius:20px;background:${color};width:${pct}%;transition:width .6s ease"></div>
          </div>
        </div>`;
    }).join('');

    return `
      <div style="display:flex;align-items:center;gap:var(--sp-md);margin-bottom:var(--sp-md)">
        <div style="text-align:center;min-width:72px">
          <div style="font-size:2.6rem;font-weight:700;color:${result.gradeColor};line-height:1">${result.grade}</div>
          <div style="font-size:.75rem;color:var(--text-muted);margin-top:2px">Grade</div>
        </div>
        <div style="flex:1">
          <div style="font-size:1.8rem;font-weight:700;color:${result.gradeColor}">${result.pct}<span style="font-size:1rem;font-weight:400;color:var(--text-muted)">/100</span></div>
          <div style="background:var(--gray-100);border-radius:20px;height:8px;margin-top:4px;overflow:hidden">
            <div style="height:100%;border-radius:20px;background:${result.gradeColor};width:${result.pct}%;transition:width .6s ease"></div>
          </div>
        </div>
      </div>
      ${bars}`;
  }

  return { compute, renderCard };
})();
