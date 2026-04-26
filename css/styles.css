/* ==================================================
   STYLES.CSS — ScheduleAI — Clean Modern Redesign
   ================================================== */

/* ─── RESET ─── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ─── FONT ─── */
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');

/* ─── DESIGN TOKENS ─── */
:root {
  --indigo-900: #1a1b3a; --indigo-800: #252660; --indigo-700: #3134a0;
  --indigo-600: #4448c5; --indigo-500: #5b5fe0; --indigo-400: #7b7ee8;
  --indigo-300: #a5a7f0; --indigo-100: #ecedf9; --indigo-50: #f5f5fd;

  --gray-950: #0d0e1a; --gray-900: #111224; --gray-800: #1c1d32;
  --gray-700: #2a2b42; --gray-600: #3d3f5c; --gray-500: #5a5c7a;
  --gray-400: #7e809e; --gray-300: #a8a9be; --gray-200: #d0d1e0;
  --gray-100: #ecedf3; --gray-50:  #f7f7fb;

  --bg: var(--gray-50); --surface: #ffffff; --surface-2: var(--gray-50);
  --sidebar-bg: var(--gray-900); --sidebar-text: var(--gray-300);
  --text: var(--gray-900); --text-muted: var(--gray-500); --text-faint: var(--gray-400);
  --border: var(--gray-200); --border-strong: var(--gray-300);

  --success: #0f9161; --success-bg: #e6f7f2;
  --warning: #c47d0e; --warning-bg: #fef9ec;
  --danger:  #d63b50; --danger-bg:  #fdeaed;
  --info:    #1a72dc; --info-bg:    #e8f1fc;

  --sp-2:2px; --sp-4:4px; --sp-6:6px; --sp-8:8px; --sp-10:10px;
  --sp-12:12px; --sp-16:16px; --sp-20:20px; --sp-24:24px;
  --sp-32:32px; --sp-40:40px; --sp-48:48px;

  --font: 'DM Sans', system-ui, sans-serif;
  --font-mono: 'DM Mono', monospace;

  --radius-sm: 6px; --radius: 10px; --radius-lg: 16px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,.08),0 1px 2px rgba(0,0,0,.04);
  --shadow:    0 4px 12px rgba(0,0,0,.08),0 1px 3px rgba(0,0,0,.05);
  --shadow-lg: 0 12px 32px rgba(0,0,0,.12),0 4px 8px rgba(0,0,0,.06);
  --shadow-xl: 0 24px 48px rgba(0,0,0,.14),0 8px 16px rgba(0,0,0,.07);

  --s1:#4448c5; --sb1:#ecedfa; --s2:#1a72dc; --sb2:#e5f0fc;
  --s3:#0f9161; --sb3:#e5f5f0; --s4:#c47d0e; --sb4:#fef4e0;
  --s5:#8b48c7; --sb5:#f3ecfa; --s6:#0891b2; --sb6:#e0f4f9;
  --s7:#d63b50; --sb7:#fdeaed; --s8:#0d7b61; --sb8:#e4f3ef;
  --s9:#b55a1e; --sb9:#fdf0e8; --s10:#5a5c7a; --sb10:#ededf3;

  --sidebar-w: 248px;
  --t: .18s ease;
}

html { font-size: 14px; }
body {
  font-family: var(--font);
  color: var(--text); background: var(--bg);
  display: flex; min-height: 100vh;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}

