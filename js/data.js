/* ==================================================
   DATA.JS — Data models & localStorage persistence
   ================================================== */

const Store = (() => {
  const KEYS = {
    courses:    'tt_courses',
    sections:   'tt_sections',
    faculty:    'tt_faculty',
    rooms:      'tt_rooms',
    combined:   'tt_combined',
    labTypes:   'tt_labTypes',
    settings:   'tt_settings',
    timetable:  'tt_timetable',
    locks:      'tt_locks',
    conflicts:  'tt_conflicts',
  };

  const defaults = {
    settings: {
      daysOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'],
      startTime:  '09:30',
      endTime:    '18:30',
      periodDuration: 60,
      lunchStart: '13:30',
      lunchEnd:   '14:30',
      teacherMaxHoursD: 6,
      teacherMaxHoursW: 25,
      maxLabsPerDay: 2,
    }
  };

  /* ---- helpers ---- */
  function _get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
  function _set(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
    window.dispatchEvent(new CustomEvent('store-change', { detail: { key } }));
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ---- CRUD factories ---- */
  function collectionApi(key) {
    return {
      getAll()      { return _get(key) || []; },
      get(id)       { return this.getAll().find(i => i.id === id); },
      add(item)     { const list = this.getAll(); item.id = item.id || uid(); list.push(item); _set(key, list); return item; },
      update(id, data) {
        const list = this.getAll().map(i => i.id === id ? { ...i, ...data } : i);
        _set(key, list);
      },
      remove(id)    { _set(key, this.getAll().filter(i => i.id !== id)); window.dispatchEvent(new CustomEvent('store-delete', { detail: { key } })); },
      clear()       { _set(key, []); },
      count()       { return this.getAll().length; },
    };
  }

  return {
    courses:  collectionApi(KEYS.courses),
    sections: collectionApi(KEYS.sections),
    faculty:  collectionApi(KEYS.faculty),
    rooms:    collectionApi(KEYS.rooms),
    combined: collectionApi(KEYS.combined),
    labTypes: collectionApi(KEYS.labTypes),
    locks:    collectionApi(KEYS.locks),

    /* Settings (single object) */
    getSettings() {
      return _get(KEYS.settings) || { ...defaults.settings };
    },
    saveSettings(s) { _set(KEYS.settings, s); },

    /* Generated timetable */
    getTimetable()    { return _get(KEYS.timetable); },
    saveTimetable(tt) { _set(KEYS.timetable, tt); },
    clearTimetable()  { _set(KEYS.timetable, null); },

    /* Conflicts */
    getConflicts()    { return _get(KEYS.conflicts) || []; },
    saveConflicts(c)  { _set(KEYS.conflicts, c); },

    /* Utility */
    uid,
    computeTimeSlots() {
      const s = this.getSettings();
      const slots = [];
      let [h, m] = s.startTime.split(':').map(Number);
      const [eh, em] = s.endTime.split(':').map(Number);
      const [lh, lm] = (s.lunchStart || '13:30').split(':').map(Number);
      const [leh, lem] = (s.lunchEnd || '14:30').split(':').map(Number);
      const dur = s.periodDuration;
      let idx = 0;
      while (h * 60 + m + dur <= eh * 60 + em) {
        const start = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
        const nm = m + dur;
        const nh = h + Math.floor(nm / 60);
        const nmin = nm % 60;
        const end = `${String(nh).padStart(2,'0')}:${String(nmin).padStart(2,'0')}`;
        const isLunch = (h * 60 + m >= lh * 60 + lm) && (h * 60 + m < leh * 60 + lem);
        slots.push({ idx, start, end, isLunch });
        idx++;
        h = nh;
        m = nmin;
      }
      return slots;
    },

    /* Get total students for a section or combined group */
    totalStudents(sectionIds) {
      return sectionIds.reduce((sum, sid) => {
        const sec = this.sections.get(sid);
        return sum + (sec ? sec.studentCount : 0);
      }, 0);
    },
  };
})();
