/* ==================================================
   UTILS.JS — JSON Backup/Restore + Dark Mode toggle
   ================================================== */

const Utils = (() => {

  /* ──────────────────────────────────────────────
   * DARK MODE
   * ────────────────────────────────────────────── */
  const THEME_KEY = 'tt_theme';

  function initDarkMode() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    applyTheme(theme);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    // Update toggle button icon if present
    const btn = document.getElementById('btnDarkMode');
    if (btn) btn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  }

  function toggleDarkMode() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  /* ──────────────────────────────────────────────
   * JSON BACKUP / RESTORE
   * ────────────────────────────────────────────── */
  const BACKUP_KEYS = ['tt_courses','tt_sections','tt_faculty','tt_rooms','tt_combined',
                       'tt_labTypes','tt_settings','tt_timetable','tt_locks','tt_conflicts','tt_versions'];

  function exportBackup() {
    const data = {};
    for (const key of BACKUP_KEYS) {
      try { data[key] = JSON.parse(localStorage.getItem(key) || 'null'); }
      catch { data[key] = null; }
    }
    data._meta = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      app: 'ScheduleAI',
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scheduleai-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
    App.toast('Backup downloaded!', 'success');
  }

  function importBackup(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data._meta || data._meta.app !== 'ScheduleAI') {
          App.toast('Invalid backup file.', 'error'); return;
        }
        if (!confirm('This will replace ALL current data. Continue?')) return;
        for (const key of BACKUP_KEYS) {
          if (data[key] !== undefined) {
            localStorage.setItem(key, JSON.stringify(data[key]));
          }
        }
        App.toast('Backup restored! Reloading…', 'success');
        setTimeout(() => location.reload(), 800);
      } catch {
        App.toast('Failed to parse backup file.', 'error');
      }
    };
    reader.readAsText(file);
  }

  /* Render backup controls into a container element */
  function renderBackupControls(containerEl) {
    if (!containerEl) return;
    containerEl.innerHTML = `
      <div style="display:flex;gap:var(--sp-sm);flex-wrap:wrap;align-items:center">
        <button class="btn btn-outline btn-sm" onclick="Utils.exportBackup()">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          Export Backup (.json)
        </button>
        <label class="btn btn-outline btn-sm" style="cursor:pointer">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
          Import Backup
          <input type="file" accept=".json" style="display:none" onchange="Utils.importBackup(this.files[0])">
        </label>
      </div>
      <p style="font-size:.75rem;color:var(--text-muted);margin-top:var(--sp-xs)">Backup saves all courses, sections, faculty, rooms, and timetable data. Import to restore on any device.</p>`;
  }

  return { initDarkMode, toggleDarkMode, isDark, applyTheme, exportBackup, importBackup, renderBackupControls };
})();
