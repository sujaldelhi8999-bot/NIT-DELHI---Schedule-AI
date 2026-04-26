/* ==================================================
   UI-VIEWS.JS — Timetable grid views + legend
   Transposed: Days = rows (left), Time = columns (top)
   ================================================== */

const UIViews = (() => {
  const SUBJ_COLORS = 10;
  let colorMap = {}, colorIdx = 0;
  function getColor(courseId) {
    if (!colorMap[courseId]) { colorIdx++; colorMap[courseId] = ((colorIdx - 1) % SUBJ_COLORS) + 1; }
    return colorMap[courseId];
  }

  /**
   * renderGrid — transposed layout
   *  Columns: [Day label] [slot0] [slot1] ... [slotN]
   *  Rows:    one per day
   */
  function renderGrid(entries, days, slots) {
    const cols = slots.length + 1; // 1 for day label + N time slots
    let html = `<div class="timetable-wrapper"><div class="timetable-grid" style="grid-template-columns:90px repeat(${slots.length},1fr)">`;

    // Header row: empty corner + time labels
    html += `<div class="tt-header"></div>`;
    for (const slot of slots) {
      if (slot.isLunch) {
        html += `<div class="tt-header lunch-h"><span class="time">Lunch</span><span class="time-end">${slot.start}–${slot.end}</span></div>`;
      } else {
        html += `<div class="tt-header"><span class="time">${slot.start}</span><span class="time-end">${slot.end}</span></div>`;
      }
    }

    // One row per day
    for (const day of days) {
      // Day label cell
      html += `<div class="tt-day-label">${day.slice(0,3)}</div>`;

      for (const slot of slots) {
        if (slot.isLunch) {
          html += `<div class="tt-cell lunch-slot"><span class="lunch-text">Lunch</span></div>`;
          continue;
        }

        const cellEntries = entries.filter(e =>
          e.day === day && slot.idx >= e.slotIdx && slot.idx < e.slotIdx + (e.requiredSlots || 1)
        );

        if (cellEntries.length > 0) {
          const e = cellEntries[0], ci = getColor(e.courseId);
          const secNames = (e.sectionIds || []).map(sid => Store.sections.get(sid)?.name || sid).join('+');
          const code = Store.courses.get(e.courseId)?.code || e.courseName;
          html += `<div class="tt-cell" data-day="${day}" data-slot="${slot.idx}">
            <div class="tt-block" draggable="true" data-entry-id="${e.id}" style="background:var(--subj-bg-${ci});color:var(--subj-${ci});border-left:3px solid var(--subj-${ci})">
              <span class="tt-subject">${esc(code)}</span>
              <span class="tt-detail">${esc(e.facultyName)}</span>
              <span class="tt-detail">${esc(e.roomName || '')} · ${secNames}</span>
              ${e.type === 'lab' ? '<span class="tt-detail" style="font-style:italic;font-weight:600">Lab</span>' : ''}
            </div>
          </div>`;
        } else {
          html += `<div class="tt-cell" data-day="${day}" data-slot="${slot.idx}"></div>`;
        }
      }
    }

    html += `</div>`;
    return html;
  }

  /* ---- Course-Faculty Legend ---- */
  function renderLegend(filterSecId) {
    const courses = Store.courses.getAll(), faculty = Store.faculty.getAll();
    if (!courses.length) return '';
    let rows = '';
    for (const c of courses) {
      const facs = faculty.filter(f => f.courseId === c.id);
      for (const f of facs) {
        if (filterSecId) {
          let teaches = f.isCombined
            ? Store.combined.get(f.combinedId)?.sectionIds.includes(filterSecId)
            : (f.sectionIds || []).includes(filterSecId);
          if (!teaches) continue;
        }
        const secNames = f.isCombined
          ? (Store.combined.get(f.combinedId)?.sectionIds || []).map(sid => Store.sections.get(sid)?.name || sid).join(', ')
          : (f.sectionIds || []).map(sid => Store.sections.get(sid)?.name || sid).join(', ');
        rows += `<tr>
          <td><span class="badge badge-primary">${esc(c.code)}</span></td>
          <td>${esc(c.name)}</td>
          <td><strong>${esc(f.name)}</strong></td>
          <td>${esc(secNames)}</td>
        </tr>`;
      }
    }
    if (!rows) return '';
    return `<div class="legend-section">
      <h3>📋 Course – Faculty Reference</h3>
      <table class="legend-table">
        <thead><tr><th>Code</th><th>Course Name</th><th>Faculty</th><th>Sections</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }

  /* ================ SECTION VIEW ================ */
  function renderSectionView() {
    const page = document.getElementById('page-section-view');
    const timetable = Store.getTimetable();
    const sections = Store.sections.getAll();
    const settings = Store.getSettings();
    const days = settings.daysOfWeek;
    const slots = Store.computeTimeSlots();

    if (!timetable || !sections.length) {
      page.innerHTML = `<div class="page-header"><div><h1>Section Timetable</h1>
        <p>View generated timetable by section.</p></div></div>
        <div class="empty-state"><p>${!timetable ? 'Generate a timetable first.' : 'No sections defined.'}</p></div>`;
      return;
    }

    page.innerHTML = `
      <div class="page-header">
        <div><h1>Section Timetable</h1><p>View and export by section.</p></div>
        <div class="btn-group">
          <button class="btn btn-outline btn-sm" id="btnSecPDF">Export PDF</button>
          <button class="btn btn-outline btn-sm" id="btnSecExcel">Export Excel</button>
        </div>
      </div>
      <div class="filter-row">
        <label>Section:</label>
        <select class="form-control" id="sectionSelect" style="max-width:250px">
          ${sections.map((s, i) => `<option value="${s.id}" ${i === 0 ? 'selected' : ''}>${esc(s.name)} — ${esc(s.semester)}</option>`).join('')}
        </select>
      </div>
      <div id="sectionGridContainer"></div>
      <div id="sectionLegend"></div>`;

    function updateGrid() {
      const secId = document.getElementById('sectionSelect').value;
      const all = [];
      for (const d of days) (timetable[d] || []).forEach(e => {
        if ((e.sectionIds || []).includes(secId)) all.push(e);
      });
      document.getElementById('sectionGridContainer').innerHTML = renderGrid(all, days, slots);
      DragDrop.initGrid(document.getElementById('sectionGridContainer'));
      document.getElementById('sectionLegend').innerHTML = renderLegend(secId);
    }

    updateGrid();
    document.getElementById('sectionSelect').addEventListener('change', updateGrid);

    document.getElementById('btnSecPDF').addEventListener('click', () => {
      const s = document.getElementById('sectionSelect').value;
      const sec = Store.sections.get(s);
      Export.exportPDF(`Section ${sec?.name || ''}`, timetable, e => (e.sectionIds || []).includes(s));
    });
    document.getElementById('btnSecExcel').addEventListener('click', () => {
      const s = document.getElementById('sectionSelect').value;
      const sec = Store.sections.get(s);
      Export.exportExcel(`Section ${sec?.name || ''}`, timetable, e => (e.sectionIds || []).includes(s));
    });
  }

  /* ================ FACULTY VIEW ================ */
  function renderFacultyView() {
    const page = document.getElementById('page-faculty-view');
    const timetable = Store.getTimetable();
    const faculty = Store.faculty.getAll();
    const settings = Store.getSettings();
    const days = settings.daysOfWeek;
    const slots = Store.computeTimeSlots();

    if (!timetable || !faculty.length) {
      page.innerHTML = `<div class="page-header"><div><h1>Faculty Timetable</h1>
        <p>View timetable by faculty.</p></div></div>
        <div class="empty-state"><p>${!timetable ? 'Generate a timetable first.' : 'No faculty defined.'}</p></div>`;
      return;
    }

    page.innerHTML = `
      <div class="page-header">
        <div><h1>Faculty Timetable</h1><p>View and export by faculty member.</p></div>
        <div class="btn-group">
          <button class="btn btn-outline btn-sm" id="btnFacPDF">Export PDF</button>
          <button class="btn btn-outline btn-sm" id="btnFacExcel">Export Excel</button>
        </div>
      </div>
      <div class="filter-row">
        <label>Faculty:</label>
        <select class="form-control" id="facultySelect" style="max-width:250px">
          ${faculty.map((f, i) => `<option value="${f.id}" ${i === 0 ? 'selected' : ''}>${esc(f.name)}</option>`).join('')}
        </select>
      </div>
      <div id="facultyGridContainer"></div>
      <div id="facultyLegend"></div>`;

    function updateGrid() {
      const fid = document.getElementById('facultySelect').value;
      const all = [];
      for (const d of days) (timetable[d] || []).forEach(e => {
        if (e.facultyId === fid) all.push(e);
      });
      document.getElementById('facultyGridContainer').innerHTML = renderGrid(all, days, slots);
      DragDrop.initGrid(document.getElementById('facultyGridContainer'));
      document.getElementById('facultyLegend').innerHTML = renderLegend();
    }

    updateGrid();
    document.getElementById('facultySelect').addEventListener('change', updateGrid);

    document.getElementById('btnFacPDF').addEventListener('click', () => {
      const f = document.getElementById('facultySelect').value;
      Export.exportPDF(`Faculty ${Store.faculty.get(f)?.name || ''}`, timetable, e => e.facultyId === f);
    });
    document.getElementById('btnFacExcel').addEventListener('click', () => {
      const f = document.getElementById('facultySelect').value;
      Export.exportExcel(`Faculty ${Store.faculty.get(f)?.name || ''}`, timetable, e => e.facultyId === f);
    });
  }

  /* ================ ROOM VIEW ================ */
  function renderRoomView() {
    const page = document.getElementById('page-room-view');
    const timetable = Store.getTimetable();
    const rooms = Store.rooms.getAll();
    const settings = Store.getSettings();
    const days = settings.daysOfWeek;
    const slots = Store.computeTimeSlots();
    const teachSlots = slots.filter(s => !s.isLunch);

    if (!timetable || !rooms.length) {
      page.innerHTML = `<div class="page-header"><div><h1>Room Utilization</h1>
        <p>View room usage.</p></div></div>
        <div class="empty-state"><p>${!timetable ? 'Generate a timetable first.' : 'No rooms defined.'}</p></div>`;
      return;
    }

    const totalAvail = days.length * teachSlots.length;
    const util = rooms.map(room => {
      let used = 0;
      for (const d of days) {
        for (const sl of teachSlots) {
          if ((timetable[d] || []).some(e => e.roomId === room.id && sl.idx >= e.slotIdx && sl.idx < e.slotIdx + (e.requiredSlots || 1))) used++;
        }
      }
      return { ...room, used, total: totalAvail, pct: totalAvail > 0 ? Math.round(used / totalAvail * 100) : 0 };
    });

    page.innerHTML = `
      <div class="page-header">
        <div><h1>Room Utilization</h1><p>Room usage statistics and per-room timetable.</p></div>
        <div class="btn-group">
          <button class="btn btn-outline btn-sm" id="btnRoomPDF">Export PDF</button>
          <button class="btn btn-outline btn-sm" id="btnRoomExcel">Export Excel</button>
        </div>
      </div>
      <div class="stats-grid" style="margin-bottom:var(--sp-xl)">
        ${util.map(r => {
          const barColor = r.pct >= 80 ? 'var(--danger)' : r.pct >= 50 ? 'var(--warning)' : r.pct >= 20 ? 'var(--success)' : 'var(--gray-300)';
          const usageLabel = r.pct >= 80 ? 'High' : r.pct >= 50 ? 'Medium' : r.pct >= 20 ? 'Normal' : 'Low';
          const labelColor = r.pct >= 80 ? 'var(--danger)' : r.pct >= 50 ? '#b45309' : r.pct >= 20 ? 'var(--success)' : 'var(--text-muted)';
          return `
          <div class="card" style="padding:var(--sp-md)">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <span style="font-weight:600;font-size:.9rem">${esc(r.name)}</span>
              <span class="badge ${r.isLab ? 'badge-warning' : 'badge-info'}">${r.isLab ? 'Lab' : 'Room'}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <div style="flex:1;height:10px;background:var(--gray-100);border-radius:20px;overflow:hidden">
                <div style="height:100%;width:${r.pct}%;background:${barColor};border-radius:20px;transition:width .4s ease"></div>
              </div>
              <span style="font-size:13px;font-weight:700;min-width:36px;text-align:right;color:${barColor}">${r.pct}%</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:.75rem">
              <span style="color:var(--text-muted)">${r.used} of ${r.total} slots used</span>
              <span style="font-weight:600;color:${labelColor}">${usageLabel}</span>
            </div>
          </div>
        `}).join('')}
      </div>
      <div class="filter-row">
        <label>Room:</label>
        <select class="form-control" id="roomSelect" style="max-width:250px">
          ${rooms.map((r, i) => `<option value="${r.id}" ${i === 0 ? 'selected' : ''}>${esc(r.name)} (Cap: ${r.capacity})</option>`).join('')}
        </select>
      </div>
      <div id="roomGridContainer"></div>
      <div id="roomLegend"></div>`;

    function updateGrid() {
      const rid = document.getElementById('roomSelect').value;
      const all = [];
      for (const d of days) (timetable[d] || []).forEach(e => {
        if (e.roomId === rid) all.push(e);
      });
      document.getElementById('roomGridContainer').innerHTML = renderGrid(all, days, slots);
      document.getElementById('roomLegend').innerHTML = renderLegend();
    }

    updateGrid();
    document.getElementById('roomSelect').addEventListener('change', updateGrid);

    document.getElementById('btnRoomPDF').addEventListener('click', () => {
      const r = document.getElementById('roomSelect').value;
      Export.exportPDF(`Room ${Store.rooms.get(r)?.name || ''}`, timetable, e => e.roomId === r);
    });
    document.getElementById('btnRoomExcel').addEventListener('click', () => {
      const r = document.getElementById('roomSelect').value;
      Export.exportExcel(`Room ${Store.rooms.get(r)?.name || ''}`, timetable, e => e.roomId === r);
    });
  }

  function esc(str) {
    return String(str || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  return { renderSectionView, renderFacultyView, renderRoomView };
})();
