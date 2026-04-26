/* ==================================================
   UI-DASHBOARD.JS — Dashboard & Generation Controls
   ================================================== */

const UIDashboard = (() => {

  function render() {
    const page = document.getElementById('page-dashboard');
    page.innerHTML = `
      <div class="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your scheduling data and timetable generation controls.</p>
        </div>
        <div class="btn-group">
          <button class="btn btn-primary" id="btnGenerate">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            Generate Timetable
          </button>
          <button class="btn btn-outline" id="btnClearTT" data-tooltip="Clear generated timetable">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            Clear
          </button>
        </div>
      </div>

      <!-- STATS -->
      <div class="stats-grid" id="statsGrid">
        <div class="stat-card">
          <span class="stat-label">Courses</span>
          <span class="stat-value" id="statCourses">0</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Sections</span>
          <span class="stat-value" id="statSections">0</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Faculty</span>
          <span class="stat-value" id="statFaculty">0</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Rooms</span>
          <span class="stat-value" id="statRooms">0</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Status</span>
          <span class="stat-value success" id="statStatus" style="font-size:1rem">—</span>
        </div>
      </div>

      <!-- GENERATION RESULT -->
      <div class="card" style="margin-bottom:var(--sp-md)" id="genResultCard">
        <h3 class="card-title">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          Generation Result
        </h3>
        <div id="genResultContent">
          <div class="empty-state">
            <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <p>No timetable generated yet. Configure your inputs and click "Generate Timetable".</p>
          </div>
        </div>
      </div>

      <!-- CONFLICT LOG -->
      <div class="card" id="conflictCard" style="display:none">
        <h3 class="card-title" style="color:var(--danger)">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          Conflicts &amp; Warnings
        </h3>
        <ul class="conflict-list" id="conflictList"></ul>
      </div>

      <!-- HEALTH SCORE -->
      <div class="card" style="margin-bottom:var(--sp-md)" id="healthScoreCard">
        <h3 class="card-title">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          Timetable Health Score
        </h3>
        <div id="healthScoreContent">
          <p style="font-size:.85rem;color:var(--text-muted)">Generate a timetable to see the health score.</p>
        </div>
      </div>

      <!-- AI ASSISTANT -->
      <div class="card" style="margin-bottom:var(--sp-md)" id="aiAssistantCard">
        <h3 class="card-title">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
          AI Assistant

        </h3>
        <div id="aiAssistantContent"></div>
      </div>

      <!-- VERSION HISTORY -->
      <div class="card" style="margin-bottom:var(--sp-md)">
        <h3 class="card-title">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><path d="M12 8v4l3 3M12 2a10 10 0 100 20A10 10 0 0012 2z"/></svg>
          Version History
        </h3>
        <p style="font-size:.85rem;color:var(--text-muted);margin-bottom:var(--sp-md)">Each generated timetable is auto-saved as a version. Compare two versions to see what changed.</p>
        <div id="versionsPanel"></div>
      </div>

      <!-- ICAL EXPORT -->
      <div class="card" style="margin-bottom:var(--sp-md)">
        <h3 class="card-title">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          Export to Calendar (iCal)
        </h3>
        <div id="icalExportPanel"></div>
      </div>

      <!-- BACKUP / RESTORE -->
      <div class="card" style="margin-bottom:var(--sp-md)">
        <h3 class="card-title">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          Backup &amp; Restore
        </h3>
        <div id="backupPanel"></div>
      </div>

      <!-- SLOT LOCKS -->
      <div class="card" style="margin-top:var(--sp-md)">
        <h3 class="card-title">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="18" height="18"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          Locked Slots
        </h3>
        <p style="font-size:.85rem;color:var(--text-secondary);margin-bottom:var(--sp-md)">Lock specific day/period slots to prevent the generator from assigning classes there.</p>
        <div style="display:flex;gap:var(--sp-sm);flex-wrap:wrap;align-items:end">
          <div class="form-group" style="margin:0">
            <label>Day</label>
            <select class="form-control" id="lockDay" style="min-width:140px"></select>
          </div>
          <div class="form-group" style="margin:0">
            <label>Period</label>
            <select class="form-control" id="lockSlot" style="min-width:160px"></select>
          </div>
          <button class="btn btn-outline btn-sm" id="btnAddLock">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path d="M12 5v14M5 12h14"/></svg>
            Lock
          </button>
        </div>
        <div id="locksList" style="margin-top:var(--sp-md)"></div>
      </div>
    `;

    updateStats();
    loadLocks();
    bindEvents();
    Versions.renderPanel();
    ICalExport.renderExportButton(document.getElementById('icalExportPanel'));
    Utils.renderBackupControls(document.getElementById('backupPanel'));
    // Show health score if timetable exists
    const existingTT = Store.getTimetable();
    if (existingTT) {
      document.getElementById('healthScoreContent').innerHTML = HealthScore.renderCard(existingTT, null);
    }
    // Render AI Assistant panel
    if (typeof AIAssistant !== 'undefined') {
      document.getElementById('aiAssistantContent').innerHTML = AIAssistant.renderPanel();
      AIAssistant.attachEvents();
    }
  }

  function updateStats() {
    document.getElementById('statCourses').textContent  = Store.courses.count();
    document.getElementById('statSections').textContent = Store.sections.count();
    document.getElementById('statFaculty').textContent  = Store.faculty.count();
    document.getElementById('statRooms').textContent    = Store.rooms.count();

    const tt = Store.getTimetable();
    const el = document.getElementById('statStatus');
    if (tt) {
      const conflicts = Store.getConflicts();
      if (conflicts.length === 0) {
        el.textContent = '✓ Ready';
        el.className = 'stat-value success';
      } else {
        el.textContent = `⚠ ${conflicts.length} issue${conflicts.length > 1 ? 's' : ''}`;
        el.className = 'stat-value warning';
      }
    } else {
      el.textContent = '—';
      el.className = 'stat-value';
      el.style.fontSize = '1rem';
    }
  }

  function loadLocks() {
    const settings = Store.getSettings();
    const days = settings.daysOfWeek;
    const slots = Store.computeTimeSlots().filter(s => !s.isLunch);

    const daySelect = document.getElementById('lockDay');
    const slotSelect = document.getElementById('lockSlot');
    daySelect.innerHTML = days.map(d => `<option value="${d}">${d}</option>`).join('');
    slotSelect.innerHTML = slots.map(s => `<option value="${s.idx}">Period ${s.idx + 1} (${s.start}–${s.end})</option>`).join('');

    const locks = Store.locks.getAll();
    const container = document.getElementById('locksList');
    if (locks.length === 0) {
      container.innerHTML = '<p style="font-size:.85rem;color:var(--text-muted)">No locked slots.</p>';
      return;
    }
    container.innerHTML = locks.map(l => {
      const slot = Store.computeTimeSlots()[l.slotIdx];
      return `<span class="lock-item" style="margin:2px;cursor:pointer" onclick="UIDashboard.removeLock('${l.id}')" data-tooltip="Click to remove">${l.day} P${l.slotIdx+1} (${slot?.start || '?'})</span>`;
    }).join(' ');
  }

  function removeLock(id) {
    Store.locks.remove(id);
    loadLocks();
    App.toast('Slot unlocked.', 'info');
  }

  function bindEvents() {
    document.getElementById('btnGenerate').addEventListener('click', runGeneration);
    document.getElementById('btnClearTT').addEventListener('click', () => {
      Store.clearTimetable();
      Store.saveConflicts([]);
      render();
      App.toast('Timetable cleared.', 'info');
    });
    document.getElementById('btnAddLock').addEventListener('click', () => {
      const day = document.getElementById('lockDay').value;
      const slotIdx = parseInt(document.getElementById('lockSlot').value);
      if (!day) return;
      // Check for duplicate
      const existing = Store.locks.getAll().find(l => l.day === day && l.slotIdx === slotIdx);
      if (existing) { App.toast('Slot already locked.', 'error'); return; }
      Store.locks.add({ day, slotIdx });
      loadLocks();
      App.toast('Slot locked.', 'success');
    });
  }

  function runGeneration() {
    // Validate minimum data
    if (Store.courses.count() === 0) { App.toast('Add at least one course first.', 'error'); return; }
    if (Store.sections.count() === 0) { App.toast('Add at least one section first.', 'error'); return; }
    if (Store.faculty.count() === 0) { App.toast('Add at least one faculty mapping first.', 'error'); return; }
    if (Store.rooms.count() === 0) { App.toast('Add at least one room first.', 'error'); return; }

    const btn = document.getElementById('btnGenerate');
    btn.disabled = true;
    btn.innerHTML = '<span>Generating…</span>';

    setTimeout(() => {
      const result = Generator.generate();
      btn.disabled = false;
      btn.innerHTML = `
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        Generate Timetable
      `;

      // Show result
      const content = document.getElementById('genResultContent');
      content.innerHTML = `<div style="display:flex;gap:var(--sp-32);flex-wrap:wrap;margin-bottom:var(--sp-16)">
          <div>
            <span style="font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:600;letter-spacing:.08em">Total Assignments</span>
            <div style="font-size:1.8rem;font-weight:700;color:var(--indigo-600)">${result.stats.total}</div>
          </div>
          <div>
            <span style="font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:600;letter-spacing:.08em">Placed (Greedy)</span>
            <div style="font-size:2rem;font-weight:700;color:var(--success);letter-spacing:-.02em">${result.stats.placed - (result.stats.backtrackResolved || 0)}</div>
          </div>
          <div>
            <span style="font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:600;letter-spacing:.08em">Placed (Backtrack)</span>
            <div style="font-size:1.8rem;font-weight:700;color:var(--indigo-500)">${result.stats.backtrackResolved || 0}</div>
          </div>
          <div>
            <span style="font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:600;letter-spacing:.08em">Unplaced</span>
            <div style="font-size:1.8rem;font-weight:700;color:${result.stats.unplaced > 0 ? 'var(--danger)' : 'var(--success)'};font-size:2rem;font-weight:700;letter-spacing:-.02em">${result.stats.unplaced}</div>
          </div>
        </div>
        <div style="background:var(--gray-100);border-radius:20px;height:6px;margin-top:var(--sp-12);overflow:hidden">
          <div style="height:100%;border-radius:20px;background:var(--indigo-500);transition:width .4s ease" style="width:${result.stats.total > 0 ? Math.round(result.stats.placed / result.stats.total * 100) : 0}%"></div>
        </div>
        <p style="font-size:.8rem;color:var(--text-muted);margin-top:var(--sp-xs)">
          ${result.stats.total > 0 ? Math.round(result.stats.placed / result.stats.total * 100) : 0}% placement rate
          ${result.stats.backtrackResolved > 0 ? ` · ${result.stats.backtrackResolved} rescued by backtracking` : ''}
        </p>
      `;

      // Show conflicts
      const conflictCard = document.getElementById('conflictCard');
      const conflictListEl = document.getElementById('conflictList');
      if (result.conflicts.length > 0) {
        conflictCard.style.display = '';
        conflictListEl.innerHTML = result.conflicts.map(c => `
          <li class="conflict-item ${c.type === 'error' ? 'error' : ''}">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"/></svg>
            <span>${c.message}</span>
          </li>
        `).join('');
      } else {
        conflictCard.style.display = 'none';
      }

      updateStats();

      // Health score
      document.getElementById('healthScoreContent').innerHTML = HealthScore.renderCard(result.timetable, result.stats);

      // Auto-save version
      Versions.save(result.timetable, result.stats);
      Versions.renderPanel();

      if (result.stats.unplaced === 0 && result.conflicts.length === 0) {
        App.toast('Timetable generated successfully — no conflicts!', 'success');
      } else {
        App.toast(`Timetable generated with ${result.conflicts.length} issue(s).`, 'warning');
      }
    }, 300);
  }

  return { render, removeLock, updateStats };
})();
