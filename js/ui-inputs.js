/* ==================================================
   UI-INPUTS.JS — Input Configuration panel
   ================================================== */

const UIInputs = (() => {

  function render() {
    const page = document.getElementById('page-inputs');
    page.innerHTML = `
      <div class="page-header">
        <div>
          <h1>Input Configuration</h1>
          <p>Define courses, sections, faculty, rooms, and institutional settings.</p>
        </div>
      </div>

      <div class="tabs" id="inputTabs">
        <button class="tab active" data-tab="tab-courses">Courses</button>
        <button class="tab" data-tab="tab-sections">Sections</button>
        <button class="tab" data-tab="tab-faculty">Faculty</button>
        <button class="tab" data-tab="tab-rooms">Rooms</button>
        <button class="tab" data-tab="tab-labtypes">Lab Types</button>
        <button class="tab" data-tab="tab-combined">Combined Classes</button>
        <button class="tab" data-tab="tab-settings">Settings</button>
      </div>

      <!-- COURSES -->
      <div class="tab-content active" id="tab-courses">
        <div class="card" style="margin-bottom:var(--sp-md)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-md)">
            <h3 class="card-title" style="margin-bottom:0">Courses</h3>
            <button class="btn btn-primary btn-sm" id="btnAddCourse">
              <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path d="M12 5v14M5 12h14"/></svg>
              Add Course
            </button>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Code</th><th>Theory Hrs</th><th>Lab Hrs</th><th>Lab Type</th><th>Theory Periods</th><th>Lab Periods</th><th>Actions</th></tr></thead>
              <tbody id="coursesTableBody"></tbody>
            </table>
          </div>
          <div class="empty-state hidden" id="coursesEmpty">
            <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            <p>No courses added yet. Click "Add Course" to begin.</p>
          </div>
        </div>
      </div>

      <!-- SECTIONS -->
      <div class="tab-content" id="tab-sections">
        <div class="card" style="margin-bottom:var(--sp-md)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-md)">
            <h3 class="card-title" style="margin-bottom:0">Sections</h3>
            <button class="btn btn-primary btn-sm" id="btnAddSection">
              <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path d="M12 5v14M5 12h14"/></svg>
              Add Section
            </button>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Semester</th><th>Students</th><th>Actions</th></tr></thead>
              <tbody id="sectionsTableBody"></tbody>
            </table>
          </div>
          <div class="empty-state hidden" id="sectionsEmpty">
            <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            <p>No sections added yet.</p>
          </div>
        </div>
      </div>

      <!-- FACULTY -->
      <div class="tab-content" id="tab-faculty">
        <div class="card" style="margin-bottom:var(--sp-md)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-md)">
            <h3 class="card-title" style="margin-bottom:0">Faculty Mapping</h3>
            <button class="btn btn-primary btn-sm" id="btnAddFaculty">
              <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path d="M12 5v14M5 12h14"/></svg>
              Add Faculty
            </button>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Course</th><th>Role</th><th>Type</th><th>Sections</th><th>Actions</th></tr></thead>
              <tbody id="facultyTableBody"></tbody>
            </table>
          </div>
          <div class="empty-state hidden" id="facultyEmpty">
            <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            <p>No faculty mapped yet.</p>
          </div>
        </div>
      </div>

      <!-- ROOMS -->
      <div class="tab-content" id="tab-rooms">
        <div class="card" style="margin-bottom:var(--sp-md)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-md)">
            <h3 class="card-title" style="margin-bottom:0">Rooms</h3>
            <button class="btn btn-primary btn-sm" id="btnAddRoom">
              <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path d="M12 5v14M5 12h14"/></svg>
              Add Room
            </button>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Capacity</th><th>Type</th><th>Lab Type</th><th>Actions</th></tr></thead>
              <tbody id="roomsTableBody"></tbody>
            </table>
          </div>
          <div class="empty-state hidden" id="roomsEmpty">
            <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            <p>No rooms added yet.</p>
          </div>
        </div>
      </div>

      <!-- LAB TYPES -->
      <div class="tab-content" id="tab-labtypes">
        <div class="card" style="margin-bottom:var(--sp-md)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-md)">
            <h3 class="card-title" style="margin-bottom:0">Lab Types</h3>
            <button class="btn btn-primary btn-sm" id="btnAddLabType">
              <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path d="M12 5v14M5 12h14"/></svg>
              Add Lab Type
            </button>
          </div>
          <p style="font-size:13px;color:#605E5C;margin-bottom:var(--sp-md)">Define lab categories (e.g. Computer Lab, Physics Lab). Assign a type to each lab room and each course, so the scheduler places labs only in matching rooms.</p>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Rooms</th><th>Courses</th><th>Actions</th></tr></thead>
              <tbody id="labTypesTableBody"></tbody>
            </table>
          </div>
          <div class="empty-state hidden" id="labTypesEmpty">
            <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            <p>No lab types defined yet. Click "Add Lab Type" to begin.</p>
          </div>
        </div>
      </div>

      <!-- COMBINED CLASSES -->
      <div class="tab-content" id="tab-combined">
        <div class="card" style="margin-bottom:var(--sp-md)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-md)">
            <h3 class="card-title" style="margin-bottom:0">Combined Classes</h3>
            <button class="btn btn-primary btn-sm" id="btnAddCombined">
              <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="14" height="14"><path d="M12 5v14M5 12h14"/></svg>
              Add Combined Class
            </button>
          </div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Sections</th><th>Actions</th></tr></thead>
              <tbody id="combinedTableBody"></tbody>
            </table>
          </div>
          <div class="empty-state hidden" id="combinedEmpty">
            <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            <p>No combined classes defined.</p>
          </div>
        </div>
      </div>

      <!-- SETTINGS -->
      <div class="tab-content" id="tab-settings">
        <div class="card" style="max-width:600px">
          <h3 class="card-title">Institutional Settings</h3>
          <form id="settingsForm">
            <div class="form-row">
              <div class="form-group">
                <label>Start Time</label>
                <input type="time" class="form-control" id="settStartTime" />
              </div>
              <div class="form-group">
                <label>End Time</label>
                <input type="time" class="form-control" id="settEndTime" />
              </div>
              <div class="form-group">
                <label>Period Duration (min)</label>
                <input type="number" class="form-control" id="settPeriodDuration" min="30" max="120" step="5" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Lunch Start</label>
                <input type="time" class="form-control" id="settLunchStart" />
              </div>
              <div class="form-group">
                <label>Lunch End</label>
                <input type="time" class="form-control" id="settLunchEnd" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Teacher Daily Limit (Hours)</label>
                <input type="number" class="form-control" id="settTeachD" min="1" max="12" />
              </div>
              <div class="form-group">
                <label>Teacher Weekly Limit (Hours)</label>
                <input type="number" class="form-control" id="settTeachW" min="1" max="40" />
              </div>
              <div class="form-group">
                <label>Max Labs / Section / Day</label>
                <input type="number" class="form-control" id="settMaxLabs" min="1" max="5" />
              </div>
            </div>
            <div class="form-group">
              <label>Working Days</label>
              <div id="settDays" style="display:flex;gap:var(--sp-md);flex-wrap:wrap;margin-top:var(--sp-xs)"></div>
            </div>
            <button type="submit" class="btn btn-primary" style="margin-top:var(--sp-md)">Save Settings</button>
          </form>
        </div>
      </div>
    `;

    initTabs();
    loadCourses();
    loadSections();
    loadFaculty();
    loadRooms();
    loadLabTypes();
    loadCombined();
    loadSettings();
    bindAdd();
  }

  /* ---- TABS ---- */
  function initTabs() {
    document.querySelectorAll('#inputTabs .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#inputTabs .tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('#page-inputs .tab-content').forEach(tc => tc.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
      });
    });
  }

  /* ---- COURSES ---- */
  function loadCourses() {
    const items = Store.courses.getAll();
    const tbody = document.getElementById('coursesTableBody');
    const empty = document.getElementById('coursesEmpty');
    if (items.length === 0) {
      tbody.parentElement.parentElement.classList.add('hidden');
      empty.classList.remove('hidden');
      return;
    }
    tbody.parentElement.parentElement.classList.remove('hidden');
    empty.classList.add('hidden');
    tbody.innerHTML = items.map(c => {
      const labType = c.labTypeId ? Store.labTypes.get(c.labTypeId) : null;
      return `
      <tr>
        <td>${esc(c.name)}</td>
        <td><span class="badge badge-primary">${esc(c.code)}</span></td>
        <td>${c.theoryHours}</td>
        <td>${c.labHours}</td>
        <td>${labType ? `<span class="badge badge-warning">${esc(labType.name)}</span>` : '<span style="color:#8A8886">—</span>'}</td>
        <td>${c.theoryPeriods || 1}</td>
        <td>${c.labPeriods || 2}</td>
        <td>
          <div class="btn-group">
            <button class="btn-icon" data-tooltip="Edit" onclick="UIInputs.editCourse('${c.id}')">✏️</button>
            <button class="btn-icon" data-tooltip="Delete" onclick="UIInputs.deleteCourse('${c.id}')">🗑️</button>
          </div>
        </td>
      </tr>
    `}).join('');
  }

  function editCourse(id) {
    const course = Store.courses.get(id) || { name: '', code: '', theoryHours: 3, labHours: 0, theoryPeriods: 1, labPeriods: 2, labTypeId: '' };
    const isNew = !id;
    const labTypes = Store.labTypes.getAll();
    App.modal(`${isNew ? 'Add' : 'Edit'} Course`, `
      <div class="form-group">
        <label>Course Name</label>
        <input class="form-control" id="mCourseName" value="${esc(course.name)}" placeholder="e.g. Data Structures" />
      </div>
      <div class="form-group">
        <label>Course Code</label>
        <input class="form-control" id="mCourseCode" value="${esc(course.code)}" placeholder="e.g. CS301" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Theory Sessions/Week</label>
          <input type="number" class="form-control" id="mTheoryHours" value="${course.theoryHours}" min="0" max="20" />
          <span class="hint">Number of theory sessions per week</span>
        </div>
        <div class="form-group">
          <label>Lab Sessions/Week</label>
          <input type="number" class="form-control" id="mLabHours" value="${course.labHours}" min="0" max="20" />
          <span class="hint">Number of lab sessions per week</span>
        </div>
      </div>
      <div class="form-group" id="mCourseLabTypeGroup" style="${course.labHours > 0 ? '' : 'display:none'}">
        <label>Required Lab Type</label>
        <select class="form-control" id="mCourseLabType">
          <option value="">— No specific lab type —</option>
          ${labTypes.map(lt => `<option value="${lt.id}" ${lt.id === course.labTypeId ? 'selected' : ''}>${esc(lt.name)}</option>`).join('')}
        </select>
        <span class="hint">Which type of lab room this course requires (e.g. Physics Lab → Physics Lab rooms only)</span>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Theory Period Length</label>
          <input type="number" class="form-control" id="mTheoryPeriods" value="${course.theoryPeriods || 1}" min="1" max="4" />
          <span class="hint">Consecutive periods per theory session (default: 1)</span>
        </div>
        <div class="form-group">
          <label>Lab Period Length</label>
          <input type="number" class="form-control" id="mLabPeriods" value="${course.labPeriods || 2}" min="1" max="4" />
          <span class="hint">Consecutive periods per lab session (default: 2)</span>
        </div>
      </div>
    `, () => {
      const data = {
        name: document.getElementById('mCourseName').value.trim(),
        code: document.getElementById('mCourseCode').value.trim(),
        theoryHours: parseInt(document.getElementById('mTheoryHours').value) || 0,
        labHours: parseInt(document.getElementById('mLabHours').value) || 0,
        labTypeId: document.getElementById('mCourseLabType').value || '',
        theoryPeriods: parseInt(document.getElementById('mTheoryPeriods').value) || 1,
        labPeriods: parseInt(document.getElementById('mLabPeriods').value) || 2,
      };
      if (!data.name) { App.toast('Course name is required.', 'error'); return false; }
      if (data.labHours > 0 && !data.labTypeId) { App.toast('Please select a lab type for this course.', 'error'); return false; }
      if (isNew) Store.courses.add(data);
      else Store.courses.update(id, data);
      loadCourses();
      App.toast(`Course ${isNew ? 'added' : 'updated'}.`, 'success');
    });
    // Show/hide lab type selector based on lab hours
    setTimeout(() => {
      const labHoursInput = document.getElementById('mLabHours');
      if (labHoursInput) labHoursInput.addEventListener('input', () => {
        const val = parseInt(labHoursInput.value) || 0;
        document.getElementById('mCourseLabTypeGroup').style.display = val > 0 ? '' : 'none';
      });
    }, 50);
  }

  function deleteCourse(id) {
    if (confirm('Delete this course?')) {
      Store.courses.remove(id);
      loadCourses();
      App.toast('Course deleted.', 'info');
    }
  }

  /* ---- SECTIONS ---- */
  function loadSections() {
    const items = Store.sections.getAll();
    const tbody = document.getElementById('sectionsTableBody');
    const empty = document.getElementById('sectionsEmpty');
    if (items.length === 0) { tbody.parentElement.parentElement.classList.add('hidden'); empty.classList.remove('hidden'); return; }
    tbody.parentElement.parentElement.classList.remove('hidden'); empty.classList.add('hidden');
    tbody.innerHTML = items.map(s => `
      <tr>
        <td>${esc(s.name)}</td>
        <td><span class="badge badge-info">${esc(s.semester)}</span></td>
        <td>${s.studentCount}</td>
        <td>
          <div class="btn-group">
            <button class="btn-icon" onclick="UIInputs.editSection('${s.id}')">✏️</button>
            <button class="btn-icon" onclick="UIInputs.deleteSection('${s.id}')">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function editSection(id) {
    const sec = Store.sections.get(id) || { name: '', semester: '', studentCount: 60 };
    const isNew = !id;
    App.modal(`${isNew ? 'Add' : 'Edit'} Section`, `
      <div class="form-group">
        <label>Section Name</label>
        <input class="form-control" id="mSecName" value="${esc(sec.name)}" placeholder="e.g. CS-A" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Semester</label>
          <input class="form-control" id="mSecSemester" value="${esc(sec.semester)}" placeholder="e.g. Sem 5" />
        </div>
        <div class="form-group">
          <label>Number of Students</label>
          <input type="number" class="form-control" id="mSecStudents" value="${sec.studentCount}" min="1" />
        </div>
      </div>
    `, () => {
      const data = {
        name: document.getElementById('mSecName').value.trim(),
        semester: document.getElementById('mSecSemester').value.trim(),
        studentCount: parseInt(document.getElementById('mSecStudents').value) || 1,
      };
      if (!data.name) { App.toast('Section name is required.', 'error'); return false; }
      if (isNew) Store.sections.add(data);
      else Store.sections.update(id, data);
      loadSections();
      App.toast(`Section ${isNew ? 'added' : 'updated'}.`, 'success');
    });
  }

  function deleteSection(id) {
    if (confirm('Delete this section?')) { Store.sections.remove(id); loadSections(); App.toast('Section deleted.', 'info'); }
  }

  /* ---- FACULTY ---- */
  function loadFaculty() {
    const items = Store.faculty.getAll();
    const tbody = document.getElementById('facultyTableBody');
    const empty = document.getElementById('facultyEmpty');
    if (items.length === 0) { tbody.parentElement.parentElement.classList.add('hidden'); empty.classList.remove('hidden'); return; }
    tbody.parentElement.parentElement.classList.remove('hidden'); empty.classList.add('hidden');
    tbody.innerHTML = items.map(f => {
      const course = Store.courses.get(f.courseId);
      let secNames = '';
      if (f.isCombined) {
        const combo = Store.combined.get(f.combinedId);
        secNames = combo ? combo.sectionIds.map(sid => Store.sections.get(sid)?.name || sid).join(', ') : 'Combined';
      } else {
        secNames = (f.sectionIds || []).map(sid => Store.sections.get(sid)?.name || sid).join(', ');
      }
      return `
        <tr>
          <td>${esc(f.name)}</td>
          <td>${course ? esc(course.name) : '—'}</td>
          <td><span class="badge ${f.isTA ? 'badge-warning' : 'badge-primary'}">${f.isTA ? '🎓 TA' : '👨‍🏫 Faculty'}</span></td>
          <td><span class="badge ${f.isCombined ? 'badge-warning' : 'badge-success'}">${f.isCombined ? 'Combined' : 'Individual'}</span></td>
          <td>${esc(secNames)}</td>
          <td>
            <div class="btn-group">
              <button class="btn-icon" onclick="UIInputs.editFaculty('${f.id}')">✏️</button>
              <button class="btn-icon" onclick="UIInputs.deleteFaculty('${f.id}')">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function editFaculty(id) {
    const fac = Store.faculty.get(id) || { name: '', courseId: '', isCombined: false, sectionIds: [], combinedId: '', isTA: false };
    const isNew = !id;
    const courses = Store.courses.getAll();
    const sections = Store.sections.getAll();
    const combinedList = Store.combined.getAll();

    App.modal(`${isNew ? 'Add' : 'Edit'} Faculty Mapping`, `
      <div class="form-group">
        <label>Faculty Name</label>
        <input class="form-control" id="mFacName" value="${esc(fac.name)}" placeholder="e.g. Dr. Smith" />
      </div>
      <div class="form-group">
        <label>Role</label>
        <div style="display:flex;gap:var(--sp-md);margin-top:var(--sp-xs)">
          <label class="checkbox-label">
            <input type="radio" name="mFacRole" id="mFacRoleTeacher" value="teacher" ${!fac.isTA ? 'checked' : ''} />
            👨‍🏫 Teacher / Faculty
          </label>
          <label class="checkbox-label">
            <input type="radio" name="mFacRole" id="mFacRoleTA" value="ta" ${fac.isTA ? 'checked' : ''} />
            🎓 Teaching Assistant (TA)
          </label>
        </div>
      </div>
      <div class="form-group">
        <label>Course</label>
        <select class="form-control" id="mFacCourse">
          <option value="">Select course…</option>
          ${courses.map(c => `<option value="${c.id}" ${c.id === fac.courseId ? 'selected' : ''}>${esc(c.name)} (${esc(c.code)})</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" id="mFacCombined" ${fac.isCombined ? 'checked' : ''} />
          This is a combined-section assignment
        </label>
      </div>
      <div class="form-group" id="mFacCombinedGroup" style="${fac.isCombined ? '' : 'display:none'}">
        <label>Combined Class</label>
        <select class="form-control" id="mFacCombinedId">
          <option value="">Select combined class…</option>
          ${combinedList.map(c => `<option value="${c.id}" ${c.id === fac.combinedId ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group" id="mFacSectionsGroup" style="${fac.isCombined ? 'display:none' : ''}">
        <label>Sections</label>
        <div style="display:flex;flex-direction:column;gap:var(--sp-xs);margin-top:var(--sp-xs)">
          ${sections.map(s => `
            <label class="checkbox-label">
              <input type="checkbox" value="${s.id}" class="mFacSecCheck" ${fac.sectionIds.includes(s.id) ? 'checked' : ''} />
              ${esc(s.name)}
            </label>
          `).join('')}
        </div>
      </div>
    `, () => {
      const data = {
        name: document.getElementById('mFacName').value.trim(),
        courseId: document.getElementById('mFacCourse').value,
        isCombined: document.getElementById('mFacCombined').checked,
        combinedId: document.getElementById('mFacCombinedId').value,
        sectionIds: [...document.querySelectorAll('.mFacSecCheck:checked')].map(cb => cb.value),
        isTA: document.getElementById('mFacRoleTA').checked,
      };
      if (!data.name) { App.toast('Faculty name is required.', 'error'); return false; }
      if (!data.courseId) { App.toast('Please select a course.', 'error'); return false; }
      if (isNew) Store.faculty.add(data);
      else Store.faculty.update(id, data);
      loadFaculty();
      App.toast(`${data.isTA ? 'TA' : 'Faculty'} mapping ${isNew ? 'added' : 'updated'}.`, 'success');
    });

    // Toggle combined/individual sections
    setTimeout(() => {
      const cb = document.getElementById('mFacCombined');
      if (cb) cb.addEventListener('change', () => {
        document.getElementById('mFacCombinedGroup').style.display = cb.checked ? '' : 'none';
        document.getElementById('mFacSectionsGroup').style.display = cb.checked ? 'none' : '';
      });
    }, 50);
  }

  function deleteFaculty(id) {
    if (confirm('Delete this faculty mapping?')) { Store.faculty.remove(id); loadFaculty(); App.toast('Faculty mapping deleted.', 'info'); }
  }

  /* ---- ROOMS ---- */
  function loadRooms() {
    const items = Store.rooms.getAll();
    const tbody = document.getElementById('roomsTableBody');
    const empty = document.getElementById('roomsEmpty');
    if (items.length === 0) { tbody.parentElement.parentElement.classList.add('hidden'); empty.classList.remove('hidden'); return; }
    tbody.parentElement.parentElement.classList.remove('hidden'); empty.classList.add('hidden');
    tbody.innerHTML = items.map(r => {
      const labType = r.labTypeId ? Store.labTypes.get(r.labTypeId) : null;
      return `
      <tr>
        <td>${esc(r.name)}</td>
        <td>${r.capacity}</td>
        <td><span class="badge ${r.isLab ? 'badge-warning' : 'badge-success'}">${r.isLab ? 'Lab' : 'Classroom'}</span></td>
        <td>${r.isLab && labType ? `<span class="badge badge-info">${esc(labType.name)}</span>` : '<span style="color:#8A8886">—</span>'}</td>
        <td>
          <div class="btn-group">
            <button class="btn-icon" onclick="UIInputs.editRoom('${r.id}')">✏️</button>
            <button class="btn-icon" onclick="UIInputs.deleteRoom('${r.id}')">🗑️</button>
          </div>
        </td>
      </tr>
    `}).join('');
  }

  function editRoom(id) {
    const room = Store.rooms.get(id) || { name: '', capacity: 60, isLab: false, labTypeId: '' };
    const isNew = !id;
    const labTypes = Store.labTypes.getAll();
    App.modal(`${isNew ? 'Add' : 'Edit'} Room`, `
      <div class="form-group">
        <label>Room Name</label>
        <input class="form-control" id="mRoomName" value="${esc(room.name)}" placeholder="e.g. Room 101" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Capacity</label>
          <input type="number" class="form-control" id="mRoomCap" value="${room.capacity}" min="1" />
        </div>
        <div class="form-group" style="display:flex;align-items:end">
          <label class="checkbox-label">
            <input type="checkbox" id="mRoomIsLab" ${room.isLab ? 'checked' : ''} />
            This is a Lab room
          </label>
        </div>
      </div>
      <div class="form-group" id="mRoomLabTypeGroup" style="${room.isLab ? '' : 'display:none'}">
        <label>Lab Type</label>
        <select class="form-control" id="mRoomLabType">
          <option value="">— Select lab type —</option>
          ${labTypes.map(lt => `<option value="${lt.id}" ${lt.id === room.labTypeId ? 'selected' : ''}>${esc(lt.name)}</option>`).join('')}
        </select>
        <span class="hint">What type of lab is this room? (must match course's required lab type)</span>
      </div>
    `, () => {
      const data = {
        name: document.getElementById('mRoomName').value.trim(),
        capacity: parseInt(document.getElementById('mRoomCap').value) || 1,
        isLab: document.getElementById('mRoomIsLab').checked,
        labTypeId: document.getElementById('mRoomIsLab').checked ? document.getElementById('mRoomLabType').value : '',
      };
      if (!data.name) { App.toast('Room name is required.', 'error'); return false; }
      if (data.isLab && !data.labTypeId) { App.toast('Please select a lab type for this lab room.', 'error'); return false; }
      if (isNew) Store.rooms.add(data);
      else Store.rooms.update(id, data);
      loadRooms();
      App.toast(`Room ${isNew ? 'added' : 'updated'}.`, 'success');
    });
    // Show/hide lab type selector
    setTimeout(() => {
      const cb = document.getElementById('mRoomIsLab');
      if (cb) cb.addEventListener('change', () => {
        document.getElementById('mRoomLabTypeGroup').style.display = cb.checked ? '' : 'none';
      });
    }, 50);
  }

  function deleteRoom(id) {
    if (confirm('Delete this room?')) { Store.rooms.remove(id); loadRooms(); App.toast('Room deleted.', 'info'); }
  }

  /* ---- COMBINED ---- */
  function loadCombined() {
    const items = Store.combined.getAll();
    const tbody = document.getElementById('combinedTableBody');
    const empty = document.getElementById('combinedEmpty');
    if (items.length === 0) { tbody.parentElement.parentElement.classList.add('hidden'); empty.classList.remove('hidden'); return; }
    tbody.parentElement.parentElement.classList.remove('hidden'); empty.classList.add('hidden');
    tbody.innerHTML = items.map(c => {
      const secNames = (c.sectionIds || []).map(sid => Store.sections.get(sid)?.name || sid).join(', ');
      return `
        <tr>
          <td>${esc(c.name)}</td>
          <td>${esc(secNames)}</td>
          <td>
            <div class="btn-group">
              <button class="btn-icon" onclick="UIInputs.editCombined('${c.id}')">✏️</button>
              <button class="btn-icon" onclick="UIInputs.deleteCombined('${c.id}')">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function editCombined(id) {
    const combo = Store.combined.get(id) || { name: '', sectionIds: [] };
    const isNew = !id;
    const sections = Store.sections.getAll();
    App.modal(`${isNew ? 'Add' : 'Edit'} Combined Class`, `
      <div class="form-group">
        <label>Group Name</label>
        <input class="form-control" id="mComboName" value="${esc(combo.name)}" placeholder="e.g. CS-A+B Combined" />
      </div>
      <div class="form-group">
        <label>Select Sections to Merge</label>
        <div style="display:flex;flex-direction:column;gap:var(--sp-xs);margin-top:var(--sp-xs)">
          ${sections.map(s => `
            <label class="checkbox-label">
              <input type="checkbox" value="${s.id}" class="mComboSecCheck" ${combo.sectionIds.includes(s.id) ? 'checked' : ''} />
              ${esc(s.name)} (${s.studentCount} students)
            </label>
          `).join('')}
        </div>
      </div>
    `, () => {
      const data = {
        name: document.getElementById('mComboName').value.trim(),
        sectionIds: [...document.querySelectorAll('.mComboSecCheck:checked')].map(cb => cb.value),
      };
      if (!data.name) { App.toast('Group name is required.', 'error'); return false; }
      if (data.sectionIds.length < 2) { App.toast('Select at least 2 sections to combine.', 'error'); return false; }
      if (isNew) Store.combined.add(data);
      else Store.combined.update(id, data);
      loadCombined();
      App.toast(`Combined class ${isNew ? 'added' : 'updated'}.`, 'success');
    });
  }

  function deleteCombined(id) {
    if (confirm('Delete this combined class?')) { Store.combined.remove(id); loadCombined(); App.toast('Combined class deleted.', 'info'); }
  }

  /* ---- SETTINGS ---- */
  function loadSettings() {
    const s = Store.getSettings();
    document.getElementById('settStartTime').value = s.startTime;
    document.getElementById('settEndTime').value = s.endTime;
    document.getElementById('settPeriodDuration').value = s.periodDuration;
    document.getElementById('settLunchStart').value = s.lunchStart || '13:30';
    document.getElementById('settLunchEnd').value = s.lunchEnd || '14:30';
    document.getElementById('settTeachD').value = s.teacherMaxHoursD || 6;
    document.getElementById('settTeachW').value = s.teacherMaxHoursW || 25;
    document.getElementById('settMaxLabs').value = s.maxLabsPerDay || 2;

    const allDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const container = document.getElementById('settDays');
    container.innerHTML = allDays.map(d => `
      <label class="checkbox-label">
        <input type="checkbox" value="${d}" class="settDayCheck" ${s.daysOfWeek.includes(d) ? 'checked' : ''} />
        ${d}
      </label>
    `).join('');

    document.getElementById('settingsForm').addEventListener('submit', e => {
      e.preventDefault();
      Store.saveSettings({
        startTime: document.getElementById('settStartTime').value,
        endTime: document.getElementById('settEndTime').value,
        periodDuration: parseInt(document.getElementById('settPeriodDuration').value) || 60,
        lunchStart: document.getElementById('settLunchStart').value,
        lunchEnd: document.getElementById('settLunchEnd').value,
        teacherMaxHoursD: parseInt(document.getElementById('settTeachD').value) || 6,
        teacherMaxHoursW: parseInt(document.getElementById('settTeachW').value) || 25,
        maxLabsPerDay: parseInt(document.getElementById('settMaxLabs').value) || 2,
        daysOfWeek: [...document.querySelectorAll('.settDayCheck:checked')].map(cb => cb.value),
      });
      App.toast('Settings saved.', 'success');
    });
  }

  /* ---- BIND ADD BUTTONS ---- */
  function bindAdd() {
    document.getElementById('btnAddCourse').addEventListener('click', () => editCourse(null));
    document.getElementById('btnAddSection').addEventListener('click', () => editSection(null));
    document.getElementById('btnAddFaculty').addEventListener('click', () => editFaculty(null));
    document.getElementById('btnAddRoom').addEventListener('click', () => editRoom(null));
    document.getElementById('btnAddLabType').addEventListener('click', () => editLabType(null));
    document.getElementById('btnAddCombined').addEventListener('click', () => editCombined(null));
  }

  /* ---- LAB TYPES ---- */
  function loadLabTypes() {
    const items = Store.labTypes.getAll();
    const tbody = document.getElementById('labTypesTableBody');
    const empty = document.getElementById('labTypesEmpty');
    if (items.length === 0) { tbody.parentElement.parentElement.classList.add('hidden'); empty.classList.remove('hidden'); return; }
    tbody.parentElement.parentElement.classList.remove('hidden'); empty.classList.add('hidden');
    tbody.innerHTML = items.map(lt => {
      const rooms = Store.rooms.getAll().filter(r => r.labTypeId === lt.id);
      const courses = Store.courses.getAll().filter(c => c.labTypeId === lt.id);
      return `
        <tr>
          <td><span class="badge badge-warning">${esc(lt.name)}</span></td>
          <td>${rooms.length > 0 ? rooms.map(r => esc(r.name)).join(', ') : '<span style="color:#8A8886">None</span>'}</td>
          <td>${courses.length > 0 ? courses.map(c => `${esc(c.name)} (${esc(c.code)})`).join(', ') : '<span style="color:#8A8886">None</span>'}</td>
          <td>
            <div class="btn-group">
              <button class="btn-icon" onclick="UIInputs.editLabType('${lt.id}')">✏️</button>
              <button class="btn-icon" onclick="UIInputs.deleteLabType('${lt.id}')">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function editLabType(id) {
    const lt = Store.labTypes.get(id) || { name: '' };
    const isNew = !id;
    App.modal(`${isNew ? 'Add' : 'Edit'} Lab Type`, `
      <div class="form-group">
        <label>Lab Type Name</label>
        <input class="form-control" id="mLabTypeName" value="${esc(lt.name)}" placeholder="e.g. Computer Lab, Physics Lab" />
      </div>
      <p style="font-size:12px;color:#605E5C;margin-top:var(--sp-sm)">Lab types categorize lab rooms. Courses with lab hours must specify which lab type they require, ensuring they're scheduled only in matching lab rooms.</p>
    `, () => {
      const data = { name: document.getElementById('mLabTypeName').value.trim() };
      if (!data.name) { App.toast('Lab type name is required.', 'error'); return false; }
      if (isNew) Store.labTypes.add(data);
      else Store.labTypes.update(id, data);
      loadLabTypes();
      App.toast(`Lab type ${isNew ? 'added' : 'updated'}.`, 'success');
    });
  }

  function deleteLabType(id) {
    // Check if any rooms or courses reference this lab type
    const rooms = Store.rooms.getAll().filter(r => r.labTypeId === id);
    const courses = Store.courses.getAll().filter(c => c.labTypeId === id);
    if (rooms.length > 0 || courses.length > 0) {
      App.toast(`Cannot delete: ${rooms.length} room(s) and ${courses.length} course(s) use this lab type. Remove references first.`, 'error');
      return;
    }
    if (confirm('Delete this lab type?')) {
      Store.labTypes.remove(id);
      loadLabTypes();
      App.toast('Lab type deleted.', 'info');
    }
  }

  /* ---- util ---- */
  function esc(str) { return String(str || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  return {
    render,
    editCourse, deleteCourse,
    editSection, deleteSection,
    editFaculty, deleteFaculty,
    editRoom, deleteRoom,
    editLabType, deleteLabType,
    editCombined, deleteCombined,
  };
})();
