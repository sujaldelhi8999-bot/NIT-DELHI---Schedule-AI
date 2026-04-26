/* ==================================================
   DRAG-DROP.JS — Manual drag-and-drop timetable edits
   Works on the rendered tt-cell grid in ui-views.js.
   After drop, re-validates conflicts in real-time.
   ================================================== */

const DragDrop = (() => {

  let dragEntry = null;       // entry object being dragged
  let dragOriginDay = null;
  let dragOriginSlot = null;

  /* ──────────────────────────────────────────────
   * initGrid — call after renderGrid() to wire events
   * ────────────────────────────────────────────── */
  function initGrid(containerEl) {
    if (!containerEl) return;

    // Wire draggable blocks
    containerEl.querySelectorAll('.tt-block').forEach(block => {
      block.setAttribute('draggable', 'true');
      block.addEventListener('dragstart', onDragStart);
      block.addEventListener('dragend', onDragEnd);
    });

    // Wire drop targets (all tt-cell elements)
    containerEl.querySelectorAll('.tt-cell').forEach(cell => {
      cell.addEventListener('dragover', onDragOver);
      cell.addEventListener('dragleave', onDragLeave);
      cell.addEventListener('drop', onDrop);
    });
  }

  function onDragStart(e) {
    const block = e.currentTarget;
    const cell = block.closest('.tt-cell');
    dragOriginDay = cell?.dataset.day;
    dragOriginSlot = parseInt(cell?.dataset.slot);
    const entryId = block.dataset.entryId;

    const timetable = Store.getTimetable();
    if (!timetable || !entryId) return;

    // Find the entry across all days
    for (const day of Object.keys(timetable)) {
      const found = timetable[day].find(e => e.id === entryId);
      if (found) { dragEntry = found; break; }
    }

    block.style.opacity = '0.4';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', entryId);
  }

  function onDragEnd(e) {
    e.currentTarget.style.opacity = '';
    dragEntry = null;
    dragOriginDay = null;
    dragOriginSlot = null;
    document.querySelectorAll('.tt-cell').forEach(c => c.classList.remove('drag-over', 'drag-invalid'));
  }

  function onDragOver(e) {
    if (!dragEntry) return;
    e.preventDefault();
    const cell = e.currentTarget;
    const targetDay = cell.dataset.day;
    const targetSlot = parseInt(cell.dataset.slot);

    // Quick feasibility check (without room finding — just slot-level)
    const timetable = Store.getTimetable();
    if (!timetable) return;

    // Temporarily remove the dragged entry for check
    const snapshot = removeTempEntry(timetable, dragEntry.id);
    const rooms = Store.rooms.getAll();
    const slots = Store.computeTimeSlots();
    const result = Constraints.canPlace(dragEntry, targetDay, targetSlot, snapshot, slots, rooms);
    // restore
    restoreTempEntry(snapshot, dragEntry, dragOriginDay, dragOriginSlot);

    cell.classList.remove('drag-over', 'drag-invalid');
    cell.classList.add(result.ok ? 'drag-over' : 'drag-invalid');
    e.dataTransfer.dropEffect = result.ok ? 'move' : 'none';
  }

  function onDragLeave(e) {
    e.currentTarget.classList.remove('drag-over', 'drag-invalid');
  }

  function onDrop(e) {
    e.preventDefault();
    const cell = e.currentTarget;
    cell.classList.remove('drag-over', 'drag-invalid');

    if (!dragEntry) return;

    const targetDay = cell.dataset.day;
    const targetSlot = parseInt(cell.dataset.slot);

    if (targetDay === dragOriginDay && targetSlot === dragOriginSlot) return; // same spot

    const timetable = Store.getTimetable();
    if (!timetable) return;

    // Remove the entry from its current day
    const snapshot = removeTempEntry(timetable, dragEntry.id);
    const rooms = Store.rooms.getAll();
    const slots = Store.computeTimeSlots();

    const result = Constraints.canPlace(dragEntry, targetDay, targetSlot, snapshot, slots, rooms);
    if (!result.ok) {
      App.toast(`Cannot place here: ${result.reason}`, 'error');
      return;
    }

    // Commit the move
    const updated = { ...dragEntry, day: targetDay, slotIdx: targetSlot, roomId: result.roomId, roomName: rooms.find(r => r.id === result.roomId)?.name || dragEntry.roomName };
    snapshot[targetDay] = snapshot[targetDay] || [];
    snapshot[targetDay].push(updated);

    // Re-validate and save
    const conflicts = Constraints.validateTimetable(snapshot);
    Store.saveTimetable(snapshot);
    Store.saveConflicts(conflicts);

    App.toast(`Moved to ${targetDay} ${slots[targetSlot]?.start}`, 'success');

    // Re-render the current view
    const activeNav = document.querySelector('.nav-item.active')?.dataset.page;
    if (activeNav) App.navigate(activeNav);
  }

  /* Temp remove an entry by id — returns modified copy */
  function removeTempEntry(timetable, entryId) {
    const copy = {};
    for (const day of Object.keys(timetable)) {
      copy[day] = timetable[day].filter(e => e.id !== entryId);
    }
    return copy;
  }

  function restoreTempEntry(timetable, entry, day, slotIdx) {
    if (!timetable[day]) timetable[day] = [];
    timetable[day].push({ ...entry, slotIdx });
  }

  return { initGrid };
})();
