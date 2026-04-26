/* ==================================================
   API.JS — Shared API client + MySQL sync layer
   Offline-first: falls back to localStorage when
   server is not running (no more infinite loading).
   ================================================== */

const API = (() => {
  const BASE = '';
  let _offlineMode = false;

  /* ---- Auth helpers ---- */
  function getToken() { return localStorage.getItem('auth_token'); }
  function setToken(t) { localStorage.setItem('auth_token', t); }
  function clearToken() { localStorage.removeItem('auth_token'); localStorage.removeItem('auth_user'); }
  function getUser() { try { return JSON.parse(localStorage.getItem('auth_user')); } catch { return null; } }
  function setUser(u) { localStorage.setItem('auth_user', JSON.stringify(u)); }
  function isOffline() { return _offlineMode; }

  /* ---- Mock users for offline mode ---- */
  const MOCK_USERS = {
    'admin':     { id:'u1', username:'admin',     name:'Albus Dumbledore', role:'admin',   section_ids:[] },
    'teacher1':  { id:'u2', username:'teacher1',  name:'Minerva McGonagall', role:'teacher', section_ids:[] },
    'teacher2':  { id:'u3', username:'teacher2',  name:'Severus Snape',    role:'teacher', section_ids:[] },
    'student_a': { id:'u4', username:'student_a', name:'Harry Potter',     role:'student', section_ids:[] },
    'student_b': { id:'u5', username:'student_b', name:'Hermione Granger', role:'student', section_ids:[] },
  };
  const MOCK_PASSWORDS = {
    'admin':'admin123','teacher1':'teacher123','teacher2':'teacher123',
    'student_a':'student123','student_b':'student123',
  };

  /* ---- HTTP request with 6s timeout ---- */
  async function request(method, url, body, timeoutMs = 6000) {
    if (_offlineMode) throw new Error('offline');
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    const token = getToken();
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    if (body !== undefined) opts.body = JSON.stringify(body);

    const controller = new AbortController();
    opts.signal = controller.signal;
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let res;
    try {
      res = await fetch(BASE + url, opts);
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError' || err.name === 'TypeError') {
        _offlineMode = true;
        throw new Error('SERVER_OFFLINE');
      }
      throw err;
    }
    clearTimeout(timer);

    if (res.status === 401) {
      clearToken();
      window.location.href = 'login.html';
      throw new Error('Session expired');
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'Request failed');
    }
    return res.json();
  }

  return {
    get:  (url)       => request('GET', url),
    post: (url, body) => request('POST', url, body),
    put:  (url, body) => request('PUT', url, body),
    del:  (url)       => request('DELETE', url),
    getToken, setToken, clearToken, getUser, setUser, isOffline,

    /* Login — tries server first, falls back to mock */
    async login(username, password) {
      try {
        const data = await request('POST', '/api/auth/login', { username, password });
        _offlineMode = false;
        setToken(data.token);
        setUser(data.user);
        return data.user;
      } catch(e) {
        if (e.message === 'SERVER_OFFLINE') {
          // Offline fallback
          const mockUser = MOCK_USERS[username];
          const mockPass = MOCK_PASSWORDS[username];
          if (mockUser && mockPass === password) {
            _offlineMode = true;
            setToken('offline-token-' + Date.now());
            setUser(mockUser);
            return mockUser;
          }
          throw new Error('Invalid credentials (server offline — use default credentials shown below)');
        }
        throw e;
      }
    },

    /* me() — tries server, falls back to cached localStorage user */
    async me() {
      if (_offlineMode) {
        const u = getUser();
        if (u) return u;
        throw new Error('Not logged in');
      }
      try {
        return await request('GET', '/api/auth/me');
      } catch(e) {
        if (e.message === 'SERVER_OFFLINE') {
          _offlineMode = true;
          const u = getUser();
          if (u) return u;
          throw new Error('Not logged in');
        }
        throw e;
      }
    },

    /* pullAll — tries server, silently ignores if offline (uses existing localStorage) */
    async pullAll() {
      if (_offlineMode) return;
      try {
        const data = await request('GET', '/api/data/all');
        localStorage.setItem('tt_courses',   JSON.stringify(data.courses   || []));
        localStorage.setItem('tt_sections',  JSON.stringify(data.sections  || []));
        localStorage.setItem('tt_faculty',   JSON.stringify(data.faculty   || []));
        localStorage.setItem('tt_rooms',     JSON.stringify(data.rooms     || []));
        localStorage.setItem('tt_combined',  JSON.stringify(data.combined  || []));
        localStorage.setItem('tt_labTypes',  JSON.stringify(data.labTypes  || []));
        localStorage.setItem('tt_settings',  JSON.stringify(data.settings  || {}));
        localStorage.setItem('tt_timetable', JSON.stringify(data.timetable || null));
        localStorage.setItem('tt_locks',     JSON.stringify(data.locks     || []));
        localStorage.setItem('tt_conflicts', JSON.stringify(data.conflicts || []));
        return data;
      } catch(e) {
        if (e.message === 'SERVER_OFFLINE') { _offlineMode = true; return; }
        throw e;
      }
    },

    async pushAll() {
      if (_offlineMode) return;
      return request('POST', '/api/data/all', {
        courses:   JSON.parse(localStorage.getItem('tt_courses')   || '[]'),
        sections:  JSON.parse(localStorage.getItem('tt_sections')  || '[]'),
        faculty:   JSON.parse(localStorage.getItem('tt_faculty')   || '[]'),
        rooms:     JSON.parse(localStorage.getItem('tt_rooms')     || '[]'),
        combined:  JSON.parse(localStorage.getItem('tt_combined')  || '[]'),
        labTypes:  JSON.parse(localStorage.getItem('tt_labTypes')  || '[]'),
        settings:  JSON.parse(localStorage.getItem('tt_settings')  || '{}'),
        timetable: JSON.parse(localStorage.getItem('tt_timetable') || 'null'),
        locks:     JSON.parse(localStorage.getItem('tt_locks')     || '[]'),
      });
    },

    /* Notifications — returns empty array when offline */
    async getNotifications() {
      if (_offlineMode) return [];
      try { return await request('GET', '/api/notifications'); }
      catch(e) { if(e.message==='SERVER_OFFLINE'){_offlineMode=true;return[];} throw e; }
    },
    sendNotification(data) {
      if (_offlineMode) return Promise.resolve({});
      return request('POST', '/api/notifications', data);
    },
    deleteNotification(id) {
      if (_offlineMode) return Promise.resolve({});
      return request('DELETE', `/api/notifications/${id}`);
    },
    getSections() {
      if (_offlineMode) return Promise.resolve(JSON.parse(localStorage.getItem('tt_sections')||'[]'));
      return request('GET', '/api/sections/list');
    },
    sendClassAlert(data) {
      if (_offlineMode) return Promise.resolve({});
      return request('POST', '/api/class-alerts', data);
    },
  };
})();