/* ─── SIDEBAR ─── */
.sidebar {
  width: var(--sidebar-w); min-height: 100vh;
  background: var(--sidebar-bg);
  display: flex; flex-direction: column; flex-shrink: 0;
  position: fixed; left:0; top:0; bottom:0; z-index:200;
  overflow-y: auto; border-right: 1px solid rgba(255,255,255,.05);
  scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.1) transparent;
}
.sidebar-brand {
  display:flex; align-items:center; gap:var(--sp-12);
  padding: var(--sp-20) var(--sp-16);
  border-bottom: 1px solid rgba(255,255,255,.06); flex-shrink:0;
}
.sidebar-brand-icon {
  width:34px; height:34px;
  background: linear-gradient(135deg, var(--indigo-600), var(--indigo-500));
  border-radius:9px; display:flex; align-items:center; justify-content:center;
  flex-shrink:0; box-shadow:0 4px 12px rgba(91,95,224,.4);
}
.sidebar-brand-icon svg { width:18px; height:18px; }
.sidebar-brand-name { font-size:14px; font-weight:700; color:#fff; letter-spacing:-.01em; line-height:1.2; }
.sidebar-brand-sub  { font-size:10.5px; color:var(--gray-500); }

.sidebar-nav { list-style:none; padding: var(--sp-8) 0; flex:1; }
.nav-section-label {
  font-size:10px; text-transform:uppercase; font-weight:600;
  letter-spacing:.1em; color:var(--gray-600);
  padding: var(--sp-16) var(--sp-16) var(--sp-4);
}
.nav-item {
  display:flex; align-items:center; gap:var(--sp-12);
  padding:9px var(--sp-16); margin:1px var(--sp-8);
  color:var(--sidebar-text); cursor:pointer;
  font-size:13.5px; font-weight:450;
  border-radius:var(--radius-sm);
  transition: background var(--t), color var(--t);
  position:relative;
}
.nav-item svg { width:17px; height:17px; flex-shrink:0; opacity:.7; transition:opacity var(--t); }
.nav-item:hover { background:rgba(255,255,255,.05); color:#e8e9f5; }
.nav-item:hover svg { opacity:1; }
.nav-item.active { background:rgba(91,95,224,.18); color:#fff; font-weight:600; }
.nav-item.active svg { opacity:1; color:var(--indigo-400); }
.nav-item.active::before {
  content:''; position:absolute; left:-8px; top:50%; transform:translateY(-50%);
  width:3px; height:60%; background:var(--indigo-400); border-radius:0 2px 2px 0;
}
.sidebar-footer {
  padding:var(--sp-12) var(--sp-8);
  border-top:1px solid rgba(255,255,255,.06); flex-shrink:0;
}
.user-card {
  display:flex; align-items:center; gap:var(--sp-12);
  padding:var(--sp-8); border-radius:var(--radius-sm);
  transition:background var(--t);
}
.user-card:hover { background:rgba(255,255,255,.04); }
.user-avatar {
  width:32px; height:32px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  font-size:13px; font-weight:700; color:#fff; flex-shrink:0;
}
.user-name { font-size:13px; font-weight:600; color:#e8e9f5; line-height:1.2; }
.user-role { font-size:10.5px; color:var(--gray-500); margin-top:1px; }
.btn-logout {
  margin-left:auto; background:none; border:none;
  color:var(--gray-500); cursor:pointer; padding:var(--sp-4);
  border-radius:var(--radius-sm); display:flex; align-items:center;
  transition:color var(--t), background var(--t); flex-shrink:0;
}
.btn-logout:hover { color:var(--gray-300); background:rgba(255,255,255,.08); }
.btn-logout svg { width:15px; height:15px; }

/* ─── MAIN ─── */
.main-content {
  flex:1; margin-left:var(--sidebar-w);
  padding: var(--sp-32); min-height:100vh; overflow-x:hidden;
}
.page { display:none; }
.page.active { display:block; animation:pageIn .2s ease both; }

/* ─── INPUT TABS ─── */
.tabs { display:flex; gap:4px; border-bottom:2px solid var(--border); margin-bottom:var(--sp-xl); flex-wrap:wrap; }
.tab {
  padding:8px 16px; border:none; background:none; cursor:pointer;
  font-size:13.5px; font-weight:500; color:var(--text-muted);
  border-bottom:2px solid transparent; margin-bottom:-2px;
  border-radius:var(--radius) var(--radius) 0 0;
  transition:color .15s, border-color .15s, background .15s;
}
.tab:hover { color:var(--text-primary); background:var(--gray-100); }
.tab.active { color:var(--indigo-600); border-bottom-color:var(--indigo-500); font-weight:600; }
.tab-content { display:none; }
.tab-content.active { display:block; animation:pageIn .2s ease both; }
@keyframes pageIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }

/* ─── PAGE HEADER ─── */
.page-header {
  display:flex; justify-content:space-between; align-items:flex-start;
  margin-bottom:var(--sp-24); flex-wrap:wrap; gap:var(--sp-16);
}
.page-header h1 {
  font-size:22px; font-weight:700;
  color:var(--text); letter-spacing:-.02em; line-height:1.3;
}
.page-header p { color:var(--text-muted); font-size:13.5px; margin-top:3px; }

/* ─── CARDS ─── */
.card {
  background:var(--surface); border:1px solid var(--border);
  border-radius:var(--radius); padding:var(--sp-20); box-shadow:var(--shadow-sm);
}
.card + .card { margin-top:var(--sp-16); }
.card-title {
  font-size:14px; font-weight:650; color:var(--text);
  display:flex; align-items:center; gap:var(--sp-8); margin-bottom:var(--sp-16);
}
.card-title svg { width:16px; height:16px; color:var(--text-muted); }

/* ─── STATS ─── */
.stats-grid {
  display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr));
  gap:var(--sp-12); margin-bottom:var(--sp-20);
}
.stat-card {
  background:var(--surface); border:1px solid var(--border);
  border-radius:var(--radius); padding:var(--sp-16) var(--sp-20);
  box-shadow:var(--shadow-sm);
  transition:box-shadow var(--t),border-color var(--t);
}
.stat-card:hover { box-shadow:var(--shadow); border-color:var(--indigo-300); }
.stat-label {
  display:block; font-size:11px; font-weight:600;
  text-transform:uppercase; letter-spacing:.08em;
  color:var(--text-muted); margin-bottom:var(--sp-6);
}
.stat-value {
  display:block; font-size:28px; font-weight:700;
  color:var(--text); line-height:1; letter-spacing:-.02em;
}
.stat-value.success { color:var(--success); }
.stat-value.danger  { color:var(--danger);  }
.stat-value.info    { color:var(--indigo-600); font-size:1rem; }

/* ─── BUTTONS ─── */
.btn {
  display:inline-flex; align-items:center; gap:7px;
  padding:8px 16px; font-size:13.5px; font-weight:600;
  font-family:var(--font); border:none; border-radius:var(--radius-sm);
  cursor:pointer; transition:background var(--t),box-shadow var(--t),transform .08s;
  line-height:1.4; white-space:nowrap; text-decoration:none;
}
.btn:active { transform:scale(.97); }
.btn svg { width:14px; height:14px; flex-shrink:0; }
.btn-primary {
  background:var(--indigo-600); color:#fff;
  box-shadow:0 2px 8px rgba(68,72,197,.25);
}
.btn-primary:hover { background:var(--indigo-700); box-shadow:0 4px 12px rgba(68,72,197,.35); }
.btn-secondary { background:var(--indigo-50); color:var(--indigo-700); border:1px solid var(--indigo-100); }
.btn-secondary:hover { background:var(--indigo-100); }
.btn-outline { background:var(--surface); color:var(--text); border:1px solid var(--border-strong); }
.btn-outline:hover { background:var(--gray-50); }
.btn-ghost { background:transparent; color:var(--text-muted); }
.btn-ghost:hover { background:var(--gray-100); color:var(--text); }
.btn-danger { background:var(--danger); color:#fff; }
.btn-danger:hover { background:#bf2f43; }
.btn-sm { padding:5px 12px; font-size:12.5px; }
.btn-xs { padding:3px 9px; font-size:11.5px; }
.btn-group { display:flex; gap:var(--sp-8); flex-wrap:wrap; align-items:center; }
.btn-icon {
  background:none; border:none; cursor:pointer; padding:5px;
  display:inline-flex; align-items:center; justify-content:center;
  border-radius:var(--radius-sm); color:var(--text-muted);
  transition:background var(--t),color var(--t);
}
.btn-icon:hover { background:var(--gray-100); color:var(--text); }
.btn-icon.danger:hover { background:var(--danger-bg); color:var(--danger); }
.btn-icon svg { width:15px; height:15px; }

/* ─── FORMS ─── */
.form-group { margin-bottom:var(--sp-16); }
.form-group label {
  display:block; font-size:12.5px; font-weight:600;
  color:var(--text-muted); margin-bottom:var(--sp-6);
}
.form-control {
  width:100%; padding:8px 12px;
  background:var(--surface); border:1.5px solid var(--border);
  border-radius:var(--radius-sm); color:var(--text);
  font-size:13.5px; font-family:var(--font); line-height:1.5;
  transition:border-color var(--t),box-shadow var(--t);
}
.form-control:focus {
  outline:none; border-color:var(--indigo-500);
  box-shadow:0 0 0 3px rgba(91,95,224,.12);
}
.form-control::placeholder { color:var(--text-faint); }
textarea.form-control { resize:vertical; min-height:80px; }
.form-inline { display:flex; gap:var(--sp-8); align-items:flex-end; flex-wrap:wrap; }
.form-inline .form-group { margin-bottom:0; flex:1; min-width:120px; }

/* ─── TABLES ─── */
.table-wrapper { overflow-x:auto; border-radius:var(--radius); border:1px solid var(--border); }
table { width:100%; border-collapse:collapse; font-size:13.5px; }
thead th {
  background:var(--gray-50); color:var(--text-muted);
  font-size:11px; font-weight:700;
  text-transform:uppercase; letter-spacing:.07em;
  padding:10px 14px; text-align:left;
  border-bottom:1px solid var(--border); white-space:nowrap;
}
tbody td {
  padding:11px 14px; border-bottom:1px solid var(--border);
  color:var(--text); vertical-align:middle;
}
tbody tr:last-child td { border-bottom:none; }
tbody tr:hover td { background:var(--indigo-50); }
tbody tr { transition:background var(--t); }

/* ─── BADGES ─── */
.badge {
  display:inline-flex; align-items:center; gap:4px;
  padding:3px 9px; font-size:11px; font-weight:650;
  border-radius:20px; white-space:nowrap;
}
.badge-primary { background:var(--indigo-100); color:var(--indigo-700); }
.badge-success { background:var(--success-bg); color:var(--success); }
.badge-warning { background:var(--warning-bg); color:var(--warning); }
.badge-danger  { background:var(--danger-bg);  color:var(--danger); }
.badge-info    { background:var(--info-bg);    color:var(--info); }
.badge-neutral { background:var(--gray-100);   color:var(--gray-600); }

/* ─── FILTER ROW ─── */
.filter-row {
  display:flex; align-items:center; gap:var(--sp-12);
  margin-bottom:var(--sp-16); flex-wrap:wrap;
}
.filter-row label { font-size:12.5px; font-weight:600; color:var(--text-muted); }

/* ─── TIMETABLE ─── */
.timetable-wrapper {
  overflow-x:auto; border-radius:var(--radius);
  border:1px solid var(--border); background:var(--surface);
  box-shadow:var(--shadow-sm);
}
.timetable-grid { display:grid; min-width:680px; }

.tt-header {
  background:var(--gray-900); color:#e0e1ee;
  font-size:11px; font-weight:600; text-align:center;
  padding:10px 6px; border-right:1px solid rgba(255,255,255,.05);
  border-bottom:1px solid rgba(255,255,255,.04); line-height:1.4;
}
.tt-header:first-child { background:var(--gray-950); }
.tt-header.lunch-h { background:var(--gray-800); color:var(--gray-400); }
.tt-header .time { font-size:12px; font-weight:700; display:block; }
.tt-header .time-end { font-size:10px; font-weight:400; color:var(--gray-500); display:block; margin-top:1px; }

.tt-day-label {
  background:var(--indigo-900); color:#c5c6e8;
  font-size:11px; font-weight:700;
  text-transform:uppercase; letter-spacing:.08em;
  display:flex; align-items:center; justify-content:center;
  padding:8px 6px;
  border-right:1px solid rgba(255,255,255,.05);
  border-bottom:1px solid rgba(255,255,255,.04);
}

.tt-cell {
  border-right:1px solid var(--gray-100);
  border-bottom:1px solid var(--gray-100);
  padding:4px; background:var(--surface); min-height:72px;
  transition:background var(--t);
}
.tt-cell.lunch-slot {
  background:linear-gradient(180deg,var(--gray-50) 0%,#fdf9f3 100%);
  display:flex; align-items:center; justify-content:center;
}
.lunch-text {
  font-size:10px; font-weight:700;
  text-transform:uppercase; letter-spacing:.08em; color:var(--warning); opacity:.6;
}
.tt-block {
  border-radius:7px; padding:7px 9px; height:100%; min-height:64px;
  display:flex; flex-direction:column; gap:2px; cursor:default;
  transition:transform var(--t),box-shadow var(--t); border-left:3px solid; overflow:hidden;
}
.tt-block:hover { transform:scale(1.01); box-shadow:var(--shadow); position:relative; z-index:2; }
.tt-subject { font-size:11.5px; font-weight:700; line-height:1.3; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.tt-detail  { font-size:10px; font-weight:500; display:block; opacity:.75; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.4; }
.tt-lab-tag { font-size:9.5px; font-weight:700; font-family:var(--font-mono); opacity:.6; margin-top:auto; text-transform:uppercase; letter-spacing:.08em; }

.sc-1{background:var(--sb1);color:var(--s1);border-color:var(--s1)}
.sc-2{background:var(--sb2);color:var(--s2);border-color:var(--s2)}
.sc-3{background:var(--sb3);color:var(--s3);border-color:var(--s3)}
.sc-4{background:var(--sb4);color:var(--s4);border-color:var(--s4)}
.sc-5{background:var(--sb5);color:var(--s5);border-color:var(--s5)}
.sc-6{background:var(--sb6);color:var(--s6);border-color:var(--s6)}
.sc-7{background:var(--sb7);color:var(--s7);border-color:var(--s7)}
.sc-8{background:var(--sb8);color:var(--s8);border-color:var(--s8)}
.sc-9{background:var(--sb9);color:var(--s9);border-color:var(--s9)}
.sc-10{background:var(--sb10);color:var(--s10);border-color:var(--s10)}

/* ─── CONFLICTS ─── */
.conflict-list { list-style:none; display:flex; flex-direction:column; gap:var(--sp-8); }
.conflict-item {
  display:flex; align-items:flex-start; gap:var(--sp-10);
  padding:10px 14px; background:var(--warning-bg);
  border:1px solid rgba(196,125,14,.15); border-left:3px solid var(--warning);
  border-radius:var(--radius-sm); font-size:13px; color:var(--warning);
}
.conflict-item svg { width:15px; height:15px; flex-shrink:0; margin-top:1px; }
.conflict-item.error { background:var(--danger-bg); border-color:rgba(214,59,80,.15); border-left-color:var(--danger); color:var(--danger); }

/* ─── EMPTY STATE ─── */
.empty-state {
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  padding:var(--sp-48) var(--sp-24); text-align:center; color:var(--text-muted); gap:var(--sp-12);
}
.empty-state svg { width:40px; height:40px; opacity:.25; }
.empty-state p { font-size:14px; max-width:320px; line-height:1.6; }

/* ─── MODAL ─── */
.modal-overlay {
  position:fixed; inset:0;
  background:rgba(13,14,26,.65); backdrop-filter:blur(4px);
  display:none; align-items:center; justify-content:center;
  z-index:1000; padding:var(--sp-20);
}
.modal-overlay.open { display:flex; animation:overlayIn .15s ease; }
@keyframes overlayIn { from{opacity:0} to{opacity:1} }
.modal {
  background:var(--surface); border-radius:var(--radius-lg);
  box-shadow:var(--shadow-xl); width:100%; max-width:520px;
  max-height:90vh; overflow-y:auto; animation:modalIn .2s ease;
}
@keyframes modalIn { from{opacity:0;transform:translateY(-12px) scale(.97)} to{opacity:1;transform:none} }
.modal-header {
  display:flex; align-items:center; justify-content:space-between;
  padding:var(--sp-20) var(--sp-24); border-bottom:1px solid var(--border);
}
.modal-header h2 { font-size:16px; font-weight:700; letter-spacing:-.01em; }
.modal-close {
  background:none; border:none; cursor:pointer; padding:5px;
  font-size:20px; line-height:1; color:var(--text-muted);
  border-radius:var(--radius-sm); display:flex; align-items:center; justify-content:center;
  width:30px; height:30px; transition:background var(--t),color var(--t);
}
.modal-close:hover { background:var(--gray-100); color:var(--text); }
.modal-body { padding:var(--sp-20) var(--sp-24); }
.modal-footer {
  padding:var(--sp-16) var(--sp-24); border-top:1px solid var(--border);
  display:flex; justify-content:flex-end; gap:var(--sp-8);
}

/* ─── TOAST ─── */
.toast-container { position:fixed; bottom:var(--sp-24); right:var(--sp-24); z-index:2000; display:flex; flex-direction:column; gap:var(--sp-8); }
.toast {
  display:flex; align-items:center; gap:var(--sp-10);
  padding:11px 16px; border-radius:var(--radius);
  background:var(--gray-900); color:#e8e9f5;
  font-size:13.5px; font-weight:500;
  box-shadow:var(--shadow-lg); min-width:240px; max-width:360px;
  animation:toastIn .2s ease; border:1px solid rgba(255,255,255,.08);
}
@keyframes toastIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:none} }
.toast-icon {
  width:22px; height:22px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  flex-shrink:0; font-size:12px; font-weight:700;
}
.toast.success .toast-icon { background:rgba(15,145,97,.2); color:#4cd39a; }
.toast.error   .toast-icon { background:rgba(214,59,80,.2); color:#f07080; }
.toast.info    .toast-icon { background:rgba(91,95,224,.2); color:var(--indigo-400); }
.toast.warning .toast-icon { background:rgba(196,125,14,.2); color:#f0b840; }

/* ─── SPINNER ─── */
.spinner { width:32px; height:32px; border:3px solid var(--border); border-top-color:var(--indigo-500); border-radius:50%; animation:spin .7s linear infinite; margin:0 auto; }
.spinner-sm { width:16px; height:16px; border-width:2px; }
@keyframes spin { to{transform:rotate(360deg)} }

/* ─── NOTIF CARDS ─── */
.notif-card {
  background:var(--surface); border:1px solid var(--border);
  border-radius:var(--radius); padding:var(--sp-16) var(--sp-20);
  box-shadow:var(--shadow-sm); display:flex; gap:var(--sp-16);
  align-items:flex-start; transition:box-shadow var(--t); margin-bottom:var(--sp-12);
}
.notif-card:hover { box-shadow:var(--shadow); }
.notif-dot { width:8px; height:8px; border-radius:50%; background:var(--indigo-500); flex-shrink:0; margin-top:5px; }
.notif-body { flex:1; min-width:0; }
.notif-title { font-size:14px; font-weight:650; margin-bottom:4px; }
.notif-msg { font-size:13px; color:var(--text-muted); line-height:1.5; margin-bottom:8px; }
.notif-meta { display:flex; gap:var(--sp-8); flex-wrap:wrap; align-items:center; }
.notif-time { font-size:11.5px; color:var(--text-faint); }

/* ─── TAGS ─── */
.tag-list { display:flex; flex-wrap:wrap; gap:4px; }
.tag {
  display:inline-flex; align-items:center; gap:4px;
  padding:2px 8px; background:var(--gray-100);
  color:var(--gray-600); border-radius:20px; font-size:11.5px; font-weight:600;
}
.tag-remove {
  background:none; border:none; cursor:pointer; padding:1px;
  color:var(--gray-500); line-height:1; font-size:13px; border-radius:50%;
  transition:background var(--t),color var(--t);
}
.tag-remove:hover { background:var(--gray-300); color:var(--text); }
.lock-item {
  display:inline-flex; align-items:center; gap:6px;
  padding:4px 10px 4px 8px;
  background:var(--danger-bg); color:var(--danger);
  border:1px solid rgba(214,59,80,.2); border-radius:20px;
  font-size:11.5px; font-weight:600;
}
.lock-item button { background:none; border:none; cursor:pointer; padding:0; line-height:1; color:currentColor; font-size:14px; opacity:.6; transition:opacity .15s; }
.lock-item button:hover { opacity:1; }

/* ─── MISC ─── */
.section-heading {
  font-size:13px; font-weight:700; text-transform:uppercase;
  letter-spacing:.08em; color:var(--text-muted);
  margin:var(--sp-24) 0 var(--sp-12);
  padding-bottom:var(--sp-8); border-bottom:1px solid var(--border);
}
.section-heading:first-child { margin-top:0; }
.checkbox-label { display:flex; align-items:center; gap:var(--sp-8); cursor:pointer; font-size:13.5px; user-select:none; }
.checkbox-label input[type="checkbox"] { width:15px; height:15px; accent-color:var(--indigo-600); cursor:pointer; }
.utilization-bar-wrap { background:var(--gray-100); border-radius:20px; height:6px; overflow:hidden; flex:1; }
.utilization-bar { height:100%; border-radius:20px; background:var(--indigo-500); transition:width .4s ease; }
.utilization-bar.high { background:var(--success); }
.utilization-bar.warn { background:var(--warning); }
.utilization-bar.low  { background:var(--gray-300); }
.gen-progress {
  display:flex; align-items:center; gap:var(--sp-12);
  padding:var(--sp-12) var(--sp-16);
  background:var(--indigo-50); border:1px solid var(--indigo-100);
  border-radius:var(--radius); font-size:13.5px; color:var(--indigo-700); font-weight:500;
}
.gen-success { background:var(--success-bg); border-color:rgba(15,145,97,.2); color:var(--success); }
.gen-error { background:var(--danger-bg); border-color:rgba(214,59,80,.2); color:var(--danger); }

/* ─── SCROLLBAR ─── */
* { scrollbar-width:thin; scrollbar-color:var(--gray-200) transparent; }
::-webkit-scrollbar { width:6px; height:6px; }
::-webkit-scrollbar-thumb { background:var(--gray-200); border-radius:3px; }
::-webkit-scrollbar-thumb:hover { background:var(--gray-300); }

/* ─── RESPONSIVE ─── */
@media (max-width:900px) {
  :root { --sidebar-w: 60px; }
  .sidebar-brand-text, .sidebar-brand-sub, .nav-item span,
  .nav-section-label, .user-name, .user-role { display:none; }
  .sidebar-brand { justify-content:center; padding:var(--sp-16); }
  .nav-item { justify-content:center; padding:12px; margin:2px 4px; }
  .nav-item.active::before { display:none; }
  .user-card { justify-content:center; }
  .btn-logout { margin:0; }
  .sidebar-footer { padding:8px 4px; }
  .main-content { padding:var(--sp-20) var(--sp-16); }
}
@media (max-width:600px) {
  .stats-grid { grid-template-columns:repeat(2,1fr); }
  .page-header { flex-direction:column; }
  .main-content { padding:var(--sp-16) var(--sp-12); }
}

/* ═══════════════════════════════════════════════
   CLASS ALERT ACTIONS (teacher timetable)
   ═══════════════════════════════════════════════ */
.tt-actions {
  display: flex;
  gap: 3px;
  margin-top: 5px;
  opacity: 0;
  transition: opacity .18s;
}
.tt-block:hover .tt-actions { opacity: 1; }
.tt-action-btn {
  background: rgba(255,255,255,.22);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  padding: 3px 5px;
  transition: background .15s, transform .12s;
}
.tt-action-btn:hover { background: rgba(255,255,255,.45); transform: scale(1.15); }
.tt-action-btn.cancel-btn:hover { background: rgba(220,38,38,.35); }
.tt-action-btn.reschedule-btn:hover { background: rgba(37,99,235,.35); }
.tt-action-btn.ta-btn:hover { background: rgba(16,122,87,.35); }
.tt-action-btn.sub-btn:hover { background: rgba(124,58,237,.35); }

/* Alert info box shown inside modals */
.alert-info-box {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--surface-2, #f1f5f9);
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 16px;
}
.alert-info-box .alert-icon { font-size: 24px; flex-shrink: 0; }
.alert-info-box strong { font-size: 15px; }
.alert-info-box small { color: var(--text-3, #64748b); font-size: 12px; }

/* ═══════════════════════════════════════════════
   NOTIFICATION CARDS — class-alert variants
   ═══════════════════════════════════════════════ */
.notif-card.type-cancelled  { border-left: 4px solid #ef4444; }
.notif-card.type-rescheduled{ border-left: 4px solid #3b82f6; }
.notif-card.type-ta         { border-left: 4px solid #10b981; }

.notif-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  margin-right: 6px;
}
.ntb-cancelled   { background:#fee2e2; color:#b91c1c; }
.ntb-rescheduled { background:#dbeafe; color:#1d4ed8; }
.ntb-ta          { background:#d1fae5; color:#065f46; }

/* ═══════════════════════════════════════════════
   DARK MODE
   ═══════════════════════════════════════════════ */
:root {
  --bg-primary:    #ffffff;
  --bg-secondary:  #f8f9fa;
  --bg-tertiary:   #f1f3f5;
  --text-primary:  #111827;
  --text-secondary:#4b5563;
  --text-muted:    #9ca3af;
  --border-color:  #e5e7eb;
  --card-bg:       #ffffff;
  --sidebar-bg:    #1e1b4b;
  --shadow-sm: 0 1px 3px rgba(0,0,0,.08);
}

[data-theme="dark"] {
  --bg-primary:    #0f172a;
  --bg-secondary:  #1e293b;
  --bg-tertiary:   #162032;
  --text-primary:  #f1f5f9;
  --text-secondary:#94a3b8;
  --text-muted:    #64748b;
  --border-color:  #334155;
  --card-bg:       #1e293b;
  --sidebar-bg:    #0f172a;
  --shadow-sm: 0 1px 3px rgba(0,0,0,.3);
}

[data-theme="dark"] body       { background: var(--bg-tertiary); color: var(--text-primary); }
[data-theme="dark"] .sidebar   { background: var(--sidebar-bg); border-right: 1px solid var(--border-color); }
[data-theme="dark"] .card      { background: var(--card-bg); border-color: var(--border-color); box-shadow: var(--shadow-sm); }
[data-theme="dark"] .stat-card { background: var(--card-bg); border-color: var(--border-color); }
[data-theme="dark"] .form-control { background: var(--bg-secondary); border-color: var(--border-color); color: var(--text-primary); }
[data-theme="dark"] .btn-outline  { border-color: var(--border-color); color: var(--text-primary); }
[data-theme="dark"] .btn-outline:hover { background: var(--bg-secondary); }
[data-theme="dark"] .timetable-grid    { background: var(--card-bg); }
[data-theme="dark"] .tt-header         { background: var(--bg-secondary); border-color: var(--border-color); color: var(--text-secondary); }
[data-theme="dark"] .tt-cell           { border-color: var(--border-color); background: var(--card-bg); }
[data-theme="dark"] .tt-day-label      { background: var(--bg-secondary); color: var(--text-secondary); border-color: var(--border-color); }
[data-theme="dark"] .modal             { background: var(--card-bg); border-color: var(--border-color); }
[data-theme="dark"] .modal-header      { border-color: var(--border-color); }
[data-theme="dark"] .modal-footer      { border-color: var(--border-color); }
[data-theme="dark"] .tab-bar           { border-color: var(--border-color); }
[data-theme="dark"] .tab-btn           { color: var(--text-muted); }
[data-theme="dark"] .tab-btn.active    { color: var(--indigo-400,#818cf8); border-color: var(--indigo-400,#818cf8); }
[data-theme="dark"] table th           { background: var(--bg-secondary); color: var(--text-secondary); border-color: var(--border-color); }
[data-theme="dark"] table td           { border-color: var(--border-color); color: var(--text-primary); }
[data-theme="dark"] table tr:hover td  { background: var(--bg-secondary); }
[data-theme="dark"] .gray-100, [data-theme="dark"] .stats-grid .stat-card { background: var(--bg-secondary); }
[data-theme="dark"] .conflict-item     { background: var(--bg-secondary); border-color: var(--border-color); }
[data-theme="dark"] select option      { background: var(--bg-secondary); color: var(--text-primary); }
[data-theme="dark"] .lunch-slot        { background: repeating-linear-gradient(45deg, var(--bg-secondary), var(--bg-secondary) 4px, var(--bg-tertiary) 4px, var(--bg-tertiary) 8px); }

/* Dark mode toggle button in sidebar */
.sidebar-dark-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  margin: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
  font-size: .82rem;
  color: rgba(255,255,255,.65);
  border: none;
  background: none;
  width: calc(100% - 16px);
  text-align: left;
  transition: background .15s;
}
.sidebar-dark-toggle:hover { background: rgba(255,255,255,.08); color: rgba(255,255,255,.9); }

/* ═══════════════════════════════════════════════
   DRAG & DROP STATES
   ═══════════════════════════════════════════════ */
.tt-block[draggable="true"] { cursor: grab; }
.tt-block[draggable="true"]:active { cursor: grabbing; }

.tt-cell.drag-over {
  background: rgba(99,102,241,.12) !important;
  outline: 2px dashed #6366f1;
  outline-offset: -2px;
}
.tt-cell.drag-invalid {
  background: rgba(239,68,68,.08) !important;
  outline: 2px dashed #ef4444;
  outline-offset: -2px;
}

/* ═══════════════════════════════════════════════
   VERSION HISTORY & DIFF
   ═══════════════════════════════════════════════ */
.versions-list { display: flex; flex-direction: column; gap: 6px; margin-top: var(--sp-sm); }

.version-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border: 0.5px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  background: var(--bg-secondary, #f8f9fa);
  gap: var(--sp-sm);
}
[data-theme="dark"] .version-row { background: var(--bg-tertiary); border-color: var(--border-color); }

.btn-xs {
  padding: 3px 10px;
  font-size: .75rem;
  border-radius: 5px;
}

.diff-banner {
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: var(--sp-sm);
  font-size: .85rem;
  background: var(--bg-secondary, #f8f9fa);
  border: 0.5px solid var(--border-color, #e5e7eb);
}
.diff-banner.diff-same { color: var(--success, #10b981); background: #f0fdf4; border-color: #bbf7d0; }
[data-theme="dark"] .diff-banner.diff-same { background: rgba(16,185,129,.1); border-color: rgba(16,185,129,.3); }

.diff-badge {
  display: inline-block;
  font-size: .75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  margin-right: 6px;
}
.diff-added-badge   { background: #dcfce7; color: #15803d; }
.diff-removed-badge { background: #fee2e2; color: #b91c1c; }
.diff-changed-badge { background: #dbeafe; color: #1d4ed8; }

[data-theme="dark"] .diff-added-badge   { background: rgba(21,128,61,.2);  color: #4ade80; }
[data-theme="dark"] .diff-removed-badge { background: rgba(185,28,28,.2);  color: #f87171; }
[data-theme="dark"] .diff-changed-badge { background: rgba(29,78,216,.2);  color: #93c5fd; }

.diff-table { width: 100%; border-collapse: collapse; font-size: .82rem; }
.diff-table th { padding: 6px 10px; text-align: left; background: var(--bg-secondary,#f8f9fa); border-bottom: 1px solid var(--border-color,#e5e7eb); font-weight: 600; }
.diff-table td { padding: 6px 10px; border-bottom: 0.5px solid var(--border-color,#e5e7eb); }
.diff-table tr.diff-added   td { background: rgba(21,128,61,.06); }
.diff-table tr.diff-removed td { background: rgba(185,28,28,.06); }
.diff-table tr.diff-changed td { background: rgba(29,78,216,.06); }

/* ═══════════════════════════════════════════════
   PRINT STYLES
   ═══════════════════════════════════════════════ */
@media print {
  .sidebar, .page-header .btn-group, .tab-bar,
  #toastContainer, .modal-overlay,
  button, .btn, select { display: none !important; }

  body { background: white !important; color: black !important; }
  .main-content { margin: 0 !important; padding: 0 !important; }
  .card { box-shadow: none !important; border: 1px solid #ddd !important; page-break-inside: avoid; }
  .timetable-wrapper { overflow: visible !important; }
  .timetable-grid { font-size: 9px !important; }
  .tt-block { padding: 2px 4px !important; }
  .page { display: block !important; }
  .page:not(.active) { display: none !important; }
}

/* ═══════════════════════════════════════════════
   AI ASSISTANT PANEL
   ═══════════════════════════════════════════════ */

.ai-assistant-panel {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Tab bar */
.ai-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: var(--sp-md);
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 0;
}

.ai-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  font-size: .82rem;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: var(--radius) var(--radius) 0 0;
  transition: color .15s, border-color .15s, background .15s;
}
.ai-tab:hover {
  color: var(--text-primary);
  background: var(--bg-secondary);
}
.ai-tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  font-weight: 600;
}

/* Tab contents */
.ai-tab-content { display: none; }
.ai-tab-content.active { display: block; }

.ai-description {
  font-size: .82rem;
  color: var(--text-muted);
  margin: 0 0 var(--sp-md);
  line-height: 1.5;
}

/* Run button */
.ai-run-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: var(--sp-md);
}

/* Output box */
.ai-output {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: var(--sp-md);
  font-size: .83rem;
  line-height: 1.65;
  color: var(--text-primary);
  min-height: 48px;
  white-space: normal;
  word-break: break-word;
}
.ai-output:empty { display: none; }

/* Loading spinner */
.ai-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-muted);
  font-size: .83rem;
}
.ai-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-color);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: aiSpin .7s linear infinite;
  flex-shrink: 0;
}
@keyframes aiSpin { to { transform: rotate(360deg); } }

/* Chat window */
.ai-chat-window {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: var(--sp-sm) var(--sp-md);
  min-height: 160px;
  max-height: 320px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
  scroll-behavior: smooth;
}

.ai-chat-bubble {
  max-width: 90%;
  padding: 8px 12px;
  border-radius: 14px;
  font-size: .82rem;
  line-height: 1.55;
  word-break: break-word;
}
.ai-chat-bubble.user {
  align-self: flex-end;
  background: var(--primary);
  color: #fff;
  border-bottom-right-radius: 4px;
}
.ai-chat-bubble.assistant {
  align-self: flex-start;
  background: var(--bg-primary, #fff);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-bottom-left-radius: 4px;
}
.ai-chat-bubble.loading {
  color: var(--text-muted);
  font-style: italic;
}

/* Chat input row */
.ai-chat-input-row {
  display: flex;
  gap: 8px;
}
.ai-chat-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  font-size: .84rem;
  background: var(--bg-primary, #fff);
  color: var(--text-primary);
  outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.ai-chat-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(98,100,167,.15);
}

/* Dark mode adjustments */
[data-theme="dark"] .ai-output,
[data-theme="dark"] .ai-chat-window {
  background: var(--bg-tertiary, #1e1e2e);
}
[data-theme="dark"] .ai-chat-bubble.assistant {
  background: var(--bg-secondary);
}
[data-theme="dark"] .ai-chat-input {
  background: var(--bg-secondary);
}

/* ================================================================
   ✨ HARRY POTTER THEME — ScheduleAI Wizarding Edition
   ================================================================ */

/* HP Fonts */
@import url('https://fonts.googleapis.com/css2?family=MedievalSharp&family=IM+Fell+English:ital@0;1&family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@700&display=swap');

:root {
  /* Hogwarts House Colors */
  --hp-gold:       #c9a84c;
  --hp-gold-light: #f0d080;
  --hp-gold-dim:   #8a6d20;
  --hp-crimson:    #740001;
  --hp-navy:       #0e1a40;
  --hp-parchment:  #f5e9c8;
  --hp-parchment2: #e8d5a3;
  --hp-ink:        #1a0a00;
  --hp-smoke:      rgba(200,168,70,.12);
  --hp-glow:       0 0 20px rgba(201,168,76,.35), 0 0 40px rgba(201,168,76,.15);
  --hp-font-display: 'Cinzel Decorative', 'Cinzel', serif;
  --hp-font-body:    'IM Fell English', 'Georgia', serif;
  --hp-font-ui:      'Cinzel', serif;
}

/* ── Sidebar HP makeover ── */
.sidebar {
  background: linear-gradient(180deg, #0a0e1f 0%, #12183a 40%, #0e0b1f 100%) !important;
  border-right: 1px solid rgba(201,168,76,.25) !important;
  box-shadow: 4px 0 32px rgba(0,0,0,.6), inset -1px 0 0 rgba(201,168,76,.1) !important;
  position: relative;
}
.sidebar::before {
  content: '';
  position: absolute; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    radial-gradient(ellipse 80% 30% at 50% 0%, rgba(201,168,76,.08) 0%, transparent 70%),
    radial-gradient(ellipse 60% 20% at 50% 100%, rgba(116,0,1,.12) 0%, transparent 70%);
}
.sidebar > * { position: relative; z-index: 1; }

.sidebar-brand {
  border-bottom: 1px solid rgba(201,168,76,.2) !important;
  padding: 18px 16px !important;
}
.sidebar-brand-icon {
  background: linear-gradient(135deg, #740001, #a00002) !important;
  border: 1.5px solid rgba(201,168,76,.4) !important;
  box-shadow: 0 4px 16px rgba(116,0,1,.5), 0 0 8px rgba(201,168,76,.2) !important;
  border-radius: 10px !important;
}
.sidebar-brand-name {
  font-family: var(--hp-font-ui) !important;
  font-size: 12px !important;
  letter-spacing: .06em !important;
  color: var(--hp-gold-light) !important;
}
.sidebar-brand-sub {
  font-family: 'IM Fell English', serif !important;
  font-style: italic;
  color: rgba(201,168,76,.5) !important;
  font-size: 10px !important;
}

.nav-section-label {
  font-family: var(--hp-font-ui) !important;
  font-size: 9px !important;
  letter-spacing: .15em !important;
  color: rgba(201,168,76,.35) !important;
}
.nav-item {
  font-family: var(--hp-font-ui) !important;
  font-size: 12px !important;
  letter-spacing: .03em !important;
  color: rgba(220,210,190,.75) !important;
  border-radius: 6px !important;
  transition: all .2s ease !important;
}
.nav-item:hover {
  background: rgba(201,168,76,.08) !important;
  color: var(--hp-gold-light) !important;
  text-shadow: 0 0 12px rgba(201,168,76,.4);
}
.nav-item.active {
  background: linear-gradient(90deg, rgba(116,0,1,.4), rgba(116,0,1,.15)) !important;
  color: var(--hp-gold-light) !important;
  font-weight: 600 !important;
  border-left: 2px solid var(--hp-gold);
  text-shadow: 0 0 12px rgba(201,168,76,.3);
}
.nav-item.active::before {
  background: var(--hp-gold) !important;
  box-shadow: 0 0 8px rgba(201,168,76,.6);
}

.user-name {
  font-family: var(--hp-font-ui) !important;
  font-size: 11.5px !important;
  color: var(--hp-gold-light) !important;
}
.user-role {
  font-family: 'IM Fell English', serif !important;
  font-style: italic;
  color: rgba(201,168,76,.45) !important;
}
.sidebar-footer {
  border-top: 1px solid rgba(201,168,76,.15) !important;
}

/* ── Page headers / cards HP style ── */
.page-header h1, .page-title, .card-title, h1, h2 {
  font-family: var(--hp-font-ui) !important;
  letter-spacing: .03em;
}

/* ── Loading Overlay — Magical Spell Cast ── */
.loading-overlay {
  position: fixed !important;
  inset: 0 !important;
  background: radial-gradient(ellipse at center, #0a0e28 0%, #05070f 100%) !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 9999 !important;
  gap: 0 !important;
}
.loading-overlay {
  transition: opacity 0.35s ease, visibility 0.35s ease !important;
}
.loading-overlay.hidden {
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

/* Replace boring spinner with magical wand + stars */
.spinner {
  width: 60px !important;
  height: 60px !important;
  border: none !important;
  background: none !important;
  animation: none !important;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.spinner::before {
  content: '⚡';
  font-size: 42px;
  animation: boltPulse 1.4s ease-in-out infinite;
  filter: drop-shadow(0 0 16px #c9a84c) drop-shadow(0 0 32px rgba(201,168,76,.6));
  display: block;
}
@keyframes boltPulse {
  0%, 100% { transform: scale(1) rotate(-5deg); opacity: 1; filter: drop-shadow(0 0 12px #c9a84c); }
  30%       { transform: scale(1.25) rotate(5deg); opacity: .8; filter: drop-shadow(0 0 28px #f0d080) drop-shadow(0 0 48px #c9a84c); }
  60%       { transform: scale(.9) rotate(-3deg); opacity: .95; }
}

/* Orbiting stars around spinner */
.spinner::after {
  content: '✦ ✧ ✦ ✧ ✦';
  position: absolute;
  top: 50%; left: 50%;
  width: 120px; height: 120px;
  margin: -60px 0 0 -60px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px;
  color: var(--hp-gold);
  letter-spacing: 16px;
  animation: orbitSpin 3s linear infinite;
  opacity: .6;
}
@keyframes orbitSpin { to { transform: rotate(360deg); } }

.loading-text {
  font-family: var(--hp-font-ui) !important;
  color: var(--hp-gold) !important;
  font-size: 13px !important;
  letter-spacing: .12em !important;
  margin-top: 24px !important;
  text-shadow: 0 0 20px rgba(201,168,76,.6) !important;
  animation: textShimmer 2s ease-in-out infinite !important;
  text-align: center !important;
  max-width: 340px !important;
  line-height: 1.7 !important;
}
.loading-text small {
  display: block;
  font-size: 11px;
  opacity: .8;
  letter-spacing: .05em;
  margin-top: 6px;
}
.loading-text code {
  background: rgba(201,168,76,.15);
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 10px;
}
@keyframes textShimmer {
  0%, 100% { opacity: .7; }
  50%       { opacity: 1; text-shadow: 0 0 30px rgba(201,168,76,.9); }
}

/* Floating stars behind loading screen */
.loading-overlay::before {
  content: '';
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    radial-gradient(1.5px 1.5px at 15% 20%, rgba(201,168,76,.8) 0%, transparent 100%),
    radial-gradient(1px 1px   at 35% 55%, rgba(255,255,255,.5) 0%, transparent 100%),
    radial-gradient(2px 2px   at 60% 15%, rgba(201,168,76,.6) 0%, transparent 100%),
    radial-gradient(1px 1px   at 80% 40%, rgba(255,255,255,.4) 0%, transparent 100%),
    radial-gradient(1.5px 1.5px at 25% 75%, rgba(201,168,76,.7) 0%, transparent 100%),
    radial-gradient(1px 1px   at 70% 80%, rgba(255,255,255,.5) 0%, transparent 100%),
    radial-gradient(2px 2px   at 90% 10%, rgba(201,168,76,.5) 0%, transparent 100%),
    radial-gradient(1px 1px   at 48% 90%, rgba(255,255,255,.4) 0%, transparent 100%);
  animation: starsTwinkle 4s ease-in-out infinite alternate;
}
@keyframes starsTwinkle {
  from { opacity: .4; }
  to   { opacity: 1; }
}

/* Hogwarts crest above the spinner */
.loading-overlay::after {
  content: '⚜';
  position: absolute;
  top: calc(50% - 90px);
  left: 50%;
  transform: translateX(-50%);
  font-size: 28px;
  color: var(--hp-gold);
  opacity: .3;
  text-shadow: 0 0 20px rgba(201,168,76,.5);
  animation: crestGlow 3s ease-in-out infinite;
}
@keyframes crestGlow {
  0%, 100% { opacity: .2; transform: translateX(-50%) scale(1); }
  50%       { opacity: .5; transform: translateX(-50%) scale(1.05); }
}

/* ── Card / Surface HP styling ── */
.card {
  border-color: rgba(201,168,76,.15) !important;
  background: rgba(255,252,245,.98) !important;
}

/* ── Toast HP ── */
.toast {
  font-family: var(--hp-font-ui) !important;
  font-size: 12px !important;
  letter-spacing: .03em !important;
}

/* ── Timetable block headers ── */
.tt-subject {
  font-family: var(--hp-font-ui) !important;
  font-size: 11px !important;
  letter-spacing: .03em !important;
}

/* ── House badge easter eggs — show on hover of avatar ── */
.user-avatar {
  border: 1.5px solid rgba(201,168,76,.3) !important;
  box-shadow: 0 0 8px rgba(201,168,76,.2) !important;
}

/* ── Scrollbar ── */
.sidebar::-webkit-scrollbar-thumb {
  background: rgba(201,168,76,.2) !important;
}

/* ── Dark mode stays dark & magical ── */
[data-theme="dark"] .card { background: rgba(15,13,28,.95) !important; border-color: rgba(201,168,76,.12) !important; }

/* ── Magical sparkle cursor trail (CSS-only shimmer on interactive elements) ── */
.btn-primary, .btn-login {
  background: linear-gradient(135deg, #740001, #9a0002) !important;
  border: 1px solid rgba(201,168,76,.35) !important;
  font-family: var(--hp-font-ui) !important;
  letter-spacing: .06em !important;
  font-size: 12px !important;
  box-shadow: 0 2px 12px rgba(116,0,1,.4), 0 0 0 0 rgba(201,168,76,0) !important;
  transition: all .25s ease !important;
  position: relative; overflow: hidden;
}
.btn-primary::after, .btn-login::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(105deg, transparent 30%, rgba(201,168,76,.15) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform .5s ease;
}
.btn-primary:hover::after, .btn-login:hover::after { transform: translateX(100%); }
.btn-primary:hover, .btn-login:hover {
  background: linear-gradient(135deg, #900002, #be0003) !important;
  box-shadow: 0 4px 20px rgba(116,0,1,.55), 0 0 12px rgba(201,168,76,.2) !important;
}

/* ── Smooth page transitions ── */
.page { opacity: 0; transform: translateY(8px); transition: opacity 0.22s ease, transform 0.22s ease; }
.page.active { opacity: 1; transform: none; }


/* ── Extra UI smoothness fixes (patch) ── */
.nav-item { transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease !important; }
.stat-card { transition: transform 0.18s ease, box-shadow 0.18s ease !important; }
.stat-card:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(0,0,0,.25) !important; }
.btn, .btn-outline, .btn-primary { transition: all 0.18s ease !important; }
.card { transition: box-shadow 0.2s ease !important; }
.tt-block { transition: transform 0.15s ease, box-shadow 0.15s ease !important; }
.tt-block:hover { transform: scale(1.02) !important; box-shadow: 0 4px 16px rgba(0,0,0,.3) !important; z-index: 2; position: relative; }
