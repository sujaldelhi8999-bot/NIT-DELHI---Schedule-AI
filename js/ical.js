/* ==================================================
   ICAL.JS — iCal (.ics) export for student timetables
   RFC 5545 compliant — works with Google & Apple Calendar
   ================================================== */

const ICalExport = (() => {

  /* Format a Date to iCal DTSTART/DTEND: YYYYMMDDTHHmmss */
  function fmtDt(date) {
    const pad = n => String(n).padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth()+1)}${pad(date.getDate())}` +
           `T${pad(date.getHours())}${pad(date.getMinutes())}00`;
  }

  /* Get the next occurrence of a weekday from today */
  function nextWeekday(dayName) {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const today = new Date();
    const targetDow = days.findIndex(d => d.toLowerCase() === dayName.toLowerCase());
    if (targetDow === -1) return today;
    let diff = targetDow - today.getDay();
    if (diff <= 0) diff += 7;
    const next = new Date(today);
    next.setDate(today.getDate() + diff);
    return next;
  }

  /* Map weekday name to RFC 5545 RRULE BYDAY value */
  const BYDAY = {
    Monday:'MO', Tuesday:'TU', Wednesday:'WE',
    Thursday:'TH', Friday:'FR', Saturday:'SA', Sunday:'SU'
  };

  /* Escape iCal text values */
  function esc(s) {
    return (s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  }

  /* Generate iCal for a specific section */
  function generateForSection(sectionId) {
    const timetable = Store.getTimetable();
    if (!timetable) { App.toast('Generate a timetable first.', 'error'); return; }

    const section = Store.sections.get(sectionId);
    if (!section) { App.toast('Section not found.', 'error'); return; }

    const slots = Store.computeTimeSlots();
    const uid_base = Date.now();
    let events = '';
    let eventIdx = 0;

    for (const day of Object.keys(timetable)) {
      const byDay = BYDAY[day];
      if (!byDay) continue;

      const baseDate = nextWeekday(day);

      for (const entry of timetable[day]) {
        if (!entry.sectionIds.includes(sectionId)) continue;

        const slot = slots[entry.slotIdx];
        if (!slot || slot.isLunch) continue;

        // Parse start time
        const [sh, sm] = slot.start.split(':').map(Number);
        const slotEnd = slots[entry.slotIdx + (entry.requiredSlots || 1) - 1];
        const [eh, em] = (slotEnd?.end || slot.end).split(':').map(Number);

        const dtStart = new Date(baseDate);
        dtStart.setHours(sh, sm, 0, 0);

        const dtEnd = new Date(baseDate);
        dtEnd.setHours(eh, em, 0, 0);

        const courseCode = Store.courses.get(entry.courseId)?.code || entry.courseName;
        const summary = `${courseCode}${entry.type === 'lab' ? ' [Lab]' : ''}`;
        const location = entry.roomName || '';
        const description = `Faculty: ${entry.facultyName}\\nSection: ${section.name}\\nType: ${entry.type}`;

        events += [
          'BEGIN:VEVENT',
          `UID:tt-${uid_base}-${eventIdx++}@scheduleai`,
          `SUMMARY:${esc(summary)}`,
          `LOCATION:${esc(location)}`,
          `DESCRIPTION:${esc(description)}`,
          `DTSTART:${fmtDt(dtStart)}`,
          `DTEND:${fmtDt(dtEnd)}`,
          `RRULE:FREQ=WEEKLY;BYDAY=${byDay};COUNT=16`,
          'END:VEVENT',
        ].join('\r\n') + '\r\n';
      }
    }

    if (!events) {
      App.toast('No classes found for this section.', 'warning');
      return;
    }

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ScheduleAI//ScheduleAI//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${esc(section.name)} Timetable`,
      events.trimEnd(),
      'END:VCALENDAR',
    ].join('\r\n');

    downloadIcs(ics, `timetable-${section.name.replace(/\s+/g, '-').toLowerCase()}.ics`);
    App.toast(`Downloaded .ics for ${section.name}! Import into Google/Apple Calendar.`, 'success');
  }

  function downloadIcs(content, filename) {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
  }

  /* Render a section picker UI for iCal export */
  function renderExportButton(containerEl) {
    if (!containerEl) return;
    const sections = Store.sections.getAll();
    if (!sections.length) { containerEl.innerHTML = '<p style="font-size:.85rem;color:var(--text-muted)">No sections defined.</p>'; return; }

    containerEl.innerHTML = `
      <div style="display:flex;gap:var(--sp-sm);flex-wrap:wrap;align-items:end">
        <div class="form-group" style="margin:0">
          <label>Section</label>
          <select class="form-control" id="icalSection">
            ${sections.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
          </select>
        </div>
        <button class="btn btn-outline btn-sm" onclick="ICalExport.generateForSection(document.getElementById('icalSection').value)">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          Export .ics
        </button>
      </div>
      <p style="font-size:.75rem;color:var(--text-muted);margin-top:var(--sp-xs)">Exports weekly recurring events for 16 weeks. Import into Google Calendar or Apple Calendar.</p>`;
  }

  return { generateForSection, renderExportButton };
})();
