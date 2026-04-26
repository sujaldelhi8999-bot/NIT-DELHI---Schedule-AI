/* ==================================================
   VERSIONS.JS — Timetable version history & compare
   Saves up to 10 snapshots; diff shows slot changes.
   ================================================== */

const Versions = (() => {

  const KEY = 'tt_versions';
  const MAX_VERSIONS = 10;

  function _get() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }
  function _set(list) { localStorage.setItem(KEY, JSON.stringify(list)); }

  /* Save a new version snapshot */
  function save(timetable, stats) {
    if (!timetable) return;
    const list = _get();
    const id = Date.now().toString(36);
    const score = HealthScore.compute(timetable, stats);
    list.unshift({
      id,
      label: `v${list.length + 1}`,
      savedAt: new Date().toISOString(),
      score: score ? score.pct : null,
      grade: score ? score.grade : null,
      stats: { ...stats },
      timetable: JSON.parse(JSON.stringify(timetable)),
    });
    if (list.length > MAX_VERSIONS) list.splice(MAX_VERSIONS);
    _set(list);
    return id;
  }

  function getAll() { return _get(); }
  function get(id) { return _get().find(v => v.id === id); }
  function remove(id) { _set(_get().filter(v => v.id !== id)); }
  function clear() { _set([]); }

  /* Restore a version as the active timetable */
  function restore(id) {
    const v = get(id);
    if (!v) return false;
    Store.saveTimetable(v.timetable);
    Store.saveConflicts([]);
    return true;
  }

  /* ──────────────────────────────────────────────
   * Diff two timetables → array of change objects
   * ────────────────────────────────────────────── */
  function diff(ttA, ttB) {
    const settings = Store.getSettings();
    const days = settings.daysOfWeek;
    const slots = Store.computeTimeSlots();
    const changes = [];

    function cellKey(timetable, day, slotIdx) {
      const entries = (timetable[day] || []).filter(e => {
        const end = e.slotIdx + (e.requiredSlots || 1);
        return slotIdx >= e.slotIdx && slotIdx < end;
      });
      if (!entries.length) return '';
      const e = entries[0];
      return `${e.courseId}|${e.facultyId}|${e.roomId}`;
    }

    for (const day of days) {
      for (const slot of slots) {
        if (slot.isLunch) continue;
        const a = cellKey(ttA, day, slot.idx);
        const b = cellKey(ttB, day, slot.idx);
        if (a === b) continue;

        const entA = (ttA[day] || []).find(e => {
          const end = e.slotIdx + (e.requiredSlots || 1);
          return slot.idx >= e.slotIdx && slot.idx < end;
        });
        const entB = (ttB[day] || []).find(e => {
          const end = e.slotIdx + (e.requiredSlots || 1);
          return slot.idx >= e.slotIdx && slot.idx < end;
        });

        let type;
        if (!a && b) type = 'added';
        else if (a && !b) type = 'removed';
        else type = 'changed';

        changes.push({ day, slot, type, from: entA || null, to: entB || null });
      }
    }
    return changes;
  }

  /* ──────────────────────────────────────────────
   * Render the version history panel
   * ────────────────────────────────────────────── */
  function renderPanel() {
    const versions = getAll();
    const container = document.getElementById('versionsPanel');
    if (!container) return;

    if (versions.length === 0) {
      container.innerHTML = `<p style="font-size:.85rem;color:var(--text-muted)">No saved versions yet. Generate and save a timetable to start tracking.</p>`;
      return;
    }

    container.innerHTML = `
      <div style="display:flex;gap:var(--sp-sm);flex-wrap:wrap;margin-bottom:var(--sp-md)">
        <select class="form-control" id="vCompareA" style="min-width:140px">
          <option value="">Compare: Base</option>
          ${versions.map(v => `<option value="${v.id}">${v.label} (${scoreLabel(v)})</option>`).join('')}
        </select>
        <select class="form-control" id="vCompareB" style="min-width:140px">
          <option value="">Compare: Target</option>
          ${versions.map(v => `<option value="${v.id}">${v.label} (${scoreLabel(v)})</option>`).join('')}
        </select>
        <button class="btn btn-outline btn-sm" onclick="Versions.runCompare()">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          Compare
        </button>
      </div>

      <div id="versionsDiffResult"></div>

      <div class="versions-list">
        ${versions.map(v => renderVersionRow(v)).join('')}
      </div>`;
  }

  function scoreLabel(v) {
    if (v.score == null) return '?';
    return `${v.grade} · ${v.score}/100`;
  }

  function renderVersionRow(v) {
    const date = new Date(v.savedAt);
    const timeStr = date.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) +
                    ' · ' + date.toLocaleDateString([], { day:'numeric', month:'short' });
    const gradeColor = v.score >= 80 ? 'var(--success)' : v.score >= 60 ? '#d97706' : 'var(--danger)';
    return `
      <div class="version-row" id="vrow-${v.id}">
        <div style="display:flex;align-items:center;gap:var(--sp-md)">
          <div style="min-width:36px;text-align:center">
            <span style="font-size:1.1rem;font-weight:700;color:${gradeColor}">${v.grade || '?'}</span>
          </div>
          <div>
            <div style="font-weight:500;font-size:.9rem">${v.label}
              ${v.score != null ? `<span style="color:var(--text-muted);font-weight:400;font-size:.8rem"> · Score: ${v.score}/100</span>` : ''}
            </div>
            <div style="font-size:.75rem;color:var(--text-muted)">${timeStr} · ${v.stats?.placed || 0}/${v.stats?.total || 0} placed</div>
          </div>
        </div>
        <div class="btn-group">
          <button class="btn btn-outline btn-xs" onclick="Versions.restoreVersion('${v.id}')" data-tooltip="Load this version">Restore</button>
          <button class="btn btn-outline btn-xs" onclick="Versions.deleteVersion('${v.id}')" data-tooltip="Delete version" style="color:var(--danger)">✕</button>
        </div>
      </div>`;
  }

  function runCompare() {
    const aId = document.getElementById('vCompareA')?.value;
    const bId = document.getElementById('vCompareB')?.value;
    const result = document.getElementById('versionsDiffResult');
    if (!result) return;

    if (!aId || !bId) { result.innerHTML = '<p style="color:var(--danger);font-size:.85rem">Select two versions to compare.</p>'; return; }
    if (aId === bId) { result.innerHTML = '<p style="color:var(--danger);font-size:.85rem">Select two different versions.</p>'; return; }

    const a = get(aId), b = get(bId);
    if (!a || !b) { result.innerHTML = '<p style="color:var(--danger);font-size:.85rem">Version not found.</p>'; return; }

    const changes = diff(a.timetable, b.timetable);

    if (changes.length === 0) {
      result.innerHTML = `<div class="diff-banner diff-same">✓ No differences found — both versions are identical.</div>`;
      return;
    }

    const added = changes.filter(c => c.type === 'added').length;
    const removed = changes.filter(c => c.type === 'removed').length;
    const changed = changes.filter(c => c.type === 'changed').length;

    const rows = changes.map(c => {
      const icon = c.type === 'added' ? '＋' : c.type === 'removed' ? '－' : '⇄';
      const cls = c.type === 'added' ? 'diff-added' : c.type === 'removed' ? 'diff-removed' : 'diff-changed';
      const fromLabel = c.from ? `${Store.courses.get(c.from.courseId)?.code || c.from.courseName} · ${c.from.facultyName}` : '—';
      const toLabel = c.to ? `${Store.courses.get(c.to.courseId)?.code || c.to.courseName} · ${c.to.facultyName}` : '—';
      return `<tr class="${cls}">
        <td>${c.day.slice(0,3)}</td>
        <td>${c.slot.start}–${c.slot.end}</td>
        <td style="text-align:center">${icon}</td>
        <td>${fromLabel}</td>
        <td>${toLabel}</td>
      </tr>`;
    }).join('');

    result.innerHTML = `
      <div class="diff-banner">
        <span class="diff-badge diff-added-badge">+${added} added</span>
        <span class="diff-badge diff-removed-badge">−${removed} removed</span>
        <span class="diff-badge diff-changed-badge">⇄ ${changed} changed</span>
        &nbsp; comparing <strong>${a.label}</strong> → <strong>${b.label}</strong>
      </div>
      <div style="overflow-x:auto">
        <table class="diff-table">
          <thead><tr><th>Day</th><th>Slot</th><th>Type</th><th>Base (${a.label})</th><th>Target (${b.label})</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  function restoreVersion(id) {
    if (!confirm('Restore this version as the active timetable?')) return;
    if (restore(id)) {
      App.toast('Version restored!', 'success');
      App.navigate('section-view');
    }
  }

  function deleteVersion(id) {
    remove(id);
    renderPanel();
    App.toast('Version deleted.', 'info');
  }

  return { save, getAll, get, remove, clear, restore, diff, renderPanel, runCompare, restoreVersion, deleteVersion };
})();
